# Ship — feedback-issue-command

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ — เขียนหลังย้าย topic เข้า `docs/stages/achieved/2026-06-12-feedback-issue-command/` แล้ว

## 1. สรุป topic
- **ทำอะไร:** เพิ่ม command `/warnyin:feedback:issue` (action-utility) ให้ผู้ใช้ปลายทางเปิด GitHub issue ที่ `warnyin/warnyin-agents` (hardcode) แจ้ง ปรับปรุง/ปัญหา/feature ใหม่ — playbook กลาง `feedback.md` (single source: flow 3 ประเภท + detect ladder gh→auth→fallback URL + confirm gate บังคับ + privacy) + command adapter บาง (nested namespace แรก `warnyin/feedback/`) + registry 3 จุด. tier standard, 2 task ขนาน (contract-first decouple), build/verify ผ่าน 0 รอบแก้
- **ประเภท:** ☑ **feature ใหม่** → `docs/features/feedback-issue/`

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/feedback-issue/` (ใหม่) | `feature.md` + `business.md` — capability/persona/scope/ข้อจำกัด |
| `docs/features/feedback-issue/spec.md` (ใหม่) | สร้างจาก Spec delta ADDED ทั้งก้อน (design §9) — 3 Requirement (เปิด issue + confirm/privacy + detect ladder), 7 scenario observable |
| `docs/rule.md §1` | **LR1** — action-utility command = confirm ก่อน outward-facing side-effect (project scope) |
| `docs/techstack/installer/rule.md` §packaging | **LR2** — registry-target ของ root dogfood file = installer template (เช็ค `git check-ignore` ก่อนแก้) |
| `docs/techstack/installer/standard.md` | **LR3** — nested command namespace = subfolder (copyTree recursive รองรับ; mkdir ก่อน Write) |
| `docs/techstack/installer/test.md` | section ใหม่ "verify action-utility command (outward side-effect)" — install proof + observable behavior + no-real-side-effect |
| `docs/troubleshooting.md` #22 | TS-1 — registry แก้ root CLAUDE.md → ไม่ติด commit (gitignored dogfood; canonical = installer template); อ้าง #18 |
| `docs/codemap/index.md` | เพิ่ม `feedback.md` capability + `feedback/issue.md` nested command adapter |

> **ไม่อัปเดต:** `docs/project.md` (scope "slash command + utility skill" generic ครอบแล้ว) · `docs/infra.md` (ไม่มี env/service ใหม่) · `docs/techstack/installer/structure.md` (โครงไฟล์ระดับ command ไม่เปลี่ยน — codemap ครอบ) · `openapi.yaml` (ไม่แตะ REST API)

## 3. Learned rules (planned + emergent)
| rule (generalize) | evidence (pointer + artifact) | scope | promote? |
|---|---|---|---|
| LR1: action-utility command ที่มี outward-facing/irreversible side-effect ต้อง confirm ก่อน execute + คงเป็น command user-only + ไม่ดึง session context อัตโนมัติ | `tasks/feedback-playbook-command/rule.md §2` + `feedback.md §5` + design D5 | project → `docs/rule.md` | ✅ promote |
| LR2: registry-target ของ root dogfood file (`CLAUDE.md`/`AGENTS.md`) = `src/.warnyin/installer/templates/` — เช็ค `git check-ignore` ก่อนแก้ | TS-1 + `build.md §3` + commit f1c0e70 (agent แก้ root → ไม่ติด) | component:installer → `techstack/installer/rule.md` | ✅ promote |
| LR3: nested command namespace `warnyin/<group>/<cmd>` = subfolder; copyTree recursive รองรับ; mkdir ก่อน Write | `tasks/feedback-playbook-command/rule.md §2` + design §6 + verify-pack 83 ไฟล์ | component:installer → `techstack/installer/standard.md` | ✅ promote |
| TS-2: nested namespace mkdir ก่อน Write (incident) | `troubleshooting.md TS-2` | component:installer | ✂️ fold เข้า LR3 (ไม่แยก KB entry — เป็น incident เล็ก, ใส่เป็นเงื่อนไขใน LR3 แล้ว) |

## 4. Archive
- ย้ายจาก `docs/stages/feedback-issue-command/` → `docs/stages/achieved/2026-06-12-feedback-issue-command/` เมื่อ 2026-06-12 (git mv)

## 5. หมายเหตุการส่งมอบ
- **โค้ด/payload อยู่บน build branch `build/feedback-issue-command`** — merge → main จัดการนอก workflow (SHIP = เอกสาร + archive เท่านั้น)
- **dogfood root ยังไม่มี feedback command** — `src/` canonical พร้อมแล้ว; root sync ตอน release ถัดไป (`npm run setup:dogfood`) — sandbox install proof (verify T4) ยืนยัน flow ติดตั้งถูกต้อง
- regression: `npm test` 69/69 · `lint:md` 0 dead · `verify:pack` 83 ไฟล์ (หลัง promote ยังเขียว)
