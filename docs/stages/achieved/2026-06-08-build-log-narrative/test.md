# Test plan — build-log-narrative

> แผนเทสระดับ topic · playbook: `.warnyin/workflow/stages/verify.md` · SHIP merge → `docs/techstack/workflow-core/test.md` (folder สร้างตอน SHIP)
> **component = workflow-core** (Workflow script `build-wave.mjs` + playbook/command `.md`) → ไม่มี service ให้ launch → verify เชิง **structural + executable trace** (เหมือน `context-working-memory`, `feature-spec-delta`)

## 0. ทำไมไม่ใช่ unit test
`build-wave.mjs` = Workflow script body (top-level `await parallel()` + global `parallel`/`agent`/`log`/`phase`/`args` ของ runtime, ไม่มี main-guard) → **import/`node --check` ตรงไม่ได้** (design §8; `node --check` ขึ้น `Illegal return statement` = false-red, pre-existing — ดู troubleshooting). schema validate ด้วยการ **parse object literal** + behavior พิสูจน์ด้วย **executable trace** (compose rule กับ synthetic results) — **ไม่เพิ่มไฟล์ `.test.mjs`** (count คง 58 — acceptance D1)

## 1. Env / เครื่องมือ
- ไม่ต้องรัน service — เทสด้วย: `node` (parse schema / compose trace), `npm test` (`node --test`), `npm run lint:md`, `node validate-topic.mjs <slug>`
- executable trace = scratch harness นอก repo (OS temp) → ไม่หลุด `node --test` glob

## 2. Cases (map กับ Spec delta `design.md §9`)

### A. Structural — _Req1 + Req2_
- **A1 schema** (parse `RESULT_SCHEMA` จาก `src/.warnyin/workflow/scripts/build-wave.mjs`): `events` = `array`; `maxItems === 10`; `items.kind.enum === [start,decision,error,done]`; `items.note.type === string`; `items.required === [kind,note]`; `items.additionalProperties === false`; **`events` ไม่อยู่ root `required`** (backward-compat); root `required === [task,status,summary]` เดิมครบ; props เดิม (`troubleshooting`/`branch`/`filesChanged`) ไม่หาย
- **A2 template** (`src/.warnyin/template/stages/[topic]/build-log.md`): body == fenced block `design.md §3.2` **คำต่อคำ** (canonical-copy)
- **A3 wiring**: command `build.md` มีขั้นเขียน build-log.md (ดึง `result.results[].events` → append `## Wave N` + `## Full gate`, ไอคอน mapping, graceful, ไม่จด status board); playbook `build.md` มี principle #13 + Output row + Gate item

### B. Executable trace — 5 proxy ของ "narrative ไม่ใช่ dump" (_Req2 + BL-2_)
feed synthetic `results[]` (task **alpha** = events ครบ 4 kind · task **beta** = ไม่มี events) → เดิน compose rule (mirror command `build.md` + §3.2) → assert:
- **P1** มี `## Wave N` ครบทุก wave ที่ feed
- **P2** ทุก bullet ของ alpha = `kind ∈ {start,decision,error,done}` + ไอคอนตรง mapping (start→🟢 decision→🤔 error→🔴 done→✅)
- **P3** beta (ไม่มี events) → section เขียนจาก `summary`+`status` (graceful, ไม่ fabricate event)
- **P4** ไม่มี markdown table สถานะ (ไม่ซ้ำ status board ของ `build.md` — ชี้ไปแทน)
- **P5** events/task ≤ 10 (`maxItems` machine guard)

### C. Validator no-op — _Req3_
`node validate-topic.mjs build-log-narrative` → exit 0; build-log.md **ไม่** trigger ✖ (อยู่นอก `STAGE_FILES` → ignore เงียบ เหมือน troubleshooting.md)

### D. Regression — _baseline_
- feature ใหม่ (ยังไม่มี `docs/features/build-log-narrative/`) → baseline = **58 test เดิม**: `npm test` → `pass == tests == 58` (0 skip, ผ่าน `check-test-count.mjs`)
- `lint:md` เขียว (ลิงก์ artifact ใหม่ resolve)
- backward-compat: result ที่ไม่คืน `events` ยัง valid (events optional) — flow `parallel()` ไม่พัง

### (non-gate) qualitative
"เล่าเป็นเรื่อง" = subjective → manual review note ใน `verify.md` ไม่ใช่ gate (วัด observable ด้วย P1-P5 + `maxItems` แทน)
