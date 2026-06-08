# Feature — Build-log narrative

> ความรู้ถาวรระดับ feature · promote จาก topic `build-log-narrative` (achieved 2026-06-08)

## คืออะไร
`docs/stages/<slug>/build-log.md` = **narrative timeline ของ BUILD fan-out** — เรื่องเล่าเรียงตามเวลาของเหตุการณ์สำคัญที่เกิดระหว่าง implement แต่ละ wave (sub-agent ไหนเริ่มอะไร / ตัดสินใจอะไร / ติดอะไร+แก้ยังไง / จบยังไง) เพื่ออุดช่วง **"กลาง wave" ที่ structured report ตอนจบไม่ครอบ**

อยู่คนละชั้นกับ artifact อื่นของ BUILD:
| artifact | เก็บอะไร |
|---|---|
| `build.md` (report) | สถานะ/ผล test/ไฟล์ที่แก้ **ต่อ task** + integration notes (สรุปสุดท้าย = status board) |
| **`build-log.md`** (narrative) | เหตุการณ์ "ระหว่างทาง" ต่อ wave (เล่าเป็นเรื่อง ไม่ใช่ status board) |
| `troubleshooting.md` | ปัญหายาก/ซ้ำที่แก้สำเร็จ (incident KB) |

โครง: `## Wave N` → `### <task> — <✅ passed\|✖ failed>` → bullet ต่อ event (`🟢 start` / `🤔 decision` / `🔴 error` / `✅ done`) → ปิดท้าย `## Full gate`

## ทำงานยังไง
- **sub-agent คืน events ผ่าน schema:** `build-wave.mjs` RESULT_SCHEMA มี field `events[]` (optional, `maxItems:10`) — agent บันทึก **เฉพาะจุดเปลี่ยน** (`kind` ∈ start/decision/error/done + `note` 1 บรรทัด) ไม่ใช่ทุก step; **worktree เขียน topic dir ไม่ได้** (troubleshooting #14) → คืนผ่าน schema เท่านั้น
- **main loop กลั่นเขียนเอง:** หลัง Workflow คืนผลแต่ละ wave → main loop ดึง `result.results[].events` (+ `status`/`summary`) → **append `## Wave N`** ลง `docs/stages/<slug>/build-log.md` (narrative ไม่ dump ดิบ); หลัง full gate → `## Full gate`. **pattern เดียวกับ `troubleshooting.md`** (main loop เป็นคนเขียนไฟล์ กันไฟล์ชนใน worktree)
- **narrative = AI judgment ไม่ใช่ pure function:** กลั่นเหตุการณ์เป็นเรื่องเล่าเป็นงานที่ AI ทำดีกว่า deterministic script → ไม่มี `composeBuildLog()` (ไม่ over-engineer)
- **graceful:** task ที่ไม่คืน events → section เขียนจาก `summary`+`status` ที่มี (ไม่ fabricate event)
- **canonical-copy:** kind 4 ค่า + นิยาม + mapping ไอคอน + โครง build-log.md = canonical เดียว (design ของ topic §3); prompt/command/playbook/template = pointer copy คำต่อคำ (กัน emit↔compose drift)

## ขอบเขต / ข้อจำกัด
- **เล่า "ระหว่างทาง" ไม่จด status board** — ชนิด/ผลสรุปต่อ task เต็มอยู่ `build.md` (ชี้ไปแทน, honors `unify-in-place`)
- **post-wave ไม่ real-time** — `parallel()` คืนทีเดียวตอนจบ wave ไม่ stream (เลือก artifact-native แทน live view ที่ผูก tool — Codex/Antigravity ไม่มี `/workflows`)
- **`events` optional (backward-compat)** — ไม่อยู่ root `required`; result เดิมที่ไม่คืน events ยัง valid + flow `parallel()` ไม่พัง
- **`maxItems:10`** = machine guard ของ "narrative ไม่ใช่ dump" (ชน cap = ควรกลั่นให้สูงขึ้น)
- **optional artifact** — `validate-topic.mjs` ไม่ require (นอก `STAGE_FILES` เหมือน troubleshooting.md)
- **tool-agnostic** — build-log.md เป็น artifact `.md` ที่ harness สร้างเองตาม playbook generic (ไม่ผูก Workflow tool)

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/workflow/scripts/build-wave.mjs` — RESULT_SCHEMA `events[]` + prompt ข้อ 8.1 (สั่ง agent บันทึกจุดเปลี่ยน)
- `src/.claude/commands/warnyin/build.md` — ขั้น compose build-log.md (main loop, คู่ขั้นรวม troubleshooting)
- `src/.warnyin/workflow/stages/build.md` — principle #13 (observability artifact) + Output entry + Gate item
- `src/.warnyin/template/stages/[topic]/build-log.md` — canonical skeleton (โครง narrative)
- techstack: `docs/techstack/workflow-core/`
- มาจาก discovery umbrella: `docs/stages/memory-identity-observability/` (Gap B)
