// Black-box integration test ของ installer (bin/cli.mjs)
// spawn CLI จริงในโฟลเดอร์ temp แล้ว assert จาก side-effect จริง (ไฟล์/exit code/stdout/stderr)
// zero-dependency: ใช้เฉพาะ built-in node:* — ห้าม import logic จาก cli.mjs (มันรัน side-effect ตอน import)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ★ B1: ใช้ fileURLToPath ตรง ๆ — ห้าม `.pathname` (บน Windows คืน `/D:/...` → spawn MODULE_NOT_FOUND)
const cliPath = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))

function makeTempProject(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true })) // cleanup แม้ fail
  return dir
}

function runCli(cwd, args = []) {
  const r = spawnSync(process.execPath, [cliPath, ...args], { cwd, encoding: 'utf8' }) // array args — ห้าม shell:true
  return { code: r.status, stdout: r.stdout, stderr: r.stderr }
}

// surface stderr เมื่อ assert code===0 fail — กัน false-positive
function ok(r, msg = '') {
  assert.equal(r.code, 0, `${msg} exit!=0\nSTDERR:\n${r.stderr}\nSTDOUT:\n${r.stdout}`)
}

// เก็บ path ของไฟล์ทุกตัวใต้ dir (relative) — ใช้เทียบ negative/byte-equal
function listFiles(dir, base = dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) listFiles(full, base, acc)
    else acc.push(path.relative(base, full))
  }
  return acc
}

// 1. ติดตั้งสด
test('1. ติดตั้งสด — สร้างโครงครบ', (t) => {
  const tmp = makeTempProject(t)
  const r = runCli(tmp)
  ok(r, 'install')
  for (const rel of [
    path.join('.warnyin', 'workflow'),
    path.join('.warnyin', 'template'),
    path.join('.claude', 'commands', 'warnyin'),
    path.join('.claude', 'skills', 'update-codemaps', 'SKILL.md'),
    path.join('docs', 'stages'),
    path.join('docs', 'project.md'),
    'CLAUDE.md',
    'AGENTS.md',
  ]) {
    assert.ok(existsSync(path.join(tmp, rel)), `ขาด ${rel}`)
  }
})

// 2. idempotent — รัน 2 ครั้ง ไฟล์ byte-equal + ไม่ append ซ้ำ
test('2. idempotent — รัน 2 ครั้งไม่เปลี่ยนไฟล์', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install#1')

  const sample = path.join(tmp, '.warnyin', 'workflow', 'README.md')
  assert.ok(existsSync(sample), 'ต้องมี sample หลังรอบแรก')
  const before = readFileSync(sample)
  const claudeBefore = readFileSync(path.join(tmp, 'CLAUDE.md'))
  const agentsBefore = readFileSync(path.join(tmp, 'AGENTS.md'))

  const r2 = runCli(tmp)
  ok(r2, 'install#2')
  assert.ok(r2.stdout.includes('ข้าม'), 'รอบ 2 ต้องรายงาน "ข้าม"')

  assert.ok(before.equals(readFileSync(sample)), 'sample ต้อง byte-equal')
  assert.ok(claudeBefore.equals(readFileSync(path.join(tmp, 'CLAUDE.md'))), 'CLAUDE.md ต้องไม่โต/ไม่ append ซ้ำ')
  assert.ok(agentsBefore.equals(readFileSync(path.join(tmp, 'AGENTS.md'))), 'AGENTS.md ต้องไม่โต/ไม่ append ซ้ำ')
})

// 3. --update ไม่ทับงานจริง
test('3. --update ไม่ทับงานจริง (docs/)', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')

  const projectMd = path.join(tmp, 'docs', 'project.md')
  const mine = '# งานจริงของฉัน — ห้ามทับ\n'
  writeFileSync(projectMd, mine)
  const demoDir = path.join(tmp, 'docs', 'stages', 'demo')
  mkdirSync(demoDir, { recursive: true })
  const demoFile = path.join(demoDir, 'x.md')
  writeFileSync(demoFile, 'demo work\n')
  const claudeBefore = readFileSync(path.join(tmp, 'CLAUDE.md'))

  const r = runCli(tmp, ['--update'])
  ok(r, 'update')

  assert.equal(readFileSync(projectMd, 'utf8'), mine, 'docs/project.md ต้องคงค่าที่แก้')
  assert.ok(existsSync(demoFile), 'docs/stages/demo/x.md ต้องยังอยู่')
  assert.equal(readFileSync(demoFile, 'utf8'), 'demo work\n', 'งานจริง demo ต้องไม่ถูกแตะ')
  assert.ok(claudeBefore.equals(readFileSync(path.join(tmp, 'CLAUDE.md'))), 'CLAUDE.md ต้องไม่ถูก append section ซ้ำ')
})

