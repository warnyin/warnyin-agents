// Unit test ของ verifyInstalled() + readStamp() + parseNpmViewVersion() + semverGte() + checkTarballVersion() จาก setup-dogfood.mjs
// import ตรง — main-guard ใน setup-dogfood.mjs กัน side-effect (install ไม่ถูก spawn)
// zero-dependency: ใช้เฉพาะ built-in node:*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { verifyInstalled, readStamp, parseNpmViewVersion, semverGte, checkTarballVersion } from '../scripts/setup-dogfood.mjs'

function makeTempProject(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-dogfood-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true })) // cleanup แม้ fail
  return dir
}

/** สร้าง CORE markers ในโปรเจกต์ temp */
function makeCore(tmp) {
  const discoveryDir = path.join(tmp, '.warnyin', 'workflow', 'stages')
  mkdirSync(discoveryDir, { recursive: true })
  writeFileSync(path.join(discoveryDir, 'discovery.md'), '# discovery\n')
  const warnyinCmds = path.join(tmp, '.claude', 'commands', 'warnyin')
  mkdirSync(warnyinCmds, { recursive: true })
}

/** เขียน stamp ปลอม (contract §4A: semver + newline) */
function writeStamp(tmp, content) {
  const stampDir = path.join(tmp, '.warnyin')
  mkdirSync(stampDir, { recursive: true })
  writeFileSync(path.join(stampDir, '.warnyin-version'), content)
}

// ─────────────────────────────────────────────────────────────
// เคสเดิม 1-3 (backward compat — marker-only เมื่อไม่ส่ง expected)
// ─────────────────────────────────────────────────────────────

// เคส 1: ไม่มี CORE เลย → false
test('verifyInstalled — false เมื่อไม่มี CORE (temp dir เปล่า)', (t) => {
  const tmp = makeTempProject(t)
  assert.equal(verifyInstalled(tmp), false, 'temp dir เปล่า → ต้อง return false')
})

// เคส 2: CORE ครบทั้งสองส่วน → true
test('verifyInstalled — true เมื่อ CORE ครบ (.warnyin + .claude/commands/warnyin)', (t) => {
  const tmp = makeTempProject(t)
  makeCore(tmp)
  assert.equal(verifyInstalled(tmp), true, 'CORE ครบทั้งสองส่วน → ต้อง return true')
})

// เคส 3: มีแค่ .warnyin ไม่มี .claude/commands/warnyin → false (partial → false)
test('verifyInstalled — false เมื่อ CORE บางส่วน (มีแค่ .warnyin ขาด .claude/commands/warnyin)', (t) => {
  const tmp = makeTempProject(t)
  // สร้าง .warnyin/workflow/stages/discovery.md เท่านั้น (ไม่สร้าง .claude/commands/warnyin)
  const discoveryDir = path.join(tmp, '.warnyin', 'workflow', 'stages')
  mkdirSync(discoveryDir, { recursive: true })
  writeFileSync(path.join(discoveryDir, 'discovery.md'), '# discovery\n')
  assert.equal(verifyInstalled(tmp), false, 'CORE บางส่วน (ขาด .claude/commands/warnyin) → ต้อง return false')
})

// ─────────────────────────────────────────────────────────────
// เคสใหม่ตาม truth table §4B (version-aware verify)
// ─────────────────────────────────────────────────────────────

// drift-guard (แก่น): stamp ≠ expected → false
test('verifyInstalled — drift-guard: stamp 0.1.0 vs expected 9.9.9 → false', (t) => {
  const tmp = makeTempProject(t)
  makeCore(tmp)
  writeStamp(tmp, '0.1.0\n')
  assert.equal(
    verifyInstalled(tmp, '9.9.9'),
    false,
    'stamp 0.1.0 ≠ expected 9.9.9 → drift-guard ต้อง return false',
  )
})

