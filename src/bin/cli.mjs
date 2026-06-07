#!/usr/bin/env node
/**
 * warnyin-agents installer
 * ติดตั้ง Warnyin Standard Workflow ลงโปรเจกต์ปัจจุบัน (cwd)
 *
 *   npx @warnyin/agents             ติดตั้ง (ข้ามไฟล์ที่มีอยู่แล้ว)
 *   npx @warnyin/agents --update    อัปเดต playbook กลาง (เขียนทับเฉพาะไฟล์ core)
 *   npx @warnyin/agents --dry-run   แสดงว่าจะทำอะไร โดยไม่เขียนไฟล์จริง
 *   (ทางสำรองไม่ผ่าน npm: npx github:warnyin/warnyin-agents)
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
  npx @warnyin/agents             ติดตั้ง (ข้ามไฟล์ที่มีอยู่แล้ว ไม่เขียนทับ)
  npx @warnyin/agents --update    อัปเดต playbook กลางเป็นเวอร์ชันล่าสุด
                                  (เขียนทับเฉพาะ .warnyin/workflow/, .claude/commands/warnyin/,
                                   template .warnyin/template/stages/[topic] — ไม่แตะ docs/ และงานจริง)
  npx @warnyin/agents --dry-run   แสดงรายการไฟล์ที่จะสร้าง/อัปเดต โดยไม่เขียนจริง

หลังติดตั้ง: เปิด Claude Code ในโปรเจกต์ แล้วรัน /warnyin:init ให้ agent วิเคราะห์โปรเจกต์ + เติม docs/`)
  process.exit(0)
}

// guard กัน self-install — เก็บไว้แบบ defensive (zero-cost)
// หลังย้าย source เข้า src/ → pkgRoot = src/ (sibling ของ bin/) จึงแทบไม่มีทาง === target (repo root / temp sandbox)
// → guard นี้เป็น no-op โดยตั้งใจในเคสปกติ/sandbox; ยังคงดักได้เฉพาะ edge case ที่ install ลงโฟลเดอร์ที่เป็น src/ เอง
if (path.resolve(pkgRoot) === path.resolve(target)) {
  console.error('✖ กำลังรันอยู่ใน repo ของ warnyin-agents เอง — ให้ cd ไปที่โปรเจกต์ปลายทางก่อน')
  process.exit(1)
}

// โครงเก่า (≤0.2.x): workflow/ + warnyin-stages/ ที่ root — เตือนให้ย้ายเอง ไม่แตะงานจริงของ user
const legacyV2 = ['workflow', 'warnyin-stages'].filter((d) => fs.existsSync(path.join(target, d)))
if (legacyV2.length) {
  console.warn(`⚠ พบโครงเลย์เอาต์เก่า (≤0.2.x): ${legacyV2.join(', ')}
เวอร์ชันนี้ย้าย core ไปใต้ .warnyin/ และงานจริงไป docs/stages/ — แนะนำย้ายด้วยตัวเองก่อน:
  1. mkdir -p docs/stages && git mv warnyin-stages/* docs/stages/   # งานจริงของคุณ (ปลอดภัย ไม่ถูกแตะโดย installer)
  2. rm -rf workflow warnyin-stages                # core เก่า + โฟลเดอร์ที่ย้ายของออกแล้ว
แล้วรันคำสั่งนี้อีกครั้ง\n`)
}

// โครงเก่า (0.3–0.5.x): ทุกอย่างอยู่ใต้ warnyin/ ที่ root — เวอร์ชันนี้แยกเป็น .warnyin/ (core) + docs/stages (งานจริง)
const legacyV5 = ['workflow', 'template', 'installer', 'stages'].filter((d) =>
  fs.existsSync(path.join(target, 'warnyin', d)),
)
if (legacyV5.length) {
  console.warn(`⚠ พบโครงเลย์เอาต์เก่า (0.3–0.5.x): warnyin/{${legacyV5.join(', ')}}
เวอร์ชันนี้ย้าย core ไป .warnyin/ และงานจริงไป docs/stages/ — แนะนำย้ายด้วยตัวเองก่อน:
  1. mkdir -p docs/stages && git mv warnyin/stages/* docs/stages/   # งานจริงของคุณ (active + achieved) — ปลอดภัย ไม่ถูกแตะ
  2. rm -rf warnyin                                # core เก่าทั้งหมด (เวอร์ชันใหม่ installer จะวางที่ .warnyin/)
แล้วรันคำสั่งนี้อีกครั้ง — installer จะวาง .warnyin/ ชุดใหม่ให้\n`)
}

// core = playbook กลาง + command + agent + template — เขียนทับได้เมื่อ --update
const CORE = [
  path.join('.warnyin', 'workflow'),
  path.join('.warnyin', 'template'),
  path.join('.claude', 'commands', 'warnyin'),
  path.join('.claude', 'agents'),
]
// scaffold = พื้นที่ทำงานเปล่าของโปรเจกต์ — installer "สร้างเอง" ไม่ copy tree จาก package
// (สำคัญ: ถ้า copy docs/stages จาก pkgRoot งานจริงของ repo ต้นทางจะรั่วไป target ทุกครั้ง — ดู verify installer-test-ci)
const SCAFFOLD_FILES = [
  path.join('docs', 'stages', 'context.md'), // บริบทงานที่จดไว้ (next/discovery/explore อ่าน "ถ้ามี")
  path.join('docs', 'stages', 'achieved', '.gitkeep'), // ให้ git track โฟลเดอร์ archive เปล่า
]

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

/** สร้างโครง scaffold เปล่าของ docs/stages เอง (ไม่ copy จาก package — กันงานจริงของ repo ต้นทางรั่วไป target) — ไม่ทับไฟล์ที่มีอยู่ */
function ensureScaffold() {
  for (const rel of SCAFFOLD_FILES) {
    const dest = path.join(target, rel)
    if (fs.existsSync(dest)) {
      stats.skipped++
      continue
    }
    if (!DRY) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, '')
    }
    stats.created++
    console.log(`  + ${rel}`)
  }
}

