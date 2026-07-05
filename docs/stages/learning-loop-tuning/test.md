# Test Plan — Learning Loop Tuning guidance

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> แผน/วิธีเทสของ topic นี้ — ตอน **SHIP** merge เข้า KB (feature `learning-loop-tuning`)

| | |
|---|---|
| **Slug** | `learning-loop-tuning` |
| **Component** | workflow-playbook (`src/.warnyin/workflow/`) |
| **จุดประสงค์ที่ต้อง verify** | guidance loop-tuning (C1–C4) เป็น observable artifact ถูกจุด + non-blocking + dedup ถูก + ไม่ทำ gate/regression เดิมพัง |

## 1. ขอบเขตการเทส
feature ประเภท playbook (**ไม่มี runtime**) → เทส = **assert observable artifact ใน `src/`** (grep/diff deterministic) ไม่ใช่รัน service; ครอบ 2 task (loop-guidance, design-note) + touched-surface regression (minimalism/change-sizing/build-orchestration)

## 2. ชนิดการเทส
- [x] Functional (grep-assert ตาม test-flow ใน `tasks/*/spec.md`)
- [x] Regression (scenario เดิมของ feature ที่แตะ)
- [x] Static gate: dead-link (`npm run lint:md`) + unit/pack (`npm test`, `npm run verify:pack`)
- [ ] E2E/UX — N/A (ไม่มี UI)

## 3. Local env
| Service | คำสั่งรัน | หมายเหตุ |
|---|---|---|
| — | — | ไม่มี runtime — เทสด้วย grep/diff + node scripts ที่ repo มีอยู่ |

## 4. Test cases (assert observable artifact)
| # | สถานการณ์ (จุดประสงค์) | วิธี | ผลที่คาดหวัง |
|---|---|---|---|
| T1 | C1 ★ loop tuning + guard ใน build+verify | grep 2 ไฟล์ | เจอทั้งคู่ + guard "ไม่ลด correctness/test-floor" |
| T2 | C1 anchor ถูก (build §3 item8/§4 step6 · verify §3 item5/§4 step5) | อ่าน section | อยู่จุด fix loop จริง |
| T3 | C3 report note (enum per-finding\|batched) non-blocking | grep + section | อยู่ท้าย loop ไม่ใช่ใน gate |
| T4 | backward-compat gate คงเดิม | diff §7/§6/§8 vs b75956e | item count เท่าเดิม |
| T5 | C2 default table triage-only + dedup 2 ทิศ | negative-grep | table เฉพาะ triage §2C, why-block ไม่รั่วเข้า triage |
| T6 | C4 ★ starting-artifact ใน design.md §4 step7 | grep | เจอ + "ไม่ใช่ knob ใหม่" |
| T7 | verify §1 fast-track hook non-blocking line | grep | เจอ |
| R1 | regression minimalism "full hierarchy block ที่เดียว" | grep "one-liner ได้" | เจอเฉพาะ minimalism.md |
| R2 | regression change-sizing skip-list resolve | grep anchor | `#fast-track-skip-list` ยัง resolve, §2C ไม่ทับ |
| R3 | dead-link + unit + pack | node scripts | เขียวหมด |

## 7. วิธีรันเทส (reproducible)
```bash
# T1–T7 + R1–R2: grep/diff assertion (ดู verify.md §2 ผลจริง)
npm test           # 109/109 (unit + verify-pack logic)
npm run lint:md    # dead-link gate (pointer ข้าม surface)
npm run verify:pack
# gate-unchanged: diff §7/§6/§8 gate item count เทียบ b75956e (commit ก่อน topic)
```
