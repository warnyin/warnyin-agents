import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Structural validator ของ topic ใน docs/stages/ — zero-dep (mirror lint-md.mjs: pure fn + injectable IO + main-guard)
// 2 โหมด: status (ไม่มี arg, ตารางทุก topic, exit 0) · validate (<slug>, รายการ ✖/⚠, exit 1 เมื่อมี ✖ / 2 เมื่อ slug ผิด)
// เช็ค C1–C5 = structural เท่านั้น (semantic เป็นของ model ตาม gate เดิม) — canonical contract: design §4
//
// หลักการแยกระดับ (design §4.2): ✖ checks (C2/C3/C5) ไม่พึ่ง filled-detection (existence/structure ล้วน)
//   · C1/C4 = ⚠ best-effort (heuristic เดา "เริ่มเติม" — ยอมรับ false ได้ ไม่ block)
// security (design §4.4): เฉพาะ node:fs/node:path/node:url — ไม่มี child_process/network/write
//   · report structural เท่านั้น (ชื่อไฟล์/section/code — ไม่ echo เนื้อ artifact) · ENOENT/EACCES guard ไม่พ่น absolute path

// ── canonical: stage → artifact (design §4.3) ──────────────────────────────
// required = ต้องมีถึงจะนับว่าผ่าน stage · optional = ข้ามได้ปกติ (ไม่ count เป็น "ข้าม stage")
const STAGES = [
  { order: 1, stage: 'Discovery', required: [], optional: ['discovery.md', 'research.md'] },
  { order: 2, stage: 'DESIGN', required: ['proposal.md', 'design.md'], optional: ['business.md'] },
  { order: 4, stage: 'BUILD', required: ['build.md'], optional: [] },
  // VERIFY: required ว่าง (contract C2 — design.md §4) — topic ใหม่ใช้ section ใน build.md แทน
  // backward-compat: verify.md/test.md เดิมยังอยู่เป็น optional → infer VERIFY ได้เหมือนเดิม
  { order: 5, stage: 'VERIFY', required: [], optional: ['verify.md', 'test.md'] },
  { order: 6, stage: 'SHIP', required: ['ship.md'], optional: [] },
]
// ไฟล์ artifact ทั้งหมดที่ใช้ infer stage (รวม required + optional ของทุก stage)
const STAGE_FILES = STAGES.flatMap((s) => [...s.required, ...s.optional])

// ── canonical cap ต่อ tier (contract C3 — design.md §4; ตัวเลข = .warnyin/workflow/triage.md §2D) ──
// อ่านอย่างเดียว — ห้ามแก้ triage.md; large = {} หมายถึงไม่มี cap
const CAPS = {
  fast:     { 'receipt.md': 40 },
  standard: { 'proposal.md': 60, 'design.md': 120 },
  large:    {},
}
const TASK_REQUIRED = ['spec.md', 'standard.md', 'rule.md', 'task.md']

// ── filled heuristic (B1): "เริ่มเติม" = H1 (บรรทัดแรกที่ไม่ว่าง) ไม่มี placeholder <...> ─────
// ทุก template artifact มี `— <ชื่อ...>` ที่ H1; ห้ามใช้ const FILLED_MARKERS list (เปราะ)
function isFilled(content) {
  if (content == null) return false
  const lines = content.split('\n')
  for (const line of lines) {
    const t = line.trim()
    if (t === '') continue
    // H1 = บรรทัดแรกที่ไม่ว่าง — เริ่มเติมเมื่อไม่มี placeholder <...>
    return !/<[^>]+>/.test(t)
  }
  return false
}

// helper: เอา content ของไฟล์ระดับ topic (relPath = ชื่อไฟล์ตรง ๆ เช่น 'design.md')
function topLevel(files, name) {
  return files.has(name) ? files.get(name) : null
}