// match: stamp = expected → true
test('verifyInstalled — match: stamp 0.16.0 vs expected 0.16.0 → true', (t) => {
  const tmp = makeTempProject(t)
  makeCore(tmp)
  writeStamp(tmp, '0.16.0\n')
  assert.equal(verifyInstalled(tmp, '0.16.0'), true, 'stamp ตรง expected → ต้อง return true')
})

// transition (stamp ขาด + expected set) → true
test('verifyInstalled — transition: CORE ครบ แต่ไม่มี stamp + expected set → true', (t) => {
  const tmp = makeTempProject(t)
  makeCore(tmp)
  // ไม่เขียน stamp file
  assert.equal(
    verifyInstalled(tmp, '0.16.0'),
    true,
    'stamp ขาด + expected set → transition → ต้อง return true',
  )
})

// degrade: expected null → true (marker-only)
test('verifyInstalled — degrade: expected null (markers ครบ) → true', (t) => {
  const tmp = makeTempProject(t)
  makeCore(tmp)
  assert.equal(verifyInstalled(tmp, null), true, 'expected null → degrade → ต้อง return true')
})

// degrade: expected '' → true (marker-only)
test("verifyInstalled — degrade: expected '' (markers ครบ) → true", (t) => {
  const tmp = makeTempProject(t)
  makeCore(tmp)
  assert.equal(verifyInstalled(tmp, ''), true, "expected '' → degrade → ต้อง return true")
})

// CRLF normalize: stamp "0.16.0\r\n" + expected "0.16.0" → true (กัน Windows false-drift)
test('verifyInstalled — CRLF normalize: stamp 0.16.0\\r\\n vs expected 0.16.0 → true', (t) => {
  const tmp = makeTempProject(t)
  makeCore(tmp)
  writeStamp(tmp, '0.16.0\r\n')
  assert.equal(
    verifyInstalled(tmp, '0.16.0'),
    true,
    'CRLF stamp normalize → ต้อง return true (กัน Windows false-drift)',
  )
})

// ─────────────────────────────────────────────────────────────
// readStamp
// ─────────────────────────────────────────────────────────────

// readStamp: ไฟล์มี whitespace ล้วน → null (ตกแถว transition ไม่ใช่ drift)
test('readStamp — ไฟล์มี whitespace ล้วน → null', (t) => {
  const tmp = makeTempProject(t)
  writeStamp(tmp, '   \n  \t  \n')
  assert.equal(readStamp(tmp), null, 'whitespace-only stamp → ต้อง return null')
})

// ─────────────────────────────────────────────────────────────
// parseNpmViewVersion (pure fn)
// ─────────────────────────────────────────────────────────────

test('parseNpmViewVersion — stdout มี warning ปน → ดึง semver บรรทัดสุดท้ายได้', () => {
  const stdout = 'npm warn deprecated something\n0.16.0\n'
  assert.equal(parseNpmViewVersion(stdout), '0.16.0', 'parse stdout มี warning ปน → ต้องได้ 0.16.0')
})

test('parseNpmViewVersion — stdout empty → null', () => {
  assert.equal(parseNpmViewVersion(''), null, 'empty stdout → ต้อง return null')
})

test('parseNpmViewVersion — stdout ไม่ใช่ semver → null', () => {
  assert.equal(parseNpmViewVersion('not-a-version'), null, 'non-semver stdout → ต้อง return null')
})

// ─────────────────────────────────────────────────────────────
// wire-proof (structural): ตรวจ source code โดยตรงว่าทั้ง 2 call site ส่ง expected
// ─────────────────────────────────────────────────────────────

