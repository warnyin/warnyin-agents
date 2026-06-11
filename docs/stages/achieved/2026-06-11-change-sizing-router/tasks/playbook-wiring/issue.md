# Issue — dry-run: playbook-wiring

> ผล dry-run · 2026-06-11 · verdict: **GO** — ไม่มี blocker

## Blocker
- ไม่มี — path `../triage.md#fast-track-skip-list` ถูกต้อง (stages/ → workflow/ depth 1); §7 ปัจจุบัน (บรรทัด ~106-109) self-contained reframe ได้ไม่พัง section อื่น; verify/ship มี §3 ให้แทรก hook แบบ unify; README tree (บรรทัด ~42-44) format ตรง

## Defer / by-design
| # | ประเด็น | สถานะ |
|---|---|---|
| D1 | anchor `#fast-track-skip-list` lint ไม่ validate (path-only) — match กับ heading T1 ต้องตรวจตา | track: VERIFY consistency / empirical (6) (design §8); T1 บังคับ heading อังกฤษแล้ว |
| D2 | cross-file link ไป triage.md ที่ T1 สร้าง — task-scope worktree ไม่มี → ห้ามรัน lint:md เต็มใน worktree (false-fail) | by-design (design §8 task-scope = own-file; full-gate รัน lint เต็ม) |

## ✅ Pass (dry-run ยืนยัน)
- §7 reframe unify-in-place ได้ (section เล็ก self-contained, line 16 pointer "ดูข้อ 7" รอด)
- verify.md §3 / ship.md §3 = จุดแทรก hook (api-doc.md pattern); correctness floor map กับ §3/§4/Gate เดิม
- README row format ตรง api-doc.md (บรรทัด 44)

## สรุป
ไม่มี blocker ค้าง — D1/D2 by-design (track ที่ VERIFY/full-gate)
