# Rule — update-verify-pack

## 1. Rule ที่ต้อง follow

- [ ] **pack-verify เป็น gate + testable** (`docs/rule.md §4`) — `checkFiles` ต้องยัง pure + unit test พิสูจน์ทั้ง allowlist และ denylist
- [ ] **zero-dep lint-gate convention** (`docs/rule.md §2`) — ห้ามเพิ่ม devDeps; gate เขียนด้วย `node:*` ล้วน
- [ ] **investigate-before-edit** — อ่าน `verify-pack.mjs` ให้ครบก่อนแก้ `ALLOWED_PREFIX`
- [ ] **config-protection** (`docs/rule.md §1`) — ห้ามลด denylist หรือ lower gate เพื่อให้ผ่าน — แก้เฉพาะส่วนที่ต้องเพิ่ม allowlist จริง

## 2. เสนอเพิ่ม rule ใหม่

(ไม่มีสำหรับ task นี้)
