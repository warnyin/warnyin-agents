// Unit + executable test ของ validate-topic.mjs (structural validator)
// unit: feed Map/string ปลอม เข้า pure fn (checkTopic/checkFeatureSpec) — ไม่แตะ fs จริง
// executable: spawn script จริงบน fixture ใน temp (mirror installer.test harness — copy ไม่ import; defer #3)
// zero-dependency: ใช้เฉพาะ built-in node:*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkTopic, checkFeatureSpec, checkCaps, parseTier } from '../.warnyin/workflow/scripts/validate-topic.mjs'

// ── template จริงที่ shipped (source of truth ของโครง artifact) ──────────────
// อ่านไฟล์จริงแทน fixture เขียนเอง — กันกรณี "แก้ให้ผ่าน fixture แต่ template จริงยังหลุด"
const TEMPLATE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.warnyin', 'template', 'stages', '[topic]')
const readTemplate = (name) => readFileSync(path.join(TEMPLATE_DIR, name), 'utf8')

// ── helpers (unit) ──────────────────────────────────────────────────────────
// H1 filled = บรรทัดแรกไม่มี <...>; template H1 = มี <...>
const FILLED_H1 = '# Design — งานจริง\n'
const TEMPLATE_H1 = '# Design — <ชื่อ change>\n'

// หา issue ตาม code/level
const byCode = (issues, code) => issues.filter((i) => i.code === code)
const hasError = (issues, code) => issues.some((i) => i.code === code && i.level === 'error')
const hasWarn = (issues, code) => issues.some((i) => i.code === code && i.level === 'warn')

// สร้าง ship.md ที่ filled พร้อมตาราง learned-rules
function shipWith(rows) {
  return [
    '# Ship — งานจริง',
    '',
    '## 3. Learned rules (planned + emergent)',
    '',
    '| rule | evidence | scope | promote? |',
    '|---|---|---|---|',
    ...rows,
    '',
    '## 4. Archive',
  ].join('\n')
}

// ── C2: tasks ครบ/ขาด/ว่าง/skip [...] ───────────────────────────────────────
test('C2: tasks ครบ 4 ไฟล์ → ไม่มี ✖ C2', () => {
  const files = new Map([
    ['tasks/foo/spec.md', 'x'],
    ['tasks/foo/standard.md', 'x'],
    ['tasks/foo/rule.md', 'x'],
    ['tasks/foo/task.md', 'x'],
  ])
  const { issues } = checkTopic(files)
  assert.equal(byCode(issues, 'C2').length, 0)
})

test('C2: ขาด rule.md → ✖ [C2] ระบุไฟล์', () => {
  const files = new Map([
    ['tasks/foo/spec.md', 'x'],
    ['tasks/foo/standard.md', 'x'],
    ['tasks/foo/task.md', 'x'],
  ])
  const { issues } = checkTopic(files)
  const c2 = byCode(issues, 'C2')
  assert.equal(c2.length, 1)
  assert.equal(c2[0].level, 'error')
  assert.ok(c2[0].msg.includes('rule.md'), `ต้องระบุ rule.md: ${c2[0].msg}`)
})

test('C2: tasks/ ว่าง/ไม่มี dir → ไม่ crash ไม่ false-fail', () => {
  const { issues } = checkTopic(new Map())
  assert.equal(byCode(issues, 'C2').length, 0)
})

test('C2: โฟลเดอร์ [task-name] (template) ถูก skip', () => {
  const files = new Map([
    ['tasks/[task-name]/spec.md', 'x'], // ขาด 3 ไฟล์ แต่ต้อง skip
  ])
  const { issues } = checkTopic(files)
  assert.equal(byCode(issues, 'C2').length, 0)
})

// ── C3: ship template-skip / header-only / data-row ─────────────────────────
test('C3: ship.md ยัง template H1 → ข้าม (chicken-egg, ไม่ ✖)', () => {
  const files = new Map([['ship.md', '# Ship — <ชื่อ topic>\n\n## 3. Learned rules\n\n| r | e | s | p |\n|---|---|---|---|\n| | | | |\n']])
  const { issues } = checkTopic(files)
  assert.equal(byCode(issues, 'C3').length, 0)
})

test('C3: ship เริ่มเติมแต่มีแค่ header/row ว่าง → ✖ [C3]', () => {
  const files = new Map([['ship.md', shipWith(['| | | | |'])]])
  const { issues } = checkTopic(files)
  assert.ok(hasError(issues, 'C3'), 'ต้องมี ✖ C3 เมื่อไม่มี data row จริง')
})

test('C3: ship เริ่มเติมขาด section Learned rules → ✖ [C3]', () => {
  const files = new Map([['ship.md', '# Ship — งานจริง\n\n## 1. สรุป\nx\n']])
  const { issues } = checkTopic(files)
  assert.ok(hasError(issues, 'C3'), 'ต้องมี ✖ C3 เมื่อขาด section')
})

test('C3: ship มี data row จริง → ไม่มี ✖ C3', () => {
  const files = new Map([['ship.md', shipWith(['| zero-dep gate | lint-md.mjs:23 | project | ✅ |'])]])
  const { issues } = checkTopic(files)
  assert.equal(byCode(issues, 'C3').length, 0)
})

// ── C5: checkFeatureSpec — no-scenario / no-WHEN / ครบ / no-requirement ──────
test('C5: ครบ GIVEN/WHEN/THEN (case-insensitive) → ไม่มี ✖', () => {
  const content = [
    '# Spec',
    '## Requirement: ทำ X',
    'paragraph คั่น',
    '### Scenario: ทำได้',
    '- given a',
    '- When b',
    '- THEN c',
  ].join('\n')
  assert.deepEqual(checkFeatureSpec('f.md', content), [])
})

test('C5: Requirement ไม่มี Scenario → ✖', () => {
  const content = '# Spec\n## Requirement: ทำ X\nเนื้อหาเฉย ๆ ไม่มี scenario\n'
  const issues = checkFeatureSpec('f.md', content)
  assert.ok(hasError(issues, 'C5'))
  assert.ok(issues[0].msg.includes('Scenario'), issues[0].msg)
})

