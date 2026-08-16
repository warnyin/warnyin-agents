# Task — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `release-hygiene` |
| **Slice อ้างอิง** | `design.md` slice #3 |
| **Component** | `installer` |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
ทำให้ prune ที่ slice 1+2 สร้างขึ้น **ออกถึงมือผู้ใช้ได้จริงและปลอดภัย** — ผู้ใช้รู้ล่วงหน้าว่า `--update` ลบไฟล์ได้ (surface 4 จุด), รู้ว่าจะเจออะไรตอนอัปเกรด (`CHANGELOG` `### Migration`), กู้/ปิดเป็นเมื่อพลาด (runbook `docs/infra.md`), และ gate ของ repo ยังจับ regression ได้จริงหลังเพิ่มเคสจำนวนมาก (`MIN_PASS` + `verify:pack` + `lint:md` + dual `validate-topic`) → ปิดท้ายด้วย release `0.30.1`

## 2. Dependency
- **ต้องทำหลัง:** `tasks/prune/` **และ** `tasks/upgrade-path-test/` **integrate เข้า build branch ครบแล้ว** — **wave 2 เท่านั้น** เพราะ
  - `MIN_PASS` ต้องคำนวณจาก **ยอด pass จริง** หลังเทสสองชุดเข้ามา
  - negative-grep / positive-grep ต้องเห็นไฟล์ครบทั้ง topic
  - runbook ต้องอ้าง **reason string ที่ implement จริง** (เทียบเซตปิด C15)
  - `lint:md` เป็น integration gate ที่พึ่ง pointer ข้าม slice
- **ปลดล็อกให้:** BUILD full gate → VERIFY → SHIP (publish `0.30.1`)
- **ส่งต่อ:** build report ที่มี (ก) `N` ที่วัดได้ + `MIN_PASS` ใหม่ (ข) เหตุผล patch bump (ค) รายการ **นโยบายที่ขัดกัน** ที่พบแต่ไม่ได้แก้ (ถ้ามี)

## 3. Sub-tasks (เรียงตามลำดับ — ผลของขั้นก่อนเป็น input ของขั้นถัดไป)

- [ ] **1. ยืนยัน baseline ก่อนแตะอะไร** — `npm test 2>&1 | node src/scripts/check-test-count.mjs` แล้วจด `N`, `fail`, `tests` · ยืนยันว่า `installer-prune.test.mjs` + `installer-upgrade.test.mjs` อยู่ใน tree และเขียว — _ผลลัพธ์:_ ตัวเลข `N` สำหรับขั้น 5 · ถ้าแดง → **หยุด รายงาน ห้ามแก้เทสสองใบนั้น**
- [ ] **2. surface ของ flag ใหม่ 4 จุด** — copy canonical จาก `spec.md §4.1` ลง `README.md:40` · `src/.warnyin/workflow/README.md:101` · `src/.warnyin/installer/templates/CLAUDE.md:49` · บล็อก `--help` ใน `src/bin/cli.mjs:50` (ตัด backtick ตาม `spec.md §4.3` แถว 4; **ห้ามแตะ logic**) — _ผลลัพธ์:_ positive-grep G8 ได้ 4 hit
- [ ] **3. เทส wording (ขึ้นกับ 2)** — แก้ assert ใน `src/tests/installer.test.mjs` (~720) เพิ่ม positive needle ใหม่ + **negative-grep wording เก่า** ในเทส · รัน negative-grep G7 ให้ได้ 0 hit **ก่อน** แก้ expected (พิสูจน์ตาม `rule.md §1`) — _ผลลัพธ์:_ เทส `--help wording regression` เขียวด้วยเหตุผลที่ถูกต้อง
- [ ] **4. unit เคสคู่ขนานของ verify-pack** — เพิ่มเคสใน `src/tests/verify-pack.test.mjs`: `checkFiles([...GOOD, '.warnyin/.warnyin-manifest'])` ต้องคืน error ที่อ้าง path นั้น · **ไม่แก้ `verify-pack.mjs`** — _ผลลัพธ์:_ ยอด pass +1 (นับรวมในขั้น 5)
- [ ] **5. bump `MIN_PASS` (ขึ้นกับ 1,3,4)** — รัน `npm test` ใหม่เพื่อได้ `N` สุดท้าย → `MIN_PASS = floor((N−5)/10)×10` → แก้ค่า + คอมเมนต์ที่มา (topic · slice · `N` · `<วันที่ที่ BUILD รันจริง>`) ตาม `standard.md §2.5` · ทำ negative proof (`MIN_PASS = N+1` ต้องแดง) แล้วคืนค่า — _ผลลัพธ์:_ G1/G2 เขียว
- [ ] **6. runbook ใหม่ใน `docs/infra.md`** — section `## Runbook — prune ลบไฟล์ไป — ตรวจ/กู้/ปิด` ครบ 5 องค์ประกอบตาม `standard.md §2.3` (ตรวจ · กู้ 3 กรณีรวม dogfood ที่ gitignored · ปิด · ตาราง reason 13 ค่า · exit 0 เสมอ) — **ขึ้นกับการ grep reason string จริงจาก `cli.mjs` (G9)** — _ผลลัพธ์:_ ตาราง reason ⊇ เซตปิด C15
- [ ] **7. sweep `## Env vars สำคัญ`** — เพิ่ม `.warnyin/.warnyin-manifest` เป็น install-time artifact + `WARNYIN_NO_PRUNE` + คำเตือนว่า `npm run setup:dogfood` รัน `--update` ⇒ prune ทำงานกับ root dogfood ที่ gitignored (กู้จาก git ไม่ได้) ตาม `standard.md §2.4`
- [ ] **8. CHANGELOG `## [0.30.1] - <วันที่ที่ BUILD รันจริง>`** — เติมวันที่/สร้าง header + `### Migration` 4 ข้อตาม `standard.md §2.2` · **ห้ามแตะ entries ของ slice อื่นและบล็อก `## Migration guide` หัวไฟล์**
- [ ] **9. `package.json` → `0.30.1`** + บันทึกเหตุผล **patch** (bugfix ของ upgrade path) ลง build report ตาม `docs/rule.md §1` declared-threshold
- [ ] **10. full gate + cross-slice consistency** — รัน G1–G11 ใน `spec.md §7` ให้ครบ: `npm test | check-test-count` · `npm run lint:md` · `npm run verify:pack` · dual `validate-topic` (dogfood + v-next) · negative/positive-grep · เทียบ reason string กับ C15 — _ผลลัพธ์:_ ทุก gate เขียว + build report สรุปสิ่งที่ **รายงานแต่ไม่แก้**

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

