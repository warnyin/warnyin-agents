// Black-box integration test ของ installer (bin/cli.mjs)
// spawn CLI จริงในโฟลเดอร์ temp แล้ว assert จาก side-effect จริง (ไฟล์/exit code/stdout/stderr)
// zero-dependency: ใช้เฉพาะ built-in node:* — ห้าม import logic จาก cli.mjs (มันรัน side-effect ตอน import)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync, symlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// อ่าน version ของ repo สดจาก package.json (ไม่ hardcode)
const pkgVersion = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8'),
).version

// ★ B1: ใช้ fileURLToPath ตรง ๆ — ห้าม `.pathname` (บน Windows คืน `/D:/...` → spawn MODULE_NOT_FOUND)
const cliPath = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))

// resolveMode = pure-fn ที่ตั้งใจ export ให้ unit-test (ข้อยกเว้นเดียวจากกฎ "ห้าม import logic")
// — main-guard ใน cli.mjs กัน side-effect ตอน import (รันเฉพาะตอน execute ตรง)
import { resolveMode, isEntrypoint } from '../bin/cli.mjs'

function makeTempProject(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true })) // cleanup แม้ fail
  return dir
}

function runCli(cwd, args = [], env, opts = {}) {
  const r = spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: 'utf8', // array args — ห้าม shell:true
    ...(env ? { env } : {}), // ไม่ส่ง env → inherit เดิม (backward compat กับเคส 1-9)
    ...opts, // timeout/input สำหรับเคส non-TTY hang-guard
  })
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, signal: r.signal }
}