test('C5: Scenario ขาด WHEN → ✖ ระบุ WHEN', () => {
  const content = [
    '# Spec',
    '## Requirement: ทำ X',
    '### Scenario: ขาด when',
    '- GIVEN a',
    '- THEN c',
  ].join('\n')
  const issues = checkFeatureSpec('f.md', content)
  assert.ok(hasError(issues, 'C5'))
  assert.ok(issues.some((i) => i.msg.includes('WHEN')), 'ต้องระบุ WHEN ที่ขาด')
})

test('C5: ไม่มี ## Requirement: เลย → ✖', () => {
  const issues = checkFeatureSpec('f.md', '# Spec\n\nเนื้อหาทั่วไป\n')
  assert.ok(hasError(issues, 'C5'))
})

test('C5: ไม่ match #### Requirement: (H4) — anchor H2 เป๊ะ', () => {
  // #### Requirement: ใน body ไม่ถูกนับเป็น requirement → ต้องรายงาน "ไม่มี ## Requirement:"
  const issues = checkFeatureSpec('f.md', '# Spec\n#### Requirement: ใน design §9\n### Scenario: x\n- GIVEN/WHEN/THEN\n')
  assert.ok(hasError(issues, 'C5'))
})

// ── C1/C4 (⚠) ──────────────────────────────────────────────────────────────
test('C4: design เริ่มเติมแต่ไม่มี Spec delta → ⚠ (ไม่ใช่ ✖)', () => {
  const files = new Map([['design.md', FILLED_H1 + '\nเนื้อหา design ทั่วไป ไม่มี section นั้น\n']])
  const { issues } = checkTopic(files)
  assert.ok(hasWarn(issues, 'C4'), 'ต้องเป็น ⚠ C4')
  assert.ok(!hasError(issues, 'C4'), 'C4 ห้ามเป็น ✖')
})

test('C4: design มี Spec delta → ไม่มี C4', () => {
  const files = new Map([['design.md', FILLED_H1 + '\n## 9. Spec delta\nADDED\n']])
  const { issues } = checkTopic(files)
  assert.equal(byCode(issues, 'C4').length, 0)
})

test('C1: build เริ่มเติมแต่ design ยัง template → ⚠ [C1] (ข้าม stage)', () => {
  const files = new Map([
    ['design.md', TEMPLATE_H1], // ยัง template
    ['proposal.md', TEMPLATE_H1],
    ['build.md', '# Build — งานจริง\n'], // เริ่มเติม
  ])
  const { issues } = checkTopic(files)
  assert.ok(hasWarn(issues, 'C1'), 'ต้องมี ⚠ C1 ข้ามลำดับ')
  assert.ok(!hasError(issues, 'C1'), 'C1 ห้ามเป็น ✖')
})

// ── stage inference ─────────────────────────────────────────────────────────
test('stage inference: ทุกไฟล์ template → ไม่ crash, stage ต่ำสุด', () => {
  const files = new Map([
    ['design.md', TEMPLATE_H1],
    ['ship.md', '# Ship — <ชื่อ topic>\n'],
  ])
  const { stage } = checkTopic(files)
  assert.equal(typeof stage, 'string')
  assert.ok(stage.length > 0)
})

test('stage inference: artifact filled ผสม → stage = สูงสุดที่ filled', () => {
  const files = new Map([
    ['proposal.md', '# Proposal — งานจริง\n'],
    ['design.md', FILLED_H1 + '## 9. Spec delta\n'],
    ['build.md', '# Build — งานจริง\n'],
  ])
  const { stage } = checkTopic(files)
  assert.equal(stage, 'BUILD')
})

// ── structured error ────────────────────────────────────────────────────────
test('structured error: issue object มี code/level/msg (assert structured ไม่ใช่ regex string)', () => {
  const files = new Map([['tasks/foo/spec.md', 'x']]) // ขาด 3 ไฟล์
  const { issues } = checkTopic(files)
  assert.ok(issues.length >= 1)
  for (const i of issues) {
    assert.equal(typeof i.code, 'string')
    assert.ok(['error', 'warn'].includes(i.level))
    assert.equal(typeof i.msg, 'string')
  }
})

// ── executable (spawn ใน temp) ──────────────────────────────────────────────
const scriptPath = fileURLToPath(new URL('../.warnyin/workflow/scripts/validate-topic.mjs', import.meta.url))

function makeTempProject(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-validate-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

function runScript(cwd, args = []) {
  const r = spawnSync(process.execPath, [scriptPath, ...args], { cwd, encoding: 'utf8' }) // array args — ห้าม shell:true
  return { code: r.status, stdout: r.stdout, stderr: r.stderr }
}

// สร้าง topic dir + ไฟล์ใน temp
function writeTopic(root, slug, fileMap) {
  const dir = path.join(root, 'docs', 'stages', slug)
  mkdirSync(dir, { recursive: true })
  for (const [rel, content] of Object.entries(fileMap)) {
    const full = path.join(dir, rel)
    mkdirSync(path.dirname(full), { recursive: true })
    writeFileSync(full, content)
  }
}

test('exe: slug ไม่ถูกต้อง → exit 2 (whitelist)', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'real-topic', { 'design.md': FILLED_H1 })
  const r = runScript(tmp, ['nonexistent'])
  assert.equal(r.code, 2, `slug ผิดต้อง exit 2\nSTDERR:\n${r.stderr}`)
})

test('exe: path traversal ../.. → exit 2 (ไม่อ่านไฟล์นอก docs/stages)', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'real-topic', { 'design.md': FILLED_H1 })
  const r = runScript(tmp, ['../..'])
  assert.equal(r.code, 2, `path traversal ต้อง exit 2\nSTDERR:\n${r.stderr}`)
})

test('exe: fixture topic ขาดไฟล์ → exit 1 + บรรทัด ✖ [C2]', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'broken', {
    'tasks/foo/spec.md': 'x', // ขาด standard/rule/task
  })
  const r = runScript(tmp, ['broken'])
  assert.equal(r.code, 1, `ขาดไฟล์ต้อง exit 1\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`)
  assert.ok(r.stdout.includes('✖ [C2]'), `ต้องมีบรรทัด ✖ [C2]\nSTDOUT:\n${r.stdout}`)
})

