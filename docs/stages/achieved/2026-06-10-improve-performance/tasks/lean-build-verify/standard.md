# Standard — lean-build-verify

## 1. Standard กลางที่ยึด
- `docs/rule.md` §1: **unify-in-place**, **canonical-copy**, **กระทัดรัด opinionated**, **config-protection** (full-gate ห้ามลด bar)
- สไตล์ playbook: §-numbered, callout `>`, ภาษาไทย

## 2. Pattern การเขียน
- ขยาย build.md §3 **ข้อ 4 เดิม** ในที่เดิม (ของเก่า "self-verify → test/lint" กลายเป็น subset ที่ระบุ scope ชัด)
- ไม่เพิ่มข้อใหม่ใน §3 — แก้ wording ข้อ 4 + ย้ำข้อ 8

## 3. Shared / reuse
- build.md §3 ข้อ 8 + §4 ข้อ 6 (full-gate) = mechanism เดิม **อ้างถึง ไม่แก้** (แค่ย้ำว่าคง blocking)
- developer.md checklist เดิม = จุดเพิ่มข้อ (ไม่ rewrite)

## 4. เพิ่มเติมเฉพาะ task
- ★ ห้ามแตะ command — verify wording อยู่ build.md เท่านั้น (command เป็นของ model-routing-docs)
