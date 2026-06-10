# Design (How) — เร่งความเร็ว BUILD stage (improve-performance)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end
> ★ ไฟล์นี้เป็น **canonical source** (rule `canonical-copy`): นิยาม §3 ถูก **copy ไปไฟล์ playbook จริง** โดยแต่ละ slice — ห้ามแต่งใหม่ต่อไฟล์
> _ปรับปรุงตาม review panel 3 role (SA/Tech Lead/QA) — ดู §10 Design review_

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` (playbook กลาง = `.md` + `build-wave.mjs`) — แก้ที่ `src/.warnyin/workflow/` แล้ว sync ลง root dogfood
- **แนวทางหลัก:** ปรับ playbook 2 ชั้น **โดย unify-in-place** (ขยาย mechanism เดิม ไม่สร้างขนาน):
  - **โครงสร้าง (DESIGN):** "toolkit ลด serialization" + "critical-path gate" + "task/context lean" → ขยาย `design.md` §3/§7/Gate, `tech-lead.md` checklist, template
  - **กลไก (BUILD):** model routing per task (ขยาย model-tier เดิมใน `contexts/`), ลด self-verify ซ้ำ (ขยาย `build.md` + `developer.md`)
- **dogfood:** งานนี้เองแตกเป็น task ที่ **ขนานได้** (file-ownership ไม่ทับ + อ่าน canonical จาก design นี้) = พิสูจน์ toolkit ด้วยตัวเอง

## 2. Vertical slices
> หนึ่ง slice = หนึ่งหน่วยคุณค่า end-to-end → 1 task · จัดแบบ **file-ownership** (ไม่มี task ใดแตะไฟล์เดียวกันใน wave เดียวกัน → parallel ปลอด conflict)

| # | Task (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer | ไฟล์ที่เป็นเจ้าของ (disjoint) | wave |
|---|---|---|---|---|
| 1 | **dag-width-toolkit** — DESIGN แตก DAG กว้าง + critical-path gate + task-lean | playbook(design) · role · template · gate | `src/.warnyin/workflow/stages/design.md`, `roles/tech-lead.md`, `template/stages/[topic]/design.md` | 1 |
| 2 | **build-wave-model-arg** — build-wave.mjs รับ+ส่ง `model` per task (pass-through) + unit test | script · test | `src/.warnyin/workflow/scripts/build-wave.mjs` (+ test ใน `src/tests/`) | 1 |
| 3 | **lean-build-verify** — agent verify scope ตัวเอง ไม่ซ้ำ full-gate | playbook(build) · role | `src/.warnyin/workflow/stages/build.md`, `roles/developer.md` | 1 |
| 4 | **model-routing-docs** — เขียน routing guidance + ผูก orchestrator→build-wave | context · template · command | `contexts/README.md`, `contexts/build.md`, `template/stages/[topic]/tasks/[task-name]/task.md`, `.claude/commands/warnyin/build.md` + `design.md` | 2 |

> **file-ownership disjoint (ตรวจซ้ำ panel TL-B1):** design.md→T1 · build-wave.mjs→T2 · build.md→T3 · contexts/template-task/command→T4 · tech-lead→T1 · developer→T3. **command เป็นของ T4 เดียว — T3 ห้ามแตะ command** (เขียนใน T3 task.md §4)
> **ทำไม T4 แยก wave 2:** chain แท้ code→doc — doc (contexts/task.md/command) ต้องอ้าง **arg shape จริง** ที่ T2 สร้าง (§3C) → decouple ไม่ได้ → ยอม serialize (toolkit 3A ข้อ 3) — depth=2 แต่ wave 1 ขนาน 3 task ผ่าน success criteria "≥1 wave ขนาน>1"

## 3. Canonical definitions (★ slice copy จากที่นี่)

### 3A. DAG-width toolkit (3 เทคนิคลด serialization) → ใส่ `design.md` §3 + `tech-lead.md`
> **คงนิยาม vertical slice เดิม** (slice ตัดทุก layer end-to-end) — toolkit เป็น **เทคนิคเสริม optional** เลือกตามเคส ไม่ใช่ข้อบังคับ
1. **Contract-first decouple** — เมื่อ task B ต้องการแค่ **interface/contract** ของ A (ไม่ใช่ runtime จริง) → ให้ B พึ่ง **contract artifact** (type/schema/openapi/ไฟล์กลางที่ตกลงใน design) แทน → A‖B ขนาน; integration พิสูจน์ที่ **full-gate** (`build.md` §3 ข้อ 8). _slice ยัง end-to-end — แค่ stub ฝั่ง dependency ชั่วคราว_
2. **Re-slice ต่างแกน** — ถ้าแตกตาม component-layer แล้วได้ chain → ลองแตกตาม **feature/capability ที่ independent** แทน
3. **ยอม serialize เฉพาะ chain แท้** — dependency ที่เลี่ยงไม่ได้ (foundation ต้องก่อน / doc ต้องอ้าง code) → ยอมรับ แล้วโฟกัส **ลดเวลา node บน critical path** (model tier + task-lean)

### 3B. Critical-path gate → ใส่ playbook `design.md` (Gate §8 + §4 step 7 + §3 ข้อ 3) + template `design.md` §7 + `tech-lead.md`
> ★ anchor (จาก dry-run): playbook `stages/design.md` **ไม่มี §7 dependency** (§7 = "ปรับความละเอียดตามขนาด change") — critical-path gate ฝั่ง **playbook** ลงที่ **Gate §8** (เพิ่ม checklist item) + **§4 step 7** (แตก tasks — เพิ่มขั้นวาด DAG/วัด depth) + **§3 ข้อ 3** (dependency principle); ส่วน **ฟอร์มวาด DAG + ช่อง depth/wave-width** อยู่ใน **template `design.md` §7** (Dependency)
- DESIGN ต้อง **วาด DAG + ระบุ: critical-path depth (longest chain), max wave width, เหตุผลถ้า task ใดถูก serialize**
- **gate item (ขยาย Gate §8 เดิม):** ถ้า DAG เป็น chain เส้นตรง (ทุก wave มี 1 task) → ต้องมี **เหตุผล explicit** ว่าทำไม decouple ด้วย toolkit 3A ไม่ได้ (กัน chain เผลอ)
- เป็น **judgment gate** (AI/reviewer ตีความ) — ไม่ใช่ mechanical check ของ `validate-topic.mjs` (panel TL-S3)
- unify: ขยาย tech-lead checklist เดิม "task ใน wave เดียวกัน parallel ได้จริง" → เพิ่ม "และ DAG ไม่ลึกเกินจำเป็น (ลอง 3A ก่อนยอม serialize)"

### 3C. Model routing per task (generic) → ใส่ `build-wave.mjs`(T2) + `contexts/`+`task.md`+`command`(T4)
> ขยาย model-tier เดิม (`contexts/README.md` §Model tier บรรทัด ~39; `contexts/build.md` บรรทัด ~21 "worker → cheap") จาก "per-context" → **เพิ่ม** "per-task ใน BUILD" (additive — ไม่แทนที่ของเดิม); **vocab generic** (`cheap`/`balanced`/`deepest`) ตาม rule payload-guidance; **guidance ไม่ enforce**

**Contract — args shape ของ build-wave (★ lock ตาม panel SA-B2/TL-S1):**
- `tasks` เปลี่ยนจาก `string[]` → รับได้ทั้ง **`string[]` (เดิม, backward compat)** และ **`Array<{name: string, model?: string}>`** — normalize ภายใน: ถ้า element เป็น string → `{name, model: undefined}`
- `agent()` call: ถ้า task มี `model` → `agent(prompt, { ...opts, model })`; ไม่มี → opts **ไม่มี key `model`** (ไม่ใช่ `model: undefined` — panel QA-S2)
- **`model` เป็น pass-through string** — build-wave.mjs **ไม่ map/ไม่ hardcode ชื่อรุ่น** (payload generic-safe; ส่ง string ที่ได้รับตรงเข้า `agent()`)
- **ใคร map tier→ชื่อรุ่นจริง (panel SA-B2/TL-S1):** **orchestrator ใน `.claude/commands/warnyin/build.md`** (Claude adapter — ผูกชื่อรุ่นได้ตาม skill-adapter convention) อ่าน `Model tier` generic จาก `task.md` → map เป็นชื่อรุ่นจริงของ harness → ใส่ใน element `{name, model}` ส่งเข้า build-wave; harness อื่น map เอง

**task.md field + mapping (guidance):**
- `task.md` เพิ่ม field **`Model tier`** (optional; ไม่ระบุ = `balanced` ตาม context build เดิม)
- mapping: mechanical/scaffold/config → `cheap` · implement ตาม spec ปกติ → `balanced` · logic หนัก/security/algorithm/ไม่เคยทำ → `deepest`
- subset `{cheap, balanced, deepest}` — **ไม่แตะ `balanced+`** (tier ของ review context — คนละมิติ; panel QA-B2)

### 3D. Lean BUILD verify-scope → ใส่ `build.md`(T3) + `developer.md`
- **task self-verify = scope ตัวเองเท่านั้น** — unit + lint + test-flow ใน `spec.md` ของ **component นั้น**; **ไม่รัน full cross-component build/integration/e2e ต่อ task**
- cross-component/integration = **full-gate หลัง merge ทุก wave** (`build.md` §3 ข้อ 8 + §4 ข้อ 6 เดิม — รับอยู่แล้ว ไม่เพิ่มกลไก) → **คงเป็น blocking gate จริง** (กัน bar ลดเงียบ; panel QA-S4)
- unify: ขยาย `build.md` §3 **ข้อ 4** เดิม ("self-verify → test-flow + build/lint") ให้ชัดว่า **build/lint = scope component ตัวเอง** ไม่ใช่ทั้ง repo

### 3E. Task/context lean → ใส่ `tech-lead.md` + `template/design.md`
- task brief + spec **กระชับพอ agent ทำจบ ไม่ฟุ่มเฟือย** → ลด context token ต่อ agent
- unify: ขยาย tech-lead checklist เดิม "spec ครบในตัว" → เพิ่ม "+ กระชับ; brief ยาวผิดปกติ → recheck dependency/re-slice"

## 4. Interface / contract (ระหว่าง task)
- **canonical = ไฟล์ design นี้** — ทุก task อ่าน §3 เป็น input ก่อนลงมือ (มีก่อน BUILD → wave 1 ไม่ depend output กัน)
- **T4 depends T2** — model-routing-docs ต้องอ้าง arg shape จริง (§3C) ที่ build-wave-model-arg สร้าง → wave 2
- **cross-reference เป็น pointer บาง (panel SA-S2/TL-S4):** task 1 (design.md reviewer fan-out) + task 3 (build.md fix-delegate) ที่อยากอ้าง model tier → เขียน **pointer ชี้ anchor ที่มีอยู่แล้ว** `contexts/README.md` §"Model tier" (บรรทัด ~39 ปัจจุบัน) — **เขียน pointer เท่านั้น ห้าม inline/copy นิยาม tier** (กัน dependency แอบแฝงกลับ) → T1/T3 ไม่ depend T2/T4
- **canonical-copy:** wording §3C ที่กระจาย (contexts/task.md/command) = copy จาก §3C คำต่อคำ ห้ามแต่งใหม่

## 5. Flow
- **DESIGN flow ใหม่:** แตก task → วาด DAG → **เช็ค critical-path (3B)**: ลึก → ลอง 3A → ระบุเหตุผลถ้ายอม serialize → ระบุ model tier (3C) ต่อ task
- **BUILD flow ใหม่:** orchestrator อ่าน tier จาก task.md → map tier→รุ่นจริง → ส่ง `{name, model}` เข้า build-wave ต่อ wave → agent self-verify scope ตัวเอง (3D) → full-gate รวม

## 6. ผลกระทบต่อระบบเดิม
- **backward compat:** `tasks: string[]` เดิมยังรับได้ (normalize); model ไม่ระบุ = opts ไม่มี key model = พฤติกรรมเดิม; critical-path gate = ขยาย gate เดิม; verify-scope = implicit→explicit
- **จุดระวัง:** ไฟล์แกน workflow → full test suite (`node --test`) + `validate-topic.mjs` + empirical proof ต้องเขียวก่อนปิด; sync `src/`→root ครบ
- **Spec delta regression boundary:** ต้องยืนยัน Scenario เดิมทั้งหมดของ `context-profiles` ยัง pass (รวม `balanced+` ของ review — ไม่ถูกแตะ; panel QA-B2)

## 7. Dependency ระหว่าง task (dogfood: DAG กว้าง)
```
        [canonical = design.md §3 — มีก่อน BUILD]
                       │ (ทุก task อ่านเป็น input)
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  dag-width-      build-wave-     lean-build-     ◀── wave 1: ขนาน 3 task (file-ownership disjoint)
   toolkit        model-arg        verify
        │              │ (arg shape contract §3C)
        │              ▼
        │         model-routing-docs              ◀── wave 2: depends build-wave-model-arg (chain แท้ code→doc)
        └──────────────┴──────────────┐
                       ▼
            full-gate (sync root + full test + empirical proof scaffold-foundation)
