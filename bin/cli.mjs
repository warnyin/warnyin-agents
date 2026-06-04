#!/usr/bin/env node
/**
 * warnyin-agents installer
 * ติดตั้ง Warnyin Standard Workflow ลงโปรเจกต์ปัจจุบัน (cwd)
 *
 *   npx github:warnyin/warnyin-agents             ติดตั้ง (ข้ามไฟล์ที่มีอยู่แล้ว)
 *   npx github:warnyin/warnyin-agents --update    อัปเดต playbook กลาง (เขียนทับเฉพาะไฟล์ core)
 *   npx github:warnyin/warnyin-agents --dry-run   แสดงว่าจะทำอะไร โดยไม่เขียนไฟล์จริง
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const target = process.cwd()
const args = new Set(process.argv.slice(2))
const UPDATE = args.has('--update')
const DRY = args.has('--dry-run')

if (args.has('--help') || args.has('-h')) {
  console.log(`warnyin-agents — ติดตั้ง Warnyin Standard Workflow ลงโปรเจกต์ปัจจุบัน

ใช้งาน:
  npx github:warnyin/warnyin-agents             ติดตั้ง (ข้ามไฟล์ที่มีอยู่แล้ว ไม่เขียนทับ)
  npx github:warnyin/warnyin-agents --update    อัปเดต playbook กลางเป็นเวอร์ชันล่าสุด
                                                (เขียนทับเฉพาะ workflow/, .claude/commands/warnyin/,
                                                 template warnyin-stages/[topic] — ไม่แตะ docs/ และงานจริง)
  npx github:warnyin/warnyin-agents --dry-run   แสดงรายการไฟล์ที่จะสร้าง/อัปเดต โดยไม่เขียนจริง

หลังติดตั้ง: เปิด Claude Code ในโปรเจกต์ แล้วรัน /warnyin:init ให้ agent วิเคราะห์โปรเจกต์ + เติม docs/`)
  process.exit(0)
}

if (path.resolve(pkgRoot) === path.resolve(target)) {
  console.error('✖ กำลังรันอยู่ใน repo ของ warnyin-agents เอง — ให้ cd ไปที่โปรเจกต์ปลายทางก่อน')
  process.exit(1)
}

// core = playbook กลาง + command + template หน่วยงาน — เขียนทับได้เมื่อ --update
const CORE = [
  'workflow',
  path.join('.claude', 'commands', 'warnyin'),
  path.join('warnyin-stages', '[topic]'),
]
// scaffold = โครง docs/ + พื้นที่ทำงาน — เป็นข้อมูลของโปรเจกต์ ไม่เขียนทับเด็ดขาด
const SCAFFOLD = ['docs', 'warnyin-stages']

const stats = { created: 0, updated: 0, skipped: 0 }

function copyTree(relDir, { overwrite }) {
  const srcDir = path.join(pkgRoot, relDir)
  if (!fs.existsSync(srcDir)) return
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const rel = path.join(relDir, entry.name)
    if (entry.isDirectory()) {
      copyTree(rel, { overwrite })
      continue
    }
    const src = path.join(pkgRoot, rel)
    const dest = path.join(target, rel)
    const exists = fs.existsSync(dest)
    if (exists && !overwrite) {
      stats.skipped++
      continue
    }
    if (exists && overwrite && fs.readFileSync(src).equals(fs.readFileSync(dest))) {
      stats.skipped++
      continue
    }
    if (!DRY) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(src, dest)
    }
    stats[exists ? 'updated' : 'created']++
    console.log(`  ${exists ? '↻' : '+'} ${rel}`)
  }
}

/** CLAUDE.md / AGENTS.md: ไม่มี → สร้างจาก template; มีอยู่แล้วแต่ยังไม่มี workflow → ต่อท้ายเป็น section */
function installRootDoc(name, srcPath) {
  const dest = path.join(target, name)
  const content = fs.readFileSync(srcPath, 'utf8')
  if (!fs.existsSync(dest)) {
    if (!DRY) fs.writeFileSync(dest, content)
    stats.created++
    console.log(`  + ${name}`)
    return
  }
  const existing = fs.readFileSync(dest, 'utf8')
  if (existing.includes('workflow/stages/')) {
    stats.skipped++
    return
  }
  const section = '\n\n' + content.replace(/^#\s[^\n]*\n/, '## Warnyin Standard Workflow\n')
  if (!DRY) fs.appendFileSync(dest, section)
  stats.updated++
  console.log(`  ± ${name} (ต่อท้าย section Warnyin Standard Workflow)`)
}

console.log(`Warnyin Standard Workflow → ${target}${DRY ? '  (dry-run)' : ''}\n`)

for (const dir of CORE) copyTree(dir, { overwrite: UPDATE })
for (const dir of SCAFFOLD) copyTree(dir, { overwrite: false })
installRootDoc('CLAUDE.md', path.join(pkgRoot, 'installer', 'templates', 'CLAUDE.md'))
installRootDoc('AGENTS.md', path.join(pkgRoot, 'AGENTS.md'))

console.log(`\nสรุป: สร้างใหม่ ${stats.created} · อัปเดต ${stats.updated} · ข้าม (มีอยู่แล้ว) ${stats.skipped}`)

if (!UPDATE) {
  console.log(`
ขั้นถัดไป:
  1. เปิด Claude Code ในโปรเจกต์นี้ แล้วรัน  /warnyin:init  — ให้ agent วิเคราะห์โปรเจกต์ + เติม docs/
  2. เริ่มงานแรก:  /warnyin:discovery <topic>  หรือ  /warnyin:design <slug> <change>

อัปเดต playbook ภายหลัง:  npx github:warnyin/warnyin-agents --update`)
}
