# Context — snapshot สถานะปัจจุบัน

> ⚠ ไฟล์นี้ถูก **commit** — จดข้อสรุป/ประเด็นเท่านั้น **ห้ามเขียน raw secret/token/credential, absolute path ของเครื่อง หรือ PII จริง**
> path/ไฟล์ที่อ้างถึงให้เขียนเป็น inline-code (backtick) **ห้ามใช้ markdown-link** (dead-link gate สแกนไฟล์นี้)

> snapshot ไม่ใช่ log — เขียนทับทุกครั้งที่อัปเดต (ไม่ต่อท้าย) · กติกาเติมดู `.warnyin/workflow/memory.md`

## กำลังทำอะไรอยู่
- **ไม่มี topic ที่เปิดค้าง** — `lean-ceremony` SHIP เสร็จแล้ว (archive `docs/stages/achieved/2026-08-16-lean-ceremony/`)
- branch `build/lean-ceremony` มี 6 commit รอ user ตัดสินใจ **merge เข้า main + publish `0.30.0`** (SHIP ไม่แตะ git merge/publish ตาม playbook)

## ค้างอะไร
- **merge + publish `0.30.0`** — รอ user สั่ง
- `docs/backlog.md` มี 2 entry `open`: (1) rename `## 5. Write points (hook ต่อ stage)` ใน `.warnyin/workflow/memory.md` ให้ตรงนิยาม "จุดจบงาน" (ต้องแก้ inbound pointer + เทส `M1` พร้อมกัน) · (2) ตัวเลขจำนวนเคสใน `docs/techstack/installer/{structure,test}.md` ค้างจากรุ่นเก่า
- dogfood ที่ root ยังเป็น `0.29.1` — รัน `npm run setup:dogfood` หลัง release เพื่อให้ workflow ที่ใช้พัฒนาเองได้ ceremony ชุดใหม่

## เพิ่งตัดสินอะไรไป
- **ceremony ลด 5 จุด** โดยไม่แตะ gate: auto-route fast (confirm 1 ครั้ง) · C7 cap enforcement · optional gate trigger-by-signal · memory hook 6→3 · BUILD↔VERIFY seam + artifact `build.md` เดียว 4 section
- **ไม่ยุบ VERIFY เป็น phase ของ BUILD** — รักษา property "ผู้ตรวจอิสระจากผู้เขียน" (ยกขึ้นเป็น rule ระดับปรัชญาแล้ว)
- **C7 นับ cap เฉพาะ narrative** (บรรทัดก่อน `## 9. Spec delta`) · tier อ่านไม่ได้ = ⚠ ไม่บังคับ (fail-safe)
- **VERIFY จับ 6 blocker ที่ gate ทุกตัวเขียวสนิท** — ที่ร้ายแรงสุดคือ `parseTier` อ่านค่าตัวอย่างในแถว template เป็นค่าจริง ทำให้ C7 ปิดตัวเองเงียบ; บทเรียนถูก promote เป็น KB #34/#35 + ขยาย #31/#32
- learned-rule promote 13 ข้อ (project 9 · component:installer 4) · drop 2 (1 เข้า backlog · 1 implement ไปแล้ว)

## อัปเดตล่าสุด
- 2026-08-16 · topic `lean-ceremony` SHIP เสร็จ — promote 13 rule · merge Spec delta 6 feature · KB +2/ขยาย 2 · archive; gate 248/248 · lint:md 132/116 · verify:pack 105
- 2026-08-15 · VERIFY เสร็จ — 1 รอบแก้ 21 จุด (validator 3 · pointer 14 · narrative 4); panel อิสระ 2 คน + re-verify 1 รอบ
- 2026-08-14 · BUILD เสร็จ — wave 1 (4 slice ขนาน) + wave 2 (release-hygiene); 213 → 248 เคส
