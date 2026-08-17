// Test ของเฟส prune (bin/cli.mjs) — unit (pure fn) + black-box (spawn cli จริง)
// zero-dependency: node:* เท่านั้น · harness copy จาก installer.test.mjs (ห้าม import ข้ามไฟล์เทส)
// ★ ไฟล์นี้เป็นเจ้าของแต่ผู้เดียว — installer.test.mjs / installer-upgrade.test.mjs ห้ามแตะ
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, symlinkSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

// pure fn ที่ cli.mjs export โดยเจตนา (main-guard กัน side-effect ตอน import — เหมือน resolveMode)
import {
  parseManifest, computeStale, mergeManifest, overCap, sanitizePath, toPosix, semverLt,
} from '../bin/cli.mjs'

// ── harness (copy จาก installer.test.mjs) ──────────────────────────────────
const cliPath = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url)) // ห้าม .pathname (Windows: /D:/...)
const srcRoot = fileURLToPath(new URL('..', import.meta.url)) // src/ (pkgRoot ต้นทาง payload จริง)

function makeTempProject(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-prune-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}
function makeTempHome(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-phome-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}
function globalEnv(home) {
  return { ...process.env, HOME: home, USERPROFILE: home } // POSIX=HOME, Windows=USERPROFILE
}
function runCli(cwd, args = [], env, opts = {}) {
  const r = spawnSync(process.execPath, [cliPath, ...args], {
    cwd, encoding: 'utf8', ...(env ? { env } : {}), ...opts,
  })
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, signal: r.signal }
}
function ok(r, msg = '') {
  assert.equal(r.code, 0, `${msg} exit!=0\nSTDERR:\n${r.stderr}\nSTDOUT:\n${r.stdout}`)
}
function listFiles(dir, base = dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) listFiles(full, base, acc)
    else acc.push(path.relative(base, full))
  }
  return acc
}
// normalize EOL + sha256 — ต้องตรงกับ hashOf ของ cli (buffer หลัง normalizeEol) สำหรับไฟล์ text
function normEol(s) { return String(s).replace(/\r\n/g, '\n').replace(/\r/g, '\n') }
function sha(content) { return createHash('sha256').update(Buffer.from(normEol(content), 'utf8')).digest('hex') }
// ต่อท้าย entry ลง manifest ที่ install สร้างไว้ (คง 91 entry เดิม + เพิ่ม stale)
function addManifestEntries(dir, entries) {
  const mp = path.join(dir, '.warnyin', '.warnyin-manifest')
  let cur = readFileSync(mp, 'utf8')
  if (!cur.endsWith('\n')) cur += '\n'
  cur += entries.map(([h, p]) => `${h}  ${p}`).join('\n') + '\n'
  writeFileSync(mp, cur)
}
// prunableRoots ของ project mode (contract stable — CORE ไม่ได้ export)
const PROJECT_ROOTS = ['.warnyin/workflow', '.warnyin/template', '.claude/commands/warnyin', '.claude/agents', '.claude/skills']
const HEX = 'f'.repeat(64)
// helper computeStale entry เดียว (project roots)
function cs(entryPath, { sha256 = HEX, roots = PROJECT_ROOTS, onDisk = true } = {}) {
  return computeStale({
    manifestOld: [{ path: entryPath, sha256 }],
    payloadNew: new Set(),
    prunableRoots: roots,
    statOnDisk: () => onDisk,
  })
}

// ════════════════════════ Batch 1: U1–U34 (unit) ════════════════════════

