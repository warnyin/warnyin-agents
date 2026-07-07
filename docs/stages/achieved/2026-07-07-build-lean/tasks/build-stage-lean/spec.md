# Spec — build-stage-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`code + docs` — payload playbook (`build.md`) + workflow script (`build-wave.mjs` — harness-wrapped) + unit test + adapter/registry `.md`

## 2. Contract ของ `prompt()` หลังแก้ (แทน API SPEC)

| | |
|---|---|
| Input | `prompt(task: string)` — อ้าง module-level `slug`/`isolate`/`baseRef` |
| Output | string หลายบรรทัด (join `\n`) — instruction ให้ build agent |
| **ต้องมี** | role card `.warnyin/workflow/roles/developer.md` · `${dir}/task.md` · `${dir}/spec.md` · `${dir}/standard.md` · `${dir}/rule.md` · `docs/techstack/<component>/rule.md` ของ component ที่ task แตะ · บรรทัด "อ่านเพิ่มเฉพาะไฟล์ที่ task.md/standard.md/rule.md อ้างถึง" · troubleshooting-on-error (เดิม) |
| **ต้องไม่มี** | path `stages/build.md` · `design.md` · `proposal.md` (ทั้ง 2 mode) |
| Conditional | step 0 sync (`git merge <baseRef>`) ปรากฏ **เฉพาะ** `isolate && baseRef`; step 9: isolate → commit+รายงาน branch, shared-tree → "อย่า commit เอง" |
| Invariant | `normalizeTasks`/`buildOpts`/`RESULT_SCHEMA`/step 0 logic ไม่เปลี่ยน (เคส A-E เดิม pass โดยไม่แก้ assertion) |

## 4. Data-flow

orchestrator (command adapter) → `build-wave.mjs` (`{slug, tasks, isolate, baseRef}`) → `prompt(task)` → sub-agent → structured result (`RESULT_SCHEMA` — ไม่เปลี่ยน) → main loop integrate ตาม mode (worktree: checkout scoped files / shared-tree: review+commit)

## 5. User-flow

- tier fast: user รัน `/warnyin:build` → hook §1 → main loop code-first (ไม่เข้า flow ด้านล่าง)
- tier standard/large: DAG → wave; wave ≥2 task → worktree ต่อ task; wave เดี่ยว → orchestrator checkout build branch → `isolate:false` → main loop commit

## 6. Persona

orchestrator (main loop ของ BUILD) + build sub-agent + maintainer ของ repo นี้

## 7. Test-flow

> gate ตัดสิน = executable + structural; รันจาก repo root

- [ ] **unit:** `node --test src/tests/build-wave.test.mjs` เขียวทั้งไฟล์ — เคส A-E เดิมผ่านไม่แก้ assertion + เคส prompt ใหม่:
  - เชิงลบ: prompt (isolate และ shared-tree) ไม่มี substring `stages/build.md` / `design.md` / `proposal.md`
  - เชิงบวก: มี `roles/developer.md` + `task.md` + `spec.md` + `standard.md` + `rule.md` + `docs/techstack/` rule.md + "อ่านเพิ่มเฉพาะไฟล์ที่"
  - conditional: `isolate=true, baseRef='build/x'` → มี step 0 (`git merge`); `isolate=false` หรือ `baseRef=null` → ไม่มี
- [ ] **full suite:** `npm test` (bare `node --test`) → `check-test-count` ผ่าน (`pass===tests`, fail=0, ≥ MIN_PASS)
- [ ] **gate-count regression:** `grep -c '^- \[ \]' src/.warnyin/workflow/stages/build.md` = **7** (เท่าก่อนแก้ — spec `learning-loop-tuning` ผูก)
- [ ] **wording block:** grep -F ยืนยัน `build.md §4 ข้อ 6` มี block canonical ตรง `design.md §4.5` คำต่อคำ (ยกเว้น indent) — โดยเฉพาะ `per-finding | batched` + `เหตุผล 1 บรรทัด` + link `](../loop-tuning.md)`; และ **negative-grep**: เนื้อ theory เดิม (เช่น `credit horizon (feed feedback แค่ไหนต่อรอบ)`, `iterative generative optimization`, `experience batching (ตอน delegate fix)`) ไม่เหลือใน `build.md`; ตาราง default §2C ไม่โผล่ใน `build.md` (design §4.6)
- [ ] **fast hook structural:** grep `build.md` เจอ `★ fast-track hook` + link `../triage.md#fast-track-skip-list` + floor ครบ (full-gate/config-protection/investigate-before-edit/ห้ามแตะ rule กลาง); §3 ข้อ 3 + §4 ข้อ 5 มี wording 2 mode ทั้งสองจุด (grep `isolate:false` เจอทั้ง 2 section)
- [ ] **dead-link:** `npm run lint:md` — รันเป็น **integration gate หลังไฟล์ `workflow/loop-tuning.md` มีจริงบน build branch** (wave 2 ควรมีแล้ว); ถ้าแดงเพราะ pointer ข้าม slice → ไม่ใช่ failure ของ task นี้ (design §6) แต่ต้องรายงาน
- [ ] **packaging:** `npm run verify:pack` เขียว (ไฟล์ที่แตะอยู่ใน allowlist `src/.warnyin/`, `src/.claude/commands/` เดิม — ไม่ต้องแก้ packaging)

### Canonical wording block (copy จาก `design.md §4.5` — วางลง `build.md §4 ข้อ 6` คำต่อคำ, ปรับเฉพาะ indent)

```
- **★ loop tuning (fix loop มี finding >1)** — วิธีตัดสิน credit horizon / experience batching + ⚠ ดู [`loop-tuning`](../loop-tuning.md); default-by-tier: ดู [triage.md loop-tuning default](../triage.md)
- Loop-tuning report (fix loop มี finding >1 — non-blocking guidance):
  - ระบุ credit-horizon choice (per-finding | batched) + เหตุผล 1 บรรทัด ในรายงาน ก่อนแก้
  - ตอน delegate fix → failure ถูก group (รายงานเห็น ≥1 group boundary by component/root-cause)
    หรือ ระบุเหตุผลว่าทำไมกลุ่มเดียวพอ — ไม่ dump ก้อนเดียวเงียบๆ
```
