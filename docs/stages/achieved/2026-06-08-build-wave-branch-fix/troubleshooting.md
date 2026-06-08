# Troubleshooting — build-wave-branch-fix

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ (ส่วนใหญ่ตอน BUILD) แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`
> เจอปัญหาใหม่ → อ่าน `docs/troubleshooting.md` ก่อนเสมอ เผื่อเคยแก้แล้ว

---

## วิธีบันทึก
บันทึกเฉพาะปัญหาที่ **ยากจะแก้** หรือ **เจอซ้ำ** (ไม่ใช่ทุก error เล็กน้อย) — หนึ่งปัญหา = หนึ่ง entry

---

### TS-1: `node --check` standalone fail บน payload workflow script (harness inject globals + top-level return/export)

| | |
|---|---|
| **วันที่** | `2026-06-08` |
| **Component / Task** | workflow build-wave / `tasks/worktree-baseref` |
| **ความถี่** | เจอครั้งเดียว (เป็น pattern ของ payload script ทุกตัวที่ harness wrap) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ / error message:**
  ```
  node --check src/.warnyin/workflow/scripts/build-wave.mjs
  → SyntaxError: Illegal return statement (และ Unexpected token export ถ้า wrap ใน function)
  ```
- **บริบทที่ทำให้เกิด (trigger):** อยากใช้ `node --check` เป็น gate พิสูจน์ว่าแก้ build-wave.mjs แล้ว syntax ไม่พัง
- **สาเหตุที่แท้จริง (root cause):** `build-wave.mjs` เป็น **agent-driven workflow script** ที่ Workflow harness wrap body ในฟังก์ชันแล้ว inject globals (`args`/`agent`/`parallel`/`log`/`phase`) — โค้ดมี **top-level return** (early guard + tail return) ซึ่งผิดกฎ standalone ES module แต่ valid ในบริบท harness; `export const meta` ก็อยู่ top-level จึง wrap ใน function ไม่ได้ → `node --check` ใช้ไม่ได้กับไฟล์ประเภทนี้
- **วิธีแก้ที่ได้ผล (solution):** (1) ยืนยันเป็น pre-existing ด้วย `git show HEAD:<file> | node --check` (ไฟล์ก่อนแก้ก็ fail เหมือนกัน → ไม่ใช่ regression); (2) พิสูจน์ syntax สะอาดด้วย module-parse หลัง `sed` neutralize top-level return เป็น `throw`/`void`; (3) พิสูจน์ behavior/ordering ที่ runtime ด้วย `new Function(...)` inject globals แล้วรัน `prompt()` จริง 3 เคส (isolate&&baseRef / !baseRef / !isolate) — **แข็งกว่า grep source line order** เพราะ `splice` ทำให้ลำดับ runtime ต่างจากลำดับ source
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** payload workflow script (`*.mjs` ใน `.warnyin/workflow/scripts/` ที่มี `export const meta` + top-level return + injected globals) **อย่าใช้ `node --check` standalone เป็น gate** — ใช้ runtime proof (`new Function` รันฟังก์ชันที่แก้จริง) + `npm test`/`verify:pack` ที่เป็น gate จริง; เทส ordering ที่พึ่ง `splice`/`unshift` ต้องดูลำดับ **runtime** ไม่ใช่ลำดับบรรทัด source