// ── helper: รวบ task folder จริง (ข้าม [...]) → Map<taskName, Set<file>> ──────
// ใช้ร่วมกันระหว่าง C2 (checkTasks) และ detectMode (design §4.2) — ห้าม duplicate เงื่อนไข
function collectRealTasks(files) {
  const tasks = new Map()
  for (const key of files.keys()) {
    const parts = key.split('/')
    if (parts[0] !== 'tasks' || parts.length < 3) continue
    const taskName = parts[1]
    if (taskName.startsWith('[')) continue // skip template placeholder [task-name]
    if (!tasks.has(taskName)) tasks.set(taskName, new Set())
    tasks.get(taskName).add(parts[2])
  }
  return tasks
}

// ── C2: ทุกโฟลเดอร์ใน tasks/ (ข้าม [...]) มีครบ 4 ไฟล์ ──────────────────────
// files key รูปแบบ: 'tasks/<taskName>/<file>' — รวบ taskName + เซตไฟล์ที่มี
function checkTasks(files) {
  const issues = []
  const tasks = collectRealTasks(files) // reuse helper เดียวกับ detectMode
  for (const [taskName, present] of tasks) {
    const missing = TASK_REQUIRED.filter((f) => !present.has(f))
    if (missing.length) {
      issues.push({
        code: 'C2',
        level: 'error',
        msg: `tasks/${taskName} ขาด ${missing.join(', ')}`,
      })
    }
  }
  return issues
}

// ── C3: ship.md เริ่มเติมแล้ว → ต้องมี '## 3. Learned rules' + ≥1 data row จริง ──────
// (B4) ยัง template H1 → ข้าม (chicken-egg) · (B3) ≥1 row จริง (ไม่นับ header/separator/row ว่าง)
function checkShipData(files) {
  const issues = []
  const ship = topLevel(files, 'ship.md')
  if (ship == null) return issues // ไม่มีไฟล์ → ไม่เช็ค (ยังไม่ถึง SHIP)
  if (!isFilled(ship)) return issues // ยัง template → ข้าม (B4)

  const lines = ship.split('\n')
  // หา section '## 3. Learned rules' (anchor H2 ที่ขึ้นต้นด้วยข้อความนี้)
  let secStart = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+3\.\s+Learned rules/.test(lines[i])) { secStart = i; break }
  }
  if (secStart === -1) {
    issues.push({ code: 'C3', level: 'error', msg: 'ship.md ขาด section "## 3. Learned rules"' })
    return issues
  }
  // ขอบเขต section = จนเจอ '## ' ถัดไป
  let secEnd = lines.length
  for (let i = secStart + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) { secEnd = i; break }
  }
  // หา data row จริงในตาราง: บรรทัดที่มี '|' ≥2, ไม่ใช่ separator (|---|), ไม่ใช่ header (มี cell ไม่ว่าง อย่างน้อย 1)
  // header แยกจาก data ด้วย separator — นับ row หลัง separator ที่มี cell ไม่ว่าง
  let sawSeparator = false
  let hasDataRow = false
  for (let i = secStart + 1; i < secEnd; i++) {
    const t = lines[i].trim()
    if (!t.startsWith('|')) continue
    if (/^\|[\s|:-]*\|?$/.test(t) && t.includes('-')) { sawSeparator = true; continue } // separator |---|
    if (!sawSeparator) continue // ยังไม่ถึง separator = ยังเป็น header
    // data row: split cells, มี cell ที่ไม่ว่าง
    const cells = t.split('|').slice(1, -1).map((c) => c.trim())
    if (cells.some((c) => c !== '')) { hasDataRow = true; break }
  }
  if (!hasDataRow) {
    issues.push({ code: 'C3', level: 'error', msg: 'ship.md section "Learned rules" ไม่มี data row (มีแค่ header/ตารางว่าง)' })
  }
  return issues
}