test('exe: status หลาย topic (1 สะอาด 1 ✖) → ตารางถูก + exit 0', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'clean', {
    'tasks/a/spec.md': 'x', 'tasks/a/standard.md': 'x', 'tasks/a/rule.md': 'x', 'tasks/a/task.md': 'x',
  })
  writeTopic(tmp, 'broken', { 'tasks/b/spec.md': 'x' })
  const r = runScript(tmp, [])
  assert.equal(r.code, 0, `status ต้อง exit 0\nSTDERR:\n${r.stderr}`)
  assert.ok(r.stdout.includes('clean'), `ตารางต้องมี clean\nSTDOUT:\n${r.stdout}`)
  assert.ok(r.stdout.includes('broken'), `ตารางต้องมี broken\nSTDOUT:\n${r.stdout}`)
  assert.ok(/broken\s.*✖1/.test(r.stdout), `broken ต้องแสดง ✖1\nSTDOUT:\n${r.stdout}`)
})

test('exe: skip achieved/ + context.md (ไม่ปรากฏใน status)', (t) => {
  const tmp = makeTempProject(t)
  const stages = path.join(tmp, 'docs', 'stages')
  mkdirSync(path.join(stages, 'achieved', '2026-01-01-old'), { recursive: true })
  writeFileSync(path.join(stages, 'achieved', '2026-01-01-old', 'ship.md'), '# Ship — old\n')
  writeFileSync(path.join(stages, 'context.md'), 'ctx')
  writeTopic(tmp, 'active', { 'design.md': FILLED_H1 })
  const r = runScript(tmp, [])
  assert.equal(r.code, 0)
  assert.ok(r.stdout.includes('active'), 'ต้องมี active')
  assert.ok(!r.stdout.includes('achieved'), 'ต้องไม่แสดง achieved')
  assert.ok(!r.stdout.includes('context'), 'ต้องไม่แสดง context')
})

test('exe: ไม่มี topic เลย → "ไม่มีงานค้าง" + exit 0', (t) => {
  const tmp = makeTempProject(t)
  mkdirSync(path.join(tmp, 'docs', 'stages'), { recursive: true })
  const r = runScript(tmp, [])
  assert.equal(r.code, 0)
  assert.ok(r.stdout.includes('ไม่มีงานค้าง'), `STDOUT:\n${r.stdout}`)
})

test('exe: arg เกิน 1 ตัว → exit 2', (t) => {
  const tmp = makeTempProject(t)
  mkdirSync(path.join(tmp, 'docs', 'stages'), { recursive: true })
  const r = runScript(tmp, ['a', 'b'])
  assert.equal(r.code, 2, `arg เกินต้อง exit 2\nSTDERR:\n${r.stderr}`)
})

test('exe: topic สะอาด → exit 0 + ✓', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'ok', {
    'tasks/a/spec.md': 'x', 'tasks/a/standard.md': 'x', 'tasks/a/rule.md': 'x', 'tasks/a/task.md': 'x',
  })
  const r = runScript(tmp, ['ok'])
  assert.equal(r.code, 0, `STDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`)
  assert.ok(r.stdout.includes('✓'), `ต้องมี ✓\nSTDOUT:\n${r.stdout}`)
})

// ── fast-track / mixed-state / receipt-template (design §4.2) ────────────────
const RECEIPT_FILLED = '# Receipt — งานจริง\n'       // filled: H1 ไม่มี <...>
const RECEIPT_TEMPLATE = '# Receipt — <ชื่อ change>\n' // template: H1 มี <...>

// (ก) fast topic — unit
test('fast: receipt filled อย่างเดียว → ไม่มี issue C1-C4 + stage = fast-track', () => {
  const files = new Map([['receipt.md', RECEIPT_FILLED]])
  const { issues, stage } = checkTopic(files)
  assert.equal(stage, 'fast-track')
  assert.equal(byCode(issues, 'C1').length, 0, 'ไม่มี C1')
  assert.equal(byCode(issues, 'C2').length, 0, 'ไม่มี C2')
  assert.equal(byCode(issues, 'C3').length, 0, 'ไม่มี C3')
  assert.equal(byCode(issues, 'C4').length, 0, 'ไม่มี C4')
})

test('fast: receipt filled + tasks/[task-name]/ (placeholder) → ยังเป็น fast', () => {
  const files = new Map([
    ['receipt.md', RECEIPT_FILLED],
    ['tasks/[task-name]/spec.md', 'x'], // placeholder ไม่นับเป็น task folder จริง
  ])
  const { stage } = checkTopic(files)
  assert.equal(stage, 'fast-track')
})

test('fast: receipt filled + proposal/design template (ไม่ filled) → fast (ไม่ mixed)', () => {
  const files = new Map([
    ['receipt.md', RECEIPT_FILLED],
    ['proposal.md', TEMPLATE_H1], // template = ไม่ filled
    ['design.md', TEMPLATE_H1],
  ])
  const { stage } = checkTopic(files)
  assert.equal(stage, 'fast-track')
})

// (ข) mixed-state — unit
test('mixed: receipt filled + design filled → full checks ทำงาน + ⚠ C6 (ไม่ใช่ ✖)', () => {
  const files = new Map([
    ['receipt.md', RECEIPT_FILLED],
    ['design.md', FILLED_H1 + '\n## 9. Spec delta\n'],
    ['tasks/foo/spec.md', 'x'], // ขาด 3 ไฟล์ → C2
  ])
  const { issues, stage } = checkTopic(files)
  assert.ok(hasError(issues, 'C2'), 'C2 ต้องยังทำงานใน mixed')
  assert.ok(hasWarn(issues, 'C6'), 'ต้องมี ⚠ C6 mixed-state')
  assert.ok(!hasError(issues, 'C6'), 'C6 ห้ามเป็น ✖')
  assert.ok(stage !== 'fast-track', 'mixed ไม่ได้ stage fast-track')
})

test('mixed: receipt filled + task folder จริง (ไม่มี design filled) → full checks + ⚠ C6', () => {
  const files = new Map([
    ['receipt.md', RECEIPT_FILLED],
    ['tasks/foo/spec.md', 'x'], // task folder จริง (ขาดไฟล์ → C2)
  ])
  const { issues } = checkTopic(files)
  assert.ok(hasError(issues, 'C2'), 'C2 ต้องยังทำงาน')
  assert.ok(hasWarn(issues, 'C6'), 'ต้องมี ⚠ C6')
})

