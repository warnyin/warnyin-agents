# Spec — discovery-command-adapter

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้

## 1. ชนิดของ task
`logic` (command adapter — markdown slash-command) · ไม่ใช่ REST API → ไม่มี `openapi.yaml`

## 4. Data-flow
- `$ARGUMENTS` (slug + คำอธิบาย/keyword) → command map keyword → mode | auto-suggest → ชี้ playbook section anchor (ไม่ถือ behavior เอง)

## 5. User-flow
- `/warnyin:discovery <slug> [keyword]` → explicit mode | ไม่ระบุ/multi-match → playbook auto-suggest → ยืนยัน → เดิน Discovery (ดู `design.md §5.1`)

## 6. Persona
- ผู้ใช้ที่เรียก `/warnyin:discovery` (Claude Code) — entry point ของ mode

## 7. Test-flow
- [ ] keyword "ไว"/"เร็ว"/"quick"/"fast" → `ไว`; "ละเอียด"/"grill"/"ซักถามฉันหน่อย" → `ละเอียด`; "โต้วาที"/"debate" → `โต้วาที`; "ไต่สวน"/"audit"/"red-team"/"blue-red" → `ไต่สวน`; "ปกติ"/"balanced" → `สมดุล`
- [ ] ไม่ระบุ keyword → command ชี้ playbook auto-suggest (ไม่ default เงียบเป็นค่าตายตัว)
- [ ] multi-match/ขัดกัน → fall through auto-suggest
- [ ] **no-duplicate:** command ไม่มี behavior contract table / auto-suggest signal ซ้ำ — grep ยืนยัน command ชี้ section anchor "Discovery modes (ความเข้มของ Discovery)" จริง (anchor-resolve)
- [ ] backward-compat: เรียก command แบบเดิม (ระบุแค่ slug) ยังทำงาน
- [ ] README capability tree มี mode ของ discovery + ชี้ playbook canonical (ไม่ inline taxonomy)
