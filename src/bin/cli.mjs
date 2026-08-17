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
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cwd = process.cwd()
const args = new Set(process.argv.slice(2))
const UPDATE = args.has('--update')
const DRY = args.has('--dry-run')
// ปิดเฟส prune: --no-prune หรือ env WARNYIN_NO_PRUNE=1 (C11)
const NO_PRUNE = args.has('--no-prune') || process.env.WARNYIN_NO_PRUNE === '1'
// escape hatch ของ blast cap (C9) — บันทึกใน runbook เท่านั้น ไม่ขึ้น --help
const PRUNE_FORCE = args.has('--prune-force')
// flag ที่รองรับจริง — เซตปิด 8 ค่า (arg ขึ้นต้น -- ที่ไม่อยู่ในนี้ → เตือน ไม่ exit)
const KNOWN_FLAGS = new Set([
  '--update', '--dry-run', '--global', '--project', '--help', '-h', '--no-prune', '--prune-force',
])
for (const a of args) {
  if (a.startsWith('--') && !KNOWN_FLAGS.has(a)) {
    console.warn(`⚠ ไม่รู้จัก flag ${a} — ข้ามไป`)
  }
}

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
  npx @warnyin/agents --update    เขียนทับเฉพาะ CORE และลบไฟล์ CORE ที่ตกรุ่น (ปิดด้วย --no-prune) — ไฟล์ docs/ ถูก seed จาก template ถ้ายังไม่มี ไม่ทับของเดิม
  npx @warnyin/agents --dry-run   แสดงรายการไฟล์ที่จะสร้าง/อัปเดต/ลบ โดยไม่เขียนจริง
  npx @warnyin/agents --no-prune  ใช้คู่กับ --update: ข้ามการลบไฟล์ตกรุ่น (เก็บไฟล์ CORE เดิมไว้ทั้งหมด)

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

/**
 * ★ POSIX-ise: แปลง native separator → '/' — helper "เดียว" ทั้งไฟล์ (C6)
 * เหตุผล (falsifiable): manifest/guard เทียบ path เป็น POSIX เสมอ แต่ `CORE` สร้างด้วย `path.join`
 * (native sep). ถ้าผสมกัน บน Windows guard scope (C4-5) จะ reject ทุก entry เงียบ (T3)
 * @param {string} rel path รูป native (หรือ POSIX)
 * @param {string} sep separator ที่จะแปลง (default `path.sep`) — รับเข้าเพื่อ unit-test รูป `\` บน Linux
 * @returns {string} path รูป POSIX
 */
export function toPosix(rel, sep = path.sep) {
  return rel.split(sep).join('/')
}

// CORE ในรูป POSIX — derive จาก CORE (ห้าม hardcode รายการซ้ำ; ปรับ CORE ที่เดียว)
const CORE_POSIX = CORE.map((r) => toPosix(r))
// prunable roots ของ --global = 3 dir (ไม่รวม .claude/{agents,skills} ที่แชร์กับผู้ใช้ — C11/C16)
const GLOBAL_PRUNABLE_POSIX = [
  toPosix(path.join('.warnyin', 'workflow')),
  toPosix(path.join('.warnyin', 'template')),
  toPosix(path.join('.claude', 'commands', 'warnyin')),
]
// scope allowlist ใน dir ที่แชร์ (C5) — append-only: ห้ามลบชื่อออกเมื่อเลิก ship (ไม่งั้นลบของตกรุ่นไม่ได้)
const AGENT_ALLOW_RE = /^warnyin-[^/]+\.md$/
const SKILL_ALLOW = new Set(['explore', 'next', 'update-codemaps'])
// blast cap (C9) — const มีชื่อเพื่อให้เทส/mutation อ้าง anchor ได้ (≈ ครึ่งของ payload 91 ไฟล์)
const PRUNE_BLAST_CAP = 50
// known-stale transition (C14) — รายชื่อตายตัว ห้าม glob · ที่มา: git log --diff-filter=D
const KNOWN_STALE = [
  '.warnyin/template/stages/[topic]/test.md',
  '.warnyin/template/stages/[topic]/verify.md',
]
/**
 * ★ เซตปิดของ "เหตุผลที่ไม่ลบ" (C15) — 13 ค่าพอดี · ห้ามพิมพ์ literal `[reason]` กระจายในโค้ด
 * ทุกจุดรายงานต้องอ้าง reason ผ่านตัวแปรจากเซตนี้ (U33 อ่าน source ยืนยันเซต + ยืนยันว่าไม่มี hardcode)
 * prefix category (`path:`/`scope:`/`hash:`/`prune:`) ให้เทส grep และ runbook อ้างเป็น identifier ได้
 */
const PRUNE_REASON = {
  BACKSLASH: 'path:backslash',
  DOT_SEGMENT: 'path:dot-segment',
  ABSOLUTE: 'path:absolute',
  CONTROL_CHAR: 'path:control-char',
  OUTSIDE_ROOT: 'scope:outside-root',
  NOT_ALLOWLISTED: 'scope:not-allowlisted',
  HASH_MISSING: 'hash:missing',
  HASH_MISMATCH: 'hash:mismatch',
  TOO_LARGE: 'prune:too-large',
  SYMLINK: 'prune:symlink',
  NOT_CONTAINED: 'prune:not-contained',
  IO: 'prune:io',
  BLAST_CAP: 'prune:blast-cap',
}
// scaffold = พื้นที่ทำงานเปล่าของโปรเจกต์ — installer "สร้างเอง" ไม่ copy tree จาก package
// (สำคัญ: ถ้า copy docs/stages จาก pkgRoot งานจริงของ repo ต้นทางจะรั่วไป target ทุกครั้ง — ดู verify installer-test-ci)
// ★ docs/stages/context.md ไม่ได้อยู่ในรายการนี้แล้ว — มันมี template ที่ .warnyin/template/docs/stages/context.md
//   จึงถูก seedDocs() (ด้านล่าง) เป็นคนสร้างให้แทน (ได้โครง 4 section จริง ไม่ใช่ไฟล์ 0 byte)
//   scaffold ที่เหลือจึงมีแค่โฟลเดอร์ archive เปล่าใบเดียว
const SCAFFOLD_FILES = [
  path.join('docs', 'stages', 'achieved', '.gitkeep'), // ให้ git track โฟลเดอร์ archive เปล่า
]