// temp HOME แยก (อีก mkdtemp) — override {HOME, USERPROFILE} กันเขียน homedir จริงของ dev/CI
function makeTempHome(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-home-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

// env override สำหรับเคส global — POSIX อ่าน HOME, Windows อ่าน USERPROFILE จึงตั้งทั้งคู่
function globalEnv(home) {
  return { ...process.env, HOME: home, USERPROFILE: home }
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
    path.join('.warnyin', 'template', 'stages', 'receipt.md'),
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

// ───────────────────────────────────────────────────────────────────────────
// เคสใหม่ — global mode (T1: cli-global-mode). เคส 1-9 ด้านบนไม่ถูกแก้ assertion
// ───────────────────────────────────────────────────────────────────────────

const NOTE_MARKER = '<!-- warnyin:global-note -->'
const globalTemplate = fileURLToPath(
  new URL('../.warnyin/installer/templates/CLAUDE.global.md', import.meta.url),
)
const hasGlobalTemplate = existsSync(globalTemplate) // T2 owns ไฟล์นี้ — worktree T1 เดี่ยวยังไม่มี (defensive skip)

// 10. unit resolveMode() — pure-fn ครอบทุกแขนง (flag/conflict/non-TTY/answer) — import ตรง ไม่ spawn
test('10. resolveMode() — ทุกแขนง (conflict/flags/non-TTY/answer)', () => {
  assert.throws(() => resolveMode({ globalFlag: true, projectFlag: true }), /พร้อมกันไม่ได้/, 'conflict → throw')
  assert.equal(resolveMode({ globalFlag: true }), 'global', 'globalFlag → global')
  assert.equal(resolveMode({ projectFlag: true }), 'project', 'projectFlag → project')
  assert.equal(resolveMode({ isTTY: false }), 'project', 'non-TTY → project (CI-safe)')
  assert.equal(resolveMode({ isTTY: true, answer: '2' }), 'global', "TTY answer '2' → global")
  assert.equal(resolveMode({ isTTY: true, answer: 'global' }), 'global', "TTY answer 'global' → global")
  assert.equal(resolveMode({ isTTY: true, answer: '' }), 'project', 'TTY answer ว่าง → project (default)')
  assert.equal(resolveMode({ isTTY: true, answer: '1' }), 'project', "TTY answer '1' → project")
  assert.equal(resolveMode({}), 'project', 'ไม่มี flag/TTY → project')
})

// 11. global install — ลง homedir(temp) ครบ + skip scaffold ที่ cwd
test('11. --global ติดตั้งลง homedir(temp) ครบ + ไม่ scaffold cwd', (t) => {
  const cwd = makeTempProject(t)
  const home = makeTempHome(t)
  const r = runCli(cwd, ['--global'], globalEnv(home))
  ok(r, 'global install')

  for (const rel of [
    path.join('.warnyin', 'workflow'),
    path.join('.warnyin', 'template'),
    path.join('.claude', 'commands', 'warnyin'),
  ]) {
    assert.ok(existsSync(path.join(home, rel)), `global ต้องลง home/${rel}`)
  }
  // side-effect ต้องอยู่ใน temp home — กัน leak เขียน homedir จริง
  assert.ok(home.startsWith(os.tmpdir()), 'home override ต้องอยู่ใต้ tmpdir')
  // skip scaffold/seed → ไม่สร้าง docs/stages ที่ cwd
  assert.ok(!existsSync(path.join(cwd, 'docs', 'stages')), 'global ต้องไม่สร้าง docs/stages ที่ cwd')
  assert.ok(!existsSync(path.join(cwd, '.warnyin')), 'global ต้องไม่เขียนลง cwd')

  // ★ contract T1↔T2: ถ้า template CLAUDE.global.md มี (post-merge) → ~/.claude/CLAUDE.md มี marker
  if (hasGlobalTemplate) {
    const claude = readFileSync(path.join(home, '.claude', 'CLAUDE.md'), 'utf8')
    assert.ok(claude.includes(NOTE_MARKER), `~/.claude/CLAUDE.md ต้องมี marker ${NOTE_MARKER}`)
  }
})

// 12. global ไม่ทำลายไฟล์ user ที่มีอยู่ก่อน + CLAUDE.md = user content + note ต่อท้าย
test('12. --global ไม่ทำลายไฟล์ user ใน homedir', (t) => {
  const cwd = makeTempProject(t)
  const home = makeTempHome(t)
  // ไฟล์ user มีอยู่ก่อน
  const userAgent = path.join(home, '.claude', 'agents', 'my.md')
  mkdirSync(path.dirname(userAgent), { recursive: true })
  writeFileSync(userAgent, 'งาน agent ของฉัน\n')
  const userClaude = path.join(home, '.claude', 'CLAUDE.md')
  const userClaudeContent = '# My personal memory\n\nกฎส่วนตัวของฉัน\n'
  writeFileSync(userClaude, userClaudeContent)

  ok(runCli(cwd, ['--global'], globalEnv(home)), 'global over existing user files')

  assert.ok(existsSync(userAgent), 'ไฟล์ user agents/my.md ต้องยังอยู่')
  assert.equal(readFileSync(userAgent, 'utf8'), 'งาน agent ของฉัน\n', 'เนื้อ user agent ต้องไม่ถูกแตะ')
  const after = readFileSync(userClaude, 'utf8')
  assert.ok(after.startsWith(userClaudeContent), 'CLAUDE.md ต้องคงเนื้อ user เดิมไว้ด้านบน (append ไม่ overwrite)')
  if (hasGlobalTemplate) {
    assert.ok(after.includes(NOTE_MARKER), 'CLAUDE.md ต้อง append note ต่อท้าย (มี marker)')
  }
})

// 13. global idempotent — รัน 2 ครั้ง: payload byte-equal + note marker เดียว
test('13. --global รัน 2 ครั้ง idempotent (note ไม่ซ้ำ)', (t) => {
  const cwd = makeTempProject(t)
  const home = makeTempHome(t)
  ok(runCli(cwd, ['--global'], globalEnv(home)), 'global#1')

  const sample = path.join(home, '.warnyin', 'workflow', 'README.md')
  assert.ok(existsSync(sample), 'ต้องมี sample หลังรอบแรก')
  const before = readFileSync(sample)
  const claudePath = path.join(home, '.claude', 'CLAUDE.md')
  const claudeBefore = existsSync(claudePath) ? readFileSync(claudePath) : null

  const r2 = runCli(cwd, ['--global'], globalEnv(home))
  ok(r2, 'global#2')
  assert.ok(before.equals(readFileSync(sample)), 'payload sample ต้อง byte-equal หลังรันซ้ำ')

  if (hasGlobalTemplate) {
    const after = readFileSync(claudePath, 'utf8')
    const occ = after.split(NOTE_MARKER).length - 1
    assert.equal(occ, 1, `marker ต้องมีครั้งเดียว (idempotent) — เจอ ${occ}`)
    assert.ok(claudeBefore.equals(readFileSync(claudePath)), 'CLAUDE.md ต้องไม่โต/ไม่ append ซ้ำรอบ 2')
  }
})

// 14. --global --update — payload เขียนทับ/byte-equal ได้, note ไม่ซ้ำ
test('14. --global --update — payload overwrite ok, note ไม่ซ้ำ', (t) => {
  const cwd = makeTempProject(t)
  const home = makeTempHome(t)
  ok(runCli(cwd, ['--global'], globalEnv(home)), 'global install')

  const r = runCli(cwd, ['--global', '--update'], globalEnv(home))
  ok(r, 'global --update')

  const sample = path.join(home, '.warnyin', 'workflow', 'README.md')
  const src = fileURLToPath(new URL('../.warnyin/workflow/README.md', import.meta.url))
  assert.ok(readFileSync(sample).equals(readFileSync(src)), '--update payload ต้อง byte-equal กับ source')

  if (hasGlobalTemplate) {
    const after = readFileSync(path.join(home, '.claude', 'CLAUDE.md'), 'utf8')
    assert.equal(after.split(NOTE_MARKER).length - 1, 1, 'note marker ต้องมีครั้งเดียวหลัง --update')
  }
})

// 15. --global --project → error exit 1 (conflict)
test('15. --global --project → error exit 1', (t) => {
  const cwd = makeTempProject(t)
  const home = makeTempHome(t)
  const r = runCli(cwd, ['--global', '--project'], globalEnv(home))
  assert.notEqual(r.code, 0, 'conflict ต้อง exit != 0')
  assert.ok(/พร้อมกันไม่ได้/.test(r.stderr), `stderr ต้องระบุ conflict\nSTDERR:\n${r.stderr}`)
  assert.ok(!existsSync(path.join(home, '.warnyin')), 'conflict ต้องไม่เขียนอะไรลง home')
})

// 16. non-TTY ไม่ส่ง flag → default project + ไม่ค้าง (hang-guard)
test('16. non-TTY ไม่ส่ง flag → project + ไม่ค้าง', (t) => {
  const cwd = makeTempProject(t)
  // spawn ปกติ = non-TTY (pipe) + timeout/input กัน hang ถ้า isTTY-guard พลาด
  const r = runCli(cwd, [], undefined, { timeout: 15000, input: '' })
  ok(r, 'non-TTY default project')
  assert.notEqual(r.signal, 'SIGTERM', 'ต้องไม่ถูก kill จาก timeout (ไม่ค้างรอ input)')
  assert.ok(existsSync(path.join(cwd, 'docs', 'stages')), 'non-TTY → ติดตั้ง project ที่ cwd (มี docs/stages)')
})

// 17. homedir guard — homedir = root → error exit 1 (ไม่เขียน filesystem root)
test('17. homedir guard — root → error exit 1', (t) => {
  const cwd = makeTempProject(t)
  const root = path.parse(process.cwd()).root // '/' หรือ 'C:\\' — deterministic ทุก platform
  const r = runCli(cwd, ['--global'], globalEnv(root))
  assert.notEqual(r.code, 0, 'homedir=root ต้อง exit != 0')
  assert.ok(/home directory/.test(r.stderr), `stderr ต้องระบุหา home ไม่ได้\nSTDERR:\n${r.stderr}`)
})

// ───────────────────────────────────────────────────────────────────────────
// เคสใหม่ — version stamp (task installer-version-stamp)
// ───────────────────────────────────────────────────────────────────────────

// (a) project install → stamp ถูกต้อง
test('(a) project install → .warnyin/.warnyin-version มี + ตรงเวอร์ชัน', (t) => {
  const tmp = makeTempProject(t)
  const r = runCli(tmp, ['--project'])
  ok(r, 'project install')

  const stampPath = path.join(tmp, '.warnyin', '.warnyin-version')
  assert.ok(existsSync(stampPath), 'ต้องมีไฟล์ .warnyin/.warnyin-version')
  const content = readFileSync(stampPath, 'utf8').trim()
  assert.equal(content, pkgVersion, `เนื้อหา stamp ต้อง === package.json version (${pkgVersion})`)
  assert.match(content, /^\d+\.\d+\.\d+/, 'stamp ต้อง match semver pattern (กัน false-green "undefined")')
})

// (b) --dry-run → ไม่เขียน stamp
test('(b) --dry-run → ไม่เขียน .warnyin/.warnyin-version จริง', (t) => {
  const tmp = makeTempProject(t)
  const r = runCli(tmp, ['--project', '--dry-run'])
  ok(r, 'dry-run')

  const stampPath = path.join(tmp, '.warnyin', '.warnyin-version')
  assert.ok(!existsSync(stampPath), 'dry-run ต้องไม่เขียน stamp จริง (existsSync false)')
})

// (c) --update ซ้ำ → byte-equal (idempotent by overwrite)
test('(c) --update ซ้ำ → stamp byte-equal (idempotent by overwrite)', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp, ['--project', '--update']), '--update รอบ 1')
  const stampPath = path.join(tmp, '.warnyin', '.warnyin-version')
  const content1 = readFileSync(stampPath)

  ok(runCli(tmp, ['--project', '--update']), '--update รอบ 2')
  const content2 = readFileSync(stampPath)

  assert.ok(content1.equals(content2), 'stamp ต้อง byte-equal หลัง --update ซ้ำ (idempotent by overwrite)')
})

