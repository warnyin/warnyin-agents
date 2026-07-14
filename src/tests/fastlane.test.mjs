// Structural / canonical / consistency test สำหรับ feature fastlane (task fastlane-test-release)
// spec: docs/stages/fastlane/tasks/fastlane-test-release/spec.md §7 กลุ่ม B-F
// node ล้วน cross-platform — ห้ามเรียก shell grep/rg, ห้าม t.skip() (pass-count gate: pass===tests)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// path จาก src/tests/ → repo root (pattern เดียวกับ installer.test.mjs)
const root = fileURLToPath(new URL('../../', import.meta.url))
const workflowDir = path.join(root, 'src', '.warnyin', 'workflow')
const stagesDir = path.join(workflowDir, 'stages')
const fastlanePath = path.join(workflowDir, 'fastlane.md')
const triagePath = path.join(workflowDir, 'triage.md')
const commandsDir = path.join(root, 'src', '.claude', 'commands', 'warnyin')
const fastlaneCmdPath = path.join(commandsDir, 'fastlane.md')
const triageCmdPath = path.join(commandsDir, 'triage.md')
const skillsDir = path.join(root, 'src', '.claude', 'skills')

const fastlaneContent = readFileSync(fastlanePath, 'utf8')
const triageContent = readFileSync(triagePath, 'utf8')

// walker: เก็บทุกไฟล์ .md ใต้ dir (recursive) — คืน [{file (relative ต่อ root), content}]
// เขียนเอง (ไม่พึ่ง readdirSync({recursive:true}) ของ node 20+) ให้ตรง pattern listFiles ใน installer.test.mjs
function walkMd(dir, base = root, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      walkMd(full, base, acc)
    } else if (e.name.endsWith('.md')) {
      acc.push({ file: path.relative(base, full), content: readFileSync(full, 'utf8') })
    }
  }
  return acc
}

// slugify heading แบบ GitHub-style (พอสำหรับ heading ASCII ของ repo นี้)
function slugifyHeading(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

// ─────────────────────────────────────────────────────────────
// B. canonical falsifiable (negative-grep ด้วย node:fs)
// ─────────────────────────────────────────────────────────────

test('B1. canonical "pre-flight: สร้าง receipt.md จาก template" อยู่ที่ triage.md ไฟล์เดียว', () => {
  const NEEDLE = 'pre-flight: สร้าง `receipt.md` จาก template'
  const hits = walkMd(workflowDir).filter((f) => f.content.includes(NEEDLE))
  const hitFiles = hits.map((h) => h.file)
  assert.equal(hits.length, 1, `พบ canonical ใน [${hitFiles.join(', ')}] — ต้องมีไฟล์เดียว`)
  assert.equal(
    hitFiles[0],
    path.join('src', '.warnyin', 'workflow', 'triage.md'),
    `canonical ต้องอยู่ที่ triage.md เท่านั้น — เจอที่ ${hitFiles[0]}`,
  )
})

test('B2. fastlane.md ไม่ลอกรายชื่อ 5 หมวด hard-floor แบบเต็ม (ต้องชี้ triage.md แทน)', () => {
  const HARD_FLOOR_TOKENS = ['auth/authz', 'data-migration', 'secret', 'public-API', 'security-sensitive']
  const missing = HARD_FLOOR_TOKENS.filter((tok) => !fastlaneContent.includes(tok))
  assert.ok(
    missing.length > 0,
    'fastlane.md มี token ครบทั้ง 5 หมวดของ hard-floor ในไฟล์เดียว — ต้องเป็น pointer ไปที่ triage.md แทนการลอกรายชื่อเต็ม',
  )
})

test('B3. fastlane.md ไม่ prose-duplicate คู่คำ config-protection + investigate-before-edit ของ BUILD floor', () => {
  const hasBoth = fastlaneContent.includes('config-protection') && fastlaneContent.includes('investigate-before-edit')
  assert.equal(
    hasBoth,
    false,
    'fastlane.md มีคำคู่ config-protection + investigate-before-edit พร้อมกัน — เป็น prose-duplication ของ BUILD floor ต้องเป็น pointer ไป stages/build.md แทน',
  )
})

// ─────────────────────────────────────────────────────────────
// C. anchor structural (lint-md ตัด anchor ทิ้ง → เช็คเอง)
// ─────────────────────────────────────────────────────────────

test('C1. link ...triage.md#fast-track-skip-list resolve ไปยัง heading จริงใน triage.md', () => {
  const linkRe = /\]\([^)]*triage\.md#fast-track-skip-list\)/
  const linkingFiles = walkMd(workflowDir).filter((f) => linkRe.test(f.content))
  assert.ok(
    linkingFiles.length > 0,
    'ต้องมีไฟล์อย่างน้อย 1 ไฟล์ใต้ src/.warnyin/workflow/ ที่ลิงก์ไป triage.md#fast-track-skip-list',
  )

  const headingRe = /^#{1,6}\s+(.+)$/gm
  const headings = [...triageContent.matchAll(headingRe)].map((m) => m[1])
  const slugs = headings.map(slugifyHeading)
  assert.ok(
    slugs.includes('fast-track-skip-list'),
    `triage.md ต้องมี heading ที่ slugify แล้วได้ fast-track-skip-list — heading ที่เจอ: [${headings.join(', ')}]`,
  )
})

// ─────────────────────────────────────────────────────────────
// D. consistency (contract C4 — คำต่อคำ)
// ─────────────────────────────────────────────────────────────

