# Research — discovery-mode-selector

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> ที่เก็บ "ข้อมูลที่ค้นมา + หลักฐาน" สนับสนุนการตัดสินใจใน `discovery.md`

| | |
|---|---|
| **Slug** | `discovery-mode-selector` |
| **วันที่** | 2026-06-11 |

---

## 1. คำถามวิจัย (research questions)
- [x] RQ1: ระบบเดิมมี "แกนคุมความเข้ม/ขนาด" อะไรอยู่แล้วบ้าง ที่ mode ใหม่ต้องไม่ชน?
- [x] RQ2: "โต้วาที" (multi-agent) จะ reuse กลไก fan-out ที่มีอยู่ได้ไหม หรือต้องสร้างใหม่?
- [x] RQ3: discovery playbook เดิมรองรับการ "ปรับความเข้ม" ตรงไหนได้บ้าง (จุดที่ mode จะเข้าไปแทรก)?

## 2. วิธี & แหล่งข้อมูล
- [x] อ่านโค้ด/เอกสารในโปรเจกต์ (code inspection) — features + playbook
- [ ] ค้นเว็บ / เอกสารภายนอก — ไม่จำเป็น (เป็น workflow ภายใน opinionated)
- [x] prior art ภายใน: `change-sizing`, `context-profiles`, `build-orchestration`

## 3. Findings (ผลการค้นต่อคำถาม)

### RQ1: แกนเดิมที่ต้องไม่ชน
- **พบว่า:** มี 3 แกนที่เกี่ยวกับ "ความเข้ม/ขนาด" อยู่แล้ว และทับซ้อนกับ mode ได้
  - `tier` (`change-sizing`) = ขนาด change ข้าม 5 stage; `large` บังคับ Discovery, `fast` = fast-track
  - `context-profile` (`research/build/review`) = session posture; opinionated "3 พอ"
  - `grill mode` = sub-mode ของ Discovery เดิม (ซัก user หนัก)
- **หลักฐาน:** `docs/features/change-sizing/feature.md:6-19`, `docs/features/context-profiles/feature.md:8-29`, `.warnyin/workflow/stages/discovery.md:42-44`
- **นัยต่อการออกแบบ:** mode ต้องวางเป็น **แกนใหม่ระดับ Discovery (orthogonal กับ tier, ใต้ research profile, ยุบ grill)** — ตรงกับ decision 3/4/5 ใน `discovery.md`

### RQ2: โต้วาที reuse fan-out เดิมได้
- **พบว่า:** มีหลักการแกน **"Parallelize gathering, serialize judgment/narrative"** (`docs/rule.md §1`) + กลไก **parallel grounding** (fan-out read-only sub-agent ต่อโดเมน → main loop สังเคราะห์/ตัดสินเอง ไม่ delegate judgment) + fallback ทุกจุด
- **หลักฐาน:** `docs/features/build-orchestration/feature.md:9,19` (องค์ประกอบ #6 + #8 narrative single-writer)
- **นัยต่อการออกแบบ:** "โต้วาที" = **fan-out sub-agents มาเสนอ/แย้งมุมต่างๆ (gather perspectives) → main loop สังเคราะห์/ตัดสิน (single judgment)** — เข้าหลักการเดิมเป๊ะ ไม่ต้องสร้าง orchestration pattern ใหม่; DESIGN ควร reuse pattern นี้ + มี fallback (ถ้า spawn ไม่ได้ → degrade เป็น "ละเอียด")

### RQ3: จุดแทรก mode ใน playbook เดิม
- **พบว่า:** discovery playbook มีจุดที่ "ความเข้ม" ฝังอยู่แล้ว: §3 operating principles (กว้าง→แคบ, ถามทีละข้อ), §3 grill mode, §4 process loop (ground → สัมภาษณ์วน → research ขนาน)
- **หลักฐาน:** `.warnyin/workflow/stages/discovery.md:31-54`
- **นัยต่อการออกแบบ:** mode = **dial ปรับพารามิเตอร์ของ loop เดิม** (จำนวน/ความลึกคำถาม, ความเข้ม research, จะ spawn debate ไหม) ไม่ใช่เขียน flow ใหม่ 4 ชุด — แต่ละ mode คือ "ความเข้ม" ที่ต่างกันบนโครงเดียว

## 4. Code inspection
| ไฟล์ / ส่วน | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `.warnyin/workflow/stages/discovery.md:42-44` | grill mode เป็น sub-mode อยู่แล้ว | mode ละเอียด subsume grill ได้ (decision 5) |
| `.claude/commands/warnyin/discovery.md` | command adapter บาง ชี้ playbook + รับ `$ARGUMENTS` | จุดรับ mode arg / หรือ AI auto-suggest |
| `build-orchestration/feature.md:9` | "Parallelize gathering, serialize judgment" + fallback | blueprint ของ debate mode |
| `change-sizing` `design.md §4 step 1.5` | pattern establish-tier (ประเมิน→มั่นใจกำหนด/ไม่มั่นใจถาม) | template ของ "auto-suggest mode" (decision 6) |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก (mode เป็นแกนอะไร) | ข้อดี | ข้อเสีย | เหมาะ? |
|---|---|---|---|
| แกนใหม่ระดับ Discovery | orthogonal ชัด, ไม่แตะ "3 context พอ" | ต้องนิยามจุดแทรกใน playbook | ✅ เลือก (decision 4) |
| context-profile ที่ 4 | ใช้ infra เดิม | ขัด philosophy opinionated | ❌ |
| ยุบรวมกับ tier | แกนเดียวจำง่าย | coupling ขนาด×ความลึก ผิดความหมาย | ❌ |

## 6. ความเสี่ยง / unknown ที่ยังเหลือ (ส่งต่อ DESIGN — ไม่ block discovery gate)
- **debate mechanics รายละเอียด:** กี่มุม/persona, เกณฑ์ converge, budget cap token — เป็น design detail
- **mode trigger syntax:** arg (`--mode=...`) vs AI auto-suggest แล้วถาม — design detail (decision 6 วาง direction ไว้แล้ว: auto-suggest + override)
- **canonical placement:** จะเขียน mode taxonomy ที่ playbook `discovery.md` เดียว (ตามแบบ `triage.md` canonical) — design ยืนยัน

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำจาก research:**
  1. mode = แกนใหม่ระดับ Discovery, 4 ค่า, orthogonal กับ tier, ใต้ research profile, ยุบ grill → "ละเอียด"
  2. โต้วาที reuse "Parallelize gathering, serialize judgment" + fallback degrade → "ละเอียด"
  3. default = auto-suggest จากบริบท (pattern establish-tier), user override ได้; tier:large → signal แนะ "ละเอียด"
  4. canonical taxonomy ที่ `discovery.md` เดียว (no-duplicate)
- **ป้อนกลับ Decision Log:** decision 1-8 ปิดครบใน `discovery.md`
