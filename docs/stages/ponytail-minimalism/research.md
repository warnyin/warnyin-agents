# Research — Ponytail Minimalism

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> ที่เก็บ "ข้อมูลที่ค้นมา + หลักฐาน" สนับสนุนการตัดสินใจใน `discovery.md`

| | |
|---|---|
| **Slug** | `ponytail-minimalism` |
| **วันที่** | `2026-06-15` |

---

## 1. คำถามวิจัย (research questions)
- [x] RQ1: `ponytail` คืออะไร และคุณค่าแก่นคืออะไร
- [x] RQ2: ส่วนไหนของ ponytail หยิบมา "ฝัง native" ได้ โดยไม่ขัด zero-dependency
- [x] RQ3: Warnyin workflow ปัจจุบันมี seed ของ minimalism อยู่ตรงไหนแล้ว / ขาดอะไร
- [x] RQ4: ฝัง principle ลงตรงไหนของโครงสร้าง playbook จึงไม่ duplicate และไหลไป downstream

## 2. วิธี & แหล่งข้อมูล
- [x] อ่าน repo ต้นทาง (README + โครงสร้าง) ผ่าน WebFetch
- [x] อ่านโค้ด/เอกสารในโปรเจกต์ (code inspection): `.warnyin/workflow/contexts/*`, `roles/developer.md`, `docs/project.md`
- [x] prior art: เทียบกับ tier/triage + model-tier ที่ repo เรามีอยู่แล้ว

## 3. Findings (ผลการค้นต่อคำถาม)

### RQ1: ponytail คืออะไร / คุณค่าแก่น
- **พบว่า:** plugin ฝังปรัชญา "lazy senior developer" — เขียนโค้ดน้อยที่สุดผ่าน **decision hierarchy** (verbatim):
  1. `Does this need to exist? → no: skip it (YAGNI)`
  2. `Stdlib does it? → use it`
  3. `Native platform feature? → use it`
  4. `Installed dependency? → use it`
  5. `One line? → one line`
  6. `Only then: the minimum that works`
  - หลักคุมเพดาน (verbatim): *"Lazy, not negligent: trust-boundary validation, data-loss handling, security, and accessibility are never on the chopping block."*
  - claim ผลลัพธ์: ลดโค้ด **80-94%**, generate เร็วขึ้น **3-6×**, cost ลด **47-77%**
  - มี intensity 4 ระดับ (lite/full/ultra/off) + commands `/ponytail`, `/ponytail-review` (จับ over-engineering ใน diff), `/ponytail-audit` (สแกน repo), `/ponytail-debt` (รวม marker `ponytail:` ที่ค้าง)
- **หลักฐาน:** https://github.com/DietrichGebert/ponytail (README + commands/ เป็นไฟล์ `.toml` 4 ไฟล์), ภาษา JavaScript 98.8%, รองรับหลาย agent (Claude Code/Codex/Cursor/…)
- **นัยต่อการออกแบบ:** ของมีค่าจริงคือ "decision hierarchy + guardrail" (เป็น *ข้อความ/ruleset* ล้วน) → หยิบมาเป็น principle doc ได้ตรงๆ โดยไม่ต้องเอาโค้ด plugin

### RQ2: หยิบส่วนไหนมาฝัง native ได้โดยไม่ขัด zero-dep
- **พบว่า:** decision hierarchy + "lazy not negligent" เป็น text ล้วน → ฝังเป็น `.md` ใน playbook ได้ 100% zero-dep. ส่วน command/hook/benchmark ของ ponytail เป็นโค้ด JS = ขัดหลัก zero-dep ถ้าจะ bundle
- **สรุป/นัย:** ฝัง "ปรัชญา" (text) ✅ · ไม่เอา "กลไก/โค้ด" (command/hook/benchmark) ❌ — ตรงกับ Decision #1, #2

### RQ3: Warnyin มี seed อยู่แล้วตรงไหน / ขาดอะไร
- **พบว่า (seed ที่มีอยู่):**
  - `contexts/build.md`: "ทำตาม task spec ครบทุกข้อ ไม่เกิน/ไม่ต่ำ", "reuse shared component ก่อนเขียนใหม่"
  - `roles/developer.md`: "spec คือสัญญา…ไม่แถมสิ่งที่ไม่ได้ขอ", "reuse ก่อนเขียนใหม่", "ไม่ทิ้งขยะ: debug/commented-out/TODO ลอย"
  - `contexts/review.md`: mindset skeptical หา bug — แต่ไม่มี lens เฉพาะ "over-engineering/bloat"