test('wire-proof: installViaNpx และ installViaPack เรียก verifyInstalled(repoRoot, expected) ทั้ง 2 call site', () => {
  const scriptPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'scripts',
    'setup-dogfood.mjs',
  )
  const src = readFileSync(scriptPath, 'utf8')

  // ตรวจว่า verifyInstalled ถูกเรียกพร้อม argument ที่ 2 (expected) ใน 2 call site
  // pattern: verifyInstalled(repoRoot, expected) หรือ verifyInstalled(repoRoot,expected)
  const matches = src.match(/verifyInstalled\s*\(\s*repoRoot\s*,\s*expected\s*\)/g) || []
  assert.ok(
    matches.length >= 2,
    `ต้องมี verifyInstalled(repoRoot, expected) อย่างน้อย 2 call site (npx + pack) — พบ ${matches.length}`,
  )
})

// ─────────────────────────────────────────────────────────────
// เคสใหม่ตาม design §8 — LR2 active (verifyInstalled stamp ขาด + expected ≥ 0.17.0)
// ─────────────────────────────────────────────────────────────

// active (เคสหลักของ bug): stamp ขาด + expected ≥ 0.17.0 → false
test('verifyInstalled — active: stamp ขาด + expected 0.18.0 (≥0.17.0) → false', (t) => {
  const tmp = makeTempProject(t)
  makeCore(tmp)
  // ไม่เขียน stamp file
  assert.equal(
    verifyInstalled(tmp, '0.18.0'),
    false,
    'stamp ขาด + expected ≥ 0.17.0 → active → ต้อง return false (เคสหลักของ bug)',
  )
})

// boundary (≥ ไม่ใช่ >): stamp ขาด + expected 0.17.0 พอดี → false
test('verifyInstalled — boundary: stamp ขาด + expected 0.17.0 (boundary >=) → false', (t) => {
  const tmp = makeTempProject(t)
  makeCore(tmp)
  // ไม่เขียน stamp file
  assert.equal(
    verifyInstalled(tmp, '0.17.0'),
    false,
    'stamp ขาด + expected 0.17.0 พอดี → ต้อง return false (พิสูจน์ >= ไม่ใช่ >)',
  )
})

// transition (<0.17.0): stamp ขาด + expected 0.16.0 → true (คงเดิม)
test('verifyInstalled — transition: stamp ขาด + expected 0.16.0 (<0.17.0) → true', (t) => {
  const tmp = makeTempProject(t)
  makeCore(tmp)
  // ไม่เขียน stamp file
  assert.equal(
    verifyInstalled(tmp, '0.16.0'),
    true,
    'stamp ขาด + expected < 0.17.0 → transition → ต้อง return true (bootstrapping window)',
  )
})

// degrade-safe (non-semver-but-truthy): stamp ขาด + expected 'latest' → true
test("verifyInstalled — degrade-safe: stamp ขาด + expected 'latest' (non-semver-but-truthy) → true", (t) => {
  const tmp = makeTempProject(t)
  makeCore(tmp)
  // ไม่เขียน stamp file
  assert.equal(
    verifyInstalled(tmp, 'latest'),
    true,
    "stamp ขาด + expected 'latest' (non-semver) → degrade-safe → ต้อง return true (ไม่ block)",
  )
})

// ─────────────────────────────────────────────────────────────
// semverGte (pure fn)
// ─────────────────────────────────────────────────────────────

test("semverGte — '0.18.0' >= '0.17.0' → true", () => {
  assert.equal(semverGte('0.18.0', '0.17.0'), true)
})

test("semverGte — boundary: '0.17.0' >= '0.17.0' → true", () => {
  assert.equal(semverGte('0.17.0', '0.17.0'), true, 'boundary gte: เท่ากัน ต้อง return true')
})

test("semverGte — '0.16.9' >= '0.17.0' → false", () => {
  assert.equal(semverGte('0.16.9', '0.17.0'), false)
})

test("semverGte — '1.0.0' >= '0.17.0' → true (major สูงกว่า)", () => {
  assert.equal(semverGte('1.0.0', '0.17.0'), true)
})

test("semverGte — field-wise: '0.17.0' >= '0.9.0' → true (minor 17 > 9)", () => {
  assert.equal(semverGte('0.17.0', '0.9.0'), true, 'field-wise numeric: 17 > 9 ต้อง return true')
})