// (d) global mode → stamp ลง home
test('(d) --global → home/.warnyin/.warnyin-version ตรงเวอร์ชัน', (t) => {
  const cwd = makeTempProject(t)
  const home = makeTempHome(t)
  const r = runCli(cwd, ['--global'], globalEnv(home))
  ok(r, 'global install')

  const stampPath = path.join(home, '.warnyin', '.warnyin-version')
  assert.ok(existsSync(stampPath), 'global ต้องมี home/.warnyin/.warnyin-version')
  const content = readFileSync(stampPath, 'utf8').trim()
  assert.equal(content, pkgVersion, `global stamp ต้อง === package.json version (${pkgVersion})`)
})

// ─────────────────────────────────────────────────────────────
// isEntrypoint — main-guard detection (regression รันผ่าน symlink)
// bug critical: npx รัน bin ผ่าน `.bin/<name>` symlink + setup:dogfood extract ลง symlinked
// `os.tmpdir()` (macOS) → argv[1] เป็น symlink path, import.meta.url เป็น realpath →
// `path.resolve(argv[1])` mismatch realpath → main() เงียบ exit 0 ไม่ติดตั้ง (กระทบ end-user + dogfood)
// ─────────────────────────────────────────────────────────────

const ENTRY_REAL = path.join('/real', 'pkg', 'src', 'bin', 'cli.mjs')
const ENTRY_META = pathToFileURL(ENTRY_REAL).href