test('mixed: ⚠ C6 อย่างเดียว (ไม่มี ✖ อื่น) → issues มีเฉพาะ C6 + ไม่มี C2/C3', () => {
  // design filled + spec delta → C4 ไม่โผล่; ไม่มี task → C2 ไม่โผล่
  const files = new Map([
    ['receipt.md', RECEIPT_FILLED],
    ['design.md', FILLED_H1 + '\n## 9. Spec delta\n'],
  ])
  const { issues } = checkTopic(files)
  assert.ok(hasWarn(issues, 'C6'), 'ต้องมี ⚠ C6')
  assert.ok(!hasError(issues, 'C2'), 'ไม่มี C2')
  assert.ok(!hasError(issues, 'C3'), 'ไม่มี C3')
})

// (ค) receipt template / ไม่มี receipt → พฤติกรรมเดิม
test('receipt template → ไม่มี fast-track ไม่มี ⚠ C6 (พฤติกรรมเดิม)', () => {
  const files = new Map([
    ['receipt.md', RECEIPT_TEMPLATE],
    ['design.md', FILLED_H1], // design filled ไม่มี spec delta → C4
  ])
  const { issues, stage } = checkTopic(files)
  assert.ok(stage !== 'fast-track', 'ไม่ใช่ fast-track')
  assert.equal(byCode(issues, 'C6').length, 0, 'ไม่มี C6')
  assert.ok(hasWarn(issues, 'C4'), 'C4 ยังทำงานเหมือนเดิม')
})

test('ไม่มี receipt เลย → ไม่มี fast-track ไม่มี ⚠ C6 (พฤติกรรมเดิม)', () => {
  const files = new Map([
    ['design.md', FILLED_H1], // design filled ไม่มี spec delta
  ])
  const { issues, stage } = checkTopic(files)
  assert.ok(stage !== 'fast-track')
  assert.equal(byCode(issues, 'C6').length, 0)
  assert.ok(hasWarn(issues, 'C4'))
})

// (ก) fast topic — exe
test('exe: fast topic (receipt filled only) → exit 0 + output มี fast-track + ไม่มี ✖', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'fast-topic', { 'receipt.md': RECEIPT_FILLED })
  const r = runScript(tmp, ['fast-topic'])
  assert.equal(r.code, 0, `exit ต้อง 0\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`)
  assert.ok(!r.stdout.includes('✖'), `ไม่ควรมี ✖\nSTDOUT:\n${r.stdout}`)
  assert.ok(r.stdout.includes('fast-track'), `ต้องมี fast-track\nSTDOUT:\n${r.stdout}`)
})

test('exe: status mode → fast topic แสดง fast-track ในตาราง', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'fast-topic', { 'receipt.md': RECEIPT_FILLED })
  const r = runScript(tmp, [])
  assert.equal(r.code, 0)
  assert.ok(r.stdout.includes('fast-track'), `ตารางต้องแสดง fast-track\nSTDOUT:\n${r.stdout}`)
})

// (ข) mixed — exe
test('exe: mixed (receipt + design filled + task ขาดไฟล์) → ✖ C2 ยังโผล่ + ⚠ C6 + exit 1', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'mixed-topic', {
    'receipt.md': RECEIPT_FILLED,
    'design.md': '# Design — งานจริง\n\n## 9. Spec delta\n',
    'tasks/foo/spec.md': 'x', // ขาด 3 ไฟล์ → C2
  })
  const r = runScript(tmp, ['mixed-topic'])
  assert.equal(r.code, 1, `mixed มี ✖ → exit 1\nSTDOUT:\n${r.stdout}`)
  assert.ok(r.stdout.includes('✖ [C2]'), `ต้องมี ✖ C2\nSTDOUT:\n${r.stdout}`)
  assert.ok(r.stdout.includes('⚠ [C6]'), `ต้องมี ⚠ C6\nSTDOUT:\n${r.stdout}`)
})

// (ค) receipt template — exe
test('exe: receipt template → ไม่มี fast-track ไม่มี C6 (พฤติกรรมเดิม)', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'tmpl-topic', { 'receipt.md': RECEIPT_TEMPLATE })
  const r = runScript(tmp, ['tmpl-topic'])
  assert.equal(r.code, 0, `receipt template topic สะอาด → exit 0\nSTDOUT:\n${r.stdout}`)
  assert.ok(!r.stdout.includes('fast-track'), `ไม่ควรมี fast-track\nSTDOUT:\n${r.stdout}`)
  assert.ok(!r.stdout.includes('C6'), `ไม่ควรมี C6\nSTDOUT:\n${r.stdout}`)
})

// ── fixtures สำหรับเคส C7 (cap gate) ────────────────────────────────────────
// linesOf(n): สร้างเนื้อ n บรรทัด จบด้วย \n (wc-l semantics)
// filler ห้ามมี fast/standard/large/Spec delta (docs/rule.md §5 keyword-heuristic)
function linesOf(n) {
  return Array.from({ length: n }, (_, i) => 'บรรทัด ' + (i + 1)).join('\n') + '\n'
}

// proposalWithTier(tier): สร้าง proposal.md สั้นที่มี row '| **ขนาด** |' (ใช้ใน tier parse)
function proposalWithTier(tier) {
  return `# Proposal — งานจริง\n\n| ฟิลด์ | ค่า |\n|---|---|\n| **ขนาด** | \`${tier}\` |\n`
}

// ── A. cap ต่อ tier (unit — feed Map ปลอม) ───────────────────────────────────
test('C7 A1: standard · design.md 121 บรรทัด → ✖ [C7] ระบุ design.md/121/120', () => {
  const files = new Map([
    ['proposal.md', proposalWithTier('standard')],
    ['design.md', linesOf(121)],
  ])
  const issues = checkCaps(files, 'standard')
  assert.ok(hasError(issues, 'C7'), `ต้องมี ✖ C7\n${JSON.stringify(issues)}`)
  assert.ok(issues.some((i) => i.code === 'C7' && i.msg.includes('design.md')), 'msg ต้องระบุ design.md')
  assert.ok(issues.some((i) => i.code === 'C7' && i.msg.includes('121')), 'msg ต้องระบุ 121')
  assert.ok(issues.some((i) => i.code === 'C7' && i.msg.includes('120')), 'msg ต้องระบุ cap 120')
})

test('C7 A2: standard · design.md 120 พอดี → ไม่มี C7 (boundary ≤ ผ่าน)', () => {
  const files = new Map([['design.md', linesOf(120)]])
  const issues = checkCaps(files, 'standard')
  assert.equal(byCode(issues, 'C7').length, 0, `120 พอดีต้องไม่มี C7\n${JSON.stringify(issues)}`)
})

