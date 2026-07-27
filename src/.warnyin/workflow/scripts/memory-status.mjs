// memory-status.mjs — รายงานสุขภาพ project memory แบบ read-only (design.md §4 C10)
// หน้าที่: อ่าน docs/stages/context.md + docs/memory.md แล้วรายงานขนาด/จำนวน entry/วันที่/flag
// ข้อจำกัด security: อ่านไฟล์เท่านั้น (ห้าม network/child_process/เขียนไฟล์) — พิมพ์เฉพาะตัวเลข/วันที่/flag
//   ห้ามพิมพ์เนื้อ entry ออก stdout (กันข้อมูลอ่อนไหวหลุดทาง log) — exit code คง 0 เสมอ (report ไม่ใช่ gate)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// เกณฑ์ "ไม่บวม" (design.md §3.3) — guidance ปรับได้ ไม่ใช่ hard gate
const STATUS_SET = new Set(['open', 'promoted', 'dropped'])
const LIMIT_CONTEXT_LINES = 60
const LIMIT_OPEN = 30
const STALE_DAYS = 90

// normalize CRLF ครั้งเดียวที่ทางเข้า (บทเรียน CRLF: commit 0a2e7c4)
function normalize(text) {
  return String(text).replace(/\r\n/g, '\n')
}

// แตกแถวตาราง markdown เป็น {statusCell, dateCell} — คืน null ถ้าไม่ใช่แถวข้อมูล (spec §4.1)
function parseRow(line) {
  if (!line.startsWith('|')) return null
  const cells = line.split('|')
  cells.shift() // ตัด element แรก (บรรทัดขึ้นต้น '|' → element แรกเป็น '')
  if (cells.length && cells[cells.length - 1].trim() === '') cells.pop() // ตัด element ท้ายถ้าว่าง
  if (cells.length < 2) return null
  const first = cells[0].trim()
  if (!/^\d+$/.test(first)) return null // คอลัมน์แรกต้องเป็นเลขล้วน (ASCII) — ห้าม \w/\b
  const statusCell = cells[cells.length - 1].replace(/`/g, '').trim()
  const dateCell = cells[cells.length - 2].replace(/`/g, '').trim()
  return { statusCell, dateCell }
}

// หาเนื้อหลัง '## อัปเดตล่าสุด' (บรรทัดถัดไปที่ไม่ว่าง) — ไม่มี section → null (spec §4.2)
// placeholder ที่เป็น HTML comment ล้วน = "ยังไม่มีค่า" → null (กติกาเดียวกับแถวตัวอย่างใน memory.md
// ที่ถูกครอบด้วย <!-- --> เพื่อไม่ให้ถูกนับเป็น entry — template ใช้ convention นี้ทั้งสองไฟล์)
function findLastUpdated(text) {
  const lines = text.split('\n')
  const idx = lines.findIndex((l) => l.trim().startsWith('## อัปเดตล่าสุด'))
  if (idx === -1) return null
  for (let i = idx + 1; i < lines.length; i++) {
    const t = lines[i].trim()
    if (t === '') continue
    if (t.startsWith('##')) return null
    if (/^<!--[\s\S]*-->$/.test(t)) return null
    return t
  }
  return null
}

// context.md → {contextLines, lastUpdated} — ไฟล์ไม่มี/ว่าง/ไม่มี '#' เลย = ถือว่ายังไม่มี (spec §4.3 C13)
function summarizeContext(contextText) {
  if (contextText == null) return { contextLines: 0, lastUpdated: null }
  const normalized = normalize(contextText)
  if (normalized.trim() === '') return { contextLines: 0, lastUpdated: null }
  const hasHeading = normalized.split('\n').some((l) => l.trim().startsWith('#'))
  if (!hasHeading) return { contextLines: 0, lastUpdated: null }
  const body = normalized.endsWith('\n') ? normalized.slice(0, -1) : normalized
  return { contextLines: body.split('\n').length, lastUpdated: findLastUpdated(normalized) }
}