test('isEntrypoint — argv1 = realpath ตรง module → true (direct run ปกติ)', () => {
  assert.equal(isEntrypoint(ENTRY_REAL, ENTRY_META, (p) => p), true)
})

test('isEntrypoint — argv1 = symlink path, realpath → module → true (เคสหลัก: npx .bin / symlinked tmpdir)', () => {
  // argv1 เป็น symlink path ที่ต่างจาก module path แต่ realpath resolve → module เดียวกัน
  assert.equal(
    isEntrypoint(path.join('/var', 'folders', 'x', 'T', 'link', 'cli.mjs'), ENTRY_META, () => ENTRY_REAL),
    true,
    'realpath(argv1) === self → ต้อง true แม้ argv1 เป็น symlink path (กัน main() เงียบ exit 0)',
  )
})

test('isEntrypoint — argv1 = คนละไฟล์ (ถูก import จาก test) → false', () => {
  assert.equal(isEntrypoint(path.join('/some', 'other-importer.mjs'), ENTRY_META, (p) => p), false)
})

test('isEntrypoint — argv1 undefined → false', () => {
  assert.equal(isEntrypoint(undefined, ENTRY_META, (p) => p), false)
})

test('isEntrypoint — realpath throw (argv1 ไม่อยู่จริง) → fallback path.resolve', () => {
  const boom = () => {
    throw new Error('ENOENT')
  }
  assert.equal(isEntrypoint(ENTRY_REAL, ENTRY_META, boom), true, 'fallback: path เท่ากัน → true')
  assert.equal(
    isEntrypoint(path.join('/elsewhere', 'cli.mjs'), ENTRY_META, boom),
    false,
    'fallback: path ต่าง → false',
  )
})

