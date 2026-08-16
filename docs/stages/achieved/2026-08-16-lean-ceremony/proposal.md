# Proposal — ลด ceremony overhead ของ workflow (lean-ceremony)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `lean-ceremony` |
| **ประเภท** | `refactor` |
| **ขนาด** | `standard` |
| **วันที่** | `2026-08-14` |
| **มาจาก Discovery?** | `ไม่มี` (วิเคราะห์เชิงประจักษ์จาก 39 topic ใน `docs/stages/achieved/`) |

## 1. สรุป change (what)
ลด overhead ของ workflow 5 จุด โดย **ไม่ลด correctness floor**: auto-route fast (confirm 1 ครั้งแล้วเดิน fastlane ต่อ) · บังคับ cap บรรทัดใน validator · เปลี่ยน optional gate เป็น trigger-by-signal · ยุบ memory hook 6→2 จุด · ตัดรอยต่อ BUILD↔VERIFY + ยุบ artifact 3→1

## 2. ทำไม (why)
- **ปัญหา (วัดจาก achieved 39 topic):** process artifact กินมากกว่า deliverable ~4.6:1 (`publish-pack-polish` 1,518 : 329 บรรทัด) · fast tier ถูกใช้ 1/39 topic (2.6%) · cap ใน `triage.md §2D` ถูกละเมิด 12 ไฟล์ (design สูงสุด 611 บรรทัด vs cap 120) · memory hook เขียนซ้ำ 6 จุด/topic · `build.md` กับ `verify.md` มี step 0 / investigate-before-edit / config-protection / loop-tuning block ซ้ำกันคำต่อคำ
- **ผลถ้าไม่ทำ:** ทุก change ตกราง standard เต็มไม่ว่าเล็กแค่ไหน → เวลาและ token ต่อ topic โตขึ้นเรื่อย ๆ โดยคุณภาพไม่เพิ่ม; cap ที่ประกาศไว้เองแต่ไม่บังคับ = กฎตาย

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A ตัด ceremony ที่วัดได้ว่าซ้ำ/ไม่ถูกใช้ คง gate เดิม | ลด overhead จริง ไม่แตะ correctness | ต้องแก้หลายไฟล์พร้อมกัน | ✅ |
| B ยุบ VERIFY เป็น phase ใน BUILD (5→4 stage) | เร็วสุด | breaking ทั้ง workflow + เสีย property "ผู้ตรวจอิสระจากผู้เขียน" (`docs/rule.md §5`) | |
| C เพิ่ม knob ให้ user ตั้ง threshold เอง | ยืดหยุ่น | ขัด "กระทัดรัด opinionated / always-on zero-config" | |

- เหตุผลที่เลือก: A ตัดเฉพาะสิ่งที่มีหลักฐานว่าซ้ำหรือไม่ถูกใช้ — gate ทุกตัว (full-gate, hard-floor, evidence-before-promote, approve gate ของ wireframe) คงเดิมครบ

## 4. Scope
**In scope**
- (2) `design.md §4 step 1.5` + `fastlane.md §1` + adapter: tier=fast → เสนอเดินต่อ **confirm ครั้งเดียว** → รัน fastlane ครบ 4 row ใน session เดียว
- (3) `validate-topic.mjs`: เพิ่มเช็ค **C7 cap** (fast receipt ≤40 · standard proposal ≤60 / design ≤120 · large ไม่มี cap) — เกิน = ✖, อ่าน tier ไม่ได้ = ⚠ ไม่บังคับ + unit test
- (5) panel / dry-run: ถามเฉพาะเมื่อ `tier=large` **หรือ** แตะ hard-floor **หรือ** task ≥ 4 — นอกนั้นข้ามเงียบ; wireframe: detect เข้าเงื่อนไข → วาดเลย (ตัดคำถาม "จะวาดไหม" — คง approve gate ของภาพ)
- (6) memory write hook: 6 จุด → **3 จุด** (จบ BUILD + SHIP + fastlane ship-lite); `docs/memory.md` เขียนตอน SHIP
- (7) BUILD↔VERIFY: full-gate เขียว → confirm 1 ครั้ง → เดิน VERIFY ต่อใน session เดียว (verify ยังบังคับ agent อิสระจากผู้เขียน) · ยุบ `build.md`+`test.md`+`verify.md` → `build.md` ไฟล์เดียว (VERIFY เป็น section ข้างใน) · ตัด step 0/investigate/config-protection/loop-tuning ที่ซ้ำเหลือ pointer

**Out of scope**
- ยุบ 4 ไฟล์ต่อ task → 1 ไฟล์ (แยก topic — breaking ต่อ template/validator/BUILD fan-out)
- เพิ่ม tier `small` ระหว่าง fast/standard
- ยุบจำนวน stage (ทางเลือก B)

## 5. ผลกระทบ & ความเสี่ยง
- **กระทบ:** playbook 5 ไฟล์ (`design/build/verify/ship/discovery`) + `memory.md` + `fastlane.md` + `validate-topic.mjs` + template `[topic]/` + adapter `.claude/commands/warnyin/{design,build,verify}.md` + feature spec 5 ตัว · user-facing behavior change → ต้องมี CHANGELOG entry (`docs/rule.md §2`)
- **ความเสี่ยง 1:** confirm-then-continue อาจถูกอ่านว่า AI auto-invoke fastlane → ลดโดยระบุ **user ยืนยันในเซสชัน = user-invoked** ใน `fastlane.md §1` ให้ชัด (ไม่ใช่ยกเลิกกฎ)
- **ความเสี่ยง 2:** C7 บังคับ cap อาจ block topic ที่กำลังทำอยู่ → ลดโดย tier ที่อ่านไม่ได้ = ⚠ ไม่บังคับ (fail-safe) + archive ไม่ถูกสแกน (`SKIP_TOPIC`)
- **ความเสี่ยง 3:** ยุบ artifact ทำ stage inference ของ validator เพี้ยน → ลดโดยเปลี่ยน VERIFY จาก file-based เป็น section-based ใน `build.md` (structural ล้วน)
- **ความเสี่ยง 4:** ลด memory hook แล้ว session ตายกลาง DESIGN → ยอมรับ: สถานะของ DESIGN อยู่ใน `proposal.md`/`design.md` ที่เขียนลงดิสก์แล้ว

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Business: ข้าม — ไม่มีมิติธุรกิจใหม่ (internal workflow improvement; คุณค่า/ผู้ใช้อยู่ใน §2 แล้ว)
