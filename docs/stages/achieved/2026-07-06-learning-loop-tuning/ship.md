# Ship — Learning Loop Tuning guidance

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ — เขียนหลังย้าย topic เข้า `docs/stages/achieved/2026-07-06-learning-loop-tuning/` แล้ว

## 1. สรุป topic
- **ทำอะไร:** ตกผลึก insight จาก paper *"Understanding the Challenges in Iterative Generative Optimization with LLMs"* (arXiv:2603.23994v2) เป็น **guidance-only** ใน playbook ที่มี fix loop จริง — ให้ agent ตัดสิน credit-horizon + experience-batching ("ปรับลำดับ/การจัดกลุ่มของการแก้") ตาม tier แทนเดาเอง โดยไม่เพิ่ม knob จริง/ไม่เพิ่ม hard gate/ไม่ลด correctness floor. canonical wording (C1–C4) นิยามครั้งเดียวใน design.md §2.5 แล้ว copy ลง 4 surface. Panel 5 มุมจับ 5 blocker (พิกัด section ผิด, proxy→hard-gate, scenario ไม่ falsifiable, baseline ขาด) แก้พร้อม evidence.
- **ประเภท:** ☑ feature ใหม่ → `docs/features/learning-loop-tuning/`

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/learning-loop-tuning/` (ใหม่) | feature.md + business.md — คืออะไร/ทำงานยังไง/คุณค่า |
| `docs/features/learning-loop-tuning/spec.md` | merge Spec delta §9 — 3 ADDED requirement (guidance build/verify · default triage §2C · starting-artifact note) |
| `docs/rule.md` | + convention **"loop-tuning convention"** (project scope) |
| `docs/features/change-sizing/feature.md` | + cross-feature note (SA-S2): loop-tuning default add ที่ triage §2C |
| `docs/troubleshooting.md` | + **#25** build-wave stall = false-negative |
| `docs/codemap/index.md` | + capability entry learning-loop-tuning + header rescan 2026-07-06 |
| `docs/techstack/*`, `docs/infra.md`, `docs/project.md` | ไม่แตะ — ไม่มี component/service/infra ใหม่ (playbook markdown ล้วน) |

## 3. Learned rules (planned + emergent)
| rule (generalize) | evidence (pointer + artifact) | scope | promote? |
|---|---|---|---|
| **loop-tuning convention** — fix loop มี guidance ปรับลำดับ/การจัดกลุ่มของการแก้ (credit-horizon+batching) ไม่ลด correctness; default ผูก tier (triage §2C), why อยู่ build/verify, non-blocking (report note ไม่ใช่ gate) | `docs/features/learning-loop-tuning/`; verify 16/16 + gate-unchanged; paper arXiv:2603.23994v2 | `project` | ✅ → `docs/rule.md` |
| **SA-S2 cross-feature pointer** — feature ที่ add behavior ลงไฟล์ของ feature อื่น (loop-tuning default → triage ของ change-sizing) ต้องมี pointer กัน orphan | design review §10 SA-S2; `docs/features/change-sizing/feature.md` | `project` | ✅ → change-sizing feature |
| **build-wave stall = false-negative** (emergent) — workflow failed/skipped ≠ verdict; ตรวจ worktree branch จริงก่อนสรุปล้ม | `troubleshooting.md` #25; topic BUILD (loop-guidance stall→integrate→full-gate เขียว) | `project` | ✅ → `docs/troubleshooting.md` #25 |

## 4. Archive
- ย้ายจาก `docs/stages/learning-loop-tuning/` → `docs/stages/achieved/2026-07-06-learning-loop-tuning/` เมื่อ 2026-07-06 (git mv)
- โค้ดจริง (`src/.warnyin/workflow/` 4 ไฟล์) อยู่บน build branch `build/learning-loop-tuning` — merge เข้า main จัดการนอก workflow
