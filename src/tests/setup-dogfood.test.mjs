// Unit test ของ verifyInstalled() จาก setup-dogfood.mjs
// import ตรง — main-guard ใน setup-dogfood.mjs กัน side-effect (install ไม่ถูก spawn)
// zero-dependency: ใช้เฉพาะ built-in node:*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { verifyInstalled } from '../scripts/setup-dogfood.mjs'

function makeTempProject(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-dogfood-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true })) // cleanup แม้ fail
  return dir
}

// เคส 1: ไม่มี CORE เลย → false
test('verifyInstalled — false เมื่อไม่มี CORE (temp dir เปล่า)', (t) => {
  const tmp = makeTempProject(t)
  assert.equal(verifyInstalled(tmp), false, 'temp dir เปล่า → ต้อง return false')
})

// เคส 2: CORE ครบทั้งสองส่วน → true
test('verifyInstalled — true เมื่อ CORE ครบ (.warnyin + .claude/commands/warnyin)', (t) => {
  const tmp = makeTempProject(t)
  // สร้าง .warnyin/workflow/stages/discovery.md
  const discoveryDir = path.join(tmp, '.warnyin', 'workflow', 'stages')
  mkdirSync(discoveryDir, { recursive: true })
  writeFileSync(path.join(discoveryDir, 'discovery.md'), '# discovery\n')
  // สร้าง .claude/commands/warnyin/ (dir)
  const warnyinCmds = path.join(tmp, '.claude', 'commands', 'warnyin')
  mkdirSync(warnyinCmds, { recursive: true })

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
