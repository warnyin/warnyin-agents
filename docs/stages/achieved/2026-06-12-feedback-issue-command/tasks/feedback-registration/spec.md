# Spec — feedback-registration

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`docs` / `registration` — เป็น mechanical doc edit (เติมบรรทัดใน registry 3 ไฟล์ตาม contract)
→ **ข้าม §2 API SPEC และ §3 UX/UI SPEC** (ไม่มี endpoint, ไม่มี UI)

---

## 4. Data-flow
> ข้อมูลไหลจากไหน → ผ่านอะไร → ไปไหน

`design.md §1.1 Contract` (source ของ wording/ชื่อ/path — ล็อกแล้ว) → คัดลอกลง 3 registry:
- ชื่อ command `/warnyin:feedback:issue` + path `.warnyin/workflow/feedback.md` → `README.md` (utility list) + `CLAUDE.md` (Slash commands)
- ข้อความ user-facing change → `CHANGELOG.md` (Unreleased › Added)

ไม่มี runtime data — เป็น static text registration ขณะ build

## 5. User-flow
> ผู้ใช้เดินผ่านขั้นตอนไหนบ้าง

หลัง task เสร็จ: ผู้ใช้/AI เปิด `README.md` หรือ `CLAUDE.md` → เห็น `/warnyin:feedback:issue` ในรายการ command → รู้ว่ามี capability นี้ + path playbook; ผู้ใช้ npm อ่าน `CHANGELOG.md` → เห็นว่ารุ่นถัดไปเพิ่ม command นี้

## 6. Persona
> task นี้ทำเพื่อใคร

- **ผู้ใช้ปลายทาง** Warnyin Standard Workflow ที่มองหา command ใน registry
- **ผู้ใช้ npm** ที่ติดตาม CHANGELOG เพื่อ migrate
- **AI ทุก harness** (Codex/Antigravity) ที่อ่าน `README.md` payload เพื่อรู้รายการ capability

## 7. Test-flow
> จะทดสอบ/ยืนยันความถูกต้องยังไง — อิง acceptance `design.md §8 task 2`
- [ ] **3 registry ตรง Contract §1.1:**
  - [ ] `src/.warnyin/workflow/README.md` มีบรรทัด FEEDBACK ใน utility list block (วางต่อจาก `api-doc.md`)
  - [ ] `CLAUDE.md` มีบรรทัด registry **wording ตรงเป๊ะ** Contract §1.1: `` - `/warnyin:feedback:issue` → เปิด GitHub issue แจ้ง feedback ที่ warnyin/warnyin-agents (`.warnyin/workflow/feedback.md`) ``
  - [ ] `CHANGELOG.md` มี entry ใต้ `## [Unreleased]` › `### Added` ระบุ command `/warnyin:feedback:issue` + repo `warnyin/warnyin-agents` + (gh + fallback URL)
- [ ] **CHANGELOG รูปแบบถูก** (Keep a Changelog): หมวด `### Added`, ภาษาไทย, อยู่ใต้ `## [Unreleased]`
- [ ] **alignment คงเดิม:** คอลัมน์คอมเมนต์ `#` ใน utility list ของ README ตรงแนวกับบรรทัดอื่น (init/codemap/explore/next/triage/api-doc)
- [ ] **minimal-diff:** diff ของแต่ละไฟล์ = เติมบรรทัด เท่านั้น (ไม่มี reformat บรรทัดอื่น)
- [ ] **edge:** ไม่สร้างไฟล์ใหม่; ไม่แตะ `AGENTS.md`/`cli.mjs`/packaging (เกินขอบเขต registration)