test('C7 A3: standard · design.md 119 → ไม่มี C7', () => {
  const files = new Map([['design.md', linesOf(119)]])
  const issues = checkCaps(files, 'standard')
  assert.equal(byCode(issues, 'C7').length, 0, `119 ต้องไม่มี C7\n${JSON.stringify(issues)}`)
})

test('C7 A4: standard · proposal.md 61 บรรทัด → ✖ [C7] ระบุ proposal.md', () => {
  const files = new Map([['proposal.md', linesOf(61)]])
  const issues = checkCaps(files, 'standard')
  assert.ok(hasError(issues, 'C7'), `ต้องมี ✖ C7\n${JSON.stringify(issues)}`)
  assert.ok(issues.some((i) => i.code === 'C7' && i.msg.includes('proposal.md')), 'ระบุ proposal.md')
})

test('C7 A5: standard · proposal.md 60 พอดี → ไม่มี C7 (boundary ≤ ผ่าน)', () => {
  const files = new Map([['proposal.md', linesOf(60)]])
  const issues = checkCaps(files, 'standard')
  assert.equal(byCode(issues, 'C7').length, 0, `60 พอดีต้องไม่มี C7\n${JSON.stringify(issues)}`)
})

test('C7 A6: fast · receipt.md 41 บรรทัด → ✖ [C7] + stage = fast-track', () => {
  // fast-mode: receipt filled (H1 ไม่มี <...>), ไม่มี proposal/design/task
  const files = new Map([['receipt.md', linesOf(41)]])
  const { issues, stage } = checkTopic(files)
  assert.equal(stage, 'fast-track', `ต้องเป็น fast-track\nstage: ${stage}`)
  assert.ok(hasError(issues, 'C7'), `ต้องมี ✖ C7\n${JSON.stringify(issues)}`)
})

test('C7 A7: fast · receipt.md 40 พอดี → ไม่มี C7 + stage fast-track (พฤติกรรมเดิมไม่พัง)', () => {
  const files = new Map([['receipt.md', linesOf(40)]])
  const { issues, stage } = checkTopic(files)
  assert.equal(stage, 'fast-track', `ต้องเป็น fast-track`)
  assert.equal(byCode(issues, 'C7').length, 0, `40 พอดีต้องไม่มี C7\n${JSON.stringify(issues)}`)
})

test('C7 A8: large · design.md 300 บรรทัด → ไม่มี C7 (large ไม่มี cap) — ผ่าน checkTopic (resolve tier จริง)', () => {
  // เดิมเรียก checkCaps(files, 'large') ตรง ๆ → proposalWithTier('large') ไม่เคยถูกอ่าน
  // ตอนนี้วิ่งผ่าน resolveTier จริง: ถ้า parse ไม่ได้จะได้ ⚠ C7 (fail-safe) แทน 0 issue → เทสจับได้
  const files = new Map([
    ['proposal.md', proposalWithTier('large')],
    ['design.md', linesOf(300)],
  ])
  const { issues } = checkTopic(files)
  assert.equal(byCode(issues, 'C7').length, 0, `large tier ต้องไม่มี C7 (ทั้ง ✖ และ ⚠)\n${JSON.stringify(issues)}`)
})

test('C7 A9: นับบรรทัดแบบ wc -l: ไฟล์ 40 บรรทัดจบด้วย \\n → นับ 40 ไม่ใช่ 41 (กัน off-by-one)', () => {
  // linesOf(40) จบด้วย \n → wc -l = 40; cap fast = 40 → ต้องไม่ ✖
  const files = new Map([['receipt.md', linesOf(40)]])
  const issues = checkCaps(files, 'fast')
  assert.equal(byCode(issues, 'C7').length, 0, `40 บรรทัดพอดี cap 40 ต้องไม่ C7\n${JSON.stringify(issues)}`)
})

// ── B. exclude §9 ของ design.md ──────────────────────────────────────────────
test('C7 B1: design 300 บรรทัด แต่ก่อน ## 9. Spec delta มี 100 → ไม่มี C7', () => {
  // linesOf(100) จบ \n; ต่อด้วย heading H2; ต่อด้วย linesOf(200)
  const content = linesOf(100) + '## 9. Spec delta\n' + linesOf(200)
  const files = new Map([['design.md', content]])
  const issues = checkCaps(files, 'standard')
  assert.equal(byCode(issues, 'C7').length, 0, `นับเฉพาะก่อน §9 = 100 ≤ 120 → ต้องไม่มี C7\n${JSON.stringify(issues)}`)
})

test('C7 B2: ไม่มี heading ## 9. Spec delta → นับทั้งไฟล์ → เกิน → ✖ C7', () => {
  // ไม่มี heading §9 → cutIdx = lines.length → นับ 121 บรรทัดทั้งหมด
  const files = new Map([['design.md', linesOf(121)]])
  const issues = checkCaps(files, 'standard')
  assert.ok(hasError(issues, 'C7'), `ไม่มี §9 ต้องนับทั้งไฟล์ → 121 > 120 → ✖ C7\n${JSON.stringify(issues)}`)
})

test('C7 B3: #### 9. Spec delta (H4) ไม่ถูกนับเป็น cut point → ยังนับทั้งไฟล์ → ✖ C7', () => {
  // H4 ไม่ match /^##\s+9\.\s+Spec delta/ (anchor H2 เป๊ะ — mirror defer #2 ของ C5)
  // content: 100 บรรทัด + H4 + 22 บรรทัด = 123 total > 120
  const content = linesOf(100) + '#### 9. Spec delta\n' + linesOf(22)
  const files = new Map([['design.md', content]])
  const issues = checkCaps(files, 'standard')
  assert.ok(hasError(issues, 'C7'), `H4 ไม่ใช่ cut point → นับทั้งหมด > 120 → ✖ C7\n${JSON.stringify(issues)}`)
})

// ── C. tier parse (fail-safe) ─────────────────────────────────────────────────
test('C7 C1: row ขนาด=standard → บังคับ cap จริง + ไม่มี ⚠ C7 warn (ผ่าน checkTopic — resolve tier จริง)', () => {
  // เดิมเรียก checkCaps(files, 'standard') ตรง ๆ → bypass resolveTier
  const files = new Map([
    ['proposal.md', proposalWithTier('standard')],
    ['design.md', linesOf(121)],
  ])
  const { issues } = checkTopic(files)
  assert.ok(hasError(issues, 'C7'), `ต้องมี ✖ C7\n${JSON.stringify(issues)}`)
  assert.ok(!hasWarn(issues, 'C7'), `ต้องไม่มี ⚠ C7 warn\n${JSON.stringify(issues)}`)
  assert.ok(
    issues.some((i) => i.code === 'C7' && i.msg.includes('tier: standard')),
    `msg ต้องระบุ tier ที่ resolve ได้จริง\n${JSON.stringify(issues)}`,
  )
})