// memory.md → {counts, staleOpen} — row-based เท่านั้น (legend/prose/header ไม่นับเป็น entry)
function summarizeMemory(memoryText, now) {
  const text = memoryText == null ? '' : normalize(memoryText)
  const counts = { open: 0, promoted: 0, dropped: 0, unknown: 0, total: 0 }
  let staleOpen = 0
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  for (const line of text.split('\n')) {
    const row = parseRow(line)
    if (!row) continue
    counts.total++
    if (!STATUS_SET.has(row.statusCell)) {
      counts.unknown++
      continue
    }
    counts[row.statusCell]++
    if (row.statusCell === 'open' && /^\d{4}-\d{2}-\d{2}$/.test(row.dateCell)) {
      const entryUtc = Date.parse(`${row.dateCell}T00:00:00Z`)
      if (!Number.isNaN(entryUtc) && Math.floor((nowUtc - entryUtc) / 86400000) > STALE_DAYS) staleOpen++
    }
  }
  return { counts, staleOpen }
}

// flags ตามเกณฑ์ §3.3 — ลำดับคงที่: context-lines → open-over-limit → stale-open
function computeFlags(contextLines, counts, staleOpen) {
  const flags = []
  if (contextLines > LIMIT_CONTEXT_LINES) flags.push({ code: 'context-lines', value: contextLines })
  if (counts.open > LIMIT_OPEN) flags.push({ code: 'open-over-limit', value: counts.open })
  if (staleOpen > 0) flags.push({ code: 'stale-open', value: staleOpen })
  return flags
}

// pure fn หลัก (C10) — ไม่แตะ fs/เวลา/argv; now = optional (deterministic ให้เทส)
export function summarize({ contextText, memoryText, now }) {
  const nowDate = now instanceof Date ? now : new Date()
  const { contextLines, lastUpdated } = summarizeContext(contextText)
  const { counts, staleOpen } = summarizeMemory(memoryText, nowDate)
  return { contextLines, lastUpdated, counts: { ...counts }, flags: computeFlags(contextLines, counts, staleOpen) }
}

// ข้อความ flag แต่ละ code — เฉพาะตัวเลข/เกณฑ์ (ห้ามอ้างเนื้อ entry)
function renderFlag(flag) {
  if (flag.code === 'context-lines') return `⚠ context.md ยาว ${flag.value} บรรทัด (เกณฑ์ > ${LIMIT_CONTEXT_LINES})`
  if (flag.code === 'open-over-limit') return `⚠ entry open ${flag.value} รายการ (เกณฑ์ > ${LIMIT_OPEN})`
  return `⚠ entry open ค้างนานเกิน ${STALE_DAYS} วัน ${flag.value} รายการ`
}

// render: ตัวเลข/วันที่/flag เท่านั้น (spec §6) — ห้ามพิมพ์เนื้อ entry
function render({ contextLines, lastUpdated, counts, flags }) {
  const lines = ['project memory']
  lines.push(`  context.md : ${contextLines} บรรทัด · อัปเดตล่าสุด ${lastUpdated ?? '–'}`)
  lines.push(
    `  memory.md  : open ${counts.open} · promoted ${counts.promoted} · dropped ${counts.dropped} · unknown ${counts.unknown} (รวม ${counts.total})`,
  )
  if (counts.unknown > 0) lines.push(`  ⚠ พบ ${counts.unknown} entry ที่สถานะไม่อยู่ใน closed-set (open/promoted/dropped)`)
  for (const flag of flags) lines.push(`  ${renderFlag(flag)}`)
  return lines.join('\n')
}

// อ่านไฟล์แบบไม่ throw — ENOENT/EACCES เหมือนกัน คืน null (ห้าม log absolute path ของผู้ใช้)
function readFileOrNull(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

function main() {
  const rootDir = process.argv[2] || process.cwd()
  const contextText = readFileOrNull(join(rootDir, 'docs', 'stages', 'context.md'))
  const memoryText = readFileOrNull(join(rootDir, 'docs', 'memory.md'))
  console.log(render(summarize({ contextText, memoryText })))
}

// main-guard: argv[1] comparison (ไม่ realpath — ไม่ผูกกับ bin/npx symlink; import จาก unit ไม่ trigger main)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main()
}
