# Ship — build-log-narrative (2026-06-08)

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> ส่งมอบ: promote ความรู้ขึ้น `docs/` + archive topic · feature **ใหม่** · component `workflow-core` (techstack home ใหม่)

## 1. สิ่งที่ส่งมอบ
**Feature ใหม่: `build-log-narrative`** — `docs/stages/<slug>/build-log.md` = narrative timeline ของ BUILD fan-out: sub-agent คืน `events[]` (start/decision/error/done) ผ่าน RESULT_SCHEMA → main loop กลั่นเขียนหลังแต่ละ wave (เล่า "ระหว่างทาง" ไม่จด status board). มาจาก discovery umbrella `memory-identity-observability` **Gap B**

VERIFY ผ่าน Gate: structural + executable trace **5/5 proxy** (harness 18/18) · regression `npm test` 58/58 · 0 รอบแก้

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ใส่ |
|---|---|
| `docs/features/build-log-narrative/feature.md` | **ใหม่** — คืออะไร/ทำงานยังไง/ขอบเขต/ไฟล์ (Gap B) |
| `docs/features/build-log-narrative/business.md` | **ใหม่** — why/persona/คุ้ม/success metric |
| `docs/features/build-log-narrative/spec.md` | **ใหม่** — จาก Spec delta §9 (ทั้งหมด ADDED: 3 requirement + scenario GWT) |
| `docs/techstack/workflow-core/rule.md` | **ใหม่** — LR1 (observability artifact) + LR2 (อย่า node --check Workflow script) + LR3 (shared-tree เมื่อ task untracked) + global inherit |
| `docs/techstack/workflow-core/standard.md` | **ใหม่** — RESULT_SCHEMA optional-append · main-loop-writes-topic-file · compose-in-playbook · canonical-copy |
| `docs/techstack/workflow-core/structure.md` | **ใหม่** — build-wave.mjs + command/playbook build.md + template + flow events→build-log.md |
| `docs/techstack/workflow-core/test.md` | **ใหม่** — structural + executable trace (ทำไมไม่ unit/node --check) · merge จาก test.md ของ topic |
| `docs/troubleshooting.md` | เพิ่ม **#16** (node --check false-red บน Workflow script — ญาติ #13) |
| `docs/codemap/index.md` | build-wave entry +events[]→build-log.md · workflow-core techstack pointer · header rescan |
| `docs/codemap/architecture.md` | 5-stage flow: build-wave → main loop เขียน build-log.md · header rescan |
| `docs/stages/context.md` | SHIP producer: +แถว "เพิ่ง ship" Gap B · อัปเดตโฟกัส (A+B done, เหลือ C) · ลบ Gap B จาก parking lot |

## 3. Learned-rules promoted (user ยืนยันครบ 3)
| # | rule | scope | evidence |
|---|---|---|---|
| LR1 | BUILD ผลิต observability artifact `build-log.md` narrative (agent คืน events ผ่าน schema, main loop เขียนเอง; ไม่จด status board) | component:workflow-core | schema diff `events[]` · self-dogfood `build-log.md` · trace 5/5 (`verify.md` §2) |
| LR2 | อย่า validate Workflow script ด้วย `node --check` (false-red เสมอ) — parse object literal + stash-diff แทน | component:workflow-core | `troubleshooting.md` (topic) · `verify.md` §4 · KB #16 |
| LR3 | BUILD: DESIGN artifacts ยัง untracked → ใช้ shared-tree (worktree clean checkout อ่าน task ไม่เจอ) | component:workflow-core | `build.md` §4 integration notes |

## 4. ตัดทิ้ง / ไม่แตะ (พร้อมเหตุผล)
- **`docs/roadmap.md`** — ไม่แตะ: Gap B มาจาก umbrella `memory-identity-observability` ไม่ใช่ numbered roadmap item (consistent กับ Gap A / context-working-memory ที่ก็ไม่เพิ่ม roadmap)
- **`docs/rule.md`** — ไม่แตะ: learned-rule ทั้ง 3 scope `component:workflow-core` ไม่มี scope `project`
- **`docs/infra.md` / `docs/project.md`** — ไม่แตะ: ไม่มี env/service ใหม่ + scope/เป้าหมายโปรเจกต์ไม่ขยับ
- **umbrella `docs/stages/memory-identity-observability/`** — คงไว้ (discovery ยัง active; เหลือ Gap C ดอง)
- **Spec delta MODIFIED/REMOVED** — ไม่มี (feature ใหม่ ทั้งหมด ADDED → สร้าง spec.md ทั้งก้อน, ไม่มี key-not-found STOP)

## 5. แก้ไขที่ฝากจาก VERIFY (จัดการแล้ว)
- wording `node --check build-wave.mjs ผ่าน` (acceptance/design §8 D ของ topic — frozen ใน archive) → **central docs ใช้ "schema parse" แทน**: `docs/techstack/workflow-core/{rule,test}.md` + KB #16 ระบุชัดว่าห้ามใช้ node --check กับ Workflow script

## 6. Archive
`docs/stages/build-log-narrative/` → `docs/stages/achieved/2026-06-08-build-log-narrative/` (topic untracked → `mv`) · ไฟล์ครบ: proposal/design/build/build-log/test/verify/troubleshooting + tasks/

## 7. หมายเหตุ (โค้ด)
- code change ของ topic อยู่บน build branch `build/build-log-narrative` (SHIP ไม่ merge โค้ด — จัดการเองนอก workflow)
- behavior ใหม่ active ใน repo นี้หลัง `npm run setup:dogfood`/release ถัดไป (self-dogfood lag — ตอน ship นี้ build-log.md ของ topic เขียนด้วยมือตาม canonical)
