# Spec — fastlane-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`docs` / `config` — แก้ payload markdown ของ installer (playbook กลาง + template + registry) **ไม่มี runtime/โค้ดใหม่** (zero-dep คงเดิม)
ไม่มี API / UX-UI / data-flow ใหม่ → ข้าม §2, §3

---

## 4. Data-flow
- **policy → executor:** `triage.md` (canonical rubric + skip-list + hard-floor) —[C15/C16]→ `/warnyin:fastlane` อ้างกลับมาที่ row เดิม (ไม่ลอกกฎ)
- **executor → stage hook:** `stages/{build,verify,ship}.md` รับ tier `fast` ที่มาจาก `/warnyin:triage` **หรือ** `/warnyin:fastlane` (C12) — พฤติกรรมของ hook เดิมไม่เปลี่ยน
- **receipt เป็น state เดียวของ fast tier:** meta (`base` SHA + Hard-floor row) → `next.md` อ่านความครบของ §3/§4 → route resume ไป `/warnyin:fastlane <slug>` (C14) → ship-lite อ่าน `override โดย user` ใน meta เป็น gate (C16)
- **registry → user:** README capability tree + installer template 2 ไฟล์ = จุดที่ user ปลายทางเห็น command (C17)

## 5. User-flow
1. user เห็น `/warnyin:fastlane` ใน `CLAUDE.md` / codebuddy-rules ที่ installer วางให้ (C17)
2. งานค้างกลางทาง → `/warnyin:next` route กลับไป `/warnyin:fastlane <slug>` (resume) แทนที่จะบอกให้ทำเองมือเปล่า (C14)
3. งานแตะ hard-floor + user ยืนยัน → receipt meta มี `override โดย user` → ship-lite ยอมปิดงาน (C16); ไม่มี → ห้าม ship-lite ตามเดิม

## 6. Persona
maintainer/ผู้ใช้ workflow ที่ทำงานเล็ก (1-2 ไฟล์) — และ **AI agent ทุกเจ้า** ที่อ่าน playbook กลางชุดเดียวกัน (tool-agnostic)

## 7. Test-flow
> ทดสอบด้วย **node ล้วน (cross-platform)** — ห้ามใช้ shell `grep`; test จริงเขียนใน `tasks/fastlane-test-release/` แต่ task นี้ต้องทำให้ผ่านได้ทั้งหมด

**Positive (สิ่งที่ต้องเจอ)**
- [ ] `triage.md` มีบรรทัด C15 (`ผู้เดิน (executor)`) อยู่**ใต้ตาราง** skip-list และ heading `## Fast-track skip-list` ยัง match `#fast-track-skip-list` เป๊ะ
- [ ] `triage.md` row SHIP **และ** `stages/ship.md` มีข้อความ C16 (``เว้นแต่`` + ``override โดย user``) — **ตรงกันคำต่อคำทั้ง 2 จุด**
- [ ] `stages/{build,verify,ship}.md` ทั้ง 3 ไฟล์มี ``(จาก `/warnyin:triage` หรือ `/warnyin:fastlane`)`` (C12) — และ**ไม่มีไฟล์ที่ 4** ที่ยังค้าง ``(จาก `/warnyin:triage`)`` เดี่ยวๆ
- [ ] `stages/design.md` step 1.5 มีบรรทัด C13 คำต่อคำ
- [ ] `next.md` row `fast-track` มี `/warnyin:fastlane <slug>` (resume) ตาม C14
- [ ] `template/stages/receipt.md` meta มี row `base` + Hard-floor row รองรับ `override โดย user`
- [ ] registry 3 ไฟล์ (`workflow/README.md`, `installer/templates/CLAUDE.md`, `installer/templates/codebuddy-rules.md`) มีบรรทัด `/warnyin:fastlane` — description **ตรงคำต่อคำกับ C4** ทั้ง 2 ไฟล์ installer template

**Regression (สิ่งที่ห้ามพัง)**
- [ ] `stages/{design,build,verify,ship}.md` **ยังมี link `[fast-track skip-list](../triage.md#fast-track-skip-list)` ครบ 4/4** และ **ไม่มีตาราง skip-list inline** ในไฟล์ stage ใดๆ (canonical เดียวคงอยู่ที่ `triage.md`)
- [ ] ประโยค ``pre-flight: สร้าง `receipt.md` จาก template`` ยังเจอใน `triage.md` **ไฟล์เดียว** ในทั้ง `src/.warnyin/workflow/`
- [ ] `triage.md` adapter/playbook ยัง **read-only**: มี "แนะนำแล้วหยุด" + "Read-only เด็ดขาด" ครบ + **0 write-intent** (ไม่มีคำสั่งสร้าง/แก้ไฟล์เพิ่มเข้ามา) — เพิ่มแค่ pointer ไป executor เท่านั้น
- [ ] `next.md` ยัง read-only (§4 ข้อ 1 คงอยู่) — route resume เป็นแค่ "คำแนะนำ command"
- [ ] ไม่มีไฟล์นอก `src/` ถูกแก้ (`git status` สะอาดจาก root `.warnyin/`, `.claude/`, `CLAUDE.md`)
- [ ] `lint-md` ผ่าน — markdown-link ที่เพิ่มทุกอัน resolve ได้ (`[fastlane](fastlane.md)` ใน `triage.md` ชี้ไฟล์ที่ task `fastlane-playbook` สร้าง — resolve ได้หลัง integrate wave 1)
- [ ] test suite เดิมเขียวทั้งหมด (`pass === tests`)