// 4. installRootDoc append + heading + idempotent
test('4. installRootDoc — append section ต่อ CLAUDE.md เดิม + ไม่ append ซ้ำ', (t) => {
  const tmp = makeTempProject(t)
  const existing = '# My Project\n\nรายละเอียดเดิมของโปรเจกต์\n'
  writeFileSync(path.join(tmp, 'CLAUDE.md'), existing)

  const r = runCli(tmp)
  ok(r, 'install over existing CLAUDE.md')

  const after = readFileSync(path.join(tmp, 'CLAUDE.md'), 'utf8')
  assert.ok(after.startsWith('# My Project'), 'ต้องคง heading เดิมไว้ด้านบน')
  assert.ok(after.includes('## Warnyin Standard Workflow'), 'ต้อง append section ## Warnyin Standard Workflow')

  const afterFirst = readFileSync(path.join(tmp, 'CLAUDE.md'))
  ok(runCli(tmp), 'install#2')
  assert.ok(afterFirst.equals(readFileSync(path.join(tmp, 'CLAUDE.md'))), 'รันซ้ำต้องไม่ append section อีก')
})

// 5. legacy 0.3–0.5.x — warn ที่ stderr (string copy ตรงจาก cli.mjs:55,57)
test('5. legacy 0.3–0.5.x → เตือนที่ stderr', (t) => {
  const tmp = makeTempProject(t)
  mkdirSync(path.join(tmp, 'warnyin', 'workflow'), { recursive: true })

  const r = runCli(tmp, ['--dry-run'])
  // หมายเหตุ en-dash U+2013 ใน "(0.3–0.5.x)" — copy ตรงจาก cli.mjs
  assert.ok(r.stderr.includes('พบโครงเลย์เอาต์เก่า (0.3–0.5.x)'), `stderr ต้องมี warning 0.3-0.5.x\nSTDERR:\n${r.stderr}`)
  // คำสั่ง robust: ย้าย contents (กันซ้อน docs/stages/stages) — ตรง CHANGELOG Migration guide (topic roadmap-sync-p0)
  assert.ok(r.stderr.includes('git mv warnyin/stages/* docs/stages/'), `stderr ต้องมีคำสั่ง git mv robust\nSTDERR:\n${r.stderr}`)
})

// 6. legacy ≤0.2.x — warn ที่ stderr (string copy ตรงจาก cli.mjs:43,45 — คนละ string จากเคส 5)
test('6. legacy ≤0.2.x → เตือนที่ stderr', (t) => {
  const tmp = makeTempProject(t)
  mkdirSync(path.join(tmp, 'workflow'), { recursive: true })
  mkdirSync(path.join(tmp, 'warnyin-stages'), { recursive: true })

  const r = runCli(tmp, ['--dry-run'])
  // หมายเหตุ ≤ U+2264 ใน "(≤0.2.x)" — copy ตรงจาก cli.mjs
  assert.ok(r.stderr.includes('พบโครงเลย์เอาต์เก่า (≤0.2.x)'), `stderr ต้องมี warning ≤0.2.x\nSTDERR:\n${r.stderr}`)
  // คำสั่ง robust: ย้าย contents (กันซ้อน) — ตรง CHANGELOG Migration guide (topic roadmap-sync-p0)
  assert.ok(r.stderr.includes('git mv warnyin-stages/* docs/stages/'), `stderr ต้องมีคำสั่ง git mv robust\nSTDERR:\n${r.stderr}`)
})

// 7. seedDocs ข้าม [...] — negative
test('7. seedDocs ข้าม [...] — ไม่มี entry ใต้ docs/ ที่ขึ้นต้น [', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')

  const docsDir = path.join(tmp, 'docs')
  const offending = listFiles(docsDir).filter((rel) =>
    rel.split(path.sep).some((seg) => seg.startsWith('[')),
  )
  assert.deepEqual(offending, [], `ต้องไม่มี path ใต้ docs/ ที่ขึ้นต้น [ : ${offending.join(', ')}`)
})

// 8. --dry-run ไม่เขียนไฟล์
test('8. --dry-run ไม่เขียนไฟล์ในโฟลเดอร์เปล่า', (t) => {
  const tmp = makeTempProject(t)
  const r = runCli(tmp, ['--dry-run'])
  ok(r, 'dry-run')
  assert.ok(r.stdout.includes('+ '), 'stdout ต้องมีรายการไฟล์ที่จะสร้าง (+ )')

  for (const rel of ['.warnyin', 'docs', 'CLAUDE.md', 'AGENTS.md', '.claude']) {
    assert.ok(!existsSync(path.join(tmp, rel)), `dry-run ต้องไม่สร้าง ${rel}`)
  }
  assert.deepEqual(listFiles(tmp), [], 'temp ต้องยังว่าง')
})