test('C7 C1b: row ขนาด=fast (proposal จริง) → cap fast บังคับกับ receipt.md (resolve ผ่าน checkTopic)', () => {
  // proposal filled + receipt filled → mode = mixed (ไม่เข้า fast-branch) → tier ต้องมาจาก proposal เท่านั้น
  const files = new Map([
    ['proposal.md', proposalWithTier('fast')],
    ['receipt.md', linesOf(41)],
  ])
  const { issues } = checkTopic(files)
  assert.ok(hasError(issues, 'C7'), `ต้องมี ✖ C7 (receipt 41 > cap 40)\n${JSON.stringify(issues)}`)
  assert.ok(
    issues.some((i) => i.code === 'C7' && i.msg.includes('receipt.md') && i.msg.includes('tier: fast')),
    `msg ต้องระบุ receipt.md + tier: fast\n${JSON.stringify(issues)}`,
  )
})

test('C7 C2: ไม่มี row ขนาด ใน proposal → ⚠ [C7] + ไม่มี ✖ C7', () => {
  // proposal filled แต่ไม่มี row ขนาด → resolveTier = null → ⚠ ไม่บังคับ cap
  const files = new Map([
    ['proposal.md', '# Proposal — งานจริง\n\nเนื้อหาไม่มี row ขนาด\n'],
    ['design.md', linesOf(200)],
  ])
  const { issues } = checkTopic(files)
  assert.ok(hasWarn(issues, 'C7'), `ต้องมี ⚠ C7\n${JSON.stringify(issues)}`)
  assert.ok(!hasError(issues, 'C7'), `ต้องไม่มี ✖ C7\n${JSON.stringify(issues)}`)
})

test('C7 C3: ค่า tier เพี้ยน → ⚠ [C7] ไม่บังคับ cap (fixture ไม่มี keyword fast/standard/large)', () => {
  // row ขนาด = `กลาง` — ไม่ match fast|standard|large → resolveTier = null
  // fixture filler ใช้ 'กลาง' ไม่ใช่คำ fast/standard/large (docs/rule.md §5)
  const proposalContent = '# Proposal — งานจริง\n\n| ฟิลด์ | ค่า |\n|---|---|\n| **ขนาด** | `กลาง` |\n'
  const files = new Map([
    ['proposal.md', proposalContent],
    ['design.md', linesOf(200)],
  ])
  const { issues } = checkTopic(files)
  assert.ok(hasWarn(issues, 'C7'), `ต้องมี ⚠ C7\n${JSON.stringify(issues)}`)
  assert.ok(!hasError(issues, 'C7'), `ต้องไม่มี ✖ C7\n${JSON.stringify(issues)}`)
})

test('C7 C4: topic ว่าง (ไม่มี receipt/proposal/design) → ไม่มี C7 เลย (ไม่ noise)', () => {
  const files = new Map()
  const { issues } = checkTopic(files)
  assert.equal(byCode(issues, 'C7').length, 0, `topic ว่างไม่ควรมี C7\n${JSON.stringify(issues)}`)
})

// ── C5–C7: แถว 'ขนาด' ของ template จริง = ambiguous → fail-safe ⚠ (ไม่ใช่ 'fast' ลวง) ──
// อ่านแถวจาก template ที่ shipped จริง — ไม่ hardcode string ในเทส
function templateSizeRow() {
  const row = readTemplate('proposal.md').split('\n').find((l) => /^\|\s*\*\*ขนาด\*\*\s*\|/.test(l))
  assert.ok(row, 'template proposal.md ต้องมีแถว "| **ขนาด** |"')
  return row
}

test('C7 C5: แถว ขนาด ของ template จริง (ยังไม่เติม) → parseTier = null (ไม่คว้า keyword ตัวแรก)', () => {
  const content = `# Proposal — งานจริง\n\n| | |\n|---|---|\n${templateSizeRow()}\n`
  assert.equal(parseTier(content), null, 'แถว template ที่มี fast/standard/large ครบ = ambiguous → null')
})

test('C7 C6: proposal ที่ยังใช้แถว template + design ยาวเกิน → ⚠ [C7] ไม่ใช่เงียบ/ไม่ใช่ ✖ (fail-safe ตามที่ประกาศ)', () => {
  // regression ตรง ๆ ของ defect: เดิม parseTier คืน 'fast' → CAPS.fast ไม่มี design.md
  //   → ไม่ cap + ไม่เข้า branch fail-safe → เงียบสนิท (gate เขียวลวง)
  const files = new Map([
    ['proposal.md', `# Proposal — งานจริง\n\n| | |\n|---|---|\n${templateSizeRow()}\n`],
    ['design.md', linesOf(200)],
  ])
  const { issues } = checkTopic(files)
  assert.ok(hasWarn(issues, 'C7'), `ต้องมี ⚠ C7 (อ่าน tier ไม่ได้ = ข้ามเช็ค)\n${JSON.stringify(issues)}`)
  assert.ok(!hasError(issues, 'C7'), `ต้องไม่มี ✖ C7\n${JSON.stringify(issues)}`)
})

