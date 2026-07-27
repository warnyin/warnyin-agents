// Unit + spawn + negative-property test ของ memory-status.mjs (spec.md §7 U1-U12 / S1-S3 / N1)
// zero-dependency: node:test, node:assert/strict, node:fs, node:os, node:path, node:url, node:child_process (spawn เท่านั้น)
// fixture ใช้ค่าไทยจริงตาม schema 6 คอลัมน์ (ประเภท gotcha/บทเรียน/ข้อสังเกต, evidence เป็น inline-code backtick)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { summarize } from '../.warnyin/workflow/scripts/memory-status.mjs'

const SCRIPT_PATH = fileURLToPath(new URL('../.warnyin/workflow/scripts/memory-status.mjs', import.meta.url))

// ── fixture builder (standard.md §2 — const template literal + generator, ไม่ hardcode) ──
const MEMORY_HEADER = ['| # | บทเรียน (what) | ที่มา (evidence pointer) | ประเภท | วันที่ | สถานะ |', '|---|---|---|---|---|---|']

function memoryRow(n, { status = 'open', date = '2026-07-01', lesson = `บทเรียนตัวอย่าง ${n}`, type = '`gotcha`' } = {}) {
  return `| ${n} | ${lesson} | \`build.md §${n} ของ topic X\` | ${type} | \`${date}\` | \`${status}\` |`
}

const MEMORY_MIXED = [
  ...MEMORY_HEADER,
  memoryRow(1, { status: 'open', date: '2026-07-01' }),
  memoryRow(2, { status: 'open', date: '2026-07-02' }),
  memoryRow(3, { status: 'promoted', date: '2026-06-01' }),
  memoryRow(4, { status: 'dropped', date: '2026-05-01' }),
].join('\n')

const MEMORY_LEGEND_ONLY = [
  '# MEMORY — ความจำระดับโปรเจกต์',
  '## 3. Schema',
  ...MEMORY_HEADER,
  '| legend | สถานะ: `open` ยังไม่ปิด · `promoted` ยกระดับเป็นกฎ · `dropped` ตัดทิ้งแล้ว | `-` | `-` | `-` | `-` |',
  '',
  'หมายเหตุ: ใช้ `open`/`promoted`/`dropped` ตามตาราง §3 เท่านั้น ห้ามใช้สถานะอื่น',
].join('\n')

const MEMORY_UNKNOWN = [
  ...MEMORY_HEADER,
  '| 1 | บทเรียนตัวอย่าง 1 | `pointer` | `gotcha` | `2026-01-01` | `รอดู` |',
  '| 2 | บทเรียนตัวอย่าง 2 | `pointer` | `gotcha` | `2026-01-02` | open ? |',
  '| 3 | บทเรียนตัวอย่าง 3 | `pointer` | `gotcha` | `2026-01-03` |  |',
].join('\n')

const CONTEXT_NO_UPDATE_SECTION = ['# บริบทปัจจุบัน', '## กำลังทำอะไรอยู่', 'ทำ topic X stage BUILD'].join('\n')

const CONTEXT_WITH_UPDATE = ['# บริบทปัจจุบัน', '## อัปเดตล่าสุด', '', '2026-07-27 · SHIP'].join('\n')

const CONTEXT_PROSE_ONLY = 'นี่คือข้อความธรรมดาไม่มี heading\nบรรทัดที่สอง'

const CONTEXT_61_LINES = ['# บริบท', ...Array.from({ length: 60 }, (_, i) => `เนื้อหา ${i + 1}`)].join('\n')
const CONTEXT_60_LINES = ['# บริบท', ...Array.from({ length: 59 }, (_, i) => `เนื้อหา ${i + 1}`)].join('\n')

const MEMORY_U12 = [
  ...MEMORY_HEADER,
  '| ตัวอย่าง | ข้อความ generalize 1-2 บรรทัด | `pointer` | `gotcha` | `2026-01-01` | `open` |',
  memoryRow(1, { status: 'open', date: '2026-07-01' }),
].join('\n')

// fixed "now" กับ helper คำนวณวันที่ย้อนหลัง (deterministic — spec §5)
const NOW = new Date('2026-07-27T00:00:00Z')
const NOW_DATE_STR = '2026-07-27'
function daysAgo(n) {
  return new Date(NOW.getTime() - n * 86400000).toISOString().slice(0, 10)
}

// สร้างแถว open จำนวน count แถว โดยแถวที่ staleIndex ใช้ staleDate นอกนั้นใช้ freshDate (ไม่ hardcode)
function buildOpenRows(count, staleIndex, staleDate) {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1
    return memoryRow(n, { status: 'open', date: n === staleIndex ? staleDate : NOW_DATE_STR })
  })
}

