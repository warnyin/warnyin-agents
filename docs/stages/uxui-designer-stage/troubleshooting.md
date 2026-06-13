# Troubleshooting — UX/UI designer agent + wireframe ใน DESIGN stage

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ (ส่วนใหญ่ตอน BUILD) แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`

---

### TS-1: description grep-assert ล้มเพราะ negation phrase
| | |
|---|---|
| **วันที่** | `2026-06-13` |
| **Component / Task** | `installer` (payload) / `tasks/ux-role-and-agent` |
| **ความถี่** | เจอครั้งเดียว |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ (generalizable — กระทบทุก agent ที่มี negative grep-assert) |

- **อาการ:** test-flow ของ `warnyin-ux.md` มี assert "บรรทัด `description:` ต้องไม่มีคำว่า `reviewer`" (กัน panel หยิบ generator ไปเป็น reviewer ที่ 6) แต่ผู้เขียนใส่ description ว่า agent นี้ "ไม่ใช่ reviewer" → grep เจอคำ `reviewer` → assert FAIL ทั้งที่ intent ถูก
- **บริบทที่ทำให้เกิด (trigger):** เขียน description ที่อธิบายบทบาทด้วยวิธี **negation** ("ไม่ใช่ X") ในขณะที่ test เป็น negative-match ("ห้ามมี X เป็น substring")
- **สาเหตุที่แท้จริง (root cause):** negative grep-assert match **substring** ไม่เข้าใจ semantic — "ไม่ใช่ reviewer" ยังมี `reviewer` เป็น substring
- **วิธีแก้ที่ได้ผล (solution):** rephrase เป็น positive phrasing ที่สื่อ intent เดิมโดยไม่ใช้คำต้องห้าม — `"ผลิต artifact ไม่ใช่ให้ความเห็น"` (สื่อ generator≠reviewer โดยเลี่ยงคำ `reviewer`)
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** เมื่อเขียน field ที่ต้องผ่าน **negative grep-assert** ให้เลี่ยงคำต้องห้ามแม้อยู่ใน negation context — ใช้ synonym/positive phrasing แทน (เทียบ rule §5 "negative fixture ต้องเลี่ยง trigger phrase")

---

### TS-2: แทรก flat-numbered step (.5) ผิดตำแหน่งใน numbered list ที่ item มี sub-bullet
| | |
|---|---|
| **วันที่** | `2026-06-13` |
| **Component / Task** | `installer` (playbook) / `tasks/design-stage-integration` |
| **ความถี่** | เจอครั้งเดียว (ยาก — anchor precision) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ (generalizable — กระทบทุกการแก้ playbook/numbered-doc) |

- **อาการ:** แทรก `step 4.5` (UX wireframe) ที่ควรอยู่ **ระหว่าง step 4 (proposal) กับ step 5 (design.md)** แต่ครั้งแรกตกไปอยู่ **หลัง step 5**
- **บริบทที่ทำให้เกิด (trigger):** step 5 (design.md) มี sub-bullet หลายบรรทัด (gathering / single-writer / fallback) คั่นกลาง → anchor ที่หยิบมา Edit (ข้อความ "fallback...เหมือนเดิม") ตกอยู่ **ใต้** step 5 ไม่ใช่ก่อนหน้า
- **สาเหตุที่แท้จริง (root cause):** เลือก anchor เป็น "ข้อความกลาง item" ของ list ที่ item มีหลายบรรทัด → ตำแหน่ง insert คลาดเคลื่อน
- **วิธีแก้ที่ได้ผล (solution):** Edit สองครั้ง — ลบ block จากตำแหน่งผิด แล้ว insert ใหม่ด้วย **anchor คู่** = "บรรทัดสุดท้ายของ item ก่อนหน้า (step 4)" + "บรรทัดแรกของ item ถัดไป (step 5 header)" ที่ติดกันจริง; verify ด้วย `grep -n` เทียบ section boundaries
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** ก่อนแทรก inline-numbered step ใน numbered list ที่ item มี sub-bullet หลายบรรทัด — เลือก anchor เป็น **ขอบของ item (บรรทัดสุดท้าย item ก่อน + บรรทัดแรก item ถัดไป)** ไม่ใช่ข้อความกลาง item แล้ว verify ตำแหน่งด้วย grep line-number เทียบ section header เสมอ
