# Rule — test-suite-relocation

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)
> ดึงจาก `docs/rule.md` §5 (Testing) + §2 (Engineering) — เฉพาะข้อที่เกี่ยวกับ task นี้

- [ ] **black-box spawn** — spawn `src/bin/cli.mjs` จริงใน temp dir แล้ว assert side-effect (ไฟล์/exit code/stdout/stderr); **ห้าม refactor target เพื่อ testability** + **ห้าม import logic จาก `cli.mjs`** (รัน side-effect ตอน import)
- [ ] **harness กลาง** — ใช้ `makeTempProject(t)` + `runCli(cwd, args)` ซ้ำ ห้ามเขียน test pattern ใหม่ (rule §5)
- [ ] **assert `code===0` ก่อนเสมอ + surface `stderr`** ใน assertion message (กัน false-positive); assert stream ให้ตรง (`console.warn`→stderr); spawn array args **ห้าม `shell:true`**
- [ ] **zero-dependency** (rule §2) — ใช้เฉพาะ built-in `node:*`; `devDependencies` ต้องว่าง; รวมถึง pass-count gate ใน CI ก็ห้ามเพิ่ม dep
- [ ] **ESM** (rule §2) — `import.meta.url`, ห้าม `__dirname`/`require`
- [ ] **ภาษาไทย** — คอมเมนต์/ข้อความเป็นไทยตามสไตล์ repo
- [ ] **CI security baseline** (rule §3) — ถ้าแตะ `ci.yml` (job `test`/pass-count gate) ต้องคง: `permissions: contents: read`, trigger `pull_request` (ห้าม `pull_request_target`), ไม่มี `secrets.*`, action pin SHA, ไม่ตั้ง `npm ci`/`cache: npm` (repo zero-dep ไม่มี lockfile)
- [ ] **CHANGELOG** (rule §2) — เปลี่ยนตำแหน่ง test/`scripts.test` ไม่ใช่ user-facing โดยตรง แต่ถ้ารวมใน entry restructure ของ topic ก็ note (สรุปจริงตอน SHIP)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` / `docs/techstack/.../rule.md` ตอนนี้ — แค่ note ไว้
- [ ] rule ที่เสนอ: **acceptance ของ test = pass count ไม่ใช่แค่ exit 0** — เหตุผล: troubleshooting #3 พิสูจน์ว่า `node --test` คืน exit ที่หลอกได้ (tests=1 pass=0) → gate ของ test suite ทุกตัวควร assert pass count บน CI matrix (โดยเฉพาะหลังย้าย discovery path)
- [ ] rule ที่เสนอ: **ห้ามใส่ path/glob arg ให้ `node --test`** ถ้าต้อง portable ข้าม node major — เหตุผล: node 24 ตี path เป็น module, glob `**` ใช้ได้แค่ node 21+ (troubleshooting #3) — อาจ promote เข้า `docs/techstack/installer/test.md` ตอน SHIP
