# Design (How) — repo-lint (zero-dep dead-link gate)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> Lens: SA · zero-dep dev tooling, mirror `verify-pack.mjs` pattern

## 1. ภาพรวมสถาปัตยกรรม
- **component:** installer/dev-tooling (`src/scripts/` + `src/tests/` + CI) — ไม่แตะ payload/playbook
- **แนวทางหลัก:** `lint-md.mjs` = pure `checkLinks(docs, exists)` + `main()` (walk+read+resolve) + main-guard — แบบเดียวกับ `verify-pack.mjs` (testable, zero-dep, wire CI)
- **invariant:** zero-dep (node:* ล้วน, devDeps ว่าง) · cross-platform (`path` API, POSIX-safe) · ไม่แตะ src behavior/payload · `pass==tests ≥ MIN_PASS`

## 2. Interface / contract
```js
// src/scripts/lint-md.mjs
export function checkLinks(docs, exists)   // docs=[{file, content}], exists=(absPath)=>bool
  → errors[]   // ['<file>: ลิงก์เสีย -> <target>', ...]
```
- **pure core** (`checkLinks`): รับ content + injectable `exists` → ไม่มี IO เอง (unit feed fake docs + fake exists ได้)
- **main()**: walk `src/`+`docs/` (exclude rule §3) → อ่านไฟล์ → `checkLinks(docs, fs.existsSync)` → print + `exit(1)` ถ้ามี error
- **main-guard:** `fileURLToPath(import.meta.url) === process.argv[1]` (เหมือน verify-pack — import จาก test ไม่ trigger main)

## 3. Logic ของ checkLinks (ลำดับ parse — กัน false-positive)
1. **strip code** ก่อน match link: `content.replace(/```[\s\S]*?```/g,'')` (fenced) แล้ว `.replace(/`[^`\n]*`/g,'')` (inline) — กัน `[](...)` ตัวอย่างในร้อยแก้ว/code
2. **match md-link:** `/\[[^\]]*\]\(([^)]+)\)/g` → ดึง target
3. **skip:** target ขึ้นต้น `http://`/`https://`/`mailto:` หรือ `#` (anchor-only)
4. **resolve:** `target.split('#')[0]` (ตัด anchor) → `resolve(dirname(file), path)` → ถ้า `!exists(abs)` = error
5. คืน errors[]

## 4. main() — walk + exclude
- เดิน `src/**` + `docs/**` หา `*.md`; **ข้าม:** `node_modules/`, prefix `src/.warnyin/template/`, prefix `docs/stages/achieved/`
- (exclude เพราะ: template = placeholder link ที่ target สร้างเอง; archived = frozen snapshot — D)
- path เทียบ exclude เป็น POSIX/relative-from-root

## 5. Vertical slices
> coupled — linter + test + script + CI ต้องไปด้วยกัน (มี linter แต่ไม่ wire = ไม่ enforce; wire แต่ไม่ test = gate เปราะ) → **1 slice**

| # | Slice | ตัดผ่าน layer | → task |
|---|---|---|---|
| 1 | **dead-link gate ครบสาย** — `lint-md.mjs` (logic) → unit test (พิสูจน์) → `npm run lint:md` (รัน) → CI job (enforce) | script · test · package · CI | `tasks/add-md-lint/` |

## 6. จุดที่ต้องแก้
| ไฟล์ | ใส่อะไร |
|---|---|
| `src/scripts/lint-md.mjs` (NEW) | `checkLinks(docs, exists)` export + `main()` + main-guard |
| `src/tests/lint-md.test.mjs` (NEW) | unit: good→0, dead→error, inline-code skip, fenced skip, http/anchor/mailto skip, `path#anchor`→validate path |
| `package.json` `scripts` | +`"lint:md": "node src/scripts/lint-md.mjs"` |
| `.github/workflows/ci.yml` | +job `lint-md` (mirror `pack-verify`: pinned SHA, node 22, `npm run lint:md`) |

## 7. ผลกระทบต่อระบบเดิม
- **verify-pack:** `lint-md.mjs`(src/scripts/) + test(src/tests/) อยู่ใน `DENY_PREFIX` แล้ว → ไม่ ship (ไม่ต้องแก้ verify-pack)
- **test count:** +เคส unit (lint-md ~6) → 19→~25; `check-test-count` MIN_PASS=9, pass==tests ผ่าน (count ขึ้น)
- **CI:** +job ขนานกับ test/pack-verify; zero-dep (ไม่มี `npm ci`/lockfile — คงสไตล์ ci เดิม)
- **repo ปัจจุบัน:** pre-scan ยืนยัน **0 dead-link** หลัง exclusion → BUILD แค่เขียน gate ไม่ต้องแก้ลิงก์เก่า

## 8. Dependency
```
add-md-lint   (task เดียว — coupled zero-dep tooling slice)
```

## 9. Test strategy ระดับ design
- **unit (pure):** `checkLinks` feed fake docs+exists → จับ dead-link จริง + ข้าม code-span/http/anchor (พิสูจน์ logic ที่พลาดง่าย)
- **executable:** `node src/scripts/lint-md.mjs` บน repo จริง → **0 dead-link** (exit 0); ลองใส่ลิงก์เสียชั่วคราว → จับได้ (manual spot)
- **regression:** `npm test` (count ขึ้น เขียว) + `verify:pack` (lint-md ไม่ ship) + devDeps ยังว่าง
- **cross-platform:** `path.resolve`/`join` + POSIX link (md ใช้ `/`); main-guard `fileURLToPath`

## 10. หมายเหตุการตัดสินใจ (จาก pre-scan — ไม่ block)
- exclude `src/.warnyin/template/**` + `docs/stages/achieved/**` (พิสูจน์: ก่อน exclude 13 false-positive, หลัง = 0) — correctness ชัด
- strip inline+fenced code ก่อน match (กัน `[](...)` ตัวอย่างในเอกสาร repo-lint เอง)
- มี broken link จริง 1 อันใน archived `roadmap-sync-p0` (`CHANGELOG.md#migration`) — **ไม่แก้** (archived frozen + exclude scope)