// ── template-aware content detection (ใช้กับ stage inference เท่านั้น) ──────
// เป็น heuristic ระดับ report (stage inference ไม่ใช่ ✖ — ไม่ขัด "✖ ไม่พึ่ง filled-detection")
// เจตนา: section ที่ยังเป็น "โครงเปล่าของ template" ต้องนับว่ายังไม่มีเนื้อ
//   template ของ build.md §4 มี table meta / ### heading ย่อย / checkbox / เส้นคั่น ติดมาตั้งแต่ต้น
//   ถ้านับแค่ "บรรทัดไม่ว่างและไม่ใช่ >" ทุก topic จะกระโดดเป็น VERIFY ทันทีที่เริ่มเขียน build.md

// separator ของ markdown table: '|---|---|' (ต้องมี '-' จริง — '| | |' ไม่ใช่ separator)
function isTableSeparator(t) {
  return /^\|[\s|:-]+\|$/.test(t) && t.includes('-')
}

// choice list ของ template: 'ผ่าน / ไม่ผ่าน', 'functional / e2e / uxui', 'มี/ไม่มี'
// กันชนกับ path/URL ด้วยการตัด segment ที่มี '.' ออก ('./troubleshooting.md' ไม่ใช่ choice)
function isChoiceList(t) {
  if (!t.includes('/')) return false
  const parts = t.split('/')
  if (parts.length < 2) return false
  return parts.every((p) => {
    const s = p.trim()
    return s !== '' && s.length <= 30 && !s.includes('.')
  })
}

// "ค่าที่ยังเป็นโครง template" — ว่าง / placeholder / label / เลขลำดับ / choice list
function isPlaceholderValue(text) {
  const t = text.trim().replace(/^`+|`+$/g, '').trim()
  if (t === '' || t === '-' || t === '—') return true
  if (/^<[^>]*>$/.test(t)) return true                    // <ชื่อ change>
  if (/_{2,}/.test(t)) return true                        // '__ รอบ' / '__ จุด'
  if (/^\*\*.*\*\*$/.test(t)) return true                 // '**ผลรวม**' = ช่องชื่อฟิลด์ ไม่ใช่ค่า
  if (/^\d+$/.test(t)) return true                        // เลขลำดับแถวของ template
  if (/^[A-Z]{2,}[-/][A-Z0-9\-/]*$/.test(t)) return true  // 'YYYY-MM-DD'
  return isChoiceList(t)
}

