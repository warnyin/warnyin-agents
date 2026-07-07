# Troubleshooting — build-lean

> ปัญหายาก/เจอซ้ำที่แก้สำเร็จระหว่าง BUILD — SHIP จะยกขึ้น `docs/troubleshooting.md`

## TS-1: guard self-install ใน cli.mjs trigger เมื่อรัน `node --test` จาก `src/` โดยตรง

- **อาการ:** รัน test จากใน `src/` แล้ว cli.mjs โยน error self-install guard
- **Root cause:** cli.mjs มี guard `if (path.resolve(pkgRoot) === path.resolve(cwd))` — เมื่อรัน test จาก `src/`, pkgRoot (parent ของ `bin/`) === cwd → trigger
- **วิธีแก้:** รัน `node --test` จาก repo root (worktree root) เสมอ — test auto-discover `tests/*.test.mjs` ได้เอง; ตาม `docs/rule.md` §5 ห้ามใส่ path arg กับ `node --test`
- **ป้องกันซ้ำ:** ระบุใน spec ว่า test-flow รันจาก repo root (bare `node --test`) เสมอ

## TS-2: `prompt()` เป็น template literal อ้าง module-level variables — `new Function` ต้อง inject เป็น parameter

- **อาการ:** `ReferenceError: slug is not defined` เมื่อรัน `new Function(body)` กับ body ที่ extractFn สกัดมา
- **Root cause:** `prompt()` ใน build-wave.mjs อ้าง `slug`/`isolate`/`baseRef` ซึ่งเป็นตัวแปร module-level ที่ harness inject — สกัด function ออกมาโดดๆ ทำให้ตัวแปร undefined ใน sandbox
- **วิธีแก้:** สร้าง factory `new Function('slug','isolate','baseRef', body + '\nreturn prompt')` แล้วเรียกด้วยค่าต่อเคส เช่น `makePrompt('demo', true, 'build/demo')('my-task')`
- **ป้องกันซ้ำ:** ทุกครั้งที่ extractFn สกัด function ที่อ้างตัวแปรนอก scope → inject เป็น parameter เสมอ (ต่อยอด KB#16)

## TS-3: md link ใน command adapter (`src/.claude/commands/warnyin/*.md`) ใช้ relative depth ผิด → dead-link ที่โผล่เฉพาะตอน integration

- **อาการ:** `lint:md` แดงหลัง merge wave: `src/.claude/commands/warnyin/design.md: ลิงก์เสีย -> ../../.warnyin/workflow/triage.md#...` — agent เจ้าของ task รายงาน "ไม่ใช่ failure ของ task ตัวเอง" ทั้งที่จริงเป็น bug ใน slice ตัวเอง (เข้าใจผิดว่าเป็น cross-slice pointer รอไฟล์ wave อื่น)
- **Root cause:** จาก `src/.claude/commands/warnyin/` ต้องขึ้น **3 ชั้น** (`../../../`) ถึงจะถึง root ที่มี `.warnyin/` — ใช้ `../../` ขาดไปหนึ่งชั้น; depth ฝั่ง `src/` กับฝั่ง target ที่ติดตั้งแล้วเท่ากัน จึงแก้ครั้งเดียวถูกทั้งสองฝั่ง
- **วิธีแก้:** แก้เป็น `../../../.warnyin/workflow/triage.md#fast-track-skip-list` → lint:md เขียว
- **ป้องกันซ้ำ:** md link ใหม่ในไฟล์ใต้ `src/.claude/commands/warnyin/` นับชั้นจาก location จริงของไฟล์เสมอ (3 ชั้นถึง root) และอย่า assume ว่า lint แดงในไฟล์ scope ตัวเอง = ปัญหา cross-slice — เช็ค path resolution ก่อน