- **ขาด (= ส่วนต่างที่ ponytail เติม):** (1) decision hierarchy ที่เป็นลำดับชัด stdlib→native→dep→one-liner, (2) guardrail "lazy not negligent" ที่ระบุชัดว่าห้ามตัดอะไร, (3) review lens จับ over-engineering
- **หลักฐาน:** code inspection ตาราง §4
- **นัย:** ไม่ใช่สร้างใหม่หมด แต่ "ตกผลึก seed ที่มี + เติมส่วนขาด" → ขนาดงานเล็ก-กลาง

### RQ4: ฝังลงตรงไหนไม่ duplicate + ไหลไป downstream
- **พบว่า:** workflow มี layer: `stages/` (single source ต่อ stage), `contexts/` (session posture), `roles/` (system-prompt เสริม), `scripts/`. ไม่มีที่เก็บ "principle cross-cutting" โดยเฉพาะ. CLAUDE.md สั่ง "อย่า duplicate logic — แก้ที่เดียว"
- **สรุป/นัย:** ต้องมี **บ้านเดียว** (เช่น layer `principles/` ใหม่ หรือ section ที่เหมาะ) แล้ว build/developer/review/verify *ลิงก์* มา. วางใน `src/.warnyin/workflow/` เพื่อ ship ไป downstream (root เป็น dogfood, mirror ตาม) → ตรงกับ Decision #3, #5

## 4. Code inspection (สิ่งที่ตอบได้จากโค้ดเอง โดยไม่ต้องถาม user)
| ไฟล์ / ส่วนของโค้ด | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `.warnyin/workflow/contexts/build.md` | "ไม่เกิน/ไม่ต่ำ", "reuse ก่อนเขียนใหม่", "❌ หลุด scope" | seed ฝั่งผลิต — จุดเสริม principle |
| `.warnyin/workflow/roles/developer.md` | "ไม่แถมสิ่งที่ไม่ได้ขอ", "ไม่ทิ้งขยะ debug/TODO" | seed ฝั่งผลิต — ลิงก์ principle ใน checklist |
| `.warnyin/workflow/contexts/review.md` | skeptical หา bug/edge/security — ไม่มี lens bloat | จุดเติม lens "over-engineering" ฝั่งตรวจ |
| `.warnyin/workflow/contexts/` (build/research/review) | มีแค่ 3 context, ไม่มี `principles/` | layer ใหม่ `principles/` เป็นทางเลือกบ้านแกน |
| `docs/project.md` | zero-dependency + 2-layer (src↔root) + verify-pack gate | บังคับ: text-only, mirror, ผ่าน verify-pack |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก | ข้อดี | ข้อเสีย | เหมาะกับเคสนี้? |
|---|---|---|---|
| ฝังแนวคิด native (เลือก) | zero-dep, กลมกลืน workflow, ship ทุก install | ต้องเขียน principle เอง | ✅ ใช่ |
| bundle ponytail plugin | ได้ของครบทันที | ขัด zero-dep, ผูก dependency นอก | ❌ |
| intensity 4 ระดับ | ยืดหยุ่น | เพิ่ม state/command/โค้ด ขัด zero-config + ขัด minimalism | ❌ |
| always-on ระดับเดียว (เลือก) | zero-config, ง่าย, eat own dogfood | ปรับความเข้มละเอียดไม่ได้ | ✅ (ปรับผ่าน triage tier เดิมถ้าจำเป็น) |
| ไฟล์แกนเดียว + ลิงก์ (เลือก) | DRY, แก้ที่เดียว | เพิ่ม 1 ไฟล์/layer | ✅ |
| fold ลงหลายไฟล์ | ไม่เพิ่มไฟล์ | เสี่ยง duplicate ผิด CLAUDE.md | ⚠️ รอง |

## 6. ความเสี่ยง / unknown ที่ยังเหลือ
- ผลเชิงพฤติกรรม (agent เขียนน้อยลงจริงแค่ไหน) วัดยากแบบ rigorous — บรรเทาด้วยตัวอย่าง before/after 1 ชุด
- ตำแหน่งไฟล์แกนจริง (folder `principles/` ใหม่ vs section เดิม) — ฝาก DESIGN ตัดสิน (direction ชัดแล้ว: single source + ลิงก์)

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำจาก research:** สร้าง principle doc แกนเดียวใน `src/.warnyin/workflow/` (เสนอ `principles/minimalism.md`) บรรจุ decision hierarchy 6 ขั้น + guardrail "lazy not negligent"; ลิงก์จาก `contexts/build.md`, `roles/developer.md`, `contexts/review.md`, `stages/verify.md`; mirror ลง root dogfood; ผ่าน verify-pack; แนบ before/after 1 ชุด
- **การตัดสินใจที่ป้อนกลับเข้า discovery.md:** Decision #1–#6 (ดู Decision Log) — ปิดครบ
