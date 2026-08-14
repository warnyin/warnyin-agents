# Context — snapshot สถานะปัจจุบัน

> ⚠ ไฟล์นี้ถูก **commit** — จดข้อสรุป/ประเด็นเท่านั้น **ห้ามเขียน raw secret/token/credential, absolute path ของเครื่อง หรือ PII จริง**
> path/ไฟล์ที่อ้างถึงให้เขียนเป็น inline-code (backtick) **ห้ามใช้ markdown-link** (dead-link gate สแกนไฟล์นี้)

> snapshot ไม่ใช่ log — เขียนทับทุกครั้งที่อัปเดต (ไม่ต่อท้าย) · กติกาเติมดู `.warnyin/workflow/memory.md`

## กำลังทำอะไรอยู่
- topic `lean-ceremony` — **DESIGN เสร็จ ผ่าน gate §8** (`docs/stages/lean-ceremony/`): proposal + design + 5 task ครบ 4 ไฟล์; ถัดไป `/warnyin:build lean-ceremony`
- เป้าหมาย: ลด ceremony overhead 5 ข้อ — auto-route fast (confirm 1 ครั้ง) · C7 cap enforcement · optional gate trigger-by-signal · memory hook 6→2 จุด · BUILD↔VERIFY seam + artifact 3→1

## ค้างอะไร
- BUILD ของ `lean-ceremony` (wave 1 = 4 task ขนาน → wave 2 = `release-hygiene`)
- ระหว่าง wave 1 เคส `M2` ใน `src/tests/memory.test.mjs` **จะแดงเป็นปกติ** (exact-set 6 ไฟล์) — `release-hygiene` เป็นเจ้าของการแก้ expected 6→3 หลัง integrate ครบ; build agent ห้ามแก้เทสเอง

## เพิ่งตัดสินอะไรไป
- **tier = standard**; ข้าม business.md (ไม่มีมิติธุรกิจใหม่), ข้าม review panel, ข้าม dry-run (user เลือก)
- **ไม่ยุบ VERIFY เป็น phase ของ BUILD** — คง 2 stage เพื่อรักษา property "ผู้ตรวจอิสระจากผู้เขียน" (`docs/rule.md §5`) แล้วตัดรอยต่อ + ยุบ artifact แทน
- **C7 นับ cap ของ `design.md` เฉพาะบรรทัดก่อน `## 9. Spec delta`** — delta คือเนื้อ spec ที่ถูก merge ออกตอน SHIP ไม่ใช่ narrative
- **artifact ยุบเป็น `build.md` ชื่อเดิม + 4 section** (contract C1); validator ย้าย `verify.md`/`test.md` จาก required → optional แล้วใช้ section-based inference (contract C2)
- **version bump = minor `0.30.0`** (payload เปลี่ยนพฤติกรรมที่ผู้ใช้เห็น แต่ backward-compatible)
- **coherence review จับ blocker 1 อัน:** `M2` ไม่มี slice ไหนเป็นเจ้าของ + `release-hygiene` มี rule ห้ามแตะเทส → มอบ ownership ให้ `release-hygiene` พร้อมเงื่อนไข "พิสูจน์ด้วย negative-grep ก่อนแก้ expected"

## อัปเดตล่าสุด
- 2026-08-14 · topic `lean-ceremony` DESIGN เสร็จ — 5 task (wave 1 ×4 + wave 2 ×1), Spec delta 6 feature, gate §8 ผ่าน, `validate-topic` + `lint:md` เขียว
- 2026-08-14 · topic `universal-ide-spec` SHIP-lite เสร็จ — 9 Requirement + 12 Scenario (C5 pass)
- 2026-08-14 · topic `publish-pack-polish` SHIP เสร็จ — release `0.29.1` พร้อม publish
