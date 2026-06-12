# Discovery — command `/warnyin:feedback:issue` (กล่อง feedback เปิด GitHub issue)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `feedback-issue-command` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | `2026-06-12` |
| **ผู้ร่วมตัดสินใจ** | Rujiroj Tamnitra |
| **เริ่มจาก** | `docs/project.md` — persona "ผู้ใช้ปลายทาง" + scope `in: slash command` |
| **Mode** | `สมดุล` (auto-suggest ยืนยันโดย user) |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> เพิ่ม slash command `/warnyin:feedback:issue` ที่ ship ไปกับ package เพื่อให้**ผู้ใช้ปลายทาง**ของ Warnyin Standard Workflow แจ้ง feedback (ปรับปรุง / bug / feature ใหม่) กลับมาเป็น **GitHub issue ที่ repo `warnyin/warnyin-agents` เสมอ** — AI สัมภาษณ์สั้นๆ เรียบเรียงตาม template แล้วยิงด้วย `gh` (fallback เป็น prefilled URL)

## 2. Problem & Why now
- **ปัญหา / โอกาส:** ตอนนี้ไม่มีช่องทางในตัว workflow ให้ผู้ใช้ปลายทางแจ้งปัญหา/ขอ feature กลับมาที่ทีม — ต้องออกจาก flow ไปเปิด GitHub เอง เขียน issue ไม่เป็นมาตรฐาน เก็บ feedback ได้ยาก
- **ทำไมต้องทำตอนนี้:** workflow เริ่มถูกติดตั้งใช้จริง (dogfood + publish) → ต้องมี feedback loop เพื่อปรับปรุง product ต่อเนื่อง
- **ผูกกับเป้าหมายโปรเจกต์:** `docs/project.md` ระบุ persona "ผู้ใช้ปลายทาง" + "contributor/maintainer" — command นี้คือสะพานให้ผู้ใช้ปลายทางป้อน feedback กลับเข้าวงพัฒนา v-next ใน `src/`

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- slash command ใหม่ใน nested namespace: `.claude/commands/warnyin/feedback/issue.md` + คู่ source ใน `src/.claude/commands/warnyin/feedback/issue.md`
- เปิด GitHub issue ที่ repo **คงที่ `warnyin/warnyin-agents`** (hardcode — ไม่อิง origin ของโปรเจกต์ปลายทาง)
- รองรับ 3 ประเภท: **ปรับปรุง (Improvement) / ปัญหา (Bug) / feature ใหม่ (Feature)** — จัดหมวดด้วย **title prefix** `[Bug]/[Feature]/[Improvement]` เป็นหลัก + best-effort label (`bug`/`enhancement`)
- กลไกยิง: `gh issue create` ถ้ามี gh + login → ยิงตรง; ถ้าไม่มี/ไม่ login → **fallback สร้าง prefilled URL** (`issues/new?title=&body=&labels=`) ให้เปิด browser เอง
- AI **สัมภาษณ์สั้น** เก็บข้อมูลตาม template ของแต่ละประเภท → เรียบเรียง title/body markdown → **preview + ให้ user ยืนยันก่อนยิงเสมอ**

**Out of scope (จะไม่ทำในรอบนี้)**
- ยิง issue เข้า repo อื่น / origin ของโปรเจกต์ปลายทาง (รอบนี้ repo คงที่อย่างเดียว)
- จัดการ issue อื่น: list / ค้นหา / comment / ปิด / แก้ (command นี้ **เปิด issue อย่างเดียว**)
- ดึง session context (error/ไฟล์/โค้ด) มาแปะอัตโนมัติ — ใส่ได้เฉพาะเมื่อ user สั่งชัด (กัน path/secret หลุด public issue)
- สร้าง GitHub issue template (`.github/ISSUE_TEMPLATE`) ใน repo — รอบนี้ template อยู่ในตัว command playbook
- จัดการ auth ของ gh (สอน/ติดตั้ง gh ให้ — แค่ detect แล้ว fallback)

