# Troubleshooting — validator-status

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ (ส่วนใหญ่ตอน BUILD) แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`
> เจอปัญหาใหม่ → อ่าน `docs/troubleshooting.md` ก่อนเสมอ เผื่อเคยแก้แล้ว

---

## วิธีบันทึก
บันทึกเฉพาะปัญหาที่ **ยากจะแก้** หรือ **เจอซ้ำ** (ไม่ใช่ทุก error เล็กน้อย) — หนึ่งปัญหา = หนึ่ง entry

---

### TS-1: negative test fixture ของ heuristic บังเอิญ match keyword ที่ตัวเองทดสอบ

| | |
|---|---|
| **วันที่** | `2026-06-08` |
| **Component / Task** | workflow validator / `tasks/validator-script` |
| **ความถี่** | เจอครั้งเดียว (subtle — debug ยาก) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ / error message:**
  ```
  unit C4 (design เริ่มเติมแต่ไม่มี Spec delta → ⚠) fail: actual=false (ไม่มี ⚠ C4 ออกมา)
  ```
- **บริบทที่ทำให้เกิด (trigger):** เขียน negative test สำหรับ C4 — fixture design content ใช้ข้อความ "เนื้อหา design ไม่มี delta section" เพื่อสื่อว่า "ไม่มี Spec delta"
- **สาเหตุที่แท้จริง (root cause):** `checkSpecDelta` ข้ามเช็คเมื่อ `/ไม่มี delta/.test(design)` (เคสผู้เขียนระบุ "ไม่มี delta" โดยตั้งใจ = ถูกต้องตามกติกา) — fixture text มี substring "ไม่มี delta" บังเอิญ → validator ตีความว่า topic ระบุ "ไม่มี delta" แล้ว → ข้าม C4 → ไม่มี ⚠ ออกมา. **โค้ด validator ถูกต้อง — test data ผิด**
- **วิธีแก้ที่ได้ผล (solution):** แก้ fixture เป็น "เนื้อหา design ทั่วไป ไม่มี section นั้น" ที่ไม่มี trigger phrase
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** เขียน negative fixture ของ heuristic ที่ match keyword (`Spec delta`/`ไม่มี delta`/`GIVEN` ฯลฯ) ต้อง **เลี่ยง keyword นั้นในข้อความ filler ทุกตัว** — ใช้คำ orthogonal ชัดเจน ไม่ทับ trigger phrase; ถ้า test แดงทั้งที่โค้ดดูถูก ให้สงสัย fixture ก่อน

---

### TS-2: worktree build agent fork จาก main (ไม่มี topic/dependency) — instance ของ KB#14

| | |
|---|---|
| **วันที่** | `2026-06-08` |
| **Component / Task** | workflow build-wave / `tasks/playbook-wiring` (wave 2) |
| **ความถี่** | ต่อเนื่องจาก KB กลาง #14 (เจอซ้ำใน topic นี้ที่ wave 2) |
| **ยกขึ้น KB กลางตอน SHIP?** | ❌ (เป็น instance ของ #14 — E1 rule ครอบแล้ว ไม่ต้อง promote ซ้ำ) |

- **อาการ:** worktree ของ wave 2 fork จาก main (release 0.8.5) ไม่มี topic `validator-status` + ไม่มี script `validate-topic.mjs` (output ของ wave 1) — dependency หาย
- **Root cause:** build-wave สร้าง worktree จาก main ไม่ใช่ build branch (ตาม learned-rule E1 ที่ควรแก้ที่ `build-wave.mjs` — ยัง track)
- **วิธีแก้:** agent `git merge build/validator-status` เข้า worktree เองก่อน wire (สะอาด ไม่ conflict) → dependency ครบ; main loop checkout เฉพาะไฟล์ wiring (7 ไฟล์) เลี่ยง topic-docs copy
- **ป้องกันซ้ำ:** `docs/rule.md` §1 build-orchestration (E1) ครอบแล้ว — improvement ที่ build-wave.mjs ยัง track ใน roadmap
