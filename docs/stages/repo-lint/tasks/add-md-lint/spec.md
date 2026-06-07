# Spec — add-md-lint

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`logic` (zero-dep node script) + `infra` (CI gate) — 1 coupled slice

## 2. lint-md.mjs contract
```js
// src/scripts/lint-md.mjs (zero-dep — import เฉพาะ node:fs, node:path, node:url)
export function checkLinks(docs, exists)
// docs  = [{ file: string(relative), content: string }]
// exists = (absPath) => boolean   (injectable; main ส่ง fs.existsSync)
// → errors: string[]   เช่น `docs/x.md: ลิงก์เสีย -> ./y.md`
```
**logic (ลำดับ):**
1. strip code: `content.replace(/```[\s\S]*?```/g,'')` → `.replace(/`[^`\n]*`/g,'')`
2. match `/\[[^\]]*\]\(([^)]+)\)/g` → target (trim)
3. skip: `^https?:` / `^mailto:` / `^#`
4. `p = target.split('#')[0]`; ถ้า `!p` (anchor ล้วน) skip; ไม่งั้น `abs = resolve(dirname(file), p)`; `!exists(abs)` → push error
5. return errors

**main():** walk `src/`+`docs/` (`*.md`), ข้าม `node_modules/` + prefix `src/.warnyin/template/` + `docs/stages/achieved/` → สร้าง docs[] → `checkLinks(docs, fs.existsSync)` → ถ้า error: print + `exit(1)`; ไม่งั้น print `✓ ... N ลิงก์`
**main-guard:** `process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]`

## 3. Test-flow (unit `src/tests/lint-md.test.mjs` — import `checkLinks`)
- [ ] good link (exists→true) → `deepEqual([])`
- [ ] dead link (exists→false) → error มี target
- [ ] link ใน **inline-code** `` `[x](y)` `` → ข้าม (ไม่ error แม้ exists→false)
- [ ] link ใน **fenced code** ``` ```\n[x](y)\n``` ``` → ข้าม
- [ ] `http(s)://` / `mailto:` / `#anchor` → ข้าม
- [ ] `path#sec` (path exists) → ไม่ error (validate path ตัด anchor)
- [ ] fake `exists` = injectable (ไม่แตะ fs จริง)

## 4. executable + regression (ระดับ task)
- [ ] `node src/scripts/lint-md.mjs` บน repo → **0 dead-link** exit 0
- [ ] `npm test` เขียว (count 19→~25, pass==tests ≥9)
- [ ] `npm run verify:pack` เขียว (lint-md.mjs + test ไม่ ship — อยู่ใน denylist แล้ว)
- [ ] devDeps ยังว่าง (zero-dep)
- [ ] CI job `lint-md` รัน `npm run lint:md`

## 5. Persona
maintainer/contributor — gate dead-link อัตโนมัติ (แทนเช็คมือทุก VERIFY) โดยคง zero-dep
