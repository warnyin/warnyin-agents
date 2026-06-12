# Feature — Feedback issue (เปิด GitHub issue แจ้ง feedback)

> ความรู้ถาวรระดับ feature · promote จาก topic `feedback-issue-command` (achieved 2026-06-12)
> command `/warnyin:feedback:issue` ให้ผู้ใช้ปลายทางแจ้ง feedback กลับเป็น GitHub issue ที่ repo product

## คืออะไร
capability ที่ให้ **ผู้ใช้ปลายทาง** ของ Warnyin Standard Workflow เปิด **GitHub issue ที่ repo `warnyin/warnyin-agents` (hardcode)** ผ่าน command `/warnyin:feedback:issue` — รองรับ 3 ประเภท (ปรับปรุง/ปัญหา/feature ใหม่) โดย AI สัมภาษณ์สั้น เรียบเรียงตาม template แล้วยิงด้วย `gh` (fallback prefilled URL) มี **preview + confirm gate บังคับก่อนยิง** — เป็นกล่อง feedback ในตัว workflow ปิดวง feedback loop ให้ทีมเก็บ insight ปรับ v-next

- **action-utility command (ไม่ใช่ read-only):** ต่างจาก utility เดิม (explore/next/triage) ที่อ่านอย่างเดียว — feedback มี outward-facing side-effect (สร้าง public issue) จึง **บังคับ confirm ก่อน execute** + คงเป็น command (user-only) ไม่ทำ skill auto-invoke
- **nested namespace แรก:** `warnyin/feedback/issue` เป็น nested command namespace แรกของ repo (เดิม flat)

## องค์ประกอบ
| # | กลไก | layer | ทำอะไร |
|---|---|---|---|
| 1 | **feedback playbook (canonical)** | `src/.warnyin/workflow/feedback.md` | single source: flow 3 ประเภท + body template ต่อประเภท + detect ladder + confirm gate + privacy rule — tool-agnostic ทุก harness อ่านได้ |
| 2 | **`/warnyin:feedback:issue` command** | `src/.claude/commands/warnyin/feedback/issue.md` | adapter บาง (nested namespace) ชี้ playbook + `$ARGUMENTS` |
| 3 | **detect ladder** | `feedback.md §4` | `gh` exist → `gh auth status` → ยิง `gh issue create` (best-effort label retry); ไม่พร้อม → fallback prefilled URL (urlencode) |
| 4 | **จัดหมวด 3 ประเภท** | `feedback.md §3` | title prefix `[Bug]/[Feature]/[Improvement]` (ใช้ได้ทุกคน) + label `bug`/`enhancement` best-effort (non-collaborator ใส่ label ไม่ได้) |
| 5 | **confirm gate + privacy** | `feedback.md §5` | preview + confirm บังคับก่อนยิง · ไม่ดึง session context เองถ้า user ไม่สั่ง (กัน path/secret leak ขึ้น public issue) |

## ทำงานยังไง (flow)
- user รัน `/warnyin:feedback:issue [seed]` → (ยังไม่ชัด) AI ถามประเภท → สัมภาษณ์สั้นตาม template ประเภทนั้น → เรียบเรียง title (มี prefix) + body markdown → **preview + ขอ confirm** → ยิง: มี gh+login → `gh issue create` (best-effort label, fail→retry ไม่มี label); ไม่พร้อม → สร้าง prefilled URL ให้ user เปิด browser → คืน link/URL

## ขอบเขต / ข้อจำกัด (การตัดสินใจเชิงสถาปัตยกรรม)
- **repo เป้าหมาย hardcode `warnyin/warnyin-agents`** — เป็นกล่อง feedback ของตัว product (ไม่อิง origin ปลายทาง)
- **เปิด issue อย่างเดียว** — ไม่ list/search/comment/close/edit (out of scope)
- **ไม่ดึง session context อัตโนมัติ** — เฉพาะ user สั่งชัด (privacy)
- **ไม่จัดการ auth ของ gh / ไม่สร้าง `.github/ISSUE_TEMPLATE`** — template อยู่ในตัว playbook
- **ไม่แตะ packaging** — `cli.mjs copyTree` recursive รองรับ nested folder อยู่แล้ว
- **command-only (ไม่ทำ skill auto-invoke)** — action-utility ที่มี side-effect ต้องเป็น command user-invoked

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/workflow/feedback.md` (playbook canonical) · `src/.claude/commands/warnyin/feedback/issue.md` (command adapter)
- registry: `src/.warnyin/workflow/README.md` (capability tree) · `src/.warnyin/installer/templates/CLAUDE.md` (slash-command list) · `CHANGELOG.md`
- rule กลาง: `docs/rule.md §1` (action-utility confirm-gate convention) · `docs/techstack/installer/rule.md` (registry-target dogfood) · `docs/techstack/installer/standard.md` (nested namespace pattern)
