# Minimalism — เขียนน้อยที่สุดเท่าที่จำเป็น

> **Principle กลาง** — ใช้ตอน generate (BUILD) เป็น default · ใช้ตอน review (VERIFY) เป็น lens จับ over-engineering
> Surface อื่นๆ ชี้กลับที่นี่ด้วย pointer ไม่ copy hierarchy ซ้ำ

---

> **⚠ Guardrail — lazy not negligent**
> minimalism ≠ ขี้เกียจ — **ห้ามตัด:** validation ที่ trust-boundary, data-loss handling, security, accessibility, test/spec/acceptance
> สิ่งที่ตัดได้: abstraction กลาง, helper ที่ stdlib ทำได้, โครงสร้างที่ใหญ่เกินจำเป็น

---

## Decision hierarchy (6 ขั้น — เดินจากบนลงล่าง)

- [ ] 1. **ต้องมีจริงไหม?** → ถ้าไม่ → ข้าม (YAGNI)
- [ ] 2. **stdlib / built-in ทำได้?** → ใช้
- [ ] 3. **native platform / framework feature?** → ใช้
- [ ] 4. **dependency ที่ลงแล้วทำได้?** → ใช้ (ไม่เพิ่ม dep ใหม่ถ้าเลี่ยงได้)
- [ ] 5. **one-liner ได้?** → one-liner
- [ ] 6. **ค่อยเขียนเอง** — ขั้นต่ำที่ทำงานจริง ไม่แต่งโครงล่วงหน้า

---

## ใช้ในแต่ละ stage

- **BUILD (generate):** เดิน hierarchy ด้านบนเป็น default ก่อนเขียนโค้ดทุกบรรทัด
- **VERIFY (review lens):** ถามว่า "มี abstraction / โค้ดที่ตัดได้โดยไม่เสีย acceptance ไหม?" — ถ้ามี → เข้า fix loop

---

## ตัวอย่าง before / after

**สถานการณ์:** รวม elements ของ array ให้เป็น string คั่นด้วย comma

**Before (over-engineered):**
```
function joinItems(items, separator) {
  let result = "";
  for (let i = 0; i < items.length; i++) {
    result += items[i];
    if (i < items.length - 1) result += separator;
  }
  return result;
}
// ใช้งาน:
joinItems(["a", "b", "c"], ", ")
```

**After (stdlib ขั้น 2):**
```
["a", "b", "c"].join(", ")
```

เหลือ 1 บรรทัด — พฤติกรรมเหมือนเดิม, ไม่มี helper ใหม่, stdlib ทำแทนได้ทันที

---

## ขอบเขต (กัน over-cut)

- **ตัดได้:** helper ที่ stdlib ครอบคลุม · abstraction กลางที่ไม่มีผู้ใช้จริง · โครงสร้างที่คาดการณ์ล่วงหน้า (speculative)
- **ตัดไม่ได้:** test · spec · acceptance · validation ที่ trust-boundary · data-loss handling · security · accessibility
- minimalism เป็น **guidance** ไม่ใช่ hard gate — judgment อยู่ที่คนรีวิว/agent ไม่ใช่เครื่องมือตรวจอัตโนมัติ
