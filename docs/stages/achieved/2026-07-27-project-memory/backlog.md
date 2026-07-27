# Backlog — <ชื่อ change>

> งาน **deferred-out** ของ topic นี้ — ยกออกจาก scope ปัจจุบัน (ยังไม่ทำ) แต่เก็บ trace ไว้ทำต่อ/พิจารณาภายหลัง
> **lazy:** ไม่มี deferred-out ก็ไม่ต้องมีเนื้อ — เติมเฉพาะเมื่อพบรายการแรก
> ทุกการเพิ่ม = **เสนอ → user ยืนยัน** ก่อนเขียน (recommend-not-auto)
> นิยามเต็ม (semantic / governance / schema / promote) ดู capability doc `.warnyin/workflow/backlog.md`
> ตอน **SHIP** entry ที่ `open` จะถูก promote ขึ้น global `docs/backlog.md` (หลัง archive)

---

## รายการ (5-field)

ประเภท ∈ {`ทำทีหลัง`, `อาจไม่ทำ`, `รอเงื่อนไข`} · สถานะ ∈ {`open`, `promoted`, `dropped`}

| # | รายการ (what) | ที่มา (stage + ไฟล์/อ้างอิง) | ประเภท + เหตุผล | สถานะ |
|---|---|---|---|---|
| 1 | เพิ่ม **EOL guard ระดับ tarball ใน `verify:pack`** — assert ว่าไฟล์ text ที่จะถูกแพ็คไม่มี CR เพื่อให้ publish gate จับ CRLF อัตโนมัติ | `BUILD · build.md §3.6` + `troubleshooting.md TS-1` | `ทำทีหลัง` + รอบนี้เช็คด้วย script นอก (manual) — `EOL4` คุมที่ `src/` แล้วแต่ยังไม่ผูกกับ pack gate | `promoted` |
| 2 | ทำให้ **`npm run verify:pack` รันบน Windows dev ได้** — เลือก binary ตาม `process.platform` (`npm.cmd`) หรือ `shell:true` แทน `execFileSync('npm')` ที่ ENOENT | `BUILD · docs/troubleshooting.md #4` | `ทำทีหลัง` + เป็นข้อจำกัด env เดิม ไม่ block งานนี้ (มี workaround + unit gate) | `promoted` |
| 3 | **refresh root dogfood** — `.warnyin/.warnyin-version` ยังเป็น `0.22.0` ขณะ package เป็น `0.27.1` → dogfood ที่ orchestrate จริงเก่ากว่า source หลายเวอร์ชัน | `BUILD · troubleshooting.md TS-1` | `รอเงื่อนไข` + ควรทำหลัง release เวอร์ชันที่มี fix EOL แล้ว (`npx @warnyin/agents --update`) | `promoted` |
