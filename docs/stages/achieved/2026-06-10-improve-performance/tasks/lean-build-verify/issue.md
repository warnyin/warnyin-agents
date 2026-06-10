# Issue — dry-run: lean-build-verify

> ผล dry-run · 2026-06-10 · verdict: **GO — ไม่มี blocker**

## Blocker
- ไม่มี — พิกัดยืนยันตรงไฟล์จริง: build.md §3 ข้อ 4 (line 34), ข้อ 8 (line 38), §4 ข้อ 6 (line 60); developer.md line 21
- ★ **ownership conflict (panel TL-B1) หลีกเลี่ยงได้จริง** — `command/build.md` ไม่มี wording "self-verify scope" ระดับ per-agent (มันชี้ playbook); verify-scope อยู่ playbook §3 ข้อ 4 + role card เท่านั้น → แก้ build.md + developer.md พอ ไม่ต้องแตะ command

## Defer
| # | ประเด็น | เหตุผล |
|---|---|---|
| 1 | sync src→root | by design — งานของ full-gate/SHIP (design §6) |
| 2 | feature spec formal ของ verify-scope | by design §9 — defer SHIP |

## ⚠️ คำเตือน build agent
- **ห้ามแก้ `command/build.md` step 7** (full-gate copy ของมัน) เพื่อความ "สอดคล้อง" — spec test-flow ข้อ 5 จะ fail ถ้ามี diff ใน command

## สรุป
ไม่มี blocker ค้าง — พร้อม build