const stats = { created: 0, updated: 0, skipped: 0, pruned: 0 }

// target = ปลายทางที่จะเขียนไฟล์ — ตั้งหลัง resolve mode (project=cwd | global=homedir)
let target = cwd

// นามสกุลที่ถือเป็น text payload — normalize EOL ตอนเขียน + EOL gate ของ verify-pack (นอกรายการนี้ = byte-copy ตรง)
// export ให้ verify-pack.mjs import ใช้ร่วม (single source ระหว่าง normalizeEol ↔ checkEol — กัน drift)
export const TEXT_EXT = new Set(['.md', '.mjs', '.js', '.cjs', '.json', '.txt', '.yml', '.yaml', '.css', '.html'])

/**
 * ★ payload ที่เขียนลง target ต้องเป็น **LF เสมอ** ไม่ว่าไฟล์ใน package จะเป็น EOL อะไร
 * เหตุผล (falsifiable): `.warnyin/workflow/scripts/*.mjs` ถูกส่งผ่าน Workflow tool ที่ **ปัดตก script
 * ที่มี control character** — CR (`\r`, 0x0D) ของ CRLF เป็น control char → `/warnyin:build` พังทั้งระบบ
 * ของผู้ใช้. `.gitattributes` คุมได้แค่ repo ต้นทาง แต่ tarball ที่ pack จาก checkout เก่า/เครื่องที่
 * `core.autocrlf=true` ยังมี CRLF ติดมาได้ และ copy แบบ byte ก็ลอกลง target ตรง ๆ (เจอจริง 0.22.0)
 * → กันที่ **จุดเขียน** ไม่ใช่แค่จุด commit
 * @param {Buffer|string} data เนื้อไฟล์ที่อ่านจาก package
 * @param {string} filename ชื่อ/path ของไฟล์ต้นทาง (ใช้ดูนามสกุล)
 * @returns {Buffer|string} ชนิดเดิม แต่ CRLF/CR → LF (ไม่มี CR = คืนตัวเดิม)
 */
export function normalizeEol(data, filename) {
  if (!TEXT_EXT.has(path.extname(filename))) return data
  const isBuffer = Buffer.isBuffer(data)
  const text = isBuffer ? data.toString('utf8') : data
  if (!text.includes('\r')) return data
  const lf = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  return isBuffer ? Buffer.from(lf, 'utf8') : lf
}

/**
 * @param {string} relDir
 * @param {{overwrite:boolean, onFile?:(relPosix:string, sha256:string, owned:boolean)=>void}} opts
 *   onFile ถูกเรียกทุกไฟล์ที่ walker "เป็นเจ้าของชื่อ" (เขียนจริง หรือ byte-equal บนดิสก์)
 *   เพื่อให้ layer บนสร้าง manifest โดยไม่ต้อง walk tree ซ้ำ (กัน walker 2 ตัว drift กัน)
 * ★ T1: อ่าน+normalize content ขึ้น "เหนือ" branch skip — ไม่งั้นไฟล์ที่ skip (มีอยู่แล้ว/byte-equal)
 *   จะหายจาก manifest = ของที่เราเป็นเจ้าของแต่บันทึกไม่ครบ ⇒ ตกรุ่นแล้วลบไม่ได้ตลอดกาล
 */
function copyTree(relDir, { overwrite, onFile }) {
  const srcDir = path.join(pkgRoot, relDir)
  if (!fs.existsSync(srcDir)) return
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const rel = path.join(relDir, entry.name)
    if (entry.isDirectory()) {
      copyTree(rel, { overwrite, onFile }) // ★ T10: forward onFile ที่ recursion ไม่งั้นได้ manifest แค่ชั้นบนสุด
      continue
    }
    const src = path.join(pkgRoot, rel)
    const dest = path.join(target, rel)
    const exists = fs.existsSync(dest)
    // ★ T1: อ่าน+normalize ก่อน branch skip — content นี้คือ "สิ่งที่เราเขียน" = identity ของไฟล์ที่เราเป็นเจ้าของ
    const content = normalizeEol(fs.readFileSync(src), src)
    const relPosix = toPosix(rel)
    if (exists && !overwrite) {
      // first-install / ไม่มี --update: byte-equal กับ payload → เราเป็นเจ้าของชื่อนี้; ต่างเนื้อ → ของผู้ใช้ (ห้ามเคลม)
      const owned = fs.readFileSync(dest).equals(content)
      if (onFile) onFile(relPosix, hashOf(content, src), owned)
      stats.skipped++
      continue
    }
    // เทียบกับ content ที่ normalize แล้ว — ไม่งั้น target ที่เป็น LF อยู่แล้วจะถูกเขียนซ้ำทุกรอบ
    if (exists && overwrite && fs.readFileSync(dest).equals(content)) {
      if (onFile) onFile(relPosix, hashOf(content, src), true)
      stats.skipped++
      continue
    }
    if (!DRY) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, content)
    }
    if (onFile) onFile(relPosix, hashOf(content, src), true)
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
      const src = path.join(pkgRoot, rel)
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, normalizeEol(fs.readFileSync(src), src))
    }
    stats.created++
    console.log(`  + ${destRel}`)
  }
}

