# Issue — dry-run: triage-playbook

> ผล dry-run · 2026-06-11 · verdict: **GO** — ไม่มี blocker

## Blocker
- ไม่มี — canonical §3 ครบพอ copy (3A/3B/3C/3D), pattern next.md ลอกได้ตรง, ไฟล์ disjoint

## Defer / ข้อต้องระวังตอน build (แก้ที่ task แล้ว)
| # | ประเด็น | สถานะ |
|---|---|---|
| D1 | **heading slug** — `lint:md` strip anchor (`lint-md.mjs` `target.split('#')[0]`) ไม่ validate anchor → ถ้า heading ไทยจะ silent dead-link | ✅ task/spec/standard บังคับ `## Fast-track skip-list` (อังกฤษ) + VERIFY ตรวจ anchor manual (design §8 (6)) |
| D2 | hard-floor "6 หมวด" vs list 5 | ✅ แก้เป็น **5 หมวด** ทั่ว design + task/spec |
| D3 | payload generic — ห้ามชื่อรุ่น/tool แม้ประโยคปฏิเสธ | acceptance task §5 + rule §1; VERIFY grep |
| D4 | rule ใหม่ "change-sizing = judgment router (⚠)" | รอ SHIP (rule.md §2) |

## สรุป
ไม่มี blocker ค้าง — D1/D2 แก้ที่ task/design แล้ว, D3/D4 by-design
