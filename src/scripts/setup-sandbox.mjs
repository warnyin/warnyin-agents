#!/usr/bin/env node
/**
 * setup:sandbox — ทดสอบ v-next (version skew)
 *
 * ทำอะไร:
 *   1. สร้าง temp dir ใน os.tmpdir() (สุ่ม+atomic ด้วย mkdtempSync — ห้าม hardcode /tmp กัน Windows พัง + TOCTOU)
 *   2. รัน `node src/bin/cli.mjs` (installer v-next จาก src/) ลง temp dir นั้น
 *   3. print path ให้ dev เปิด Claude Code ลอง /warnyin:* ด้วย v-next
 *      → dogfood env ที่ root ไม่โดนแตะ (แยก layer)
 *
 * dev-only: อยู่ใน src/scripts/ (ไม่ publish)
 * zero-dep / ESM / cross-platform (spawn array args, ไม่ shell)
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const cli = path.join(repoRoot, 'src', 'bin', 'cli.mjs')

if (!fs.existsSync(cli)) {
  console.error(`✖ ไม่พบ installer v-next: ${cli}`)
  process.exit(1)
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wy-sandbox-'))
console.log(`Warnyin sandbox (v-next) → ${dir}\n`)

// install v-next จาก src/ ลง sandbox — array args, ไม่ shell (cross-platform); process.execPath = node ปัจจุบัน
const r = spawnSync(process.execPath, [cli], { cwd: dir, stdio: 'inherit' })
if (r.status !== 0) {
  console.error(`\n✖ install v-next ลง sandbox ล้มเหลว (exit ${r.status ?? '?'})`)
  process.exit(r.status ?? 1)
}

console.log(`\nเสร็จ — sandbox v-next พร้อมที่:\n  ${dir}`)
console.log('เปิด Claude Code ที่ path นี้แล้วลอง /warnyin:* (dogfood ที่ root ไม่โดนแตะ)')
