# Rule — validator-cap-gate

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก `docs/rule.md` + `docs/techstack/installer/`)

### 1.1 ขอบเขตไฟล์ (สำคัญสุด — กัน write conflict ใน wave 1)
- [ ] **แก้ที่ `src/` เท่านั้น** — root `.warnyin/`, `.claude/` เป็น dogfood ที่ gitignored (`docs/rule.md §6`) แก้ไปก็ไม่ถูก commit
- [ ] **task นี้เป็นเจ้าของแค่ 2 ไฟล์:** `src/.warnyin/workflow/scripts/validate-topic.mjs` + `src/tests/validate-topic.test.mjs`
- [ ] **ห้ามแก้ playbook ใด ๆ** — `src/.warnyin/workflow/stages/*.md`, `memory.md`, `fastlane.md`, `triage.md`, template `[topic]/*`, adapter `.claude/commands/warnyin/*` (เจ้าของคือ slice 1/2/4)
- [ ] **`triage.md §2D` = canonical ของตัวเลข cap — อ่านอย่างเดียว ห้ามแก้** (ถ้าเห็นว่าตัวเลขควรเปลี่ยน → note ใน §2 ด้านล่าง ไม่แก้เอง)
- [ ] **ห้ามแก้ `docs/`** (`docs/rule.md`, `docs/features/*/spec.md`, CHANGELOG) — spec delta merge + CHANGELOG เป็นของ SHIP / slice `release-hygiene`

### 1.2 Engineering (`docs/rule.md §2`)
- [ ] **zero-dependency** — `devDependencies` ต้องว่าง; ใช้เฉพาะ built-in `node:*` (test = `node:test`)
- [ ] **ESM** — `import`/`export` + `import.meta.url`; ห้าม `__dirname`/`require`
- [ ] **ภาษาไทย** สำหรับคอมเมนต์และข้อความผู้ใช้ทุกจุด
- [ ] **cross-platform** — path ด้วย `path.join`, temp ด้วย `os.tmpdir()`; spawn array args ห้าม `shell:true`
- [ ] **canonical-copy** — คอมเมนต์ในโค้ดอ้าง contract ที่มา (`design.md §4` C2/C3/C4 + `triage.md §2D`) ไม่ paraphrase กติกาใหม่

### 1.3 Validator design (`docs/rule.md §1` — structural validator)
- [ ] **✖ ต้องเป็น existence/structure ล้วน ไม่พึ่ง filled-detection** — C7 ใช้ **การนับบรรทัด** (deterministic) จึงเป็น ✖ ได้; ห้ามให้ `isFilled()` เป็นเงื่อนไขของ ✖ C7
- [ ] **mode/tier inference ต้อง fail-safe** — อ่าน tier ไม่ได้/ก้ำกึ่ง → ⚠ + **ข้ามเช็ค cap** (ไม่ block) และไม่ข้ามเช็คอื่นเงียบ ๆ
- [ ] **backward compatible** — topic เก่าที่มี `test.md`/`verify.md` ต้องไม่เกิด issue ใหม่ และ `docs/stages/achieved/` ยังไม่ถูกสแกน (`SKIP_TOPIC`)
- [ ] **security ของ report** — ไม่ echo เนื้อ artifact, ไม่พ่น absolute path, ไม่มี `child_process`/network/write ในสคริปต์นี้

### 1.4 Testing (`docs/rule.md §5` + `docs/techstack/installer/test.md`)
- [ ] **acceptance = pass count ไม่ใช่แค่ exit 0** — ยืนยันด้วย `npm test 2>&1 | node src/scripts/check-test-count.mjs` (`MIN_PASS` ปัจจุบัน 200 — เคสที่เพิ่มทำให้ยอดขึ้น ไม่ต้อง bump; การ bump เป็นงานของ `release-hygiene`)
- [ ] **ห้ามใส่ path/glob arg ให้ `node --test`** — ใช้ bare `node --test`
- [ ] **negative fixture ของ keyword-heuristic ต้องเลี่ยง trigger phrase** (`fast`/`standard`/`large`/`Spec delta`) ในข้อความ filler
- [ ] **กัน gate ลวง** — ต้องมีคู่ positive/negative ที่พิสูจน์ว่า cap แยกสองฝั่งได้จริง (`spec.md` E2) ไม่ใช่เทสที่เขียวไม่ว่าอะไรเข้ามา
- [ ] **boundary test บังคับ** — ทุก cap ต้องมีเคส `= cap` (ผ่าน) และ `cap + 1` (แดง)
- [ ] `assert` ต้อง surface `stdout`/`stderr` ใน message ของเคส executable

### 1.5 Process
- [ ] **investigate-before-edit** — อ่าน `validate-topic.mjs` ทั้งไฟล์ + เทสเดิมก่อนแก้ (รู้ว่าใครเรียก `checkTopic`/`detectMode`/`STAGES` บ้าง)
- [ ] **config-protection** — ห้ามลด/ปิด gate หรือแก้ `MIN_PASS`/เทสเดิมเพื่อให้ผ่าน; เทสเดิมทุกเคสต้องยังเขียว
- [ ] **minimalism** — เพิ่มเฉพาะฟังก์ชันที่จำเป็น ไม่ refactor ส่วนที่ไม่เกี่ยว
- [ ] **contract-first** — พึ่ง **contract C1/C2 ใน `design.md §4`** เท่านั้น **ห้ามอ่าน/รอไฟล์ template หรือ playbook ของ slice `build-verify-seam`**
- [ ] **gate ที่ยังรันไม่ได้ในรอบนี้:** `lint:md` / dead-link ระดับ integration + CHANGELOG = ของ wave 2 (`release-hygiene`) — ห้ามแก้ contract เพื่อให้ gate ข้าม slice ผ่าน

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` / `docs/techstack/.../rule.md` ตอนนี้ — note ไว้ก่อน ถึง SHIP ค่อยพิจารณา

- [ ] rule ที่เสนอ: **"cap/threshold ที่ประกาศใน playbook ต้องมี validator บังคับ + boundary test (`= cap` ผ่าน / `cap+1` แดง)"** — เหตุผล: cap ใน `triage.md §2D` ถูกละเมิด 12 ไฟล์เพราะประกาศแล้วไม่มีใครบังคับ (`proposal.md §2`) → กฎที่ประกาศแต่ไม่ enforce = กฎตาย
- [ ] rule ที่เสนอ: **"metric ที่ใช้ตัดสิน ✖ ต้องมีนิยามการวัดเขียนไว้ในโค้ดคอมเมนต์ (เช่น นับบรรทัด = `wc -l` semantics)"** — เหตุผล: จำนวนบรรทัดมี ambiguity เรื่อง trailing newline → ถ้าไม่ตรึงนิยาม unit/CI/มนุษย์นับไม่ตรงกัน
- [ ] rule ที่เสนอ: **"stage inference ที่เปลี่ยนจาก file-based → section-based ต้องคง path เก่าเป็น optional เสมอ"** — เหตุผล: topic เก่าค้างอยู่ใน `docs/stages/` ระหว่าง migration; ตัด required ทิ้งอย่างเดียวทำให้ topic เก่าตกชั้น stage เงียบ ๆ
