# Issue — move-source-to-src

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.9)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD — **สร้างเฉพาะเมื่อพบ issue**

## 1. สรุป
- ผลสแกน: blocker **0** ข้อ · defer **2** ข้อ
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (เริ่ม BUILD ได้) / ☐ มี blocker ค้าง (ห้ามเข้า BUILD)
- พิสูจน์จริงแล้ว (read-only sim ใน temp, ไม่แตะ repo): หลัง `git mv → src/` + แก้ `package.json bin` อย่างเดียว → `node --test` จาก root **pass 9/9**, fresh install จาก `src/bin/cli.mjs` payload ครบ + provenance มาจาก `src/.warnyin`/`src/.claude`/`src/AGENTS.md` ถูก, guard ไม่ false-trigger

## 2. รายการ issue
| # | ประเภท | จุดที่พบ (ไฟล์/spec/โค้ด) | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | `design.md §2` slice T3 vs `task.md` sub-task 1/§4 | wording overlap: slice T3 เขียนว่า "ย้าย test ไป `src/tests/`" แต่ T1 mapping (§3) + sub-task 1 + scope §4 ก็รวม `tests/ → src/tests/` อยู่แล้ว และ acceptance T1 บังคับ `node --test` เห็น 9 pass → การ "ย้าย" เป็นงานของ T1 จริง | T1 เป็นเจ้าของการย้าย `tests/`; T3 รับผิดชอบเฉพาะ **CI matrix discovery gate (node 20/22/24) + พฤติกรรม `scripts.test` cross-node** ไม่ใช่การย้ายซ้ำ — ไม่ block T1. แค่ track ให้ T3 ไม่ย้ายซ้ำ/ไม่ตีความว่า test ยังไม่ถูกย้าย | open |
| 2 | defer | `package.json files` (ค่าเก่า `bin`,`.warnyin`,...) — order hazard ที่ user ถามข้อ 5 | T1 แก้แค่ `bin` ปล่อย `files` เป็นค่าเก่า (เป็นของ T2). พิสูจน์: `node --test` + fresh-install acceptance ของ T1 **ยังเขียว** (test เป็น black-box spawn cli ตรง ๆ; installer อ่าน working tree ไม่ใช่ tarball). **แต่** `npm pack --dry-run` ตอน T1-state ได้ tarball เพี้ยน (4 ไฟล์, ขาด `src/.warnyin/*` + `src/.claude/*`) | ไม่ใช่ blocker ของ T1 (pack/publish ไม่อยู่ใน acceptance T1). **ห้ามรัน `npm pack`/`verify:pack` เป็น gate ของ T1** — tarball จะถูกต้องหลัง T2 แก้ `files` granular + verify-pack เท่านั้น | open |

> - **blocker** — ทำให้ implement ตาม spec ไม่ได้ (ขัดแย้งกับโค้ดจริง/task อื่น, ข้อมูลขาด, dependency ผิด) → ต้องแก้ DESIGN ก่อนเข้า BUILD
> - **defer** — ตัดสินใจ/ทำทีหลังได้ ไม่ block การเริ่ม BUILD แต่ต้องบันทึกและให้ user รับทราบ

## 3. ผลการแก้ไข
<!-- ทั้ง 2 ข้อเป็น defer — ไม่ต้องแก้ design ก่อน BUILD. แค่ track:
  #1 → ตอนทำ T3 ให้รู้ว่า tests ถูกย้ายโดย T1 แล้ว (T3 = CI matrix gate เท่านั้น)
  #2 → acceptance ของ T1 ใช้ `node --test` + fresh install เท่านั้น; pack-verify เป็นของ T2 -->
