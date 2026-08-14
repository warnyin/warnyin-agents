# Backlog (กลาง)

> คลังงาน **deferred-out** ของทั้งโปรเจกต์ — งานที่ยกออกจาก scope แล้ว (ทำทีหลัง / อาจไม่ทำ / รอเงื่อนไข) — สะสมจากทุก topic
> = **current state** ของงานที่รออยู่ (archive `docs/stages/achieved/` ไม่นับ — default-exclude)
> ป้อนเข้ามาตอน **SHIP**: ยก entry ที่ `open` จาก `docs/stages/<topic>/backlog.md` (หลัง archive) มารวมที่นี่ — กลั่นไม่ copy ดิบ (รวมของซ้ำ, skip ที่ `promoted`)
> นิยามเต็ม (semantic / governance / schema / promote) ดู `.warnyin/workflow/backlog.md`

---

## วิธีค้น
ค้นด้วยคำในรายการ, ที่มา (topic/stage), หรือประเภท — entry เรียงตามประเภทแล้วตามความใหม่
ทุกการ **หยิบ** item เข้า scope ใหม่ = **เสนอ → user ตัดสิน** (recommend-not-auto)

---

## รายการ
ประเภท ∈ {`ทำทีหลัง`, `อาจไม่ทำ`, `รอเงื่อนไข`} · สถานะ ∈ {`open`, `promoted`, `dropped`}

<!-- ยังไม่มี entry — เพิ่มตอน SHIP จาก topic backlog.md (entry open) -->

| # | รายการ (what) | ที่มา (stage + ไฟล์/อ้างอิง) | ประเภท + เหตุผล | สถานะ | มาจาก topic |
|---|---|---|---|---|---|
| 1 | ~~เพิ่ม **EOL guard ระดับ tarball ใน `verify:pack`**~~ — **ทำแล้วใน topic `publish-pack-polish`** (Slice A: `checkEol` Buffer-level `0x0D` check + path guards + size cap; 13 unit tests; sandbox EOL proof ผ่าน; supersede KB #30 partial) | `BUILD · build.md §3.6` + KB #30 | `ทำทีหลัง` → ทำเสร็จ 2026-08-14 | `dropped` — ปิดโดยทำเสร็จ | `project-memory` → `publish-pack-polish` |
| 2 | ~~ทำให้ **`npm run verify:pack` รันบน Windows dev ได้**~~ — **ทำแล้วใน topic `publish-pack-polish`** (Slice A: `getNpmCmd(platform)` ใช้ `process.execPath + npm_execpath` ไม่ใช้ `.cmd`; ปิด CVE-2024-27980 + PATH/CWD hijack; supersede KB #4) | `BUILD/VERIFY · KB #4` | `ทำทีหลัง` → ทำเสร็จ 2026-08-14 | `dropped` — ปิดโดยทำเสร็จ | `project-memory` → `publish-pack-polish` |
| 3 | ~~**refresh root dogfood** — `.warnyin/.warnyin-version` ยังเป็น `0.22.0`~~ **ทำแล้ว 2026-07-27** (`npm run setup:dogfood` หลัง publish 0.28.0 → stamp `0.28.0`; payload ที่ root 5356 ไฟล์ text · **CRLF 0** = ยืนยัน `normalizeEol` ทำงานผ่านเส้นทางจริง publish→npx→ติดตั้ง) | `BUILD · KB #30` | `รอเงื่อนไข` (เงื่อนไขครบแล้ว) | `dropped` — ปิดโดยทำเสร็จ | `project-memory` |
| 4 | ~~แก้ wording `--help` ใน `cli.mjs` ที่เคลมว่า `--update` "ไม่แตะ `docs/`"~~ — **ทำแล้วใน topic `publish-pack-polish`** (Slice B: แก้ 4 จุด canonical substring `เขียนทับเฉพาะ CORE — ไฟล์ docs/ ถูก seed จาก template ถ้ายังไม่มี ไม่ทับของเดิม`; +1 spawn test regression guard) | `BUILD · tasks/installer-seed/rule.md §2` | `ทำทีหลัง` → ทำเสร็จ 2026-08-14 | `dropped` — ปิดโดยทำเสร็จ | `project-memory` → `publish-pack-polish` |
| 5 | ~~แปลง `docs/features/universal-ide/spec.md` จากตาราง `R1-R9` เป็นรูปแบบ `## Requirement:` + `### Scenario:`~~ — **ทำแล้วใน topic `universal-ide-spec`** (9 Requirement blocks + 12 Scenarios + GIVEN/WHEN/THEN ครบ; `validate-topic.mjs` C5 pass; เพิ่ม WHEN clauses ใน `installer-version-stamp/spec.md` ที่ขาดระหว่าง apply ตอน VERIFY) | `SHIP · validate-topic ✖` | `ทำทีหลัง` → ทำเสร็จ 2026-08-14 | `dropped` — ปิดโดยทำเสร็จ | `project-memory` → `universal-ide-spec` |

---

## รูปแบบ entry (ใช้ตอน promote จาก SHIP)
- หนึ่งงาน = หนึ่งแถวในตาราง (5-field + `มาจาก topic`)
- เติมคอลัมน์ `มาจาก topic` = slug ที่งานนั้นมา (provenance)
- entry ซ้ำข้าม topic → กลั่นรวมเป็นแถวเดียว (ระบุหลาย topic ที่ `มาจาก topic` ได้)
- entry ที่ `promoted` แล้วใน per-topic → skip (idempotent ไม่เพิ่มซ้ำ)
