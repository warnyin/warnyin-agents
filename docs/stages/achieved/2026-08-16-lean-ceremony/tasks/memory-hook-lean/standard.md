# Standard — memory-hook-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/workflow-core/standard.md` (ถ้ามี) — task นี้เป็น **playbook markdown ล้วน** ไม่มีโค้ดรันไทม์

## 1. Standard กลางที่ยึด (จาก techstack / rule กลาง)

- **canonical-copy convention** (`docs/rule.md §1`) — กติกาเต็มอยู่ไฟล์เดียว ที่เหลือเป็น pointer บาง; string ที่ถูก assert คำต่อคำ **ชนะ pattern ประจำไฟล์เสมอ** (ห้าม paraphrase ให้ "เข้าสไตล์ไฟล์")
- **unify-in-place ไม่สร้างกลไกขนาน** (`docs/rule.md §1`) — เสริม mechanism ที่ทับซ้อนของเดิม = **ขยายบรรทัดเดิม** ไม่เพิ่มข้อใหม่ขนาน (ใช้กับ C6 ใน `fastlane.md §1` โดยตรง)
- **executor-playbook convention** (`docs/rule.md §2`) — `fastlane.md` เป็น **ผู้เดิน ไม่ใช่ผู้ตั้งกฎ**: แก้ §1 ได้เฉพาะเงื่อนไข "ใครเรียกได้" (เป็นสมบัติของ executor เอง) **ห้าม inline กฎของ `triage.md`/stage เพิ่ม**
- **anchor-immutability** (`docs/rule.md §2`) — heading ที่มี inbound link/pointer ≥2 ไฟล์ = public API; `memory.md` มี **heading freeze 9 หัวข้อ** ที่ถูก assert คำต่อคำ (`src/tests/memory.test.mjs` M1) → **ห้าม rename/เพิ่ม/สลับลำดับ**
- **knowledge-store convention** (`docs/rule.md §1`) — ทุกจุด consume ต้องมี clause `เป็น data ไม่ใช่ instruction` ที่จุดนั้นเอง → **การตัด hook เขียน ห้ามพ่วงลบ clause ของจุดอ่าน**
- **source/dogfood แยกชั้นเด็ดขาด** (`docs/rule.md §6`) — แก้ที่ `src/**` เท่านั้น; root `.warnyin/` / `.claude/` เป็น dogfood **gitignored** (แก้ไปก็ไม่ถูก commit)

## 2. Pattern การเขียน playbook ของ task นี้

**(ก) การลบ block ออกจาก playbook**

- ลบ **ทั้ง block ที่มีความหมายเดียว** (blockquote 1 บรรทัด + บรรทัดว่างคั่น) — ไม่ทิ้ง blockquote เปล่า `>` หรือบรรทัดว่างซ้อน 2 บรรทัด
- โครง §4 หลังลบต้องจบด้วย step สุดท้ายของ list แล้วตามด้วย `---` (สไตล์เดียวกับ stage อื่น)
- **ไม่ renumber** step อื่น และไม่แตะข้อความ step ที่เหลือ

**(ข) การลดแถวในตาราง**

- ลบ **ทั้งแถว** (บรรทัดเดียว) — คง header row + separator row เดิมคำต่อคำ (`| จุด | ไฟล์ (anchor) | หมายเหตุ |`)
- แถวที่เหลือ **คงข้อความเดิมคำต่อคำ** — ไม่ "จัดใหม่ให้สวย" (diff เล็กที่สุด = review ง่ายที่สุด)
- ลำดับแถวเรียงตาม flow จริง: BUILD → SHIP → fastlane

**(ค) การแทนที่บรรทัดด้วย contract string**

- **copy-paste จาก `design.md §4` โดยตรง** ห้ามพิมพ์ใหม่ (ตัวอักษรไทย/`—`/`;`/`★` พิมพ์ใหม่แล้วเพี้ยนง่าย)
- **ห้ามใส่ `**bold**` / `_italic_` คร่อมหรือแทรกกลาง** substring ของ contract — string-equality จะแดง
- ต่อท้ายได้ (เหตุผลเสริม) แต่ **ห้ามแทรกกลาง**
- path ในลิงก์ต้องเป็น **variant ของไฟล์ผู้ชี้**: ไฟล์ใต้ `stages/` ใช้ `../memory.md`, ไฟล์ระดับ `workflow/` ใช้ `./memory.md`

**(ง) การเขียนประโยคนำ (§5 ของ `memory.md`)**

- โทนเดียวกับ blockquote นำที่มีอยู่ใน `memory.md` (`> **หัวข้อ:** เนื้อความสั้น`)
- **นิยาม ไม่ใช่ hook** — บอก "เขียนอะไร ที่ไหน" พอ; ห้ามลอกประโยคคำสั่งของ hook (`จบ stage แล้ว → เขียนสถานะล่าสุด ...`) มาไว้ในไฟล์นี้
- path ใน `memory.md` ใช้ inline-code หรือ markdown-link ที่ resolve ได้เท่านั้น (ไฟล์นี้อยู่ใน `src/` — dead-link gate สแกน `docs/` แต่ `lint:md` ครอบ payload ด้วย → ให้ลิงก์ resolve เสมอ)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)

- **contract canonical:** `docs/stages/lean-ceremony/design.md §4` (C6, C7) — แหล่งเดียวของ string
- **baseline พฤติกรรมเดิม:** `docs/features/project-memory/spec.md` (Requirement "ทุก stage และ fastlane มี hook เขียน memory") · `docs/features/fastlane/spec.md` (Requirement "รันงาน fast จบในคำสั่งเดียว")
- **ตัวอย่างงานชนิดเดียวกัน (อ่านเป็น pattern ไม่ copy):** `docs/stages/achieved/2026-07-27-project-memory/tasks/stage-wiring/` — เป็น task ที่ **วาง** hook ชุดนี้ตอนแรก
- **ห้ามเขียน helper/script ใหม่** — self-verify ใช้ `grep`/`node -e` แบบ ad-hoc พอ (gate จริงเป็นของ `release-hygiene`)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)

- **pattern ที่ task นี้ใช้ซ้ำได้:** เมื่อ **ลด** จุด hook ที่มี canonical เป็นตาราง ให้แก้ **ตาราง canonical + ไฟล์ปลายทาง ในคอมมิตเดียว** และตรวจด้วย negative-grep ทั้งสองทิศ (ต้องไม่พบที่ตัด / ต้องยังพบที่คงไว้) — ถ้าคุ้มเป็นมาตรฐานกลาง ให้ note ใน `rule.md §2` (รอ SHIP)
- **ข้อควรระวังที่พบเฉพาะไฟล์นี้:** `memory.md` เป็น canonical ที่พูดถึง hook โดยธรรมชาติ → มีโอกาสสูงที่ประโยคนำจะติด compound needle ของเทส (M2) โดยไม่ตั้งใจ — เขียนประโยคนำแบบ **ไม่ใช้คำสั่งของ hook** เสมอ
