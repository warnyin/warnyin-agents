#!/usr/bin/env node
/**
 * warnyin-agents installer
 * ติดตั้ง Warnyin Standard Workflow ลงโปรเจกต์ปัจจุบัน (cwd) หรือแบบ global (~/)
 *
 *   npx @warnyin/agents             ติดตั้งลงโปรเจกต์ (ข้ามไฟล์ที่มีอยู่แล้ว)
 *   npx @warnyin/agents --global    ติดตั้งแบบ global (~/) ใช้ได้ทุกโปรเจกต์
 *   npx @warnyin/agents --project   ติดตั้งลงโปรเจกต์ (บังคับ — ไม่ถาม)
 *   npx @warnyin/agents --update    อัปเดต playbook กลาง (เขียนทับเฉพาะไฟล์ core)
 *   npx @warnyin/agents --dry-run   แสดงว่าจะทำอะไร โดยไม่เขียนไฟล์จริง
 *   (ทางสำรองไม่ผ่าน npm: npx github:warnyin/warnyin-agents)
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cwd = process.cwd()
const args = new Set(process.argv.slice(2))
const UPDATE = args.has('--update')
const DRY = args.has('--dry-run')

/**
 * ★ pure function — เลือก mode จาก flag/TTY/answer (ไม่มี side-effect, export ให้ unit test)
 * @param {{globalFlag?:boolean, projectFlag?:boolean, isTTY?:boolean, answer?:string}} o
 * @returns {'project'|'global'}
 */
export function resolveMode({ globalFlag, projectFlag, isTTY, answer } = {}) {
  if (globalFlag && projectFlag) {
    throw new Error('--global กับ --project ใช้พร้อมกันไม่ได้ (เลือกอย่างใดอย่างหนึ่ง)')
  }
  if (globalFlag) return 'global'
  if (projectFlag) return 'project'
  if (!isTTY) return 'project' // CI-safe default — npx/pipe ไม่ค้างรอ input
  const a = (answer ?? '').trim().toLowerCase()
  return a === '2' || a === 'global' ? 'global' : 'project'
}

if (args.has('--help') || args.has('-h')) {
  console.log(`warnyin-agents — ติดตั้ง Warnyin Standard Workflow ลงโปรเจกต์ปัจจุบัน หรือแบบ global

ใช้งาน:
  npx @warnyin/agents             ติดตั้งลงโปรเจกต์ (ถ้า TTY จะถามก่อน; ข้ามไฟล์ที่มีอยู่แล้ว)
  npx @warnyin/agents --global    ติดตั้งแบบ global ลง ~/ (~/.warnyin + ~/.claude) ใช้ได้ทุกโปรเจกต์
  npx @warnyin/agents --project   ติดตั้งลงโปรเจกต์ (บังคับ ไม่ถาม)
  npx @warnyin/agents --update    อัปเดต playbook กลางเป็นเวอร์ชันล่าสุด
                                  (เขียนทับเฉพาะ .warnyin/workflow/, .claude/commands/warnyin/,
                                   template .warnyin/template/stages/[topic] — ไม่แตะ docs/ และงานจริง)
  npx @warnyin/agents --dry-run   แสดงรายการไฟล์ที่จะสร้าง/อัปเดต โดยไม่เขียนจริง

หลังติดตั้ง: เปิด Claude Code ในโปรเจกต์ แล้วรัน /warnyin:init ให้ agent วิเคราะห์โปรเจกต์ + เติม docs/`)
  process.exit(0)
}

// guard กัน self-install — เก็บไว้แบบ defensive (zero-cost)
// หลังย้าย source เข้า src/ → pkgRoot = src/ (sibling ของ bin/) จึงแทบไม่มีทาง === cwd (repo root / temp sandbox)
// → guard นี้เป็น no-op โดยตั้งใจในเคสปกติ/sandbox; ยังคงดักได้เฉพาะ edge case ที่ install ลงโฟลเดอร์ที่เป็น src/ เอง
if (path.resolve(pkgRoot) === path.resolve(cwd)) {
  console.error('✖ กำลังรันอยู่ใน repo ของ warnyin-agents เอง — ให้ cd ไปที่โปรเจกต์ปลายทางก่อน')
  process.exit(1)
}