test('C7 C7: รูปแบบแถว ขนาด ของ proposal จริง resolve ถูกทุกแบบ (backtick-scoped + ambiguous → null)', () => {
  // เก็บจากรูปแบบที่พบจริงใน docs/stages/achieved/*/proposal.md
  const cases = [
    ['| **ขนาด** | `standard` |', 'standard'],
    ['| **ขนาด** | `large` (cross-cutting หลาย component — Discovery บังคับก่อน) |', 'large'],
    ['| **ขนาด** | `fast` (1 ไฟล์, ลบ keyword 2 จุด, ไม่แตะ hard-floor) |', 'fast'],
    // keyword นอก backtick ในคำอธิบาย ต้องไม่ทำให้ ambiguous
    ['| **ขนาด** | `standard` (logic ใหม่ + แตะ 2 ไฟล์; ก้ำกึ่ง fast/standard → ปัดขึ้น) |', 'standard'],
    ['| **ขนาด** | `กลาง (standard)` — dogfood: rubric จะจัดงานนี้เป็น standard เอง |', 'standard'],
    ['| **ขนาด** | `กลาง` (tier `standard`) |', 'standard'],
    ['| **ขนาด** | standard |', 'standard'], // ไม่มี backtick → fallback อ่านทั้ง cell
    ['| **ขนาด** | `เล็ก` |', null],        // vocab เก่า → อ่านไม่ได้ → fail-safe
    ['| **ขนาด** | `fast` / `standard` |', null], // ambiguous
  ]
  for (const [row, expected] of cases) {
    assert.equal(parseTier(`# Proposal — งานจริง\n\n${row}\n`), expected, `row: ${row}`)
  }
})

test('exe C8: topic ที่ proposal ยังใช้แถว template + design ยาวเกิน → exit 0 + ⚠ [C7] (ไม่เงียบ)', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'tmpl-tier', {
    'proposal.md': `# Proposal — งานจริง\n\n| | |\n|---|---|\n${templateSizeRow()}\n`,
    'design.md': linesOf(200),
  })
  const r = runScript(tmp, ['tmpl-tier'])
  assert.equal(r.code, 0, `fail-safe ต้อง exit 0\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`)
  assert.ok(r.stdout.includes('⚠ [C7]'), `ต้องมี ⚠ [C7]\nSTDOUT:\n${r.stdout}`)
})

// ── D. stage inference (contract C2) ─────────────────────────────────────────
test('stage D1: build.md filled + "## 4. ผล verify" → stage = VERIFY', () => {
  const files = new Map([
    ['build.md', '# Build — งานจริง\n\n## 4. ผล verify\n\nเนื้อหา verify\n'],
  ])
  const { stage } = checkTopic(files)
  assert.equal(stage, 'VERIFY', `ต้องเป็น VERIFY\nstage: ${stage}`)
})

test('stage D2: build.md filled ไม่มี section "## 4. ผล verify" → stage = BUILD', () => {
  const files = new Map([
    ['build.md', '# Build — งานจริง\n\n## 1. ผล build\n\nเนื้อหา\n'],
  ])
  const { stage } = checkTopic(files)
  assert.equal(stage, 'BUILD', `ต้องเป็น BUILD\nstage: ${stage}`)
})

test('stage D6: §4 มีแต่ blockquote (โครง template ยังไม่เติม) → stage = BUILD ไม่ใช่ VERIFY', () => {
  // regression: template ของ build.md มี heading §4 ติดมาเสมอ — ถ้านับแค่ heading
  // ทุก topic จะกระโดดเป็น VERIFY ทันทีที่เริ่มเขียน build.md (stage BUILD จะไม่มีทางถูก infer)
  const files = new Map([
    ['build.md', '# Build — งานจริง\n\n## 1. ผล build\n\nเนื้อหา\n\n## 4. ผล verify + การแก้\n\n> ยังไม่เขียน — เป็นของ VERIFY phase\n'],
  ])
  const { stage } = checkTopic(files)
  assert.equal(stage, 'BUILD', `§4 ที่มีแต่ blockquote ต้องไม่นับเป็น VERIFY\nstage: ${stage}`)
})

test('stage D7: §4 มีเนื้อจริงหลัง blockquote → stage = VERIFY (คู่ตรงข้ามของ D6 — กัน over-fix)', () => {
  const files = new Map([
    ['build.md', '# Build — งานจริง\n\n## 4. ผล verify + การแก้\n\n> คำอธิบายของ template\n\n| เคส | ผล |\n|---|---|\n| T1 | ผ่าน |\n'],
  ])
  const { stage } = checkTopic(files)
  assert.equal(stage, 'VERIFY', `§4 ที่มีเนื้อจริงต้องเป็น VERIFY\nstage: ${stage}`)
})

// ── D8/D9: fixture = template build.md ของจริง (ไม่ใช่ fixture เขียนเอง) ─────
// D6/D7 เป็น fixture ย่อ — ผ่านได้แม้ template จริงยังหลุด (§4 ของ template มี table meta /
// '### ผลการเทส' / checkbox / เส้นคั่น ติดมาตั้งแต่ต้น) → ต้องมีคู่นี้ยืนบน template จริง
// เติมแค่ H1 = จำลอง topic ที่เพิ่ง copy template มาแล้วเริ่มเขียน build.md
function templateBuildWithFilledH1() {
  const lines = readTemplate('build.md').split('\n')
  const h1 = lines.findIndex((l) => l.startsWith('# '))
  assert.notEqual(h1, -1, 'template build.md ต้องมี H1')
  lines[h1] = '# Build Report — งานจริง' // filled: ไม่มี placeholder <...>
  return lines.join('\n')
}