// 9. scaffold สร้างเปล่า — ไม่ลากงานจริง (topic) ของ repo ต้นทางไป target
test('9. installer สร้าง scaffold เปล่า ไม่ leak docs/stages/<topic>', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')

  // โครง scaffold เปล่าต้องถูก "สร้าง" ขึ้นมา
  assert.ok(existsSync(path.join(tmp, 'docs', 'stages', 'context.md')), 'ต้องสร้าง docs/stages/context.md')
  assert.ok(existsSync(path.join(tmp, 'docs', 'stages', 'achieved', '.gitkeep')), 'ต้องสร้าง docs/stages/achieved/.gitkeep')

  // ต้องไม่มี topic ใด ๆ ใต้ docs/stages — งานจริงของ repo ต้นทางห้ามรั่วมา target
  const topics = readdirSync(path.join(tmp, 'docs', 'stages'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'achieved')
    .map((e) => e.name)
  assert.deepEqual(topics, [], `ต้องไม่มี topic หลุดมา target: ${topics.join(', ')}`)
})

// header ทั้ง 4 ของ context.md ตาม canonical (design.md §3) — ใช้ร่วมหลายเคส
const CONTEXT_HEADERS = [
  '## โฟกัส/ธีมปัจจุบัน',
  '## Decision ข้าม topic',
  '## Parking lot',
  '## เพิ่ง ship',
]

// 10. seed-fresh — context.md ถูก seed ด้วย skeleton (non-empty + ครบ 4 header)
test('10. context.md seed skeleton ใน temp ว่าง (non-empty + 4 header)', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')

  const ctx = path.join(tmp, 'docs', 'stages', 'context.md')
  assert.ok(existsSync(ctx), 'ต้องสร้าง docs/stages/context.md')
  const body = readFileSync(ctx, 'utf8')
  assert.ok(body.trim().length > 0, 'context.md ต้อง non-empty (มี skeleton)')
  for (const h of CONTEXT_HEADERS) {
    assert.ok(body.includes(h), `context.md ต้องมี header "${h}"`)
  }
})

// 11. no-overwrite (install) — มี context.md เนื้อหาเดิม → install → byte-equal เดิม
test('11. context.md ที่มีอยู่แล้วต้องไม่ถูกทับ (install)', (t) => {
  const tmp = makeTempProject(t)
  const ctxDir = path.join(tmp, 'docs', 'stages')
  mkdirSync(ctxDir, { recursive: true })
  const ctx = path.join(ctxDir, 'context.md')
  const mine = 'งานของฉัน'
  writeFileSync(ctx, mine)

  ok(runCli(tmp), 'install')
  assert.equal(readFileSync(ctx, 'utf8'), mine, 'context.md ต้อง byte-equal เดิม (skip)')
})

// 12. no-overwrite (--update) — มี context.md เนื้อหาเดิม → --update → byte-equal เดิม
test('12. context.md ที่มีอยู่แล้วต้องไม่ถูกทับ (--update)', (t) => {
  const tmp = makeTempProject(t)
  const ctxDir = path.join(tmp, 'docs', 'stages')
  mkdirSync(ctxDir, { recursive: true })
  const ctx = path.join(ctxDir, 'context.md')
  const mine = 'งานของฉัน'
  writeFileSync(ctx, mine)

  ok(runCli(tmp, ['--update']), 'update')
  assert.equal(readFileSync(ctx, 'utf8'), mine, 'context.md ต้อง byte-equal เดิม (skip ตอน --update)')
})

// 13. dry-run — context.md ต้องไม่ถูกสร้างจริง แต่ exit 0
test('13. --dry-run ไม่สร้าง context.md จริง', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp, ['--dry-run']), 'dry-run')
  assert.ok(!existsSync(path.join(tmp, 'docs', 'stages', 'context.md')), 'dry-run ต้องไม่สร้าง context.md')
})

// 14. edge: legacy context.md ว่าง ('') → install → คง '' (skip, ไม่ทับด้วย skeleton)
test('14. context.md ว่างเดิม (legacy) ต้องคง "" ไม่ถูกทับด้วย skeleton', (t) => {
  const tmp = makeTempProject(t)
  const ctxDir = path.join(tmp, 'docs', 'stages')
  mkdirSync(ctxDir, { recursive: true })
  const ctx = path.join(ctxDir, 'context.md')
  writeFileSync(ctx, '')

  ok(runCli(tmp), 'install')
  assert.equal(readFileSync(ctx, 'utf8'), '', 'context.md ว่างเดิมต้องคง "" (seed-if-absent นับว่ามีไฟล์ = skip)')
})
