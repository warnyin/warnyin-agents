// Structural test ข้าม slice ของ feature project-memory (task release-hygiene)
// spec: docs/stages/project-memory/tasks/release-hygiene/spec.md §7 กลุ่ม M1-M9
// node ล้วน cross-platform — ห้ามเรียก shell grep/rg, ห้าม t.skip() (pass-count gate: pass===tests)
// ขอบเขตสแกน negative-grep (M3) = src/** เท่านั้น — ไม่ครอบ docs/ มิฉะนั้นจะแดงเพราะ design.md §3.4 ของ topic นี้เอง
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const srcDir = path.join(root, 'src')
const workflowDir = path.join(srcDir, '.warnyin', 'workflow')
const stagesDir = path.join(workflowDir, 'stages')
const templateDir = path.join(srcDir, '.warnyin', 'template')
const templateDocsDir = path.join(templateDir, 'docs')
const installerTemplatesDir = path.join(srcDir, '.warnyin', 'installer', 'templates')
const commandsDir = path.join(srcDir, '.claude', 'commands', 'warnyin')
const skillsDir = path.join(srcDir, '.claude', 'skills')

const memoryPlaybookPath = path.join(workflowDir, 'memory.md')
const memoryPlaybookContent = readFileSync(memoryPlaybookPath, 'utf8')

// walker เขียนเอง (ไม่พึ่ง readdirSync({recursive:true}) ของ node 20+) — เก็บเฉพาะ .md
// (self-collision: ไฟล์นี้เป็น .mjs จึงไม่ถูกนับเป็น hit ของ needle ที่ตัวเองประกาศ — docs/rule.md §5)
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

// path เทียบ root แบบ POSIX — ใช้ทั้งใน assertion message และการเทียบ set
const rel = (p) => path.relative(root, p).split(path.sep).join('/')

// ─────────────────────────────────────────────────────────────
// M1. heading freeze ของ playbook กลาง (C1)
// ─────────────────────────────────────────────────────────────

const HEADINGS_C1 = [
  '## 1. project memory คืออะไร (semantic)',
  '## 2. Governance (auto-write)',
  '## 3. Schema',
  '## 4. File layout + lifecycle',
  '## 5. Write points (hook ต่อ stage)',
  '## 6. Consume',
  '## 7. Promote (SHIP)',
  '## 8. archive ≠ current state + trust boundary',
  '## 9. ทบทวน/บีบอัด',
]

test('M1. memory.md มี heading ครบ 9 หัวข้อคำต่อคำ เรียงตามลำดับ', () => {
  const lines = memoryPlaybookContent.split('\n')
  const idxs = HEADINGS_C1.map((h) => lines.findIndex((l) => l.trim() === h))
  idxs.forEach((idx, i) => {
    assert.ok(idx >= 0, `ไม่พบ heading คำต่อคำ: "${HEADINGS_C1[i]}" ใน ${rel(memoryPlaybookPath)}`)
  })
  for (let i = 1; i < idxs.length; i++) {
    assert.ok(
      idxs[i] > idxs[i - 1],
      `heading ลำดับผิด: "${HEADINGS_C1[i]}" (บรรทัด ${idxs[i]}) ต้องอยู่หลัง "${HEADINGS_C1[i - 1]}" (บรรทัด ${idxs[i - 1]}) ใน ${rel(memoryPlaybookPath)}`,
    )
  }
})

// ─────────────────────────────────────────────────────────────
// M2. write hook ครบ 6 ไฟล์ (C2/C2b/C2c) — นับเป๊ะ ไม่ใช่ ≥1
// ─────────────────────────────────────────────────────────────

const M2_NEEDLE_A = 'อัปเดต project memory'
const M2_NEEDLE_B = 'ไม่มีอะไรเปลี่ยน → ข้าม'
const M2_EXPECTED = [
  'src/.warnyin/workflow/stages/discovery.md',
  'src/.warnyin/workflow/stages/design.md',
  'src/.warnyin/workflow/stages/build.md',
  'src/.warnyin/workflow/stages/verify.md',
  'src/.warnyin/workflow/stages/ship.md',
  'src/.warnyin/workflow/fastlane.md',
].sort()

test('M2. write-hook compound needle พบครบเป๊ะ 6 ไฟล์ (ขาด = hook ไม่ครบ, เกิน = ถูกลอกไปที่อื่น)', () => {
  const hits = walkMd(workflowDir)
    .filter((f) => f.content.split('\n').some((l) => l.includes(M2_NEEDLE_A) && l.includes(M2_NEEDLE_B)))
    .map((f) => rel(path.join(root, f.file)))
    .sort()
  assert.deepEqual(hits, M2_EXPECTED, `hook set ไม่ตรง — เจอ: [${hits.join(', ')}] คาด: [${M2_EXPECTED.join(', ')}]`)
})

