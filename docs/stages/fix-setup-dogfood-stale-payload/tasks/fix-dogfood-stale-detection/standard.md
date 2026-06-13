# Standard — fix-dogfood-stale-detection

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> อิง `docs/techstack/installer/standard.md` + §dev tooling

## 1. Standard กลางที่ยึด (จาก techstack)
- **pure fn + main-guard pattern** (เหมือน `verifyInstalled`/`parseNpmViewVersion` เดิม): logic แยกเป็น fn รับ param (`root`/`extractDir`/`a,b`) + `export` → unit import ตรง ป้อน temp dir/ค่าปลอม ไม่ต้อง spawn; `main-guard` (argv[1] comparison, L257) กัน import trigger install
- **zero-dep / ESM / cross-platform**: `semverGte` เขียนเอง (numeric tuple — `String(v).split('.').map(n=>parseInt(n,10)||0)`); `path.join`/`os.tmpdir()`; spawn array args ห้าม `shell:true` ยกเว้น npx win32 (คงเดิม L131)
- **ภาษาไทย** comment/log ตามสไตล์ไฟล์เดิม

## 2. Pattern การเขียนโค้ดของ task นี้
- **semverGte:** `const t = s => String(s).split('.').map(x => parseInt(x,10) || 0)` → เทียบ field-wise major→minor→patch (loop หรือ compare tuple); ไม่ throw กับ input แปลก (parseInt('garbage')=NaN → `||0`)
- **checkTarballVersion:** reuse `pj` object ที่ `installViaPack` parse อยู่แล้ว (L190 `JSON.parse(readFileSync(.../package.json))`) — **ส่ง pj.version เข้า fn หรือ fn รับ extractDir แล้วอ่าน pj เอง** (เลือกแบบ reuse parse เดียว ไม่อ่านไฟล์ซ้ำ); เทียบ `String(pj.version).trim() === String(expected).trim()`; `!expected → return true`
- **verifyInstalled branch ใหม่:** วาง `semverGte` check **ภายใน** `if (stamp === null)` (L106) — ไม่ย้าย guard order เดิม (markers→!expected→readStamp→stamp===null→drift)
- **warn message actionable** (Infra S1): false-detection warn บอก root cause + ทางแก้ (เช่น "payload @<ver> ไม่มี stamp ทั้งที่ ≥0.17.0 — npm cache เก่า? `npm cache clean --force`")

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- test harness เดิม `src/tests/setup-dogfood.test.mjs` (temp dir + import pure fn) — เพิ่มเคสในไฟล์เดิม ไม่สร้างไฟล์ใหม่
- `pj` parse block ที่ `installViaPack` L190 — reuse สำหรับ version-check (ไม่ readFileSync ซ้ำ)

## 4. เพิ่มเติมเฉพาะ task
- `STAMP_MIN_VERSION = '0.17.0'` constant + comment โยง evidence (`installer-version-stamp` ship v0.17.0 = release แรกที่มี stamp writer) — กัน drift ความหมาย (panel SA S2)
