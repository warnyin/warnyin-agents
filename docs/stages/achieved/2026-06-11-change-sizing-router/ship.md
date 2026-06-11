# Ship — change-sizing-router

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ — เขียนหลังย้าย topic เข้า `docs/stages/achieved/2026-06-11-change-sizing-router/` แล้ว

## 1. สรุป topic
- **ทำอะไร:** เพิ่ม capability **change-sizing** — `/warnyin:triage` (read-only router) + playbook `triage.md` ที่ประเมินขนาด change เป็น 3 tier `{fast,standard,large}` ด้วย rubric (signals + hard-floor 5 หมวด + escalation) แล้วแนะนำ route; reframe `design.md §7` (2-level → 3-tier) + wire fast-track hook ครบ 4 stage (design/build/verify/ship) ชี้ skip-list canonical ที่ `triage.md` เดียว. BUILD: wave เดียวขนาน 3 task (file-ownership disjoint) full-gate เขียว. VERIFY: 15/15 เคส, 0 รอบแก้ (structural + install proof + empirical observable demo)
- **ประเภท:** ☑ **feature ใหม่** → `docs/features/change-sizing/`

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/change-sizing/feature.md` | **สร้างใหม่** — capability change-sizing: องค์ประกอบ (rubric/command/fast-track wiring/hard-floor), flow (triage/fast-track/escalation), ขอบเขต/ข้อจำกัด, ไฟล์ |
| `docs/features/change-sizing/business.md` | **สร้างใหม่** — เป้าหมาย/persona/success metric/scope จาก discovery + proposal |
| `docs/features/change-sizing/spec.md` | **สร้างใหม่** จาก Spec delta `design.md §9` (5 Requirement ทั้งหมด ADDED — triage assess+route, hard-floor 5 หมวด, fast-track skip-list, escalation symmetric, §7 3-tier; ไม่มี MODIFIED/REMOVED → ไม่มีเคส key-not-found) |
| `docs/rule.md` §1 | **LR1** — "change-sizing เป็น judgment router (⚠)": sizing-aware ceremony · 3-tier judgment · hard-floor 5 หมวด ≥ standard · fast-track ลด ceremony ไม่ลด correctness · escalate/downgrade symmetric · แนะนำแล้วหยุด |
| `docs/techstack/installer/test.md` | เพิ่ม §"verify change-sizing / judgment-rubric capability" — empirical observable demo (รัน rubric ต่อเคส/หมวด + deterministic ceremony-count + read-only git-clean + canonical-copy/anchor + install proof) |
| `docs/troubleshooting.md` #19 | lint:md dead-link จาก illustrative markdown-link ใน task-brief → ห่อ backtick (TS-2) |
| `docs/codemap/index.md` + `architecture.md` | เพิ่ม triage.md capability + `/warnyin:triage` command + change-sizing ใน 5-stage flow; update Generated header |
| `docs/techstack/installer/structure.md` | **ไม่แตะ** — high-level (บรรทัด `src/.warnyin/{workflow}` ครอบ triage.md อยู่แล้ว ไม่เปลี่ยนรูปโครง) |
| `docs/infra.md` / `docs/project.md` | **ไม่แตะ** — ไม่มี env/service ใหม่ |

## 3. Learned rules (planned + emergent)
| rule (generalize) | evidence (pointer + artifact) | scope | promote? |
|---|---|---|---|
| **change-sizing = judgment router (⚠)** — ประเมินขนาดก่อนจ่าย ceremony · 3-tier judgment ไม่ใช่ gate · hard-floor 5 หมวด ≥ standard · fast-track ลด ceremony ไม่ลด correctness · escalate/downgrade symmetric · แนะนำแล้วหยุด | `triage.md` rubric + `verify.md` D1-D6/Dc demos ผ่าน + `design.md §3` (canonical) | `project` → `docs/rule.md §1` | ✅ promote (LR1, user ยืนยัน) |
| dev-tooling spawn `npm` ต้องรองรับ Windows (`npm.cmd`) | `troubleshooting.md` TS-1 (topic) | component:installer | ✂️ ตัด — **ซ้ำ `docs/troubleshooting.md #4`** ที่มีอยู่แล้ว (ไม่ promote ซ้ำ) |
| task-brief ที่ยกตัวอย่าง markdown-link ของไฟล์ปลายทาง → ห่อ backtick (illustrative ≠ live link) | `build.md §3.5` + `troubleshooting.md` TS-2 (topic) | component:installer | ✅ promote (LR3, user ยืนยัน) → `docs/troubleshooting.md #19` |

## 4. Archive
- ย้ายจาก `docs/stages/change-sizing-router/` → `docs/stages/achieved/2026-06-11-change-sizing-router/` เมื่อ 2026-06-11 (git mv)

## 5. หมายเหตุ (นอก workflow)
- **โค้ดจริงอยู่ build branch `build/change-sizing-router`** — SHIP จัดการเอกสาร+archive เท่านั้น; merge build branch → main (+ release sync src→root dogfood) จัดการนอก workflow
- **src→root sync:** ไฟล์ใหม่ (triage.md playbook + command) ยังไม่ปรากฏใน root dogfood (gitignored) — จะ regenerate ตอน release ด้วย `npm run setup:dogfood`; `/warnyin:triage` ใช้งานได้เต็มหลัง sync นั้น (ก่อนหน้านี้ test ผ่าน sandbox install แล้ว)
