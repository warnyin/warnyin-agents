# Standard — build-wave-model-arg

## 1. Standard กลางที่ยึด
- `docs/techstack/installer/standard.md` + `docs/rule.md` §2: **zero-dependency** (`node:test` เท่านั้น), **ESM** (`import`/`export`, `import.meta.url`), **ภาษาไทย** ใน comment/log
- `docs/rule.md` §5 Testing: สกัด pure fn → inject globals (`new Function`/extract) → assert behavior; **ห้ามใส่ path/glob ให้ `node --test`** (bare เท่านั้น)

## 2. Pattern การเขียน
- **สกัด pure helper** (testable): `normalizeTasks(tasks) → {name, model}[]` + `buildOpts({name, model}, isolate) → opts` — แก้ map เป็น `normalizeTasks(tasks).map((t)=>()=>agent(prompt(t.name), buildOpts(t, isolate)))` (ทุกที่ที่ใช้ `task` เป็น string → `t.name`)
- pattern เดียวกับ `baseRef` เดิม (build-wave.mjs:22 — optional arg, conditional เฉพาะเมื่อมีค่า) → model arg ทำแนวเดียวกัน (conditional spread)
- **immutable** — สร้าง opts object ใหม่ ไม่ mutate
- ★ **test = runtime-extract ห้าม import ตรง** (troubleshooting KB #16): build-wave.mjs มี top-level `return`/`await` + global ที่ harness inject (`args`/`agent`/`parallel`/`log`/`phase`) → `import`/`node --check` พัง. test ต้อง `fs.readFileSync` → สกัด `normalizeTasks`/`buildOpts` ด้วย `new Function` → inject globals ปลอม (capture opts) → assert. ทุกเคสเป็น `test(...)` ตรง **ห้าม skip** (กัน `pass!==tests` ของ check-test-count)

## 3. Shared / reuse
- `build-wave.mjs` โครง `parallel(tasks.map((task)=>()=>agent(...)))` เดิม (บรรทัด ~111) = จุดแก้ — ขยาย ไม่ rewrite
- harness ส่ง args เป็น string|object อยู่แล้ว (บรรทัด 17-18) — reuse logic เดิม

## 4. เพิ่มเติมเฉพาะ task
- conditional opts: `const opts = { label, schema, ...(isolate && {isolation:'worktree'}), ...(model && {model}) }` — ให้ key `model` หายไปเมื่อไม่มีค่า (ไม่ใช่ undefined)