## 4. Decision Log (เดินทีละกิ่งของ decision tree)

| # | คำถาม / ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| 1 | ผู้ใช้ + repo เป้าหมาย | ship+คงที่ / ship+origin / ภายในเท่านั้น | ship+คงที่ warnyin-agents | **ship + repo คงที่ `warnyin/warnyin-agents`** | เป็นกล่อง feedback ของตัว product ให้ผู้ใช้ปลายทางทุกคน → repo ต้อง hardcode |
| 2 | กลไกยิง issue | gh+fallback URL / gh เดียว / URL เดียว | gh + fallback URL | **gh CLI + fallback prefilled URL** | robust สุด — ครอบคลุมทั้งคนมี/ไม่มี gh และ login/ไม่ login |
| 3 | จัดหมวด 3 ประเภท (label permission) | title prefix+label / prefix เดียว / label เดียว | title prefix + best-effort label | **title prefix `[Bug]/[Feature]/[Improvement]` + best-effort label** | non-collaborator ใส่ label ไม่ได้ → prefix ใช้ได้ทุกคน, label เป็น bonus |
| 4 | บทบาท AI เรียบเรียง + privacy | สัมภาษณ์+template / ดึง session อัตโนมัติ / ส่งตรง | สัมภาษณ์สั้น + เรียบเรียง template, ไม่ดึง session เอง | **สัมภาษณ์สั้น + เรียบเรียงตาม template, ไม่ดึง session context เองถ้า user ไม่สั่ง** | issue คุณภาพ + กัน path/secret หลุด public issue |
| 5 | confirm ก่อนยิง (outward-facing) | บังคับ preview+confirm / ยิงเลย | บังคับ preview + confirm เสมอ | **บังคับ preview + confirm เสมอ** (assert) | สร้าง public issue เป็น action ที่ย้อนยาก/เปิดเผยภายนอก — ต้องยืนยันก่อน |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:**
  - ผู้ใช้มี GitHub account และยินดีเปิด issue ในนามตัวเอง (public)
  - repo `warnyin/warnyin-agents` เป็น public → ใครก็เปิด issue ได้ (ไม่ต้องเป็น collaborator)
  - command เป็นเอกสาร/playbook ที่ AI agent อ่านแล้วทำ — ไม่ใช่สคริปต์ที่รันเอง (สอดคล้อง scope `out` ของ project.md: "ไม่มี runtime")
- **ข้อจำกัด:**
  - non-collaborator **ใส่ label ตอนเปิด issue ไม่ได้** (gh `--label` error / URL `?labels=` ถูก ignore) → จัดหมวดต้องไม่พึ่ง label อย่างเดียว
  - `gh issue create` ต้องมี gh CLI + `gh auth login` → ผู้ใช้ปลายทางจำนวนหนึ่งไม่มี → ต้องมี fallback
  - 2-layer bootstrap: ต้องแก้ทั้ง `src/` (publish) และ dogfood root ให้ตรงกัน (verify-pack เป็น gate)
  - zero-dependency: ใช้ได้แค่ `gh` (external CLI ที่ผู้ใช้ติดตั้งเอง) + node built-in — ห้ามเพิ่ม npm dep

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- มีไฟล์ `.claude/commands/warnyin/feedback/issue.md` + `src/.claude/commands/warnyin/feedback/issue.md` ที่เนื้อหาตรงกัน → เรียก `/warnyin:feedback:issue` ติดใน Claude Code
- เรียก command แล้วได้ flow: เลือกประเภท → สัมภาษณ์สั้น → preview title/body → ยืนยัน → ยิง (gh) **หรือ** ได้ prefilled URL (fallback) → คืน link issue
- title มี prefix ตรงประเภท (`[Bug]/[Feature]/[Improvement]`)
- กรณีไม่มี gh / ไม่ได้ login → ไม่ error ตาย แต่ degrade เป็น URL พร้อมแจ้งเหตุผล
- `verify-pack` ยังเขียว (command ใหม่ติดไปกับ payload publish ครบ)

