# Task — test-suite-relocation

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `test-suite-relocation` |
| **Slice อ้างอิง** | `design.md` slice #3 |
| **Component** | `installer` (test suite) |
| **สถานะ** | `รอ build` |

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
- [ ] 1. ยืนยัน `src/tests/installer.test.mjs` มีอยู่หลัง T1 git mv — _ผลลัพธ์:_ ไฟล์ test อยู่ใน `src/tests/`
- [ ] 2. รัน `npm test` (bare `node --test`) → ตรวจ 9 เคสเขียว; ยืนยัน `cliPath` resolve เป็น `src/bin/cli.mjs` (relative `../bin/cli.mjs` คงเดิม) — _ขึ้นกับ 1; ผลลัพธ์:_ pass 9 local
- [ ] 3. ตรวจ assertion เคส 1 & 8 ยังเป็น **target-side paths** (ไม่มี prefix `src/`) — _ขึ้นกับ 2:_ ยืนยันไม่เผลอแก้เป็น `src/.warnyin`
- [ ] 4. ยืนยัน `scripts.test` = `node --test` (bare, ไม่มี path/glob arg) — แก้ถ้า T1 ใส่ arg มา
- [ ] 5. เพิ่ม pass-count gate ใน ci.yml job `test` (parse `ℹ pass N` / `# pass N`, fail ถ้า ≠ 9) ด้วย built-in/shell zero-dep — _ขึ้นกับ 4:_ machine-checkable บน node 20/22/24
- [ ] 6. (optional) เพิ่มเคส 10 regression: payload byte-equal กับ `src/` (พิสูจน์ `pkgRoot`=src/) — _ทำถ้าคุ้ม, ห้ามแตะ harness กลาง_

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/tests/installer.test.mjs` — ยืนยัน/ปรับให้น้อยที่สุด (เป้า 0 บรรทัด logic; เพิ่มเคส 10 ถ้าทำ)
- `package.json` — เฉพาะ `scripts.test` = `node --test` (ยืนยัน ห้ามเติม path/glob) · **ห้ามแตะ `files`/`bin`** (เป็น T2)
- `.github/workflows/ci.yml` — เฉพาะ job `test` (pass-count gate) · **ห้ามแตะ job `pack-verify`** (เป็น T2)
- **ห้ามแตะ:** `src/bin/cli.mjs` (T1), `src/scripts/verify-pack.mjs` (T2), โค้ด/ไฟล์อื่นนอกขอบเขต

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] `npm test` (bare `node --test`) เขียว 9 เคสบน local
- [ ] **CI matrix node 20/22/24 เห็น pass count = 9** (BL-2) — ไม่ใช่แค่ exit 0; machine-checkable ถ้าทำได้ (ดู spec §7.2)
- [ ] test logic แก้น้อยที่สุด (เป้า 0 บรรทัด — mirror layout รักษา relative path); `cliPath` → `src/bin/cli.mjs`
- [ ] assertion เคส 1 & 8 คงเป็น target-side path (ไม่มี `src/` prefix); legacy string คง codepoint เดิม
- [ ] `scripts.test` = `node --test` bare (ไม่มี path/glob arg)
- [ ] ไม่เพิ่ม dependency (zero-dep) · ไม่ละเมิด CI security baseline ถ้าแตะ ci.yml
- [ ] ผ่าน test ตาม `spec.md` (§7 test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern test): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- บริบทกลาง: `../../design.md` (§2 slice3, §7, §8, §9 BL-2) · `../../proposal.md` (R4) · `docs/troubleshooting.md` (#3, #4) · `docs/techstack/installer/test.md`
