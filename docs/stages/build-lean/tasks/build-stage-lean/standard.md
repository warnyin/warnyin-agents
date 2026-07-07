# Standard — build-stage-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack)

- **zero-dependency** — ใช้เฉพาะ built-in `node:*` (test = `node:test` + `node:assert/strict`); ห้ามเพิ่ม dependency ใดๆ
- **ESM** — `import`/`export`, `import.meta.url` + `fileURLToPath(new URL(...))` (ห้าม `__dirname`/`require`/`.pathname` — Windows คืน `/D:/...`)
- **ห้าม `shell:true`** ใน spawn ใดๆ (array args เท่านั้น) — task นี้ไม่ควรต้อง spawn เลย
- **ภาษาไทยในคอมเมนต์/ข้อความ** ตามสไตล์ `src/bin/cli.mjs` และ test เดิม
- **payload workflow script ห้าม top-level `export` นอกจาก `export const meta`** (`docs/techstack/installer/rule.md` §build orchestration) — แก้ `prompt()` แล้วห้ามเผลอเติม `export` (Workflow loader พัง `SyntaxError`)

## 2. Pattern การเขียนโค้ดของ task นี้

- **เทส `prompt()` ด้วย extractFn pattern เดิม** จาก `src/tests/build-wave.test.mjs` (KB#16 ใน `docs/troubleshooting.md` — build-wave.mjs import ตรงไม่ได้: top-level return + harness globals):
  - `readFileSync` source → `extractFn(SRC, 'prompt')` (brace-count เดิม — **reuse ห้ามเขียนใหม่**) → `new Function(...)` สร้าง sandbox
  - **⚠ template literal ใน `prompt()` อ้างตัวแปร module-level** (`slug`, `isolate`, `baseRef`) — ต้อง **inject เป็น parameter ของ factory** เช่น `new Function('slug','isolate','baseRef', body + '\nreturn prompt')` แล้วเรียกด้วยค่าต่อเคส (เช่น `('demo', true, 'build/demo')`) — ห้าม hardcode ค่าใน body ที่สกัดมา
  - assertion ใช้ `includes`/`match` บนข้อความ prompt ที่คืนมา (runtime proof — แข็งกว่า grep source line: ลำดับ runtime หลัง splice ต่างจาก source; ดู `docs/techstack/installer/test.md` §verify payload workflow script)
- **แก้ playbook `.md` แบบ unify-in-place** — ขยายข้อเดิม (§3 ข้อ 3, §4 ข้อ 5) ให้ครอบ 2 mode ในที่เดิม ไม่เพิ่มข้อใหม่/section ขนาน; เลข item ของ §3/§4 ห้าม shift (feature spec อื่นอ้าง literal เลขข้อ เช่น "§3 ข้อ 12")
- **pointer เป็น markdown link เท่านั้น** — pointer loop-tuning ใช้รูปแบบตาม canonical block ใน `./spec.md §7` เป๊ะ; pointer skip-list = `[fast-track skip-list](../triage.md#fast-track-skip-list)` (inline code ล้วนหลุด dead-link gate — `lint-md.mjs` validate เฉพาะ markdown link; anchor `#...` ถูก strip → slug ของ heading ตรวจด้วยตาเทียบ heading จริงใน `triage.md`)
- **fast hook = blockquote ใต้ §1** — โครง/wording ล้อ `verify.md:14` (`> **★ fast-track hook:** ... tier \`standard\`/\`large\` → flow เต็มด้านล่าง (hook นี้ N/A ไม่ลด bar)`) — conformance ของ hook ข้าม stage

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)

- `extractFn(src, name)` ใน `src/tests/build-wave.test.mjs` (มีอยู่แล้ว — ใช้ตัวเดิมในไฟล์เดียวกัน)
- canonical wording block ของ §4 ข้อ 6 → **copy จาก `design.md §4.5` ผ่าน `./spec.md §7`** (canonical-copy — ห้ามแต่งใหม่)
- gate รวม: `npm test` + `check-test-count.mjs` + `verify-pack.mjs` + `lint-md.mjs` (มีครบแล้ว — ไม่สร้าง gate ใหม่)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)

- test เคสใหม่ตั้งชื่อไทยต่อท้ายชุดเดิม (สไตล์ `เคส F: ...` หรือ `prompt: ...`) — ไม่ rename/แก้เคส A-E
- negative assertion ระวัง substring ชนกันเอง: เช็ค `design.md` ต้องไม่ false-positive จากคำว่า `task.md` — assert ด้วย string เต็มที่ตัดออก (เช่น `docs/stages/${slug}/design.md`) หรือ `includes('design.md') === false` หลังยืนยันว่า wording ใหม่ไม่มีคำนี้จริง (negative fixture/assertion ต้องเลี่ยง trigger phrase — `docs/rule.md §5`)