test('U1 parseManifest 2 บรรทัด valid', () => {
  const h = 'a'.repeat(64), h2 = 'b'.repeat(64)
  const r = parseManifest(`${h}  a/b.md\n${h2}  a/c.md\n`)
  assert.equal(r.entries.length, 2)
  assert.equal(r.rejected.length, 0)
  assert.deepEqual(r.entries.map((e) => e.path), ['a/b.md', 'a/c.md'])
})
test('U2 ข้ามบรรทัดว่าง + #', () => {
  const h = 'a'.repeat(64)
  const r = parseManifest(`# header\n\n${h}  a/b.md\n\n# note\n`)
  assert.equal(r.entries.length, 1)
  assert.equal(r.rejected.length, 0)
})
test('U3 CRLF parse ได้ path ไม่มี \\r', () => {
  const h = 'a'.repeat(64), h2 = 'b'.repeat(64)
  const r = parseManifest(`${h}  a/b.md\r\n${h2}  a/c.md\r\n`)
  assert.equal(r.entries.length, 2)
  assert.ok(r.entries.every((e) => !e.path.includes('\r')))
})
test('U4 sha ผิดรูป 3 แบบ → rejected hash:missing', () => {
  const r = parseManifest(`${'a'.repeat(63)}  x.md\n${'g' + 'a'.repeat(63)}  y.md\nnoseparatorhere\n`)
  assert.equal(r.entries.length, 0)
  assert.equal(r.rejected.length, 3)
  assert.ok(r.rejected.every((x) => x.reason === 'hash:missing'))
})
test('U5 duplicate path → ทิ้งทั้งคู่', () => {
  const r = parseManifest(`${'a'.repeat(64)}  same.md\n${'b'.repeat(64)}  same.md\n`)
  assert.equal(r.entries.length, 0)
  assert.equal(r.rejected.length, 2)
})
test('U6 เกิน maxEntries → ทั้งไฟล์ใช้ไม่ได้ (ไม่ throw)', () => {
  const h = 'a'.repeat(64)
  let txt = ''
  for (let i = 0; i < 5001; i++) txt += `${h}  f${i}.md\n`
  const r = parseManifest(txt, { maxEntries: 5000 })
  assert.equal(r.entries.length, 0)
  assert.equal(r.manifestUsable, false)
})
test('U7 null/undefined/empty → ไม่ throw', () => {
  for (const t of [null, undefined, '']) {
    const r = parseManifest(t)
    assert.deepEqual(r.entries, [])
  }
})
test('U8 toPosix แปลง native sep → /', () => {
  assert.equal(toPosix('.warnyin\\workflow\\x.md', '\\'), '.warnyin/workflow/x.md')
  assert.ok(!toPosix(path.join('.warnyin', 'workflow')).includes('\\'))
})
test('U9 backslash → path:backslash', () => {
  const r = cs('.warnyin\\workflow\\x.md')
  assert.ok(r.rejected.some((x) => x.reason === 'path:backslash'))
  assert.equal(r.stale.length, 0)
})
test('U10 .. segment → path:dot-segment', () => {
  assert.ok(cs('.warnyin/workflow/../../etc/passwd').rejected.some((x) => x.reason === 'path:dot-segment'))
})
test('U11 . segment → path:dot-segment', () => {
  assert.ok(cs('.warnyin/workflow/./x.md').rejected.some((x) => x.reason === 'path:dot-segment'))
})
test('U12 absolute + drive → path:absolute', () => {
  for (const p of ['/etc/passwd', 'C:/Windows/x.md']) {
    assert.ok(cs(p).rejected.some((x) => x.reason === 'path:absolute'), p)
  }
})
test('U13 control char → path:control-char', () => {
  for (const p of ['.warnyin/workflow/x\u0007.md', '.warnyin/workflow/x\u0000.md', '.warnyin/workflow/x\u007f.md']) {
    assert.ok(cs(p).rejected.some((x) => x.reason === 'path:control-char'), JSON.stringify(p))
  }
})
test('U14 นอก prunableRoots → scope:outside-root', () => {
  assert.ok(cs('docs/project.md').rejected.some((x) => x.reason === 'scope:outside-root'))
})
test('U15 prefix คล้าย root (segment-wise) → scope:outside-root', () => {
  assert.ok(cs('.warnyin/workflow-old/x.md').rejected.some((x) => x.reason === 'scope:outside-root'))
})
test('U16 rel === root → ไม่ถูก reject ด้วย (5)', () => {
  const r = cs('.warnyin/workflow')
  assert.ok(!r.rejected.some((x) => x.reason === 'scope:outside-root'))
})
test('U17 .claude/agents/warnyin-*.md → ผ่าน (stale)', () => {
  const r = cs('.claude/agents/warnyin-old.md')
  assert.equal(r.rejected.length, 0)
  assert.ok(r.stale.some((s) => s.path === '.claude/agents/warnyin-old.md'))
})
test('U18 .claude/agents/ ชื่ออื่น → scope:not-allowlisted', () => {
  assert.ok(cs('.claude/agents/my-agent.md').rejected.some((x) => x.reason === 'scope:not-allowlisted'))
})
test('U19 .claude/skills/explore → ผ่าน (stale)', () => {
  const r = cs('.claude/skills/explore/SKILL.md')
  assert.equal(r.rejected.length, 0)
  assert.ok(r.stale.some((s) => s.path === '.claude/skills/explore/SKILL.md'))
})
test('U20 .claude/skills/ ไม่ allow → scope:not-allowlisted', () => {
  assert.ok(cs('.claude/skills/playwright-cli/SKILL.md').rejected.some((x) => x.reason === 'scope:not-allowlisted'))
})
test('U21 structural: allowlist ⊇ skill dir จริงใน payload (C5 append-only)', () => {
  const skillsDir = path.join(srcRoot, '.claude', 'skills')
  const dirs = readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  assert.ok(dirs.length > 0, 'ต้องมี skill dir ใน payload')
  for (const d of dirs) {
    const r = cs(`.claude/skills/${d}/SKILL.md`)
    assert.ok(!r.rejected.some((x) => x.reason === 'scope:not-allowlisted'), `skill ${d} ต้องอยู่ใน allowlist`)
  }
})
test('U22 มี manifest → known-stale ไม่ทำงาน', () => {
  const ks = ['.warnyin/template/stages/[topic]/test.md', '.warnyin/template/stages/[topic]/verify.md']
  const r = computeStale({
    manifestOld: [{ path: '.warnyin/template/x.md', sha256: HEX }],
    payloadNew: new Set(), knownStale: ks, prunableRoots: PROJECT_ROOTS, statOnDisk: () => true,
  })
  assert.ok(!r.stale.some((s) => s.source === 'known-stale'))
})
test('U23 ไม่มี manifest → known-stale ทำงาน (source/sha)', () => {
  const ks = ['.warnyin/template/stages/[topic]/test.md', '.warnyin/template/stages/[topic]/verify.md']
  const r = computeStale({
    manifestOld: [], payloadNew: new Set(), knownStale: ks, prunableRoots: PROJECT_ROOTS, statOnDisk: () => true,
  })
  assert.equal(r.stale.length, 2)
  assert.ok(r.stale.every((s) => s.source === 'known-stale' && s.sha256 === null))
})
test('U24 อยู่ทั้ง manifest และ payload → ไม่ stale', () => {
  const r = computeStale({
    manifestOld: [{ path: '.warnyin/workflow/x.md', sha256: HEX }],
    payloadNew: new Set(['.warnyin/workflow/x.md']), prunableRoots: PROJECT_ROOTS, statOnDisk: () => true,
  })
  assert.ok(!r.stale.some((s) => s.path === '.warnyin/workflow/x.md'))
})
test('U25 ไม่มีบนดิสก์ → ไม่ stale', () => {
  const r = computeStale({
    manifestOld: [{ path: '.warnyin/workflow/y.md', sha256: HEX }],
    payloadNew: new Set(), prunableRoots: PROJECT_ROOTS, statOnDisk: () => false,
  })
  assert.equal(r.stale.length, 0)
})
test('U26 unique + เรียง A→Z', () => {
  const ks = ['.warnyin/template/b.md', '.warnyin/template/a.md', '.warnyin/template/b.md']
  const r = computeStale({
    manifestOld: [], payloadNew: new Set(), knownStale: ks, prunableRoots: PROJECT_ROOTS, statOnDisk: () => true,
  })
  const paths = r.stale.map((s) => s.path)
  assert.deepEqual(paths, [...new Set(paths)].sort())
})
test('U27 source manifest + sha null/empty → hash:missing', () => {
  for (const bad of [null, '']) {
    const r = computeStale({
      manifestOld: [{ path: '.warnyin/workflow/x.md', sha256: bad }],
      payloadNew: new Set(), prunableRoots: PROJECT_ROOTS, statOnDisk: () => true,
    })
    assert.ok(r.rejected.some((x) => x.reason === 'hash:missing'))
    assert.equal(r.stale.length, 0)
  }
})
test('U28 sep \\ = sep / (POSIX input — พิสูจน์ C6 บน Linux)', () => {
  const base = {
    manifestOld: [{ path: '.warnyin/workflow/x.md', sha256: HEX }],
    payloadNew: new Set(), prunableRoots: PROJECT_ROOTS, statOnDisk: () => true,
  }
  const a = computeStale({ ...base, sep: '/' })
  const b = computeStale({ ...base, sep: '\\' })
  assert.deepEqual(a.stale, b.stale)
  assert.deepEqual(a.rejected, b.rejected)
})
test('U29 overCap boundary (50 ผ่าน / 51 ไม่ / dry / force)', () => {
  assert.equal(overCap(50, {}), false)
  assert.equal(overCap(51, {}), true)
  assert.equal(overCap(51, { dry: true }), false)
  assert.equal(overCap(51, { force: true }), false)
})
test('U30 mergeManifest คง hash เดิมของ entry บนดิสก์', () => {
  const stat = (p) => p === '.warnyin/workflow/p.md'
  const out = mergeManifest(new Map([['.warnyin/workflow/new.md', 'a'.repeat(64)]]),
    [{ path: '.warnyin/workflow/p.md', sha256: '1'.repeat(64) }], stat)
  assert.equal(out.get('.warnyin/workflow/p.md'), '1'.repeat(64))
})
test('U31 mergeManifest entry ไม่อยู่บนดิสก์ → หาย', () => {
  const out = mergeManifest(new Map(), [{ path: '.warnyin/workflow/p.md', sha256: '1'.repeat(64) }], () => false)
  assert.ok(!out.has('.warnyin/workflow/p.md'))
})
test('U32 sanitizePath strip ANSI/control + ตัดยาว', () => {
  const r = sanitizePath('a\u001b[31mb/c.md')
  assert.ok(!r.includes('\u001b'))
  assert.ok(sanitizePath('x'.repeat(500)).length < 500)
})
test('U33 structural: PRUNE_REASON = 13 ค่าพอดี + ไม่มี literal hardcode ในบรรทัดรายงาน', () => {
  const src = readFileSync(cliPath, 'utf8')
  // (ก) สกัดจาก declaration ของ const เซตปิด
  const m = src.match(/const PRUNE_REASON = \{([\s\S]*?)\n\}/)
  assert.ok(m, 'ต้องเจอ declaration ของ const PRUNE_REASON')
  const vals = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1])
  const expected = [
    'path:backslash', 'path:dot-segment', 'path:absolute', 'path:control-char',
    'scope:outside-root', 'scope:not-allowlisted', 'hash:missing', 'hash:mismatch',
    'prune:too-large', 'prune:symlink', 'prune:not-contained', 'prune:io', 'prune:blast-cap',
  ]
  assert.equal(vals.length, 13)
  assert.deepEqual([...vals].sort(), [...expected].sort())
  // (ข) negative: ไม่มี literal [xxx:yyy] hardcode ในบรรทัด console (ต้องอ้างผ่านตัวแปร)
  const bad = src.split('\n').filter((l) => /console\.(log|warn|error)/.test(l) && /\[(path|scope|hash|prune):[a-z-]+\]/.test(l))
  assert.deepEqual(bad, [], `ห้าม hardcode [reason] ในบรรทัดรายงาน:\n${bad.join('\n')}`)
})
test('U34 mergeManifest guard path ก่อน statOnDisk (spy)', () => {
  const calls = []
  const spy = (p) => { calls.push(p); return true }
  const bad = [
    { path: '../x', sha256: '1'.repeat(64) },
    { path: '.warnyin/workflow/../../../etc/passwd', sha256: '1'.repeat(64) },
  ]
  const out = mergeManifest(new Map(), bad, spy)
  assert.ok(!out.has('../x'))
  assert.ok(!out.has('.warnyin/workflow/../../../etc/passwd'))
  assert.ok(!calls.includes('../x'))
  assert.ok(!calls.includes('.warnyin/workflow/../../../etc/passwd'))
})

