# Design (How) — build-log narrative (Gap B)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** (lens: `.warnyin/workflow/roles/sa.md`)
> ผ่าน review panel (SA/Tech Lead/QA) — แก้ blocker ครบ (ดู §10)

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `workflow-core` — BUILD orchestration = `build-wave.mjs` (Workflow script) + `build.md` (playbook) + `.claude/commands/warnyin/build.md` (main-loop orchestration). **ยังไม่มี `docs/techstack/workflow-core/`** → rule/standard อ้าง `docs/rule.md` (global: zero-dep/ESM/tool-agnostic) + `docs/techstack/installer/standard.md` (script pattern เดียวกัน); เสนอสร้าง techstack folder ตอน SHIP
- **แนวทางหลัก:** build-log.md = **narrative artifact ที่ main loop (AI) เขียนเอง** จาก `events[]` ที่ sub-agent คืนผ่าน RESULT_SCHEMA — pattern เดียวกับที่ main loop เขียน `troubleshooting.md` อยู่แล้ว (command `build.md:18`: ดึง field จาก `result.results[]` → เขียน topic file เอง). agent ใน worktree **ไม่เขียนไฟล์ topic dir** (troubleshooting #14) → คืน events ผ่าน schema เท่านั้น
- **narrative = AI judgment ไม่ใช่ compose function** — กลั่นเหตุการณ์เป็นเรื่องเล่า (discovery "narrative ไม่ใช่ dump") เป็นงานที่ AI ทำได้ดีกว่า deterministic script → ไม่มี pure `composeBuildLog()` (honest: ไม่ over-engineer)
- **★ canonical-copy convention** (`docs/rule.md:19`): wording ที่กระจายหลายไฟล์ (kind 4 ค่า + นิยาม + mapping ไอคอน + โครง build-log.md) — **canonical full = §3 ของ design นี้**; prompt ใน `build-wave.mjs`, ขั้น compose ใน command/playbook, และ template = **pointer copy คำต่อคำ ห้ามแต่งใหม่** (กัน emit↔compose drift — สองฝั่งของ contract เดียว)

## 2. Vertical slice → 1 task
> เดิมแบ่ง 2 slice (emit/compose) — panel (Tech Lead) ชี้ว่า emit เล็กผิดปกติ (~13 บรรทัด schema + 1 prompt line) และ schema freeze ใน §3 แล้ว = **canonical-copy ไม่ใช่ compile-time dependency** → แยก worktree overhead เกินคุณค่า → **รวมเป็น 1 task** (slice เดียว ตัดผ่านทุก layer end-to-end)

| # | Slice (ส่งมอบคุณค่า) | ตัดผ่าน layer | → task |
|---|---|---|---|
| 1 | **build-log.md เกิดจริงตอน BUILD** — agent คืน events + main loop เขียน narrative timeline | script (`build-wave.mjs`) · orchestration (command) · playbook · template · test | `tasks/build-log-narrative/` |

**sub-task ภายใน (ลำดับ):** (a) `events[]` schema + prompt ใน `build-wave.mjs` → (b) compose wiring ใน command `build.md` + playbook (principle/Output/Gate) → (c) template `[topic]/build-log.md` → (d) test (structural + executable trace)

## 3. Data model / schema (canonical ★ — full นิยามที่นี่ที่เดียว)

### 3.1 `events[]` ใน RESULT_SCHEMA (`build-wave.mjs`)
field ใหม่ **optional** (ต่อท้าย `properties` เดิม — **ห้ามเติมลง `required`** เพื่อ backward-compat: agent ที่ไม่มีเหตุการณ์เด่นไม่ fail schema):
```js
events: {
  type: 'array',
  maxItems: 10,                 // soft guard กัน raw dump — ชน cap = ควรกลั่นเป็น narrative ขึ้น (ไม่ใช่ limit เนื้อเรื่อง)
  description: 'เหตุการณ์สำคัญระหว่าง implement (narrative material) — main loop กลั่นลง build-log.md; เก็บเฉพาะจุดเปลี่ยน ไม่ใช่ทุก step',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['kind', 'note'],
    properties: {
      kind: { enum: ['start', 'decision', 'error', 'done'], description: 'ชนิดเหตุการณ์สำคัญ' },
      note: { type: 'string', description: 'สิ่งที่เกิด 1 บรรทัด (ตัดสินใจอะไร/ติดอะไร/แก้ยังไง)' },
    },
  },
}
```
- **kind opinionated 4 ค่า** (ไม่ไหลเป็น catalog): `start` (เริ่ม + เข้าใจ task ยังไง) · `decision` (ทางเลือกสำคัญ + เหตุผล) · `error` (ติดอะไร + แก้ยังไง) · `done` (ผลสุดท้าย + ผล test)
- **`maxItems: 10`** = machine-enforced guard ของ "narrative ไม่ใช่ dump" (วัดได้ — ดู §8)

### 3.2 โครง `build-log.md` (canonical)
```markdown
# Build log — <slug>

> narrative timeline ของ BUILD fan-out — main loop เขียนหลังแต่ละ wave (เหตุการณ์สำคัญ ไม่ใช่ raw dump)
> สถานะ/ผลสรุปต่อ task → ดู build.md; ไฟล์นี้เล่า "ระหว่างทาง" (กลาง wave ที่ report ไม่ครอบ)

## Wave 1
### <task> — <✅ passed | ✖ failed>
- 🟢 start: <...>
- 🤔 decision: <...>
- 🔴 error: <...> → <แก้>
- ✅ done: <ผล test/lint>

## Wave 2
...

## Full gate
- <ผล full build+test รอบรวม + รอบแก้ถ้ามี>
```
- **mapping kind → ไอคอน:** start→🟢 · decision→🤔 · error→🔴 · done→✅
- **ไม่จด status board** (ชนิด/ผลสรุปต่อ task เต็มอยู่ `build.md`) — build-log เล่า "ระหว่างทาง" เท่านั้น (honors `unify-in-place`); agent ไม่คืน events → section task นั้นเขียนจาก `summary`+`status` ที่มี (graceful)

## 4. Interface / contract
- **emit (`build-wave.mjs`):** sub-agent คืน `events[]` ใน RESULT_SCHEMA (optional); prompt สั่งบันทึกเฉพาะจุดเปลี่ยน (start/decision/error/done) — pointer ชี้นิยาม §3.1 (ไม่แต่ง wording ใหม่)
- **compose (main loop, command `build.md`):** หลัง Workflow คืนผล wave → main loop ดึง **`result.results[].events`** (+ `status`/`summary`) ของทุก task ในรอบนั้น (เหมือน `result...troubleshooting` ที่ command `build.md:18` ทำอยู่) → **append section `## Wave N`** ลง `docs/stages/<slug>/build-log.md` (กลั่นเป็น narrative ตาม §3.2, ไม่ dump ดิบ); หลัง full gate → append `## Full gate`. ไฟล์ไม่มี → สร้างจาก canonical §3.2 (robust) — main loop เขียนเอง กันไฟล์ชนใน worktree (#14)

## 5. Flow
- **data-flow:** `sub-agent implement → คืน events[] (schema)` ⟶ `Workflow return { results }` ⟶ `main loop ดึง result.results[].events → append build-log.md ต่อ wave` ⟶ `user/agent อ่าน timeline ย้อนหลัง`
- **user-flow:** รัน `/warnyin:build` → จบแต่ละ wave เห็น build-log.md เติม section → build ล่ม/ผลแปลก เปิด build-log.md อ่านว่าระหว่างทางเกิดอะไร (ไม่ต้องเดาจาก diff)

## 6. ผลกระทบต่อระบบเดิม
- `build-wave.mjs`: เพิ่ม `events` ใน RESULT_SCHEMA (optional, มี `maxItems`) + เติม 1 ข้อใน `prompt()` (กระชับ 1 บรรทัด ชี้ §3.1) — **ไม่แตะ flow `parallel()`/worktree** (backward-compat)
- `.claude/commands/warnyin/build.md`: เพิ่มขั้นเขียน build-log.md คู่กับขั้นรวม troubleshooting (ข้อ 6) + ปิดท้าย (ข้อ 7/8)
- `build.md` playbook: +principle (observability artifact) + Output entry + Gate item
- **template `src/.warnyin/template/stages/[topic]/build-log.md`** — **มี** (แก้ข้อเท็จจริงจาก review B1: template `[topic]/` มี build.md/troubleshooting.md/verify.md/ship.md เป็น canonical structure อยู่แล้ว แม้ installer seed เฉพาะ context.md `cli.mjs:75-78`) → build-log.md เพิ่ม template ให้ **consistent กับ pattern artifact ระดับ BUILD เดิม** (build.md/troubleshooting.md มี template); อยู่ใต้ `src/.warnyin/` → `package.json files` allowlist ครอบแล้ว ไม่ต้องแก้
- `validate-topic.mjs`: **ไม่ต้องแตะ** — build-log.md ไม่อยู่ใน `STAGE_FILES` (`:24`) → ไม่ require อัตโนมัติ + ไฟล์ที่มีถูก ignore เงียบ (เหมือน troubleshooting.md); Scenario §9 เป็น **guard ยืนยัน (no-op expected)** ไม่ใช่เช็คที่ต้องแก้ validator

## 7. Dependency
```
1 task (build-log-narrative) — sub-task เรียงในตัว:
  (a) events schema + prompt  →  (b) compose wiring (command+playbook)  →  (c) template  →  (d) test
```
- ไม่มี cross-task dependency (รวมเป็น task เดียว); sub-task เรียงตามลำดับ logical (schema freeze ที่ §3 = canonical source ที่ (b)/(c) copy ตาม)

## 8. Test strategy ระดับ design
> component = workflow script + playbook (`.md`) → verify เชิงโครงสร้าง + executable proof (เหมือน topic `context-working-memory`, `feature-spec-delta`). **`build-wave.mjs` import ตรงจาก unit ไม่ได้** (top-level `await parallel()` + global `args`/`agent`/`log`/`phase` ของ Workflow runtime — ไม่มี main-guard แบบ verify-pack.mjs) → ไม่มี unit ของ schema; พิสูจน์ด้วย structural + executable trace

**A. Structural**
- RESULT_SCHEMA มี `events` (array, `maxItems:10`, items.kind enum 4 ค่า, required `kind`/`note`, **ไม่อยู่ใน root `required`**); `node --check build-wave.mjs` ผ่าน; schema เดิมครบ (ไม่พัง flow)
- command `build.md` มีขั้นเขียน build-log.md; playbook มี principle+Output+Gate; template `[topic]/build-log.md` โครงตรง canonical §3.2 คำต่อคำ (canonical-copy)

**B. Executable trace (BL-1 — แทน "รัน BUILD จริง" ที่ติด chicken-egg เพราะ root dogfood ยังไม่มี logic ใหม่)**
- เดินกติกา compose ด้วยมือ (เหมือน dogfood-sim ของ `context-working-memory`): feed **synthetic `results[]`** (2 task, มี `events[]` ตัวอย่างครบ 4 kind + 1 task ไม่มี events) → main loop เขียน build-log.md ตาม §3.2 → **assert (observable proxy ของ "narrative ไม่ใช่ dump" — BL-2):**
  - (1) มี `## Wave N` ครบทุก wave ที่ feed
  - (2) ทุก task ที่มี events → section มี bullet ที่ kind ∈ {start,decision,error,done} เท่านั้น (ไอคอนตรง mapping)
  - (3) task ที่ไม่มี events → section เขียนจาก summary+status (graceful, ไม่ error)
  - (4) ไม่มี markdown table สถานะ (ไม่ duplicate status board ของ build.md — มี pointer ชี้ build.md แทน)
  - (5) events ต่อ task ≤ 10 (maxItems — machine guard)
- **qualitative ("เล่าเป็นเรื่อง")** = manual review note ใน verify.md (ไม่ใช่ gate — ยอมรับเป็น subjective ระบุชัด)

**C. Self-dogfood (secondary, opportunistic)**
- ตอน BUILD topic นี้เอง: root dogfood ยังเป็น release เก่า (ไม่มี logic build-log) → main loop เขียน build-log.md ของ topic นี้ **ตาม canonical ด้วยมือ** (ตาม design) = artifact จริงของ topic build-log-narrative; พฤติกรรม auto จะ active ใน repo นี้หลัง `--update`/release ถัดไป (เหมือนบทเรียน context-working-memory build.md §3)

**D. Regression**
- `npm test` → **pass count = tests = 58 (ไม่มี skip)** ผ่าน `check-test-count.mjs` (acceptance = pass-count ไม่ใช่แค่ exit 0 — `installer/test.md:11`, troubleshooting #3/#13); build-wave.mjs ไม่มี unit เดิมให้พัง แต่ `node --check` ต้องผ่าน
- `lint-md` เขียว (ลิงก์ใหม่ resolve)

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> ไม่มี feature เดิมชื่อ build-log-narrative ใน `docs/features/` → ทั้งหมด **ADDED** (feature ใหม่; SHIP สร้าง `docs/features/build-log-narrative/spec.md`)

### ADDED
#### Requirement: build-wave คืน narrative events (→ feature: build-log-narrative)
`build-wave.mjs` RESULT_SCHEMA มี field `events[]` (optional, `maxItems:10`) ให้ sub-agent คืนเหตุการณ์สำคัญ (`kind` ∈ start/decision/error/done + `note`)
- Scenario: อ่าน RESULT_SCHEMA → `events` เป็น array (`maxItems` 10), items มี `kind` (enum 4 ค่า) + `note` required, และ `events` **ไม่อยู่ใน** root `required`
- Scenario: result ที่ไม่มี `events` → ยัง valid ตาม schema (optional) — flow เดิมไม่พัง

#### Requirement: main loop เขียน build-log.md narrative ตอน BUILD (→ feature: build-log-narrative)
หลังจบแต่ละ wave main loop append section `## Wave N` ลง `docs/stages/<slug>/build-log.md` จาก `result.results[].events` (กลั่นเป็นเรื่อง ไม่ dump); ไฟล์ไม่มี → สร้างจาก canonical
- Scenario: compose จาก results ที่มี ≥1 wave → build-log.md มี `## Wave 1` + bullet เหตุการณ์ต่อ task ที่ kind ∈ 4 ค่า (ไอคอนตรง mapping) + ชี้ status ต่อ task
- Scenario: build-log.md ไม่มี markdown table สถานะ (ไม่ซ้ำ status board ของ build.md — เล่า "ระหว่างทาง" เท่านั้น)
- Scenario: task ที่ไม่มี events → section เขียนจาก summary+status (graceful)

#### Requirement: build-log.md เป็น optional artifact (→ feature: build-log-narrative)
build-log.md เป็น observability artifact ของ BUILD — `validate-topic.mjs` ไม่ require (เหมือน troubleshooting.md; ไม่ต้องแก้ validator)
- Scenario: topic ไม่มี build-log.md → `validate-topic.mjs <slug>` ไม่ขึ้น ✖ เพราะไฟล์นี้ (no-op expected — build-log.md อยู่นอก STAGE_FILES)

## 10. Design review (panel SA / Tech Lead / QA — 2026-06-08)
fan-out subagent อิสระ read-only ตาม playbook §4.6 — รวม **4 blocker, แก้ครบ**:

| # | role | blocker | แก้ยังไง |
|---|---|---|---|
| B1 | SA | §6 อ้างผิด "build.md/troubleshooting.md ไม่มีใน template `[topic]/`" → premise ตัดสิน "ไม่ทำ template" ผิด | ground จริง (template มี build.md/troubleshooting.md/verify.md/ship.md) → **เพิ่ม template `[topic]/build-log.md`** ให้ consistent (§6); installer ไม่ seed (เหมือน build.md) — allowlist ครอบแล้ว |
| B2 | SA | ไม่ระบุกลไก canonical-copy → wording (kind/นิยาม) เสี่ยง emit↔compose drift | ระบุ **canonical full = §3**, prompt/command/playbook/template = pointer copy คำต่อคำ (§1, §4) |
| BL-1 | QA | dogfood "รัน BUILD กับ topic ที่มี task" ทำไม่ได้จริง (ไม่มี topic ที่มี task + chicken-egg) | เปลี่ยนเป็น **executable trace** (feed synthetic results เดินกติกา compose ด้วยมือ) + self-dogfood เป็น secondary (§8 B/C) |
| BL-2 | QA | "narrative ไม่ใช่ raw dump" วัด observable ไม่ได้ (subjective) | แปลงเป็น **structural proxy 5 ข้อ** (Wave ครบ/kind enum/graceful/ไม่มี status table/maxItems) + `maxItems:10` machine guard; qualitative = manual note ไม่ใช่ gate (§8 B) |

**Suggestions ที่รับมา:** S1 (ระบุ `result.results[].events` — §4) · S2 (events ไม่อยู่ใน required — §3.1) · S4/SG-5 (ไม่แตะ validator, no-op expected — §6/§9) · SG-2 (regression = pass-count — §8 D) · SG-3 (`maxItems` — §3.1) · Tech Lead รวม 2 task → 1 (§2)
**Suggestions ที่ไม่ทำ (มีเหตุผล):** SG-1 (แยก RESULT_SCHEMA เป็น module import ได้เพื่อ unit) — **ไม่ทำตอนนี้:** schema เป็น object literal ใน Workflow script; แยก module เพิ่ม surface โดย behavior จริงพิสูจน์ด้วย executable trace + self-dogfood เพียงพอ (ตรง pattern payload `.md`); revisit ถ้า build-wave logic ซับซ้อนขึ้น · S5 (ship.md archive ครอบ build-log.md) — SHIP `git mv` ทั้งโฟลเดอร์อยู่แล้ว → ครอบ build-log.md อัตโนมัติ ไม่ต้องแก้
