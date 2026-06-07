// Unit + executable test ของ validate-topic.mjs (structural validator)
// unit: feed Map/string ปลอม เข้า pure fn (checkTopic/checkFeatureSpec) — ไม่แตะ fs จริง
// executable: spawn script จริงบน fixture ใน temp (mirror installer.test harness — copy ไม่ import; defer #3)
// zero-dependency: ใช้เฉพาะ built-in node:*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkTopic, checkFeatureSpec } from '../.warnyin/workflow/scripts/validate-topic.mjs'

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
