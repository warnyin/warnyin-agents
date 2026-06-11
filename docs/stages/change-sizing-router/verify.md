# Verify Report — change-sizing-router

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> สรุปผลทดสอบเชิงพฤติกรรม/จุดประสงค์ + รายการแก้ไข + จำนวนรอบ

| | |
|---|---|
| **Slug** | `change-sizing-router` |
| **Component** | `installer` (payload `.md` + command adapter — ไม่มี runtime service) |
| **วันที่** | 2026-06-11 |
| **ผลรวม** | ✅ **ผ่าน** — 15/15 เคส (G1-G4, I1, C1-C2, D1-D6, Dc) |
| **จำนวนรอบการแก้ไข (fix iterations)** | **0** รอบ — ผ่านทุกเคสตั้งแต่รอบแรก (BUILD full-gate จับ dead-link/anchor/pack ไว้แล้ว) |
| **จำนวนจุดที่แก้** | 0 จุด |

## 1. จุดประสงค์ที่ verify (จาก spec/tasks)
- `/warnyin:triage` ประเมินขนาด change → tier (fast/standard/large) + route ถูกตาม signals + เคารพ hard-floor 5 หมวด
- fast-track ลด ceremony จริงโดยคง correctness floor · escalation/downgrade เป็น step · read-only เด็ดขาด
- fast-track wire ครบ 4 stage ชี้ canonical (rubric ที่ `triage.md` เดียว ไม่ duplicate) · install จริงผ่าน `cli.mjs` ได้

## 2. ผลการเทส
| # | Test case / flow | ชนิด | ผล | หมายเหตุ |
|---|---|---|---|---|
| G1 | repo regression `node --test` | functional | ✅ | 58/58 pass, 0 fail (build branch — ไม่มี assertion เดิมพัง) |
| G2 | dead-link `npm run lint:md` | structural | ✅ | 0 dead-link (102 ไฟล์/48 ลิงก์) — artifact resolve หลัง integrate |
| G3 | `validate-topic.mjs` | structural | ✅ | ไม่มี ✖ |
| G4 | pack cleanliness `npm pack --dry-run` | structural | ✅ | ไฟล์ใหม่ 7 ตัว INCLUDED; ไม่มี src/tests·docs·root dogfood รั่ว |
| I1 | install proof `setup:sandbox` | executable | ✅ | target มี triage.md playbook+command + `/warnyin:triage` ใน CLAUDE.md + README capability; **root dogfood ไม่โดนแตะ** (repo git สะอาด) |
| C1 | canonical-copy design §3 ↔ triage.md §2 | consistency | ✅ | hard-floor 5 หมวด + tier fast-row **identical คำต่อคำ** (diff = ว่าง) |
| C2 | no-duplicate rubric | consistency | ✅ | command 0 markdown table (backtick runtime-ref) · §7 0 inline skip-list (markdown-link เท่านั้น) |
| D1 | change เล็กไม่ sensitive → `fast` | observable | ✅ | "แก้ typo error 1 ไฟล์" → tier `fast` + route fast-track (ตรง §2A) |
| D2 | hard-floor 5 หมวด → ≥ standard | observable | ✅ | 1 เคส/หมวด (auth · migration/schema · secret · public-API breaking · security-sensitive) → ทุกเคส ≥ standard, ไม่มี fast |
| D3 | escalation กลางคัน | observable | ✅ | fast → แตะ hard-floor → เติม artifact ที่ข้าม → flow standard ต่อ, topic ไม่ต้องเริ่มใหม่ |
| D4 | read-only | executable | ✅ | command 0 write-intent (ไม่มี Write/Edit/สร้างไฟล์) + playbook §4 read-only → git สะอาดเมื่อรัน |
| D5 | regression §7 | structural | ✅ | §7 = 3-tier ชี้ canonical (0 inline) · Gate §8 standard/large คงเดิม · large บังคับ Discovery (intentional) |
| D6 | anchor resolve | structural | ✅ | `## Fast-track skip-list` → slug `fast-track-skip-list` ตรง link `../triage.md#fast-track-skip-list` |
| Dc | fast-track ลด ceremony (deterministic) | observable | ✅ | M(fast) < N(standard) · fast ข้ามครบ 4 จาก {business.md, panel, dry-run, multi-task} ≥ 3 |

## 3. UX/UI verify (ถ้าเป็น FE)
- N/A — ไม่ใช่ frontend (capability เป็น read-only chat report; verify เชิงโครงสร้าง + install proof แทน ตาม guideline `techstack/installer/test.md`)

## 4. รายการแก้ไข (สรุปการแก้ระหว่าง verify)
| รอบ | ปัญหาที่เจอ | วิธีแก้ | ไฟล์ที่แก้ |
|---|---|---|---|
| — | ไม่มี | — | — |

> 0 รอบ — dead-link/anchor/pack ถูกจับและปิดที่ BUILD full-gate (`build.md §3.5`) ก่อนถึง VERIFY แล้ว

## 5. ปัญหายาก/ซ้ำ → troubleshooting
- ไม่มีใหม่ที่ VERIFY. `verify:pack` ENOENT บน Windows ใช้ workaround `npm pack --dry-run --json` — บันทึกไว้แล้ว `./troubleshooting.md` TS-1 (guideline `techstack/installer/test.md` §"dev Windows" ระบุตรงกัน)

## 6. หมายเหตุถึง user (ถ้าถามระหว่างทาง)
- ไม่ได้ถาม — ไม่มี fix loop (ผ่านรอบแรกทุกเคส)

## ✅ Gate → SHIP (ดู `.warnyin/workflow/stages/verify.md` ข้อ 6)
- [x] เทสตามจุดประสงค์ครบ (functional ตาม test-flow — D1-D6 + Dc)
- [x] regression: ไม่มี feature-spec baseline (feature `change-sizing` สร้างตอน SHIP) · repo `node --test` 58/58 · §7 reframe ไม่ทำ gate standard/large หลวม (D5)
- [x] FE UX/UI: N/A (ไม่ใช่ FE)
- [x] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่าน (0 รอบ — ไม่มีข้อ fail)
- [x] test.md + verify.md เขียนครบ
- [x] ปัญหายากบันทึก troubleshooting.md แล้ว (TS-1/TS-2 จาก BUILD; ไม่มีใหม่)
