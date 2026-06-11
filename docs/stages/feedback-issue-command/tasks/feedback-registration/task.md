# Task — feedback-registration

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `feedback-registration` |
| **Slice อ้างอิง** | `design.md` slice #2 — "ค้นพบได้ + สอดคล้อง" |
| **Component** | `installer` |
| **Model tier** | `cheap` _(mechanical doc edit — เติมบรรทัดใน registry ตาม contract ที่ล็อกแล้ว ไม่มีการตัดสินใจ design)_ |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
> task นี้ส่งมอบคุณค่า end-to-end อะไร

ทำให้ command `/warnyin:feedback:issue` **ค้นพบได้ทุกจุด registry + สอดคล้องกับ compliance ของ repo**:
ผู้ใช้ (และ AI ทุก harness) เห็น command ใน utility list ของ `README.md` payload, ใน Slash commands ของ `CLAUDE.md`, และผู้ใช้ npm เห็นการเปลี่ยนแปลงนี้ผ่าน `CHANGELOG.md` (rule บังคับ user-facing change) — slice นี้ตัดผ่าน **docs registry layer** เท่านั้น ไม่แตะ runtime/logic ของ playbook

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ขนานกับ** `tasks/feedback-playbook-command` (wave 1 เดียวกัน — ‖ ขนานได้): task นี้อ้าง **ชื่อ command + path playbook + wording จาก Contract §1.1 ของ `design.md`** ไม่พึ่ง runtime/เนื้อหาจริงของ playbook → ไม่ต้องรอ task นั้นเขียนเสร็จ (contract-first decouple — `design.md §7`)
- **ไม่ชนไฟล์กับ task อื่น:** task นี้ **modify ไฟล์เดิม 3 ไฟล์** (`src/.warnyin/workflow/README.md`, `CLAUDE.md`, `CHANGELOG.md`); task `feedback-playbook-command` **สร้างไฟล์ใหม่** ใน `src/.warnyin/` + `src/.claude/` → คนละชุดไฟล์
- **ส่ง output อะไรต่อ:** ไม่มี downstream task; integration (command ติดจริง + ชื่อตรง registry) พิสูจน์ที่ VERIFY full-gate

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
> หนึ่ง sub-task = หนึ่งไฟล์ registry ที่แก้ — independent แก้คนละไฟล์ ไม่มีลำดับบังคับ

- [ ] 1. **`src/.warnyin/workflow/README.md`** — เพิ่ม 1 บรรทัดใน utility list block (ราวบรรทัด 38–46 ต่อจาก `api-doc.md`): `` feedback.md         #   capability: FEEDBACK — เปิด GitHub issue แจ้ง feedback (gh + fallback URL) `` — _ผลลัพธ์:_ payload registry มี FEEDBACK capability, alignment คอลัมน์คอมเมนต์ตรงบรรทัดอื่น
- [ ] 2. **`CLAUDE.md`** (root) — เพิ่ม 1 บรรทัดใน section "## Slash commands (namespace `warnyin:`)" (บรรทัด 12–22): `` - `/warnyin:feedback:issue` → เปิด GitHub issue แจ้ง feedback ที่ warnyin/warnyin-agents (`.warnyin/workflow/feedback.md`) `` (wording ตรง Contract §1.1 แถว "บรรทัด registry") — _ผลลัพธ์:_ command โผล่ใน dogfood registry
- [ ] 3. **`CHANGELOG.md`** (root) — เพิ่ม entry ใต้ `## [Unreleased]` หมวด `### Added`: ระบุเพิ่ม command `/warnyin:feedback:issue` เปิด GitHub issue ที่ `warnyin/warnyin-agents` (gh + fallback URL) — _ผลลัพธ์:_ ผู้ใช้ npm migrate เองได้ตาม Keep a Changelog

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/.warnyin/workflow/README.md` — เติม 1 บรรทัดใน utility list block (minimal-diff)
- `CLAUDE.md` (root) — เติม 1 บรรทัดใน Slash commands list
- `CHANGELOG.md` (root) — เติม 1 entry ใต้ `## [Unreleased]` › `### Added`
- **ไม่แตะ:** ไฟล์ใหม่ของ playbook/adapter (เป็นของ task `feedback-playbook-command`), `cli.mjs`/packaging, `AGENTS.md`

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ — ตรง `design.md §8 task 2`)
- [ ] 3 registry ตรง Contract §1.1: (a) `README.md` มีบรรทัด FEEDBACK ใน utility list, (b) `CLAUDE.md` มีบรรทัด registry **wording ตรงเป๊ะ** Contract §1.1, (c) `CHANGELOG.md` มี entry ใต้ `### Added`
- [ ] CHANGELOG entry รูปแบบถูกตาม Keep a Changelog (วางใต้ `## [Unreleased]` › `### Added`)
- [ ] minimal-diff: เติมบรรทัดเท่านั้น ไม่จัดรูป/รื้อ format เดิมของแต่ละไฟล์; รักษา alignment ของ utility list ใน README
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern แก้ registry): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- **★ source ของ wording/ชื่อ/path:** `../../design.md` §1.1 Contract (task นี้ไม่ตัดสินชื่อเอง)
