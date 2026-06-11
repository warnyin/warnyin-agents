# Standard — discovery-playbook-modes

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน playbook ที่ task นี้ต้องยึด

## 1. Standard กลางที่ยึด (จาก techstack)
- `docs/techstack/installer/rule.md` §build orchestration: **payload workflow script ห้าม top-level `export`** — N/A ตรงๆ เพราะ debate เป็น **Agent tool call ใน playbook markdown** ไม่ใช่ `.mjs` script; แต่ยึดเจตนา: **ห้าม** เขียน debate เป็น Workflow script
- canonical single-source (pattern `change-sizing`/`triage.md`): taxonomy + behavior อยู่ playbook **เดียว** — ที่อื่นชี้มา ไม่ duplicate
- โครง playbook เดิม (`.warnyin/workflow/stages/discovery.md`): หัวข้อเลข section + callout `Context profile` + ภาษาไทย — **เพิ่ม section ใหม่แบบ additive ไม่รื้อโครงเดิม**

## 2. Pattern การเขียนโค้ดของ task นี้
- **mode = dial:** เขียน section "Discovery modes" เป็น layer เหนือ loop เดิม (operating principles §3 / process loop §4 อ้าง mode) — ไม่ copy flow ทั้งชุด 4 รอบ
- **debate = "Parallelize gathering, serialize judgment"** (`docs/features/build-orchestration/feature.md` บรรทัด 9 + `docs/rule.md §1`): fan-out persona เก็บมุม → main loop สังเคราะห์/ตัดสินเอง (judgment ไม่ delegate); ทุก fan-out มี fallback
- **fallback ทุกจุด fan-out** (เต็ม/partial/skeptic-หาย) — pattern เดียวกับ build-orchestration grounding (#6) ที่มี fallback เสมอ
- backward-compat: grill fold เป็น alias ไม่ทิ้ง keyword เดิม ("ซักถามฉันหน่อย"/"grill me")

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **persona role cards (มีอยู่แล้ว):** `.warnyin/workflow/roles/{ba,po,sa,security,tech-lead}.md` — debate เลือก persona จากนี้ + skeptic ไม่เขียน framework ใหม่
- **context profile:** `.warnyin/workflow/contexts/research.md` — ทั้ง 4 mode สวม research posture เดิม (mode อยู่ใต้ research ไม่แทนที่)
- **establish-tier/sizing pattern** (`change-sizing`): auto-suggest เลียน assess→recommend→ยืนยัน
- **anchor precedent:** `src/.claude/commands/warnyin/triage.md` — รูปแบบ canonical-ชี้ที่ Task B จะใช้

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- section anchor ต้องชื่อ **"Discovery modes (ความเข้มของ Discovery)"** เป๊ะ (contract `design.md §4.2` — Task B ชี้มาด้วยชื่อนี้) — ห้ามเปลี่ยนชื่อเอง
- ตารางเทียบ 3 แกน (mode/tier/context-profile) เป็น **ข้อบังคับ** ใน section (ปิดความเสี่ยง "ไว vs fast")