const MEMORY_OVER_LIMIT = [...MEMORY_HEADER, ...buildOpenRows(31, 31, daysAgo(91))].join('\n')
const MEMORY_BOUNDARY = [...MEMORY_HEADER, ...buildOpenRows(30, 30, daysAgo(90))].join('\n')

// ═══════════════════════════ U. unit ของ summarize() (pure) ═══════════════════════════

test('U1. ไม่มีไฟล์ทั้งคู่ → ค่าว่างทั้งหมด', () => {
  const r = summarize({ contextText: null, memoryText: null })
  assert.deepEqual(r, { contextLines: 0, lastUpdated: null, counts: { open: 0, promoted: 0, dropped: 0, unknown: 0, total: 0 }, flags: [] })
})

test('U2. ไฟล์ว่าง ("" และ whitespace) → ผลเท่ากับ U1', () => {
  const r1 = summarize({ contextText: '', memoryText: '' })
  const r2 = summarize({ contextText: '\n  \n', memoryText: '\n  \n' })
  const expected = summarize({ contextText: null, memoryText: null })
  assert.deepEqual(r1, expected, `r1=${JSON.stringify(r1)}`)
  assert.deepEqual(r2, expected, `r2=${JSON.stringify(r2)}`)
})

test('U3. legend-only (มีคำ open/promoted/dropped แต่ไม่มีแถวข้อมูล) → counts ทุกช่องเป็น 0', () => {
  const r = summarize({ contextText: null, memoryText: MEMORY_LEGEND_ONLY })
  assert.deepEqual(r.counts, { open: 0, promoted: 0, dropped: 0, unknown: 0, total: 0 }, `counts=${JSON.stringify(r.counts)}`)
})

test('U4. entry คละสถานะ open/promoted/dropped → นับแยกถูกต้อง', () => {
  const r = summarize({ contextText: null, memoryText: MEMORY_MIXED })
  assert.deepEqual(
    r.counts,
    { open: 2, promoted: 1, dropped: 1, unknown: 0, total: 4 },
    `counts=${JSON.stringify(r.counts)}`,
  )
})

test('U5. สถานะนอก closed-set (รอดู / open ? / เซลล์ว่าง) → นับเข้า unknown ไม่ throw', () => {
  const r = summarize({ contextText: null, memoryText: MEMORY_UNKNOWN })
  assert.deepEqual(r.counts, { open: 0, promoted: 0, dropped: 0, unknown: 3, total: 3 }, `counts=${JSON.stringify(r.counts)}`)
})

test('U6. CRLF: fixture เดียวกับ U4 แต่ \\r\\n ทุกบรรทัด → ผลเท่ากับ U4', () => {
  const crlf = MEMORY_MIXED.replace(/\n/g, '\r\n')
  const r1 = summarize({ contextText: null, memoryText: crlf })
  const r2 = summarize({ contextText: null, memoryText: MEMORY_MIXED })
  assert.deepEqual(r1, r2, `crlf=${JSON.stringify(r1)} lf=${JSON.stringify(r2)}`)
})

test('U7. context.md ไม่มี "## อัปเดตล่าสุด" (มี heading อื่น) → lastUpdated=null แต่ contextLines>0', () => {
  const r = summarize({ contextText: CONTEXT_NO_UPDATE_SECTION, memoryText: null })
  assert.equal(r.lastUpdated, null)
  assert.ok(r.contextLines > 0, `contextLines=${r.contextLines}`)
})

test('U8. context.md มี "## อัปเดตล่าสุด" เว้นบรรทัดว่าง 1 บรรทัดก่อนเนื้อ → คืนเนื้อบรรทัดนั้น', () => {
  const r = summarize({ contextText: CONTEXT_WITH_UPDATE, memoryText: null })
  assert.equal(r.lastUpdated, '2026-07-27 · SHIP')
})

test('U9. context.md ไม่มีบรรทัดขึ้นต้น # เลย (prose) → contextLines=0, lastUpdated=null (C13)', () => {
  const r = summarize({ contextText: CONTEXT_PROSE_ONLY, memoryText: null })
  assert.equal(r.contextLines, 0)
  assert.equal(r.lastUpdated, null)
})

test('U10. flags เกินเกณฑ์ครบ 3 code ตามลำดับ context-lines → open-over-limit → stale-open', () => {
  const r = summarize({ contextText: CONTEXT_61_LINES, memoryText: MEMORY_OVER_LIMIT, now: NOW })
  assert.equal(r.contextLines, 61, `contextLines=${r.contextLines}`)
  assert.equal(r.counts.open, 31, `open=${r.counts.open}`)
  assert.deepEqual(
    r.flags.map((f) => f.code),
    ['context-lines', 'open-over-limit', 'stale-open'],
    `flags=${JSON.stringify(r.flags)}`,
  )
  assert.deepEqual(r.flags, [
    { code: 'context-lines', value: 61 },
    { code: 'open-over-limit', value: 31 },
    { code: 'stale-open', value: 1 },
  ])
})

