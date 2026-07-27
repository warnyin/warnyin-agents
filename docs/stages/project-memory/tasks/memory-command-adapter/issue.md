# Issue — memory-command-adapter

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.9)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD — **สร้างเฉพาะเมื่อพบ issue**

## 1. สรุป
- ผลสแกน: blocker **0** ข้อ · defer **3** ข้อ
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (dry-run 2026-07-27 — เดิน implement ในหัวครบ 7 sub-task; พิกัดบรรทัดใน `task.md §4` **ตรงไฟล์จริงทุกจุด**, C6/C7 แทรกได้โดยไม่ชน marker/idempotent guard ใด, packaging ไม่ต้องแตะ, ownership ไม่ชนกับ T1/T2/T3/T5/T6)

### ผลตรวจประเด็นที่สั่งตรวจเป็นพิเศษ (ไม่พบ issue — บันทึกเป็นหลักฐาน)

| ประเด็น | ผลตรวจกับโค้ดจริง | สรุป |
|---|---|---|
| C6 ใน `CLAUDE.global.md` ชน marker ไหม | `installGlobalNote()` (`src/bin/cli.mjs:340-367`) เช็ค `existing.includes('<!-- warnyin:global-note -->')` เท่านั้น — marker อยู่บรรทัด 1 ของ template และยังติดไปกับ content ที่ append; แทรก section ท้ายไฟล์ (ใต้บรรทัด 5) ไม่กระทบ idempotent เลย | ✅ ปลอดภัย |
| C7 ต่างรูปแบบระหว่าง 2 registry | ไม่ขัดกัน — `task.md §4` กับดัก #1 + `standard.md §4` ตัดสินแล้วว่า **contract ชนะ pattern ประจำไฟล์**; T6 `spec.md §7 M5` declare needle เป็น `const` ตัวเดียวแล้ววนเช็คทั้ง 2 ไฟล์ (precedent `fastlane.test.mjs` D2 บรรทัด 107-129 ทำแบบเดียวกัน) | ✅ ไม่ขัด |
| ต้องแก้ packaging/`verify-pack` ไหม | `package.json files` มี `src/.claude/commands` · `verify-pack.mjs:6` `ALLOWED_PREFIX` มี `src/.claude/commands/` · R1 เช็คแค่ prefix `src/.claude/commands/warnyin/` (มีอยู่แล้ว) · `installCodeBuddyPlugin()` → `copyDirToTarget()` (`cli.mjs:308-333`) copy ทั้งโฟลเดอร์แบบ recursive ไม่ filter ชื่อไฟล์ · **ไม่มีเทสไหน assert จำนวน/เซ็ตของ command** (ตรวจ `installer.test.mjs` + `fastlane.test.mjs` แล้ว) | ✅ ไม่ต้องแตะ |
| C6 ใน `src/AGENTS.md` ทำ `installRootDoc` เพี้ยนไหม | guard คือ `existing.includes('warnyin/workflow/stages/')` (`cli.mjs:191`) — ยังพบที่บรรทัด 15 + ตาราง 20-24 หลังแทรก; ส่วน `content.replace(/^#\s[^\n]*\n/, ...)` แตะเฉพาะ H1 บรรทัดแรก ไม่โดน `## Project memory` | ✅ ไม่เพี้ยน |
| ชน ownership ตาม `design.md §7` | 5 ไฟล์ของ T4 ไม่ปรากฏใน ownership ของ T1/T2/T3/T5/T6 เลย · registry surface ที่มี slash-command list มีแค่ 2 ไฟล์จริง (grep `/warnyin:next` ทั้ง `src/` เจอ 2 hit) · `workflow/README.md` ไม่มี slash-command list (เป็นของ T1 อยู่แล้ว) | ✅ disjoint |
| EOL ของไฟล์ใหม่ | `.gitattributes` บังคับ `* text=auto eol=lf` ทั้ง repo → LF อัตโนมัติตอน commit; `eol.test.mjs` คุมเฉพาะ `.mjs` (ไม่ครอบ `.md` แต่ `.gitattributes` ครอบแล้ว) | ✅ ปลอดภัย |
| acceptance ทั้ง 5 ข้อพิสูจน์ได้ไหม | ครบทุกข้อมีเจ้าของเทสใน T6 `spec.md §7`: M5b (adapter มีอยู่+ชี้ playbook) · M5c (โหมดทบทวนไม่ลบเงียบ) · M5 (registry 2 ไฟล์) · M5d (ไม่เป็น skill — `readdirSync` ไม่มี entry `memory`, precedent `fastlane.test.mjs` F4) · M4/M4b (note 3 ไฟล์ + ข้อยกเว้น worktree) — **หมายเหตุ:** `design.md §8` เขียนย่อจนดูเหมือนขาด แต่ `tasks/release-hygiene/spec.md §7-§8` คุมครบ | ✅ พิสูจน์ได้ |

