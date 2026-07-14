# Feature — Change sizing (triage router)

> ความรู้ถาวรระดับ feature · promote จาก topic `change-sizing-router` (achieved 2026-06-11)
> ประเมินขนาด change ก่อนจ่าย ceremony → แนะนำ route ที่เหมาะกับขนาด (read-only)

## คืออะไร
capability ที่ **ประเมินขนาด (sizing) ของ change ตั้งแต่ต้น** ผ่าน command `/warnyin:triage` (read-only) → จัดเป็น **3 tier `{fast, standard, large}`** ด้วย rubric (signals + hard-floor) → **แนะนำ route** แล้วหยุด (ให้ user สั่ง command เอง — pattern เดียวกับ `next`). แก้ root cause: workflow เคยมีเส้นทางเดียว ceremony เท่ากันหมด → งานเล็ก (typo/bugfix) จ่าย overhead เกิน, งานใหญ่ไม่มี trigger บังคับ Discovery

- **judgment router (⚠ ไม่ใช่ ✖):** tier เป็น heuristic ปรับได้ ไม่ใช่ hard gate (สอด philosophy "structural validator ✖ ไม่พึ่ง filled-detection")
- **ต่างจาก `next`:** triage = ประเมิน **request ใหม่ by size** ; next = route **topic เดิม by stage** — คนละแกน input

## องค์ประกอบ
| # | กลไก | layer | ทำอะไร |
|---|---|---|---|
| 1 | **triage rubric (canonical)** | `triage.md` playbook | 3-tier taxonomy + signals + tie-break (ก้ำกึ่ง→standard) + hard-floor 5 หมวด + escalation/downgrade 3 step + fast-track skip-list + route behavior — **single source of truth** ที่ทุกที่ชี้มา |
| 2 | **`/warnyin:triage` command** | `.claude/commands/warnyin/triage.md` | adapter บาง (read-only, user-invoked) ชี้ playbook ด้วย backtick runtime-ref — รับคำอธิบาย change → รายงาน tier+route |
| 3 | **fast-track wiring (4 stage)** | `design.md §7` + `verify.md` + `ship.md` hook | reframe §7 (2-level → 3-tier) + pointer hook ใน verify/ship → tier `fast` เดิน lite ตาม skip-list canonical; ชี้ด้วย markdown-link (ไม่ inline rubric) |
| 4 | **hard-floor (5 หมวด)** | `triage.md §2B` + row SHIP | auth/authz · data-migration/schema · secret/credential · public-API/contract(breaking) · security-sensitive → บังคับ ≥ standard เป็น**ค่าตั้งต้น** (fail-safe กันงานอ่อนไหว fast); ข้อยกเว้นเดียว = **explicit user override** ผ่าน `/warnyin:fastlane` (ยืนยัน 2 ชั้น → `override โดย user` ใน receipt meta → ship-lite ยอม) — ดู feature [`fastlane`](../fastlane/feature.md) |
| 5 | **DESIGN sizing gate** | `design.md §4 step 1.5` | **establish tier ก่อนจ่าย ceremony** — DESIGN ประเมินเอง → มั่นใจกำหนด / ไม่มั่นใจถาม user (triage / กำหนดเอง); กัน DESIGN เดินโดยไม่รู้ขนาด (enforcement — topic `design-tier-gate` 2026-06-11) |

## ทำงานยังไง (flow)
- **triage:** user อธิบาย change → `/warnyin:triage` → อ่าน rubric → ประเมิน signals → ตัด tier (เคารพ hard-floor, ก้ำกึ่ง→ปัดขึ้น standard) → รายงาน **tier + เหตุผล + route + คำเตือน hard-floor** → **หยุด** ให้ user สั่ง command
- **fast-track:** triage บอก `fast` → `/warnyin:design` fast-track (ข้าม business/panel/dry-run, 1 task, model `cheap`) → build (1 agent) → verify-lite → ship-lite — **correctness floor (test เขียว) คงไว้ทุก stage**
- **escalation (symmetric):** เริ่ม fast → พบใหญ่กว่า/แตะ hard-floor กลางทาง → **เติม artifact ที่ fast-track ข้าม** แล้วเดิน flow tier ใหม่ต่อ (topic ไม่ต้องเริ่มใหม่); over-size → downgrade ได้ แต่ห้ามข้าม hard-floor; sizing = default ปรับได้ทุกเมื่อ ไม่ lock

## ขอบเขต / ข้อจำกัด (การตัดสินใจเชิงสถาปัตยกรรม)
- **MVP = assess + fast-track งานเล็ก** — `large` แค่ route ไป "Discovery บังคับ"; **decompose L/XL เป็น epic/หลาย topic อัตโนมัติ = future** (out of scope)
- **1 มิติ (size) ไม่ใช่ 2 มิติ size×type** — ชนิดงานเป็น *สัญญาณ* ไม่ใช่แกนแยก
- **one-shot executor มีแล้วแบบมี guard** — `/warnyin:fastlane` (feature [`fastlane`](../fastlane/feature.md)) เดิน fast tier จบในคำสั่งเดียว โดย `/warnyin:triage` ยัง **read-only แนะนำเท่านั้น ไม่ auto-execute** (คนละ command — triage ไม่ collapse gate); ความเสี่ยง mis-size ที่เคยห้าม one-shot ถูกคุมด้วย hard-floor gate ก่อนแตะโค้ด + escalation symmetric + audit trail ใน receipt _(กลับ decision เดิม "ไม่เพิ่ม one-shot" — ตอนนั้น fast tier ยังไม่มี guard เหล่านี้)_
- **rubric canonical ที่ `triage.md` เดียว** — `design.md §7`/`verify.md`/`ship.md`/command ชี้มาด้วย pointer ไม่ duplicate (canonical-copy)
- **command-only (ไม่ทำ skill auto-invoke)** — triage เป็น utility read-only แต่คงเป็น command user-invoked ตาม design scope (ต่างจาก next/explore ที่เป็นทั้ง skill+command — triage รอบนี้ทำ command ก่อน)
- **behavior change ที่ตั้งใจ:** `design.md §7` tier `large` **บังคับ `/warnyin:discovery`** (เดิม "ใหญ่" ไม่บังคับ)

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/workflow/triage.md` (rubric canonical) · `src/.claude/commands/warnyin/triage.md` (command adapter)
- `src/.warnyin/workflow/stages/{design.md §7, verify.md, ship.md}` (fast-track hook 4 stage) · `workflow/README.md` (capability tree)
- `src/.warnyin/installer/templates/CLAUDE.md` (slash-command list)
- rule กลาง: `docs/rule.md §1` (change-sizing judgment-router) · เทียบมิติ: `next.md` (router by stage), feature `build-orchestration` (fast → model `cheap` + DAG width 1)
- **cross-feature note:** `triage.md §2C "Loop-tuning default per tier"` (default credit-horizon/batching ต่อ tier) ถูก add โดย feature `learning-loop-tuning` — tier ที่นิยามที่นี่ถูกใช้เป็น default ของ fix-loop tuning ด้วย (ดู `docs/features/learning-loop-tuning/`)
