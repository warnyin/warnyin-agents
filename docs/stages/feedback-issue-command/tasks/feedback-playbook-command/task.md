# Task — feedback-playbook-command

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `feedback-playbook-command` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (payload playbook + command adapter) |
| **Model tier** | `balanced` _(เขียน playbook มี logic detect ladder + flow 3 ประเภท + confirm gate — คิดรอบคอบ แต่เป็น guidance markdown ไม่ใช่โค้ดรัน)_ |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
> ส่งมอบ **capability ใช้งานได้จริง end-to-end** — เรียก `/warnyin:feedback:issue` แล้วได้ flow เปิด GitHub issue ที่ `warnyin/warnyin-agents` ครบ (เลือกประเภท → สัมภาษณ์สั้น → preview → confirm → ยิงด้วย gh หรือ fallback URL) โดยสร้างไฟล์ payload ใหม่ 2 ไฟล์: **playbook กลาง** (flow/logic, single source) + **command adapter บาง** (entrypoint ชี้กลับ playbook)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: _(ไม่มี)_ — พึ่ง **Contract `design.md §1.1`** (command id + path + frontmatter + repo + prefix + label) ที่ล็อกแล้ว ไม่ใช่ runtime ของ task อื่น
- ปลดล็อกให้: `feedback-registration` พึ่ง **contract เดียวกัน** (ชื่อ command + path playbook + description) → **ขนานได้** ไม่ต้องรอ task นี้เขียนเสร็จ (file-ownership disjoint: task นี้สร้างไฟล์ใหม่ใน `src/.warnyin/`+`src/.claude/`; registration modify `README.md`/`CLAUDE.md`/`CHANGELOG.md`)
- ส่ง output ต่อ: ไฟล์ playbook + adapter จริงตาม contract → พิสูจน์ integration (command ติด + ชื่อตรง registry) ที่ VERIFY full-gate

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
- [ ] 1. **เขียน playbook กลาง** `src/.warnyin/workflow/feedback.md` — callout "Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน" + flow 3 ประเภท (Bug/Feature/Improvement) + body template ต่อประเภท (`design.md §3`) + detect ladder gh→`gh auth status`→fallback URL (`§4`) + confirm gate บังคับก่อนยิง (D5) + กฎไม่ดึง session context เองถ้า user ไม่สั่ง (D4 privacy) + repo hardcode `warnyin/warnyin-agents` + title prefix + best-effort label — _ผลลัพธ์:_ single source ของ flow
- [ ] 2. **เขียน command adapter** `src/.claude/commands/warnyin/feedback/issue.md` — บาง: frontmatter `description`+`argument-hint` ตรง `design.md §1.1` + เนื้อหาสั้นชี้ `.warnyin/workflow/feedback.md` + ส่ง `$ARGUMENTS` (seed) — _ขึ้นกับ 1:_ ชี้ playbook ที่ path ถูก
- [ ] 3. **self-check** — frontmatter ตรง contract §1.1 เป๊ะ (description/argument-hint) + adapter ชี้ playbook ถูก path + ไม่มี path/secret hardcode เกิน repo เป้าหมาย + playbook ครอบ flow ครบ (3 ประเภท + prefix + detect ladder + confirm + no-session-pull)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **owns (สร้างใหม่):** `src/.warnyin/workflow/feedback.md` + `src/.claude/commands/warnyin/feedback/issue.md` (nested namespace `warnyin/feedback/` — โฟลเดอร์ใหม่)
- **ห้ามแตะ:** `README.md`/`CLAUDE.md`/`CHANGELOG.md` (feedback-registration owns), `cli.mjs`/`package.json`/`verify-pack.mjs` (`design.md §6`: copyTree recursive + verify-pack prefix รองรับอยู่แล้ว → ไม่ต้องแก้ packaging), playbook stage อื่น, AGENTS.md (ชี้ playbook ตรง ไม่ enumerate)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ) — ตรง `design.md §8` task 1
- [ ] ไฟล์ playbook `src/.warnyin/workflow/feedback.md` + adapter `src/.claude/commands/warnyin/feedback/issue.md` **มีจริง**
- [ ] adapter มี frontmatter ตรง `§1.1` (`description` + `argument-hint`) + ชี้ `.warnyin/workflow/feedback.md` + ใช้ `$ARGUMENTS`
- [ ] playbook ครอบ flow ครบ: 3 ประเภท + title prefix `[Bug]/[Feature]/[Improvement]` + detect ladder gh→auth→URL + confirm gate + กฎไม่ดึง session context เอง
- [ ] ไม่มี path/secret hardcode เกิน repo เป้าหมาย `warnyin/warnyin-agents`
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
