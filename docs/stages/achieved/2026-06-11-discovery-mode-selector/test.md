# Test Plan — discovery-mode-selector

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> ตอน **SHIP** จะ merge เข้า `docs/techstack/installer/test.md`
> อิง guideline: `docs/techstack/installer/test.md` §"payload `.md` ล้วน" (§72-78) + §"change-sizing / judgment-rubric" (§131-137)

| | |
|---|---|
| **Slug** | `discovery-mode-selector` |
| **Component** | `installer` (payload playbook + command + README) |
| **จุดประสงค์ที่ต้อง verify** | mode 4 ค่าใน Discovery (canonical, orthogonal กับ tier/profile) + auto-suggest + debate orchestration + grill fold — ไม่พังของเดิม |

## 1. ขอบเขตการเทส (ตามจุดประสงค์ topic)
- mode taxonomy + behavior + auto-suggest + debate อยู่ canonical ที่ playbook เดียว (no-duplicate)
- พฤติกรรมแต่ละ mode วัดได้ (observable proxy) + auto-suggest precedence deterministic
- backward-compat: Discovery flow เดิม + grill keyword ยังทำงาน
- payload ship/install ครบ (markdown ไม่มี runtime → verify structural + install proof)

## 2. ชนิดการเทส
- [x] Functional (structural + observable demo — markdown payload ไม่มี service)
- [ ] E2E smoke — N/A (ไม่ใช่ FE)
- [x] Install proof (`setup:sandbox` → target)
- [ ] UX/UI verify — N/A
- [x] Consistency (3-way anchor) + no-duplicate + dead-link

## 3. Local env ที่ต้องรัน (จาก `docs/infra.md`)
| Service | คำสั่งรัน | port / หมายเหตุ |
|---|---|---|
| ไม่มี service | `npm test` / `npm run verify:pack` / `npm run lint:md` / `npm run setup:sandbox` | payload markdown — zero-dep node ≥20 |

> **dogfood note (Infra-1):** verify ที่ `src/` (source ที่เพิ่งแก้) + sandbox install — **ไม่** พึ่ง root dogfood ที่ stale (กัน false-green)

## 4. Test cases
| # | สถานการณ์ (อิงจุดประสงค์) | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|---|
| T1 | ship integrity | `npm test` + `verify:pack` | test เขียวหมด + payload ติด tarball |
| T2 | dead-link | `npm run lint:md` | 0 dead link |
| T3 | install proof | `setup:sandbox` → grep target | playbook §3.5 + command mode + README mode ลง target; root dogfood ไม่โดนแตะ |
| T4 | anchor 3-way consistency | grep "Discovery modes (ความเข้มของ Discovery)" 3 ไฟล์ | playbook (heading) ↔ command ↔ README ตรงกัน |
| T5 | no-duplicate | grep behavior/Observable/Precedence table ใน command/README | 0 (มีแค่ keyword map + pointer) |
| T6 | grill regression | grep section grill แยก | 0 (fold เป็น alias `ละเอียด`); keyword "ซักถามฉันหน่อย" → ละเอียด |
| T7 | auto-suggest fixture | trace 5 fixture ตาม precedence §3.5.4 | mode ตรงตาราง — โดยเฉพาะ "เล็ก+auth → สมดุล" (precedence 1 ทับ 4) |
| T8 | read-only command | grep write-intent ใน command | 0 |
| T9 | generic boundary | grep ชื่อรุ่น model ใน playbook | 0 (ไม่ผูกชื่อรุ่น) |
| T10 | structural conformance | grep §3.5.x | ครบ 6 ส่วน (taxonomy/3-axis/behavior/auto-suggest/debate/security) |

## 5. E2E smoke (FE) — N/A

## 6. UX/UI checklist (FE) — N/A

## 7. วิธีรันเทส (reproducible)
```
cd <repo root>
npm test && npm run verify:pack && npm run lint:md   # T1, T2
npm run setup:sandbox                                 # T3 → grep target ที่ path ที่ขึ้น
# T4-T10: grep structural/consistency บน src/ (ดู verify.md §2)
```

> **defer (track):** full spawn-real proof ของ debate (mode โต้วาที spawn agent จริง) = optional ตาม `design.md §8.2` — รอบนี้ verify structural (debate section ครบ + observable proxy + fallback 4 เงื่อนไข) แทน; รันจริงเมื่อ token budget พอ

---

## 8. Amend round 2 — mode `ไต่สวน` (เพิ่ม test cases)
| # | สถานการณ์ | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|---|
| V1 | ไต่สวน section ครบ | grep §3.5.7 องค์ประกอบ | blue/red-memory + debate-round-NN + fan-out role + 5 มุม + Must/Should-Have + converge + ถาม user ก่อนรอบ + fallback degrade ครบ |
| V2 | keyword 3-way | grep "ไต่สวน" command/README | command (keyword map) + README (capability) มี |
| V3 | regression | grep 4 mode เดิม + no-duplicate command | 4 mode เดิมคงครบ + command ไม่มี behavior table |
| V4 | install proof | setup:sandbox → grep target | §3.5.7 + command ไต่สวน ลง target จริง |
