# Issue — setup-dogfood-reliable

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 10)

## 1. สรุป
- ผลสแกน: blocker **0** ข้อ · defer **1** + caveat **2**
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (พร้อมเข้า BUILD)

## 2. รายการ issue
| # | ประเภท | จุดที่พบ | รายละเอียด | แนวทาง / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | spec §7 / design §8 | executable integration (รัน `setup:dogfood` จริง → root CORE = release) ต้อง spawn npx/npm + network | manual proof ตอน release ถัดไป — ไม่ block BUILD | open (release-time) |
| 2 | caveat | design §4 (clarified) | `verifyInstalled` ต้องรับ param `root` ไม่ hardcode module `repoRoot` (เพื่อ test ส่ง temp dir) | แก้ design §4 ระบุ signature `verifyInstalled(root)` แล้ว — BUILD เขียนตามนั้น | resolved |
| 3 | caveat | `setup-dogfood.mjs:101` (pack cli resolve) | `--update` ต่อท้าย `[cli, '--update']` ถูกทุก candidate (cli=arg แรก absolute, --update=arg สอง → `argv.slice(2)=['--update']`) | ยืนยันถูก — implement ตามนี้ | resolved |

## 3. ผลการแก้ไข
ไม่มี blocker ต้องแก้. dry-run ยืนยัน: `verifyInstalled` markers อยู่ใน CORE list จริง (`cli.mjs:88-94`) + payload (verify-pack R1); `--update` ถึง cli ทั้ง npx+node path (`cli.mjs:21-22`); main-guard/export pattern = verify-pack; unit auto-discover (`node --test` bare). C1 fold เข้า design §4 (signature รับ param). defer 1 ข้อ = release-time integration.