// ════════════════════ Batch 2: F1–F9 (guard/scope/cap) ════════════════════

test('F1 symlink dir ออกนอก temp → victim รอด + gone ถูกลบ', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  const goneRel = '.warnyin/template/gone.md'
  const goneContent = 'ตกรุ่น\n'
  writeFileSync(path.join(tmp, goneRel), goneContent)
  const outside = makeTempProject(t)
  const victimAbs = path.join(outside, 'victim.md')
  writeFileSync(victimAbs, 'เหยื่อ\n')
  const linkAbs = path.join(tmp, '.warnyin', 'template', 'link')
  try {
    symlinkSync(outside, linkAbs, 'dir')
  } catch {
    console.error('  ⚠ F1 ข้าม: สร้าง symlink ไม่ได้ (Windows)')
    return
  }
  addManifestEntries(tmp, [[sha(goneContent), goneRel], [sha('เหยื่อ\n'), '.warnyin/template/link/victim.md']])
  const r = runCli(tmp, ['--update'])
  ok(r, 'update')
  assert.ok(existsSync(victimAbs), 'victim.md ต้องยังอยู่')
  assert.ok(r.stdout.includes('prune:not-contained') || r.stdout.includes('prune:symlink'),
    `stdout ต้องมี not-contained/symlink\n${r.stdout}`)
  assert.ok(!existsSync(path.join(tmp, goneRel)), 'gone.md ต้องถูกลบในรันเดียวกัน')
})
test('F2 entry เป็น symlink ไฟล์ชี้ออกนอก → prune:symlink', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  const outside = makeTempProject(t)
  const realFile = path.join(outside, 'real.md')
  writeFileSync(realFile, 'ของจริง\n')
  const linkRel = '.warnyin/template/badlink.md'
  try {
    symlinkSync(realFile, path.join(tmp, linkRel), 'file')
  } catch {
    console.error('  ⚠ F2 ข้าม: สร้าง symlink ไม่ได้ (Windows)')
    return
  }
  addManifestEntries(tmp, [[sha('ของจริง\n'), linkRel]])
  const r = runCli(tmp, ['--update'])
  ok(r, 'update')
  assert.ok(existsSync(realFile), 'ปลายทาง symlink ต้องยังอยู่')
  assert.ok(r.stdout.includes('prune:symlink'), `stdout ต้องมี prune:symlink\n${r.stdout}`)
})
test('F3 hash ไม่ตรง → ไม่ลบ + hash:mismatch', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  const rel = '.warnyin/template/edited.md'
  writeFileSync(path.join(tmp, rel), 'ผู้ใช้แก้เอง\n')
  addManifestEntries(tmp, [[sha('เนื้อคนละอัน\n'), rel]])
  const r = runCli(tmp, ['--update'])
  ok(r, 'update')
  assert.ok(existsSync(path.join(tmp, rel)), 'ไฟล์ต้องยังอยู่')
  assert.ok(r.stdout.includes('hash:mismatch'), `stdout ต้องมี hash:mismatch\n${r.stdout}`)
})
test('F4 empty dir ของผู้ใช้รอด (ไม่เคยเป็น candidate)', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  mkdirSync(path.join(tmp, '.warnyin', 'workflow', 'my-empty-dir'), { recursive: true })
  const goneRel = '.warnyin/template/gone.md'
  writeFileSync(path.join(tmp, goneRel), 'x\n')
  addManifestEntries(tmp, [[sha('x\n'), goneRel]])
  const r = runCli(tmp, ['--update'])
  ok(r, 'update')
  assert.ok(existsSync(path.join(tmp, '.warnyin', 'workflow', 'my-empty-dir')), 'empty dir ผู้ใช้ต้องอยู่')
  assert.ok(!existsSync(path.join(tmp, goneRel)), 'gone ถูกลบ')
})
test('F5 orphan-dir หายไปด้วย · prunableRoot รอด', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  const orphanRel = '.warnyin/template/orphan-dir/only.md'
  mkdirSync(path.dirname(path.join(tmp, orphanRel)), { recursive: true })
  writeFileSync(path.join(tmp, orphanRel), 'x\n')
  addManifestEntries(tmp, [[sha('x\n'), orphanRel]])
  const r = runCli(tmp, ['--update'])
  ok(r, 'update')
  assert.ok(!existsSync(path.join(tmp, '.warnyin', 'template', 'orphan-dir')), 'orphan-dir หายไป')
  assert.ok(existsSync(path.join(tmp, '.warnyin', 'template')), '.warnyin/template ยังอยู่')
})
test('F6 --global: dir แชร์รอด · .warnyin/template ถูกลบ', (t) => {
  const home = makeTempHome(t)
  ok(runCli(home, ['--global'], globalEnv(home)), 'global install')
  const mineRel = '.claude/agents/warnyin-mine.md'
  writeFileSync(path.join(home, mineRel), 'ของฉัน\n')
  const staleRel = '.warnyin/template/stale.md'
  writeFileSync(path.join(home, staleRel), 'ตกรุ่น\n')
  addManifestEntries(home, [[sha('ของฉัน\n'), mineRel], [sha('ตกรุ่น\n'), staleRel]])
  const r = runCli(home, ['--global', '--update'], globalEnv(home))
  ok(r, 'global update')
  assert.ok(existsSync(path.join(home, mineRel)), 'warnyin-mine.md ต้องอยู่ (global scope 3 dir)')
  assert.ok(!existsSync(path.join(home, staleRel)), 'stale.md ถูกลบ')
})
test('F7 51 entry → blast-cap ไม่ลบ · dry-run list 51 ได้', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  const entries = []
  for (let i = 0; i < 51; i++) {
    const rel = `.warnyin/template/bulk-${i}.md`
    const c = `ตกรุ่น ${i}\r\n` // CRLF — บังคับให้ hash ฝั่งอ่านต้อง normalize (คุ้ม A4)
    writeFileSync(path.join(tmp, rel), c)
    entries.push([sha(c), rel])
  }
  addManifestEntries(tmp, entries)
  const r = runCli(tmp, ['--update'])
  ok(r, 'update')
  assert.ok(r.stdout.includes('⚠ [prune:blast-cap] '), `stdout ต้องมี blast-cap\n${r.stdout}`)
  for (let i = 0; i < 51; i++) assert.ok(existsSync(path.join(tmp, `.warnyin/template/bulk-${i}.md`)), `bulk-${i} ต้องอยู่`)
  const d = runCli(tmp, ['--update', '--dry-run'])
  ok(d, 'dry')
  assert.ok(d.stdout.includes('จะลบ:'), 'ต้องมี จะลบ:')
  const dash = d.stdout.split('\n').filter((l) => l.startsWith('  − ')).length
  assert.equal(dash, 51, `dry-run ต้อง list 51 (ได้ ${dash})`)
})
test('F8 50 entry → ลบครบ 50 (boundary คู่ F7)', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  const entries = []
  for (let i = 0; i < 50; i++) {
    const rel = `.warnyin/template/bulk-${i}.md`
    const c = `ตกรุ่น ${i}\r\n` // CRLF — normalize ฝั่งอ่าน load-bearing (A4)
    writeFileSync(path.join(tmp, rel), c)
    entries.push([sha(c), rel])
  }
  addManifestEntries(tmp, entries)
  const r = runCli(tmp, ['--update'])
  ok(r, 'update')
  assert.ok(r.stdout.includes('ลบ 50'), `สรุปต้องมี ลบ 50\n${r.stdout}`)
  for (let i = 0; i < 50; i++) assert.ok(!existsSync(path.join(tmp, `.warnyin/template/bulk-${i}.md`)), `bulk-${i} ถูกลบ`)
})
test('F9 --no-prune / env → ไม่ลบ + manifest คง entry · รอบถัดไปลบได้', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  const rel = '.warnyin/template/gone.md'
  const c = 'ตกรุ่น\n'
  writeFileSync(path.join(tmp, rel), c)
  addManifestEntries(tmp, [[sha(c), rel]])
  const r1 = runCli(tmp, ['--update', '--no-prune'])
  ok(r1, 'no-prune')
  assert.ok(r1.stdout.includes('ลบ 0'), 'รอบ1 ลบ 0')
  assert.ok(existsSync(path.join(tmp, rel)), 'รอบ1 ไฟล์ยังอยู่')
  const r2 = runCli(tmp, ['--update'], { ...process.env, WARNYIN_NO_PRUNE: '1' })
  ok(r2, 'env no-prune')
  assert.ok(existsSync(path.join(tmp, rel)), 'รอบ2 ไฟล์ยังอยู่')
  assert.ok(readFileSync(path.join(tmp, '.warnyin', '.warnyin-manifest'), 'utf8').includes(rel), 'manifest คง entry (C13)')
  const r3 = runCli(tmp, ['--update'])
  ok(r3, 'update')
  assert.ok(!existsSync(path.join(tmp, rel)), 'รอบ3 ถูกลบ')
})