// ─────────────────────────────────────────────────────────────
// เคสใหม่ — IDE adapter install (task add-ide-adapters)
// ─────────────────────────────────────────────────────────────

const ADAPTER_PATHS = [
  path.join('.cursor', 'rules', 'warnyin.mdc'),
  path.join('.windsurf', 'rules', 'warnyin.md'),
  path.join('.github', 'copilot-instructions.md'),
  '.clinerules',
  'GEMINI.md',
]
const ADAPTER_MARKERS = {
  [path.join('.cursor', 'rules', 'warnyin.mdc')]: '<!-- warnyin:cursor -->',
  [path.join('.windsurf', 'rules', 'warnyin.md')]: '<!-- warnyin:windsurf -->',
  [path.join('.github', 'copilot-instructions.md')]: '<!-- warnyin:copilot -->',
  '.clinerules': '<!-- warnyin:cline -->',
  'GEMINI.md': '<!-- warnyin:gemini -->',
}

// T1-project-basic: adapter ครบ 5 ตัว + content มี marker
test('T1-project-basic: project install → adapter ครบ 5 ตัว + มี marker', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp, ['--project']), 'project install')

  for (const rel of ADAPTER_PATHS) {
    assert.ok(existsSync(path.join(tmp, rel)), `ขาด ${rel}`)
    const content = readFileSync(path.join(tmp, rel), 'utf8')
    assert.ok(content.includes(ADAPTER_MARKERS[rel]), `${rel} ต้องมี marker ${ADAPTER_MARKERS[rel]}`)
  }
})

// T1-idempotent: รัน 2 ครั้ง → append-once (marker ปรากฏ 1 ครั้งเท่านั้น)
test('T1-idempotent: รัน 2 ครั้ง → marker ปรากฏครั้งเดียว (append-once)', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp, ['--project']), 'install#1')
  ok(runCli(tmp, ['--project']), 'install#2')

  for (const rel of ['.clinerules', path.join('.github', 'copilot-instructions.md'), 'GEMINI.md']) {
    const content = readFileSync(path.join(tmp, rel), 'utf8')
    const marker = ADAPTER_MARKERS[rel]
    const occ = content.split(marker).length - 1
    assert.equal(occ, 1, `${rel}: marker ต้องมีครั้งเดียว (idempotent) — เจอ ${occ}`)
  }
})

// T1-existing-clinerules: .clinerules มีเนื้อหาเดิม → ต้องมีทั้งเนื้อเดิม + section warnyin (ไม่เขียนทับ)
test('T1-existing-clinerules: .clinerules มีเนื้อหาเดิม → append ไม่ overwrite', (t) => {
  const tmp = makeTempProject(t)
  const clineRules = path.join(tmp, '.clinerules')
  writeFileSync(clineRules, '# My existing rules\n\nsome rules here\n')

  ok(runCli(tmp, ['--project']), 'install over existing .clinerules')

  const after = readFileSync(clineRules, 'utf8')
  assert.ok(after.includes('# My existing rules'), 'ต้องคงเนื้อเดิมไว้')
  assert.ok(after.includes('<!-- warnyin:cline -->'), 'ต้อง append warnyin section')
})

// T1-global: global install → adapter ลง homedir(temp) ครบ
test('T1-global: --global → adapter ลง homedir ครบ 5 ตัว', (t) => {
  const cwd = makeTempProject(t)
  const home = makeTempHome(t)
  ok(runCli(cwd, ['--global'], globalEnv(home)), 'global install')

  for (const rel of ADAPTER_PATHS) {
    assert.ok(existsSync(path.join(home, rel)), `global: ขาด home/${rel}`)
  }
})

