# Rule — release-hygiene

## 1. Rule ที่ต้อง follow

- [ ] **CHANGELOG ทุก user-facing change** (`docs/rule.md §2`) — installer behavior เปลี่ยน → ต้องมี entry
- [ ] **release-hygiene เป็น wave สุดท้าย** (`docs/rule.md §1` DAG-width) — ห้ามเขียน CHANGELOG ก่อนรู้ผล T1+T2 จริง
- [ ] **canonical-copy** — wording ของ IDE list ในเนื้อหา CLAUDE.md template ต้องตรงกับ IDE ที่ T1 ติดตั้งจริง (ห้ามแต่งใหม่)
- [ ] **`package.json files` allowlist** (`docs/rule.md §4`) — ถ้ามีไฟล์ใหม่ที่ต้อง publish ต้องเพิ่มใน `files` ด้วย (แต่ template ใน `src/.warnyin/` น่าจะครอบด้วย prefix เดิมอยู่แล้ว — ตรวจก่อน)

## 2. เสนอเพิ่ม rule ใหม่

(ไม่มีสำหรับ task นี้)
