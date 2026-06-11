# Design (How) — ลดเวลาสร้างเอกสาร DESIGN ด้วย parallelization

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — lens: `.warnyin/workflow/roles/sa.md`

## 1. ภาพรวมสถาปัตยกรรม
- **component ที่เกี่ยวข้อง:** workflow payload (`src/.warnyin/workflow/stages/design.md`) + Claude adapter (`src/.claude/commands/warnyin/design.md`) — อิง `docs/techstack/installer/` (zero-dep, ESM, src↔dogfood 2-layer)
- **แนวทางหลัก:** เพิ่ม **guidance** ลง playbook กลาง (ไม่เพิ่ม script/mechanism) ภายใต้หลักการแกนเดียว → **"Parallelize gathering, serialize judgment/narrative"**
- **canonical edit = `src/` เท่านั้น** (root `.warnyin/`, `.claude/` เป็น dogfood gitignored — rule.md §6) → ทุก task แตะ path ใต้ `src/`

### หลักการแกน (unify ทั้ง 3 capability — เพิ่มเป็น 1 principle ใน playbook §3)
> **fan-out read-only sub-agent เพื่อ "เก็บข้อมูล / เขียนหน่วยที่ independent" ได้ — แต่ "การตัดสิน scope + เขียน narrative ที่ต้อง coherent" คงเป็น single-writer (main loop)**

- ✅ ขนานได้: grounding (อ่าน input หลายโดเมน), เขียน task files (แต่ละ task คนละโฟลเดอร์), research เก็บ fact ก่อนเขียน design
- ❌ ห้ามขนาน: การตัดสิน scope/ถาม user, การเขียน narrative ของ `proposal.md`/`design.md` (แตกให้หลาย agent → review+rewrite แพงกว่าเขียนรอบเดียว)
- **tool-agnostic:** ทุกจุด fan-out ต้องมี fallback "เครื่องที่ fan-out ไม่ได้ → ทำตามลำดับเหมือนเดิม"
- **unify-in-place:** หลักการนี้เข้าคู่/ขยายของเดิม — §3 ข้อ 7 (review panel fan-out), DAG-width toolkit (§3 ข้อ 2), line 79 (task fan-out optional) → ยกระดับเป็น default ในที่เดิม ไม่สร้างข้อใหม่ขนาน

## 2. Vertical slices
> หนึ่ง slice = หนึ่งหน่วยคุณค่า end-to-end (guidance ที่ทำงานได้จริง + fallback + cross-ref สอดคล้อง)

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | guidance parallelization ครบ 3 capability ใน playbook กลาง (grounding + task-fanout-default + narrative-guardrail) + หลักการแกน §3 + fallback ทุกจุด — DESIGN run เร็วขึ้นจริงเมื่อ AI อ่าน playbook | playbook (§3 หลักการ · §4 step 2/5/9 · §7 tier table) · self-consistency (cross-ref ในไฟล์) | `tasks/playbook-parallelization/` |
| 2 | adapter + CHANGELOG สะท้อนพฤติกรรมใหม่ — ผู้ใช้ที่อ่าน command/changelog เห็นว่า task fan-out เป็น default | adapter (`.claude` command) · CHANGELOG (user-facing migrate note) | `tasks/adapter-changelog-sync/` |

## 3. Behavior contract (canonical — task implement ตามนี้; decouple แบบ contract-first)

> ★ นี่คือ **contract** ที่ทั้ง 2 task อ้าง → ทำขนานได้โดยไม่ต้องรอ wording จริงของกันและกัน (รายละเอียด wording เป็นดุลพินิจ writer แต่ **พฤติกรรม** ต้องตรง contract นี้)

### C1 — Parallel grounding (playbook §4 step 2 "Ground")
- เพิ่ม guidance: การอ่าน input §2 หลายโดเมน **ทำขนานได้** — fan-out read-only sub-agent (เช่น Explore) แบ่งตามโดเมน: (ก) `project.md` + `rule.md` · (ข) `techstack/<comp>/{rule,standard,structure,test}.md` + `codemap` · (ค) โค้ดจริงที่ change แตะ · (ง) discovery/feature-spec (ถ้ามี) — แต่ละตัวคืน **summary สั้น + path/บรรทัดอ้างอิง**
- main loop **สังเคราะห์ผล + ถาม user จุดกำกวมเอง** (ไม่ delegate การตัดสิน scope ให้ sub-agent)
- **fallback:** เครื่องที่ fan-out ไม่ได้ → อ่านตามลำดับเหมือนเดิม
- ผูกหลักการแกน §3 (gathering = ขนานได้)

