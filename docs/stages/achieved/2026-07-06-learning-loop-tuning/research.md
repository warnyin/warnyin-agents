# Research — Learning Loop Tuning

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> ที่เก็บ "ข้อมูลที่ค้นมา + หลักฐาน" สนับสนุนการตัดสินใจใน `discovery.md`

| | |
|---|---|
| **Slug** | `learning-loop-tuning` |
| **วันที่** | `2026-07-05` |

---

## 1. คำถามวิจัย (research questions)
- [x] RQ1: paper มี insight/claim อะไรที่ falsifiable พอจะ codify เป็น heuristic ได้
- [x] RQ2: warnyin มี learning loop จริงตรงไหน + fix-loop ของ build กับ verify ต่างกันยังไง
- [x] RQ3: house style ของ warnyin ในการทำ guidance ให้ "วัดผลได้" คืออะไร (prior art ในโปรเจกต์)
- [x] RQ4: การเปลี่ยน playbook ต้องแก้ไฟล์ไหน (src vs root dogfood)

## 2. วิธี & แหล่งข้อมูล
- [x] อ่าน paper arXiv:2603.23994v2 (PDF เต็ม 39 หน้า — abstract, §2 learning loop, §4-6 case studies, takeaways)
- [x] อ่านโค้ด/เอกสารในโปรเจกต์: `build.md`, `verify.md`, `triage.md`, `project.md`, achieved topic `discovery-mode-selector`
- [x] diff src↔root เพื่อยืนยัน target การแก้

## 3. Findings (ผลการค้นต่อคำถาม)

### RQ1: paper claim ที่ falsifiable → เป็น heuristic ได้
- **Credit horizon:** สั้นได้ถ้า immediate reward สอดคล้อง long-term; แต่ **update ถี่เกินด้วย horizon สั้นเกิน → ผลแย่ลง**
  - หลักฐาน: Atari case study — full-trace (multi-step) ช่วยหา code ดีกว่าแค่ **4/8 เกม**; เกมที่ immediate reward สอดคล้อง short horizon ก็พอและเร็วกว่า (Fig. 5, §5 takeaway)
  - นัย: fix loop ของ warnyin ควร "เลือก horizon ตามโครงเหตุ-ผลของ task" ไม่ใช่แก้ทีละจุดถี่ๆ เสมอ
- **Experience batching:** batch ใหญ่ขึ้น **ไม่ได้ generalize ดีขึ้นแบบ monotonic**; optimal ขึ้นกับ task
  - หลักฐาน: BBEH case study — บาง task batch=1 ดีสุด (Disambiguation 0.537, Movie 0.889) บาง task batch=3 ดีสุด (Geometric 0.389) (Table 1, §6)
  - นัย: full-gate อย่า default โยน failure ทั้งหมดเป็นก้อนเดียว — แบ่งกลุ่มตาม root cause
- **Starting artifact:** จุดตั้งต้น + วิธี decompose (one-fn vs multi-fn) กำหนด solution ที่เอื้อมถึง
  - หลักฐาน: MLAgentBench — Multi-function pipeline เอาชนะ submission ได้สูงกว่า (Spaceship 86.6% vs 72.7%) (Fig. 4)
  - นัย: การหั่น task/slice ใน DESIGN = decomposition choice → เป็นแค่ note validate ของเดิม (D2)

### RQ2: learning loop จริงใน warnyin
- **BUILD full-gate fix loop** (`build.md §3 ข้อ8, §4 ข้อ6): หลัง merge ทุก wave → run full build+test → "แก้จนเขียวหมด (loop)" อาจ delegate fix ทีละจุด → นี่คือจุดที่ credit-horizon + batching เกิด
- **VERIFY fix loop** (`verify.md §3 ข้อ5, §4 ข้อ5): "ไม่ผ่าน → แก้ → rerun วนจนผ่าน **นับจำนวนรอบ**" → credit-horizon เกิดที่นี่ (feedback ต่อรอบ)
- **ต่างกัน:** build = แก้ให้ test เขียว (correctness); verify = แก้ให้ตรงจุดประสงค์/UX (behavioral) → guidance ต้องเข้าทั้งสองแต่คนละบริบท → สอดกับ D3 (why อยู่ทั้ง 2 stage)

### RQ3: house style ทำ guidance ให้วัดผลได้
- topic เดิม `discovery-mode-selector` ใช้ **"Behavior contract (falsifiable)" + "Observable proxy (verify นับได้ deterministic)" + "Fixture (verify assert)"** tables
- นัย: ทำตาม pattern เดิม → guidance ของ topic นี้ก็ต้องมี observable proxy (สอดกับ D4)

### RQ4: target การแก้ (src vs root)
- `diff` ยืนยัน root (`.warnyin/`) ≠ src (`src/.warnyin/`) สำหรับ build/verify/triage → root = dogfood release เก่า, src = v-next
- **แก้ที่ `src/.warnyin/workflow/` เท่านั้น**: `stages/build.md`, `stages/verify.md`, `triage.md`, `stages/design.md`

## 4. Code inspection
| ไฟล์ / ส่วน | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `build.md §3.8, §4.6` | full-gate "แก้จนเขียวหมด" ไม่ระบุ horizon/batch | จุดเสียบ guidance credit-horizon + batching |
| `verify.md §3.5, §4.5` | "แก้จนผ่าน + นับรอบ" ไม่ระบุ feedback ต่อรอบ | จุดเสียบ guidance credit-horizon |
| `triage.md Fast-track skip-list` | ตาราง per-tier per-stage behavior อยู่แล้ว | จุดเสียบ default-by-tier (D3) |
| `design.md` | จุดหั่น task/slice | จุดเสียบ note starting-artifact |
| src↔root diff | ต่างกัน (dogfood เก่า) | แก้ที่ src เท่านั้น |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก | ข้อดี | ข้อเสีย | เหมาะกับเคสนี้? |
|---|---|---|---|
| guidance-only ผูก tier | zero-config, ต้นทุนต่ำ, ตรง paper | ไม่แม่นเท่า knob จริง | ✅ (D1) |
| explicit tunable knob | คุมแม่น | setup burden ↑ (paper เตือน) | ✗ defer |
| full + telemetry | ครบ | over-engineer, scope ใหญ่ | ✗ defer |

## 6. ความเสี่ยง / unknown ที่ยังเหลือ
- guidance ที่ subjective เกินไป agent อาจไม่ทำตาม → คุมด้วย observable proxy (D4)
- เสี่ยงเพิ่มความยาว playbook (repo ให้คุณค่า minimalism — ดู topic `ponytail-minimalism`) → ต้องเขียนกระชับ, reference ไม่ inline ซ้ำ

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำจาก research:** codify 2 fix-loop knob เป็น guidance กระชับ (why อยู่ build/verify, default-by-tier อยู่ triage skip-list) + observable proxy ให้ VERIFY เช็กได้ + note starting-artifact ใน design.md; แก้ที่ `src/` เท่านั้น
- **ป้อนกลับเข้า Decision Log:** D1–D4 ปิดแล้ว; constraint "แก้ src เท่านั้น" + "เขียนกระชับตาม minimalism" เข้า §5 discovery.md
