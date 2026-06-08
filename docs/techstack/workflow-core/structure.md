# Structure — workflow-core

> โครงสร้างจริงของ component **workflow-core** (BUILD orchestration) · อัปเดตจากโค้ดจริง

## ไฟล์หลัก (SOURCE layer `src/`)
| ไฟล์ | หน้าที่ |
|---|---|
| `src/.warnyin/workflow/scripts/build-wave.mjs` | Workflow script — fan-out 1 sub-agent ต่อ 1 task ใน 1 wave (parallel, worktree/shared-tree), คืนผลตาม `RESULT_SCHEMA` |
| `src/.warnyin/workflow/stages/build.md` | playbook กลางของ BUILD stage (หลักการ + orchestration + Output + Gate) — tool-agnostic |
| `src/.claude/commands/warnyin/build.md` | adapter (Claude Code) — main-loop orchestration: เรียก Workflow ทีละ wave, integrate, รวม troubleshooting, **เขียน build-log.md**, full gate |
| `src/.warnyin/template/stages/[topic]/build-log.md` | canonical skeleton ของ narrative artifact |
| `src/.warnyin/workflow/scripts/validate-topic.mjs` | structural validator (zero-dep) — build-log.md อยู่นอก `STAGE_FILES` (ไม่ require) |

## `build-wave.mjs` — RESULT_SCHEMA
`required: ['task','status','summary']` (root) · `properties`: `task`, `status` (enum passed/failed), `summary`, `branch`, `filesChanged[]`, `testResult`, `notes`, `troubleshooting[]`, **`events[]`** (optional, `maxItems:10`; items: `kind` enum `[start,decision,error,done]` + `note`, `required:[kind,note]`, `additionalProperties:false`)
- `prompt(task)` — instruction ให้ build agent (ข้อ 1-8 + ข้อ **8.1** สั่งบันทึก events จุดเปลี่ยน + ข้อ 9 conditional worktree/shared-tree)
- `parallel(tasks.map(...))` → `return { slug, results: clean, failed, skipped }` — events ติดมากับแต่ละ result object

## flow (events → build-log.md)
```
sub-agent implement → คืน events[] ใน RESULT_SCHEMA (optional)
  → Workflow parallel() return { results }
  → main loop ดึง result.results[].events (+ status/summary)
  → append ## Wave N ลง docs/stages/<slug>/build-log.md (narrative §3.2)
  → หลัง full gate → ## Full gate
```
- ไฟล์ build-log.md ไม่มี → main loop สร้างจาก canonical skeleton ก่อน append (robust)
- BUILD orchestration: อ่าน task → DAG → wave (topological) → fan-out ต่อ wave → integrate (merge worktree branch หรือ commit shared-tree) → full build/test gate → เขียน build.md + build-log.md

## 2-layer (bootstrap)
- แก้ที่ **SOURCE** `src/**`; dogfood ที่ root (`.warnyin/`, `.claude/`) regen ตอน release (`npm run setup:dogfood`) → behavior ใหม่ active ใน repo นี้หลัง `--update`/release ถัดไป (self-dogfood lag — design ของ topic §8 C)

## ยังไม่มี
- ยังไม่มี unit test ของ `build-wave.mjs` (Workflow script import ตรงไม่ได้ — ดู `./test.md`); พิสูจน์ด้วย structural + executable trace