/** seed docs/ ของโปรเจกต์จาก .warnyin/template/docs — ข้ามโฟลเดอร์ template `[...]` (ไว้ให้ /warnyin:init copy เป็นชื่อจริง) และไม่ทับไฟล์ที่มีอยู่ */
const TEMPLATE_DOCS = path.join('.warnyin', 'template', 'docs')
function seedDocs(relDir = TEMPLATE_DOCS) {
  const srcDir = path.join(pkgRoot, relDir)
  if (!fs.existsSync(srcDir)) return
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name.startsWith('[')) continue
    const rel = path.join(relDir, entry.name)
    if (entry.isDirectory()) {
      seedDocs(rel)
      continue
    }
    const destRel = path.join('docs', path.relative(TEMPLATE_DOCS, rel))
    const dest = path.join(target, destRel)
    if (fs.existsSync(dest)) {
      stats.skipped++
      continue
    }
    if (!DRY) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(path.join(pkgRoot, rel), dest)
    }
    stats.created++
    console.log(`  + ${destRel}`)
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
  if (existing.includes('warnyin/workflow/stages/')) {
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
ensureScaffold()
seedDocs()
installRootDoc('CLAUDE.md', path.join(pkgRoot, '.warnyin', 'installer', 'templates', 'CLAUDE.md'))
installRootDoc('AGENTS.md', path.join(pkgRoot, 'AGENTS.md'))

console.log(`\nสรุป: สร้างใหม่ ${stats.created} · อัปเดต ${stats.updated} · ข้าม (มีอยู่แล้ว) ${stats.skipped}`)

if (!UPDATE) {
  console.log(`
ขั้นถัดไป:
  1. เปิด Claude Code ในโปรเจกต์นี้ แล้วรัน  /warnyin:init  — ให้ agent วิเคราะห์โปรเจกต์ + เติม docs/
  2. เริ่มงานแรก:  /warnyin:discovery <topic>  หรือ  /warnyin:design <slug> <change>

อัปเดต playbook ภายหลัง:  npx @warnyin/agents --update`)
}
