# Feature — Build orchestration

> ความรู้ถาวรระดับ feature · promote จาก topic `improve-performance` (achieved 2026-06-10)
> วิธีที่ BUILD/DESIGN กระจายงานเป็น sub-agent ให้ **เร็วโดยไม่ลด correctness**

## คืออะไร
ชุดกลไกที่ทำให้ BUILD stage **fan-out sub-agent ขนานได้กว้าง** แทน chain เส้นตรง (1 agent/wave) — ครอบทั้งฝั่ง **DESIGN** (ออกแบบ DAG ให้กว้าง) และ **BUILD** (เดิน wave + route model + verify lean). แก้ root cause ที่ BUILD เคยช้า: DAG ที่ DESIGN สร้างเป็น chain ลึก → ทุก wave มี task เดียว

## องค์ประกอบ
| # | กลไก | layer | ทำอะไร |
|---|---|---|---|
| 1 | **DAG-width toolkit** | DESIGN (`design.md` §3 + `tech-lead.md`) | 3 เทคนิคลด serialization: **contract-first decouple** (พึ่ง contract/stub ไม่ใช่ runtime → ขนาน) · **re-slice ต่างแกน** · **ยอม serialize เฉพาะ chain แท้** — คงนิยาม vertical slice เดิม, toolkit เป็น optional |
| 2 | **Critical-path gate** | DESIGN (Gate §8 + §4 step + template §7) | judgment gate: วัด **critical-path depth + max wave width**; chain เส้นตรงต้องมีเหตุผล explicit (กัน chain เผลอ) |
| 3 | **Model routing per task** | BUILD (`build-wave.mjs` + `command` adapter) | `task.md` field `Model tier` (generic `{cheap,balanced,deepest}`) → adapter map→รุ่นจริง → `build-wave` pass-through `model` เข้า `agent()` ต่อ task (คุม token/cost บน critical path) |
| 4 | **Lean self-verify** | BUILD (`build.md` §3 + `developer.md`) | agent verify **scope component ตัวเอง** (unit+lint+test-flow) ไม่รัน cross-component/integration/e2e ต่อ task → เลื่อนไป **full-gate** (blocking, ห้ามลด bar) |
| 5 | **Task/context lean** | DESIGN (`tech-lead.md` + template) | task brief กระชับพอ agent ทำจบ → ลด context token ต่อ agent; brief ยาวผิดปกติ → recheck dependency/re-slice |

## ทำงานยังไง (flow)
- **DESIGN:** แตก task → วาด DAG → เช็ค critical-path (gate 2): ลึก → ลอง toolkit (1) decouple → ระบุเหตุผลถ้ายอม serialize → ใส่ `Model tier` (3) ต่อ task
- **BUILD:** orchestrator อ่าน tier จาก `task.md` → map tier→รุ่นจริง (adapter) → ส่ง `tasks: {name, model}[]` เข้า `build-wave` ต่อ wave → agent self-verify scope ตัวเอง (4) → **full-gate** รวม (build+test ทั้งหมด blocking)
- **integration:** worktree isolation ต่อ task แล้ว merge เข้า build branch; worktree base ปนเปื้อน → cherry-pick commit เดี่ยว / fallback shared-tree (`docs/techstack/installer/rule.md` §build orchestration)

## ขอบเขต / ข้อจำกัด
- **toolkit = optional technique** ไม่ใช่ข้อบังคับ — vertical slice ยังตัดทุก layer end-to-end เหมือนเดิม
- **critical-path gate = judgment** (reviewer ตีความ) ไม่ใช่ mechanical check ของ `validate-topic.mjs`
- **model tier = guidance ไม่ enforce**; vocab generic, map ที่ adapter เท่านั้น (payload คง generic — `docs/rule.md` §1)
- **full-gate คงเป็น blocking เสมอ** — lean self-verify ย้าย integration coverage ไป full-gate ไม่ใช่ตัดทิ้ง
- **executable e2e proof ของ model routing** (harness consume `model` แล้ว route จริง) — defer ไป dogfood ถัดไป (unit + runtime proof ครอบแค่ "ส่ง key model ถูก")

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/workflow/stages/design.md` (§3 toolkit + Gate §8 critical-path) · `stages/build.md` (§3 lean verify + full-gate)
- `src/.warnyin/workflow/scripts/build-wave.mjs` (รับ `tasks: string[] | {name, model?}[]` — `model` pass-through)
- `src/.warnyin/workflow/roles/{tech-lead,developer}.md` · `contexts/{README,build}.md` (per-task tier — ดู feature `context-profiles`)
- `src/.claude/commands/warnyin/build.md` (adapter: map tier→รุ่นจริง + ส่ง `baseRef`)
- template `src/.warnyin/template/stages/[topic]/design.md` (§7 depth/width) + `tasks/[task-name]/task.md` (field `Model tier`)