// โครงเก่า (≤0.2.x): workflow/ + warnyin-stages/ ที่ root — เตือนให้ย้ายเอง ไม่แตะงานจริงของ user
const legacyV2 = ['workflow', 'warnyin-stages'].filter((d) => fs.existsSync(path.join(cwd, d)))
if (legacyV2.length) {
  console.warn(`⚠ พบโครงเลย์เอาต์เก่า (≤0.2.x): ${legacyV2.join(', ')}
เวอร์ชันนี้ย้าย core ไปใต้ .warnyin/ และงานจริงไป docs/stages/ — แนะนำย้ายด้วยตัวเองก่อน:
  1. mkdir -p docs/stages && git mv warnyin-stages/* docs/stages/   # งานจริงของคุณ (ปลอดภัย ไม่ถูกแตะโดย installer)
  2. rm -rf workflow warnyin-stages                # core เก่า + โฟลเดอร์ที่ย้ายของออกแล้ว
แล้วรันคำสั่งนี้อีกครั้ง\n`)
}

// โครงเก่า (0.3–0.5.x): ทุกอย่างอยู่ใต้ warnyin/ ที่ root — เวอร์ชันนี้แยกเป็น .warnyin/ (core) + docs/stages (งานจริง)
const legacyV5 = ['workflow', 'template', 'installer', 'stages'].filter((d) =>
  fs.existsSync(path.join(cwd, 'warnyin', d)),
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
  path.join('.claude', 'skills'),
]
// scaffold = พื้นที่ทำงานเปล่าของโปรเจกต์ — installer "สร้างเอง" ไม่ copy tree จาก package
// (สำคัญ: ถ้า copy docs/stages จาก pkgRoot งานจริงของ repo ต้นทางจะรั่วไป target ทุกครั้ง — ดู verify installer-test-ci)
const SCAFFOLD_FILES = [
  path.join('docs', 'stages', 'context.md'), // บริบทงานที่จดไว้ (next/discovery/explore อ่าน "ถ้ามี")
  path.join('docs', 'stages', 'achieved', '.gitkeep'), // ให้ git track โฟลเดอร์ archive เปล่า
]

const stats = { created: 0, updated: 0, skipped: 0 }

// target = ปลายทางที่จะเขียนไฟล์ — ตั้งหลัง resolve mode (project=cwd | global=homedir)
let target = cwd

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

/** อ่าน version ของ package ที่กำลังติดตั้ง — ผลลัพธ์: version string (เช่น "0.16.0") */
function readPkgVersion() {
  return JSON.parse(fs.readFileSync(path.join(pkgRoot, '..', 'package.json'), 'utf8')).version
}

/** เขียน version stamp ลง <target>/.warnyin/.warnyin-version — unconditional overwrite (ไม่ skip-if-equal)
 *  เคารพ DRY (ไม่เขียนจริงตอน dry-run แต่ log + นับ stats)
 */
function writeVersionStamp() {
  const ver = readPkgVersion()
  const rel = path.join('.warnyin', '.warnyin-version')
  const dest = path.join(target, rel)
  const exists = fs.existsSync(dest)
  if (!DRY) {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, ver + '\n') // ★ unconditional — ไม่ byte-equal skip แบบ copyTree
  }
  stats[exists ? 'updated' : 'created']++
  console.log(`  ${exists ? '↻' : '+'} ${rel}`)
}

const GLOBAL_NOTE_MARKER = '<!-- warnyin:global-note -->'

