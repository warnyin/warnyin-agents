# Task — validator-cap-gate

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน contract

| | |
|---|---|
| **Task** | `validator-cap-gate` |
| **Slice อ้างอิง** | `design.md` slice #3 ("cap บังคับได้จริง") |
| **Component** | `workflow core` (`src/.warnyin/workflow/scripts/`) + `installer` (test suite) |
| **Model tier** | `balanced` |
| **สถานะ** | `done` |

## 1. เป้าหมายของ task (vertical slice)
ทำให้ **cap ขนาดเอกสารต่อ tier ที่ประกาศใน `triage.md §2D` ถูกบังคับได้จริง** — validator เช็คจำนวนบรรทัดของ artifact เทียบ cap ต่อ tier: เกิน = ✖ block (exit 1), อ่าน tier ไม่ได้ = ⚠ ข้าม (fail-safe) — พร้อมปรับ **stage inference เป็น section-based** ให้รองรับโครง artifact ใหม่ (`build.md` ไฟล์เดียว 4 section) โดยไม่ทำให้ topic เก่าพัง end-to-end: pure fn → issue → render → exit code → unit + executable test

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** ไม่มี — **wave 1 ขนานกับ 3 task อื่น**
- **พึ่งพา contract ไม่ใช่ไฟล์:** `design.md §4` **C1** (ชื่อ 4 section ของ `build.md`) · **C2** (stage inference) · **C3** (cap) · **C4** (tier source) — copy ข้อความ/ชื่อ section **คำต่อคำ** จาก `design.md §4`; **ห้ามอ่านหรือรอไฟล์ template/playbook ของ slice `build-verify-seam`**
- **ปลดล็อกให้:** `release-hygiene` (wave 2 — full gate + CHANGELOG + dead-link หลัง integrate ครบ)
- **ส่ง output อะไรต่อ:** validator ที่ยอมรับทั้งโครงเก่า (`test.md`/`verify.md`) และโครงใหม่ (`build.md §4`) → integrate กับ slice 2 ได้โดยไม่ต้องแก้ซ้ำ

## 3. Sub-tasks
- [x] 1. **อ่านก่อนแก้** — `src/.warnyin/workflow/scripts/validate-topic.mjs` ทั้งไฟล์ + `src/tests/validate-topic.test.mjs` (harness/pattern) + `design.md §4` C1-C4 + `triage.md §2D` (อ่านอย่างเดียว) — _ผลลัพธ์:_ รู้ผู้ใช้ของ `STAGES`/`checkTopic`/`detectMode` ครบก่อนแตะ
- [x] 2. **เทสก่อน (RED)** — เขียนเคสกลุ่ม A–F ตาม `spec.md §7` ลง `src/tests/validate-topic.test.mjs` แล้วรันให้เห็นแดงจริง — _ขึ้นกับ 1_
- [x] 3. **`countLines()` + `CAPS` const** — นิยามการนับแบบ `wc -l` (ตัดบรรทัดว่างท้ายไฟล์ที่เกิดจาก trailing `\n`) + ตาราง cap พร้อมคอมเมนต์อ้าง `triage.md §2D` — _ขึ้นกับ 2_
- [x] 4. **`parseTier()` / `resolveTier(files, mode)`** — parse row `| **ขนาด** |` ของ `proposal.md` → `fast|standard|large`; fast-mode (receipt-only) → `fast`; นอกนั้น `null` — _ขึ้นกับ 2_
- [x] 5. **`checkCaps(files, tier)` (pure, export)** — วน cap ของ tier เฉพาะไฟล์ที่มีจริง; `design.md` ตัดที่ heading `## 9. Spec delta` (H2 เป๊ะ, ไม่เจอ → ทั้งไฟล์); เกิน → `{code:'C7', level:'error', msg}` ระบุ **ไฟล์ + จำนวนบรรทัด + cap + tier**; `tier === null` และมี artifact ที่ cap ครอบ → `{code:'C7', level:'warn'}` ข้ามเช็ค; `large` → ไม่มี issue — _ขึ้นกับ 3+4_
- [x] 6. **ต่อเข้า `checkTopic`** — (ก) branch `mode === 'fast'` เดิม early-return `{issues: [], stage:'fast-track'}` → คืน `checkCaps(files,'fast')` แทน (C1-C4/C6 ยังถูกข้ามเหมือนเดิม); (ข) path `normal`/`mixed` push `checkCaps(files, resolveTier(...))` — _ขึ้นกับ 5_
- [x] 7. **stage inference C2** — ปรับแถว VERIFY ของ `STAGES` (เดิม `required: ['verify.md','test.md']`) ให้ **ไม่บังคับ 2 ไฟล์นั้น** แต่ยัง infer VERIFY ได้เมื่อไฟล์เก่ามีอยู่ (เช่น ย้ายไปเป็น `optional`) + เพิ่มเงื่อนไข section-based: `build.md` filled **และ** มี `## 4. ผล verify` → `VERIFY`, ไม่มี → `BUILD` — _ขึ้นกับ 1_
- [x] 8. **GREEN + regression** — เคสใหม่เขียวครบ **และเคสเดิมทุกเคสยังเขียว** (โดยเฉพาะกลุ่ม fast/mixed/receipt-template และ `stage inference: ... → stage = 'BUILD'`) — _ขึ้นกับ 6+7_
- [x] 9. **ปิดงาน** — `npm test 2>&1 | node src/scripts/check-test-count.mjs` ผ่าน + ตรวจ output ไม่มี absolute path/เนื้อ artifact + ทบทวนว่าไม่มีไฟล์นอกขอบเขต §4 ถูกแก้

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
**แก้ได้ (เจ้าของ):**
- `src/.warnyin/workflow/scripts/validate-topic.mjs`
- `src/tests/validate-topic.test.mjs`

