# Rule — build-wave-model-arg

## 1. Rule ที่ต้อง follow
- [ ] **zero-dependency** — `node:test` เท่านั้น, ไม่เพิ่ม devDeps
- [ ] **payload generic / tool-agnostic** — `build-wave.mjs` เป็น payload → **ห้าม hardcode/enumerate ชื่อรุ่น** (`model` = pass-through string เฉยๆ)
- [ ] **backward compat** — `tasks: string[]` เดิม + ไม่มี `model` ต้องทำงานเหมือนเดิมเป๊ะ (`baseRef` ก็ optional แบบนี้)
- [ ] **acceptance = pass count** ไม่ใช่แค่ exit 0 (`docs/rule.md` §5)
- [ ] **ESM + ภาษาไทย** + **ห้ามแตะไฟล์นอก scope §4**

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] — (ไม่มี; pattern conditional-optional-arg มีใน build-wave อยู่แล้วจาก baseRef)
