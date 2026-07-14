# Ship Report — feature fastlane (`/warnyin:fastlane`)

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> ส่งมอบ 2026-07-14 · tier `standard` (ship เต็ม)

| | |
|---|---|
| **Slug** | `fastlane` |
| **Archive** | `docs/stages/achieved/2026-07-14-fastlane/` |
| **Feature** | ใหม่: `docs/features/fastlane/` · ปรับปรุง: `docs/features/change-sizing/` |
| **user อนุมัติ promotion** | ✅ (learned-rules R1-R4 ครบทั้ง 4) |

## 1. Feature
- **ใหม่ `docs/features/fastlane/`** — `feature.md` + `business.md` + `spec.md` (spec จาก 3 ADDED requirement ใน design §9: executor one-shot · pre-flight hard-floor gate+acceptance · gate ปิดงาน test+acceptance+cap 3 รอบ)
- **ปรับปรุง `docs/features/change-sizing/`** — merge Spec delta 2 MODIFIED เข้า `spec.md` (read-modify-verify: key ทั้ง 2 เจอจริง บรรทัด 27/41):
  - req "Hard-floor บังคับ ≥ standard" → เพิ่ม **explicit user override** + scenario ใหม่
  - req "Fast-track ลด ceremony" → เพิ่ม **executor 2 ทาง** + scenario ใหม่
  - `feature.md` (row #4 hard-floor + บรรทัด "one-shot executor มีแล้วแบบมี guard") + `business.md` (out-of-scope) — ถอน "ไม่เพิ่ม one-shot/auto-execution" (กลับ decision เดิม)

## 2. เอกสารกลางที่อัปเดต (ไฟล์ → สาระ)
| ไฟล์ | สาระ |
|---|---|
| `docs/rule.md` §1 | bullet change-sizing #2 — hard-floor "บังคับ ≥ standard เสมอ" → "เป็นค่าตั้งต้น" + explicit user override |
| `docs/rule.md` §2 | **R1 executor-playbook convention** · **R2 anchor-immutability** · **R3 contract-as-copy-source** |
| `docs/rule.md` §5 | **R4 structural single-source/anchor check = node negative-grep ใน suite** (ไม่ใช่ shell grep -rl) — _placement note: proposal เดิมเสนอ `installer/rule.md` แต่ย้ายมา §5 Testing rules (project-wide) เพราะ convention ข้าม component + อยู่ข้าง sibling testing rules เดิม; เนื้อ rule ตามที่ user อนุมัติ_ |
| `docs/troubleshooting.md` #29 | TS-1 — test fixture drive-letter mismatch แดงเฉพาะ Windows (round-trip แก้) |
| `docs/techstack/installer/test.md` | suite count 135→149 · installer.test 33→35 · เพิ่ม block `fastlane.test.mjs` (14 เคส) · section "verify executor playbook / one-shot fast lane" (V1-V7 strategy) |
| `docs/codemap/index.md` | capability `fastlane.md` + command adapter + header rescan |
| `docs/codemap/architecture.md` | flow fast-track (ผู้เดิน 2 ทาง) + capability list |

## 3. Learned-rules (planned + emergent) — พิจารณาครบทุกตัว
| # | Rule | Scope → ปลายทาง | Evidence | ผล |
|---|---|---|---|---|
| R1 | executor-playbook convention | project → `docs/rule.md §2` | `fastlane.md §3` + test B2/B3 | ✅ promote |
| R2 | anchor-immutability | project → `docs/rule.md §2` | `#fast-track-skip-list` 5 ไฟล์ + test C1 | ✅ promote |
| R3 | contract-as-copy-source | project → `docs/rule.md §2` | wave 1 ขนานจริง + design §4 C1-C18 | ✅ promote |
| R4 | node negative-grep test convention | project → `docs/rule.md §5` | `fastlane.test.mjs` B1-C1 | ✅ promote (placement: §5 แทน installer/rule.md — ดู §2 note) |
| — | doc-consistency (rule.md:26 + change-sizing feature/business) | บังคับ (payload ขัดถ้าไม่แก้) | design §9 "นอก spec" | ✅ ทำใน §1-§2 |

_ตัดทิ้ง: ไม่มี — ทุก candidate มี evidence + user ยืนยัน_

## 4. Backlog / infra / project
- `backlog.md` ของ topic: ไม่มี → N/A (ไม่ต้อง promote เข้า `docs/backlog.md`)
- `docs/infra.md` / `docs/project.md`: ไม่กระทบ (ไม่มี service/env ใหม่)
- `openapi.yaml`: ไม่มี (ไม่แตะ REST API) → N/A

## 5. Gate
- [x] archive → `docs/stages/achieved/2026-07-14-fastlane/` (ไม่เหลือใน `docs/stages/`)
- [x] `docs/features/` สะท้อน feature ใหม่ + ปรับปรุง
- [x] Spec delta merge — 2 MODIFIED match key จริง (read-modify-verify ผ่าน ไม่มี STOP)
- [x] learned-rules ครบทุกตัว (evidence + user ยืนยัน)
- [x] `docs/troubleshooting.md` รวม entry #29
- [x] backlog N/A (topic ไม่มี)
- [x] `docs/techstack/` + `docs/rule.md` + codemap อัปเดต
- [x] `ship.md` เขียนครบ