test('U11. boundary ไม่ติด flag (60 บรรทัด / open 30 / อายุ 90 วันพอดี)', () => {
  const r = summarize({ contextText: CONTEXT_60_LINES, memoryText: MEMORY_BOUNDARY, now: NOW })
  assert.equal(r.contextLines, 60, `contextLines=${r.contextLines}`)
  assert.equal(r.counts.open, 30, `open=${r.counts.open}`)
  assert.deepEqual(r.flags, [], `flags=${JSON.stringify(r.flags)}`)
})

test('U12. แถวคอลัมน์แรกไม่ใช่ตัวเลขปนกับแถวข้อมูลจริง 1 แถว → total=1', () => {
  const r = summarize({ contextText: null, memoryText: MEMORY_U12 })
  assert.equal(r.counts.total, 1, `counts=${JSON.stringify(r.counts)}`)
  assert.equal(r.counts.open, 1)
})

// ═══════════════════════════ S. spawn จริง (black-box) ═══════════════════════════

function makeTempDir() {
  return mkdtempSync(path.join(tmpdir(), 'wy-mem-'))
}

test('S1. temp dir ครบไฟล์ → exit 0 และ stdout มีตัวเลขของ counts ที่คาด', (t) => {
  const dir = makeTempDir()
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  mkdirSync(path.join(dir, 'docs', 'stages'), { recursive: true })
  writeFileSync(path.join(dir, 'docs', 'stages', 'context.md'), CONTEXT_NO_UPDATE_SECTION, 'utf8')
  writeFileSync(path.join(dir, 'docs', 'memory.md'), MEMORY_MIXED, 'utf8')

  const res = spawnSync(process.execPath, [SCRIPT_PATH, dir], { encoding: 'utf8' })
  assert.equal(res.status, 0, `stderr=${res.stderr}`)
  assert.ok(res.stdout.includes('open 2'), `stdout=${res.stdout}`)
  assert.ok(res.stdout.includes('promoted 1'), `stdout=${res.stdout}`)
  assert.ok(res.stdout.includes('dropped 1'), `stdout=${res.stdout}`)
})

test('S2. temp dir เปล่า (ไม่มี 2 ไฟล์) → exit 0 และ stdout มี "–"', (t) => {
  const dir = makeTempDir()
  t.after(() => rmSync(dir, { recursive: true, force: true }))

  const res = spawnSync(process.execPath, [SCRIPT_PATH, dir], { encoding: 'utf8' })
  assert.equal(res.status, 0, `stderr=${res.stderr}`)
  assert.ok(res.stdout.includes('–'), `stdout=${res.stdout}`)
})

test('S3. memory.md มีข้อความบทเรียน/evidence เฉพาะตัว → stdout ไม่มีสองสตริงนั้น', (t) => {
  const dir = makeTempDir()
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  mkdirSync(path.join(dir, 'docs', 'stages'), { recursive: true })
  const secretLesson = 'ห้ามลืมล้าง cache ก่อน deploy'
  const secretEvidence = 'build.md §เฉพาะกิจ ของ topic ลับ'
  const memory = [
    ...MEMORY_HEADER,
    `| 1 | ${secretLesson} | \`${secretEvidence}\` | \`gotcha\` | \`2026-07-01\` | \`open\` |`,
  ].join('\n')
  writeFileSync(path.join(dir, 'docs', 'memory.md'), memory, 'utf8')

  const res = spawnSync(process.execPath, [SCRIPT_PATH, dir], { encoding: 'utf8' })
  assert.equal(res.status, 0, `stderr=${res.stderr}`)
  assert.ok(!res.stdout.includes(secretLesson), `stdout ไม่ควรมีเนื้อบทเรียน: ${res.stdout}`)
  assert.ok(!res.stdout.includes(secretEvidence), `stdout ไม่ควรมี evidence: ${res.stdout}`)
})

// ═══════════════════════════ N. negative property (อ่านซอร์สของ script) ═══════════════════════════

test('N1. ซอร์สของ memory-status.mjs ไม่มี import/API ต้องห้าม', () => {
  const src = readFileSync(SCRIPT_PATH, 'utf8')
  const forbidden = [
    'node:child_process',
    'node:http',
    'node:https',
    'node:net',
    'writeFileSync',
    'appendFileSync',
    'mkdirSync',
    'rmSync',
    'createWriteStream',
  ]
  for (const token of forbidden) {
    assert.ok(!src.includes(token), `ห้ามพบ "${token}" ในซอร์ส memory-status.mjs`)
  }
})
