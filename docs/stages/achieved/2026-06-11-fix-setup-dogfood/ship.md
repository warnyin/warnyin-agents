# Ship — fix-setup-dogfood

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ — เขียนหลังย้าย topic เข้า `docs/stages/achieved/2026-06-11-fix-setup-dogfood/` แล้ว

## 1. สรุป topic
- **ทำอะไร:** แก้ `src/scripts/setup-dogfood.mjs` 2 root cause ที่ทำให้ sync root dogfood ไม่สำเร็จ — (1) เพิ่ม `--update` (npx + node paths) → cli `copyTree({overwrite:true})` เขียนทับ CORE เดิม; (2) เพิ่ม `verifyInstalled(root)` เช็ค side-effect (root CORE markers) → success-detection ไม่เชื่อ `exit 0` อย่างเดียว (จับ false-green เมื่อ npx exit 0 แต่ไม่ install) → fallback `installViaPack`; ทำ testable (export + main-guard) + unit 3 เคส (false/true/**partial→false**) + CHANGELOG. เจอจริงตอน release 0.15.0 ของ topic `discovery-mode-selector`
- **flow:** investigate root cause (โค้ดจริง) → DESIGN (skip panel, dry-run 0 blocker) → BUILD (1 task, full-gate 69/69) → VERIFY (V1-V6, 0 รอบแก้)
- **ประเภท:** ☑ **bugfix (dev-tooling)** — ไม่มี feature ใหม่/ไม่แตะ feature behavior (spec delta = ไม่มี delta)

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/techstack/installer/rule.md` §dev tooling | **LR1** (unify-in-place ขยาย "ห้าม false-green") — verify side-effect ไม่เชื่อ exit 0 + ส่ง flag ตรงเจตนา (`--update`); `verifyInstalled` export+main-guard testable |
| `docs/troubleshooting.md` #21 | setup:dogfood false-green (npx exit 0 ไม่ install / ข้าม CORE) + root cause + fix + ✅ FIXED |
| `docs/techstack/installer/test.md` | §"verify dev-tooling install script" — unit `verifyInstalled` (3 เคส, partial=guard) + structural + executable defer |
| `docs/techstack/installer/structure.md` | +`setup-dogfood.test.mjs` (test tree) + `verifyInstalled(root)` (detail) + setup-dogfood `--update`/verify note |
| `docs/codemap/index.md` | setup-dogfood +`verifyInstalled` side-effect + Generated header |
| **ไม่แตะ** | `docs/features/` (ไม่มี feature — bugfix) · `docs/rule.md` global (rule = component:installer ไม่ใช่ project) · `standard.md` (ไม่เพิ่ม pattern ใหม่ — ใช้ BL-4 เดิม) · infra · project |

## 3. Learned rules (planned + emergent)
| rule (generalize) | evidence (pointer + artifact) | scope | promote? |
|---|---|---|---|
| **dev-tooling spawn external install ต้อง verify side-effect ไม่เชื่อ exit 0 + ส่ง flag ตรงเจตนา (`--update`)** — exit 0 เกิดได้โดยไม่ install จริง → false-green แม้มี fallback; `verifyInstalled` export+main-guard testable (เคส partial→false = guard) | `troubleshooting.md #21` + `setup-dogfood.mjs` diff + verify V1-V6 | `component:installer` → `installer/rule.md §dev tooling` | ✅ promote (LR1, unify-in-place — user ยืนยัน) |

## 4. Archive
- ย้ายจาก `docs/stages/fix-setup-dogfood/` → `docs/stages/achieved/2026-06-11-fix-setup-dogfood/` เมื่อ 2026-06-11 (git mv)

## 5. หมายเหตุ (นอก workflow)
- **โค้ดจริงอยู่ build branch `build/fix-setup-dogfood`** — merge → main + release sync จัดการนอก workflow. ครั้งนี้ `setup:dogfood` ที่ fix แล้วจะใช้ได้เต็มหลัง release ถัดไป (ก่อนหน้า ยังต้อง manual mirror หากต้อง sync ก่อน publish)
- **defer:** executable integration (รัน `setup:dogfood` จริง → root CORE = release) = manual proof ตอน release ถัดไป — unit + structural ครอบ logic แล้ว
