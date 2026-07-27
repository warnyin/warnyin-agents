# Issue — installer-seed (T3)

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.9)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD
> **ผู้สแกน: main loop** (subagent ถูกตัดจบกลางคันเพราะชน weekly limit ของ API — สแกนซ้ำเองกับโค้ดจริง)

## 1. สรุป
- ผลสแกน: blocker **0** ข้อ · defer **3** ข้อ
- สถานะรวม: ☑ ไม่มี blocker ค้าง — เข้า BUILD ได้

## 2. รายการ issue

| # | ประเภท | จุดที่พบ | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | `src/.warnyin/workflow/init.md` §5 gate · `task.md` sub-task 6 | gate ของ INIT ข้อแรกคือ "ไฟล์ทุกแถวในตาราง §4 ถูกเขียนลง `docs/` จริง" — ถ้าเพิ่ม `docs/memory.md` + `docs/stages/context.md` เข้าตาราง §4 แบบไม่มีเงื่อนไข โปรเจกต์ที่ติดตั้งจาก **release เก่าที่ยังไม่มี template 2 ใบ** จะรัน INIT ไม่ผ่าน gate | ทำตาม sub-task 6 ให้ครบ — แถวใหม่ใน §4 ต้องกำกับว่า **มาจาก seed ที่ step 0 (ไม่ใช่ไฟล์ที่ INIT วิเคราะห์แล้วเติมเนื้อ)** และ gate เป็น **conditional/N-A** เมื่อ template ไม่มี | open |
| 2 | defer | `npm run setup:dogfood` → repo นี้เอง | หลัง release แรก ใครรัน `setup:dogfood` จะได้ `docs/memory.md` โผล่ใน working tree ที่ **tracked** (installer seed `docs/` ทุกครั้ง) — ต้องตัดสินว่า commit หรือ ignore; ถ้า commit จะอยู่ใต้ข้อบังคับ C12a (ห้าม secret / 0 markdown-link) และถูก `lint:md` สแกน | ไม่ใช่งานของ T3 — T6 เขียน Migration ใน CHANGELOG แล้ว; ตัดสินขั้นสุดท้ายที่ **SHIP** (พร้อม note ใน `docs/infra.md`) | open |
| 3 | defer | `task.md` §5 acceptance ("`npm run verify:pack` เขียว") | ใน wave 1 `verify-pack.mjs` ยัง**ไม่มี** assertion ว่า template ติด tarball (T6 เป็นคนเพิ่ม) → เขียวตอน T3 **ไม่ได้พิสูจน์** ว่า template ขึ้น tarball จริง (เป็น gate ลวงชนิดเดียวกับที่ `design.md §6` ระบุ) | ปล่อยไว้ — assertion จริงมาที่ T6; T3 แค่ต้องไม่ทำให้ `verify-pack` เดิมแดง (allowlist `src/.warnyin/` ครอบอยู่แล้ว) | open |

## 3. ผลการแก้ไข

ไม่มี blocker ให้แก้ · defer ทั้ง 3 ข้อถูก track ไว้แล้วในไฟล์ task ของ T3/T6 และงาน SHIP

### สิ่งที่ตรวจแล้วว่า **ถูกต้อง** (ยืนยันกับโค้ดจริง — บันทึกกัน dry-run ซ้ำ)

- **ลำดับ `ensureScaffold()` → `seedDocs()`** ใน `main()` project branch ถูกต้องตามที่ `spec.md §4.1` เขียน และทั้งคู่ถูกเรียก**ทุกครั้ง**ไม่ขึ้นกับ `--update` ✅
- **`seedDocs` recursive จริง** (เรียกตัวเองเมื่อ `entry.isDirectory()`) และคำนวณปลายทางด้วย `path.relative(TEMPLATE_DOCS, rel)` → `template/docs/stages/context.md` ลงที่ `docs/stages/context.md` ถูกต้อง ✅
- **ถอด `context.md` ออกจาก `SCAFFOLD_FILES` แล้ว `docs/stages/` ยังถูกสร้าง** — entry ที่เหลือ (`docs/stages/achieved/.gitkeep`) ใช้ `mkdirSync(..., {recursive:true})` จึงสร้างโฟลเดอร์แม่ให้อยู่แล้ว ✅
- **เคส 9 เดิมยังเขียว** — assert แค่ `existsSync` ของ `docs/stages/context.md` + `achieved/.gitkeep` + ไม่มี topic รั่ว; หลังเปลี่ยนไฟล์มาจาก `seedDocs` ทุก assertion ยังจริง ✅
- **เคส 1 ไม่พัง** — ใช้ **inclusion list** (วน `for (const rel of [...])` แล้ว `existsSync`) ไม่ใช่ exact-set ของไฟล์ใน `docs/` → การ seed `docs/memory.md` เพิ่มไม่กระทบ ✅
- **เคส 7 (negative `[` prefix)** ไม่กระทบ — `template/docs/stages/` ไม่ได้ขึ้นต้นด้วย `[` และไม่ทำให้ `docs/features/` เกิด ✅
- **เคส 8 (`--dry-run`)** ปลอดภัย — `seedDocs` ห่อการเขียนด้วย `if (!DRY)` ✅
- **packaging ไม่ต้องแก้** — `package.json files` มี `src/.warnyin` และ `ALLOWED_PREFIX` ของ `verify-pack` มี `src/.warnyin/`; `DENY_PREFIX 'docs/'` เป็น prefix-match จึงไม่จับ `src/.warnyin/template/docs/` ✅
- **ไม่ชนไฟล์ของ task อื่น** ตาม `design.md §7` ✅
