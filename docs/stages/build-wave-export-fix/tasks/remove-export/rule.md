# Rule — remove-export

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow
- [ ] **payload workflow script ห้าม top-level `export` นอก `export const meta`** (`installer/rule.md` §build orchestration) — task นี้ทำให้ build-wave.mjs สอด rule นี้ (ปิดหนี้ที่ rule เตือนไว้)
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/` เท่านั้น ห้ามแตะ root `.warnyin/`
- [ ] **zero-dep / ESM** — ไม่เพิ่ม dependency, คง globals harness-injected
- [ ] **CHANGELOG** (`docs/rule.md` §2) — entry bugfix
- [ ] **config-protection** — ห้ามแก้ test/config เพื่อให้ผ่าน; test ต้องผ่านเพราะ behavior ถูกจริง (extraction-based ไม่ต้องแตะ test อยู่แล้ว)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] ไม่มี — rule export มีอยู่แล้ว; task นี้แค่ทำให้ codebase สอด rule (อาจเสนอ emergent: lint-gate ตรวจ `^export function` ใน workflow scripts อัตโนมัติ — พิจารณาตอน SHIP ถ้าคุ้ม)