## 2. รายการ issue

| # | ประเภท | จุดที่พบ (ไฟล์/spec/โค้ด) | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | `src/bin/cli.mjs:181-199` (`installRootDoc`) + `:340-367` (`installGlobalNote`) · เทียบ `:296-306` (codebuddy rules) | **ผู้ใช้เดิมไม่ได้รับ C6/C7 แม้รัน `--update`** — `installRootDoc` skip เมื่อไฟล์เดิมมี `warnyin/workflow/stages/` อยู่แล้ว และ `installGlobalNote` skip เมื่อเจอ marker → `CLAUDE.md`/`AGENTS.md`/`~/.claude/CLAUDE.md` ของ install เดิม **ไม่มีวัน** ได้ registry line + `## Project memory`; ตรงข้ามกับ `codebuddy-rules.md` ที่ถูก overwrite เมื่อ `--update` → surface ที่ผู้ใช้เห็นไม่ตรงกันข้าม harness. ผลข้างเคียงในรอบ VERIFY: `npm run setup:dogfood` ก็ไม่อัปเดต root `CLAUDE.md` ของ repo นี้ด้วยเหตุผลเดียวกัน | **ไม่ใช่ของ T4 แก้** (ห้ามแตะ `cli.mjs` — เป็นของ T3 และ `rule.md` ห้ามแตะ packaging/installer) · **precedent ยอมรับแล้ว:** `/warnyin:fastlane` (0.27.0) เพิ่ม registry line แบบเดียวกันโดยไม่มี migration note · เสนอให้ **T6 เติม 1 bullet ใน `### Migration` ของ CHANGELOG** ว่า "ผู้ใช้เดิมที่อยากได้ `/warnyin:memory` ในรายการ slash command ของ `CLAUDE.md` ให้เติมเองหรือลบ/สร้าง `CLAUDE.md` ใหม่" — main loop ตัดสิน | open (tracked → T6/SHIP) |
| 2 | defer | `design.md §4 C6` + `src/.warnyin/installer/templates/CLAUDE.global.md` | **C6 ใน global note ไม่มีเงื่อนไข scope** — ไฟล์นี้ถูก append เข้า `~/.claude/CLAUDE.md` ซึ่ง auto-load **ทุกโปรเจกต์** รวมโปรเจกต์ที่ไม่ได้ติดตั้ง warnyin; ข้อความ C6 สั่งตรงๆ ว่า "ความจำระดับโปรเจกต์อยู่ใน repo: `docs/stages/context.md` + `docs/memory.md` … เขียนลง 2 ไฟล์นี้แทน" (ต่างจาก note เดิมในไฟล์เดียวกันที่เป็น conditional resolution) → agent อาจสร้าง `docs/memory.md` ในรีโปที่ไม่เกี่ยวข้อง และ `กติกาเต็ม: .warnyin/workflow/memory.md` ก็ resolve ไม่ได้ | **T4 ห้ามแก้เอง** — canonical-copy บังคับ copy C6 คำต่อคำเหมือนกันทั้ง 3 ไฟล์ (`rule.md §1`), การเติมประโยคเงื่อนไขเฉพาะไฟล์ global = paraphrase contract. ถ้าจะปิดต้อง **แก้ที่ `design.md §4 C6`** (เช่น เพิ่มวลี "ถ้าโปรเจกต์นี้ใช้ warnyin (มี `.warnyin/`)") ซึ่งกระทบทั้ง 3 ไฟล์ + T6 M4 → **เสนอ user/main loop ตัดสิน; ไม่ block BUILD** (T6 M4 assert แค่ heading + 2 path จึงยังเขียวไม่ว่าตัดสินทางไหน) | open (รอ user/main loop) |
| 3 | defer | `tasks/memory-command-adapter/spec.md §7` (Negative) เทียบ `tasks/release-hygiene/spec.md §7` (M1-M9) | **negative 2 ข้อของ T4 ไม่มีเจ้าของเทส:** (ก) "command adapter ไม่ inline กติกา — ไม่มี closed-set `gotcha`/`promoted`/`dropped`, ไม่มีเกณฑ์ 60/30/90" → M3 คุมแค่สตริง `working state (ปัจจุบัน)` เท่านั้น · (ข) "`src/AGENTS.md` ไม่มีสตริง `/warnyin:memory`" → M5 assert แค่ presence ใน 2 registry ไม่ได้ assert absence ใน `AGENTS.md`. เพิ่มเติม M5c เช็คแค่บรรทัดที่มี `user`+`ยืนยัน` — **ไม่ได้เช็ค `ห้ามลบเงียบ`** ที่ acceptance ของ T4 บังคับ | **ไม่ block** — T4 เขียนเทสเองไม่ได้ (`src/tests/memory.test.mjs` เป็นของ T6, `task.md §4` ห้ามแตะไฟล์นอก 5 ใบ). ทางปิด 2 ทาง: (1) main loop สั่ง T6 เติม M5e (negative closed-set/ตัวเลข + absence ใน `AGENTS.md` + `ห้ามลบเงียบ`) ตอน wave 2 · (2) ตรวจด้วยมือใน VERIFY. **กับดักตอนเขียน (ให้ผู้ทำ BUILD ระวัง):** ในโหมดทบทวนให้ใช้คำว่า `promote` **ห้ามเขียน `promoted`/`dropped`** ซึ่งเป็นค่าใน closed-set ที่ negative spec ห้าม | open (tracked → T6/VERIFY) |

