# Troubleshooting — parallel-design-docs

> ปัญหายาก/เจอซ้ำที่แก้สำเร็จระหว่าง BUILD · SHIP จะยกขึ้น `docs/troubleshooting.md` กลาง

## TS-1: `build-wave.mjs` launch ไม่ได้ — `SyntaxError: Unexpected keyword 'export'`

- **อาการ:** เรียก `Workflow({ scriptPath: ".warnyin/workflow/scripts/build-wave.mjs", ... })` → `Workflow script has a syntax error and was not launched: SyntaxError: Unexpected keyword 'export'`
- **root cause:** Workflow runtime wrap script body เป็น **async function** (เพื่อให้ใช้ `await` ตรงๆ) และ extract เฉพาะ `export const meta` — แต่ `build-wave.mjs` มี `export function normalizeTasks` + `export function buildOpts` ที่ **module-level** (ใส่ไว้เพื่อให้ unit test import ได้) → `export` ภายใน async function = illegal → ทั้ง script ไม่ launch
- **วิธีแก้ (ครั้งนี้):** fallback ตาม `build.md` §6 — fan-out ผ่าน **Agent tool โดยตรง** (1 call/task ใน message เดียว = parallel) คง `isolation: "worktree"` + `model` override; integrate ด้วย `git checkout <branch> -- <scoped src files>` เหมือนเดิม → ผลเทียบเท่า build-wave
- **ป้องกันซ้ำ (เสนอ — topic `build-orchestration`):** ย้าย `export function` ที่ module-level ของ `build-wave.mjs` ออกจาก path ที่ runtime ตีความเป็น body — เช่น (ก) แยก pure helper ไปไฟล์ `build-wave.lib.mjs` แล้ว test ที่ไฟล์นั้น หรือ (ข) เลิก `export` ใน body ใช้ const function แทน (ถ้า test ไม่จำเป็นต้อง import) — ต้องประเมินกระทบ test เดิมก่อน (ไม่อยู่ scope topic นี้ — note ไว้)