## 7. Feature ideas / ทางเลือกของวิธีแก้
> ส่งต่อให้ DESIGN พิจารณา
- โครง command file ตาม pattern เดิม (frontmatter `description` + `argument-hint` + ขั้นตอนชี้ playbook) — แต่ feedback อาจไม่ต้องมี playbook กลางใน `.warnyin/workflow/` ถ้าเนื้อหาสั้นพอจะอยู่ในไฟล์ command เลย (DESIGN ตัดสิน: standalone command vs ชี้ playbook)
- body template ต่อประเภท: Bug = สรุป/ขั้นตอน reproduce/คาดหวัง vs จริง/เวอร์ชัน-env · Feature = ปัญหา/ข้อเสนอ/คุณค่า · Improvement = จุดที่ปรับ/เหตุผล/ผลที่คาด
- footer อัตโนมัติเล็กๆ ระบุว่ามาจาก `/warnyin:feedback:issue` + เวอร์ชัน workflow (ช่วย maintainer trace) — DESIGN พิจารณาว่าใส่ไหม
- argument: `/warnyin:feedback:issue [ข้อความสั้น]` (optional) — ใส่มาเป็น seed, ไม่ใส่ก็เริ่มถามประเภทก่อน

## 8. Open questions (ที่ยังค้าง)
> ไม่มีข้อที่ block การออกแบบ — รายการด้านล่างเป็นรายละเอียดที่ให้ DESIGN ตัดสินได้
- [x] repo เป้าหมาย → คงที่ `warnyin/warnyin-agents` (D1)
- [x] กลไกยิง + fallback → gh + URL (D2)
- [x] จัดหมวดประเภท → title prefix + best-effort label (D3)
- [x] บทบาท AI + privacy → สัมภาษณ์+template, ไม่ดึง session เอง (D4)
- [ ] _(DESIGN)_ มี playbook กลางใน `.warnyin/workflow/` ไหม หรือ standalone command — ปล่อยให้ DESIGN ตัดสินตามขนาดเนื้อหา
- [ ] _(DESIGN)_ ภาษา title/body (ตามที่ user สื่อสาร เป็น default) + รายละเอียด body template ต่อประเภท

## 9. ความเสี่ยงหลัก
- **gh auth ไม่ได้ login จริง** (มี gh แต่ไม่ login) → ต้อง detect ให้ครบ (เช็คทั้ง `gh` exist + `gh auth status`) ก่อน fallback ไม่งั้น error กลางคัน
- **privacy leak** — AI เผลอแปะ path/โค้ด/secret จาก session ลง public issue → กันด้วยกฎ "ไม่ดึง session context เองถ้า user ไม่สั่ง" + preview ให้ user เห็นก่อนยิงเสมอ
- **2-layer drift** — แก้ root แต่ลืม `src/` (หรือกลับกัน) → publish แล้ว command หาย → verify ต้องเช็คทั้งสองชั้น
- **nested namespace** `warnyin/feedback/` เป็นโฟลเดอร์ใหม่ — ต้องมั่นใจว่า installer/packaging copy โฟลเดอร์ย่อยไปด้วย (verify-pack ครอบคลุม)

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- เอกสารโปรเจกต์: `docs/project.md`, `docs/rule.md`
- โค้ด/ไฟล์ที่ตรวจสอบ: `.claude/commands/warnyin/explore.md` (pattern command), `.claude/commands/warnyin/triage.md`, `.github/workflows/ci.yml`, git remote `origin`

---

## ✅ Gate → DESIGN (ดู `.warnyin/workflow/stages/discovery.md` ข้อ 6)
- [x] Problem / why-now ชัด ผูกกับ project.md
- [x] Scope in/out ชัด
- [x] Decision log ปิดทุกประเด็นสำคัญ ไม่มี open question ที่ block (ที่เหลือเป็นรายละเอียดระดับ DESIGN)
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (2026-06-12) + D5 confirm-before-send ยืนยันแล้ว
