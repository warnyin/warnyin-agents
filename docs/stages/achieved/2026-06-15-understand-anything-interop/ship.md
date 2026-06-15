# Ship — Understand-Anything Interop

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ topic `understand-anything-interop` (achieved 2026-06-15)

## 1. topic นี้ทำอะไร
ฝัง interoperation ให้ warnyin playbook **ชี้ไปใช้ Understand-Anything (UA)** เป็น companion tool — ไฟล์แกน `interop.md` (companion-tool consult-if-present convention + inclusion bar 4 ข้อ + **trust-boundary guard B1** + UA entry) + pointer conditional 6 touchpoint comprehension · reference-not-vendor · tool-agnostic (trigger=path) · zero-dep · backward-compatible

## 2. Feature
- 🆕 **ใหม่:** `docs/features/interop/` (feature.md + business.md + spec.md)
- Spec delta: ADDED 4 Requirement / 10 Scenario — สร้าง spec.md จาก ADDED ทั้งก้อน (feature ใหม่ ไม่มี key conflict)

## 3. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระ |
|---|---|
| `docs/features/interop/{feature,business,spec}.md` | feature ถาวร + living spec |
| `docs/rule.md §1` | + **LR1 interop/companion-tool convention** (project) — conditional consult + trust-boundary guard + reference-not-vendor + inclusion bar + tool-agnostic, stage-invoked capability |
| `docs/troubleshooting.md #12` | + **LR2** facet "double-backtick gap" (extend ไม่สร้าง entry ใหม่ — unify-in-place) |
| `docs/codemap/index.md` | + `interop.md` (กลุ่ม workflow capability docs) |
| `docs/techstack/installer/test.md` | + **LR3** verify-technique "consult-external-artifact → trust-boundary adversarial sim" (note สั้น) |

## 4. Learned-rules (พิจารณาครบ)
| # | rule | scope | ผล |
|---|---|---|---|
| LR1 | interop/companion-tool convention | project | ✅ → `docs/rule.md §1` |
| LR2 | lint-md double-backtick gap (เจอซ้ำ 2 ครั้ง) | component:installer | ✅ → extend `docs/troubleshooting.md #12` |
| LR3 | consult-external-artifact trust-boundary adversarial sim (verify-technique) | component:installer | ✅ → `installer/test.md` (note สั้น) |
| — | verify:pack ENOENT Windows | — | ✂️ ตัด — ซ้ำ KB #4 |
| — | 2 test แดง isEntrypoint Windows | — | ✂️ ตัด — pre-existing ไม่เกี่ยวกับ change |

## 5. ที่ไม่แตะ (พร้อมเหตุผล)
- `docs/infra.md` / `docs/project.md` / `docs/techstack/installer/structure.md` — ไม่มีข้อมูลเกี่ยว
- **build branch → main + release** — นอก scope SHIP (จัดการแยก); CHANGELOG entry อยู่ใน [Unreleased] รอ release

## 6. Archive
- `docs/stages/understand-anything-interop/` → `docs/stages/achieved/2026-06-15-understand-anything-interop/` (git mv)

## 7. หมายเหตุ
- **highlight:** trust-boundary guard B1 มาจาก **DESIGN security panel** (จับ prompt-injection surface) → ผ่าน **adversarial sim จริง** ตอน VERIFY (fake malicious graph → guard ignore instruction) — แสดงคุณค่าของ review panel + security-aware verify
- root dogfood ได้ `interop.md` หลัง publish release ถัดไป (canonical = `src/`); install proof ผ่าน setup:sandbox ยืนยันแล้ว
