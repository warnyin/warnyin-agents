# Design (How) — model-tier-guidance

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> Lens: SA · payload `.md` ล้วน, unify-in-place กับ context-profile

## 1. ภาพรวมสถาปัตยกรรม
- **component:** workflow core payload (`src/.warnyin/workflow/contexts/`) — ไม่แตะ installer/test/stage
- **แนวทาง:** เสริม model-tier เป็น attribute ของ posture ใน "Tool preference" ที่มีอยู่ (unify-in-place); generic vocab tool-agnostic
- **invariant:** ไม่ผูกชื่อรุ่น · ไม่ duplicate (ชี้กลับ posture) · 3 context คงที่ · `.md` ล้วน (ไม่ enforce)

## 2. Vertical slice
> coupled — 3 context + README legend ต้องไปด้วยกัน (มี tier ใน context แต่ไม่มี legend = ความหมาย vocab ไม่ชัด) → 1 slice

| # | Slice | layer | → task |
|---|---|---|---|
| 1 | model-tier guidance ครบ — 3 context Tool preference + README legend/โครง | payload `.md` | `tasks/add-model-tier/` |

## 3. เนื้อหาที่จะเพิ่ม (exact)
**`contexts/research.md` → Tool preference (เพิ่มบรรทัด):**
```
- **Model tier:** `deepest reasoning` — สำรวจ/architecture/ตัดสินใจ trade-off = งานคิดหนัก คุ้มใช้ตัวลึกสุด
```
**`contexts/build.md` → Tool preference:**
```
- **Model tier:** `balanced` (orchestrator/main loop ที่ตัดสินใจ integrate); **fan-out worker** ที่ทำ task ชัด/เชิงกลไกตาม spec → ลดเป็น `cheap` ได้ (คุม cost — งานกำหนดไว้แล้ว)
```
**`contexts/review.md` → Tool preference:**
```
- **Model tier:** `balanced+` — skeptical จับ bug/regression/edge case = **ไม่ควรลด tier** (พลาดของจริงแพงกว่าค่า token)
```
**`contexts/README.md`:**
- §"โครงของ context card" item 3: `**Tool preference** — เครื่องมือที่ควรใช้/เลี่ยง + **Model tier** (generic: deepest/balanced/cheap)`
- เพิ่ม legend สั้น (อาจขยายตาราง context↔stage เป็น context↔stage↔tier หรือ note ใต้ตาราง):
```
### Model tier (generic — harness ตีเป็นรุ่นจริงเอง)
| Context | Tier | งาน |
|---|---|---|
| research | deepest reasoning | สำรวจ/ออกแบบ/ตัดสินใจ |
| build | balanced (worker→cheap) | implement ตาม spec |
| review | balanced+ | ตรวจ/จับ bug (ไม่ลด) |
> tool-agnostic: ไม่ผูกชื่อรุ่น (Claude/Opus/...) — แต่ละ harness map tier → รุ่นเอง (เทียบ `~/.claude/rules/performance.md`)
```

## 4. ผลกระทบต่อระบบเดิม
- backward: เพิ่มบรรทัด ไม่ลบ/แก้โครงเดิม; context card ยัง 4-section (Tool preference ขยายในตัว)
- ติดมากับ payload `--update`; ไม่กระทบ installer/test/verify-pack (contexts อยู่ใต้ `.warnyin/workflow` ที่ ship อยู่แล้ว)

## 5. Dependency
```
add-model-tier   (task เดียว — payload .md coupled slice)
```

## 6. Test strategy ระดับ design
- **structural:** 3 context มี "Model tier" ใน Tool preference (generic vocab); README มี legend + item 3 อัปเดต
- **tool-agnostic:** grep payload ไม่เจอชื่อรุ่น (Opus/Sonnet/Haiku/claude-) — เฉพาะ generic tier
- **ไม่ duplicate:** ไม่ copy checklist stage/role; ชี้กลับ posture
- **regression:** `npm test` + `verify:pack` + `lint:md` เขียว (dead-link 0 — README ตาราง/ลิงก์)
- **install proof:** `setup:sandbox` → target contexts มี Model tier line (ติดผ่าน CORE)