### C2 — Task-file fan-out เป็น default (playbook §4 step 9 + line 79 + §7 tier table)
- **standard/large tier:** หลังผ่าน **Gate §8** → fan-out **default** หนึ่ง read-only-capable agent ต่อหนึ่ง task เขียน 4 ไฟล์ (`spec/standard/rule/task`) **ขนาน** (เดิม line 79 = "ทำได้" optional → ยกเป็น default)
  - แต่ละ task อยู่คนละโฟลเดอร์ `tasks/<task>/` → **ไม่มี file conflict → ไม่ต้องใช้ worktree** (ต่างจาก BUILD ที่แก้ source ชนกัน); spawn Agent ขนานตรงๆ
  - หลัง fan-out: main loop **review coherence ข้าม task** (dependency/contract/naming สอดคล้อง) — single-writer ตรวจ ไม่ delegate
- **fast tier:** 1 task → ไม่ fan-out (เขียนเอง) — คงเดิม
- **Gate §8 ยังต้องผ่านก่อน fan-out เสมอ** (ไม่ลด — fan-out คือ "วิธีเขียนเร็วขึ้น" ไม่ใช่ข้าม Gate)
- **fallback:** เครื่องที่ fan-out ไม่ได้ → เขียน task ตามลำดับเหมือนเดิม
- §7 tier table: ระบุ "standard/large → task-file generation แบบ fan-out (default)" ในแถวที่อธิบาย ceremony

### C3 — Design narrative = research-fan-out + single-writer (playbook §4 step 5)
- ตอนเขียน `design.md`: ถ้าต้อง gather ข้อเท็จจริงจากหลายจุด (โค้ด/contract/impact analysis) → fan-out **research** sub-agent ขนาน (read-only) คืน fact
- **การเขียน narrative ทำโดย main loop คนเดียว (single writer, model tier `deepest`)** — **ห้ามแตก narrative ให้หลาย agent เขียนคนละ section** (coherence cost: เอกสารต่อไม่เนียน → review+rewrite แพงกว่าเขียนรอบเดียว)
- ผูกหลักการแกน §3 (narrative = serialize)
- **fallback:** เครื่องที่ fan-out ไม่ได้ → main loop อ่าน + เขียนเองตามลำดับ

### C-common — หลักการแกน (playbook §3, ข้อใหม่)
- เพิ่ม 1 principle: "Parallelize gathering, serialize judgment/narrative" (เนื้อหา §1 ของ design นี้) — กรอบรวม C1/C2/C3, ขยายของเดิม (§3 ข้อ 7 panel, ข้อ 2 DAG-width) ไม่สร้างกลไกใหม่ขนาน

## 4. Interface / contract
- ไม่มี API/runtime contract — เป็นเอกสาร guidance; "contract" ระหว่าง task = **behavior contract §3** (C1-C3 + C-common) ที่นิยาม canonical ที่นี่ แล้วแต่ละ task implement ตาม (สอด rule `canonical-copy convention`)

## 5. Flow
- **data-flow:** ผู้พัฒนา/AI รัน `/warnyin:design` → อ่าน playbook §3/§4 ที่อัปเดต → ทำ grounding/task-gen/narrative แบบ parallelized ตาม guidance + fallback
- **user-flow:** ไม่เปลี่ยน UX ของ command (ผู้ใช้สั่ง `/warnyin:design` เหมือนเดิม) — เปลี่ยนแค่ "ภายใน" stage ทำงานเร็วขึ้น

## 6. ผลกระทบต่อระบบเดิม
- **backward compatible:** fallback ทุกจุด → เครื่องเดิม/ไม่มี sub-agent ทำงานได้เท่าเดิม; fast tier ไม่กระทบ
- **จุดต้องระวัง:** wording ใหม่ใน §3/§4/§7 ต้อง **ไม่ขัด** ของเดิม (panel/dry-run fan-out §3 ข้อ 7-8, DAG-width §3 ข้อ 2, Gate §8) — ขยายในที่เดิม ไม่ duplicate; cross-ref (เลข step/anchor) ต้องตรงหลังแก้
- **tool-agnostic (rule.md §1):** guidance ห้ามผูกชื่อรุ่น — ใช้ vocab generic (`read-only sub-agent`, ไม่ใช่ชื่อ tool เฉพาะ harness); อ้าง `build-wave.mjs` ได้แบบ reference (pattern) ไม่ vendor