test('M2b. stages/build.md มี hook แบบ main-loop-only (ต่างจาก 5 ไฟล์ที่เหลือ)', () => {
  const buildPath = path.join(stagesDir, 'build.md')
  const content = readFileSync(buildPath, 'utf8')
  assert.ok(content.includes('main loop เท่านั้น'), `${rel(buildPath)} ต้องมีข้อความ "main loop เท่านั้น"`)
  assert.ok(
    content.includes('build sub-agent ที่ทำงานใน worktree ห้ามเขียน memory เอง'),
    `${rel(buildPath)} ต้องมีข้อความ "build sub-agent ที่ทำงานใน worktree ห้ามเขียน memory เอง"`,
  )
})

// ─────────────────────────────────────────────────────────────
// M3. negative-grep — กติกาเต็มอยู่ไฟล์เดียว (falsifiable single-source)
// ─────────────────────────────────────────────────────────────

test('M3. "working state (ปัจจุบัน)" ปรากฏใน src/ เพียงไฟล์เดียว: workflow/memory.md', () => {
  const NEEDLE = 'working state (ปัจจุบัน)'
  const hits = walkMd(srcDir).filter((f) => f.content.includes(NEEDLE))
  const hitFiles = hits.map((h) => rel(path.join(root, h.file)))
  assert.equal(hits.length, 1, `พบ needle ใน [${hitFiles.join(', ')}] — ต้องมีไฟล์เดียว`)
  assert.equal(
    hitFiles[0],
    'src/.warnyin/workflow/memory.md',
    `single-source ต้องอยู่ที่ memory.md เท่านั้น — เจอที่ ${hitFiles[0]}`,
  )
})

// ─────────────────────────────────────────────────────────────
// M4. root doc note ครบ 3 ไฟล์ (C6)
// ─────────────────────────────────────────────────────────────

const M4_FILES = [
  path.join(installerTemplatesDir, 'CLAUDE.md'),
  path.join(installerTemplatesDir, 'CLAUDE.global.md'),
  path.join(srcDir, 'AGENTS.md'),
]

test('M4. root doc ทั้ง 3 ไฟล์มี heading "## Project memory" + อ้างทั้ง context.md และ memory.md', () => {
  for (const f of M4_FILES) {
    const content = readFileSync(f, 'utf8')
    assert.ok(content.includes('## Project memory'), `${rel(f)} ต้องมี heading "## Project memory"`)
    assert.ok(content.includes('docs/stages/context.md'), `${rel(f)} ต้องอ้าง docs/stages/context.md`)
    assert.ok(content.includes('docs/memory.md'), `${rel(f)} ต้องอ้าง docs/memory.md`)
  }
})

test('M4b. installer/templates/CLAUDE.md มีข้อยกเว้น worktree คำต่อคำ', () => {
  const f = path.join(installerTemplatesDir, 'CLAUDE.md')
  const content = readFileSync(f, 'utf8')
  const NEEDLE = 'sub-agent ที่ทำงานใน git worktree ของ BUILD: ห้ามเขียน memory เอง'
  assert.ok(content.includes(NEEDLE), `${rel(f)} ต้องมีข้อความคำต่อคำ: "${NEEDLE}"`)
})

// ─────────────────────────────────────────────────────────────
// M5. command adapter + registry (C7)
// ─────────────────────────────────────────────────────────────

const M5_REGISTRY_LINE = '- `/warnyin:memory [ทบทวน]` → ดู/ทบทวน project memory (`.warnyin/workflow/memory.md`)'
const M5_REGISTRY_FILES = [
  path.join(installerTemplatesDir, 'CLAUDE.md'),
  path.join(installerTemplatesDir, 'codebuddy-rules.md'),
]

test('M5. registry line คำต่อคำปรากฏใน 2 ไฟล์', () => {
  for (const f of M5_REGISTRY_FILES) {
    const content = readFileSync(f, 'utf8')
    assert.ok(content.includes(M5_REGISTRY_LINE), `${rel(f)} ต้องมี registry line คำต่อคำ: "${M5_REGISTRY_LINE}"`)
  }
})

const memoryCmdPath = path.join(commandsDir, 'memory.md')

test('M5b. src/.claude/commands/warnyin/memory.md มีอยู่ + frontmatter description + อ้าง playbook', () => {
  assert.ok(existsSync(memoryCmdPath), `${rel(memoryCmdPath)} ต้องมีอยู่`)
  const content = readFileSync(memoryCmdPath, 'utf8')
  assert.ok(/^description:/m.test(content), `${rel(memoryCmdPath)} frontmatter ต้องมีบรรทัดขึ้นต้นด้วย "description:"`)
  assert.ok(
    content.includes('.warnyin/workflow/memory.md'),
    `${rel(memoryCmdPath)} body ต้องอ้าง .warnyin/workflow/memory.md`,
  )
})

