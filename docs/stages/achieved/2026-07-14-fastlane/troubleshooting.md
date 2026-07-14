# Troubleshooting — feature fastlane

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ (ส่วนใหญ่ตอน BUILD) แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`
> เจอปัญหาใหม่ → อ่าน `docs/troubleshooting.md` ก่อนเสมอ เผื่อเคยแก้แล้ว

---

## วิธีบันทึก
บันทึกเฉพาะปัญหาที่ **ยากจะแก้** หรือ **เจอซ้ำ** (ไม่ใช่ทุก error เล็กน้อย) — หนึ่งปัญหา = หนึ่ง entry

---

### TS-1: isEntrypoint test fixture drop drive letter บน Windows
| | |
|---|---|
| **วันที่** | `2026-07-14` |
| **Component / Task** | `installer` / `tasks/fastlane-test-release` |
| **ความถี่** | เจอครั้งเดียว (แต่เป็น pre-existing bug ที่แดงเฉพาะ Windows — สำคัญ) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ / error message:**
  ```
  isEntrypoint(): true เมื่อ meta URL == entry (2 เคส) — FAIL
  actual: false / expected: true  (เฉพาะบน Windows; เขียวบน POSIX)
  ```
- **บริบทที่ทำให้เกิด (trigger):** fixture สร้าง entry path ด้วย `path.join('/real','pkg','src','bin','cli.mjs')` แล้วแปลงเป็น file URL เทียบกับ `import.meta.url` ที่ inject
- **สาเหตุที่แท้จริง (root cause):** บน Windows `path.join('/real',…)` คืน path ไม่มี drive letter (`\real\pkg\…`) แต่ `pathToFileURL()` prepend drive ปัจจุบัน (`C:`) เสมอ → `fileURLToPath(metaUrl)` ได้ `C:\real\…` ซึ่ง **ไม่เท่ากับ** `ENTRY_REAL` ที่ derive แยกจาก `path.join` → เทียบ path ไม่ตรง เลย false. POSIX ไม่มี drive letter จึงเขียว — bug ซ่อนได้นานเพราะ CI ส่วนใหญ่รัน Linux
- **วิธีแก้ที่ได้ผล (solution):** derive `ENTRY_REAL` จาก `ENTRY_META` ผ่าน round-trip แทนการ `path.join` แยก — ให้ทั้งสองค่ามาจากแหล่งเดียว:
  ```js
  const ENTRY_META = pathToFileURL(path.join('/real', 'pkg', 'src', 'bin', 'cli.mjs')).href
  const ENTRY_REAL = fileURLToPath(ENTRY_META)   // ← ผ่าน URL เดียวกัน = cross-platform
  ```
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** อย่าประกอบ "ค่าที่ต้องตรงกัน" 2 ค่าจากคนละ API (path.join vs pathToFileURL) — ให้มาจาก transform เดียวกัน. เทสที่เทียบ path/URL ควรรันบน Windows อย่างน้อยครั้งหนึ่งก่อนเชื่อว่าเขียว (drive-letter + `\` vs `/` เป็นบ่อเกิด bug ซ่อน)

---
