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
| 1 | เพิ่ม **EOL guard ระดับ tarball ใน `verify:pack`** — assert ว่าไฟล์ text ที่จะถูกแพ็คไม่มี CR เพื่อให้ publish gate จับ CRLF อัตโนมัติ | `BUILD · build.md §3.6` + KB #30 | `ทำทีหลัง` + รอบนี้เช็คด้วย script นอก (manual); เทส EOL คุมที่ `src/` แล้วแต่ยังไม่ผูกกับ pack gate | `open` | `project-memory` |
| 2 | ทำให้ **`npm run verify:pack` รันบน Windows dev ได้** — เลือก binary ตาม `process.platform` (`npm.cmd`) หรือ `shell:true` แทน `execFileSync('npm')` ที่ ENOENT | `BUILD/VERIFY · KB #4` | `ทำทีหลัง` + ข้อจำกัด env เดิม ไม่ block (มี workaround + unit gate); ควรให้ CI ubuntu ยืนยันคู่กัน | `open` | `project-memory` |
| 3 | ~~**refresh root dogfood** — `.warnyin/.warnyin-version` ยังเป็น `0.22.0`~~ **ทำแล้ว 2026-07-27** (`npm run setup:dogfood` หลัง publish 0.28.0 → stamp `0.28.0`; payload ที่ root 5356 ไฟล์ text · **CRLF 0** = ยืนยัน `normalizeEol` ทำงานผ่านเส้นทางจริง publish→npx→ติดตั้ง) | `BUILD · KB #30` | `รอเงื่อนไข` (เงื่อนไขครบแล้ว) | `dropped` — ปิดโดยทำเสร็จ | `project-memory` |
| 4 | แก้ wording `--help` ใน `cli.mjs` (~บรรทัด 50) ที่เคลมว่า `--update` "ไม่แตะ `docs/`" — ไม่ตรงข้อเท็จจริง (`ensureScaffold()`+`seedDocs()` รันทุกครั้ง เพียงแต่ skip ไฟล์ที่มีอยู่) | `BUILD · tasks/installer-seed/rule.md §2` | `ทำทีหลัง` + เป็นการแก้**โค้ด** SHIP ไม่แตะ; เอกสาร (CHANGELOG migration note) ถูกต้องแล้ว | `open` | `project-memory` |
| 5 | แปลง `docs/features/universal-ide/spec.md` จากตาราง `R1-R9` เป็นรูปแบบ `## Requirement:` + `### Scenario:` ให้ `validate-topic.mjs` C5 เขียว | `SHIP · validate-topic ✖` | `ทำทีหลัง` + เป็น feature เดิมนอก scope topic นี้; การเขียน spec ใหม่ต้องระวังความถูกต้องของเนื้อหา ทำเป็นงานแยกดีกว่า | `open` | `project-memory` |

---

## รูปแบบ entry (ใช้ตอน promote จาก SHIP)
- หนึ่งงาน = หนึ่งแถวในตาราง (5-field + `มาจาก topic`)
- เติมคอลัมน์ `มาจาก topic` = slug ที่งานนั้นมา (provenance)
- entry ซ้ำข้าม topic → กลั่นรวมเป็นแถวเดียว (ระบุหลาย topic ที่ `มาจาก topic` ได้)
- entry ที่ `promoted` แล้วใน per-topic → skip (idempotent ไม่เพิ่มซ้ำ)
