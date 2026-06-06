# Spec — test-suite-relocation

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — เน้น §7 Test-flow (เป็น task ชนิด `test`)

## 1. ชนิดของ task
`test` — ทำให้ black-box test suite (9 เคสเดิม) **เขียวบนโครงใหม่ `src/tests/`** + พิสูจน์ pass count ข้าม node major (20/22/24) ผ่าน CI matrix

> ไม่มี API / UX-UI / DB → §2,§3,§6 ไม่เกี่ยว · เน้น §4 (test discovery flow), §5 (dev/CI flow), §7 (test-flow ละเอียด)

---

## 4. Data-flow (test discovery)
```
npm test  ──► node --test (bare, ไม่มี path/glob arg)
            ──► auto-discover *.test.* ใน cwd (recurse, ข้าม node_modules)
            ──► เจอ src/tests/installer.test.mjs
            ──► spawn process.execPath + src/bin/cli.mjs ลง temp dir
            ──► assert side-effect จริง (ไฟล์/exit code/stdout/stderr)
```
- **กุญแจ R4 (design §8 / BL-2):** bare `node --test` recurse เข้า `src/tests/` ได้เหมือนกันทุก node 20/22/24 (พิสูจน์แล้ว node 24 + troubleshooting #3 ยืนยัน bare ข้าม major)
- **★ ห้ามใส่ path/glob arg เด็ดขาด** — `node --test src/tests/` จะ MODULE_NOT_FOUND บน node 24 (ตี path เป็น module), glob `src/tests/**/*.test.mjs` ใช้ได้แค่ node 21+ (พังบน node 20 ใน matrix) — troubleshooting #3
- **cliPath relative คงเดิม:** `fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))` จาก `src/tests/` → `src/bin/cli.mjs` (mirror layout รักษา relative path → **แก้ 0 บรรทัดในตัว test logic**)

## 5. Dev / CI flow
- **local dev (Linux/mac):** `npm test` → 9 เคสเขียว
- **local dev (Windows):** `npm test` ใช้ได้ปกติ (spawn ผ่าน `process.execPath`); แต่ **`verify:pack` รันตรงบน Windows ENOENT** (troubleshooting #4) → task นี้โฟกัส test เป็นหลัก ถ้า dev บน Windows ต้องพิสูจน์ pack logic ให้รัน `npm pack --dry-run --json` แล้ว apply allowlist logic เอง (ไม่เรียก `npm` ผ่าน `execFile`)
- **CI:** `.github/workflows/ci.yml` job `test` matrix node [20,22,24] รัน `npm test` ทุก PR/push(main)

## 7. Test-flow (เกณฑ์ที่ต้องผ่าน — หัวใจของ task)

### 7.1 9 เคสเดิมต้องเขียวบน `src/tests/` (ตรวจว่าถูกต้องหลังย้าย)
หลัง T1 (`git mv tests/ → src/tests/`) ต้องยืนยันทุกเคสยัง assert ถูก:

1. ติดตั้งสด — สร้างโครงครบ
2. idempotent — รัน 2 ครั้ง byte-equal + ไม่ append ซ้ำ (`stdout` มี "ข้าม")
3. `--update` ไม่ทับงานจริง (`docs/project.md` / `docs/stages/demo/`)
4. `installRootDoc` append section + ไม่ append ซ้ำ
5. legacy 0.3–0.5.x → warn ที่ `stderr` (string ตรงจาก `cli.mjs`)
6. legacy ≤0.2.x → warn ที่ `stderr` (คนละ string จากเคส 5)
7. `seedDocs` ข้าม `[...]` (negative)
8. `--dry-run` ไม่เขียนไฟล์ (temp ยังว่าง)
9. scaffold สร้างเปล่า ไม่ leak `docs/stages/<topic>`

- [ ] `cliPath` → resolve เป็น `src/bin/cli.mjs` จริง (relative `../bin/cli.mjs` คงเดิม — ห้ามแก้)
- [ ] **★ assertion เคส 1 & 8 เป็น target-side paths** (`.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`, `docs/project.md`, `CLAUDE.md`, `AGENTS.md`, `.claude`) → เป็น path **ใน target dir หลัง install** ไม่ใช่ใน `src/` → **ห้ามเผลอแก้เป็น `src/.warnyin` / `src/.claude`** (จะ assert ผิด — installer วางที่ target ไม่มี prefix `src/`)
- [ ] เคส 5/6 legacy string ต้องคง codepoint เดิม (en-dash U+2013 ใน `0.3–0.5.x`, `≤` U+2264) — copy ตรงจาก `src/bin/cli.mjs`
- [ ] แก้ test logic ให้น้อยที่สุด (เป้า 0 บรรทัด) — mirror layout ออกแบบให้ relative path เดิมยังถูก

### 7.2 Acceptance gate (BL-2) — CI matrix เห็น pass count = 9
- [ ] **ห้าม false-green:** exit 0 อย่างเดียวไม่พอ (troubleshooting #3: `node --test src/tests/` คืน tests=1 pass=0 แต่ exit อาจหลอก) → ต้องยืนยัน **pass count = 9** จริงบนทั้ง node 20, 22, 24
- [ ] วิธี assert pass count ใน CI (ถ้าทำได้): อ่าน summary line `ℹ pass 9` จาก output ของ `node --test` (tap/spec reporter พิมพ์ `# pass 9` / `ℹ pass 9`) แล้ว fail ถ้าไม่เท่า 9 — เช่น grep/parse summary ใน step CI หรือ assert ใน script เล็ก ๆ ที่ไม่เพิ่ม dependency (zero-dep, built-in เท่านั้น)
- [ ] ถ้า assert pass count ใน CI ทำไม่ได้สะอาด → อย่างน้อยรัน `npm test` ครบ matrix แล้ว **อ่าน summary ด้วยตา** ยืนยัน pass 9 ทุก node major (บันทึกใน BUILD/VERIFY) — แต่พยายามทำให้ machine-checkable ก่อน

### 7.3 Regression (optional — S4/S5 ของ QA): smoke ว่า `pkgRoot` ชี้ `src/` หลังย้าย
- [ ] เคส 1 (install สด) ครอบอยู่แล้วโดยอ้อม — payload (`.warnyin/workflow` ฯลฯ) มาจาก `src/.warnyin/...` ผ่าน `pkgRoot=src/`; ถ้าเพิ่มได้: assert ว่าไฟล์ที่ install มา **byte-equal กับต้นฉบับใน `src/`** (เช่น `src/.warnyin/workflow/README.md` === target `.warnyin/workflow/README.md`) เพื่อพิสูจน์ payload source = `src/` จริง ไม่ใช่ root เก่า
- [ ] เคสนี้เป็น **เพิ่มได้ถ้าคุ้ม** — ห้ามทำให้ logic ซับซ้อนเกิน/แตะ harness กลาง; ถ้าเพิ่มต้องผ่าน node 20/22/24 ด้วย

### 7.4 ขอบเขตที่ห้ามทำ (กัน scope creep)
- ห้ามแก้ `src/bin/cli.mjs` (เป็น T1) · ห้ามแก้ `package.json files`/`bin` (เป็น T2) · ห้ามแก้ ci.yml `pack-verify` step (เป็น T2)
- task นี้แตะเฉพาะ `src/tests/**`, `package.json scripts.test` (ยืนยัน `node --test` bare — น่าจะ T1 ตั้งไว้แล้ว ก็แค่ยืนยัน), และ `.github/workflows/ci.yml` job `test` (เพิ่ม pass-count gate ถ้าทำ)