/** CLAUDE.md / AGENTS.md: ไม่มี → สร้างจาก template; มีอยู่แล้วแต่ยังไม่มี workflow → ต่อท้ายเป็น section */
function installRootDoc(name, srcPath) {
  const dest = path.join(target, name)
  const content = normalizeEol(fs.readFileSync(srcPath, 'utf8'), srcPath)
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

// ────────────────────────────────────────────────────────────────────────────
// prune — ลบไฟล์ payload ที่ตกรุ่น (manifest ที่ผูก hash) · guard 6 ชั้นอิสระ
// manifest = untrusted input (commit ได้ = repo สาธารณะใส่ปลอมได้) ⇒ ทุกค่าผ่าน guard ก่อนใช้
// pattern: pure core (export ให้ unit-test) + fs shell (side-effect)
// ────────────────────────────────────────────────────────────────────────────

/**
 * ★ sha256 ของ buffer "หลัง normalizeEol" — ต้องคิดหลัง normalize ทั้งฝั่งเขียน manifest และฝั่งอ่านดิสก์ (C7)
 * เหตุผล (T2/KB#30): identity ของไฟล์ที่เราเป็นเจ้าของ = สิ่งที่เขียนลง target (LF เสมอ) ไม่ใช่ไฟล์ดิบใน package;
 * ถ้าฝั่งใดใช้ buffer ดิบ hash จะไม่ตรงทุกไฟล์บน tarball ที่ pack จาก checkout CRLF ⇒ prune เป็น no-op เงียบทั้ง feature
 * @param {Buffer|string} data
 * @param {string} name ชื่อไฟล์ (ดูนามสกุลว่าเป็น text ที่ต้อง normalize)
 * @returns {string} sha256 hex
 */
function hashOf(data, name) {
  const norm = normalizeEol(data, name)
  const buf = Buffer.isBuffer(norm) ? norm : Buffer.from(norm, 'utf8')
  return createHash('sha256').update(buf).digest('hex')
}

/**
 * ★ semverLt — เขียนเองใน cli.mjs (ลอกอัลกอริทึม field-wise numeric ของ src/scripts/setup-dogfood.mjs semverGte)
 * ★ ห้าม import จาก src/scripts/ (T8): path นั้นไม่อยู่ใน package.json `files` ⇒ ไม่ถูก publish ⇒ ผู้ใช้ crash
 *   ขณะที่เทสในรีโปเขียวทั้งชุด (false-green ระดับ ship-breaking) · reuse คือ "อัลกอริทึม" ไม่ใช่ module
 * @param {string} a @param {string} b @returns {boolean} a < b เชิง numeric field-wise (ขาด field = 0)
 */
export function semverLt(a, b) {
  const parse = (v) => String(v).split('.').map((x) => parseInt(x, 10) || 0)
  const pa = parse(a)
  const pb = parse(b)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0
    const vb = pb[i] ?? 0
    if (va < vb) return true
    if (va > vb) return false
  }
  return false // เท่ากัน = ไม่ lt
}

/**
 * ★ pure — parse ข้อความ manifest (ไม่แตะ fs, ไม่ throw ทุกกรณี)
 * schema: header `# ...` แล้วบรรทัดละ `<sha256 hex64>␠␠<path POSIX>` · ข้ามบรรทัดว่าง/`#` · trim `\r`
 * duplicate path → ทิ้งทั้งคู่ (fail-closed) · เกิน maxEntries → ทั้งไฟล์ใช้ไม่ได้
 * @param {string|null|undefined} text
 * @param {{maxEntries?:number}} [o]
 * @returns {{entries:{path:string,sha256:string}[], rejected:{line:number,reason:string}[], manifestUsable:boolean}}
 *   manifestUsable=false เมื่อ "ไม่มี/ว่าง/เกิน cap จนทิ้งทั้งไฟล์" เท่านั้น (= ยังไม่เคยมี manifest ที่ใช้ได้);
 *   true เมื่ออ่านได้และ parse ผ่าน แม้ entry เหลือ 0 เพราะ reject รายบรรทัด (= สัญญาณ tamper — C2)
 */
export function parseManifest(text, { maxEntries = 5000 } = {}) {
  const entries = []
  const rejected = []
  if (text == null || text === '') return { entries, rejected, manifestUsable: false }
  const lines = String(text).split('\n')
  const raw = []
  let count = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, '') // trim `\r` ท้าย (CRLF)
    if (line.trim() === '' || line.startsWith('#')) continue
    count++
    const m = line.match(/^([0-9a-f]{64}) {2}(.+)$/)
    if (!m) {
      rejected.push({ line: i + 1, reason: PRUNE_REASON.HASH_MISSING })
      continue
    }
    raw.push({ path: m[2], sha256: m[1], lineNo: i + 1 })
  }
  if (count > maxEntries) {
    // เกิน cap → ทั้งไฟล์ใช้ไม่ได้ (ไม่ throw)
    return { entries: [], rejected, manifestUsable: false }
  }
  // duplicate detection (fail-closed — ทิ้งทั้งคู่)
  const dup = new Set()
  const first = new Map()
  for (const r of raw) {
    if (first.has(r.path)) dup.add(r.path)
    else first.set(r.path, r)
  }
  for (const r of raw) {
    if (dup.has(r.path)) {
      rejected.push({ line: r.lineNo, reason: PRUNE_REASON.HASH_MISSING })
      continue
    }
    entries.push({ path: r.path, sha256: r.sha256 })
  }
  return { entries, rejected, manifestUsable: true }
}

