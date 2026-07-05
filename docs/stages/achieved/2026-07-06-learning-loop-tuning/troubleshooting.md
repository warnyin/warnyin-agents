# Troubleshooting — <ชื่อ change>

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ (ส่วนใหญ่ตอน BUILD) แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`
> เจอปัญหาใหม่ → อ่าน `docs/troubleshooting.md` ก่อนเสมอ เผื่อเคยแก้แล้ว

---

## วิธีบันทึก
บันทึกเฉพาะปัญหาที่ **ยากจะแก้** หรือ **เจอซ้ำ** (ไม่ใช่ทุก error เล็กน้อย) — หนึ่งปัญหา = หนึ่ง entry

---

### TS-1: build-wave sub-agent stall = false-negative (artifact commit แล้วแต่ workflow mark failed)
| | |
|---|---|
| **วันที่** | `2026-07-06` |
| **Component / Task** | `build-orchestration` / `tasks/loop-guidance` |
| **ความถี่** | เจอครั้งเดียว (BUILD wave 1) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ (มีค่าต่อทุก topic ที่ใช้ build-wave) |

- **อาการ / error message:**
  ```
  parallel[0] failed: agent stalled on all 6 attempts (no progress for 180000ms each)
  workflow result: skipped: ["loop-guidance", ...], failed: []
  ```
- **บริบทที่ทำให้เกิด (trigger):** task `loop-guidance` (balanced/sonnet, แตะ 3 ไฟล์ + cross-file pointer + self-verify/lint) fan-out ผ่าน `build-wave.mjs` — agent **commit งานเสร็จลง worktree branch แล้ว** แต่ไป stall ตอนช่วง self-verify/รายงานผล → workflow timeout mark เป็น failed/skipped ทั้งที่ artifact สมบูรณ์
- **สาเหตุที่แท้จริง (root cause):** workflow status สะท้อน "agent ตอบ structured result กลับมาทันไหม" ไม่ใช่ "worktree branch มี commit ที่ใช้ได้ไหม" — task ที่ยาว/หลายไฟล์เสี่ยง stall หลัง commit
- **วิธีแก้ที่ได้ผล (solution):** **ก่อนสรุปว่า task ล้ม → ตรวจ worktree branch จริงเสมอ** — `git worktree list` + `git diff --stat <build-branch> <worktree-branch> -- <scoped files>`; ถ้ามี commit ตรง spec/canonical → integrate ด้วย `git checkout <worktree-branch> -- <scoped src files>` แล้วพิสูจน์ด้วย full-gate (test/lint/pack) แทนการ re-run ซ้ำ (ประหยัดเวลา + ไม่เสียงานที่ทำถูกแล้ว)
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** workflow report `failed`/`skipped` ของ build-wave = **สัญญาณให้ไปตรวจ worktree ไม่ใช่ verdict สุดท้าย**; verify outcome จาก artifact จริง (git) ไม่ใช่จาก status string — สอด "รายงานผลตามจริง"
