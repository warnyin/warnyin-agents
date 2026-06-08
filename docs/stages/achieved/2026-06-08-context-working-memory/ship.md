# Ship — context-working-memory

> สรุปการส่งมอบ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`

| | |
|---|---|
| **Slug** | `context-working-memory` |
| **วันที่ ship** | 2026-06-08 |
| **Feature** | **ใหม่** — `context-working-memory` |
| **มาจาก** | discovery umbrella `memory-identity-observability` (Gap A) |
| **Archive** | `docs/stages/achieved/2026-06-08-context-working-memory/` |

## 1. topic นี้ทำอะไร
ทำให้ `docs/stages/context.md` เป็น **working-memory ข้าม topic** ที่ใช้งานได้จริง — เดิมถูกอ่าน 3 ที่ (next/discovery/explore) แต่ไม่มี producer + installer scaffold เป็นไฟล์เปล่า. แก้ด้วย 2 vertical slice:
1. **installer seed skeleton** (seed-if-absent) — template + `ensureScaffold` seed-from-template, ห้ามทับงาน user
2. **SHIP เป็น producer** — append "เพิ่ง ship" + prune N=5 + อัปเดตโฟกัส ตอน archive; readers รู้ว่ามันคือ working-notes (ไม่ใช่ status board)

## 2. Feature ที่ส่งมอบ (ใหม่)
สร้าง `docs/features/context-working-memory/`:
| ไฟล์ | สาระ |
|---|---|
| `feature.md` | context.md = working-memory ข้าม topic (4 section); seed-if-absent + SHIP producer; canonical เดียว |
| `business.md` | คุณค่า: อุดรอยรั่ว success metric "เริ่มจากความรู้ล่าสุด"; เลือก working-notes (ไม่ derive) กัน unify-in-place |
| `spec.md` | 3 Requirement (ADDED) — skeleton scaffolded · SHIP producer · working-notes ไม่ใช่ status board |

**Spec delta:** ทั้งหมด **ADDED** (ไม่มี feature เดิมชื่อนี้) → สร้าง `spec.md` จาก delta ทั้งก้อน; ไม่มี MODIFIED/REMOVED → ไม่มี key ต้อง match (ไม่ STOP)

## 3. learned-rules ที่ promote (user ยืนยันครบ 3)
| # | rule | scope → ปลายทาง | evidence |
|---|---|---|---|
| R1 | scaffold ที่เป็น user working-doc ต้อง seed-from-template + seed-if-absent — ห้ามอยู่ใน CORE/overwrite | `component:installer` → `docs/techstack/installer/rule.md` (ขยายข้อ "ไม่เขียนทับงานจริง") | `cli.mjs` ensureScaffold + test 11/12/14 |
| R2 | working-memory เก็บเฉพาะสิ่งที่ derive ไม่ได้ — status/stage ให้ NEXT derive ไม่จดซ้ำ | `project` → `docs/rule.md` (ขยาย unify-in-place) | grep context.md ทั่ว workflow + ship.md §4.4 + next.md:18/46 |
| S1 | `SCAFFOLD_FILES` object form `{dest, tplRel}` = แยก source ต่อ scaffold file (reuse pattern) | `component:installer` → `docs/techstack/installer/standard.md` | `cli.mjs` `SCAFFOLD_FILES` |

## 4. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ใส่ |
|---|---|
| `docs/features/context-working-memory/{feature,business,spec}.md` | feature ใหม่ (ดู §2) |
| `docs/rule.md` | +R2 (sub-bullet ใต้ unify-in-place) |
| `docs/techstack/installer/rule.md` | +R1 (sub-bullet ใต้ "ไม่เขียนทับงานจริง") |
| `docs/techstack/installer/standard.md` | +S1 (SCAFFOLD_FILES object form) |
| `docs/techstack/installer/structure.md` | ensureScaffold seed-from-template (ไม่เปล่า) · SCAFFOLD_FILES object form · template/stages/context.md · installer.test 9→14 เคส |
| `docs/techstack/installer/test.md` | installer 9→14 เคส (+context.md 10–14) · แก้เลขรวม 26→58 (ตกหล่น validate-topic 27 เคส) · เพิ่ม section validate-topic.test.mjs |
| `docs/codemap/index.md` + `architecture.md` | ensureScaffold seed skeleton · template context.md · file count rescan |
| `docs/stages/context.md` | **dogfood producer** — สร้าง skeleton จาก canonical + append แถว "เพิ่ง ship" + โฟกัส/decision/parking-lot |

## 5. ที่ตัดทิ้ง / ไม่ promote (พร้อมเหตุผล)
- **troubleshooting — ไม่มี entry ใหม่:** บทเรียน emergent ที่เจอตอน BUILD/VERIFY เป็น duplicate ของ KB เดิม — Windows `verify-pack` ENOENT = ซ้ำ #4; VERIFY C1 false-positive (pipe-to-head บัง exit) = ซ้ำ #13 → ไม่เพิ่ม (อ้าง entry เดิมพอ)
- **`docs/project.md` / `docs/infra.md` — ไม่แตะ:** zero-service เหมือนเดิม, ไม่เปลี่ยน scope/เป้าหมาย/env

## 6. dogfood (proof end-to-end)
SHIP รอบนี้ใช้ producer contract ที่ topic เพิ่งสร้าง — `docs/stages/context.md` (เดิมว่าง 0 บรรทัด) ถูก maintain จริง: สร้าง skeleton จาก canonical + append แถว `2026-06-08 | context-working-memory | …` → พิสูจน์ producer ทำงาน end-to-end (task-2 spec §7)

## 7. Gate SHIP §6 — ครบ
- [x] topic ย้ายไป `achieved/2026-06-08-context-working-memory/` (ไม่เหลือใน `docs/stages/`)
- [x] `docs/features/` สะท้อน feature ใหม่
- [x] Spec delta merge แล้ว (ADDED ทั้งก้อน → spec.md ใหม่; ไม่มี MODIFIED/REMOVED ให้ STOP)
- [x] learned-rules (R1/R2/S1) promote ครบ — มี evidence + user ยืนยัน; emergent ที่ตัดมีเหตุผล
- [x] `docs/troubleshooting.md` — พิจารณาแล้ว ไม่มี entry ใหม่ (duplicate #4/#13)
- [x] `docs/techstack/` + `docs/rule.md` อัปเดตตามที่เกี่ยวข้อง; project/infra ไม่แตะ (มีเหตุผล)
- [x] `docs/codemap/` ตรงโค้ดจริง (ensureScaffold + template)
- [x] `ship.md` เขียนครบ
- [ ] user รับทราบผลการส่งมอบ ← รายงานในแชท