/**
 * fs shell — อ่าน manifest ที่ target แล้วส่งให้ parseManifest
 * guard ขนาด (statSync maxBytes = 1 MB) ก่อนอ่าน · ไม่มี/อ่านไม่ได้/ใหญ่เกิน → manifestUsable=false (ถือว่ายังไม่มี)
 * ★ ⚠ ทุกชนิดไปที่ stdout — prune exit 0 เสมอ ⇒ runbook สั่ง automation ให้อ่าน stdout อย่างเดียว
 *   (whole-file reject ที่ไปโผล่ stderr = automation ตามคู่มือแล้วมองไม่เห็น) · per-line reject → pointer `#L<n>` ไม่ echo เนื้อบรรทัด
 */
function readManifest(target) {
  const rel = path.join('.warnyin', '.warnyin-manifest')
  const abs = path.join(target, rel)
  let text
  try {
    const st = fs.statSync(abs)
    if (st.size > 1024 * 1024) {
      console.log('⚠ manifest ใหญ่เกิน 1 MB — ข้ามทั้งไฟล์ (ถือว่ายังไม่เคยมี manifest ที่ใช้ได้)')
      return { entries: [], rejected: [], manifestUsable: false }
    }
    text = fs.readFileSync(abs, 'utf8')
  } catch {
    return { entries: [], rejected: [], manifestUsable: false }
  }
  const res = parseManifest(text)
  if (!res.manifestUsable) {
    console.log('⚠ manifest อ่านเป็นรายการไม่ได้ — ข้ามทั้งไฟล์ (ถือว่ายังไม่เคยมี manifest ที่ใช้ได้)')
  }
  // per-line reject → pointer ไม่ echo เนื้อบรรทัด (untrusted input ห้ามหลุดขึ้น terminal)
  const relPosix = toPosix(rel)
  for (const rj of res.rejected) {
    console.log(`  ⚠ ${relPosix}#L${rj.line} [${rj.reason}]`)
  }
  return res
}

/**
 * ★ C4 traversal guard (checks 1-4 — ไม่พึ่ง prunableRoots) → reason หรือ null
 * (1) มี `\` (2) segment `..`/`.` (3) ขึ้นต้น `/` หรือ `:` ใน segment แรก (4) control char
 * checks 1-4 คือส่วนที่กัน statOnDisk probe ออกนอก target (load-bearing กับ C13)
 */
function pathTraversalGuard(rel) {
  if (rel.includes('\\')) return PRUNE_REASON.BACKSLASH
  const segs = rel.split('/')
  if (segs.some((s) => s === '..' || s === '.')) return PRUNE_REASON.DOT_SEGMENT
  if (rel.startsWith('/') || /:/.test(segs[0] || '')) return PRUNE_REASON.ABSOLUTE
  if (/[\u0000-\u001f\u007f]/.test(rel)) return PRUNE_REASON.CONTROL_CHAR
  return null
}

/**
 * ★ C4 path guard เต็ม = traversal (1-4) + scope segment-wise (5) → reason หรือ null
 * (5) ต้องขึ้นต้นด้วย entry ใน prunableRoots แบบ segment-wise (`rel === root || rel.startsWith(root + '/')`)
 * — startsWith ดิบไม่พอ: `.warnyin/workflow-old` ต้องไม่ผ่าน root `.warnyin/workflow`
 */
function pathGuard(rel, prunableRoots) {
  const t = pathTraversalGuard(rel)
  if (t) return t
  const inRoot = prunableRoots.some((root) => rel === root || rel.startsWith(root + '/'))
  return inRoot ? null : PRUNE_REASON.OUTSIDE_ROOT
}

/**
 * ★ C5 scope allowlist ใน dir ที่แชร์กับผู้ใช้ → reason หรือ null
 * ใต้ .claude/agents/ เฉพาะ warnyin-*.md · ใต้ .claude/skills/ เฉพาะ explore/next/update-codemaps
 */
function scopeGuard(rel) {
  const segs = rel.split('/')
  if (segs[0] === '.claude' && segs[1] === 'agents') {
    const name = segs.slice(2).join('/')
    if (!AGENT_ALLOW_RE.test(name)) return PRUNE_REASON.NOT_ALLOWLISTED
  }
  if (segs[0] === '.claude' && segs[1] === 'skills') {
    if (!SKILL_ALLOW.has(segs[2])) return PRUNE_REASON.NOT_ALLOWLISTED
  }
  return null
}

/**
 * ★ pure — คำนวณรายการที่ตกรุ่น (ไม่แตะ fs)
 * knownStale ถูกรวมเฉพาะเมื่อ manifestOld ว่าง (U22/U23) — caller ยังต้องส่ง [] เพิ่มในเคส tamper/stamp (C2/C14)
 * @param {{manifestOld:{path:string,sha256:string}[], payloadNew:Map|Iterable, knownStale?:string[],
 *          prunableRoots:string[], statOnDisk:(rel:string)=>boolean, sep?:string}} o
 * @returns {{stale:{path:string,sha256:string|null,source:string}[], rejected:{path:string,reason:string}[]}}
 */
