# Research — Feature behavior spec + delta discipline (ยืมเทคนิคจาก OpenSpec)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> ที่เก็บ "ข้อมูลที่ค้นมา + หลักฐาน" สนับสนุนการตัดสินใจใน `discovery.md`

| | |
|---|---|
| **Slug** | `feature-spec-delta` |
| **วันที่** | `2026-06-07` |

---

## 1. คำถามวิจัย (research questions)
- [x] RQ1: OpenSpec ทำ spec-driven development ยังไง — โครงสร้าง, format, lifecycle อะไรที่เด่น
- [x] RQ2: Warnyin ปัจจุบันเก็บ "พฤติกรรมของระบบ" ไว้ที่ไหน และช่องว่างคืออะไร
- [x] RQ3: เทคนิคไหนของ OpenSpec ผ่านเกณฑ์ปรัชญา roadmap (opinionated / tool-agnostic / ห้ามเดา) บ้าง

## 2. วิธี & แหล่งข้อมูล
- [x] อ่านโค้ด/เอกสารในโปรเจกต์ (code inspection — template, playbook, docs/features จริง)
- [x] ค้นเว็บ / เอกสารภายนอก — repo + docs ของ OpenSpec (README, docs/concepts.md, workflows.md, cli.md, opsx.md, schemas/)
- [x] prior art — เทียบกับการ adopt จาก ECC ก่อนหน้า (roadmap P1 ข้อ 5-9 เป็น precedent ของการ "ยืมเฉพาะแก่นที่ผ่านเกณฑ์")

## 3. Findings (ผลการค้นต่อคำถาม)

### RQ1: OpenSpec ทำ spec-driven development ยังไง
- **พบว่า:** แยก **spec ปัจจุบัน** (source of truth) ออกจาก **change ที่เสนอ** (delta) อย่างเด็ดขาด:
  - `openspec/specs/<capability>/spec.md` — พฤติกรรมปัจจุบัน: ทุก requirement บังคับ `## Purpose` + `### Requirement:` (RFC 2119: MUST/SHALL/SHOULD/MAY) + อย่างน้อยหนึ่ง `#### Scenario:` แบบ GIVEN/WHEN/THEN
  - `openspec/changes/<name>/specs/.../spec.md` — **delta format**: section `## ADDED Requirements` / `## MODIFIED Requirements` / `## REMOVED Requirements` เทียบ spec ปัจจุบัน
  - ตอน `archive`: ADDED ต่อท้าย spec กลาง, MODIFIED แทนที่, REMOVED ลบ — **merge แบบ mechanical** แล้วย้าย change ไป `changes/archive/` (date-prefixed)
  - spec เก็บเฉพาะ observable behavior / I/O / error conditions — **ไม่เก็บ** internal class name, framework choice, implementation step
- **หลักฐาน:** https://github.com/Fission-AI/OpenSpec/ — README + `docs/concepts.md`, `docs/workflows.md`; npm `@fission-ai/openspec`
- **นัยต่อการออกแบบ:** รูปแบบ requirement+scenario และ delta 3 หมวด เป็น .md ล้วน — ยกมาปรับใช้ได้โดยไม่ขัด tool-agnostic; ส่วน merge mechanical ของเราควรคง user approval (หลัก "ห้ามเดา" + SHIP เดิม approve per-item)

### RQ2: Warnyin ปัจจุบันเก็บ "พฤติกรรมของระบบ" ไว้ที่ไหน
- **พบว่า:**
  - `docs/features/<name>/` มีแค่ `feature.md` (overview/status/why) + `business.md` (goal/persona/metric) — **เชิง narrative ไม่ testable**
  - spec ระดับ behavior มีเฉพาะใน **topic** (`docs/stages/<slug>/tasks/<task>/spec.md` — API/UI/test-flow) แต่ถูก **archive ไปพร้อม topic** ตอน SHIP — ความรู้เชิงพฤติกรรม "ค้างอยู่ในอดีต" ไม่กลายเป็น living doc
  - VERIFY playbook ให้เทส "ตามจุดประสงค์ของ topic" + `docs/techstack/<c>/test.md` (วิธีเทส) — **ไม่มี baseline พฤติกรรมเดิม** ไว้กัน regression ข้าม feature
  - SHIP merge ความรู้เข้า `docs/features/` ด้วยการ distill จาก `business.md`+`proposal.md`+`design.md` — **judgment ล้วน ไม่มีรูปแบบปลายทางบังคับ**
- **หลักฐาน:** `src/.warnyin/template/docs/features/[feature-name]/` (มี 2 ไฟล์), `src/.warnyin/workflow/stages/ship.md` §5, `src/.warnyin/workflow/stages/verify.md` §3, ตัวอย่างจริง `docs/features/context-profiles/`
- **นัยต่อการออกแบบ:** ช่องว่างชัด — เพิ่ม `spec.md` ต่อ feature เป็น living behavior spec จะปิดทั้งสองปัญหา (VERIFY baseline + SHIP ปลายทางชัด)

### RQ3: เทคนิคไหนของ OpenSpec ผ่านเกณฑ์ปรัชญา roadmap
- **ผ่าน (เอามา — topic นี้):**
  1. **Living behavior spec** (requirement + scenario) — .md ล้วน, เสริม "ห้ามเดา" (VERIFY มี evidence เทียบ)
  2. **Delta discipline** (ADDED/MODIFIED/REMOVED) — ทำ SHIP กึ่ง mechanical ลด drift, .md ล้วน
