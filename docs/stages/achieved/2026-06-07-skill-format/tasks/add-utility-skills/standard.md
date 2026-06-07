# Standard — add-utility-skills

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern: skill adapter + installer/packaging/test เดิมของ repo

## 1. Standard กลางที่ยึด
- **tool-agnostic core** (`docs/rule.md` §1) — playbook กลางไม่แตะ; skill = Claude adapter บาง **ชี้กลับ playbook** ไม่ duplicate logic (เหมือน command ที่ชี้ `.warnyin/workflow/*.md`)
- **zero-dependency** (`docs/rule.md` §2) — skill เป็น `.md`; cli/verify-pack ใช้ `node:*` เท่านั้น
- **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/**` เท่านั้น; ห้ามแตะ root dogfood
- **`package.json files` granular** (`docs/techstack/installer/rule.md`) — nested dotfolder ต้องระบุชัด (`src/.claude/skills`)
- **pack-verify เป็น gate + testable** (`docs/techstack/installer/rule.md`) — เปิด allow ต้องคง denylist/guard อื่น + unit พิสูจน์
- **test = black-box spawn** (`docs/techstack/installer/test.md`) — installer test spawn cli.mjs จริง, assert side-effect; verify-pack test = pure `checkFiles`

## 2. Pattern การเขียนของ task นี้
- **skill frontmatter:** YAML `---` ... `---`; `name` = ชื่อ folder; `description`/`when_to_use` actionable; `allowed-tools` read-only set
- **skill body:** ภาษาไทยสไตล์ command เดิม — "ทำหน้าที่เป็น <role> ... อ่าน playbook `.warnyin/workflow/<x>.md` แล้วทำตาม"; **ไม่ duplicate** ขั้นตอน playbook
- **cli.mjs CORE:** เพิ่ม element ใน array `CORE` (รูปแบบ `path.join(...)` เดิม) — copyTree + `--update` overwrite ทำงานอัตโนมัติ
- **verify-pack.mjs:** เพิ่ม string ใน `ALLOWED_PREFIX`; `hasSkills` ตามแบบ `hasWarnyin`/`hasClaude` เดิม (บรรทัด 26-29)
- **test:** เพิ่มเคสในไฟล์เดิม รูปแบบ `test('...', () => {...})` เดียวกัน; GOOD baseline mutate
- **command note:** ต่อท้าย 1 บรรทัด ไม่รื้อโครง command เดิม

## 3. Shared component / utility (อย่าเขียนซ้ำ)
- skill body reuse playbook กลาง (ห้าม copy ขั้นตอน) — เหมือน command เดิม
- `hasSkills` ตาม pattern `hasWarnyin`/`hasClaude` ใน `checkFiles` (ไม่เขียน logic ใหม่นอกแบบ)
- installer test ใช้ harness `makeTempProject`/`runCli` เดิม (ดู `docs/techstack/installer/standard.md`)

## 4. เพิ่มเติมเฉพาะ task
- **เปิด leak-guard อย่างระวัง:** เปิดเฉพาะ `src/.claude/skills/` (ไม่กว้างกว่า); case 9 ต้องเปลี่ยน leak ตัวอย่างเป็นพาธที่ยัง**นอก** allowlist จริง (เช่น `src/.vscode/`) — พิสูจน์ guard ยังทำงาน
- **R1 hasSkills:** ทำให้ skills เป็น required (กันหล่นเงียบ เหมือนบทเรียน nested-dotfolder) — GOOD baseline ต้องมี skill path ไม่งั้น test เดิมแดง
- **cross-platform:** ใช้ `path.join` (มีอยู่แล้ว); skill path ใน test เป็น POSIX (จาก npm pack --json)
