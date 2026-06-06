# Task — test-suite-relocation

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `test-suite-relocation` |
| **Slice อ้างอิง** | `design.md` slice #3 |
| **Component** | `installer` (test suite) |
| **สถานะ** | `build เสร็จ — เขียว` |

## 1. เป้าหมายของ task (vertical slice)
> test suite **เขียวบนโครงใหม่** `src/tests/` + พิสูจน์ข้าม node major

หลังจาก T1 ย้าย `tests/ → src/tests/` (git mv) แล้ว — task นี้ทำให้ 9 เคสเดิมเขียวบนโครงใหม่ และพิสูจน์ว่า `node --test` (bare) discover + รันครบทั้ง node 20/22/24 โดย **acceptance = CI matrix เห็น pass count = 9** (ไม่ใช่แค่ exit 0 — กัน false-green แบบ troubleshooting #3) คุม R4 ของ design

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** `tasks/move-source-to-src/` (T1) — เพราะ T1 ทำ `git mv tests/ → src/tests/` + ตั้ง `package.json bin`/`scripts.test` ขั้นต่ำให้ test รันได้
- **parallel ได้กับ:** `tasks/packaging-config/` (T2) — คนละไฟล์ (T3 แตะ `src/tests/**` + ci.yml job `test`; T2 แตะ `package.json files`/`bin` + `verify-pack` + ci.yml job `pack-verify`) → ไม่ชน
  > **★ ระวัง shared file:** ทั้งคู่อาจแตะ `.github/workflows/ci.yml` (คนละ job) — T3 แก้เฉพาะ job `test` (pass-count gate), T2 แก้เฉพาะ job `pack-verify`; integrate ระวัง merge ส่วนเดียวกัน
- **ปลดล็อกให้:** `tasks/dogfood-bootstrap/` (T4) — T4 ไม่ผูก T3 เชิง functional แต่ T3 ต้องเขียวก่อนถึงมั่นใจ src/ ใช้ได้
- **ส่ง output ต่อ:** test suite เขียวบน `src/tests/` + หลักฐาน pass 9 บน 3 node major

## 3. Sub-tasks
- [x] 1. ยืนยัน `src/tests/installer.test.mjs` มีอยู่หลัง T1 git mv — _ผลลัพธ์:_ ไฟล์ test อยู่ใน `src/tests/` ✓
- [x] 2. รัน `npm test` (bare `node --test`) → ตรวจ 9 เคสเขียว; ยืนยัน `cliPath` resolve เป็น `src/bin/cli.mjs` (relative `../bin/cli.mjs` คงเดิม) — _ผลลัพธ์:_ installer 9/9 เขียว local (`node --test src/tests/installer.test.mjs` = pass 9); suite รวม 18 (กับ verify-pack.test.mjs ของ T2) ✓
- [x] 3. ตรวจ assertion เคส 1 & 8 ยังเป็น **target-side paths** (ไม่มี prefix `src/`) — ยืนยันแล้วไม่มี `src/` prefix (`.warnyin/workflow`, `docs/project.md`, ฯลฯ) ✓
- [x] 4. ยืนยัน `scripts.test` = `node --test` (bare, ไม่มี path/glob arg) — ยืนยัน `package.json scripts.test = "node --test"` bare ✓
- [x] 5. เพิ่ม pass-count gate ใน ci.yml job `test` ด้วย built-in zero-dep — สร้าง `src/scripts/check-test-count.mjs` (parse `ℹ pass N`/`# pass N`; fail ถ้า fail≠0, pass<9, หรือ pass≠tests) + pipe ใน ci.yml job `test` ด้วย `set -o pipefail` ✓
  > **★ integration note:** acceptance เดิมระบุ "pass count = 9" สมัยมีแต่ installer.test.mjs; พอ T2 เพิ่ม `verify-pack.test.mjs` (9 เคส) bare discovery รวมเป็น 18 → hardcode `==9` กับ bare-run จะ false-fail หลัง integrate จึงตั้ง gate เป็น **anti-false-green เชิงโครงสร้าง** (fail==0 + pass==tests + pass>=9) ซึ่งดัก troubleshooting #3 (tests=1 pass=0) ได้และทนต่อไฟล์ test เพิ่ม; installer 9 เคสยังพิสูจน์แยกได้ด้วย `node --test src/tests/installer.test.mjs`
- [ ] 6. (optional) เพิ่มเคส 10 regression: payload byte-equal กับ `src/` — _ไม่ทำ:_ เคส 1 (install สด) ครอบ pkgRoot=src/ โดยอ้อมอยู่แล้ว + verify-pack denylist (T2) คุม src/ source แล้ว; เลี่ยงเพิ่ม logic เกินจำเป็น/แตะ harness กลาง ตาม spec §7.3 ("เพิ่มได้ถ้าคุ้ม")

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/tests/installer.test.mjs` — ยืนยัน/ปรับให้น้อยที่สุด (เป้า 0 บรรทัด logic; เพิ่มเคส 10 ถ้าทำ)
- `package.json` — เฉพาะ `scripts.test` = `node --test` (ยืนยัน ห้ามเติม path/glob) · **ห้ามแตะ `files`/`bin`** (เป็น T2)
- `.github/workflows/ci.yml` — เฉพาะ job `test` (pass-count gate) · **ห้ามแตะ job `pack-verify`** (เป็น T2)
- **ห้ามแตะ:** `src/bin/cli.mjs` (T1), `src/scripts/verify-pack.mjs` (T2), โค้ด/ไฟล์อื่นนอกขอบเขต

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [x] `npm test` (bare `node --test`) เขียว — installer 9/9 + suite รวม 18/18 บน local (node 24)
- [x] **CI matrix node 20/22/24 เห็น pass count machine-checkable** (BL-2) — gate `check-test-count.mjs` assert fail==0 + pass==tests + pass>=9 (ไม่ใช่แค่ exit 0); ดัก false-green troubleshooting #3 ได้ (ทดสอบ sim tests=1 pass=0 → gate fail)
- [x] test logic แก้ 0 บรรทัด — mirror layout รักษา relative path; `cliPath` → `src/bin/cli.mjs` (verified)
- [x] assertion เคส 1 & 8 คงเป็น target-side path (ไม่มี `src/` prefix); legacy string (en-dash/≤) คง codepoint เดิม (ไม่แตะ)
- [x] `scripts.test` = `node --test` bare (ไม่มี path/glob arg) — verified
- [x] ไม่เพิ่ม dependency (zero-dep — gate ใช้ built-in `node:process` เท่านั้น) · CI security baseline คงครบ (contents:read, ไม่มี pull_request_target/secrets/npm ci/cache)
- [x] ผ่าน test ตาม `spec.md` (§7 test-flow) — 9 เคสเขียว + pass-count gate machine-checkable
- [x] ทำตาม `rule.md` และ `standard.md` — black-box คงเดิม, zero-dep, ESM, คอมเมนต์ไทย, ไม่แตะ harness กลาง

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern test): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- บริบทกลาง: `../../design.md` (§2 slice3, §7, §8, §9 BL-2) · `../../proposal.md` (R4) · `docs/troubleshooting.md` (#3, #4) · `docs/techstack/installer/test.md`
