# Standard — fast-track-receipt

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **อิงจาก** `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack)

- **mirror layout `src/` = target paths** — วาง `src/.warnyin/template/stages/receipt.md` → installer copy เป็น `target/.warnyin/template/stages/receipt.md` ตรงๆ (ไม่มี mapping table, ไม่แก้ `cli.mjs`)
- **test harness กลาง** — assertion ใหม่ใช้ pattern เดิม: `makeTempProject(t)` + `runCli` + `ok(r)` + `existsSync(path.join(tmp, ...))`; assert เป็น target-side path; black-box ห้าม import logic จาก `cli.mjs`
- **ภาษาไทย** — เนื้อหา playbook/template/ข้อความ test เป็นภาษาไทยตามสไตล์ repo

## 2. Pattern การเขียนของ task นี้

- **canonical-copy** — ตาราง skip-list + caps + route: **copy คำต่อคำจาก design `§4.1` ห้ามแต่งใหม่/rephrase ต่อไฟล์**; ไฟล์อื่น (stages/design.md, command adapter) เป็น pointer บางชี้ `triage.md`
- **markdown pointer = md link เท่านั้น** — pointer ข้ามไฟล์ (เช่น §2C → `loop-tuning.md`) ใช้ `[loop-tuning](loop-tuning.md)` ห้ามเป็น inline code (`lint-md` strip inline code → link ใน backtick หลุด dead-link gate)
- **anchor แยกหน้าที่** — caps เป็น section `§2D` ของตัวเอง ไม่ฝังใน skip-list (stage อื่นชี้แต่ละ anchor ได้อิสระ)
- **adapter บาง** — `.claude/commands/warnyin/design.md` เพิ่มเฉพาะบรรทัดชี้ playbook ไม่ duplicate ขั้นตอน

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)

- `installer.test.mjs`: `makeTempProject`, `runCli`, `ok`, `existsSync` — มีครบแล้ว ใช้ซ้ำ
- โครง receipt.md: meta table + หัว `>` quote ตามสไตล์ template เดิมใน `.warnyin/template/stages/[topic]/`

## 4. เพิ่มเติมเฉพาะ task

- receipt.md ≤40 บรรทัด **รวมทุกบรรทัด** (heading/ตาราง/ว่าง) — วัดด้วย `wc -l` (deterministic กับภาษาไทย ไม่ใช้ word count)
