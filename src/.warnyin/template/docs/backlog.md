# Backlog (กลาง)

> คลังงาน **deferred-out** ของทั้งโปรเจกต์ — งานที่ยกออกจาก scope แล้ว (ทำทีหลัง / อาจไม่ทำ / รอเงื่อนไข) — สะสมจากทุก topic
> = **current state** ของงานที่รออยู่ (archive `docs/stages/achieved/` ไม่นับ — default-exclude)
> ป้อนเข้ามาตอน **SHIP**: ยก entry ที่ `open` จาก `docs/stages/<topic>/backlog.md` (หลัง archive) มารวมที่นี่ — กลั่นไม่ copy ดิบ (รวมของซ้ำ, skip ที่ `promoted`)
> นิยามเต็ม (semantic / governance / schema / promote) ดู `.warnyin/workflow/backlog.md`

---

## วิธีค้น
ค้นด้วยคำในรายการ, ที่มา (topic/stage), หรือประเภท — entry เรียงตามประเภทแล้วตามความใหม่
ทุกการ **หยิบ** item เข้า scope ใหม่ = **เสนอ → user ตัดสิน** (recommend-not-auto)

---

## รายการ
ประเภท ∈ {`ทำทีหลัง`, `อาจไม่ทำ`, `รอเงื่อนไข`} · สถานะ ∈ {`open`, `promoted`, `dropped`}

<!-- ยังไม่มี entry — เพิ่มตอน SHIP จาก topic backlog.md (entry open) -->

| # | รายการ (what) | ที่มา (stage + ไฟล์/อ้างอิง) | ประเภท + เหตุผล | สถานะ | มาจาก topic |
|---|---|---|---|---|---|
<!-- | 1 | ข้อความสั้นว่าจะทำอะไร | `Design · proposal §4 Out-of-scope` | `ทำทีหลัง` + เหตุผล 1 บรรทัด | `open` | `<slug>` | -->

---

## รูปแบบ entry (ใช้ตอน promote จาก SHIP)
- หนึ่งงาน = หนึ่งแถวในตาราง (5-field + `มาจาก topic`)
- เติมคอลัมน์ `มาจาก topic` = slug ที่งานนั้นมา (provenance)
- entry ซ้ำข้าม topic → กลั่นรวมเป็นแถวเดียว (ระบุหลาย topic ที่ `มาจาก topic` ได้)
- entry ที่ `promoted` แล้วใน per-topic → skip (idempotent ไม่เพิ่มซ้ำ)
