# Ship — adaptive-api-doc

> สรุปการส่งมอบ · playbook: `.warnyin/workflow/stages/ship.md` · ship date 2026-06-09

## สิ่งที่ส่งมอบ
capability กลาง **adaptive API documentation (OpenAPI 3.1)** — stage auto-detect topic แตะ REST API → ผลิต/verify/promote contract อัตโนมัติ ตลอด DESIGN→VERIFY→SHIP (implement ใน `src/`, retrofit ผ่าน workflow)

## Feature
- **ใหม่:** `docs/features/api-doc/` — `feature.md` + `business.md` + `spec.md` (7 requirement จาก design §9 ADDED, observable artifact)

## เอกสารกลางที่อัปเดต

| ไฟล์ | สาระที่ merge |
|---|---|
| `docs/features/api-doc/{feature,business,spec}.md` | feature ใหม่ — capability, 3 mode, per-stage, 7 requirement spec |
| `docs/rule.md` §1 | learned-rule **"stage-invoked capability convention"** (project scope — promote, user ยืนยัน) |
| `docs/infra.md` §"Environment อื่น" | เครื่องมือ API-doc = optional ของโปรเจกต์ปลายทาง คง zero-dep (defer จาก Infra panel S1) |
| `docs/codemap/index.md` | entry point `api-doc.md` + header rescan 2026-06-09 |
| `docs/codemap/architecture.md` | 5-stage flow + capability เสริม conditional + header rescan |

## learned-rule (พิจารณาครบ)
| rule | scope | ผล |
|---|---|---|
| stage-invoked capability convention | `project` → `docs/rule.md` §1 | ✅ promote (evidence: api-doc.md §2 + gate conditional 3 stage; user ยืนยัน) |

> ไม่มี learned-rule scope `component:installer`; ไม่มี troubleshooting entry (0 รอบแก้ตอน VERIFY)

## payload ที่เปลี่ยน (src/ — ส่งถึงผู้ใช้ผ่าน `--update` รอบถัดไป)
- สร้าง: `src/.warnyin/workflow/api-doc.md`
- hook: `src/.warnyin/workflow/stages/{design,verify,ship}.md`
- adapter: `src/.warnyin/workflow/roles/README.md` · `src/.warnyin/workflow/README.md`
- `CHANGELOG.md` (`[Unreleased]` → Added)

## archive
`docs/stages/adaptive-api-doc/` → `docs/stages/achieved/2026-06-09-adaptive-api-doc/` (build/design/proposal/test/verify/tasks + ship.md)

## หมายเหตุ
- **code merge (build branch → main) จัดการนอก workflow** — SHIP นี้แค่เอกสาร + archive
- CHANGELOG entry อยู่ `[Unreleased]` — bump version ตอน release commit แยก (ตาม flow repo)
