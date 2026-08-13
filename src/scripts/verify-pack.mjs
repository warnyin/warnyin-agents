import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TEXT_EXT } from '../bin/cli.mjs'

// allowlist = safety net ชั้นสองของ package.json `files` — ดัก leak ชนิด "ใหม่" ที่ denylist จับไม่ได้
// narrow src/.claude/ → subdir ตรงกับ files (commands/agents/skills); กัน settings.local.json / subdir อื่นหลุดอนาคต
const ALLOWED_PREFIX = ['src/bin/', 'src/.warnyin/', 'src/.claude/commands/', 'src/.claude/agents/', 'src/.claude/skills/']
// Note: src/.warnyin/ ครอบ src/.warnyin/installer/templates/ อยู่แล้ว — ไม่ต้องเพิ่ม prefix แยก
// npm always-include: package.json / README / LICENSE / CHANGELOG + payload src/AGENTS.md (ต้องอยู่ใน list ไม่งั้น false-positive)
const ALLOWED_FILE = ['package.json', 'README.md', 'CHANGELOG.md', 'LICENSE', 'src/AGENTS.md']

// denylist = งานจริง/tooling/dogfood ที่ "ห้ามหลุด" ขึ้น package เด็ดขาด
// dev tooling + งานจริงของ repo ต้นทาง (installer สร้าง scaffold เปล่าเองตอนติดตั้ง)
const DENY_PREFIX = [
  'src/tests/', 'src/scripts/',           // dev tooling (R2)
  'docs/', '.github/',                     // งานจริง/CI ของ repo
  '.warnyin/', '.claude/',                 // root dogfood ที่ install ลงมา (topic นี้สร้างความเสี่ยงเอง)
]
const DENY_FILE = ['CLAUDE.md', 'AGENTS.md', 'settings.local.json'] // root dogfood doc + tripwire
// tripwire suffix: artifact/secret ที่ห้ามขึ้น package
const DENY_SUFFIX = ['.tgz']

// pure function — รับ file list (POSIX path จาก npm pack --json) คืน error[] (เทสได้โดยไม่เรียก npm pack)
export function checkFiles(files) {
  const errors = []

  // R1: nested dotfolder 2 ก้อนต้องติดทั้งคู่ (บทเรียน 0.6.0 ขยายผล — npm ไม่รวม nested dotfolder ถ้าไม่ระบุ)
  const hasWarnyin = files.some((p) => p.startsWith('src/.warnyin/workflow/'))
  const hasClaude = files.some((p) => p.startsWith('src/.claude/commands/warnyin/'))
  const hasSkills = files.some((p) => p.startsWith('src/.claude/skills/'))
  if (!hasWarnyin) errors.push('src/.warnyin/workflow/ ไม่ติดใน package (R1)')
  if (!hasClaude) errors.push('src/.claude/commands/warnyin/ ไม่ติดใน package (R1)')
  if (!hasSkills) errors.push('src/.claude/skills/ ไม่ติดใน package (R1)')

  // R1: template ที่ผู้ใช้ต้องได้ต้องติด tarball ด้วย (กัน gate ลวง — เดิม assert แค่ payload 3 ก้อน
  //     → template หาย = ผู้ใช้ได้ scaffold เปล่า แต่ gate ยังเขียว)
  const hasTemplateDocs = files.some((p) => p.startsWith('src/.warnyin/template/docs/'))
  if (!hasTemplateDocs) errors.push('src/.warnyin/template/docs/ ไม่ติดใน package (R1)')

  // denylist: งานจริง/tooling/dogfood/tripwire รั่ว
  for (const p of files) {
    const base = p.split('/').pop()
    if (DENY_PREFIX.some((d) => p.startsWith(d))) errors.push(`denylist รั่ว: ${p}`)
    else if (DENY_FILE.includes(base) && !p.includes('/')) errors.push(`denylist รั่ว (root dogfood): ${p}`)
    else if (base === 'settings.local.json') errors.push(`tripwire รั่ว: ${p}`)
    else if (DENY_SUFFIX.some((s) => p.endsWith(s))) errors.push(`tripwire รั่ว: ${p}`)
    else if (base.startsWith('.env')) errors.push(`tripwire รั่ว: ${p}`)
  }

  // allowlist: ไฟล์นอก allow ทั้งหมด (กัน leak ชนิดใหม่ที่ denylist ไม่ครอบ)
  for (const p of files) {
    const allowed = ALLOWED_PREFIX.some((x) => p.startsWith(x)) || ALLOWED_FILE.includes(p)
    if (!allowed) errors.push(`ไฟล์นอก allowlist: ${p}`)
  }

  return errors
}

