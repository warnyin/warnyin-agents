# Ship — context-profiles (session-level posture สำหรับ workflow)

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`

## 1. สรุป topic
- **ทำอะไร:** เพิ่ม **context profiles** = session-level posture 3 โหมด (`research`/`build`/`review`) เป็น `.md` บางใน `src/.warnyin/workflow/contexts/` + README; ผูกเข้า playbook 5 stage ด้วย callout `Context profile` (Discovery→research · DESIGN→research+build · BUILD→build · VERIFY→review · SHIP→review); เพิ่ม `contexts/` ใน workflow README tree
- **ประเภท:** ☑ feature ใหม่ (ตัวแรกใน `docs/features/`) — `.md` ล้วน ไม่แตะ installer/runtime
- **ปิด:** roadmap **P1 #5**
- **ผล VERIFY:** T1–T7 ผ่านครบ **0 รอบแก้** (regression + executable install proof + 3-way consistency)

## 2. เอกสารกลางที่อัปเดต (promote)
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/context-profiles/{feature,business}.md` | **สร้างใหม่** — feature card ตัวแรก: context=session posture vs role=task lens, 3 mode, callout wiring, mapping, คุณค่า/ที่มา ECC |
| `docs/rule.md` §1 (ปรัชญาแก่น) | **2 rule ใหม่:** (1) context ⊥ role คนละชั้น ห้าม duplicate ชี้กลับ playbook · (2) ทุก stage playbook ชี้ context ที่เข้าคู่ (เพิ่ม stage ใหม่ต้องระบุ context) |
| `docs/techstack/installer/structure.md` | เพิ่ม `contexts/` ใน workflow payload tree |
| `docs/techstack/installer/test.md` | **เพิ่ม section** "verify feature ที่เป็น payload `.md` ล้วน" — static + executable install proof + dead-link สองทิศ + 3-way consistency + โครง conformance |
| `docs/codemap/architecture.md` + `index.md` | เพิ่ม `contexts/` เป็น session-posture layer คู่ `roles/` (task-level) |
| `docs/roadmap.md` P1 #5 | ติ๊ก `[x]` DONE + ชี้ feature card + note future (auto-activation) |
| `CHANGELOG.md` `[Unreleased]` | Added: context profiles · Fixed: README layout staleness |
| `src/.warnyin/workflow/README.md` | **แก้ structure tree** → layout จริงหลัง 0.7.0 (`.warnyin/` มุมมอง consumer + `src/` note) — ปิด defer "outer-layout staleness" (Q3 = แก้เลย) |

## 3. note "รอ SHIP" — พิจารณาครบ (ไม่เหลือค้าง)
| note | จาก | ผล |
|---|---|---|
| contexts = session-posture layer คู่ขนาน roles ห้าม duplicate | `tasks/author-contexts/rule.md` §2 | ✅ promote → `docs/rule.md` §1 |
| ทุก stage playbook ชี้ context ที่เข้าคู่ | `tasks/wire-playbooks/rule.md` §2 | ✅ promote → `docs/rule.md` §1 (รวมกับข้อบน) |

## 4. defer — ตัดสินแล้ว
| defer | ตัดสิน |
|---|---|
| root dogfood copy (dogfood feature ทันที) | **ข้าม** — รอ `setup:dogfood` หลัง publish 0.8.0 (gitignored; แนะนำ review payload diff ก่อน execute) |
| README outer-layout staleness | **แก้เลยตอนนี้** (Q3) — fix structure tree ใน `src/.warnyin/workflow/README.md` แล้ว |

## 5. troubleshooting
- ไม่มี entry ใหม่ (docs ล้วน — ไม่มีปัญหายาก/ซ้ำตลอด BUILD/VERIFY)

## 6. Archive
- `docs/stages/context-profiles/` → `docs/stages/achieved/2026-06-07-context-profiles/` (`git mv`, 2026-06-07)

## 7. นอก SHIP (release step)
- version bump `0.7.0 → 0.8.0` (feature ใหม่ user-facing) + merge `build/context-profiles` → main — จัดการนอก workflow