// declare canonical string ครั้งเดียว (const) แล้ววนเช็คทุก consumer — กัน string เพี้ยนในตัว test เอง
const C4 =
  'รันงานขนาด fast จบในคำสั่งเดียว — บังคับ tier=fast: แก้โค้ดจน test เขียว + acceptance ผ่าน → receipt → ship-lite + archive'

test('D1. C4 อยู่ใน frontmatter description ของ command fastlane.md คำต่อคำ', () => {
  const content = readFileSync(fastlaneCmdPath, 'utf8')
  assert.ok(
    content.includes(`description: ${C4}`),
    `frontmatter description ของ ${path.relative(root, fastlaneCmdPath)} ต้องเป็น C4 คำต่อคำ`,
  )
})

// C4 = user-facing command description → ต้องตรงคำต่อคำเฉพาะ registry ที่ user เห็น (slash-command list)
// README.md เป็น capability tree (dev-facing — format `file.md # capability: NAME — ...`) คนละ concern → เช็คแค่ entry presence
test('D2. C4 ปรากฏคำต่อคำใน command-list registry (CLAUDE.md + codebuddy-rules.md template)', () => {
  const REGISTRY = [
    path.join(root, 'src', '.warnyin', 'installer', 'templates', 'CLAUDE.md'),
    path.join(root, 'src', '.warnyin', 'installer', 'templates', 'codebuddy-rules.md'),
  ]
  for (const f of REGISTRY) {
    const content = readFileSync(f, 'utf8')
    assert.ok(content.includes(C4), `${path.relative(root, f)} ต้องมี C4 คำต่อคำ — ไม่พบ`)
  }
})

test('D3. README capability tree มี entry fastlane.md (capability FASTLANE)', () => {
  const readme = readFileSync(path.join(workflowDir, 'README.md'), 'utf8')
  assert.match(
    readme,
    /fastlane\.md\s+#\s+capability: FASTLANE/,
    'src/.warnyin/workflow/README.md capability tree ต้องมี entry fastlane.md',
  )
})

// ─────────────────────────────────────────────────────────────
// E. ordering proxy (acceptance ประกาศก่อนแก้ — กัน goalpost moving)
// ─────────────────────────────────────────────────────────────

test('E1. step "เขียน receipt … §1 + §2" มาก่อน step "แก้โค้ด" ใน fastlane.md', () => {
  const lines = fastlaneContent.split('\n')
  const idxReceipt = lines.findIndex((l) => l.includes('เขียน receipt') && l.includes('§1') && l.includes('§2'))
  const idxCode = lines.findIndex((l) => l.includes('แก้โค้ด'))
  assert.ok(idxReceipt >= 0, 'ไม่เจอบรรทัด step "เขียน receipt … §1 + §2" ใน fastlane.md')
  assert.ok(idxCode >= 0, 'ไม่เจอบรรทัด step "แก้โค้ด" ใน fastlane.md')
  assert.ok(
    idxReceipt < idxCode,
    `ลำดับผิด — เขียน receipt (บรรทัด ${idxReceipt}) ต้องมาก่อน แก้โค้ด (บรรทัด ${idxCode})`,
  )
})

// ─────────────────────────────────────────────────────────────
// F. regression
// ─────────────────────────────────────────────────────────────

const STAGE_FILES = ['design.md', 'build.md', 'verify.md', 'ship.md'].map((f) => path.join(stagesDir, f))

test('F1. stage ทั้ง 4 ไฟล์ยังมี link [fast-track skip-list](../triage.md#fast-track-skip-list)', () => {
  for (const f of STAGE_FILES) {
    const content = readFileSync(f, 'utf8')
    assert.ok(
      content.includes('(../triage.md#fast-track-skip-list)'),
      `${path.relative(root, f)} ต้องมี link ../triage.md#fast-track-skip-list`,
    )
  }
})

test('F2. stage ทั้ง 4 ไฟล์ไม่มีตาราง skip-list inline (ไม่ duplicate header row จาก triage.md)', () => {
  const HEADER_ROW = '| stage | fast-track ทำ | คงไว้ (correctness floor) |'
  for (const f of STAGE_FILES) {
    const content = readFileSync(f, 'utf8')
    assert.ok(
      !content.includes(HEADER_ROW),
      `${path.relative(root, f)} มีตาราง skip-list inline — ต้องเป็น pointer ไป triage.md แทน`,
    )
  }
})

test('F3. adapter command triage.md ยัง read-only — มี "แนะนำแล้วหยุด" + 0 write-intent', () => {
  const content = readFileSync(triageCmdPath, 'utf8')
  assert.ok(content.includes('แนะนำแล้วหยุด'), 'triage.md command ต้องมีคำว่า "แนะนำแล้วหยุด"')

  // write-intent = คำสั่งเชิง action ที่บ่งบอกว่ามีการเขียนไฟล์จริง (ตรงข้ามกับ read-only)
  const WRITE_INTENT_TOKENS = ['เขียน receipt', 'สร้าง `receipt.md`', 'archive', 'ship-lite', 'commit เอง']
  const found = WRITE_INTENT_TOKENS.filter((tok) => content.includes(tok))
  assert.deepEqual(found, [], `triage.md command มี write-intent token: [${found.join(', ')}] — ต้อง 0`)
})

test('F4. src/.claude/skills ไม่มี entry ชื่อ fastlane (เจตนา command-only — ห้าม auto-invoke)', () => {
  const entries = readdirSync(skillsDir, { withFileTypes: true }).map((e) => e.name)
  assert.ok(!entries.includes('fastlane'), `src/.claude/skills ต้องไม่มี "fastlane" — เจอ: [${entries.join(', ')}]`)
})