export function computeStale({ manifestOld, payloadNew, knownStale = [], prunableRoots, statOnDisk, sep = '/' }) {
  void sep // input เป็น POSIX เสมอ (C6); sep รับไว้เพื่อ contract/unit-test ว่าผลไม่ขึ้นกับ sep
  const stale = []
  const rejected = []
  const seen = new Set()
  const payloadSet = payloadNew instanceof Set ? payloadNew : new Set(
    payloadNew instanceof Map ? payloadNew.keys() : payloadNew,
  )
  const candidates = manifestOld.map((e) => ({ path: e.path, sha256: e.sha256, source: 'manifest' }))
  // known-stale ทำงานเฉพาะเมื่อ "ยังไม่เคยมี manifest ที่ใช้ได้" (approx = manifestOld ว่าง) — C2/C14
  if (manifestOld.length === 0) {
    for (const p of knownStale) candidates.push({ path: p, sha256: null, source: 'known-stale' })
  }
  for (const c of candidates) {
    const rel = c.path
    const pReason = pathGuard(rel, prunableRoots) // C4
    if (pReason) { rejected.push({ path: rel, reason: pReason }); continue }
    const sReason = scopeGuard(rel) // C5
    if (sReason) { rejected.push({ path: rel, reason: sReason }); continue }
    if (c.source === 'manifest' && !c.sha256) { // C3 fail-closed
      rejected.push({ path: rel, reason: PRUNE_REASON.HASH_MISSING }); continue
    }
    if (payloadSet.has(rel)) continue // ยังอยู่ใน payload → ไม่ตกรุ่น
    if (!statOnDisk(rel)) continue // ไม่มีบนดิสก์ → ไม่ต้องลบ
    if (seen.has(rel)) continue
    seen.add(rel)
    stale.push({ path: rel, sha256: c.sha256, source: c.source })
  }
  stale.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
  return { stale, rejected }
}

/**
 * ★ pure — union manifest ใหม่: payloadNew ∪ (manifestOld ∩ statOnDisk) โดยคง hash เดิมของ entry เก่า (C13)
 * ★ manifestOld ต้องผ่าน traversal guard ก่อนเรียก statOnDisk — ไม่งั้น entry ปลอม (`..`) จะถูก probe นอก target
 * @param {Map|Iterable<[string,string]>} payloadNew
 * @param {{path:string,sha256:string}[]} manifestOld
 * @param {(rel:string)=>boolean} statOnDisk
 * @returns {Map<string,string>} path → sha256 (สำหรับเขียน manifest)
 */
export function mergeManifest(payloadNew, manifestOld, statOnDisk) {
  const out = new Map(payloadNew instanceof Map ? payloadNew : payloadNew)
  for (const e of manifestOld) {
    if (out.has(e.path)) continue
    if (pathTraversalGuard(e.path)) continue // ★ ทิ้ง entry ที่ไม่ผ่าน — statOnDisk ไม่ถูกเรียก (U34)
    if (statOnDisk(e.path)) out.set(e.path, e.sha256)
  }
  return out
}

/**
 * ★ pure predicate — เกิน blast cap หรือไม่ (C9) · --dry-run / --prune-force ยกเว้นเสมอ
 * @param {number} n @param {{dry?:boolean, force?:boolean}} [o] @returns {boolean}
 */
export function overCap(n, { dry = false, force = false } = {}) {
  if (dry || force) return false
  return n > PRUNE_BLAST_CAP
}

