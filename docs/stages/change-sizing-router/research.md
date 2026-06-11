# Research — change-sizing-router

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `change-sizing-router` |
| **วันที่** | 2026-06-10 |

---

## 1. คำถามวิจัย
- [x] RQ1: ระบบมี seed ของ "sizing-by-change" อยู่แล้วแค่ไหน + ต่อยอดที่ไหน
- [x] RQ2: triage ทับซ้อน/ต่างจาก `next.md` อย่างไร (กัน router ซ้ำ)
- [x] RQ3: สัญญาณ (signals) อะไรประเมินขนาด change ได้แบบ heuristic
- [x] RQ4: fast-track ลด ceremony ตรงไหนได้บ้างโดยไม่ลด correctness

## 3. Findings

### RQ1: seed ที่มี + จุดต่อยอด
- **พบ:** `design.md §7` มี 2 ระดับ (เล็ก/กลาง-ใหญ่) + business.md/Discovery/panel เป็น optional — แต่เป็น manual, ประเมินใน DESIGN
- **หลักฐาน:** `src/.warnyin/workflow/stages/design.md:15,52,106-109` ; `discovery.md:14` (optional skip)
- **นัย:** reframe §7 (2→3 tier) + ยกการประเมินมา **ก่อน** DESIGN (triage) = ไม่จ่าย ceremony ก่อนรู้ขนาด

### RQ2: triage vs next
- **พบ:** `next.md` route ตาม **stage ที่ topic ค้าง** (artifact ล่าสุด → command ถัดไป) — input คือ topic ที่มีอยู่; triage route ตาม **ขนาดของ request ใหม่** — input คือคำอธิบาย change
- **หลักฐาน:** `src/.warnyin/workflow/next.md:24-26,40,48` (ตาราง stage→command, "แนะนำแล้วหยุด")
- **นัย:** คนละแกน ไม่ทับซ้อน — แต่ pattern เดียวกัน (read-only, แนะนำแล้วหยุด ไม่รันเอง) → triage ยืม pattern ของ next; อาจให้ triage ชี้ต่อ `design`/`discovery`/`next`

### RQ3: signals ประเมินขนาด (heuristic, judgment ⚠ ไม่ใช่ ✖)
- **พบ (จากบทเรียน build-orchestration + rule.md):** สัญญาณที่ประเมินได้: **#ไฟล์/#component ที่แตะ · new-vs-modify · greenfield · cross-cutting (auth/data/migration/secret/public-API/contract) · dep ใหม่ · มี UI/ผู้ใช้กระทบไหม**
- **หลักฐาน:** `docs/rule.md §1` DAG-width (วัด depth/width ก่อนแตก task = สัญญาณ scope), §3 Security baseline (พื้นที่อ่อนไหว)
- **นัย:** cross-cutting/sensitive = **hard-floor** (บังคับ ≥ standard); ส่วน #ไฟล์/new-vs-modify = สัญญาณ tier ปกติ

### RQ4: ceremony ที่ fast-track ข้ามได้ (correctness-safe)
- **พบ:** ceremony ที่ "ข้ามได้เมื่อเล็ก" = business.md, proposal/design แบบยาว, **review panel** (DESIGN §4 step), **dry-run**, แตกหลาย task; ส่วนที่ **ห้ามข้าม** = test เขียว (BUILD full-gate floor), spec/acceptance ขั้นต่ำ
- **หลักฐาน:** `design.md:52,83` (business optional), `design.md:56` (panel), achieved improve-performance (panel+dry-run = ceremony หนัก) ; `build.md` Gate §7 (test floor blocking)
- **นัย:** fast tier = ข้าม panel/dry-run/business + 1 task + cheap tier + verify/ship-lite; คง test-green + hard-floor

## 4. Code inspection
| ไฟล์ | พบ | นัย |
|---|---|---|
| `stages/design.md §7` | 2-level sizing (manual) | reframe → 3-tier + skip-list ต่อ stage |
| `next.md` | router by stage (read-only, แนะนำแล้วหยุด) | triage ยืม pattern, คนละแกน input |
| `rule.md §1/§3` | DAG-width signals + security baseline | signals + hard-floor list |
| feature `build-orchestration` | model tier + DAG width per task | fast → cheap tier + width 1 |

## 5. ทางเลือกจุดประเมิน (ตัดสินแล้ว Q3)
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| ขยาย `next` | unify, ไม่เพิ่ม command | next มี input คนละแกน (topic vs request) | ✗ |
| **command `/warnyin:triage`** | surface ชัด, input = change ตรง | +1 command | ✅ (Q3) |
| ใน DESIGN | ไม่เพิ่ม command | จ่ายค่าเข้า DESIGN ก่อน = ไม่ fast จริง | ✗ |

## 6. unknown ที่เหลือ (→ DESIGN)
- รูปแบบ rubric ที่ deterministic พอ (signals → tier) แต่ยัง judgment — เคาะ threshold ตอน DESIGN
- triage ชี้ต่อ command ไหนแน่ (design/discovery/next) — เคาะ wiring ตอน DESIGN

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำ:** ทำ `/warnyin:triage` (read-only) + playbook `triage.md` (rubric 3-tier + signals + hard-floor + escalation) + reframe `design.md §7` 3-tier skip-list; ผูก build-orchestration (fast→cheap/width-1); empirical bugfix demo
- ป้อนกลับ discovery: Q1-Q6 ปิดครบ