test('stage D8: template build.md ของจริง (เติมแค่ H1 ไม่แตะ §4) → stage = BUILD', () => {
  const content = templateBuildWithFilledH1()
  // guard: fixture ต้องมี §4 อยู่จริง ไม่งั้นเทสผ่านด้วยเหตุผลผิด
  assert.ok(/^##\s+4\.\s+ผล verify/m.test(content), 'template ต้องมี section "## 4. ผล verify"')
  const { stage } = checkTopic(new Map([['build.md', content]]))
  assert.equal(stage, 'BUILD', `โครง §4 ของ template จริงต้องไม่นับเป็น VERIFY\nstage: ${stage}`)
})

test('stage D9: template build.md ของจริง + เติมเนื้อจริงใน §4 → stage = VERIFY', () => {
  // เติม data row จริงต่อท้ายตาราง '### ผลการเทส' ใน §4 (คู่ตรงข้ามของ D8 — กัน over-fix)
  const lines = templateBuildWithFilledH1().split('\n')
  const rowIdx = lines.findIndex((l) => l.startsWith('| 1 | | functional'))
  assert.notEqual(rowIdx, -1, 'template ต้องมีแถวตัวอย่างของตารางผลการเทส')
  lines.splice(rowIdx + 1, 0, '| 2 | login flow | e2e | ✅ | รันบน local |')
  const { stage } = checkTopic(new Map([['build.md', lines.join('\n')]]))
  assert.equal(stage, 'VERIFY', `§4 ที่มี data row จริงต้องเป็น VERIFY\nstage: ${stage}`)
})

test('stage D3: backward-compat verify.md/test.md filled → stage = VERIFY และไม่เกิด ✖ ใหม่', () => {
  const files = new Map([
    ['proposal.md', '# Proposal — งานจริง\n'],
    ['design.md', FILLED_H1 + '## 9. Spec delta\n'],
    ['build.md', '# Build — งานจริง\n'],
    ['verify.md', '# Verify — งานจริง\n'],
    ['test.md', '# Test — งานจริง\n'],
  ])
  const { stage } = checkTopic(files)
  assert.equal(stage, 'VERIFY', `backward-compat ต้องเป็น VERIFY\nstage: ${stage}`)
})

test('stage D4: build.md filled ไม่มี verify.md/test.md → ไม่มี ⚠ C1 อ้างถึง verify.md', () => {
  const files = new Map([
    ['proposal.md', '# Proposal — งานจริง\n'],
    ['design.md', FILLED_H1 + '## 9. Spec delta\n'],
    ['build.md', '# Build — งานจริง\n'],
  ])
  const { issues } = checkTopic(files)
  assert.ok(
    !issues.some((i) => i.msg.includes('verify.md')),
    `ต้องไม่มี C1 อ้าง verify.md\n${JSON.stringify(issues)}`,
  )
})

test('stage D5: ship.md filled + ไม่มี verify.md → C1 ไม่บ่นถึง VERIFY', () => {
  const files = new Map([
    ['proposal.md', '# Proposal — งานจริง\n'],
    ['design.md', FILLED_H1 + '## 9. Spec delta\n'],
    ['build.md', '# Build — งานจริง\n'],
    ['ship.md', shipWith(['| rule A | evidence | project | ✅ |'])],
  ])
  const { issues } = checkTopic(files)
  const c1Issues = byCode(issues, 'C1')
  const hasVerifyComplaint = c1Issues.some((i) => /VERIFY|verify\.md|test\.md/.test(i.msg))
  assert.ok(!hasVerifyComplaint, `ต้องไม่บ่นถึง VERIFY\n${JSON.stringify(c1Issues)}`)
})

// ── E. pure/structured + กัน gate ลวง ────────────────────────────────────────
test('C7 E1: checkCaps เป็น pure fn — เรียกตรงด้วย Map + tier คืน array {code,level,msg}', () => {
  const files = new Map([['design.md', linesOf(121)]])
  const issues = checkCaps(files, 'standard')
  assert.ok(Array.isArray(issues), 'ต้องคืน array')
  assert.ok(issues.length >= 1, 'ต้องมี issue')
  for (const i of issues) {
    assert.equal(typeof i.code, 'string', 'code ต้องเป็น string')
    assert.ok(['error', 'warn'].includes(i.level), `level ต้องเป็น error|warn: ${i.level}`)
    assert.equal(typeof i.msg, 'string', 'msg ต้องเป็น string')
  }
})

test('C7 E2: negative — cap แยกสองฝั่งได้จริง: 121 บรรทัด แดง / 120 บรรทัด เขียว', () => {
  // พิสูจน์ว่า gate ไม่คืนค่าเดิมตลอด (กัน gate ลวง)
  const filesOver = new Map([['design.md', linesOf(121)]])
  const issuesOver = checkCaps(filesOver, 'standard')
  assert.equal(issuesOver.length, 1, `121 ต้องมี 1 issue\n${JSON.stringify(issuesOver)}`)
  assert.equal(issuesOver[0].level, 'error', `121 ต้องเป็น error\n${JSON.stringify(issuesOver)}`)

  const filesOk = new Map([['design.md', linesOf(120)]])
  const issuesOk = checkCaps(filesOk, 'standard')
  assert.equal(issuesOk.length, 0, `120 ต้องไม่มี issue\n${JSON.stringify(issuesOk)}`)
})

// ── F. executable (spawn จริงใน temp) ────────────────────────────────────────
test('exe F1: standard topic design เกิน cap → exit 1 + stdout มี ✖ [C7]', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'std-topic', {
    'proposal.md': proposalWithTier('standard'),
    'design.md': linesOf(121),
  })
  const r = runScript(tmp, ['std-topic'])
  assert.equal(r.code, 1, `ต้อง exit 1\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`)
  assert.ok(r.stdout.includes('✖ [C7]'), `ต้องมี ✖ [C7]\nSTDOUT:\n${r.stdout}`)
})

test('exe F2: tier อ่านไม่ได้ + design ยาวเกิน → exit 0 + stdout มี ⚠ [C7] (fail-safe ไม่ block)', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'notier-topic', {
    'proposal.md': '# Proposal — งานจริง\n\nไม่มี row ขนาดในไฟล์นี้\n',
    'design.md': linesOf(200),
  })
  const r = runScript(tmp, ['notier-topic'])
  assert.equal(r.code, 0, `fail-safe ต้อง exit 0\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`)
  assert.ok(r.stdout.includes('⚠ [C7]'), `ต้องมี ⚠ [C7]\nSTDOUT:\n${r.stdout}`)
})

test('exe F3: fast topic receipt เกิน 40 → exit 1 + ✖ [C7] + output มี fast-track', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'fast-over', {
    'receipt.md': linesOf(41),
  })
  const r = runScript(tmp, ['fast-over'])
  assert.equal(r.code, 1, `ต้อง exit 1\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`)
  assert.ok(r.stdout.includes('✖ [C7]'), `ต้องมี ✖ [C7]\nSTDOUT:\n${r.stdout}`)
  assert.ok(r.stdout.includes('fast-track'), `ต้องแสดง fast-track\nSTDOUT:\n${r.stdout}`)
})

test('exe F4: output ไม่มี absolute path / ไม่ echo เนื้อ artifact', (t) => {
  const tmp = makeTempProject(t)
  writeTopic(tmp, 'std-topic2', {
    'proposal.md': proposalWithTier('standard'),
    'design.md': linesOf(121),
  })
  const r = runScript(tmp, ['std-topic2'])
  assert.ok(!r.stdout.includes(tmp), `ต้องไม่มี absolute path\nSTDOUT:\n${r.stdout}`)
  // กัน echo เนื้อ artifact (filler text ที่ generate)
  assert.ok(!r.stdout.includes('บรรทัด 1'), `ต้องไม่ echo เนื้อ artifact\nSTDOUT:\n${r.stdout}`)
})
