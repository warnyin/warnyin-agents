// EOL regression gate — payload script ที่ส่งผ่าน Workflow tool ห้ามมี CR (\r, 0x0D)
// เหตุผล: Workflow permission handler ปัดตก "script contains control characters that would be
// hidden in the approval dialog" — CR ของ CRLF เป็น C0 control char → BUILD พังบนเครื่องที่
// checkout เป็น CRLF (Windows core.autocrlf). .gitattributes `* eol=lf` กันที่ต้นทาง เคสนี้กัน regress
// node ล้วน cross-platform — ห้าม t.skip() (pass-count gate: pass===tests)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))

// walker: เก็บทุกไฟล์ .mjs ใต้ dir (recursive) — คืน path relative ต่อ root
function walkMjs(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walkMjs(full, acc)
    else if (e.name.endsWith('.mjs')) acc.push(full)
  }
  return acc
}

function crCount(file) {
  const b = readFileSync(file)
  let n = 0
  for (const byte of b) if (byte === 0x0d) n++
  return n
}

// ─────────────────────────────────────────────────────────────
// EOL1. workflow script ที่ส่งผ่าน Workflow tool ต้องไม่มี CR (critical — ทริกเกอร์ control-char)
// ─────────────────────────────────────────────────────────────
test('EOL1. src/.warnyin/workflow/scripts/*.mjs ไม่มี CR (\\r) — กัน Workflow control-char reject', () => {
  const scriptsDir = path.join(root, 'src', '.warnyin', 'workflow', 'scripts')
  const offenders = walkMjs(scriptsDir)
    .map((f) => ({ file: path.relative(root, f), cr: crCount(f) }))
    .filter((x) => x.cr > 0)
  assert.deepEqual(
    offenders,
    [],
    `พบ CRLF ใน workflow script: ${offenders.map((o) => `${o.file}(${o.cr} CR)`).join(', ')} — ` +
      `ไฟล์นี้ถูกส่งผ่าน Workflow tool ที่ปัดตก control char; แปลงเป็น LF (.gitattributes บังคับ eol=lf)`,
  )
})

// ─────────────────────────────────────────────────────────────
// EOL2. ทุก .mjs ที่ publish (src/**) ต้องไม่มี CR — payload สะอาดข้าม OS
// ─────────────────────────────────────────────────────────────
test('EOL2. src/**/*.mjs ทั้งหมดไม่มี CR (\\r) — payload/tooling เป็น LF ล้วน', () => {
  const srcDir = path.join(root, 'src')
  const offenders = walkMjs(srcDir)
    .map((f) => ({ file: path.relative(root, f), cr: crCount(f) }))
    .filter((x) => x.cr > 0)
  assert.deepEqual(offenders, [], `พบ CRLF ใน .mjs: ${offenders.map((o) => o.file).join(', ')}`)
})
