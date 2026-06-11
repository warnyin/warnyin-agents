# Proposal — command `/warnyin:feedback:issue`

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `feedback-issue-command` |
| **ประเภท** | `feature` |
| **ขนาด** | `standard` (ประเมินใน DESIGN step 1.5 — สร้างไฟล์ใหม่หลายไฟล์ข้าม 2 layer + nested namespace + logic detect/fallback; ไม่แตะ hard-floor 5 หมวด) |
| **วันที่** | `2026-06-12` |
| **มาจาก Discovery?** | `./discovery.md` |

## 1. สรุป change (what)
> เพิ่ม utility capability + slash command `/warnyin:feedback:issue` ให้ **ผู้ใช้ปลายทาง** ของ Warnyin Standard Workflow เปิด **GitHub issue ที่ repo `warnyin/warnyin-agents` (คงที่)** สำหรับแจ้ง ปรับปรุง / ปัญหา / feature ใหม่ — AI สัมภาษณ์สั้น เรียบเรียงตาม template แล้วยิงด้วย `gh` (fallback prefilled URL) โดย preview + confirm ก่อนยิงเสมอ

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** ยังไม่มีช่องทางในตัว workflow ให้ผู้ใช้ปลายทางป้อน feedback กลับมาที่ทีม → feedback กระจัดกระจาย/ไม่เป็นมาตรฐาน, ทีมเก็บ insight เพื่อปรับ v-next ได้ยาก
- **ผลถ้าไม่ทำ:** ผู้ใช้ต้องออกจาก flow ไปเขียน issue เอง (เขียนไม่เป็นรูปแบบ ขาด context) หรือไม่แจ้งเลย → product พัฒนาช้าลงเพราะขาด feedback loop

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A (แนะนำ): playbook กลาง `.warnyin/workflow/feedback.md` + command adapter บางชี้กลับ | tool-agnostic (Codex/Antigravity ใช้ได้) · ตรง pattern repo (explore/triage/next) · canonical เดียว | สร้าง 2 ไฟล์ | ✅ |
| B: standalone — logic อยู่ในไฟล์ command `.claude/` เลย | ไฟล์เดียว | ผูก Claude เครื่องเดียว (ขัด tool-agnostic rule) · ไม่ตรง pattern adapter-บาง | ✗ |
| C: ยิงผ่าน GitHub REST API ตรง (node fetch) | ไม่พึ่ง gh | ต้องจัดการ token/auth เอง (แตะ hard-floor secret) · ขัด zero-dep spirit | ✗ |

- **เหตุผลที่เลือก A:** rule `docs/rule.md` กำหนด "command = adapter บาง ชี้ playbook กลาง ไม่ duplicate" + "tool-agnostic" (payload `.warnyin/` ทุก harness อ่านได้) — A เป็นทางเดียวที่ทำให้ feedback capability ใช้ได้ทุก harness และไม่ duplicate logic; gh CLI หลีกเลี่ยงการจัดการ token เอง (ไม่แตะ secret hard-floor)

## 4. Scope
**In scope**
- playbook กลาง `src/.warnyin/workflow/feedback.md` — flow + body template ต่อประเภท + gh-detect/fallback + confirm gate (single source)
- command adapter `src/.claude/commands/warnyin/feedback/issue.md` (nested namespace `warnyin:feedback:issue`) ชี้กลับ playbook
- ลงทะเบียน: `src/.warnyin/workflow/README.md` (utility list, payload) + `CLAUDE.md` (Slash commands, dogfood) + `CHANGELOG.md` (rule บังคับ user-facing change)
- 3 ประเภท จัดหมวดด้วย title prefix `[Bug]/[Feature]/[Improvement]` + best-effort label
- repo เป้าหมาย hardcode `warnyin/warnyin-agents`

**Out of scope**
- ยิง issue เข้า repo อื่น / origin ปลายทาง
- จัดการ issue อื่น (list/search/comment/close/edit) — เปิดอย่างเดียว
- auto-ดึง session context (error/โค้ด) — เฉพาะ user สั่งชัด
- สร้าง `.github/ISSUE_TEMPLATE` ในตัว repo · สอน/ติดตั้ง gh ให้ผู้ใช้
- แก้ packaging (`cli.mjs`) — `copyTree` recursive รองรับ nested folder อยู่แล้ว

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** เพิ่ม nested namespace แรกใน `.claude/commands/warnyin/` (ของเดิม flat) — `copyTree` recursive จึงรองรับ; ไม่แก้พฤติกรรม command เดิม → non-breaking ต่อ namespace `/warnyin:*`
- **ความเสี่ยง + วิธีลด:**
  - *privacy leak ขึ้น public issue* → playbook กฎ "ไม่ดึง session context เองถ้า user ไม่สั่ง" + **preview + confirm ก่อนยิงเสมอ**
  - *gh มีแต่ไม่ login* → detect ต้องเช็คทั้ง binary + `gh auth status` ก่อน fallback URL
  - *2-layer drift* → BUILD แก้ที่ `src/` (canonical) เท่านั้น; root dogfood ได้ตอน release sync — VERIFY เช็คว่า command ติดจริง
  - *non-collaborator ใส่ label ไม่ได้* → title prefix เป็นหลัก, label best-effort (fail เงียบได้)

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Discovery: `./discovery.md` · Research: `./research.md`
