# Standard — model-routing-docs

## 1. Standard กลางที่ยึด
- `docs/rule.md` §1: **canonical-copy** (copy §3C คำต่อคำ), **unify-in-place** (ขยาย model-tier เดิม), **tool-agnostic / payload-guidance generic** (ไม่ผูกชื่อรุ่นใน payload; adapter ผูกได้), **skill-adapter convention** (command = adapter ชี้ playbook)
- `docs/features/context-profiles/spec.md` = baseline ที่ต้องไม่ทำ regression

## 2. Pattern การเขียน
- ขยาย `contexts/README.md` §"Model tier" + `contexts/build.md` "worker → cheap" **ในที่เดิม** (เพิ่มแถว/หมายเหตุ ไม่สร้าง section ใหม่)
- command (adapter, `.claude/`) = ที่เดียวที่ map tier→ชื่อรุ่นจริงได้ (เช่น `cheap→haiku, balanced→sonnet, deepest→opus`) — payload (`.warnyin/`) คง generic

## 3. Shared / reuse
- model-tier table เดิม (README บรรทัด ~39) + worker tier (build.md บรรทัด ~21) = จุดขยาย
- template task.md meta table เดิม = จุดเพิ่ม field (ไม่ rewrite โครง)
- build-wave args (จาก `build-wave-model-arg`) = contract ที่ command ต้องตาม

## 4. เพิ่มเติมเฉพาะ task
- pointer convention (design §4): ที่อื่นที่อ้าง tier → ชี้ anchor `contexts/README.md §Model tier` ไม่ inline