/**
 * เลือก npm binary ตาม platform — ปิดทั้ง CVE-2024-27980 + PATH/CWD hijack ในที่เดียว
 * - mac/linux: ใช้ `npm` ตรง
 * - win32: ใช้ `process.execPath` (node) รัน `npm_execpath` ตรง (ไม่ผ่าน shell ไม่ใช้ `.cmd`)
 *   ถ้าไม่มี `npm_execpath` (รัน script ตรงไม่ผ่าน npm script) → คืน `null` (false-green guard)
 * @param {string} [platform=process.platform] — injectable สำหรับ unit test
 * @returns {{bin: string, prefix: string[]} | null}
 */
export function getNpmCmd(platform = process.platform) {
  if (platform === 'win32') {
    const npmExecPath = process.env.npm_execpath
    if (!npmExecPath) return null
    return { bin: process.execPath, prefix: [npmExecPath] }
  }
  return { bin: 'npm', prefix: [] }
}

/**
 * นับจำนวน 0x0D ใน Buffer — ใช้แทน `text.split('\r').length - 1` เพราะเร็วกว่า + กัน multi-byte false-positive
 * @param {Buffer} buf
 * @param {number} byte
 * @returns {number}
 */
function countBytes(buf, byte) {
  let n = 0
  for (let i = 0; i < buf.length; i++) if (buf[i] === byte) n++
  return n
}

/**
 * sanitize path ก่อนใส่ใน error string — กัน terminal escape injection + ANSI control
 * แทน control char (0x00-0x1F, 0x7F) ด้วย `?` (path จริงมาจาก npm pack POSIX แต่กันไว้)
 * @param {string} p
 * @returns {string}
 */
function sanitizePath(p) {
  // ใช้ JSON.stringify เพื่อ wrap quote + escape — แต่ลด escape เฉพาะ control char ด้วยตัวเองเพื่อ readability
  return p.replace(/[\x00-\x1f\x7f]/g, '?')
}

/**
 * EOL gate — ตรวจ text payload ว่าเป็น LF ล้วน (ไม่มี CR = 0x0D)
 * - ext ไม่อยู่ใน TEXT_EXT → skip (binary/unknown)
 * - buf === null (I/O ล้ม) → skip + warn upstream
 * - buf ว่าง → no error
 * - Buffer-level check (ไม่ decode UTF-8) — เร็วกว่า + กัน multi-byte codepoint ที่มี 0x0D เป็น byte หนึ่ง false-positive
 * @param {{path: string, buf: Buffer|null, ext: string}[]} entries
 * @returns {string[]} errors
 */
export function checkEol(entries) {
  const errors = []
  for (const { path: p, buf, ext } of entries) {
    if (!TEXT_EXT.has(ext)) continue
    if (buf === null) continue
    if (buf.length === 0) continue
    if (buf.includes(0x0d)) {
      const count = countBytes(buf, 0x0d)
      errors.push(`eol: ไฟล์ text มี CR ${count} ครั้ง (${sanitizePath(p)})`)
    }
  }
  return errors
}

/**
 * I/O helper สำหรับ EOL gate — อ่านไฟล์ text ใน payload พร้อม path guards + size cap
 * - path.isAbsolute → error `path: absolute path` (ไม่ read)
 * - segment `..` → error `path: มี segment ..` (ไม่ read)
 * - symlink (lstatSync.isSymbolicLink()) → error `path: symlink` (ไม่ read)
 * - size > 5 MB → buf=null + warn (กัน DoS + false-positive)
 * - I/O ล้ม (ENOENT/EACCES) → buf=null + ไม่ throw (gate robust)
 * @param {string[]} files — POSIX path จาก npm pack --json
 * @param {{readFile?: Function, root?: string, maxBytes?: number}} [opts={}]
 * @returns {{entries: {path: string, buf: Buffer|null, ext: string}[], errors: string[]}}
 */