// มี "เนื้อจริง" ในช่วง [from, to) หรือไม่ — ตัดโครง template ออกก่อนนับ
function hasRealContent(lines, from, to) {
  for (let i = from; i < to; i++) {
    const t = lines[i].trim()
    if (t === '') continue
    if (t.startsWith('>')) continue                   // blockquote = คำอธิบายของ template
    if (/^#{3,}\s/.test(t)) continue                  // heading ย่อย (###+) ของโครง
    if (/^<!--/.test(t)) continue                     // HTML comment
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) continue    // เส้นคั่น
    if (/^```/.test(t)) continue                      // code fence marker
    if (t.startsWith('|')) {
      if (isTableSeparator(t)) continue
      if (isTableSeparator((lines[i + 1] || '').trim())) continue // header row (แถวก่อน separator)
      const cells = t.split('|').slice(1, -1)
      if (cells.every(isPlaceholderValue)) continue
      return true
    }
    const bullet = t.match(/^[-*+]\s*(.*)$/)
    if (bullet) {
      let body = bullet[1].trim()
      const box = body.match(/^\[([ xX])\]\s*(.*)$/)
      if (box) {
        if (box[1] === ' ') continue                  // checkbox ที่ยังไม่ติ๊ก
        body = box[2].trim()
      }
      if (body === '' || body.endsWith(':')) continue // prompt ที่ยังไม่ตอบ
      if (isPlaceholderValue(body)) continue
      // 'บันทึกไว้ที่ ...: มี/ไม่มี' — คำตอบหลัง ':' ยังเป็น choice ของ template
      const colon = body.lastIndexOf(':')
      if (colon !== -1 && isPlaceholderValue(body.slice(colon + 1))) continue
      return true
    }
    if (isPlaceholderValue(t)) continue
    return true
  }
  return false
}

// ── C1: artifact ของ stage N เริ่มเติม แต่ required ของ stage < N ยัง template (ข้ามลำดับ) → ⚠ ──
// + stage inference: stage ปัจจุบัน = stage สูงสุดที่มี artifact "เริ่มเติม"
function inferStageAndC1(files) {
  const issues = []
  const filledOf = (name) => {
    const c = topLevel(files, name)
    return c != null && isFilled(c)
  }
  // stage ที่ "เริ่มเติม" = มี artifact required หรือ optional ตัวใดตัวหนึ่ง filled
  let maxOrder = 0
  let stageName = '(ยังไม่เริ่ม)'
  for (const s of STAGES) {
    const anyFilled = [...s.required, ...s.optional].some(filledOf)
    if (anyFilled && s.order > maxOrder) { maxOrder = s.order; stageName = s.stage }
  }
  // section-based VERIFY inference (contract C2 — design.md §4)
  // build.md filled + section '## 4. ผล verify' ที่ "มีเนื้อจริง" → VERIFY
  // ★ heading อย่างเดียวไม่พอ: template ของ build.md มี heading §4 + โครง (table meta/###/checkbox)
  //   ติดมาตั้งแต่ต้น → ใช้ hasRealContent() ตัดโครง template ออกก่อนนับ (ดูคำอธิบายที่ helper)
  const buildContent = topLevel(files, 'build.md')
  if (buildContent != null && isFilled(buildContent)) {
    const buildLines = buildContent.split('\n')
    const secStart = buildLines.findIndex((l) => /^##\s+4\.\s+ผล verify/.test(l))
    let hasVerifySection = false
    if (secStart !== -1) {
      let secEnd = buildLines.length
      for (let i = secStart + 1; i < buildLines.length; i++) {
        if (/^##\s/.test(buildLines[i])) { secEnd = i; break }
      }
      hasVerifySection = hasRealContent(buildLines, secStart + 1, secEnd)
    }
    if (hasVerifySection) {
      const verifyEntry = STAGES.find((s) => s.stage === 'VERIFY')
      if (verifyEntry && verifyEntry.order > maxOrder) { maxOrder = verifyEntry.order; stageName = 'VERIFY' }
    }
  }
  // C1: stage ที่เริ่มเติม (order N) แต่ required ของ stage order < N ยังไม่ครบ filled
  for (const s of STAGES) {
    if (s.required.length === 0) continue
    const anyFilledHere = [...s.required, ...s.optional].some(filledOf)
    if (!anyFilledHere) continue
    // เช็ค required ของ stage ก่อนหน้า (order < s.order) ที่ยังไม่ filled
    for (const prev of STAGES) {
      if (prev.order >= s.order || prev.required.length === 0) continue
      const prevDone = prev.required.every(filledOf)
      if (!prevDone) {
        issues.push({
          code: 'C1',
          level: 'warn',
          msg: `${s.stage} เริ่มเติมแต่ ${prev.stage} (${prev.required.join('/')}) ยังเป็น template (ข้ามลำดับ)`,
        })
      }
    }
  }
  return { issues, stage: stageName }
}

// ── C4: design.md เริ่มเติมแล้ว → ต้องมี section 'Spec delta' (หรือ 'ไม่มี delta') → ⚠ ─────
function checkSpecDelta(files) {
  const issues = []
  const design = topLevel(files, 'design.md')
  if (design == null || !isFilled(design)) return issues // ไม่มี/ยัง template → ข้าม
  const hasDelta = /Spec delta/i.test(design) || /ไม่มี delta/.test(design)
  if (!hasDelta) {
    issues.push({ code: 'C4', level: 'warn', msg: 'design.md เริ่มเติมแล้วแต่ไม่มี section "Spec delta"' })
  }
  return issues
}

// ── C7: นับบรรทัด / tier / cap (contract C3+C4 — design.md §4) ──────────────
// นิยามการนับ = wc -l: split('\n') แล้วตัด element สุดท้ายทิ้งถ้าเป็น '' (ไฟล์จบ \n ไม่นับบรรทัดว่างท้าย)
function countLines(content) {
  const lines = content.split('\n')
  if (lines[lines.length - 1] === '') lines.pop()
  return lines.length
}

// ── parse tier จาก content ของ proposal.md (contract C4 — design.md §4) ─────
// อ่านเฉพาะ "cell ค่า" (ทุกอย่างหลัง pipe ตัวที่ 2) ของแถว '| **ขนาด** | ... |' — cell แรกเป็น label
// ลำดับการอ่าน:
//   1. นับ keyword ที่อยู่ใน `backtick` ก่อน — convention ของ template + proposal จริงทุกใบ
//      → proposal จริงที่เขียน `standard` แล้วอธิบายต่อ ("ก้ำกึ่ง fast/standard → ปัดขึ้น") ยัง resolve ได้
//   2. ไม่มี keyword ใน backtick เลย → fallback อ่านทั้ง cell (รองรับ proposal ที่ไม่ใส่ backtick)
// ambiguous = เจอ keyword ต่างชนิด >1 ตัว → null เสมอ (ห้ามเดา) → เข้า fail-safe ⚠ ของ checkCaps
//   ★ แถว template ที่ยังไม่เติม (`fast` / `standard` / `large`) เข้าเคสนี้ — กัน gate เขียวลวง
export function parseTier(content) {
  if (!content) return null
  for (const line of content.split('\n')) {
    if (!/^\|\s*\*\*ขนาด\*\*\s*\|/.test(line)) continue
    const secondPipe = line.indexOf('|', line.indexOf('|') + 1)
    if (secondPipe === -1) return null
    // superset ของ cell 2 (เผื่อค่ามี '|' หรือคอลัมน์เกิน 2) — ตัด pipe ปิดท้ายทิ้ง
    const value = line.slice(secondPipe + 1).replace(/\|\s*$/, '')
    return parseTierValue(value)
  }
  return null
}

// นับ keyword ชนิดต่าง ๆ ที่ปรากฏใน text (Set = distinct — เขียนซ้ำคำเดิมไม่ทำให้ ambiguous)
function tierKeywords(text) {
  return new Set(text.match(/\b(fast|standard|large)\b/g) || [])
}

function parseTierValue(value) {
  const backticked = (value.match(/`[^`]*`/g) || []).join(' ')
  let found = tierKeywords(backticked)
  if (found.size === 0) found = tierKeywords(value)
  return found.size === 1 ? [...found][0] : null
}

// resolve tier จาก files + mode (contract C4 — design.md §4)
// 1. proposal.md row ขนาด → tier; 2. fast-mode structural → 'fast'; 3. null (fail-safe)
function resolveTier(files, mode) {
  const proposal = topLevel(files, 'proposal.md')
  if (proposal != null) {
    const tier = parseTier(proposal)
    if (tier) return tier
  }
  if (mode === 'fast') return 'fast' // structural inference จาก mode ไม่ใช่การเดา
  return null
}

// checkCaps: pure fn, export (contract C3 — design.md §4) — รับ Map + tier, ไม่แตะ node:fs
// design.md นับเฉพาะบรรทัดก่อน '## 9. Spec delta' (anchor H2 เป๊ะ)
// tier === null + มี artifact ที่ cap ครอบ → ⚠ ข้ามเช็ค (ไม่ block); large → ไม่มี cap
export function checkCaps(files, tier) {
  const issues = []
  if (tier === null) {
    // ออก ⚠ เฉพาะเมื่อ topic มี artifact ที่ cap ครอบอย่างน้อย 1 ไฟล์ (ไม่ noise ถ้า topic ว่าง)
    const allCapFiles = Object.values(CAPS).flatMap((caps) => Object.keys(caps))
    const hasCapFile = [...new Set(allCapFiles)].some((f) => files.has(f))
    if (hasCapFile) {
      issues.push({ code: 'C7', level: 'warn', msg: 'ไม่ระบุ tier — ข้ามเช็ค cap' })
    }
    return issues
  }
  if (tier === 'large') return issues // large ไม่มี cap
  const caps = CAPS[tier] || {}
  for (const [file, cap] of Object.entries(caps)) {
    if (!files.has(file)) continue // ไม่มีไฟล์ = ไม่ใช่ issue ของ C7 (เรื่อง C1/C2)
    let content = files.get(file)
    // design.md: ตัดที่ heading '## 9. Spec delta' (anchor H2 เป๊ะ — กัน false-match ####)
    if (file === 'design.md') {
      const lines = content.split('\n')
      let cutIdx = lines.length
      for (let i = 0; i < lines.length; i++) {
        if (/^##\s+9\.\s+Spec delta/.test(lines[i])) { cutIdx = i; break }
      }
      content = lines.slice(0, cutIdx).join('\n')
    }
    const lineCount = countLines(content)
    if (lineCount > cap) {
      issues.push({
        code: 'C7',
        level: 'error',
        msg: `${file} มี ${lineCount} บรรทัด เกิน cap ${cap} บรรทัด (tier: ${tier})`,
      })
    }
  }
  return issues
}

// ── detectMode (design §4.2): fast / mixed / normal ──────────────────────────
// fast: receipt filled + ไม่มี proposal/design filled + ไม่มี task folder จริง
//   → ข้าม C1-C4; stage = 'fast-track'
// mixed: receipt filled + (proposal/design filled หรือมี task folder จริง)
//   → full checks + ⚠ C6 ("topic มีทั้งโครง full และ receipt")
// normal: ไม่มี receipt filled → พฤติกรรมเดิมทุกประการ (backward compatible)
function detectMode(files) {
  const receiptFilled = isFilled(topLevel(files, 'receipt.md'))
  if (!receiptFilled) return 'normal'
  const proposalFilled = isFilled(topLevel(files, 'proposal.md'))
  const designFilled = isFilled(topLevel(files, 'design.md'))
  const hasTasks = collectRealTasks(files).size > 0
  if (!proposalFilled && !designFilled && !hasTasks) return 'fast'
  return 'mixed'
}

// ── pure fn หลัก: checkTopic(files) → {issues, stage} ────────────────────────
export function checkTopic(files) {
  // ── ตัดสิน mode ก่อน — early-branch (design §4.2) ──
  const mode = detectMode(files)
  if (mode === 'fast') {
    // ข้าม C1-C4 ทั้งหมด — C5 (feature spec) cross-cutting ยังรันใน main ปกติ
    // C7 cap ยังเช็ค receipt.md (contract C3 — design.md §4)
    return { issues: checkCaps(files, 'fast'), stage: 'fast-track' }
  }
  const issues = []
  issues.push(...checkTasks(files))     // C2 ✖
  issues.push(...checkShipData(files))  // C3 ✖
  const { issues: c1Issues, stage } = inferStageAndC1(files) // C1 ⚠ + stage
  issues.push(...c1Issues)
  issues.push(...checkSpecDelta(files)) // C4 ⚠
  issues.push(...checkCaps(files, resolveTier(files, mode))) // C7 cap (contract C3 — design.md §4)
  if (mode === 'mixed') {
    // C6: mixed-state — receipt filled ร่วมกับโครง full → ⚠ ห้ามเป็น ✖ (rule #21)
    issues.push({ code: 'C6', level: 'warn', msg: 'topic มีทั้งโครง full และ receipt — ระบุ mode ให้ชัด' })
  }
  return { issues, stage }
}

// ── C5: feature spec format (checkFeatureSpec) ──────────────────────────────
// มี '## Requirement:' ≥1 (anchor H2 เป๊ะ) · ทุก Requirement มี '### Scenario:' ≥1
//   · ทุก Scenario มี GIVEN+WHEN+THEN (case-insensitive, ไม่ enforce order)
// group ด้วย section boundary (เจอ '## Requirement:' ถัดไป = ปิด block ของ Requirement ก่อน) — defer #1
export function checkFeatureSpec(name, content) {
  const issues = []
  const lines = content.split('\n')

  // index ของ '## Requirement:' (H2 เป๊ะ — กัน false-match #### ใน design.md §9; defer #2)
  const reqIdx = []
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+Requirement:/.test(lines[i])) reqIdx.push(i)
  }
  if (reqIdx.length === 0) {
    issues.push({ code: 'C5', level: 'error', msg: `${name}: ไม่มี "## Requirement:" (≥1)` })
    return issues
  }

  // แต่ละ Requirement block = [reqIdx[k] .. reqIdx[k+1]) (หรือจบไฟล์)
  for (let k = 0; k < reqIdx.length; k++) {
    const start = reqIdx[k]
    const end = k + 1 < reqIdx.length ? reqIdx[k + 1] : lines.length
    const reqTitle = lines[start].replace(/^##\s+Requirement:\s*/, '').trim() || '(ไม่มีชื่อ)'

    // หา '### Scenario:' ใน block นี้
    const scenIdx = []
    for (let i = start + 1; i < end; i++) {
      if (/^###\s+Scenario:/.test(lines[i])) scenIdx.push(i)
    }
    if (scenIdx.length === 0) {
      issues.push({ code: 'C5', level: 'error', msg: `${name}: Requirement "${reqTitle}" ไม่มี "### Scenario:"` })
      continue
    }
    // แต่ละ Scenario block = [scenIdx[j] .. scenIdx[j+1] หรือ end)
    for (let j = 0; j < scenIdx.length; j++) {
      const sStart = scenIdx[j]
      const sEnd = j + 1 < scenIdx.length ? scenIdx[j + 1] : end
      const scenTitle = lines[sStart].replace(/^###\s+Scenario:\s*/, '').trim() || '(ไม่มีชื่อ)'
      const body = lines.slice(sStart + 1, sEnd).join('\n')
      const missing = []
      if (!/\bGIVEN\b/i.test(body)) missing.push('GIVEN')
      if (!/\bWHEN\b/i.test(body)) missing.push('WHEN')
      if (!/\bTHEN\b/i.test(body)) missing.push('THEN')
      if (missing.length) {
        issues.push({
          code: 'C5',
          level: 'error',
          msg: `${name}: Scenario "${scenTitle}" ขาด ${missing.join('/')}`,
        })
      }
    }
  }
  return issues
}

// ── render helper ───────────────────────────────────────────────────────────
const SYM = { error: '✖', warn: '⚠' }
function countLevels(issues) {
  let err = 0
  let warn = 0
  for (const i of issues) {
    if (i.level === 'error') err++
    else if (i.level === 'warn') warn++
  }
  return { err, warn }
}

// ── fs walk (main เท่านั้น — pure fn ไม่รู้จัก fs) ──────────────────────────
const SKIP_TOPIC = new Set(['achieved'])
const SKIP_FILE = new Set(['context.md'])

// อ่านไฟล์ทั้งหมดใต้ dir ของ topic เป็น Map<relPath,content> (relPath relative จาก topic dir, POSIX)
function readTopicFiles(topicDir) {
  const files = new Map()
  const walk = (dir, prefix) => {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return // ENOENT/EACCES guard — ข้ามเงียบ ไม่พ่น absolute path
    }
    for (const e of entries) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name
      if (e.isDirectory()) {
        walk(join(dir, e.name), rel)
      } else if (e.isFile()) {
        if (!e.name.endsWith('.md')) continue
        try {
          files.set(rel, readFileSync(join(dir, e.name), 'utf8'))
        } catch {
          // ENOENT/EACCES — ข้ามไฟล์ที่อ่านไม่ได้ ไม่ leak path
        }
      }
    }
  }
  walk(topicDir, '')
  return files
}

// list active topic slugs (dir ใต้ docs/stages/ ข้าม achieved) — ใช้ทั้ง status + slug whitelist (B7)
function listTopics(stagesDir) {
  let entries
  try {
    entries = readdirSync(stagesDir, { withFileTypes: true })
  } catch {
    return []
  }
  return entries
    .filter((e) => e.isDirectory() && !SKIP_TOPIC.has(e.name))
    .map((e) => e.name)
}

// walk docs/features/*/spec.md → [{name, content}]
function readFeatureSpecs(featuresDir) {
  const specs = []
  let entries
  try {
    entries = readdirSync(featuresDir, { withFileTypes: true })
  } catch {
    return specs
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue
    const specPath = join(featuresDir, e.name, 'spec.md')
    try {
      const content = readFileSync(specPath, 'utf8')
      specs.push({ name: `docs/features/${e.name}/spec.md`, content })
    } catch {
      // ไม่มี spec.md → ข้าม (เช็คเฉพาะที่มีไฟล์)
    }
  }
  return specs
}

// ── main: 2 โหมด ────────────────────────────────────────────────────────────
function main() {
  const cwd = process.cwd()
  const stagesDir = join(cwd, 'docs', 'stages')
  const featuresDir = join(cwd, 'docs', 'features')
  const args = process.argv.slice(2)

  if (args.length > 1) {
    console.error('✖ ใช้: validate-topic.mjs [<slug>] — รับได้สูงสุด 1 arg')
    process.exit(2)
  }

  // C5 spec ใช้ทั้งสองโหมด (รวมเข้า total count)
  const featureSpecs = readFeatureSpecs(featuresDir)
  const featureIssues = featureSpecs.flatMap((s) => checkFeatureSpec(s.name, s.content))

  if (args.length === 0) {
    // ── โหมด status ──
    const topics = listTopics(stagesDir)
    if (topics.length === 0 && featureIssues.length === 0) {
      console.log('ไม่มีงานค้าง')
      process.exit(0)
    }
    if (topics.length === 0) {
      console.log('ไม่มี topic ใน docs/stages/')
    } else {
      console.log('topic'.padEnd(28), 'stage'.padEnd(14), '✖/⚠')
      console.log('-'.repeat(28), '-'.repeat(14), '-----')
      for (const slug of topics.sort()) {
        const files = readTopicFiles(join(stagesDir, slug))
        const { issues, stage } = checkTopic(files)
        const { err, warn } = countLevels(issues)
        console.log(slug.padEnd(28), stage.padEnd(14), `✖${err}/⚠${warn}`)
      }
    }
    if (featureIssues.length) {
      console.log('')
      console.log(`feature spec (C5): ✖${featureIssues.length}`)
    }
    process.exit(0) // status เป็นรายงาน ไม่ใช่ gate
  }

  // ── โหมด validate <slug> ──
  const slug = args[0]
  // slug whitelist (B7): ต้องตรง basename ของ dir ที่มีอยู่จริง — กัน path traversal
  const topics = listTopics(stagesDir)
  if (!topics.includes(slug)) {
    console.error(`✖ ไม่พบ topic "${slug}" ใน docs/stages/`)
    process.exit(2)
  }

  const files = readTopicFiles(join(stagesDir, slug))
  const { issues, stage } = checkTopic(files)
  // รวม C5 ของ feature spec (เป็น cross-cutting — report ในโหมด validate ด้วย)
  const allIssues = [...issues, ...featureIssues]

  console.log(`topic: ${slug} · stage (ประมาณการ): ${stage}`)
  if (allIssues.length === 0) {
    console.log('✓ โครงครบ (structural)')
    process.exit(0)
  }
  for (const i of allIssues) {
    console.log(`${SYM[i.level] || '?'} [${i.code}] ${i.msg}`)
  }
  const { err } = countLevels(allIssues)
  process.exit(err > 0 ? 1 : 0)
}

// main-guard: argv[1] comparison (ไม่ใช่ import.meta.main ที่ undefined บน node 20) — import จาก unit ไม่ trigger main
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main()
}