/**
 * ติดตั้ง adapter doc สำหรับ IDE — pattern เดียวกับ installGlobalNote แต่:
 * - src อ่านจาก installer/templates/<srcFilename>
 * - ใช้ marker parameter (idempotent append-with-marker)
 * - defensive skip ถ้า template ไม่มี
 * @param {string} destRel  — path ปลายทาง relative ต่อ target (เช่น '.cursor/rules/warnyin.mdc')
 * @param {string} srcFilename — ชื่อไฟล์ template ใน installer/templates/
 * @param {string} marker — HTML comment marker สำหรับตรวจ idempotent (เช่น '<!-- warnyin:cursor -->')
 * @param {{overwrite?: boolean}} [opts] — overwrite:true → เขียนทับไฟล์ที่มีอยู่แล้ว (เช่น เมื่อ --update) แทน append-with-marker
 */
function installAdapterDoc(destRel, srcFilename, marker, opts = {}) {
  const src = path.join(pkgRoot, '.warnyin', 'installer', 'templates', srcFilename)
  const dest = path.join(target, destRel)
  if (!fs.existsSync(src)) {
    console.log(`  · ข้าม ${destRel} (ยังไม่มี template ${srcFilename})`)
    return
  }
  const content = fs.readFileSync(src, 'utf8')
  if (!fs.existsSync(dest)) {
    if (!DRY) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, content)
    }
    stats.created++
    console.log(`  + ${destRel}`)
    return
  }
  const existing = fs.readFileSync(dest, 'utf8')
  // overwrite mode (--update สำหรับ IDE-owned folder เช่น Cursor/Windsurf)
  if (opts.overwrite) {
    if (existing === content) { stats.skipped++; return }
    if (!DRY) fs.writeFileSync(dest, content)
    stats.updated++
    console.log(`  ↻ ${destRel}`)
    return
  }
  // append-with-marker mode (Copilot/Cline/Gemini — user-owned file)
  if (existing.includes(marker)) {
    stats.skipped++
    return
  }
  const section = (existing.endsWith('\n') ? '\n' : '\n\n') + content
  if (!DRY) fs.appendFileSync(dest, section)
  stats.updated++
  console.log(`  ± ${destRel} (ต่อท้าย warnyin section)`)
}

/**
 * เขียน resolution note ลง ~/.claude/CLAUDE.md แบบ note-only append-with-marker (global mode)
 * — ห้ามเขียนทับทั้งไฟล์ (personal global memory ของ user); append เฉพาะถ้ายังไม่มี marker (idempotent)
 * — defensive skip ถ้า template ไม่มี (worktree T1 เดี่ยวก่อน merge T2) — pattern เดียวกับ copyTree/seedDocs
 */
function installGlobalNote() {
  const src = path.join(pkgRoot, '.warnyin', 'installer', 'templates', 'CLAUDE.global.md')
  const destRel = path.join('.claude', 'CLAUDE.md')
  const dest = path.join(target, destRel)
  if (!fs.existsSync(src)) {
    console.log(`  · ข้าม ${destRel} (ยังไม่มี template CLAUDE.global.md)`)
    return
  }
  const note = fs.readFileSync(src, 'utf8')
  if (!fs.existsSync(dest)) {
    if (!DRY) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, note)
    }
    stats.created++
    console.log(`  + ${destRel}`)
    return
  }
  const existing = fs.readFileSync(dest, 'utf8')
  if (existing.includes(GLOBAL_NOTE_MARKER)) {
    stats.skipped++
    return
  }
  const section = (existing.endsWith('\n') ? '\n' : '\n\n') + note
  if (!DRY) fs.appendFileSync(dest, section)
  stats.updated++
  console.log(`  ± ${destRel} (ต่อท้าย warnyin global note)`)
}