**เป็นเจ้าของแต่ผู้เดียว (แก้ได้)**
- `CHANGELOG.md` (เฉพาะ section `[0.30.1]` — วันที่ + `### Migration` + entries ของ slice นี้)
- `package.json` (ช่อง `version`)
- `docs/infra.md` (runbook ใหม่ + `## Env vars สำคัญ`)
- `src/scripts/check-test-count.mjs` (`MIN_PASS` + คอมเมนต์)
- `README.md` (บรรทัด 40)
- `src/.warnyin/workflow/README.md` (บรรทัด 101)
- `src/.warnyin/installer/templates/CLAUDE.md` (บรรทัด 49)
- `src/tests/verify-pack.test.mjs` (เพิ่มเคสใหม่)
- `src/tests/installer.test.mjs` (**เฉพาะ** เทส `cli --help wording regression` ~720)
- `src/bin/cli.mjs` (**เฉพาะข้อความในบล็อก `--help`** — ข้อยกเว้นเดียว)

**ห้ามแตะเด็ดขาด**
- logic ใด ๆ ใน `src/bin/cli.mjs` (นอกบล็อก `--help`)
- `src/tests/installer-prune.test.mjs` · `src/tests/installer-upgrade.test.mjs` — แดงเพราะ contract ไม่ตรง → **รายงาน ไม่แก้เทส**
- `src/scripts/verify-pack.mjs` (`DENY_PREFIX '.warnyin/'` ครอบอยู่แล้ว)
- `docs/techstack/installer/*` — rule/standard กลาง (`build.md §3 ข้อ 6`) ⇒ note รอ SHIP ใน `rule.md §2` เท่านั้น
- `docs/rule.md` · บล็อก `## Migration guide` หัว `CHANGELOG.md` · entries ของ slice อื่น

## 5. Acceptance criteria
- [ ] canonical wording ปรากฏครบ **4 จุด** (positive-grep 4 hit) และ wording เก่า **0 hit** ทั้ง repo (G7/G8)
- [ ] เทส `--help wording regression` มีทั้ง positive needle ใหม่และ negative needle เก่า และเขียว
- [ ] `src/tests/verify-pack.test.mjs` มีเคสที่ยืนยัน `checkFiles(['.warnyin/.warnyin-manifest'])` คืน error — โดย **ไม่แก้** `verify-pack.mjs`
- [ ] `MIN_PASS` = `floor((N−5)/10)×10` จาก `N` ที่รันจริงในรอบนี้ + คอมเมนต์ระบุ topic/slice/N/วันที่ + ผ่าน negative proof
- [ ] `docs/infra.md` มี runbook ใหม่ครบ 5 องค์ประกอบ รวม **ตาราง reason code 13 ค่า** และหมายเหตุ **exit 0 เสมอ ⇒ อ่าน stdout**
- [ ] `## Env vars สำคัญ` มี `.warnyin-manifest` + `WARNYIN_NO_PRUNE` + คำเตือน `setup:dogfood`
- [ ] `CHANGELOG.md` มี `## [0.30.1] - <วันที่ที่ BUILD รันจริง>` + `### Migration` ครบ 4 ข้อ · `package.json` = `0.30.1` · เหตุผล patch อยู่ใน build report
- [ ] full gate เขียวครบ: `npm test | check-test-count` · `lint:md` · `verify:pack` · `validate-topic` **ทั้ง dogfood และ v-next**
- [ ] reason string ในโค้ด ⊆ เซตปิด C15 — ถ้าไม่ตรง มี **รายงานใน build report** (ไม่ใช่การแก้ `cli.mjs`)
- [ ] ผ่าน test ตาม `spec.md` (test-flow G1–G11)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern การเขียน): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Design canonical: `../../design.md` §2 (ownership) · §4 C15 (reason set) · §6 (wording + verify-pack) · §7 (dependency)