// edge defensive
test("semverGte — edge: '0.17' (field สั้น) >= '0.17.0' → true (missing field = 0)", () => {
  assert.equal(semverGte('0.17', '0.17.0'), true, 'field สั้น 2 fields → patch missing = 0 → เท่ากัน = true')
})

test("semverGte — edge: 'garbage' >= '0.17.0' → false (NaN→0)", () => {
  assert.equal(semverGte('garbage', '0.17.0'), false, 'NaN→0 → 0 < 17 → ต้อง return false')
})

test("semverGte — edge: '0.17.0-rc.1' >= '0.17.0' → true (prerelease parseInt ตัด suffix)", () => {
  assert.equal(semverGte('0.17.0-rc.1', '0.17.0'), true, 'parseInt ตัด -rc.1 → 0.17.0 = boundary → true')
})

// ─────────────────────────────────────────────────────────────
// checkTarballVersion (pure fn — temp dir + fake package.json)
// ─────────────────────────────────────────────────────────────

test('checkTarballVersion — match exact: version 0.18.0 + expected 0.18.0 → true', (t) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-tarball-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ version: '0.18.0' }))
  assert.equal(checkTarballVersion(dir, '0.18.0'), true, 'version ตรง expected → ต้อง return true')
})

test('checkTarballVersion — mismatch: version 0.16.0 + expected 0.18.0 → false (detect payload เก่า)', (t) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-tarball-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ version: '0.16.0' }))
  assert.equal(checkTarballVersion(dir, '0.18.0'), false, 'version ≠ expected → detect payload เก่า → ต้อง return false')
})

test('checkTarballVersion — expected falsy → true (degrade offline)', (t) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-tarball-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ version: '0.16.0' }))
  assert.equal(checkTarballVersion(dir, null), true, 'expected null → ข้าม version-check → ต้อง return true')
  assert.equal(checkTarballVersion(dir, ''), true, "expected '' → ข้าม version-check → ต้อง return true")
})

test('checkTarballVersion — version มี CRLF/whitespace → normalize trim → match', (t) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-tarball-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  // เขียน package.json แบบ raw ให้ version มี whitespace
  writeFileSync(path.join(dir, 'package.json'), '{"version":"  0.18.0\\r\\n"}')
  assert.equal(checkTarballVersion(dir, '0.18.0'), true, 'version มี whitespace/CRLF → trim สองฝั่ง → match → true')
})

// ─────────────────────────────────────────────────────────────
// wire-proof ใหม่ — installViaNpx args + installViaPack prefer-online
// ─────────────────────────────────────────────────────────────

test("wire-proof: installViaNpx spawn args = ['--yes','-p',spec,'warnyin-agents','--update']", () => {
  const scriptPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'scripts',
    'setup-dogfood.mjs',
  )
  const src = readFileSync(scriptPath, 'utf8')
  // ตรวจ array args ใน installViaNpx: '--yes', '-p', spec, 'warnyin-agents', '--update'
  assert.ok(
    /\[\s*'--yes'\s*,\s*'-p'\s*,\s*spec\s*,\s*'warnyin-agents'\s*,\s*'--update'\s*\]/.test(src),
    "installViaNpx ต้องมี spawn args ['--yes','-p',spec,'warnyin-agents','--update'] (explicit bin กัน scope-strip mismatch)",
  )
})

test('wire-proof: installViaPack npm pack spawnSync options มี npm_config_prefer_online', () => {
  const scriptPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'scripts',
    'setup-dogfood.mjs',
  )
  const src = readFileSync(scriptPath, 'utf8')
  // ตรวจว่า npm pack (ใน installViaPack) มี npm_config_prefer_online ใน options
  assert.ok(
    /npm_config_prefer_online/.test(src),
    'installViaPack ต้องมี npm_config_prefer_online ใน npm pack spawnSync options (cache-bust symmetric)',
  )
})
