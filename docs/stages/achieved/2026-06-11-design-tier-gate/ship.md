# Ship — design-tier-gate (ship-lite)

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> **fast-track → ship-lite:** promote เฉพาะที่มี, archive ครบ; correctness floor — ไม่แตะ rule กลางมั่ว

## 1. สรุป topic
- **ทำอะไร:** เพิ่ม **establish-tier step (sizing gate)** ใน DESIGN — `design.md §4 step 1.5`: ประเมิน tier ก่อนจ่าย ceremony (มั่นใจ→กำหนด / ไม่มั่นใจ→ถาม user options [triage / กำหนดเอง] / hard-floor ≥ standard) + §7 tie + proposal vocab `fast/standard/large`. **อุดช่องว่าง:** DESIGN เคย consume tier แต่ไม่มีตัวการันตีว่า established (เกิดจริงตอน `global-install` ข้าม triage)
- **flow:** triage(fast) → design(fast-track) → build(1 agent) → verify-lite → ship-lite — **fast-track ครบวงจรครั้งแรก**
- **ประเภท:** ☑ **ปรับปรุง feature เดิม** → `docs/features/change-sizing/` (enforcement)

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระ |
|---|---|
| `docs/features/change-sizing/spec.md` | **ADDED 1 Requirement** — "DESIGN establish tier ก่อนเดินต่อ (sizing gate)" + 3 scenario (establish-tier step / §7 ชี้ที่มา / proposal vocab); ไม่มี MODIFIED/REMOVED → ไม่มีเคส key-not-found |
| `docs/features/change-sizing/feature.md` | เพิ่มองค์ประกอบ #5 "DESIGN sizing gate" (enforcement) |
| **ไม่แตะ** | techstack rule/standard/structure (playbook wording ไม่ใช่ cli code) · infra · codemap (ไม่มีโครงสร้างโค้ดเปลี่ยน) · troubleshooting (export-workaround = ซ้ำ #20) · `docs/rule.md` (ไม่มี project rule ใหม่) |

## 3. Learned rules
| rule | evidence | scope | promote? |
|---|---|---|---|
| — | — | — | **ไม่มี** — establish-tier = enforcement ของ rule `change-sizing` ที่มีอยู่แล้ว (`tasks/*/rule.md §2` ว่าง); ไม่มี emergent ใหม่ (export-workaround ซ้ำ troubleshooting #20) |

## 4. Archive
- ย้ายจาก `docs/stages/design-tier-gate/` → `docs/stages/achieved/2026-06-11-design-tier-gate/` เมื่อ 2026-06-11 (git mv)

## 5. หมายเหตุ (นอก workflow)
- **โค้ดจริงอยู่ build branch `build/design-tier-gate`** — merge → main + release (เป็น patch/minor ของ playbook; รวมกับรอบถัดไปก็ได้ — payload ติดมากับ `--update`)
- bonus: ระหว่าง DESIGN เจอ+แก้ defect ที่ shipped แล้ว — `global-install/spec.md` scenario ขาด `WHEN` (validate C5) — commit แยกบน build branch
