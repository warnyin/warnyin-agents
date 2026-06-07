# Feature — Topic validator (structural validator + status)

> ความรู้ถาวรระดับ feature · promote จาก topic `validator-status` (achieved 2026-06-08)

## คืออะไร
`validate-topic.mjs` = **structural validator + status tool** (zero-dep `node:*`) ใน payload `.warnyin/workflow/scripts/` — เช็ค **โครง** ของ topic/feature spec แบบ deterministic (ไม่ใช่ semantic) แบ่งภาระจาก model ที่เคยทำเองทั้งหมด (เทียบ `openspec validate`/`status` ของ OpenSpec)

**2 โหมด:**
| โหมด | คำสั่ง | ผล |
|---|---|---|
| status | `validate-topic.mjs` (ไม่ใส่ arg) | ตารางทุก active topic (slug · stage ประมาณการ · ✖N/⚠N) · exit 0 เสมอ |
| validate | `validate-topic.mjs <slug>` | รายการ ✖/⚠ ละเอียด (มี code) · exit 1 มี ✖ / 0 สะอาด-หรือ⚠ / 2 slug ไม่ถูกต้อง |

## ทำงานยังไง
- **เช็ค structural 5 กลุ่ม** — C2 (tasks ครบ 4 ไฟล์), C3 (ship มี data row learned-rules), C5 (feature spec format Requirement/Scenario/GWT) = **✖** (existence/structure — ไม่พึ่งการเดา); C1 (artifact ข้าม stage), C4 (Spec delta มี/ไม่มี) = **⚠** (พึ่ง filled-heuristic — best-effort)
- **filled heuristic** = H1 (บรรทัดแรก) ไม่มี placeholder `<...>` — ใช้กับ ⚠ เท่านั้น (หยาบ ยอมรับ false ได้)
- **stage inference** = stage สูงสุดที่มี artifact "เริ่มเติม" ตามตาราง stage→artifact (required/optional)
- **path traversal guard** — slug whitelist จาก `readdirSync('docs/stages/')` ก่อนต่อ path → exit 2
- **security** — เฉพาะ `node:fs`(read)/`node:path`/`node:url`; ไม่มี child_process/network/write; output structural ไม่ echo เนื้อ artifact
- **wiring 3 จุด** (node-guard ทุกจุด — fallback เครื่องไม่มี node): `/warnyin:next` (status pre-scan), DESIGN gate §8 (guidance), SHIP step 1 (guidance ก่อน promote)

## ขอบเขต / ข้อจำกัด
- **structural เท่านั้น** — semantic (เนื้อหาถูก, claim ตรง source, delta ตรง code) ยังเป็นหน้าที่ model ตาม gate เดิม
- **✖ ไม่พึ่ง filled-detection** (deterministic) · heuristic ที่เดา "เติมแล้ว" = ⚠ best-effort (ไม่ block) — `docs/rule.md` §1
- backward compatible — topic เก่า/format เก่า → ⚠ ไม่ fail; เครื่องไม่มี node → playbook fallback
- ไม่แตะ installer (`scripts/` ใต้ `.warnyin/workflow/` ship ผ่าน CORE + allowlist `src/.warnyin/`)

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/workflow/scripts/validate-topic.mjs` + `src/tests/validate-topic.test.mjs`
- wiring: `src/.warnyin/workflow/{next.md, stages/design.md, stages/ship.md}` + command mirror `src/.claude/commands/warnyin/{next,design,ship}.md`
- canonical: `docs/techstack/installer/test.md` §"verify spec/delta payload"