/** เลือก mode + ติดตั้งตาม mode (target=cwd|homedir). ห่อ async เฉพาะ path TTY (readline) */
async function main() {
  const globalFlag = args.has('--global')
  const projectFlag = args.has('--project')
  const isTTY = Boolean(process.stdin.isTTY && process.stdout.isTTY)

  let mode
  try {
    if (!globalFlag && !projectFlag && isTTY) {
      // ถาม เฉพาะ path TTY — non-TTY/flag ไม่แตะ readline (ไม่ค้าง/ไม่ช้าลง)
      const rl = createInterface({ input: process.stdin, output: process.stdout })
      let answer
      try {
        answer = await rl.question('ติดตั้งแบบไหน? [1] โปรเจกต์นี้ (default) [2] global (~/) : ')
      } finally {
        rl.close()
      }
      mode = resolveMode({ globalFlag, projectFlag, isTTY, answer })
    } else {
      mode = resolveMode({ globalFlag, projectFlag, isTTY })
    }
  } catch (e) {
    console.error(`✖ ${e.message}`)
    process.exit(1)
  }

  if (mode === 'global') {
    const home = os.homedir()
    // homedir guard — falsy หรือ filesystem root (CI/container ไม่มี passwd) → error แทนเขียนลง root
    if (!home || path.resolve(home) === path.parse(path.resolve(home)).root) {
      console.error('✖ หา home directory ไม่ได้ (หรือเป็น filesystem root) — ใช้ --project แทน')
      process.exit(1)
    }
    target = home
    console.log(`Warnyin Standard Workflow → global ${target}${DRY ? '  (dry-run)' : ''}`)
    console.log(`  จะเขียนนอกโปรเจกต์ที่: ${path.join(target, '.warnyin')}, ${path.join(target, '.claude', 'commands', 'warnyin')}, ${path.join(target, '.claude', 'CLAUDE.md')}\n`)
    // first-install overwrite:false (skip ของเดิมใน ~/.claude/{agents,skills}) — ทับเฉพาะ --global --update
    for (const dir of CORE) copyTree(dir, { overwrite: UPDATE })
    writeVersionStamp()
    // ข้าม scaffold/seedDocs (ยกให้ /warnyin:init) + ข้าม AGENTS.md global (DQ3 limitation)
    installGlobalNote()
    // IDE adapters — global mode
    // Cursor/Windsurf: IDE-owned folder → overwrite เมื่อ --update (สอดกับ design §4 copyTree intent)
    installAdapterDoc(path.join('.cursor', 'rules', 'warnyin.mdc'), 'cursor-rules.mdc', '<!-- warnyin:cursor -->', { overwrite: UPDATE })
    installAdapterDoc(path.join('.windsurf', 'rules', 'warnyin.md'), 'windsurf-rules.md', '<!-- warnyin:windsurf -->', { overwrite: UPDATE })
    // Copilot/Cline/Gemini: user-owned file → append-with-marker เสมอ (ไม่ overwrite งาน user)
    installAdapterDoc(path.join('.github', 'copilot-instructions.md'), 'copilot-instructions.md', '<!-- warnyin:copilot -->')
    installAdapterDoc('.clinerules', 'clinerules', '<!-- warnyin:cline -->')
    installAdapterDoc('GEMINI.md', 'GEMINI.md', '<!-- warnyin:gemini -->')
  } else {
    target = cwd
    console.log(`Warnyin Standard Workflow → ${target}${DRY ? '  (dry-run)' : ''}\n`)
    for (const dir of CORE) copyTree(dir, { overwrite: UPDATE })
    writeVersionStamp()
    ensureScaffold()
    seedDocs()
    installRootDoc('CLAUDE.md', path.join(pkgRoot, '.warnyin', 'installer', 'templates', 'CLAUDE.md'))
    installRootDoc('AGENTS.md', path.join(pkgRoot, 'AGENTS.md'))
    // IDE adapters — project mode
    // Cursor/Windsurf: IDE-owned folder → overwrite เมื่อ --update (สอดกับ design §4 copyTree intent)
    installAdapterDoc(path.join('.cursor', 'rules', 'warnyin.mdc'), 'cursor-rules.mdc', '<!-- warnyin:cursor -->', { overwrite: UPDATE })
    installAdapterDoc(path.join('.windsurf', 'rules', 'warnyin.md'), 'windsurf-rules.md', '<!-- warnyin:windsurf -->', { overwrite: UPDATE })
    // Copilot/Cline/Gemini: user-owned file → append-with-marker เสมอ (ไม่ overwrite งาน user)
    installAdapterDoc(path.join('.github', 'copilot-instructions.md'), 'copilot-instructions.md', '<!-- warnyin:copilot -->')
    installAdapterDoc('.clinerules', 'clinerules', '<!-- warnyin:cline -->')
    installAdapterDoc('GEMINI.md', 'GEMINI.md', '<!-- warnyin:gemini -->')
  }

  console.log(`\nสรุป: สร้างใหม่ ${stats.created} · อัปเดต ${stats.updated} · ข้าม (มีอยู่แล้ว) ${stats.skipped}`)

  if (!UPDATE) {
    if (mode === 'global') {
      console.log(`
ติดตั้ง global แล้ว — /warnyin:* ใช้ได้ทุกโปรเจกต์ (จาก ~/.claude/commands/)
  เปิดโปรเจกต์ใด ๆ ใน Claude Code → รัน  /warnyin:init  เพื่อสร้าง workspace (docs/) ของโปรเจกต์นั้น

อัปเดต playbook ภายหลัง:  npx @warnyin/agents --global --update`)
    } else {
      console.log(`
ขั้นถัดไป:
  1. เปิด Claude Code ในโปรเจกต์นี้ แล้วรัน  /warnyin:init  — ให้ agent วิเคราะห์โปรเจกต์ + เติม docs/
  2. เริ่มงานแรก:  /warnyin:discovery <topic>  หรือ  /warnyin:design <slug> <change>

อัปเดต playbook ภายหลัง:  npx @warnyin/agents --update`)
    }
  }
}

