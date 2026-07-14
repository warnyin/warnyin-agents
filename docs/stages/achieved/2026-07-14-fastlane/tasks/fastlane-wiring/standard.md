# Standard — fastlane-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack)
> อ้างอิง `docs/techstack/installer/standard.md`
- **mirror layout `src/` = target path** — โครงใน `src/` สะท้อน path ตอน install เป๊ะ (ไม่มี mapping table) → แก้ที่ `src/.warnyin/...` เท่านั้น ไฟล์จะไปโผล่ที่ `.warnyin/...` ของ target เอง
- **registry-target ของ root dogfood file = installer template** — slash-command list ที่ผู้ใช้ปลายทางเห็นอยู่ `src/.warnyin/installer/templates/CLAUDE.md` (ใน `package.json files`) **ไม่ใช่** `CLAUDE.md` ที่ root (gitignored)
- **packaging ไม่ต้องแก้** — `copyTree` recursive + `verify-pack` prefix allowlist (`src/.warnyin/`, `src/.claude/commands/`) ครอบไฟล์ที่แก้ทั้งหมดแล้ว → **ห้ามแตะ `package.json files` / `verify-pack.mjs` / `cli.mjs` / `lint-md.mjs`** ใน task นี้
- **CHANGELOG / version bump** เป็นของ `tasks/fastlane-test-release/` (wave สุดท้าย) — task นี้ห้ามแตะ

## 2. Pattern การเขียนโค้ดของ task นี้
- **canonical-copy (สำคัญสุด):** ทุกข้อความที่เพิ่ม/แทน **copy คำต่อคำจาก `design.md §4`** (C12-C17) — ไม่ย่อ ไม่เกลา ไม่แปลง backtick/emphasis; test ของ task 3 จะ diff แบบ string ตรงตัว
- **single source of truth — pointer ไม่ duplicate:** กฎ fast tier ทั้งหมดยังอยู่ที่ `triage.md` ที่เดียว; ไฟล์อื่น**ชี้กลับ**ด้วย link/pointer เท่านั้น ห้ามลอกตาราง/prose ของ skip-list หรือรายชื่อ hard-floor 5 หมวดเพิ่มที่ไหนอีก
- **minimal diff:** แต่ละบรรทัดที่แตะ = แก้เท่าที่ contract ระบุ ส่วนที่เหลือของบรรทัดคงเดิมทุกตัวอักษร (ไม่ reflow ไม่จัด format ใหม่ ไม่แตะ whitespace รอบข้าง)
- **heading/anchor immutable:** ห้ามเปลี่ยน/เพิ่ม/ลบ heading ใดๆ ในไฟล์ที่แก้ — `## Fast-track skip-list` มี inbound link 5 ไฟล์; heading อื่น (§2B/§2D ฯลฯ) ถูกอ้างในรูป `triage.md §2B` แบบ prose ก็ห้ามเปลี่ยนหมายเลข section
- **ตารางใน markdown:** แก้ในคอลัมน์เดิม ไม่เพิ่ม/ลบคอลัมน์ ไม่สลับลำดับ row
- **code-fence tree (`workflow/README.md`):** เพิ่มบรรทัดโดยคง alignment ของคอลัมน์ comment (`#`) ให้เข้าแนวกับบรรทัดข้างเคียง
- **ภาษาไทย + tool-agnostic:** ทุกข้อความอ้าง command กลาง (`/warnyin:*`) และ path กลาง (`.warnyin/workflow/...`) — ห้ามผูกกับ Claude Code หรือ IDE ใดเป็นการเฉพาะ

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **canonical rubric/skip-list:** `src/.warnyin/workflow/triage.md` § `Fast-track skip-list` — อ้างด้วย `[fast-track skip-list](../triage.md#fast-track-skip-list)` (relative จาก `stages/`) หรือ `[fastlane](fastlane.md)` (relative จาก `workflow/`)
- **template receipt:** `src/.warnyin/template/stages/receipt.md` — อยู่ **นอก `[topic]/`** โดยตั้งใจ (copy แบบเลือกเอง ไม่ติด whole-folder copy) → ห้ามย้าย
- **lint gate ที่มีอยู่:** `src/scripts/lint-md.mjs` (link resolution) + `check-test-count.mjs` (`pass === tests`) — ใช้เช็ค ห้ามแก้ตัว gate

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
> pattern ใหม่ที่ task นี้แนะนำ — ถ้าควรเป็นมาตรฐานกลาง ให้ note ใน `rule.md` (รอ SHIP อัปเดต standard กลาง)
- **contract-as-copy-source:** เมื่อ task แก้ wording ที่ถูก assert ด้วย test แบบ string-equality → ยกข้อความมาไว้ใน `design.md §4` แล้วให้ task copy คำต่อคำ (ไม่ต้องอ่านไฟล์ปลายทางของ task อื่น) — ทำให้ 2 task ขนานกันได้โดยไม่มี read-dependency
- **anchor-immutability note:** heading ที่มี inbound link ≥2 ไฟล์ ควรถือเป็น public API ของ playbook — เปลี่ยนได้เฉพาะเมื่อแก้ inbound ทุกจุดพร้อมกัน
