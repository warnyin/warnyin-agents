# Standard — triage-command

## reuse pattern (ห้ามประดิษฐ์ใหม่)
- **ลอกโครงจาก `src/.claude/commands/warnyin/next.md`** (adapter read-only ใกล้เคียงสุด): frontmatter `---\ndescription: ...\nargument-hint: "..."\n---` + body "ทำหน้าที่เป็น ... ตาม playbook กลาง · อ่าน `.warnyin/workflow/triage.md` ให้ครบ ทำตามทุกหลักการ (read-only เด็ดขาด, แนะนำแล้วหยุด) · ขอบเขต: $ARGUMENTS"
- **pointer = backtick runtime-ref ตาม next.md (★ dry-run T2):** next.md command ชี้ playbook เป็น **backtick prose** `` `.warnyin/workflow/next.md` `` (target-root path) ไม่ใช่ markdown-link — triage command ทำเหมือนกัน; markdown-link จะ resolve ผิด (`../../../...`) + ขัด convention adapter
- **skill-adapter convention** (`docs/rule.md §1`) — adapter บาง **ชี้ playbook ไม่ duplicate**; triage = utility read-only → **ไม่ใส่ stateful behavior**; คงเป็น command (user-invoked)

## register pattern
- ใน `installer/templates/CLAUDE.md` list ใช้รูปแบบเดียวกับบรรทัดที่มี: `` - `/warnyin:triage [คำอธิบาย change]` → ... (`.warnyin/workflow/triage.md`) `` — วางกลุ่ม utility read-only (ใกล้ `explore`/`next`)

## ห้าม
- ❌ inline rubric/tier/hard-floor ลง command (เนื้ออยู่ playbook เดียว — canonical-copy)
- ❌ แตะ root `CLAUDE.md` (gitignored dogfood — release sync; `docs/rule.md §1` src→root sync-gap)