## 7. Dependency ระหว่าง slice/task

```
task-1 (playbook-parallelization)  ─┐
                                     ├─▶ (full-gate: lint-md + VERIFY semantic)
task-2 (adapter-changelog-sync)    ─┘
```

- **critical-path depth (longest chain):** 1 (ทั้งสอง task อยู่ wave เดียว)
- **max wave width:** 2 (T1 ‖ T2 ขนานได้)
- **เหตุผล decouple (contract-first, rule.md DAG-width toolkit ข้อ 1):** T2 (adapter/CHANGELOG) ปกติต้องรอ wording จริงของ T1 (playbook) แต่ **behavior contract §3 นิยาม canonical แล้ว** → T2 อ้าง contract (พฤติกรรม + อ้าง playbook ระดับ "§4" ไม่ผูกเลข step ตายตัว) ไม่ต้องรอ text จริงของ T1 → ขนานได้; integration (cross-ref/พิกัดตรงกัน) พิสูจน์ที่ **full-gate** (lint-md dead-link + VERIFY semantic accuracy)
- T1, T2 แตะ **คนละไฟล์** (T1: `stages/design.md` · T2: `commands/warnyin/design.md` + `CHANGELOG.md`) → ไม่มี merge conflict แม้รันขนาน

## 8. Test strategy ระดับ design
- change เป็น **guidance/docs** ไม่มี executable logic ใหม่ → ไม่มี unit test ใหม่ (สอด precedent `improve-performance` tasks `dag-width-toolkit`/`model-routing-docs` ที่ verify ด้วย semantic ไม่ใช่ unit)
- **gate ที่ใช้:**
  1. **structural:** `node .warnyin/workflow/scripts/validate-topic.mjs parallel-design-docs` ไม่มี ✖ (โครง topic ครบ)
  2. **dead-link:** `lint-md` (ถ้ามีใน repo) — ทุก cross-ref/anchor ใน playbook ที่แก้ resolve
  3. **semantic (VERIFY):** ตรวจโดย agent อิสระ (rule.md §5) — (ก) C1/C2/C3 ปรากฏใน playbook ตรง contract §3 · (ข) fallback ครบทุกจุด · (ค) tool-agnostic (ไม่มีชื่อรุ่น) · (ง) ไม่ขัด §3 ข้อ 2/7/8, §8 Gate เดิม · (จ) adapter/CHANGELOG ตรง playbook

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> เทียบ feature spec ปัจจุบันใน `docs/features/`

- **DESIGN stage orchestration (parallel grounding / task-fanout-default / narrative-guardrail)** → **ไม่มี feature spec formal** (ไม่มี `docs/features/design-orchestration/`) → **ไม่มี delta ต่อ `docs/features/`** — บันทึกพฤติกรรมใน design นี้ + `CHANGELOG.md`
  - (precedent เดียวกับ `improve-performance` §9: "DESIGN/BUILD orchestration → ไม่มี feature spec formal → ไม่มี delta"; SHIP อาจตั้ง feature `design-orchestration`/`build-orchestration` รวม — **defer**)
- `api-doc`, `change-sizing`, `context-profiles`, `spec-delta`, `topic-validator`, `utility-skills`, `global-install`, `build-orchestration` → **ไม่แตะ** → ไม่มี delta
- **สรุป: ไม่มี delta ต่อ `docs/features/`**

---

## 10. Design review
ข้าม review panel (user เลือก 2026-06-11) — เหตุผล: change เป็น guidance/docs ภายใน ไม่แตะ code/contract/security/infra, scope ชัด, มี precedent `improve-performance` รองรับ → panel ROI ต่ำ

## 11. Dry-run
ข้าม dry-run (user เลือก 2026-06-11) — เหตุผล: 2 task เป็น docs edit ตรงไป, behavior contract ชัดใน §3, scope เล็ก; semantic check ทำที่ VERIFY (agent อิสระ) แทน
