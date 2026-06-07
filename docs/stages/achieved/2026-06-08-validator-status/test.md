# Test Plan — validator-status

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> อิง guideline `docs/techstack/installer/test.md` §"verify spec/delta payload" + §"payload `.md`" + design §8

| | |
|---|---|
| **Slug** | `validator-status` |
| **Component** | installer / workflow payload (script `validate-topic.mjs` มี runtime จริง — เทสพฤติกรรมได้เต็ม) |
| **Env** | local — build branch `build/validator-status` (รัน node ตรง, ไม่มี service) |
| **วันที่** | `2026-06-08` |

## เคสทดสอบ

### T1 — Ship integrity (gate เดิม)
- `npm test` (53) เขียว · `lint:md` 0 dead-link · `verify:pack` (validate-topic.mjs ติด tarball, docs/ ไม่รั่ว)

### T2 — Behavior จริง (validator มี runtime — เทสตาม CLI contract §3 + เช็ค C1-C5 §4)
รัน `node src/.warnyin/workflow/scripts/validate-topic.mjs` กับสถานการณ์จริง + fixture ใน temp:
- **status mode:** ไม่ใส่ arg → ตาราง active topic + exit 0
- **validate mode:** `<slug>` ที่โครงครบ → ✓ exit 0
- **C2:** fixture topic ที่ `tasks/x/` ขาด `rule.md` → ✖ [C2] + exit 1
- **C3 chicken-egg (B4):** topic ที่ ship.md ยัง template → C3 ข้าม (ไม่ ✖) · ship เริ่มเขียนแต่ไม่มี data row → ✖ [C3]
- **C5:** feature spec จริง 3 ไฟล์ (context-profiles/spec-delta/utility-skills) → ✓ · fixture spec ที่ Requirement ไม่มี Scenario → ✖ [C5]
- **C1/C4 (⚠):** fixture build.md เริ่มเติมแต่ design ยัง template → ⚠ [C1] exit 0 · design ไม่มี Spec delta → ⚠ [C4] exit 0
- **path traversal (B7):** `../..` → exit 2, ไม่อ่านไฟล์นอก docs/stages/
- **skip:** `achieved/` + `context.md` ไม่ถูกนับเป็น topic

### T3 — Regression baseline ตามวงจร Spec delta (feature ใหม่ topic-validator = establish baseline)
- **baseline ที่ใช้:** `docs/features/spec-delta/spec.md` (feature ที่ topic ก่อนสร้าง) — รอบนี้ validator เช็ค format ของ spec ตัวนี้เอง = **dogfood C5** (validator validate spec ที่เป็น baseline ของตัวเอง)
- **scenario ใน §9 ของ topic (delta = test case ใหม่):** ทุก Scenario ใน design §9 (script ใน payload / validate จับ error / ship no-data-row / slug invalid / artifact ข้าม stage / wiring 3 จุด) → แปลงเป็น test case จริง เทียบ THEN
- feature `topic-validator` ยังไม่มี spec (จะสร้างตอน SHIP) → รอบนี้ = **establish baseline ไม่ใช่ regression** (QA-B3)

### T4 — Security invariant (code review §6 — pin จาก panel Security)
- grep validate-topic.mjs: ไม่มี `child_process`/`require('http')`/`fetch`/`writeFile`/`writeFileSync` — เฉพาะ `node:fs` read + `node:path` + `node:url`
- output ไม่ echo เนื้อ artifact (รายงานเฉพาะชื่อไฟล์/section/code)
- ENOENT/EACCES guard — ไม่พ่น absolute path

### T5 — Wiring node-guard (จาก task playbook-wiring)
- grep `validate-topic.mjs` พบใน next.md + stages/design.md + stages/ship.md (3 จุด — §9 scenario "wiring ครบ")
- node-guard "ถ้ารัน node ได้" ครบทุกจุด · ตาราง heuristic fallback ใน next.md ไม่ถูกลบ

## เกณฑ์ผ่านรวม
T1-T5 ผ่าน · validator behavior ตรง CLI contract + เช็ค C1-C5 ครบ · ไม่มี regression · นับรอบแก้