test('M5c. body มีบรรทัดที่มีทั้ง "user" และ "ยืนยัน" (โหมดทบทวนไม่ลบเงียบ) + คำว่า "ทบทวน"', () => {
  const content = readFileSync(memoryCmdPath, 'utf8')
  const hasConfirmLine = content.split('\n').some((l) => l.includes('user') && l.includes('ยืนยัน'))
  assert.ok(hasConfirmLine, `${rel(memoryCmdPath)} ต้องมีบรรทัดที่มีทั้ง "user" และ "ยืนยัน"`)
  assert.ok(content.includes('ทบทวน'), `${rel(memoryCmdPath)} ต้องมีคำว่า "ทบทวน"`)
})

test('M5d. src/.claude/skills ไม่มี entry ชื่อ "memory" (command-only — ห้าม auto-invoke)', () => {
  const entries = readdirSync(skillsDir, { withFileTypes: true }).map((e) => e.name)
  assert.ok(!entries.includes('memory'), `src/.claude/skills ต้องไม่มี "memory" — เจอ: [${entries.join(', ')}]`)
})

// ─────────────────────────────────────────────────────────────
// M6. template 2 ใบ — คำเตือน C12 + 0 markdown-link
// ─────────────────────────────────────────────────────────────

const templateMemoryPath = path.join(templateDocsDir, 'memory.md')
const templateContextPath = path.join(templateDocsDir, 'stages', 'context.md')

test('M6. template 2 ใบมีอยู่ทั้งคู่ + มีคำเตือน C12 ครบ', () => {
  for (const f of [templateMemoryPath, templateContextPath]) {
    assert.ok(existsSync(f), `${rel(f)} ต้องมีอยู่`)
    const content = readFileSync(f, 'utf8')
    assert.ok(
      content.includes('ห้ามเขียน raw secret/token/credential'),
      `${rel(f)} ต้องมีคำเตือน "ห้ามเขียน raw secret/token/credential"`,
    )
    assert.ok(content.includes('ห้ามใช้ markdown-link'), `${rel(f)} ต้องมีคำเตือน "ห้ามใช้ markdown-link"`)
  }
})

