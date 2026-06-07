# Troubleshooting — feature-spec-delta

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ (ส่วนใหญ่ตอน BUILD) แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`
> เจอปัญหาใหม่ → อ่าน `docs/troubleshooting.md` ก่อนเสมอ เผื่อเคยแก้แล้ว

---

## วิธีบันทึก
บันทึกเฉพาะปัญหาที่ **ยากจะแก้** หรือ **เจอซ้ำ** (ไม่ใช่ทุก error เล็กน้อย) — หนึ่งปัญหา = หนึ่ง entry

---

### TS-1: Build agent ใน worktree แก้ไฟล์ topic working dir (gitignored/untracked) ไม่ได้ด้วย Edit tool

| | |
|---|---|
| **วันที่** | `2026-06-07` |
| **Component / Task** | workflow build-wave / `tasks/dogfood-specs` + `tasks/stage-wiring` (เจอทั้งคู่) |
| **ความถี่** | เจอซ้ำ 2 ครั้งใน wave เดียว (ทุก task ที่ต้องอัปเดต `task.md` จาก worktree) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ / error message:**
  ```
  Edit tool: This agent is isolated in the worktree ... Edit the worktree copy instead
  (แต่ไฟล์ docs/stages/<slug>/tasks/<task>/task.md ไม่มีอยู่ใน worktree)
  ```
- **บริบทที่ทำให้เกิด (trigger):** build agent รันใน git worktree ที่ branch จาก `main` — โฟลเดอร์ topic (`docs/stages/<slug>/`) commit อยู่บน build branch (หรือยัง untracked) จึงไม่ปรากฏใน worktree; agent ต้องอัปเดตสถานะ `task.md` ของตัวเองแต่ Edit tool บังคับแก้เฉพาะ path ใน worktree
- **สาเหตุที่แท้จริง (root cause):** worktree เห็นเฉพาะไฟล์ที่ track ใน branch ที่ checkout — topic working dir อยู่คนละ branch/ยังไม่ track; Edit tool ของ harness ตรวจ path แล้ว block การแก้นอก worktree
- **วิธีแก้ที่ได้ผล (solution):** แยกหน้าที่ — (1) ไฟล์ output จริงที่ git-tracked → แก้+commit ใน worktree ตามปกติ; (2) สถานะ/บันทึกใน topic working dir → ให้ **main loop อัปเดตตอน integrate** (ทางที่สะอาดสุด) หรือ agent เขียนผ่าน node script ทาง Bash ที่ absolute path ของ main checkout
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** main loop ควร (1) commit topic docs ลง build branch ก่อน fan-out และ (2) ให้ build-wave สร้าง worktree จาก **build branch** ไม่ใช่ main — agent จะเห็น task ของตัวเองครบ; ถ้า agent รายงานว่าแก้ task.md ไม่ได้ ให้ main loop อัปเดตแทนตอน merge (ห้ามถือว่า task ล้ม)

---
