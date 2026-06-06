# Component: installer

> ตัวติดตั้ง Warnyin Standard Workflow ลงโปรเจกต์ปลายทาง — หัวใจที่ผู้ใช้ทุกคนรันตอนเริ่มใช้

## คืออะไร
CLI zero-dependency (`bin/cli.mjs`) เผยแพร่เป็น npm package `@warnyin/agents` รันผ่าน `npx`:
- `npx @warnyin/agents` — ติดตั้ง (ข้ามไฟล์ที่มีอยู่ ไม่เขียนทับ)
- `npx @warnyin/agents --update` — อัปเดตเฉพาะ core (`.warnyin/workflow`, `.claude/commands/warnyin`, template) ไม่แตะ `docs/`/งานจริง
- `npx @warnyin/agents --dry-run` — แสดงรายการไฟล์ที่จะทำ โดยไม่เขียนจริง

## หน้าที่ (4 อย่าง)
1. **copy CORE** — playbook กลาง + command + agent + template ลง `.warnyin/` + `.claude/` (เขียนทับได้เมื่อ `--update`)
2. **สร้าง scaffold** — generate `docs/stages/context.md` + `docs/stages/achieved/.gitkeep` เปล่าใน target เอง (ไม่ copy จาก package — กัน scaffold leak)
3. **seed docs** — copy `.warnyin/template/docs/**` → `docs/**` (ข้ามโฟลเดอร์ template `[...]`, ไม่ทับไฟล์ที่มี)
4. **root docs** — สร้าง/ต่อท้าย `CLAUDE.md` + `AGENTS.md` (มี marker กัน append ซ้ำ)

## legacy migration
ตรวจโครงเก่าแล้ว **เตือนให้ user ย้ายเอง** (ไม่แตะงานจริงอัตโนมัติ):
- ≤0.2.x: `workflow/` + `warnyin-stages/` ที่ root
- 0.3–0.5.x: ทุกอย่างใต้ `warnyin/`
- 0.6.0+: `.warnyin/` (core) + `docs/stages/` (งานจริง)

## ความสัมพันธ์
- เผยแพร่ผ่าน `package.json files` (allowlist) — ดู `docs/rule.md` §4
- ทดสอบด้วย black-box test (`tests/installer.test.mjs`) + verify ผ่าน CI (`docs/techstack/installer/test.md`)
