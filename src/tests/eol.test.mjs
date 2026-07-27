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

// ─────────────────────────────────────────────────────────────
// EOL3. normalizeEol (pure fn ของ installer) — กันที่ "จุดเขียน" ไม่ใช่แค่จุด commit
// .gitattributes คุมได้แค่ repo ต้นทาง; tarball ที่ pack จาก checkout เก่า/เครื่อง core.autocrlf=true
// ยังมี CRLF ติดมาได้ → installer ต้อง normalize ตอนเขียนลง target เสมอ
// ─────────────────────────────────────────────────────────────
test('EOL3. normalizeEol: text ext → CRLF/CR เป็น LF, ชนิดข้อมูลคงเดิม, ไฟล์ binary ไม่ถูกแตะ', async () => {
  const { normalizeEol } = await import('../bin/cli.mjs')

  // string in → string out
  assert.equal(normalizeEol('a\r\nb\r\n', 'x.md'), 'a\nb\n')
  // lone CR (Mac classic) → LF
  assert.equal(normalizeEol('a\rb', 'x.mjs'), 'a\nb')
  // ไม่มี CR → คืนตัวเดิม (ไม่เสีย identity, ไม่เขียนซ้ำโดยไม่จำเป็น)
  const lf = 'a\nb\n'
  assert.equal(normalizeEol(lf, 'x.md'), lf)
  // Buffer in → Buffer out + เนื้อถูก normalize
  const buf = normalizeEol(Buffer.from('a\r\nb', 'utf8'), 'x.json')
  assert.ok(Buffer.isBuffer(buf), 'Buffer เข้า ต้องได้ Buffer ออก')
  assert.equal(buf.toString('utf8'), 'a\nb')
  // นามสกุลนอก text list → ห้ามแตะ (binary: 0x0D อาจเป็นข้อมูลจริง)
  const png = Buffer.from([0x89, 0x50, 0x0d, 0x0a, 0x1a])
  assert.ok(normalizeEol(png, 'logo.png').equals(png), 'ไฟล์ binary ต้องไม่ถูก normalize')
  // utf-8 หลายไบต์ (ไทย) ต้องไม่เพี้ยนหลัง round-trip Buffer
  assert.equal(normalizeEol(Buffer.from('ไทย\r\nบรรทัด', 'utf8'), 'x.md').toString('utf8'), 'ไทย\nบรรทัด')
})

// ─────────────────────────────────────────────────────────────
// EOL4. ทุกไฟล์ text ใต้ src/ ต้องเป็น LF ล้วน — ไม่ใช่แค่ .mjs
// EOL1/EOL2 ครอบเฉพาะ .mjs; เคสจริงที่พังคือทั้ง tarball เป็น CRLF (84 ไฟล์ .md ปนมาด้วย)
// ─────────────────────────────────────────────────────────────
test('EOL4. src/**: ไฟล์ text ทุกนามสกุลไม่มี CR (ไม่ใช่แค่ .mjs)', () => {
  const TEXT = new Set(['.md', '.mjs', '.js', '.json', '.txt', '.yml', '.yaml'])
  const walk = (dir, acc = []) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walk(full, acc)
      else if (TEXT.has(path.extname(e.name))) acc.push(full)
    }
    return acc
  }
  const offenders = walk(path.join(root, 'src'))
    .filter((f) => crCount(f) > 0)
    .map((f) => path.relative(root, f))
  assert.deepEqual(offenders, [], `พบ CRLF ใน payload: ${offenders.join(', ')} — tarball ต้องเป็น LF ล้วน`)
})
