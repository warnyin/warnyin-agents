# Rule — Warnyin Standard Workflow (repo เอง)

> กฎระดับโปรเจกต์ของ repo มาตรฐานนี้ (ไม่ผูกกับ component เดียว) · SHIP promote rule ใหม่เข้ามาที่นี่
> rule ที่ผูกกับ component เฉพาะ → อยู่ใน `docs/techstack/<component>/rule.md`

## 1. ปรัชญาแก่น (จาก CLAUDE.md + roadmap)
- **กระทัดรัด opinionated** — 5 stage + role จำกัด เป็นจุดแข็ง ห้ามไหลเป็น catalog
- **tool-agnostic** — แก่นเป็น `.md` กลางที่ทุก harness อ่านได้ (`.warnyin/workflow/`); ส่วนที่ผูก tool (hook/skill) เป็น *adapter บาง* ชี้กลับแก่น
- **ห้ามเดา** — ไม่ชัดถาม user; enforce ด้วย rule/checklist ใน playbook

## 2. Engineering rules
- **zero-dependency** — `devDependencies` ต้องว่างเสมอ; ทุกเครื่องมือใช้ built-in `node:*` (test = `node:test`) — เหตุผล: กระทัดรัด + ไม่มี supply-chain risk (จุดขายของ tool)
- **ESM** — repo `type: module`; ใช้ `import`/`export`, `import.meta.url` ไม่ใช่ `__dirname`/`require`
- **ภาษา:** คอมเมนต์/ข้อความผู้ใช้เป็นภาษาไทย ตามสไตล์ `bin/cli.mjs`
- **CHANGELOG ทุก user-facing change** — bump `engines`, breaking, เปลี่ยนพฤติกรรม installer → ต้องมี entry ใน `CHANGELOG.md` (Keep a Changelog) ให้ผู้ใช้ npm migrate เองได้โดยไม่ต้องเดา

## 3. CI security baseline (บังคับทุก workflow ใน `.github/workflows/`)
> ถ้าผิดหลายข้อพร้อมกัน = pwn-request / supply-chain risk
- `permissions: contents: read` ที่ top-level (least-privilege)
- trigger `pull_request` — **ห้าม `pull_request_target`** (job รันโค้ดจาก PR)
- **ไม่มี `secrets.*`** เว้นจำเป็นจริง (เพิ่ม publish/token ต้องผ่าน review แยก)
- pin action ด้วย commit SHA (+ คอมเมนต์เวอร์ชัน)
- **ไม่ตั้ง `npm ci`/`cache: npm`** ตราบที่ repo zero-dep (ไม่มี lockfile → จะ fail)

## 4. Installer / packaging rules
- **installer สร้าง scaffold เอง — ห้าม copy พื้นที่ทำงานจาก repo ต้นทาง** — workspace ที่ผู้ใช้เป็นเจ้าของ (`docs/stages/`) ต้อง generate ใน target ไม่ลากของ repo ต้นทางไป (กัน scaffold leak → ดู `troubleshooting.md` #1)
- **pack-verify เป็น gate ก่อน publish** — assert `.warnyin/` ติด tarball **และ** ไม่มีงานจริง/ไฟล์รั่ว (`docs/`, `tests/`, `.github/`) หลุดขึ้น package
- **`package.json files` เป็น allowlist** — เพิ่ม path ใหม่ต้องคิดว่า publish ไปด้วยไหม; dotfolder ต้องระบุชัด (npm ไม่รวมให้อัตโนมัติ)

## 5. Testing rules
- **test installer = black-box spawn** — spawn `bin/cli.mjs` จริงใน temp dir แล้ว assert side-effect (ไฟล์/exit code/stdout/stderr); **ห้าม refactor target เพื่อ testability** + ห้าม import logic จาก `cli.mjs` (มันรัน side-effect ตอน import)
- **harness กลาง** — `makeTempProject(t)` + `runCli(cwd, args)` เป็น test pattern กลางของ repo ใช้ซ้ำทุก test ของ CLI (ดู `docs/techstack/installer/standard.md`)
- assert `code===0` ก่อนเสมอ + surface `stderr` ใน assertion message; assert stream ให้ตรง (`console.warn`→stderr); spawn array args ห้าม `shell:true`