/** ★ strip control/ANSI + ตัดยาว — กัน terminal spoofing จาก path ใน manifest (T7) */
export function sanitizePath(p, max = 200) {
  let s = String(p).replace(/\u001b\[[0-9;]*[A-Za-z]/g, '').replace(/[\u0000-\u001f\u007f]/g, '')
  if (s.length > max) s = s.slice(0, max) + '…'
  return s
}

/** true เมื่อ path อยู่ใต้ dir ที่แชร์กับผู้ใช้ (C16 — global manifest ไม่บันทึก) */
function isSharedDir(relPosix) {
  return relPosix.startsWith('.claude/agents/') || relPosix.startsWith('.claude/skills/')
}

/** อ่าน .warnyin/.warnyin-version → string (trim) หรือ null — ไม่ throw · ★ ต้องเรียกก่อน writeVersionStamp() (T11) */
function readStamp(target) {
  try {
    return fs.readFileSync(path.join(target, '.warnyin', '.warnyin-version'), 'utf8').trim()
  } catch {
    return null
  }
}

/** fs probe — ไฟล์ (relPosix) มีอยู่ที่ target หรือไม่ (caller guard path ก่อนเรียกแล้ว — C13) */
function makeStatOnDisk(target) {
  return (relPosix) => {
    try {
      return fs.existsSync(path.join(target, relPosix.split('/').join(path.sep)))
    } catch {
      return false
    }
  }
}

/**
 * เขียน manifest ลง <target>/.warnyin/.warnyin-manifest (N3 header + `<sha>␠␠<path>` เรียง A→Z, LF)
 * เคารพ DRY (log + นับ stats แต่ไม่เขียน) — pattern เดียวกับ writeVersionStamp (T9/F17)
 * @param {string} target @param {Map<string,string>} entriesMap
 */
function writeManifest(target, entriesMap) {
  const rel = path.join('.warnyin', '.warnyin-manifest')
  const dest = path.join(target, rel)
  const exists = fs.existsSync(dest)
  const sorted = [...entriesMap.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
  const header = `# warnyin manifest v1 — เขียนโดย installer ${readPkgVersion()} · ห้ามแก้มือ`
  const body = sorted.map(([p, h]) => `${h}  ${p}`).join('\n')
  const text = header + '\n' + (body ? body + '\n' : '')
  if (!DRY) {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, text)
  }
  stats[exists ? 'updated' : 'created']++
  console.log(`  ${exists ? '↻' : '+'} ${toPosix(rel)}`)
}

/**
 * ★ C8 fs containment — abs อยู่ใต้ realpath ของ prunableRoot ที่มันสังกัดหรือไม่
 * realpathSync ตัวเดียวกันทั้ง root และ parent (ห้ามผสม .native) · realpath throw → ไม่ผ่าน (fail-closed)
 */
function containedIn(abs, relPosix, prunableRoots, target) {
  let rootRel = null
  for (const r of prunableRoots) {
    if (relPosix === r || relPosix.startsWith(r + '/')) { rootRel = r; break }
  }
  if (!rootRel) return false
  let root, parent
  try {
    root = fs.realpathSync(path.join(target, rootRel.split('/').join(path.sep)))
    parent = fs.realpathSync(path.dirname(abs))
  } catch {
    return false
  }
  const relp = path.relative(root, parent)
  return !relp.startsWith('..') && !path.isAbsolute(relp)
}

/**
 * ★ C10 empty-dir cleanup — ลบ dir ที่ "ว่างเพราะ run นี้ลบไฟล์ในนั้นเอง" ไต่ ancestor จนถึง (ไม่รวม) prunableRoot
 * candidate = dirname ของไฟล์ที่ถูกลบเท่านั้น ⇒ dir ว่างของผู้ใช้รอดอัตโนมัติ (ไม่เคยเป็น candidate)
 * ใช้ realpath ชุดเดียวกับ C8 (กัน symlinked ancestor หลุดออกนอก root)
 */
function cleanupEmptyDirs(deletedDirs, prunableRoots, target) {
  const rootReals = []
  for (const r of prunableRoots) {
    try { rootReals.push(fs.realpathSync(path.join(target, r.split('/').join(path.sep)))) } catch { /* root หาย → ข้าม */ }
  }
  for (const startDir of deletedDirs) {
    let dir = startDir
    for (;;) {
      let real
      try { real = fs.realpathSync(dir) } catch { break }
      if (rootReals.includes(real)) break // ถึง prunableRoot → หยุด (ไม่ลบ root)
      const inSome = rootReals.some((rr) => {
        const relp = path.relative(rr, real)
        return relp && !relp.startsWith('..') && !path.isAbsolute(relp)
      })
      if (!inSome) break
      let lst
      try { lst = fs.lstatSync(dir) } catch { break }
      if (lst.isSymbolicLink() || !lst.isDirectory()) break
      let items
      try { items = fs.readdirSync(dir) } catch { break }
      if (items.length > 0) break
      try { fs.rmdirSync(dir) } catch { break }
      dir = path.dirname(dir)
    }
  }
}

/**
 * ★ ลบไฟล์ตกรุ่น — guard ตาม C7/C8/C9/C10/C12/C15 · fail-toward-under-delete (ไม่แน่ใจ = ไม่ลบ)
 * ลำดับ: C9¹ (cap บน stale ดิบ) → per-file [symlink/size C7·C8 containment·C7 hash] → C9² (cap หลังผ่าน)
 *        → unlink → C15 report → C10 empty-dir · DRY → พิมพ์อย่างเดียว ไม่ unlink/rmdir
 */
function prune(stale, { target, prunableRoots }) {
  if (!stale.length) return
  // C9 ชั้น 1 — cap บน stale ดิบ ก่อนอ่านไฟล์ (กัน I/O จาก manifest ปลอม)
  if (overCap(stale.length, { dry: DRY, force: PRUNE_FORCE })) {
    console.log(`⚠ [${PRUNE_REASON.BLAST_CAP}] ${stale.length} ไฟล์ เกินเพดาน ${PRUNE_BLAST_CAP} — ไม่ลบเลย (ตรวจด้วย --dry-run ก่อน)`)
    return
  }
  const passed = []
  for (const item of stale) {
    const relPosix = item.path
    const abs = path.join(target, relPosix.split('/').join(path.sep))
    let st
    try {
      st = fs.lstatSync(abs) // ★ lstat ก้อนเดียวใช้ทั้ง symlink-check และ size gate (C7/C8)
    } catch {
      continue // ไฟล์หาย/เข้าไม่ถึง → ข้ามเงียบ
    }
    if (st.isSymbolicLink() || !st.isFile()) {
      console.log(`  ⚠ ${sanitizePath(relPosix)} [${PRUNE_REASON.SYMLINK}]`)
      continue
    }
    if (st.size > 5 * 1024 * 1024) {
      console.log(`  ⚠ ${sanitizePath(relPosix)} [${PRUNE_REASON.TOO_LARGE}]`)
      continue
    }
    if (!containedIn(abs, relPosix, prunableRoots, target)) { // C8
      console.log(`  ⚠ ${sanitizePath(relPosix)} [${PRUNE_REASON.NOT_CONTAINED}]`)
      continue
    }
    if (item.source === 'manifest') { // C7 hash gate (known-stale ยกเว้นโดยเจตนา)
      let diskHash
      try {
        diskHash = hashOf(fs.readFileSync(abs), abs)
      } catch {
        console.log(`  ⚠ ${sanitizePath(relPosix)} [${PRUNE_REASON.IO}]`)
        continue
      }
      if (diskHash !== item.sha256) {
        console.log(`  ⚠ ${sanitizePath(relPosix)} [${PRUNE_REASON.HASH_MISMATCH}]`)
        continue
      }
    }
    passed.push({ relPosix, abs })
  }
  // C9 ชั้น 2 — cap บนรายการที่ผ่าน C7/C8 แล้ว
  if (overCap(passed.length, { dry: DRY, force: PRUNE_FORCE })) {
    console.log(`⚠ [${PRUNE_REASON.BLAST_CAP}] ${passed.length} ไฟล์ เกินเพดาน ${PRUNE_BLAST_CAP} — ไม่ลบเลย (ตรวจด้วย --dry-run ก่อน)`)
    return
  }
  if (DRY && passed.length) console.log('จะลบ:')
  const deletedDirs = new Set()
  for (const { relPosix, abs } of passed) {
    if (!DRY) {
      try {
        fs.unlinkSync(abs) // ★ ติดกับ lstat ไม่แทรก I/O อื่น (ลด TOCTOU window)
      } catch {
        console.log(`  ⚠ ${sanitizePath(relPosix)} [${PRUNE_REASON.IO}]`)
        continue
      }
    }
    console.log(`  − ${sanitizePath(relPosix)}`)
    stats.pruned++
    deletedDirs.add(path.dirname(abs))
  }
  if (!DRY) cleanupEmptyDirs(deletedDirs, prunableRoots, target) // C10 — ★ DRY ห้ามแตะ fs
}

/**
 * ★ เฟส prune จุดเดียว หลังปิด if/else ของ mode (ห้าม duplicate 2 สาขา)
 * เขียน manifest เสมอ (แม้ install สด/ไม่มี --update) · prune เฉพาะ --update && !--no-prune (C11)
 * @param {{mode:string, stampBefore:string|null, payloadNew:Map<string,string>}} o
 */
function runPrunePhase({ mode, stampBefore, payloadNew }) {
  const prunableRoots = mode === 'global' ? GLOBAL_PRUNABLE_POSIX : CORE_POSIX
  const statOnDisk = makeStatOnDisk(target)
  const manifestOld = readManifest(target)
  if (UPDATE && !NO_PRUNE) { // C11 — prune เฉพาะ --update ที่ไม่ปิด
    // C14 — known-stale ทำงานเมื่อ stamp หาย/< 0.30.1 และยังไม่เคยมี manifest ที่ใช้ได้ (tamper-safe)
    const useKnownStale = (!stampBefore || semverLt(stampBefore, '0.30.1')) && !manifestOld.manifestUsable
    const { stale, rejected } = computeStale({
      manifestOld: manifestOld.entries,
      payloadNew,
      knownStale: useKnownStale ? KNOWN_STALE : [],
      prunableRoots,
      statOnDisk,
    })
    // C15 — entry ที่ guard ตัดทิ้ง (C4/C5/C3) ต้องรายงานด้วย ไม่ใช่เงียบ: ผู้ใช้ต้องรู้ว่าทำไมไฟล์ไม่ถูกลบ
    // path มาจาก manifest = untrusted input ⇒ ผ่าน sanitizePath เสมอ (กัน terminal spoofing)
    for (const rj of rejected) console.log(`  ⚠ ${sanitizePath(rj.path)} [${rj.reason}]`)
    prune(stale, { target, prunableRoots })
  }
  // C13 — เขียน manifest "หลัง" prune: ไฟล์ที่เพิ่งลบต้องหลุดจาก manifest ทันที ไม่งั้นรอบ 2 จะได้ manifest
  // ที่ต่างจากรอบ 1 (ไม่ idempotent) · union คง hash เดิม ⇒ ข้อมูลไม่หายแม้รอบนั้นไม่ได้ prune (--no-prune)
  writeManifest(target, mergeManifest(payloadNew, manifestOld.entries, statOnDisk))
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
  const content = normalizeEol(fs.readFileSync(src, 'utf8'), src)
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
 * ติดตั้ง CodeBuddy plugin — สร้างโครง plugin ใน <target>/.codebuddy/plugins/warnyin/
 *   .codebuddy-plugin/plugin.json  → จาก installer/templates/codebuddy-plugin.json
 *   rules/warnyin_rules.md         → จาก installer/templates/codebuddy-rules.md
 *   commands/warnyin/*.md          → copy จาก .claude/commands/warnyin/ (shared source)
 * — plugin.json + rules: overwrite เมื่อ --update (IDE-owned folder); commands: overwrite เมื่อ --update
 * — idempotent: ถ้าไฟล์มีอยู่แล้วและ byte-equal → skip
 */
function installCodeBuddyPlugin() {
  const pluginDir = path.join('.codebuddy', 'plugins', 'warnyin')

  // plugin.json
  const pluginJsonSrc = path.join(pkgRoot, '.warnyin', 'installer', 'templates', 'codebuddy-plugin.json')
  const pluginJsonDest = path.join(target, pluginDir, '.codebuddy-plugin', 'plugin.json')
  if (fs.existsSync(pluginJsonSrc)) {
    const content = normalizeEol(fs.readFileSync(pluginJsonSrc, 'utf8'), pluginJsonSrc)
    const exists = fs.existsSync(pluginJsonDest)
    if (!exists || (UPDATE && fs.readFileSync(pluginJsonDest, 'utf8') !== content)) {
      if (!DRY) { fs.mkdirSync(path.dirname(pluginJsonDest), { recursive: true }); fs.writeFileSync(pluginJsonDest, content) }
      stats[exists ? 'updated' : 'created']++
      console.log(`  ${exists ? '↻' : '+'} ${path.join(pluginDir, '.codebuddy-plugin', 'plugin.json')}`)
    } else { stats.skipped++ }
  }

  // rules/warnyin_rules.md
  const rulesSrc = path.join(pkgRoot, '.warnyin', 'installer', 'templates', 'codebuddy-rules.md')
  const rulesDest = path.join(target, pluginDir, 'rules', 'warnyin_rules.md')
  if (fs.existsSync(rulesSrc)) {
    const content = normalizeEol(fs.readFileSync(rulesSrc, 'utf8'), rulesSrc)
    const exists = fs.existsSync(rulesDest)
    if (!exists || (UPDATE && fs.readFileSync(rulesDest, 'utf8') !== content)) {
      if (!DRY) { fs.mkdirSync(path.dirname(rulesDest), { recursive: true }); fs.writeFileSync(rulesDest, content) }
      stats[exists ? 'updated' : 'created']++
      console.log(`  ${exists ? '↻' : '+'} ${path.join(pluginDir, 'rules', 'warnyin_rules.md')}`)
    } else { stats.skipped++ }
  }

  // commands/warnyin/*.md — copy จาก .claude/commands/warnyin/ (shared source ไม่ต้อง duplicate)
  const cmdSrcDir = path.join(pkgRoot, '.claude', 'commands', 'warnyin')
  if (fs.existsSync(cmdSrcDir)) {
    copyDirToTarget(cmdSrcDir, path.join(pluginDir, 'commands', 'warnyin'))
  }
}

/**
 * copy ทุกไฟล์ใน srcAbsDir ไปที่ <target>/<destRel>/ — overwrite เมื่อ UPDATE; skip ถ้า byte-equal
 * ★ ใช้เฉพาะ CodeBuddy plugin (copy .claude/commands → .codebuddy/plugins/warnyin/commands)
 */
function copyDirToTarget(srcAbsDir, destRel) {
  for (const entry of fs.readdirSync(srcAbsDir, { withFileTypes: true })) {
    const srcPath = path.join(srcAbsDir, entry.name)
    const relChild = path.join(destRel, entry.name)
    if (entry.isDirectory()) { copyDirToTarget(srcPath, relChild); continue }
    const dest = path.join(target, relChild)
    const content = normalizeEol(fs.readFileSync(srcPath), srcPath)
    const exists = fs.existsSync(dest)
    if (exists && !UPDATE) { stats.skipped++; continue }
    if (exists && UPDATE && fs.readFileSync(dest).equals(content)) { stats.skipped++; continue }
    if (!DRY) { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, content) }
    stats[exists ? 'updated' : 'created']++
    console.log(`  ${exists ? '↻' : '+'} ${relChild}`)
  }
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
  const note = normalizeEol(fs.readFileSync(src, 'utf8'), src)
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

  // payloadNew: Map<relPosix, sha256> ที่ copyTree เติมผ่าน onFile — ต้นทางของ manifest (§5 flow)
  const payloadNew = new Map()
  const onFile = (relPosix, sha256, owned) => {
    if (!owned) return // byte-different first-install = ไฟล์ผู้ใช้ชื่อชน ห้ามเคลมเป็นของเรา
    if (mode === 'global' && isSharedDir(relPosix)) return // C16 — global ไม่บันทึก dir ที่แชร์
    payloadNew.set(relPosix, sha256)
  }
  // ★★ T11: stampBefore ต้องอ่านก่อน copyTree loop และก่อน writeVersionStamp() (ซึ่งเขียนทับ stamp ด้วย version ใหม่)
  let stampBefore = null

  if (mode === 'global') {
    const home = os.homedir()
    // homedir guard — falsy หรือ filesystem root (CI/container ไม่มี passwd) → error แทนเขียนลง root
    if (!home || path.resolve(home) === path.parse(path.resolve(home)).root) {
      console.error('✖ หา home directory ไม่ได้ (หรือเป็น filesystem root) — ใช้ --project แทน')
      process.exit(1)
    }
    target = home
    stampBefore = readStamp(target) // ★ ก่อน copyTree/writeVersionStamp (T11)
    console.log(`Warnyin Standard Workflow → global ${target}${DRY ? '  (dry-run)' : ''}`)
    console.log(`  จะเขียนนอกโปรเจกต์ที่: ${path.join(target, '.warnyin')}, ${path.join(target, '.claude', 'commands', 'warnyin')}, ${path.join(target, '.claude', 'CLAUDE.md')}\n`)
    // first-install overwrite:false (skip ของเดิมใน ~/.claude/{agents,skills}) — ทับเฉพาะ --global --update
    for (const dir of CORE) copyTree(dir, { overwrite: UPDATE, onFile })
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
    // CodeBuddy: plugin structure (IDE-owned folder → overwrite เมื่อ --update)
    installCodeBuddyPlugin()
  } else {
    target = cwd
    stampBefore = readStamp(target) // ★ ก่อน copyTree/writeVersionStamp (T11)
    console.log(`Warnyin Standard Workflow → ${target}${DRY ? '  (dry-run)' : ''}\n`)
    for (const dir of CORE) copyTree(dir, { overwrite: UPDATE, onFile })
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
    // CodeBuddy: plugin structure (IDE-owned folder → overwrite เมื่อ --update)
    installCodeBuddyPlugin()
  }

  // ★ เฟส prune จุดเดียว หลังปิด if/else (เขียน manifest เสมอ · prune เฉพาะ --update ที่ไม่ปิด — C11/C13)
  runPrunePhase({ mode, stampBefore, payloadNew })

  console.log(`\nสรุป: สร้างใหม่ ${stats.created} · อัปเดต ${stats.updated} · ข้าม (มีอยู่แล้ว) ${stats.skipped} · ลบ ${stats.pruned}`)

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
