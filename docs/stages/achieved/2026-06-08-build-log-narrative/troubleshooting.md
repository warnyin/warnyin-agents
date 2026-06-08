# Troubleshooting — build-log-narrative

> ปัญหายาก/เจอซ้ำที่แก้สำเร็จระหว่าง BUILD — SHIP ยกขึ้น `docs/troubleshooting.md`

## `node --check build-wave.mjs` ขึ้น "Illegal return statement" (false-red ตอน validate schema)
- **อาการ:** `node --check src/.warnyin/workflow/scripts/build-wave.mjs` → `SyntaxError: Illegal return statement` (exit 1) ทั้งที่ schema edit ถูกต้อง — acceptance/design §8 D เขียนว่า `node --check` ต้องผ่าน
- **Root cause:** `build-wave.mjs` เป็น **Workflow script body** (รันใน sandbox ที่ inject global `parallel`/`agent`/`log`/`phase`/`args`) ไม่ใช่ ES module ปกติ — มี top-level `return` (early exit เมื่อไม่มี slug/tasks) + top-level `await parallel()`; `node --check` parse เป็น plain module จึง flag illegal return **เสมอ ไม่เกี่ยวกับการแก้**
- **วิธีแก้:** ยืนยัน pre-existing ด้วย `git stash; node --check …; git stash pop` → error เดียวกันบน HEAD ก่อนแก้ → edit ไม่ได้ทำให้พังใหม่. validate schema จริงด้วยการ extract `RESULT_SCHEMA` object literal (brace-matching) → eval ใน `new Function` → assert structure (`events` array / `maxItems` / `kind` enum / `kind`+`note` required / **ไม่อยู่ root required** + props เดิมครบ) → ผ่าน 8/8
- **ป้องกันซ้ำ:** acceptance ที่อ้าง `node --check` กับ Workflow script (top-level `return`/`await`) จะ **false-red เสมอ** — validate ด้วย **stash-diff** (พิสูจน์ pre-existing) + parse object literal แทน; design §8 ระบุไว้แล้วว่า `build-wave.mjs` import/check ตรงไม่ได้ → ใช้ structural + executable trace (ญาติ troubleshooting #13 pipe-masks-exit — เครื่องมือ check ให้ false signal)