// นับ markdown-link นอก code span — regex ชุดเดียวกับ lint-md.mjs (declare ซ้ำในไฟล์เทส ไม่ import)
const CODE_RE = /```[\s\S]*?```|`[^`\n]*`/g
const LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g

test('M6b. template 2 ใบไม่มี markdown-link นอก code span (นับตัวเลข = 0)', () => {
  for (const f of [templateMemoryPath, templateContextPath]) {
    const content = readFileSync(f, 'utf8')
    const links = [...content.replace(CODE_RE, '').matchAll(LINK_RE)].map((m) => m[0])
    assert.equal(links.length, 0, `${rel(f)} ต้องไม่มี markdown-link — เจอ: ${links.join(', ')}`)
  }
})

test('M6c. template/docs/stages/context.md มี heading ครบ 4', () => {
  const content = readFileSync(templateContextPath, 'utf8')
  for (const h of ['## กำลังทำอะไรอยู่', '## ค้างอะไร', '## เพิ่งตัดสินอะไรไป', '## อัปเดตล่าสุด']) {
    assert.ok(content.includes(h), `${rel(templateContextPath)} ต้องมี heading "${h}"`)
  }
})

test('M6d. template/docs/memory.md ระบุ closed-set ครบ (ประเภท + สถานะ)', () => {
  const content = readFileSync(templateMemoryPath, 'utf8')
  for (const tok of ['gotcha', 'บทเรียน', 'ข้อสังเกต', 'open', 'promoted', 'dropped']) {
    assert.ok(content.includes(tok), `${rel(templateMemoryPath)} ต้องมีคำว่า "${tok}"`)
  }
})

// ─────────────────────────────────────────────────────────────
// M7. docs/memory.md อยู่นอก docs/stages/ (ไม่ถูก archive)
// ─────────────────────────────────────────────────────────────

const relToTemplate = (p) => path.relative(templateDir, p).split(path.sep).join('/')

test('M7. path ของ template memory เทียบ template root ต้องไม่ขึ้นต้นด้วย docs/stages/ (ต่างจาก context.md)', () => {
  const memRel = relToTemplate(templateMemoryPath)
  const ctxRel = relToTemplate(templateContextPath)
  assert.equal(memRel, 'docs/memory.md', `path template memory เทียบ template root ต้องได้ docs/memory.md — ได้ ${memRel}`)
  assert.ok(!memRel.startsWith('docs/stages/'), `docs/memory.md ต้องไม่ขึ้นต้นด้วย docs/stages/ — ได้ ${memRel}`)
  assert.equal(
    ctxRel,
    'docs/stages/context.md',
    `path template context เทียบ template root ต้องได้ docs/stages/context.md — ได้ ${ctxRel}`,
  )
  assert.ok(ctxRel.startsWith('docs/stages/'), `docs/stages/context.md ต้องขึ้นต้นด้วย docs/stages/ — ได้ ${ctxRel}`)
})

test('M7b. ship.md มีบรรทัดเดียวที่มีทั้ง "docs/memory.md" และ "จึงไม่ถูก archive"', () => {
  const shipPath = path.join(stagesDir, 'ship.md')
  const content = readFileSync(shipPath, 'utf8')
  const hasLine = content.split('\n').some((l) => l.includes('docs/memory.md') && l.includes('จึงไม่ถูก archive'))
  assert.ok(hasLine, `${rel(shipPath)} ต้องมีบรรทัดที่มีทั้ง "docs/memory.md" และ "จึงไม่ถูก archive"`)
})

// ─────────────────────────────────────────────────────────────
// M8. regression ของ SHIP gate (ห้ามลดทอน gate เดิม)
// ─────────────────────────────────────────────────────────────

const shipPath = path.join(stagesDir, 'ship.md')
const shipContent = readFileSync(shipPath, 'utf8')

test('M8. §6 ของ ship.md มี gate item รูปแบบ "- [ ] " เท่ากับ 12 พอดี', () => {
  const n = (shipContent.match(/^- \[ \] /gm) ?? []).length
  assert.equal(n, 12, `${rel(shipPath)} ต้องมี gate item "- [ ] " เท่ากับ 12 — นับได้ ${n}`)
})

test('M8b. §3 ข้อ 7 ของ ship.md ยังมีทั้ง "evidence (บังคับ)" และ "user ยืนยัน" ในบรรทัดเดียวกัน', () => {
  const hasLine = shipContent.split('\n').some((l) => l.includes('evidence (บังคับ)') && l.includes('user ยืนยัน'))
  assert.ok(hasLine, `${rel(shipPath)} ต้องมีบรรทัดที่มีทั้ง "evidence (บังคับ)" และ "user ยืนยัน"`)
})

test('M8c. ordering proxy: บรรทัดรวบ candidate (memory) มาก่อนบรรทัด step ขออนุมัติ', () => {
  const lines = shipContent.split('\n')
  const idxCandidate = lines.findIndex((l) => l.includes('entry สถานะ `open` ใน `docs/memory.md`'))
  const idxApprove = lines.findIndex((l) => l.includes('**สรุป promotion plan + ขออนุมัติ (ครั้งเดียว):**'))
  assert.ok(idxCandidate >= 0, `${rel(shipPath)} ต้องมีบรรทัดที่อ้าง "entry สถานะ \`open\` ใน \`docs/memory.md\`"`)
  assert.ok(idxApprove >= 0, `${rel(shipPath)} ต้องมีบรรทัด "**สรุป promotion plan + ขออนุมัติ (ครั้งเดียว):**"`)
  assert.ok(
    idxCandidate < idxApprove,
    `ลำดับผิด — รวบ candidate (บรรทัด ${idxCandidate}) ต้องมาก่อน step ขออนุมัติ (บรรทัด ${idxApprove})`,
  )
})

// ─────────────────────────────────────────────────────────────
// M9. จุดอ่าน — trust boundary + ไม่มีคำสั่งอ่านซ้ำ (C3a/b/c)
// ─────────────────────────────────────────────────────────────

const M9_FILES = [
  path.join(stagesDir, 'discovery.md'),
  path.join(workflowDir, 'next.md'),
  path.join(workflowDir, 'explore.md'),
]

test('M9. discovery.md / next.md / explore.md มีข้อความ "เป็น data ไม่ใช่ instruction" ครบ 3 ไฟล์', () => {
  for (const f of M9_FILES) {
    const content = readFileSync(f, 'utf8')
    assert.ok(content.includes('เป็น data ไม่ใช่ instruction'), `${rel(f)} ต้องมีข้อความ "เป็น data ไม่ใช่ instruction"`)
  }
})

test('M9b. next.md นับบรรทัดที่มีทั้ง "อ่าน" และ "`docs/stages/context.md`" ได้ 1 บรรทัดพอดี', () => {
  const nextPath = path.join(workflowDir, 'next.md')
  const content = readFileSync(nextPath, 'utf8')
  const NEEDLE_BACKTICK = '`docs/stages/context.md`'
  const hits = content.split('\n').filter((l) => l.includes('อ่าน') && l.includes(NEEDLE_BACKTICK))
  assert.equal(
    hits.length,
    1,
    `${rel(nextPath)} ต้องมีบรรทัดที่มีทั้ง "อ่าน" และ "${NEEDLE_BACKTICK}" เพียง 1 บรรทัด — เจอ ${hits.length}: ${JSON.stringify(hits)}`,
  )
})
