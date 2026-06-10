# Ship — improve-performance (เร่งความเร็ว BUILD stage)

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> ส่งมอบ 2026-06-10 · archived ที่ `docs/stages/achieved/2026-06-10-improve-performance/`

## 1. สรุป topic
- **ทำอะไร:** แก้ root cause ที่ BUILD ช้า ("1 agent/wave, chain ยาว") โดยปรับ playbook 2 ชั้นแบบ unify-in-place — **โครงสร้าง (DESIGN):** DAG-width toolkit + critical-path gate + task-lean · **กลไก (BUILD):** model routing per task + lean self-verify. พิสูจน์ด้วยตัวเอง (งานนี้ BUILD wave 1 ขนาน 3 task) + empirical (redesign scaffold-foundation DAG chain depth 4 → wave width 2)
- **ประเภท:** ☑ feature ใหม่ `build-orchestration` + ☑ ปรับปรุง feature เดิม `context-profiles` (per-task model tier)

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/build-orchestration/` (ใหม่) | feature.md + business.md — toolkit/critical-path gate/model routing/lean verify เป็น capability เดียว |
| `docs/features/context-profiles/{feature,spec}.md` | per-task model tier ใน BUILD (additive — 3 Scenario ใหม่: ส่ง model / backward compat / map ที่ adapter) |
| `docs/rule.md` §1 | R1 DAG-width ก่อน serialize (bullet ใหม่) · R2 tier→model map ที่ adapter (refine payload-guidance) · R3 src→root sync-gap (refine build-orchestration) |
| `docs/techstack/installer/rule.md` | R4 §build orchestration — worktree base ปนเปื้อน→cherry-pick commit เดี่ยว / fallback shared-tree |
| `docs/techstack/installer/test.md` | §verify build-orchestration/DAG-width — model-routing runtime proof + payload generic boundary + empirical DAG-width proof |
| `docs/troubleshooting.md` | #16 เสริม (AsyncFunction runtime proof) · #17 worktree ว่าง/root stale · #18 root dogfood gitignore edit-invisible |
| `docs/codemap/index.md` | build-wave.mjs signature `tasks: string[] \| {name,model?}[]` + header rescan date |
| `docs/infra.md` / `docs/project.md` | — ไม่แตะ (ไม่มี env/scope ใหม่) |

## 3. Learned rules (planned + emergent)
| rule (generalize) | evidence | scope | promote? |
|---|---|---|---|
| R1 DESIGN วัด critical-path depth + wave width ก่อนแตก task; chain เส้นตรงต้องมีเหตุผล explicit | `design.md §3B` + commit `e54adc0` + `verify.md V11` empirical | project | ✅ `rule.md §1` |
| R2 tier→model mapping ที่ adapter (`.claude/`) เท่านั้น — payload generic | commit `897050c` + `verify V9` | project | ✅ refine `rule.md §1` payload-guidance |
| R3 root dogfood gitignored → แก้ src/ เท่านั้น; root stale จนกว่า release sync | `build.md §4` + TS-1/TS-3 + commit `d669372` | project | ✅ refine `rule.md §1` build-orchestration |
| R4 worktree base ปนเปื้อน→cherry-pick commit เดี่ยว / shared-tree fallback | `build.md §3` integration notes | component:installer | ✅ `installer/rule.md` §build orchestration |

> ตัดทิ้ง: — ไม่มี (ทั้ง 4 มี evidence ครบ + user ยืนยัน per-rule)

## 4. Archive
- ย้ายจาก `docs/stages/improve-performance/` → `docs/stages/achieved/2026-06-10-improve-performance/` (git mv) เมื่อ 2026-06-10

## 5. ⚠️ Release follow-up (นอก SHIP — ไม่ใช่ docs)
- **src→root sync (ปิด TS-1 ถาวร):** root dogfood `.warnyin/`+`.claude/` ยัง stale กว่า `src/` (root `build-wave.mjs` ขาด baseRef, command ยังไม่ converge) → ต้อง release sync (`npx @warnyin/agents --update` / release pipeline) เพื่อให้ dogfood ครั้งหน้าไม่เจอ worktree ว่างอีก — **เป็นงาน release ไม่ใช่ SHIP docs**
- **code merge:** build branch `build/improve-performance` → main จัดการนอก workflow (SHIP ไม่ merge โค้ด)
- **executable e2e proof ของ model routing** (harness consume `model` route จริง) → dogfood topic ถัดไป
