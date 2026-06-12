# Business — Feedback issue

> ความรู้ถาวรระดับ feature · promote จาก topic `feedback-issue-command` (Discovery 2026-06-11, ผ่าน gate)

## 1. เป้าหมายเชิงธุรกิจ (what & why)
- **what:** เพิ่มช่องทางในตัว workflow ให้ผู้ใช้ปลายทางแจ้ง feedback (ปรับปรุง/ปัญหา/feature ใหม่) กลับเป็น GitHub issue ที่ repo product `warnyin/warnyin-agents`
- **why:** ยังไม่มี feedback loop ในตัว workflow → ผู้ใช้ต้องออกจาก flow ไปเขียน issue เอง (ไม่เป็นมาตรฐาน ขาด context) หรือไม่แจ้งเลย → ทีมเก็บ insight เพื่อปรับ v-next ได้ยาก
- **ผูก `docs/project.md`:** ตรง persona "ผู้ใช้ปลายทาง" + "contributor/maintainer" — command นี้คือสะพานให้ผู้ใช้ปลายทางป้อน feedback กลับเข้าวงพัฒนา v-next ใน `src/`

## 2. Persona / ใครได้ประโยชน์
- **ผู้ใช้ปลายทาง** — แจ้งปัญหา/ขอ feature ได้ในตัว workflow โดยไม่ต้องสลับ context, issue เป็นรูปแบบมาตรฐาน
- **ทีม/maintainer** — ได้ feedback ที่ structured (มี prefix จัดหมวด, body ครบตาม template) → triage + ปรับปรุง product ได้เร็ว
- **คุณค่า:** ปิด feedback loop → product พัฒนาต่อเนื่องจาก insight ผู้ใช้จริง

## 3. Success metric (วัดผลได้)
- command `/warnyin:feedback:issue` ติดตั้งได้ (sandbox install proof) + โผล่ใน CLAUDE.md list ปลายทาง + README capability
- flow ครบ: เลือกประเภท → สัมภาษณ์ → preview → confirm → ยิง (gh) หรือ fallback URL → คืน link
- title มี prefix ตรงประเภท; ไม่มี gh/login → degrade เป็น URL ไม่ error ตาย
- `verify-pack` เขียว (nested command + playbook ติด tarball)

## 4. ขอบเขตเชิงธุรกิจ / ข้อจำกัด
- **in scope:** command + playbook · repo hardcode `warnyin/warnyin-agents` · 3 ประเภท (title prefix + best-effort label) · gh + fallback URL · confirm gate + privacy
- **out of scope:** repo อื่น/origin ปลายทาง · จัดการ issue อื่น (list/comment/close) · auto-ดึง session context · `.github/ISSUE_TEMPLATE` · จัดการ gh auth
- **ข้อจำกัด:** payload `.md` + 1 nested command — zero-dep (gh = external CLI ที่ผู้ใช้ติดตั้งเอง ไม่ใช่ dependency), tool-agnostic (command = adapter บางชี้ playbook)

## 5. ความเสี่ยง & การคุม
- **privacy leak ขึ้น public issue** → กฎไม่ดึง session context เอง + preview/confirm ก่อนยิงเสมอ
- **gh มีแต่ไม่ login** → detect เช็คทั้ง binary + `gh auth status` ก่อน fallback
- **non-collaborator ใส่ label ไม่ได้** → title prefix เป็นหลัก, label best-effort (fail เงียบได้)
- **2-layer drift** → แก้ที่ `src/` canonical (root dogfood ได้ตอน release sync)