> - **blocker** — ทำให้ implement ตาม spec ไม่ได้ (ขัดแย้งกับโค้ดจริง/task อื่น, ข้อมูลขาด, dependency ผิด) → ต้องแก้ DESIGN ก่อนเข้า BUILD
> - **defer** — ตัดสินใจ/ทำทีหลังได้ ไม่ block การเริ่ม BUILD แต่ต้องบันทึกและให้ user รับทราบ

## 3. ผลการแก้ไข

ไม่มี blocker → **ไม่ต้องแก้ `design.md` หรือไฟล์ task ก่อนเข้า BUILD** (dry-run นี้ read-only ไม่แก้ไฟล์ใดนอกจากใบนี้)

- defer #1, #3 → track ไว้ระดับ topic ส่งต่อให้ **T6 (release-hygiene) / VERIFY** พิจารณา
- defer #2 → ต้องการการตัดสินของ user/main loop ว่าจะแก้ contract C6 หรือรับความเสี่ยง scope leak ของ global note — ตัดสินทางไหนก็ไม่กระทบการเริ่ม BUILD ของ T4 (ถ้าตัดสินให้แก้ C6 ก่อน ให้แก้ที่ `design.md §4` แล้วค่อยเริ่ม T4 เพื่อไม่ต้องแก้ 3 ไฟล์ซ้ำ)
