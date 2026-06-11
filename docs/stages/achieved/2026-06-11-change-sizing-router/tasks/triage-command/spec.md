# Spec — triage-command

> feature ประเภท skill/command adapter (`.md` + frontmatter) → THEN เป็น observable artifact

## persona
ผู้ใช้ที่พิมพ์ `/warnyin:triage <คำอธิบาย change>` ใน Claude Code

## user-flow
user อธิบาย change → `/warnyin:triage` → adapter สั่งให้อ่าน playbook triage.md + ทำตาม → รายงาน tier+route → หยุด

## test-flow (task-scope — structural)
1. **ไฟล์มีจริง:** `src/.claude/commands/warnyin/triage.md`
2. **frontmatter:** มี `description` + `argument-hint` (ตาม pattern `next.md` command)
3. **adapter บาง:** body สั่ง "อ่าน `.warnyin/workflow/triage.md` + ทำตาม" — **ไม่ inline rubric** (grep ไม่พบตาราง tier/hard-floor ในไฟล์ command)
4. **read-only เจตนา:** ระบุ read-only/แนะนำแล้วหยุด; ไม่มีคำสั่งให้สร้าง/แก้ไฟล์
5. **pointer = backtick runtime-ref:** ชี้ `` `.warnyin/workflow/triage.md` `` แบบ backtick (convention next.md command — ไม่ใช่ markdown-link; lint ไม่ validate runtime-ref ของ adapter)
6. **register:** `src/.warnyin/installer/templates/CLAUDE.md` มีบรรทัด `/warnyin:triage` ใน Slash commands list
7. **lint:md** own-file ผ่าน (cross-file ไป triage.md = full-gate)

## observable (realize scenario §9 #3 read-only)
- รัน triage → ไม่สร้าง/แก้ไฟล์ (git status สะอาด — พิสูจน์ที่ VERIFY)
