# Ship — Ponytail Minimalism

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ topic `ponytail-minimalism` (achieved 2026-06-15)

## 1. topic นี้ทำอะไร
ฝังปรัชญา "lazy senior dev" จาก `ponytail` เป็น **principle กลาง native** ของ Warnyin workflow — สร้างไฟล์แกน `src/.warnyin/workflow/minimalism.md` (decision hierarchy 6 ขั้น + guardrail "lazy not negligent") + pointer 6 surface (ผลิต/ตรวจ) + register · always-on zero-config · zero-dependency

## 2. Feature
- 🆕 **ใหม่:** `docs/features/minimalism/` (`feature.md` + `business.md` + `spec.md`)
- Spec delta: ADDED 6 Requirement / 10 Scenario (single-source / pointer ผลิต / over-engineering lens / guardrail / tool-agnostic / ship-integrity+always-on) — สร้าง `spec.md` จาก ADDED ทั้งก้อน (feature ใหม่ ไม่มี key conflict)

## 3. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ใส่ |
|---|---|
| `docs/features/minimalism/feature.md` | feature ถาวร: คืออะไร/ทำงานยังไง/ขอบเขต/ไฟล์เกี่ยวข้อง |
| `docs/features/minimalism/business.md` | goal/คุณค่า/persona/success metric/ที่มา (ponytail) |
| `docs/features/minimalism/spec.md` | living behavior spec (7 Requirement, observable artifact) |
| `docs/rule.md §1` | + **LR1 minimalism-principle convention** (project scope) — hierarchy+guardrail single-source, pointer canonical-copy, always-on zero-config, ไม่ใช่ context ที่ 4, guidance ไม่ใช่ gate |
| `docs/codemap/index.md` | + บรรทัด `minimalism.md` (กลุ่ม workflow capability/principle docs) → ref feature |
| `docs/techstack/installer/test.md` | + **LR2** note สั้นใน section "verify payload `.md` ล้วน": principle/cross-cutting single-source verify (grep full block=1 + arrow-summary identical + install-proof) |

## 4. Learned-rules (พิจารณาครบ)
| # | rule | scope | ผล |
|---|---|---|---|
| LR1 | minimalism-principle convention | project | ✅ promote → `docs/rule.md §1` |
| LR2 | principle/cross-cutting single-source verify technique | component:installer | ✅ promote → `installer/test.md` (note สั้น ไม่เพิ่ม section) |
| — | TS-1 verify:pack ENOENT Windows | — | ✂️ ตัด — ซ้ำ KB กลาง `docs/troubleshooting.md #4` (ไม่ duplicate) |

## 5. ที่ไม่แตะ (พร้อมเหตุผล)
- `docs/troubleshooting.md` — TS-1 ซ้ำ #4 เดิม
- `docs/infra.md` / `docs/project.md` — ไม่มี env/scope ใหม่
- `docs/techstack/installer/structure.md` — ไม่ได้ list top-level workflow docs (ไม่ต้องเพิ่ม)
- **build branch → main** — นอก scope SHIP (จัดการนอก workflow); CHANGELOG entry อยู่ใน [Unreleased] รอ release

## 6. Archive
- `docs/stages/ponytail-minimalism/` → `docs/stages/achieved/2026-06-15-ponytail-minimalism/` (git mv ครบทุกไฟล์)

## 7. หมายเหตุ
- root dogfood ยังไม่มี `minimalism.md` จนกว่า publish release ถัดไป (canonical = `src/`; mirror ตอน release sync) — install-proof ผ่าน `setup:sandbox` ยืนยัน payload ใหม่ ship ถูกต้องแล้ว
