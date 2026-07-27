# Issue — release-hygiene (T6)

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.9)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD
> **ผู้สแกน: main loop** (subagent ถูกตัดจบกลางคันเพราะชน weekly limit ของ API — สแกนซ้ำเองกับไฟล์จริง)

## 1. สรุป
- ผลสแกน: blocker **0** ข้อ · defer **4** ข้อ
- สถานะรวม: ☑ ไม่มี blocker ค้าง — เข้า BUILD ได้ (แต่เป็น wave 2 ต้องรอ T1-T5 integrate ก่อน)

## 2. รายการ issue

| # | ประเภท | จุดที่พบ | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | `spec.md §7 M8` · `src/.warnyin/workflow/stages/ship.md` | M8 นับ `- [ ]` ของ **ทั้งไฟล์** `ship.md` แล้วเทียบกับ 12 — วันนี้ปลอดภัยเพราะ checkbox ทั้ง 11 อันอยู่ใน §6 ทั้งหมด (บรรทัด 88-98 ขณะที่ §6 เริ่มบรรทัด 86) **แต่เปราะ**: ถ้าอนาคตมีใครเพิ่ม checklist ที่ section อื่นของ `ship.md` เคสจะแดงโดยที่ gate ไม่ได้ผิดจริง | ยอมรับได้รอบนี้ (ตัวเลข baseline ยืนยันแล้ว) — ถ้าจะทำให้ทน ให้ **จำกัดช่วงนับตั้งแต่ heading `## 6.` ถึงท้ายไฟล์** ตอนเขียนเทส | open |
| 2 | defer | `task.md §5` (acceptance `lint:md`) | acceptance เขียนว่า `npm run lint:md` ต้องเขียวโดยรวม "`docs/memory.md` ของ dogfood" — แต่ไฟล์นั้นจะมีก็ต่อเมื่อมีคนรัน `setup:dogfood` **หลัง** release แล้วเท่านั้น → ตอน T6 build ไฟล์ยังไม่มี ทำให้ข้อความส่วนนี้ vacuous | ไม่ต้องแก้ — `lint:md` ครอบไฟล์ที่มีจริงอยู่แล้ว; ถือเป็นการเขียนเผื่อ ไม่ใช่เงื่อนไขที่ต้องพิสูจน์ในรอบนี้ | open |
| 3 | defer | `spec.md §7` (verify-pack) · `src/tests/verify-pack.test.mjs` | การเติม path ใหม่เข้า fixture `GOOD` ของเคสเดิมทำให้ **input ของเคสเดิมเปลี่ยน** แม้ assertion (`deepEqual(..., [])`) จะไม่ถูกแตะ — เป็นเส้นบาง ๆ ของกติกา "ห้ามแก้ assertion เดิม" | ยอมรับตามที่ `spec.md` ให้เหตุผลไว้ (fixture ≠ assertion) — แต่ให้ **เพิ่มเคส negative ใหม่แยก** เป็นตัวพิสูจน์หลักว่า assertion ใหม่จับได้จริง (sub-task 5 ระบุไว้แล้ว) | open |
| 4 | defer | `task.md §3.1` (CHANGELOG) · `package.json` | entry เขียนใต้ `## [Unreleased]` และ **ไม่ bump version** เพราะ `package.json` อยู่นอก ownership — แปลว่า topic นี้ปิดโดยที่ยังไม่มีเลขรุ่น | ตามที่ `rule.md §2` ระบุ: rename หัวข้อ + bump `package.json` เป็นงานของ **main loop/SHIP** — ต้องไม่ลืมตอน SHIP | open |

## 3. ผลการแก้ไข

ไม่มี blocker · **1 ประเด็นถูกแก้ที่ `design.md` แทน**: §8 เคยถูกผมปรับเป็น "whitelist 6 ไฟล์" ซึ่งอ่อนกว่าเจตนาของ M2 → คืนเป็น **exact set = 6 ไฟล์** แล้ว โดยอาศัย **constraint A4b ของ T1** (ห้ามมีบรรทัดใน `memory.md` ที่มีทั้ง 2 สตริง) เป็นเงื่อนไขที่ทำให้ assert นี้ถือได้ — ได้ทั้งความครบของ hook และการจับ "hook ถูกลอกไปที่อื่น"

### สิ่งที่ตรวจแล้วว่า **ถูกต้อง** (ยืนยันกับไฟล์จริง)

- **M8 baseline ถูก** — `ship.md` มี `- [ ]` 11 อันพอดี และอยู่ใน §6 ทั้งหมด → หลัง C4c ต้องเป็น 12 ✅
- **M3 ขอบเขตสแกนถูก** — spec ระบุ "walk `.md` ทั้งหมดใต้ `src/`" → `design.md` ของ topic นี้ (อยู่ `docs/`) ที่มีสตริงเดียวกันจึงอยู่นอกขอบเขต **ไม่ทำให้ negative-grep แดง** ✅ (ประเด็นที่ผมกังวลไว้ตั้งแต่ต้น — ปิดแล้ว)
- **M5 registry 2 ไฟล์** — `installer/templates/CLAUDE.md` + `codebuddy-rules.md` เป็นคู่ registry จริง (`src/AGENTS.md` ไม่มี slash-command list) และ precedent `fastlane.test.mjs` D2 ทำแบบเดียวกัน ✅
- **fix authority ระบุชัด** — gate แดงเพราะไฟล์ของ T1-T5 → หยุด รายงาน main loop ไม่แก้ข้ามเจ้าของ ✅
- **`MIN_PASS` เป็น floor** (46) การเพิ่มเคสไม่ทำให้ตก; ตัวที่ตกได้คือ `pass !== tests` ซึ่งกันด้วยข้อห้าม `t.skip()` ✅
- **ordering proxy ใช้ needle เฉพาะแล้ว** — `design.md §9` แก้เป็น `**สรุป promotion plan + ขออนุมัติ (ครั้งเดียว):**` หลัง dry-run T2 จับได้ว่า `promotion plan` เปล่ามี 2 จุด ✅