export function readTextEntries(files, opts = {}) {
  const { readFile = readFileSync, root = process.cwd(), maxBytes = 5 * 1024 * 1024 } = opts
  const entries = []
  const errors = []
  for (const p of files) {
    // path guard ชั้น 1: absolute path (ไม่ควรมาจาก npm pack แต่ป้องกัน)
    if (path.isAbsolute(p)) {
      errors.push(`path: absolute path (${p})`)
      continue
    }
    // path guard ชั้น 2: segment .. (path traversal)
    if (p.split('/').includes('..')) {
      errors.push(`path: มี segment .. (${p})`)
      continue
    }
    const abs = path.resolve(root, p)
    // path guard ชั้น 3: symlink (lstatSync ไม่ follow symlink)
    let st
    try {
      st = fs.lstatSync(abs)
    } catch {
      // ไฟล์ไม่มีจริง (edge case — npm pack list มีแต่ checkout ไม่มี) → buf=null, ไม่ error
      entries.push({ path: p, buf: null, ext: path.extname(p).toLowerCase() })
      continue
    }
    if (st.isSymbolicLink()) {
      errors.push(`path: symlink (${p})`)
      continue
    }
    if (st.size > maxBytes) {
      // เกิน size cap → skip + warn (ไม่ false-positive จากไฟล์ใหญ่ที่มี 0x0D legitimately)
      entries.push({ path: p, buf: null, ext: path.extname(p).toLowerCase() })
      console.warn(`⚠ ข้าม EOL check (size ${st.size}): ${p}`)
      continue
    }
    try {
      entries.push({ path: p, buf: readFile(abs), ext: path.extname(p).toLowerCase() })
    } catch {
      // I/O ล้ม (EACCES ฯลฯ) → buf=null, ไม่ error (gate robust; dev ไม่ติด false-green)
      entries.push({ path: p, buf: null, ext: path.extname(p).toLowerCase() })
    }
  }
  return { entries, errors }
}

function main() {
  const cmd = getNpmCmd()
  if (!cmd) {
    console.error('✖ verify:pack: ต้องรันผ่าน `npm run verify:pack` เท่านั้น (Windows dev)')
    process.exit(1)
  }
  // --ignore-scripts กัน `prepack`/`prepare` lifecycle รัน (security + reproducibility)
  const args = [...cmd.prefix, 'pack', '--dry-run', '--json', '--ignore-scripts']
  const out = execFileSync(cmd.bin, args, { encoding: 'utf8' })
  const files = JSON.parse(out)[0].files.map((f) => f.path)

  // EOL check: เฉพาะ allowlist-passed set (path guards ทำใน readTextEntries)
  const allowed = files.filter(
    (p) => ALLOWED_PREFIX.some((x) => p.startsWith(x)) || ALLOWED_FILE.includes(p),
  )

  const existingErrors = checkFiles(files) // signature เดิม — purity contract คง
  const { entries: eolEntries, errors: pathErrors } = readTextEntries(allowed)
  const eolErrors = checkEol(eolEntries)

  const allErrors = [...existingErrors, ...pathErrors, ...eolErrors]
  if (allErrors.length) {
    console.error('✖ pack-verify ล้มเหลว:')
    for (const e of allErrors) console.error('  ✖', e)
    process.exit(1)
  }
  console.log('✓ pack-verify ผ่าน:', files.length, 'ไฟล์')
}

// main-guard: รันเฉพาะเมื่อ execute ตรง (ไม่ใช่ตอน import จาก unit test) — กัน import trigger npm pack
// ใช้ argv[1] comparison (ไม่ใช่ import.meta.main ที่ undefined บน node 20)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main()
}
