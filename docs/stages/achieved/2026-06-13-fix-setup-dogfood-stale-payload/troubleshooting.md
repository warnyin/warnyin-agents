# Troubleshooting — fix setup:dogfood stale-payload

> Log ปัญหายาก/ซ้ำตอนทำ topic นี้

---

### TS-1: pure fn ที่ test ด้วย temp dir — รับ path ไม่รับ parsed object
| | |
|---|---|
| **วันที่** | `2026-06-13` |
| **Component / Task** | `installer` / `tasks/fix-dogfood-stale-detection` |
| **ความถี่** | เจอครั้งเดียว (design ambiguity) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ (generalizable — pattern ของ testable pure fn) |

- **อาการ:** `checkTarballVersion` design อนุญาต 2 แบบ — รับ `pj` object (reuse parse เดิม L190) หรือรับ `extractDir` (อ่านเอง). standard.md เน้น "reuse parse เดียว ไม่อ่านซ้ำ" → ชวนเลือกรับ pj object
- **Trigger:** ต้องการ pure fn ที่ **testable ด้วย temp dir + fake package.json** (pattern เดียวกับ `verifyInstalled` รับ `root`)
- **Root cause:** ถ้ารับ `pj` object → unit test ต้อง mock object ส่งเข้า → **ไม่ทดสอบ file-read path จริง** (mock leak); ขัดเจตนา "executable test ไม่ source-grep" (panel QA B2)
- **วิธีแก้:** เลือก `checkTarballVersion(extractDir, expected)` รับ path → อ่าน `package.json` เอง (ทดสอบ read path จริงด้วย temp dir); ยอมอ่านไฟล์ซ้ำ 1 ครั้ง (testability > micro dedup) — `installViaPack` เรียก `checkTarballVersion(extractDir, expected)` แทนส่ง version
- **ป้องกันซ้ำ:** **pure fn ที่ต้อง testable ด้วย temp-dir pattern → รับ path เสมอ ไม่รับ parsed object** (กัน mock leak + ทดสอบ read path จริง) — trade dedup เล็กน้อยเพื่อ executable test ที่จับ behavior จริง (สำคัญกับ feature ที่เคย false-success)

---

### TS-2: ESM main-guard พังเมื่อรันผ่าน symlink (argv[1] ไม่ใช่ realpath) — installer เงียบ exit 0
| | |
|---|---|
| **วันที่** | `2026-06-13` |
| **Component / Task** | `installer` / `src/bin/cli.mjs` (พบใน VERIFY — root cause ชั้น 0) |
| **ความถี่** | critical — กระทบทุกการรัน cli ผ่าน symlink (npx end-user + setup:dogfood) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ (generalizable — pattern ของ ESM entrypoint detection ในทุก script) |

- **อาการ:** `npx @warnyin/agents@<v> --update` (sandbox สะอาด) → **exit 0, 0 bytes output, ไม่สร้างไฟล์เลย**; `setup:dogfood` → ทั้ง npx + pack path เงียบ → verifyInstalled (ชั้น B) คืน false → fail-loud. อาการ "root ค้าง 0.17.0" จริง ๆ คือ **setup:dogfood ไม่เคยติดตั้งสำเร็จเลย** ไม่ใช่แค่ดึง payload เก่า
- **Trigger:** รัน cli ผ่าน path ที่มี symlink component — (1) npx รัน bin ผ่าน `node_modules/.bin/<name>` ที่เป็น symlink, (2) setup:dogfood extract tarball ลง `os.tmpdir()` ที่บน macOS เป็น symlink (`/var/folders/.../T` → `/private/var/...`)
- **Root cause:** main-guard `if (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))` — `process.argv[1]` = path ตามที่ผู้เรียกระบุ (symlink, ไม่ resolve), แต่ ESM `import.meta.url` = **realpath เสมอ** (Node ESM loader resolve symlink) → เทียบไม่ตรง → `main()` ไม่ถูกเรียก → exit 0 เงียบ. **black-box test เดิมไม่จับ** เพราะ spawn cli ผ่าน real repo path (`fileURLToPath(new URL('../bin/cli.mjs', ...))`) = ไม่ผ่าน symlink → match เสมอ
- **วิธีแก้:** แยก `export function isEntrypoint(argv1, metaUrl, realpath = fs.realpathSync)` → `realpath(argv1) === fileURLToPath(metaUrl)` (realpath ทั้งสองฝั่ง); wrap try/catch → fallback `path.resolve(argv1) === self` เมื่อ realpath throw (argv1 ไม่มีจริง); main-guard เรียก `isEntrypoint(process.argv[1], import.meta.url)`. แยกเป็น pure fn (inject realpath) → unit cross-platform ได้โดยไม่พึ่ง symlink จริง + black-box spawn ผ่าน symlink (CI ubuntu) ครอบ end-to-end
- **ป้องกันซ้ำ:** **ESM main-guard ต้อง realpath argv[1] ก่อนเทียบกับ `import.meta.url`** (ไม่ใช่แค่ `path.resolve`) — ไม่งั้นพังเงียบเมื่อถูกเรียกผ่าน symlink (npx/.bin ทำเสมอ). **black-box test ต้องมีเคสรันผ่าน symlink** ด้วย — spawn ผ่าน real path อย่างเดียวจับ bug นี้ไม่ได้ (false-green). scripts อื่น (`verify-pack`/`lint-md`/`setup-dogfood`) ใช้ guard แบบไม่ realpath เช่นกัน แต่รันจาก npm-script (real repo path) จึงไม่โดน — ถ้าวันใดถูกเรียกผ่าน symlink ต้องใช้ pattern เดียวกัน
