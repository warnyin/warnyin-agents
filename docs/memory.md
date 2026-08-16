# Memory — บทเรียนสะสมระดับโปรเจกต์

> ⚠ ไฟล์นี้ถูก **commit** — จดข้อสรุป/ประเด็นเท่านั้น **ห้ามเขียน raw secret/token/credential, absolute path ของเครื่อง หรือ PII จริง**
> path/ไฟล์ที่อ้างถึงให้เขียนเป็น inline-code (backtick) **ห้ามใช้ markdown-link** (dead-link gate สแกนไฟล์นี้)

> กติกาเต็ม (วิธีเขียน/promote/archive) ดู `.warnyin/workflow/memory.md`

| # | บทเรียน (what) | ที่มา (evidence pointer) | ประเภท | วันที่ | สถานะ |
|---|---|---|---|---|---|
| 1 | coherence review หลัง fan-out task ต้องไล่ **ownership ของเทสที่ assert สถานะข้าม slice** ด้วย ไม่ใช่แค่ contract/dependency — เทส exact-set ที่ทุก slice "เห็นแต่ส่วนของตัวเอง" มักไม่มีใครรับ แล้วกลายเป็น gate แดงถาวร | `design.md §7 ของ topic lean-ceremony` (เคส `M2` ของ `src/tests/memory.test.mjs` — 3 task ชี้เจ้าของไม่ตรงกัน และ task ที่ถูกชี้มี rule ห้ามแตะเทส) | gotcha | 2026-08-14 | promoted |
| 2 | cap ขนาดเอกสารต่อ artifact ควรนับ **เฉพาะส่วน narrative** — section ที่เป็นเนื้อ spec ซึ่งจะถูก merge ออกไปตอน SHIP (Spec delta) ไม่ควรถูกนับ ไม่งั้น topic ที่แตะหลาย feature ติด cap ทั้งที่ design สั้น | `design.md §4 C3 ของ topic lean-ceremony` (topic นี้เอง: narrative 66 บรรทัด vs ทั้งไฟล์ 230) — **dropped:** ไม่ต้องเป็น rule แยกเพราะถูก implement เป็นพฤติกรรมของ gate ไปแล้ว (C7 นับเฉพาะบรรทัดก่อน `## 9. Spec delta`) และมี requirement คุมใน `docs/features/topic-validator/spec.md` | ข้อสังเกต | 2026-08-14 | dropped |

**ประเภท (closed set):** `gotcha` · `บทเรียน` · `ข้อสังเกต`
**สถานะ (closed set):** `open` · `promoted` · `dropped`
