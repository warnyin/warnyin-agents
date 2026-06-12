// Unit test ของ verifyInstalled() + readStamp() + parseNpmViewVersion() จาก setup-dogfood.mjs
// import ตรง — main-guard ใน setup-dogfood.mjs กัน side-effect (install ไม่ถูก spawn)
// zero-dependency: ใช้เฉพาะ built-in node:*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { verifyInstalled, readStamp, parseNpmViewVersion } from '../scripts/setup-dogfood.mjs'

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
