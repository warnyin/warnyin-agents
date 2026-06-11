# Business — Discovery modes

> ความรู้ถาวรระดับ feature · promote จาก topic `discovery-mode-selector` (Discovery 2026-06-11, ผ่าน gate)

## 1. เป้าหมายเชิงธุรกิจ (what & why)
- **what:** ให้ผู้ใช้คุม "ความเข้มของ Discovery" เองได้ — งานชัด/เล็กเดินเร็ว (`ไว`), งานเสี่ยง/กำกวมขุดลึก (`ละเอียด`) หรือ challenge ด้วย multi-agent (`โต้วาที`/`ไต่สวน`) ก่อนเข้า DESIGN
- **why:** Discovery เดิมมีความเข้มเดียว — งานชัดเสีย overhead, งานเสี่ยงไม่มีกลไก challenge หนักก่อนออกแบบ → เสี่ยง design ผิดราคาแพง
- **ผูก `docs/project.md`:** ต่อยอด philosophy "sizing-aware ceremony" (`change-sizing`) — workflow ปรับ ceremony ตามงานจริง; คง zero-config (ใช้ได้ทันทีหลังติดตั้ง)

## 2. Persona / ใครได้ประโยชน์
- **ผู้ใช้ปลายทาง** (ทีมที่ติดตั้ง workflow): เลือกความลึก Discovery ตามงาน — ไม่ต้องทน interview ยาวกับงานชัด, ได้ deep-challenge/audit กับงานเสี่ยง
- **maintainer** (พัฒนา v-next): mode = dial เดียวคุมพฤติกรรม Discovery ไม่ต้อง fork playbook
- **คุณค่า:** ceremony พอดีงาน — เร็วขึ้นเมื่อชัด, มั่นใจขึ้นเมื่อเสี่ยง

## 3. Success metric (วัดผลได้)
- 5 mode มีจริงใน playbook (canonical) · พฤติกรรมต่างกัน observable (proxy นับได้เทียบ baseline `สมดุล`)
- ไม่ระบุ mode → auto-suggest เสนอ mode + เหตุผล + user override ได้
- backward-compat: Discovery flow เดิม + "ซักถามฉันหน่อย" (grill→ละเอียด) ยังทำงาน · `npm test` ไม่มี assertion เดิมพัง
- multi-agent (โต้วาที/ไต่สวน) spawn จริง + สังเคราะห์เป็นข้อสรุป + มี fallback degrade

## 4. ขอบเขตเชิงธุรกิจ / ข้อจำกัด
- **in scope:** mode 5 ค่าใน Discovery (playbook canonical + command adapter) · auto-suggest + precedence · debate (fan-out ครั้งเดียว) · ไต่สวน (Blue/Red iterative + memory) · grill fold
- **out of scope:** mode ให้ stage อื่น · แตะ tier/context-profile catalog · auto-execute ข้ามการยืนยัน · ผูกชื่อรุ่น model ใน payload
- **ข้อจำกัด:** payload `.md` + 1 command — zero-dep, tool-agnostic; multi-agent ผ่าน Agent tool (ไม่ใช่ Workflow script); canonical ที่ playbook เดียว

## 5. ความเสี่ยง & การคุม
- **ความหมายชน 3 แกน (ไว vs fast)** → orthogonal design + 3-axis table ใน playbook
- **catalog creep** → opinionated 5 mode (closed) ไม่ไหลเป็น catalog
- **token multi-agent บานปลาย** → hard cap (โต้วาที ≤4 persona/≤2 รอบ; ไต่สวน ≤5 role/รอบ + ถาม user ก่อนรอบใหม่) + fallback degrade
- **ไต่สวน หนัก user-in-loop** → explicit-only (auto-suggest ไม่แนะเอง)