/**
 * ตรวจว่า module ถูก execute ตรง ๆ (entrypoint) ไม่ใช่ถูก import — เทียบ argv[1] กับ path ของ module เอง
 * ★ ต้อง realpath argv[1] ด้วย: ESM `import.meta.url` เป็น realpath (resolve symlink) เสมอ แต่ argv[1]
 *   เป็น path ตามที่ผู้เรียกระบุ (ไม่ resolve symlink). เมื่อรันผ่าน symlink — npx รัน bin ผ่าน
 *   `.bin/<name>` symlink, setup:dogfood extract tarball ลง `os.tmpdir()` ที่เป็น symlink บน macOS
 *   (`/var/folders/.../T` → `/private/var/...`) — `path.resolve(argv[1])` จะคืน symlink path ≠ realpath
 *   ของ module → mismatch → main() ไม่ถูกเรียก → installer เงียบ exit 0 ไม่ทำอะไร (bug critical:
 *   กระทบทั้ง npx ของผู้ใช้ปลายทาง + setup:dogfood). realpath ทั้งสองฝั่งจึง match ถูกต้อง.
 * @param {string|undefined} argv1 — process.argv[1] (path ของ script ที่ node รัน)
 * @param {string} metaUrl — import.meta.url ของ module (เป็น realpath เสมอใน ESM)
 * @param {(p: string) => string} [realpath] — injectable เพื่อ unit-test (default fs.realpathSync)
 * @returns {boolean}
 */
export function isEntrypoint(argv1, metaUrl, realpath = fs.realpathSync) {
  if (!argv1) return false
  const self = fileURLToPath(metaUrl)
  try {
    return realpath(argv1) === self
  } catch {
    // argv1 resolve เป็น realpath ไม่ได้ (ไฟล์ไม่อยู่จริง ฯลฯ) → fallback เทียบ path ปกติ
    return path.resolve(argv1) === self
  }
}

// main-guard: รันเฉพาะตอน execute ตรง ๆ (ไม่ trigger ตอน import เพื่อ unit-test resolveMode/isEntrypoint)
if (isEntrypoint(process.argv[1], import.meta.url)) {
  await main()
}
