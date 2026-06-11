# Troubleshooting — global-install

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`

---

### TS-1: Workflow loader พังด้วย "Unexpected keyword 'export'" เมื่อ build-wave.mjs มี top-level `export function`
| | |
|---|---|
| **วันที่** | `2026-06-11` |
| **Component / Task** | `installer` / BUILD orchestration (เรียก `build-wave.mjs` ผ่าน Workflow) |
| **ความถี่** | เจอครั้งเดียว (แต่จะเจอซ้ำทุกครั้งที่ build บน harness นี้ตราบที่ root build-wave.mjs เป็น 0.12.0) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ (กระทบทุก contributor ที่รัน `/warnyin:build` บน Claude Code harness นี้) |

- **อาการ / error message:**
  ```
  Workflow script has a syntax error and was not launched:
  SyntaxError: Unexpected keyword 'export'
  ```
- **บริบทที่ทำให้เกิด (trigger):** เรียก `Workflow({ scriptPath: ".warnyin/workflow/scripts/build-wave.mjs", ... })` — build-wave.mjs เวอร์ชัน 0.12.0 (จาก topic `improve-performance`) มี **top-level `export function normalizeTasks` + `export function buildOpts`** (export ออกมาให้ unit test import)
- **สาเหตุที่แท้จริง (root cause):** Workflow loader ของ Claude Code harness นี้ wrap script แล้ว **ยอมรับเฉพาะ `export const meta`** (ตัวบังคับ) — `export function`/`export` อื่นกลางสคริปต์ทำให้ parse ล้ม (ตรงกับธีม `docs/troubleshooting.md #16`: payload workflow script valid เฉพาะตอน harness wrap แบบเฉพาะ; ต่าง harness ตีความ export ต่างกัน). ก่อน 0.11.0 build-wave.mjs ไม่มี `export function` จึงไม่เคยเจอ
- **วิธีแก้ที่ได้ผล (solution):** สร้าง **temp copy** ที่ตัด `export ` ออกจาก function declaration (ฟังก์ชันถูกใช้ภายในสคริปต์อยู่แล้ว ไม่ต้อง export ตอนรันจริง) แล้วรัน Workflow จาก temp นั้น:
  ```bash
  sed 's/^export function /function /' .warnyin/workflow/scripts/build-wave.mjs \
    > .warnyin/workflow/scripts/build-wave-run.mjs   # root .warnyin gitignored
  # Workflow({ scriptPath: ".warnyin/workflow/scripts/build-wave-run.mjs", ... })
  ```
  คง `export const meta` ไว้ (ตัวบังคับของ Workflow) — ตัดเฉพาะ `export function`
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** ปม fix ถาวร = ใน `src/.warnyin/workflow/scripts/build-wave.mjs` **อย่า `export` ฟังก์ชันที่ harness wrap** — ให้ unit test สกัดด้วย `new Function`/module-parse แทน import ตรง (pattern เดียวกับ `docs/troubleshooting.md #16` runtime-proof) หรือย้าย pure-fn ไปไฟล์ helper แยกที่ test import ได้โดยไม่กระทบ workflow script. เสนอเป็น learned-rule รอ SHIP

---

### TS-2: `verify:pack` ENOENT บน Windows (ซ้ำ — มี KB กลาง #4)
- **อาการ:** `npm run verify:pack` → `spawnSync npm ENOENT` บน Windows worktree
- **สรุป:** **ซ้ำกับ `docs/troubleshooting.md #4** — ไม่ promote ซ้ำ; workaround = `npm pack --dry-run --json` ตรวจ inclusion เอง (ใช้แล้วใน full-gate: ไฟล์ใหม่ 5 ตัวติด tarball). build sub-agent ยืนยันด้วย `git stash` ว่าล้มเหมือนกันบน base = pre-existing ไม่เกี่ยว change