- **ผ่าน (topic แยกขนาดเล็ก — นอกขอบเขต topic นี้):**
  3. **Structural validator + status script** (เทียบ `openspec validate`/`status`) — zero-dep `node:*` ได้ตาม precedent `lint-md.mjs` (roadmap ข้อ 12)
- **ไม่ผ่าน (ตัดทิ้ง):**
  - Schema-driven YAML engine (OPSX) — over-engineer; playbook .md แก้ง่ายกว่า ตรง single-source-of-truth อยู่แล้ว
  - เลิก phase gate ("fluid not rigid") — quality gate คือจุดขายของ Warnyin; เรามี optional (Discovery/business.md/panel/dry-run) ยืดหยุ่นพออยู่แล้ว
  - Workspaces / context stores / initiatives — ยัง beta เอง
  - Generate adapter ให้ 30+ tools — ขัด non-goal "รองรับ harness จำนวนมาก" (roadmap ❌)
- **หลักฐาน:** `docs/roadmap.md` หลักการชี้นำ + ❌ Non-goals; OpenSpec docs ตาม RQ1

## 4. Code inspection (สิ่งที่ตอบได้จากโค้ดเอง โดยไม่ต้องถาม user)
| ไฟล์ / ส่วนของโค้ด | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `src/.warnyin/template/docs/features/[feature-name]/` | มีแค่ `feature.md` + `business.md` | จุดที่จะเพิ่ม `spec.md` template |
| `src/.warnyin/workflow/stages/ship.md` §5 | promote เข้า `docs/features/` แบบ distill จาก business/proposal/design | จุดที่จะเพิ่มขั้น merge delta → feature spec |
| `src/.warnyin/workflow/stages/verify.md` §3-4 | วางแผนเทสจาก spec ของ topic + techstack test.md — ไม่มี baseline กลาง | จุดที่จะเพิ่ม "อ่าน feature spec เป็น regression baseline" |
| `src/.warnyin/workflow/stages/design.md` | proposal/design ไม่บังคับระบุ delta เทียบพฤติกรรมปัจจุบัน | จุดที่จะเพิ่ม delta section |
| `docs/features/{context-profiles,utility-skills}/` | feature จริงของ repo นี้ 2 ตัว (รูปแบบ narrative) | candidate สำหรับ backfill spec (dogfood) |
| precedent: roadmap P1 #5-9 (adopt จาก ECC) | แพทเทิร์น "ยืมแก่น manual ลง playbook .md ไม่เอา runtime" สำเร็จมาแล้ว 5 รอบ | ใช้แพทเทิร์นเดิมกับ OpenSpec |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก | ข้อดี | ข้อเสีย | เหมาะกับเคสนี้? |
|---|---|---|---|
| (ก) `docs/features/<name>/spec.md` (ฝังใน features เดิม) | เข้าโครงเดิม ไม่เพิ่มทรีใหม่ feature=capability เข้าใจง่าย | feature กว้างๆ อาจมีหลาย capability ปนใน spec เดียว | ✅ แนะนำ (กระทัดรัด) |
| (ข) ทรีแยก `docs/specs/<capability>/` แบบ OpenSpec ตรงตัว | แยก capability ละเอียด ตรงต้นแบบ | เพิ่มแกนที่สองซ้อนกับ `docs/features/` → duplicate/สับสน ขัด "กระทัดรัด" | ❌ |
| (ค) delta เป็น section ใน `design.md` ของ topic | artifact ไม่เพิ่ม อ่านที่เดียว | design.md ยาวขึ้น | ✅ แนะนำ (ดู decision log) |
| (ง) delta เป็นไฟล์แยก `spec-delta.md` ใน topic | merge ตอน SHIP ตรงไปตรงมา | เพิ่ม artifact ที่ 10 ใน template topic | พิจารณาใน DESIGN |

## 6. ความเสี่ยง / unknown ที่ยังเหลือ
- ความเสี่ยง spec รก/บวมเมื่อ feature โต — ต้องมีหลัก token-lean (เหมือน codemap < 1000 tokens?)
- brownfield: โปรเจกต์ปลายทางที่ติดตั้งใหม่ยังไม่มี spec — `/warnyin:init` ควร generate หรือปล่อยให้เกิดจาก SHIP แรก?
- งานเพิ่มต่อ topic (เขียน delta) ต้องไม่หนักจน ceremony เกิน — ขัด "กระทัดรัด"

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำจาก research:** ยืม 2 เทคนิค (spec + delta) ลงเป็น playbook/template .md ตามแพทเทิร์น ECC-adoption เดิม; วาง spec ใน `docs/features/<name>/spec.md`; คง user approval ใน SHIP (กึ่ง mechanical ไม่ใช่ auto)
- **การตัดสินใจที่ป้อนกลับเข้า `discovery.md` (Decision Log):** รูปแบบ spec (lean vs เต็มสูตร), ตำแหน่ง delta, ความเข้มของ merge, brownfield/backfill — กำลังไล่ปิดทีละข้อ
