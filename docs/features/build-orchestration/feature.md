# Feature — Build orchestration

> ความรู้ถาวรระดับ feature · promote จาก topic `improve-performance` (achieved 2026-06-10) + `parallel-design-docs` (achieved 2026-06-11 — DESIGN doc-creation #6-8)
> วิธีที่ BUILD/DESIGN กระจายงานเป็น sub-agent ให้ **เร็วโดยไม่ลด correctness**

## คืออะไร
ชุดกลไกที่ทำให้ **BUILD (เดิน wave) และการสร้างเอกสาร DESIGN** fan-out sub-agent ขนานได้กว้าง แทน chain เส้นตรง / การทำ serial — ครอบทั้งฝั่ง **DESIGN** (ออกแบบ DAG ให้กว้าง + parallelize grounding/task-gen + เขียน narrative single-writer) และ **BUILD** (เดิน wave + route model + verify lean). แก้ root cause ที่งานเคยช้า: DAG ที่ DESIGN สร้างเป็น chain ลึก → ทุก wave มี task เดียว, และการสร้างเอกสาร DESIGN ทำ serial ทั้งที่หลายส่วน independent

หลักการแกนของการ fan-out ทั้ง feature: **"Parallelize gathering, serialize judgment/narrative"** (`docs/rule.md` §1) — fan-out เพื่อ **เก็บข้อมูล/เขียนหน่วย independent** ได้ แต่ **ตัดสิน scope + เขียน narrative ที่ coherent = single-writer**; ทุกจุด fan-out มี fallback (tool-agnostic)

## องค์ประกอบ
| # | กลไก | layer | ทำอะไร |
|---|---|---|---|
| 1 | **DAG-width toolkit** | DESIGN (`design.md` §3 + `tech-lead.md`) | 3 เทคนิคลด serialization: **contract-first decouple** (พึ่ง contract/stub ไม่ใช่ runtime → ขนาน) · **re-slice ต่างแกน** · **ยอม serialize เฉพาะ chain แท้** — คงนิยาม vertical slice เดิม, toolkit เป็น optional |
| 2 | **Critical-path gate** | DESIGN (Gate §8 + §4 step + template §7) | judgment gate: วัด **critical-path depth + max wave width**; chain เส้นตรงต้องมีเหตุผล explicit (กัน chain เผลอ) |
| 3 | **Model routing per task** | BUILD (`build-wave.mjs` + `command` adapter) | `task.md` field `Model tier` (generic `{cheap,balanced,deepest}`) → adapter map→รุ่นจริง → `build-wave` pass-through `model` เข้า `agent()` ต่อ task (คุม token/cost บน critical path) |
| 4 | **Lean self-verify** | BUILD (`build.md` §3 + `developer.md`) | agent verify **scope component ตัวเอง** (unit+lint+test-flow) ไม่รัน cross-component/integration/e2e ต่อ task → เลื่อนไป **full-gate** (blocking, ห้ามลด bar) |
| 5 | **Task/context lean** | DESIGN (`tech-lead.md` + template) | task brief กระชับพอ agent ทำจบ → ลด context token ต่อ agent; brief ยาวผิดปกติ → recheck dependency/re-slice |
| 6 | **Parallel grounding** | DESIGN (`design.md` §4 step 2) | fan-out read-only sub-agent ต่อโดเมน (project+rule / techstack+codemap / โค้ดจริง / discovery+spec) → คืน summary+path; main loop สังเคราะห์ + ตัดสิน scope + ถาม user เอง (judgment ไม่ delegate); + fallback |
| 7 | **Task-file fan-out default** | DESIGN (`design.md` §4 step 9 + §7 standard/large) | หลังผ่าน Gate §8 → fan-out 1 agent/task เขียน 4 ไฟล์ (`spec/standard/rule/task`) ขนาน; **ไม่ต้อง worktree** (task คนละโฟลเดอร์ ไม่ชนกัน); fast=1 task ไม่ fan-out; main loop review coherence ข้าม task; + fallback |
| 8 | **Narrative single-writer guardrail** | DESIGN (`design.md` §4 step 5) | research เก็บ fact ขนานได้ แต่ **เขียน narrative ของ `proposal.md`/`design.md` = main loop คนเดียว** — ห้ามแตกให้หลาย agent เขียนคนละ section (review+rewrite แพงกว่าเขียนรอบเดียว); + fallback |

## ทำงานยังไง (flow)
- **DESIGN (สร้างเอกสาร):** ground แบบ fan-out หลายโดเมนขนาน (6) → main loop สังเคราะห์ + propose/design (เขียน narrative single-writer 8, research ขนานได้) → แตก task → วาด DAG → เช็ค critical-path (gate 2): ลึก → ลอง toolkit (1) decouple → ระบุเหตุผลถ้ายอม serialize → ใส่ `Model tier` (3) ต่อ task → ผ่าน Gate §8 → fan-out เขียนไฟล์ task ขนาน (7)
- **BUILD:** orchestrator อ่าน tier จาก `task.md` → map tier→รุ่นจริง (adapter) → ส่ง `tasks: {name, model}[]` เข้า `build-wave` ต่อ wave → agent self-verify scope ตัวเอง (4) → **full-gate** รวม (build+test ทั้งหมด blocking)
- **integration:** worktree isolation ต่อ task แล้ว merge เข้า build branch; worktree base ปนเปื้อน → cherry-pick commit เดี่ยว / fallback shared-tree (`docs/techstack/installer/rule.md` §build orchestration)

## ขอบเขต / ข้อจำกัด
- **toolkit = optional technique** ไม่ใช่ข้อบังคับ — vertical slice ยังตัดทุก layer end-to-end เหมือนเดิม
- **critical-path gate = judgment** (reviewer ตีความ) ไม่ใช่ mechanical check ของ `validate-topic.mjs`
- **model tier = guidance ไม่ enforce**; vocab generic, map ที่ adapter เท่านั้น (payload คง generic — `docs/rule.md` §1)
- **full-gate คงเป็น blocking เสมอ** — lean self-verify ย้าย integration coverage ไป full-gate ไม่ใช่ตัดทิ้ง
- **executable e2e proof ของ model routing** (harness consume `model` แล้ว route จริง) — defer ไป dogfood ถัดไป (unit + runtime proof ครอบแค่ "ส่ง key model ถูก")

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/workflow/stages/design.md` (§3 toolkit + หลักการแกน fan-out · §4 step 2 grounding · step 5 narrative · step 9 task-fanout · §7 tier · Gate §8 critical-path) · `stages/build.md` (§3 lean verify + full-gate)
- `src/.warnyin/workflow/scripts/build-wave.mjs` (รับ `tasks: string[] | {name, model?}[]` — `model` pass-through)
- `src/.warnyin/workflow/roles/{tech-lead,developer}.md` · `contexts/{README,build}.md` (per-task tier — ดู feature `context-profiles`)
- `src/.claude/commands/warnyin/build.md` (adapter: map tier→รุ่นจริง + ส่ง `baseRef`)
- template `src/.warnyin/template/stages/[topic]/design.md` (§7 depth/width) + `tasks/[task-name]/task.md` (field `Model tier`)