```
- **critical-path depth = 2** (wave 1 ขนาน 3 · wave 2 = 1 task) — เทียบ baseline เคส scaffold ที่ depth = 4 (chain เส้นตรง)
- เหตุผลขนานได้ wave 1: file-ownership disjoint + canonical ใน design (contract-first ระดับ topic) — พิสูจน์ toolkit 3A ด้วยงานตัวเอง; T4 ยอม serialize ตาม 3A ข้อ 3 (chain แท้)

## 8. Test strategy ระดับ design
- **task-scope (แต่ละ task):** ไฟล์ที่แตะ lint ผ่าน; **T2 (build-wave.mjs) → unit test** ตาม pattern `docs/techstack/installer/test.md` (สกัดฟังก์ชัน normalize/prompt → inject globals → assert) ครอบ: (ก) `tasks` เป็น `string[]` → normalize ได้, (ข) task มี `model` → opts มี key `model`, (ค) **backward-compat: ไม่มี model → opts ไม่มี key `model`** (panel QA-S1/S2)
- **full-gate (blocking):** `node --test` ทั้ง suite เขียว + `validate-topic.mjs improve-performance` ไม่มี ✖ + Scenario เดิมของ `context-profiles` ยัง pass + `src/`↔root sync ครบ
- **empirical proof = structural/observable (panel QA-B1)** — gate ที่ตัดสิน pass/fail: redesign DAG ของ `scaffold-foundation` ด้วย toolkit ใหม่ → **DAG ใหม่มี ≥1 wave ที่มี task >1** (เทียบ DAG เดิม chain depth 4) + `validate-topic.mjs` ผ่าน; **wall-clock = informational note เท่านั้น ไม่ใช่ gate** (non-deterministic)
- **empirical isolation (panel QA-S3):** redesign เขียนเป็น **copy/sandbox** ไม่ทับ `example/docs/stages/scaffold-foundation` เดิม; ไม่รัน cli.mjs ที่ cwd=repo root (กัน dogfood leak ตาม test.md)

## 9. Spec delta
> เทียบ `docs/features/<name>/spec.md` ปัจจุบัน
- **`context-profiles`** → **ADDED (additive — ไม่แทนที่ของเดิม; panel SA-B1/QA-B2):**
  - เพิ่ม **Requirement ใหม่:** "Model tier route per task ใน BUILD" — pin behavior: `task.md` มี field `Model tier` (generic vocab); `build-wave.mjs` รับ `model` per task แล้วส่งเข้า `agent()` (pass-through); orchestrator map tier→รุ่นจริง
  - **Scenario observable:** task.md มี `Model tier` → build-wave ส่ง `model`; task ไม่มี → opts ไม่มี key `model`
  - **ไม่แตะ** Requirement เดิม (per-context tier, vocab generic, `balanced+` ของ review) — ของเดิมยังจริงทุกข้อ
- **DESIGN/BUILD orchestration** (toolkit, critical-path gate, verify-scope, task-lean) → **ไม่มี feature spec formal** → ไม่มี delta ต่อ `docs/features/`; บันทึกใน design นี้ + `CHANGELOG.md` (SHIP อาจตั้ง feature `build-orchestration` — defer)
- `spec-delta`, `topic-validator`, `utility-skills` → ไม่แตะ → ไม่มี delta

---

## 10. Design review
**Panel:** SA + Tech Lead + QA (fan-out ขนาน read-only, 2026-06-10)

**Blocker → แก้ครบ:**
| # | จาก | blocker | แก้ |
|---|---|---|---|
| 1 | SA-B2, TL-S1 | build-wave args contract ขาด + ใคร map tier→รุ่น | §3C lock args shape (`string[]`\|`{name,model}[]`) + pass-through + orchestrator map (Claude adapter) |
| 2 | TL-B2 | S2 หนักเกิน (5 ไฟล์ 2 ชนิด verify) | แตก T2 (build-wave-model-arg, code) / T4 (model-routing-docs) → DAG depth 2 (§2/§7) |
| 3 | TL-B1 | command/build.md ชน S2/S3 | lock command = T4 เดียว; T3 ห้ามแตะ command (§2 note + จะใส่ใน T3 task.md §4) |
| 4 | SA-B1, QA-B2 | Spec delta กำกวม (modify vs add) + เสี่ยง `balanced+` | §9 เป็น ADDED additive ชัด, subset `{cheap,balanced,deepest}`, ไม่แตะ balanced+, ยืนยัน Scenario เดิม pass (§6/§8) |
| 5 | QA-B1 | empirical wall-clock วัดไม่ได้ | §8 empirical = structural/observable (≥1 wave ขนาน) เป็น gate; wall-clock = informational |
| 6 | SA-S3 | พิกัดอ้างอิงผิด (§3.4/§3.8/§4.6) | แก้เป็น `build.md` §3 ข้อ 4 / ข้อ 8 / §4 ข้อ 6 ทั่วไฟล์ |

**Suggestion → รับ:** SA-S1 (ขยาย contexts/build.md:21 เดิม), SA-S2/TL-S4 (pointer ชี้ anchor เดิม, ห้าม inline), QA-S1 (verify = mechanism arg-passing), QA-S3 (empirical isolation), QA-S4 (full-gate คง blocking) — สะท้อนใน §3C/§4/§8 แล้ว

**ไม่มี blocker ค้าง — พร้อมแตก task**

## 11. Dry-run (4 task ขนาน read-only, 2026-06-10)
ทุก task verdict **GO — ไม่มี hard blocker** · ผลเต็มใน `tasks/<task>/issue.md`

| task | verdict | ประเด็นเด่น → แก้ |
|---|---|---|
| dag-width-toolkit | พร้อม build | **§7 anchor กำกวม** (playbook §7 ≠ dependency) → ✅ แก้ §3B + task ชี้ Gate §8 + §4 step 7 + §3 ข้อ 3 |
| build-wave-model-arg | GO + mandatory refactor | **test ห้าม import ตรง** (KB#16) + สกัด pure helper + ห้าม skip → ✅ เพิ่ม standard.md §2 |
| lean-build-verify | GO | ownership conflict (command) หลีกเลี่ยงได้จริง — command ไม่มี self-verify wording |
| model-routing-docs | GO | depends build-wave-model-arg (chain ถูก); guard regression `balanced+` + ชื่อรุ่นไม่รั่ว payload — บันทึก issue.md |

**Defer ที่เหลือ (user รับทราบ):** executable e2e proof ของ model routing (harness consume `model`) → ไป VERIFY/dogfood ถัดไป · rule ใหม่ (critical-path depth, tier→model-at-adapter) → รอ SHIP

**ไม่มี blocker ค้าง — พร้อมเข้า BUILD**