// ══════════ Batch 3: F10–F19 (dry-run/manifest/idempotent/stamp/global) ══════════

test('F10 --update --dry-run: ไม่ลบ · manifest byte-equal · listFiles เท่าเดิม', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  const rel = '.warnyin/template/gone.md'
  const c = 'ตกรุ่น\n'
  writeFileSync(path.join(tmp, rel), c)
  addManifestEntries(tmp, [[sha(c), rel]])
  const before = listFiles(tmp).sort()
  const mfBefore = readFileSync(path.join(tmp, '.warnyin', '.warnyin-manifest'))
  const r = runCli(tmp, ['--update', '--dry-run'])
  ok(r, 'dry')
  assert.ok(r.stdout.includes('จะลบ:'), 'ต้องมี จะลบ:')
  assert.ok(existsSync(path.join(tmp, rel)), 'ไฟล์ไม่ถูกลบ')
  assert.deepEqual(listFiles(tmp).sort(), before, 'listFiles ก่อน/หลังเท่ากัน')
  assert.ok(mfBefore.equals(readFileSync(path.join(tmp, '.warnyin', '.warnyin-manifest'))), 'manifest byte-equal')
})
test('F11 install สด: ไม่มี − · manifest 91 entry · เรียง A→Z', (t) => {
  const tmp = makeTempProject(t)
  const r = runCli(tmp)
  ok(r, 'install')
  assert.ok(!r.stdout.split('\n').some((l) => l.startsWith('  − ')), 'ไม่มีบรรทัด −')
  assert.ok(r.stdout.includes('ลบ 0'), 'สรุป ลบ 0')
  const mp = path.join(tmp, '.warnyin', '.warnyin-manifest')
  assert.ok(existsSync(mp), 'มี .warnyin/.warnyin-manifest')
  const lines = readFileSync(mp, 'utf8').split('\n').filter(Boolean)
  assert.match(lines[0], /^# warnyin manifest v1 — เขียนโดย installer .+ · ห้ามแก้มือ$/, 'บรรทัดแรก N3')
  const body = lines.slice(1)
  for (const l of body) assert.match(l, /^[0-9a-f]{64} {2}[^\\\r]+$/, `บรรทัดผิดรูป: ${l}`)
  // นับไฟล์จริงใน CORE 5 dir ของ src/
  let count = 0
  const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else count++ } }
  for (const c of [['.warnyin', 'workflow'], ['.warnyin', 'template'], ['.claude', 'commands', 'warnyin'], ['.claude', 'agents'], ['.claude', 'skills']]) {
    const dd = path.join(srcRoot, ...c)
    if (existsSync(dd)) walk(dd)
  }
  assert.equal(body.length, count, `entry (${body.length}) = ไฟล์จริง CORE (${count})`)
  assert.equal(body.length, 91, `entry === 91 (pin — payload โต ให้อัปเลข ห้ามผ่อนเป็น >) ได้ ${body.length}`)
  const paths = body.map((l) => l.split('  ')[1])
  assert.deepEqual(paths, [...paths].sort(), 'path เรียง A→Z')
})
test('F12 manifest ขยะ > 1 MB → whole-file reject (stderr ⚠) · เขียนทับถูกต้อง', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  const mp = path.join(tmp, '.warnyin', '.warnyin-manifest')
  writeFileSync(mp, 'ขยะไม่ใช่ manifest '.repeat(60000)) // > 1 MB
  const r = runCli(tmp, ['--update'])
  ok(r, 'update')
  assert.ok(existsSync(path.join(tmp, '.warnyin', 'workflow', 'README.md')), 'payload ยังครบ')
  assert.ok(r.stderr.includes('⚠'), `stderr ต้องมี ⚠ (whole-file reject)\n${r.stderr}`)
  assert.ok(!r.stdout.includes('ขยะไม่ใช่'), 'stdout ไม่มีเนื้อ manifest ดิบ')
  assert.match(readFileSync(mp, 'utf8').split('\n')[0], /^# warnyin manifest v1/, 'เขียนทับเป็นรูปถูกต้อง')
})
test('F13 T1: byte-equal skip → อยู่ใน manifest · เนื้อต่าง → ไม่อยู่', (t) => {
  const relReadme = '.warnyin/workflow/README.md'
  const srcReadme = path.join(srcRoot, '.warnyin', 'workflow', 'README.md')
  const payloadContent = Buffer.from(normEol(readFileSync(srcReadme, 'utf8')), 'utf8')
  // เคส byte-equal
  const tmp = makeTempProject(t)
  mkdirSync(path.dirname(path.join(tmp, relReadme)), { recursive: true })
  writeFileSync(path.join(tmp, relReadme), payloadContent)
  ok(runCli(tmp), 'install (byte-equal skip)')
  const mf = readFileSync(path.join(tmp, '.warnyin', '.warnyin-manifest'), 'utf8')
  assert.ok(mf.split('\n').some((l) => l.endsWith('  ' + relReadme)), 'byte-equal → path ต้องอยู่ใน manifest (T1)')
  // เคสเนื้อต่าง
  const tmp2 = makeTempProject(t)
  mkdirSync(path.dirname(path.join(tmp2, relReadme)), { recursive: true })
  writeFileSync(path.join(tmp2, relReadme), 'เนื้อผู้ใช้เอง คนละอัน\n')
  ok(runCli(tmp2), 'install (byte-different)')
  const mf2 = readFileSync(path.join(tmp2, '.warnyin', '.warnyin-manifest'), 'utf8')
  assert.ok(!mf2.split('\n').some((l) => l.endsWith('  ' + relReadme)), 'เนื้อต่าง → path ต้องไม่อยู่ใน manifest')
})
test('F14 install → --update ทันที: ลบ 0 · file set เท่าเดิม', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  const before = listFiles(tmp).sort()
  const r = runCli(tmp, ['--update'])
  ok(r, 'update')
  assert.ok(r.stdout.includes('ลบ 0'), 'ลบ 0')
  assert.deepEqual(listFiles(tmp).sort(), before, 'listFiles เท่าเดิม')
})
test('F15 path มี ANSI/control ใน manifest → stdout ไม่มี \\u001b', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  addManifestEntries(tmp, [[HEX, '.warnyin/template/\u001b[31mevil\u0007.md']])
  const r = runCli(tmp, ['--update'])
  ok(r, 'update')
  assert.ok(!r.stdout.includes('\u001b'), 'stdout ต้องไม่มี \\u001b')
})
test('F16 --update 2 ครั้งติด → manifest byte-equal (idempotent)', (t) => {
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  ok(runCli(tmp, ['--update']), 'update1')
  const mf1 = readFileSync(path.join(tmp, '.warnyin', '.warnyin-manifest'))
  ok(runCli(tmp, ['--update']), 'update2')
  const mf2 = readFileSync(path.join(tmp, '.warnyin', '.warnyin-manifest'))
  assert.ok(mf1.equals(mf2), 'manifest byte-equal')
})
test('F17 --dry-run temp เปล่า → ไม่เขียนไฟล์ (manifest ไม่ถูกเขียน)', (t) => {
  const tmp = makeTempProject(t)
  const r = runCli(tmp, ['--dry-run'])
  ok(r, 'dry-run')
  assert.deepEqual(listFiles(tmp), [], 'temp ต้องยังว่าง')
})
test('F18 known-stale end-to-end: 0.29.0 ลบได้ / 0.30.1 ไม่ลบ (stamp order)', (t) => {
  // ขั้วบวก — stamp 0.29.0
  const tmp = makeTempProject(t)
  ok(runCli(tmp), 'install')
  writeFileSync(path.join(tmp, '.warnyin', '.warnyin-version'), '0.29.0\n')
  const topicDir = path.join(tmp, '.warnyin', 'template', 'stages', '[topic]')
  mkdirSync(topicDir, { recursive: true })
  writeFileSync(path.join(topicDir, 'test.md'), 'known stale test\n')
  writeFileSync(path.join(topicDir, 'verify.md'), 'known stale verify\n')
  rmSync(path.join(tmp, '.warnyin', '.warnyin-manifest'), { force: true }) // manifestOld ว่าง
  const r = runCli(tmp, ['--update'])
  ok(r, 'update 0.29.0')
  assert.ok(!existsSync(path.join(topicDir, 'test.md')), 'test.md ต้องหาย')
  assert.ok(!existsSync(path.join(topicDir, 'verify.md')), 'verify.md ต้องหาย')
  assert.ok(r.stdout.includes('ลบ 2'), `สรุป ลบ 2\n${r.stdout}`)
  // ขั้วลบ — stamp 0.30.1 (ถ้าอ่าน stamp หลัง writeVersionStamp ขั้วนี้จะแดง — A12)
  const tmp2 = makeTempProject(t)
  ok(runCli(tmp2), 'install2')
  writeFileSync(path.join(tmp2, '.warnyin', '.warnyin-version'), '0.30.1\n')
  const topicDir2 = path.join(tmp2, '.warnyin', 'template', 'stages', '[topic]')
  mkdirSync(topicDir2, { recursive: true })
  writeFileSync(path.join(topicDir2, 'test.md'), 'x\n')
  writeFileSync(path.join(topicDir2, 'verify.md'), 'y\n')
  rmSync(path.join(tmp2, '.warnyin', '.warnyin-manifest'), { force: true })
  const r2 = runCli(tmp2, ['--update'])
  ok(r2, 'update 0.30.1')
  assert.ok(existsSync(path.join(topicDir2, 'test.md')), 'test.md ต้องอยู่ (0.30.1)')
  assert.ok(existsSync(path.join(topicDir2, 'verify.md')), 'verify.md ต้องอยู่ (0.30.1)')
  assert.ok(r2.stdout.includes('ลบ 0'), 'ลบ 0 (0.30.1)')
})
test('F19 C16: --global manifest ไม่บันทึก .claude/{agents,skills} · ไม่มี scope:outside-root', (t) => {
  const home = makeTempHome(t)
  ok(runCli(home, ['--global'], globalEnv(home)), 'global install')
  const r = runCli(home, ['--global', '--update'], globalEnv(home))
  ok(r, 'global update')
  assert.ok(!r.stdout.includes('scope:outside-root'), `stdout ไม่มี scope:outside-root\n${r.stdout}`)
  const body = readFileSync(path.join(home, '.warnyin', '.warnyin-manifest'), 'utf8')
    .split('\n').filter((l) => l && !l.startsWith('#'))
  for (const l of body) {
    const p = l.split('  ')[1]
    assert.ok(!p.startsWith('.claude/agents'), `manifest ห้ามมี .claude/agents: ${p}`)
    assert.ok(!p.startsWith('.claude/skills'), `manifest ห้ามมี .claude/skills: ${p}`)
  }
  assert.ok(body.some((l) => l.split('  ')[1].startsWith('.warnyin/workflow')), 'ต้องมี entry ใต้ .warnyin/workflow')
})
