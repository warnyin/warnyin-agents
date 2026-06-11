# Ship — discovery-mode-selector

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ — เขียนหลังย้าย topic เข้า `docs/stages/achieved/2026-06-11-discovery-mode-selector/` แล้ว

## 1. สรุป topic
- **ทำอะไร:** เพิ่ม capability **Discovery modes** ให้ `/warnyin:discovery` เลือก **mode 5 ค่า** คุมความเข้มของ Discovery (`ไว/สมดุล/ละเอียด/โต้วาที/ไต่สวน`) — เป็นแกนใหม่ระดับ stage orthogonal กับ tier (`change-sizing`) และ context-profile; canonical ที่ playbook `discovery.md §3.5` เดียว, command ชี้มา. รวม auto-suggest (precedence: hard-floor floor=สมดุล), grill fold→`ละเอียด`, multi-agent 2 แบบ: `โต้วาที` (fan-out persona ครั้งเดียว→สังเคราะห์) + `ไต่สวน` (Blue/Red adversarial iterative + memory `debate/` + grill ทุก finding + user-in-loop จน converge). ทำ Agent-tool call ใน playbook (ไม่ใช่ Workflow script — เลี่ยง top-level export)
- **flow:** Discovery → DESIGN (panel 5 มุม, QA 2 blocker แก้ครบ, dry-run 0 blocker) → BUILD (wave width 2, full-gate 66/66) → VERIFY (10 เทส 0 รอบแก้) → **amend** (user ขอ mode 5 ไต่สวน → re-design → re-build wave 2 → re-verify V1-V5 0 รอบแก้)
- **ประเภท:** ☑ **feature ใหม่** → `docs/features/discovery-modes/`

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/discovery-modes/feature.md` | **สร้างใหม่** — capability: 6 องค์ประกอบ (taxonomy/auto-suggest/observable/โต้วาที/ไต่สวน/command), flow, ขอบเขต (orthogonal, explicit-only ไต่สวน, canonical), ไฟล์ |
| `docs/features/discovery-modes/business.md` | **สร้างใหม่** — เป้าหมาย/persona/success metric/scope/ความเสี่ยง จาก business+proposal ของ topic |
| `docs/features/discovery-modes/spec.md` | **สร้างใหม่** จาก Spec delta `design.md §9` (6 Requirement ADDED ทั้งหมด: taxonomy 5 · 3-axis orthogonal · auto-suggest precedence · grill alias · โต้วาที · ไต่สวน · command adapter; ไม่มี MODIFIED/REMOVED → ไม่มีเคส key-not-found) |
| `docs/rule.md §1` | **LR1** — "Discovery mode = stage-intensity axis (orthogonal กับ tier/context-profile)": 5 mode opinionated · auto-suggest assess→recommend→ยืนยัน · multi-agent "Parallelize gathering, serialize judgment" + fallback · canonical playbook เดียว |
| `docs/techstack/installer/test.md` | เพิ่ม §"verify Discovery modes / playbook behavior-dial" — observable proxy ต่อ mode + auto-suggest fixture + 3-way anchor + no-duplicate (แยก alias/behavior) + grill regression + multi-agent fallback structural + install proof + generic boundary |
| `docs/codemap/index.md` | เพิ่ม entry capability "Discovery modes" (§3.5) + update Generated header |
| **ไม่แตะ** | `structure.md` (ไม่เปลี่ยนรูปโครง — เพิ่ม section ใน playbook เดิม + keyword ใน command เดิม) · `standard.md` · `infra`/`project` (ไม่มี env/service ใหม่) · `troubleshooting` (build-wave export = ซ้ำ #20) · `codemap/architecture.md` (discovery.md อยู่ใน stage flow เดิม ไม่เปลี่ยน) |

## 3. Learned rules (planned + emergent)
| rule (generalize) | evidence (pointer + artifact) | scope | promote? |
|---|---|---|---|
| **Discovery mode = stage-intensity axis (orthogonal กับ tier/context-profile)** — mode คุมความเข้ม stage · 5 opinionated · auto-suggest precedence (hard-floor floor=สมดุล) · multi-agent gather-parallel/judge-serial + fallback · canonical playbook เดียว | `discovery.md §3.5` (3-axis/auto-suggest/debate/ไต่สวน) + `verify.md` V1-V5 ผ่าน | `project` → `docs/rule.md §1` | ✅ promote (LR1, user ยืนยัน) |
| multi-agent debate = "Parallelize gathering, serialize judgment" + fallback | `§3.5.5/§3.5.7` | `project` | ✂️ **ตัด** — ซ้ำ `docs/rule.md §1` (มีจาก `build-orchestration` แล้ว); LR1 อ้างหลักการนี้ reuse ได้ (user ยืนยันตัด) |
| build-wave export stale (root dogfood) → รัน Workflow ด้วย `src/` version | `build.md §4` (เจอตอน wave 1) | `component:installer` | ✂️ **ตัด** — ซ้ำ `troubleshooting.md #20` + `installer/rule.md §build orchestration` (KB มีแล้ว ไม่ promote ซ้ำ) |

## 4. Archive
- ย้ายจาก `docs/stages/discovery-mode-selector/` → `docs/stages/achieved/2026-06-11-discovery-mode-selector/` เมื่อ 2026-06-11 (git mv)

## 5. หมายเหตุ (นอก workflow)
- **โค้ดจริงอยู่ build branch `build/discovery-mode-selector`** — SHIP จัดการเอกสาร+archive เท่านั้น; merge build branch → main (+ release sync src→root dogfood ด้วย `setup:dogfood`) จัดการนอก workflow. ก่อน sync นั้น `discovery.md §3.5` + mode keyword ใช้งานได้ผ่าน sandbox install (verify ผ่านแล้ว); root dogfood `build-wave.mjs` ยัง stale (top-level export) จน release — รัน Workflow ใช้ `src/` version
- **defer:** full spawn-real proof ของ debate/ไต่สวน = optional (verify ทำ structural แล้ว) — พิสูจน์ตอนใช้งานจริงรอบแรก
