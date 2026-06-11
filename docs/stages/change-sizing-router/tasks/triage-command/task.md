# Task — triage-command

> ชี้ canonical `design.md` §3D/§4 (ไม่ลอก rubric)

| | |
|---|---|
| **Task** | `triage-command` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (command adapter) |
| **Model tier** | `cheap` (adapter บาง ลอก pattern `next.md` command — mechanical) |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
สร้าง command adapter **`/warnyin:triage`** (read-only) + ลงทะเบียนใน slash-command list ที่ผู้ใช้เห็น — surface ใช้งานจริงที่ชี้กลับ playbook `triage.md`

## 2. Dependency
- **ต้องทำหลัง:** — (wave 1; อ่าน `design.md` §3D/§4 contract เป็น input)
- **ปลดล็อกให้:** —
- **ส่ง output:** command + ปรากฏใน command list

## 3. Sub-tasks
- [ ] 1. `src/.claude/commands/warnyin/triage.md` — adapter บาง **ลอกโครงจาก `src/.claude/commands/warnyin/next.md`**: frontmatter (`description` + `argument-hint`) + "อ่าน playbook `.warnyin/workflow/triage.md` ให้ครบ ทำตามทุกหลักการ (read-only เด็ดขาด, แนะนำแล้วหยุด)"; `$ARGUMENTS` = คำอธิบาย change
- [ ] 2. **pointer = backtick target-root runtime-ref** `` `.warnyin/workflow/triage.md` `` ตาม convention `next.md` command (★ dry-run T2: **ห้ามทำ markdown-link** — adapter ชี้ path ที่ agent เห็นตอน install ที่ target root ไม่ใช่ repo-relative; lint ไม่ validate backtick runtime-ref); **ห้าม inline rubric** (เนื้ออยู่ playbook)
- [ ] 3. `src/.warnyin/installer/templates/CLAUDE.md` — เพิ่ม 1 บรรทัดใน "Slash commands (namespace `warnyin:`)" list: `/warnyin:triage [คำอธิบาย change]` → ประเมินขนาด + แนะนำ path (read-only) (`.warnyin/workflow/triage.md`) — วางใกล้ `next`/`explore` (utility read-only)

## 4. ขอบเขตไฟล์ที่จะแตะ (★ disjoint)
- `src/.claude/commands/warnyin/triage.md` (ใหม่)
- `src/.warnyin/installer/templates/CLAUDE.md` (เพิ่มบรรทัด list)
- ❌ **ห้ามแตะ** `triage.md` playbook (T1), `stages/`, `workflow/README.md` (T3), root `CLAUDE.md` (gitignored — release sync)

## 5. Acceptance criteria
- [ ] command adapter บาง ชี้ playbook `triage.md` (ไม่ duplicate rubric) ตาม pattern `next.md` command
- [ ] frontmatter ครบ (`description`, `argument-hint`); read-only (ไม่มี Write/Edit ในเจตนา — สั่งแนะนำแล้วหยุด)
- [ ] pointer เป็น **backtick target-root runtime-ref** `` `.warnyin/workflow/triage.md` `` (ไม่ใช่ markdown-link — convention next.md; integration proof มาจาก T3 links)
- [ ] `installer/templates/CLAUDE.md` มี `/warnyin:triage` ใน list
- [ ] ผ่าน test ตาม `spec.md` · ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิง
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical: `../../design.md` §3D, §4 (pointer convention), §2 (ownership)
- Pattern: `src/.claude/commands/warnyin/next.md`
