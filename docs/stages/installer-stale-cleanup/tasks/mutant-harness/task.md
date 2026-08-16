# Task — mutant-harness

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `mutant-harness` |
| **Slice อ้างอิง** | `design.md` slice **#2b** — "falsifiability ถูกพิสูจน์" |
| **Component** | `installer` |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
พิสูจน์ว่า **assertion เชิง negative ของ suite ไม่กำพร้า** — ปิด guard ทีละชั้นบน **สำเนา `cli.mjs` ใน temp** แล้วยืนยันว่าเหยื่อที่เคส negative บอกว่า "ยังอยู่" **หายไปจริง**

**ทำไมต้องมี:** โค้ดก่อนแก้ **ไม่มีการลบเลย** ⇒ เคส negative (`U3` `U5` `U6` `U7` `U8` `U11`) **เขียวตั้งแต่แรกโดยไม่ทดสอบอะไร** ⇒ ประโยค "แดงกับโค้ดก่อนแก้" ใช้กับครึ่งหนึ่งของ suite ไม่ได้ · mutant harness คือ **สิ่งเดียว** ที่พิสูจน์ว่า assertion เหล่านั้นมีความหมาย

**สิ่งที่ไม่ใช่งานนี้:** guard ที่หา "เหยื่อซึ่ง guard นั้นเป็นชั้นเดียวที่บล็อก" ไม่ได้ → เป็น **unit ของ `tasks/prune/`** (เรียก `computeStale` ตรง ไม่ผ่าน fs guard) — รายการเต็มที่ `spec.md §8`

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- **ต้องทำหลัง: `tasks/prune/` integrate เข้า `src/bin/cli.mjs` แล้วเท่านั้น — wave 2** (`design.md §7`)
  **เหตุผล:** `find` ของทุกแถวต้องเป็น **สตริงจริงในโค้ด prune** · ถ้าทำพร้อม wave 1 anchor จะกลายเป็นคำบรรยายที่ replace ไม่ติด และทุกแถวจะแดงที่ `assert.notEqual` ตลอด wave (KB #33)
  **เช็คก่อนเริ่ม (ถ้าไม่ผ่าน = หยุด รายงาน ห้ามเดา):** `src/bin/cli.mjs` มี `PRUNE_BLAST_CAP` · มี reason literal ของเซตปิด C15 · มี `mergeManifest`/`writeManifest`/`computeStale`
- **อ่านเป็นแหล่งความจริง:** `design.md §4` contract **C4 C5 C7 C8 C9 C10 C11 C13 C15** (copy ไว้ที่ `spec.md §3`) + `§7` (เหตุผลของ wave 2) + `§8`
- **อ่านเพื่อ reuse state:** `tasks/upgrade-path-test/spec.md §7.2` (เคส `U3` `U4` `U6` `U7` `U11` `U12` `U13` `U14`) + `standard.md §2.2–2.4` — **อ่านอย่างเดียว ห้ามแก้ไฟล์เทสของ task นั้น**
- **ปลดล็อกให้:** `tasks/release-hygiene/` (**wave 3**) — ส่งต่อ **จำนวนเคสจริง (N = 13)** ที่วัดจาก output ของ `node --test` เพื่อ bump `MIN_PASS` (task นี้ **ห้ามแก้ `check-test-count.mjs`**)
- **ส่ง output ต่อ:** ไฟล์เทส + **ตาราง anchor ที่ใช้จริง** (id → `find` ที่พบในโค้ด → บรรทัด) เพื่อให้ SHIP/รุ่นถัดไป sync ได้เมื่อ `cli.mjs` เปลี่ยน

## 3. Sub-tasks

- [ ] 1. **สแกน anchor จากโค้ดจริง** — อ่าน `src/bin/cli.mjs` ที่ integrate แล้ว หา locator ของทุกแถว (reason literal ของ C15 · `PRUNE_BLAST_CAP` · `AGENT_ALLOW_RE` · `SKILL_ALLOW` · `mergeManifest` · `path.relative(`) แล้วบันทึก **`find` จริงพร้อมเลขบรรทัด** — _ผลลัพธ์:_ ตาราง anchor 12 แถว · **ถ้าแถวใดหา anchor ไม่ได้ → หยุดที่แถวนั้น รายงาน (§7) ห้ามประดิษฐ์ anchor ใหม่เอง**
- [ ] 2. **harness ในไฟล์** — `makeTempProject` / `runMutant` / `ok` / `listFiles` / `copyDir` / `sha256OfFile` / `manifestPath` / `addStaleEntry` / `assertManifestUsable` — _ขึ้นกับ 1:_ ไฟล์รันผ่าน `node --test` ได้โดยไม่ crash ระดับ module
- [ ] 3. **`MUTATIONS` + M0** — ประกาศ array ค่าคงที่ตัวเดียว (`{id, contract, find, replace, covers}`) แล้วเขียน **M0 structural self-check** (`length === 12` + ทุกแถว `original.split(find).length - 1 === 1`) — _ขึ้นกับ 1_
- [ ] 4. **`runMutantRow()`** — ลำดับบังคับตาม `spec.md §6.1` (baseline install → `assert.notEqual` → เขียน mutant → `prepare` → spawn → assert) + **canary co-assertion** ตาม `§6.2` — _ขึ้นกับ 2-3_
- [ ] 5. **แถวที่ reuse state ได้** M4 M5 (C5) · M6 (C7 hash) · M8 (C8 ancestor) · M9 (C8 leaf) · M10 (C9 cap) — _ขึ้นกับ 4_
- [ ] 6. **แถวที่ต้องสร้างเหยื่อเฉพาะกิจ** M1 (backslash ในชื่อไฟล์) · M2 (dot-segment ที่ resolve แล้วยังอยู่ใน root) · M3 (control char ในชื่อไฟล์) · M7 (ไฟล์ > 5 MB) — _ขึ้นกับ 4:_ ต้องมีคอมเมนต์อธิบายว่าทำไมเหยื่อของ `U5` ใช้ไม่ได้ (`spec.md §5.2`)
- [ ] 7. **แถวขั้วกลับ + dry-run** M11 (C13 union — 2 รอบ `--no-prune` → `--update`) พร้อม co-assertion บน **เนื้อ manifest หลังรอบ 1** · M12 (C15 `--dry-run` ห้ามเรียก `unlink`/`rmdir`) พร้อม co-assertion **manifest byte-equal** — _ขึ้นกับ 4_
- [ ] 8. **self-consistency** — รัน **bare `npm test`** → นับเคสจริง · ยืนยัน `pass === tests` · ไม่มี `t.skip` · `git status --porcelain src/bin/cli.mjs` ว่าง · บันทึกตาราง anchor ลงรายงานปิด task

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

**เป็นเจ้าของแต่ผู้เดียว (สร้างใหม่):**
- `src/tests/installer-mutant.test.mjs`

**ห้ามแตะเด็ดขาด:**
- `src/bin/cli.mjs` — **อ่านได้อย่างเดียว** (`readFileSync`) · ห้ามแก้เพื่อให้ anchor หาง่ายขึ้น หรือเพื่อให้เทสเขียว
- `src/tests/installer-upgrade.test.mjs` (เจ้าของ: `tasks/upgrade-path-test/`) · `src/tests/installer-prune.test.mjs` (เจ้าของ: `tasks/prune/`) · `src/tests/installer.test.mjs` (เจ้าของ: `tasks/release-hygiene/`)
- `src/scripts/**` (รวม `check-test-count.mjs` / `MIN_PASS`) · `docs/techstack/**` · `docs/rule.md` · `CHANGELOG.md` · `package.json` · `README.md`
- **ไฟล์ใด ๆ ใน repo ระหว่างรัน** — ทุก side-effect (mutation, install, ลบ) เกิดใน `os.tmpdir()` เท่านั้น
- **ห้าม `git commit` / `git add`** ทุกกรณี

## 5. Acceptance criteria

- [ ] ไฟล์ `src/tests/installer-mutant.test.mjs` ถูก bare-discover โดย `node --test` และรันจบ **13 เคส** (M0 + M1–M12) — **ไม่มี `t.skip`** แม้แต่ตัวเดียว
- [ ] **M0 มีครบ 2 ชั้น:** `MUTATIONS.length === 12` **และ** ทุกแถว `original.split(find).length - 1 === 1` (anchor พบพอดี 1 ครั้ง)
- [ ] ทุกแถวมี **`assert.notEqual(mutated, original, …)` เป็นบรรทัดแรกหลัง `replace`** — ไม่มี `if/return`, ไม่มี `try/catch`, ไม่มี log-แล้วเดินต่อ
- [ ] ทุกแถวมี **co-assertion ครบตาม `spec.md §6.2`** (exit 0 · canary stale ถูกลบสำเร็จ + มีบรรทัด `  − ` ของ canary · `ลบ N ≥ 2` · payload ที่ยังใช้อยู่ยังอยู่) — ยกเว้น 3 แถวที่ประกาศไว้ (M10 · M11 · M12) ซึ่งใช้ co-assertion เฉพาะทางตาม spec
- [ ] **เหยื่อทุกตัวเป็น single-blocking-layer** — มีคอมเมนต์ต่อแถวระบุว่า guard อื่นผ่านได้อย่างไร (root · hash · C8 · cap) และ **คุ้ม assertion ตัวไหนของ `upgrade-path-test`**
- [ ] **payload ของทุกแถว = copy `src/` ทั้งก้อน** — ไม่มีแถวไหนใช้ mini-payload (KB #32)
- [ ] `cliPath` ปรากฏเฉพาะใน `readFileSync` · หลังรัน suite `git status --porcelain src/bin/cli.mjs` **ว่าง** (mutation ไม่รั่วออกจาก temp)
- [ ] `npm test 2>&1 | node src/scripts/check-test-count.mjs` เขียว (`pass === tests`, `fail === 0`) — วัดจาก **bare `npm test`** ไม่ใช่ `node --test <file>`
- [ ] acceptance falsifiable A1–A10 ใน `spec.md §7` ถูกไล่ครบ (โดยเฉพาะ A3–A6 ที่พิสูจน์ว่า M0/`assert.notEqual` ทำงานจริง — **ทดลองแล้วคืนค่าเดิมทุกครั้ง**)
- [ ] รายงานปิด task ระบุ **จำนวนเคสจริง (N)** + **ตาราง anchor ที่ใช้จริง** (id → `find` → บรรทัดใน `cli.mjs`) เพื่อส่งต่อ `tasks/release-hygiene/`
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Contract canonical: `../../design.md §4` (C4 C5 C7 C8 C9 C10 C11 C13 C15) · dependency/เหตุผล wave 2 `§7` · test strategy `§8`

## 7. ★ เมื่อ anchor ที่คาดไว้ไม่มีในโค้ดจริง — **รายงาน ห้ามประดิษฐ์**

คอลัมน์ `find` ใน `spec.md §5.1` เป็น **ค่าคาดหมายจากตอน DESIGN** ไม่ใช่คำสั่ง · โค้ดจริงของ `prune` เป็นของ `tasks/prune/` ซึ่งเลือกรูปแบบเองได้

**ถ้าแถวใดหา anchor ที่ (ก) เป็นสตริงจริง (ข) เสถียร (ค) พบพอดี 1 ครั้ง (ง) neutralize guard นั้นได้ตรง ๆ — ไม่ได้:**

1. **หยุดที่แถวนั้น** — ห้ามแต่ง `find` ที่ผูกกับ whitespace/รูปแบบโค้ดชั่วคราว · ห้ามเปลี่ยนเหยื่อให้ guard อื่นบล็อกแทน · ห้าม `t.skip` · ห้ามถอดแถวออกจาก `MUTATIONS` (M0 จะแดง — และนั่นคือเจตนา)
2. **รายงานกลับ** พร้อม: id ของแถว · locator ที่ค้นหา · สิ่งที่พบจริงในโค้ด (คัดบรรทัดมาแสดง) · สาเหตุที่ใช้ไม่ได้ (ไม่พบ / พบหลายครั้ง / ปิดแล้ว guard อื่นยังบล็อก)
3. **ห้ามแก้ `src/bin/cli.mjs`** เพื่อสร้าง anchor ให้ตัวเอง (`docs/rule.md §1` ห้ามเดา + config-protection · `build.md` ห้ามแตะไฟล์นอกขอบเขต)
4. ถ้าพบว่า guard นั้น **ไม่มีเหยื่อแบบ single-layer จริง** ⇒ เสนอย้ายไป **unit ของ `tasks/prune/`** (`spec.md §8`) ในรายงาน — การย้ายจริงเป็นการตัดสินใจของ main loop ไม่ใช่ของ task นี้