**ห้ามแตะ:** `src/.warnyin/workflow/stages/*.md` · `src/.warnyin/workflow/{memory,fastlane,triage}.md` · `src/.warnyin/template/**` · `src/.claude/**` · `docs/**` (รวม `docs/rule.md`, `docs/features/*/spec.md`) · `CHANGELOG.md` · `package.json` · `src/scripts/check-test-count.mjs` · root `.warnyin/` และ `.claude/` (dogfood, gitignored)

## 5. Acceptance criteria
- [x] `checkCaps` เป็น **pure function** (รับ `Map` + tier, ไม่มี `node:fs`) และ export ให้ unit เรียกตรงได้
- [x] cap ถูกบังคับตาม C3: `fast receipt.md ≤40` · `standard proposal.md ≤60 / design.md ≤120` · `large` ไม่มี cap; เกิน → `level: 'error'` → CLI พิมพ์ `✖ [C7] ...` และ **exit 1**
- [x] `design.md` นับเฉพาะบรรทัด **ก่อน** `## 9. Spec delta` (ไม่มี heading → ทั้งไฟล์; `####` ไม่นับเป็น cut point)
- [x] tier อ่านจาก row `| **ขนาด** |` ของ `proposal.md`; อ่านไม่ได้/ค่าเพี้ยน → `⚠ [C7]` **ไม่บังคับ cap และไม่ทำให้ exit 1**
- [x] topic แบบ fast (receipt-only) ยังได้ `stage: fast-track` + ยังข้าม C1-C4/C6 **แต่ cap ของ `receipt.md` ถูกเช็ค**
- [x] stage inference: `build.md` filled + `## 4. ผล verify` → `VERIFY`; filled แต่ไม่มี section → `BUILD`
- [x] topic เก่าที่มี `verify.md`/`test.md` **ไม่เกิด issue ใหม่** และยัง infer เป็น `VERIFY`; topic ใหม่ที่ไม่มี 2 ไฟล์นั้นก็ไม่โดน ⚠ C1 ปลอม
- [x] มีเคส boundary ครบทุก cap (`= cap` ผ่าน / `cap+1` แดง) + เคส negative ที่พิสูจน์ว่า gate จับได้จริง (กัน gate ลวง)
- [x] เทสเดิมทุกเคสยังเขียว · `npm test` ผ่าน **และ pass-count gate ผ่าน** (`node src/scripts/check-test-count.mjs`) — ไม่ใช่แค่ exit 0
- [x] zero-dep (`node:*` เท่านั้น) · ESM · ข้อความไทย · ไม่ echo เนื้อ artifact · ไม่พ่น absolute path
- [x] ไม่มีไฟล์นอกขอบเขต §4 ถูกแก้ (โดยเฉพาะ playbook และ `triage.md`)
- [x] ผ่าน test ตาม `spec.md` (test-flow A–F)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