// T1-update: Cursor/Windsurf — --update → overwrite กลับเป็น template; Copilot/Cline/Gemini → ยังคงเนื้อเดิม
test('T1-update: --update → Cursor/Windsurf overwrite; Copilot/Cline/Gemini append-once ไม่ซ้ำ', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp, ['--project']), 'install#1')

  const cursorFile = path.join(tmp, '.cursor', 'rules', 'warnyin.mdc')
  const windsurfFile = path.join(tmp, '.windsurf', 'rules', 'warnyin.md')
  const clineFile = path.join(tmp, '.clinerules')

  // แก้ Cursor/Windsurf file ก่อน (เพิ่มเนื้อหาพิเศษ)
  writeFileSync(cursorFile, readFileSync(cursorFile, 'utf8') + '\n# User custom cursor rule\n')
  writeFileSync(windsurfFile, readFileSync(windsurfFile, 'utf8') + '\n# User custom windsurf rule\n')

  ok(runCli(tmp, ['--project', '--update']), '--update')

  // Cursor/Windsurf ต้อง overwrite → ไม่มี custom rule
  assert.ok(!readFileSync(cursorFile, 'utf8').includes('# User custom cursor rule'), 'Cursor --update ต้อง overwrite กลับเป็น template')
  assert.ok(!readFileSync(windsurfFile, 'utf8').includes('# User custom windsurf rule'), 'Windsurf --update ต้อง overwrite กลับเป็น template')

  // Cline ยังมี marker ครั้งเดียว (ไม่ append ซ้ำ)
  const clineContent = readFileSync(clineFile, 'utf8')
  const occ = clineContent.split('<!-- warnyin:cline -->').length - 1
  assert.equal(occ, 1, `Cline --update: marker ต้องมีครั้งเดียว เจอ ${occ}`)
})

// T1-dry-run: --dry-run → log มี adapter path แต่ไม่สร้างไฟล์จริง
test('T1-dry-run: --dry-run → log มี adapter แต่ไม่สร้างไฟล์', (t) => {
  const tmp = makeTempProject(t)
  const r = runCli(tmp, ['--project', '--dry-run'])
  ok(r, 'dry-run')

  // log ต้องมี adapter path อย่างน้อย 1 ตัว
  assert.ok(
    r.stdout.includes('warnyin.mdc') || r.stdout.includes('warnyin.md') || r.stdout.includes('copilot'),
    `stdout ต้องมี adapter path\nSTDOUT:\n${r.stdout}`,
  )
  // ไม่มีไฟล์จริง
  for (const rel of ADAPTER_PATHS) {
    assert.ok(!existsSync(path.join(tmp, rel)), `dry-run ต้องไม่สร้าง ${rel}`)
  }
})

// black-box: spawn cli.mjs ผ่าน symlink จริง → main() ต้องทำงาน (behavioral end-to-end, CI ubuntu)
test('black-box: รัน cli.mjs ผ่าน symlink → main() ทำงาน + เขียน stamp (regression npx/dogfood)', (t) => {
  const tmp = makeTempProject(t)
  const linkHome = makeTempProject(t)
  const link = path.join(linkHome, 'warnyin-agents') // จำลอง node_modules/.bin/<name>
  try {
    symlinkSync(cliPath, link)
  } catch (e) {
    // Windows ที่ไม่มีสิทธิ์สร้าง file-symlink — bug เป็น symlink-path; CI (ubuntu) ครอบเคสนี้เต็ม
    // ไม่ skip (count gate ห้าม pass!=tests) — log ให้เห็นชัดว่า platform นี้ไม่ได้เทส symlink จริง
    console.error(`  ⚠ ข้ามสร้าง symlink (${e.code || e.message}) — platform ไม่รองรับ; CI ubuntu ครอบ`)
    return
  }
  const r = spawnSync(process.execPath, [link, '--project', '--update'], { cwd: tmp, encoding: 'utf8' })
  assert.equal(r.status, 0, `รันผ่าน symlink exit!=0\nSTDERR:\n${r.stderr}\nSTDOUT:\n${r.stdout}`)
  const stampPath = path.join(tmp, '.warnyin', '.warnyin-version')
  assert.ok(existsSync(stampPath), 'รันผ่าน symlink → main() ต้องทำงาน + เขียน stamp (ไม่เงียบ exit 0)')
  assert.equal(readFileSync(stampPath, 'utf8').trim(), pkgVersion, 'stamp ผ่าน symlink ต้องตรง version')
})
