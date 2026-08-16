# Task — prune

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ — self-contained

| | |
|---|---|
| **Task** | `prune` |
| **Slice อ้างอิง** | `design.md` slice **#1** — "prune ทำงานจริงและปลอดภัย" |
| **Component** | `installer` (`src/bin/cli.mjs` + `src/tests/`) |
| **Model tier** | `deepest` — security-sensitive + destructive filesystem op + guard 6 ชั้นที่ต้องอิสระจากกัน |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
ทำให้ installer **ลบไฟล์ payload ที่ตัวเองเคยวางแต่หายไปจาก payload รุ่นใหม่** ตอน `--update` ได้จริง **end-to-end** — manifest I/O + pure fn + guard 6 ชั้น + flag + รายงาน + wiring ใน `main()` — โดย **ไม่แตะไฟล์ของผู้ใช้** และทุกจุดที่ไม่แน่ใจ = **ไม่ลบ**

## 2. Dependency
- **ต้องทำหลัง:** ไม่มี — **wave 1 ขนานกับ `upgrade-path-test`**
- **ปลดล็อกให้:** `tasks/release-hygiene` (wave 2) และทำให้เทสของ `tasks/upgrade-path-test` เขียวได้ (แต่ **เจ้าของการทำให้เขียว = full-gate ของ BUILD** ไม่ใช่ task นี้)
- **ส่งต่อ:**
  - รายการ **13 reason + ความหมาย + วิธีแก้** → `release-hygiene` เขียน runbook `docs/infra.md`
  - พฤติกรรมใหม่ (flag `--no-prune` / `WARNYIN_NO_PRUNE` / `--prune-force`, manifest ใหม่, บรรทัดสรุปเปลี่ยนรูป) → `release-hygiene` เขียน `CHANGELOG.md` + bump `0.30.1`
  - path `.warnyin/.warnyin-manifest` → `release-hygiene` เพิ่ม unit เคสคู่ขนานใน `verify-pack.test.mjs`
  - **★ needle wording ใน `src/bin/cli.mjs` เป็น variant "ตัดbacktick"** (บล็อก `--help` คือ template literal ⇒ backtick ดิบ = SyntaxError — `spec.md §3.1 N1`) ในขณะที่อีก 3 จุดของ `release-hygiene` (`README.md` · `src/.warnyin/workflow/README.md` · `src/.warnyin/installer/templates/CLAUDE.md`) ใช้ canonical **ที่มี backtick** ⇒ **positive-grep ของ slice 3 ต้องใช้ 2 pattern (มี/ไม่มี backtick) หรือ normalize (strip `` ` ``) ก่อนเทียบ** — ถ้าใช้ pattern เดียวที่มี backtick จะนับ `cli.mjs` ไม่เจอ แล้วสรุปผิดว่า wording ยังไม่ถูกอัปเดต
- **ห้ามอ่าน/แก้ไฟล์ของ task อื่น** — contract ที่ต้องใช้ถูก copy มาไว้ครบใน `spec.md §3` แล้ว

## 3. Sub-tasks (เรียงตาม dependency — แต่ละข้อส่งอะไรต่อ)

- [ ] **1. อ่านให้ครบก่อนแตะ** — `src/bin/cli.mjs` **ทั้งไฟล์** (โดยเฉพาะ `CORE:87-93` · `copyTree:132-161` · `writeVersionStamp:237-248` · `main():398-487` · flag `:21-23` · `--help:41-53`) + `src/tests/installer.test.mjs` (harness + pattern symlink `:596-607` + เคส 8 `:186-198` ที่ assert `listFiles(tmp)===[]` ที่ `:196`) · _ผลลัพธ์:_ เข้าใจ contract เดิมของทุกจุดที่จะแก้ (rule `investigate-before-edit`)
- [ ] **2. เขียน constant + helper pure ชั้นล่าง** — `toPosix` (helper **เดียว**) · `CORE_POSIX` (derive จาก `CORE`) · `GLOBAL_PRUNABLE_POSIX` · `AGENT_ALLOW_RE`/`SKILL_ALLOW` (C5) · `PRUNE_BLAST_CAP = 50` · `KNOWN_STALE` (C14) · `PRUNE_REASON` เซตปิด 13 ค่า (C15) · `semverLt` (**เขียนเอง ห้าม import จาก `src/scripts/`** — ดู `spec.md §7 T8`) · `sanitizePath` · `hashOf(buf, name)` · `overCap` · `readStamp(target)` (อ่าน `.warnyin/.warnyin-version` → string หรือ `null`, ไม่ throw) · `KNOWN_FLAGS` (8 ค่าตาม `spec.md §2 M2`) · _ขึ้นกับ 1 · ส่งต่อ:_ vocabulary ให้ทุก sub-task ถัดไป
- [ ] **3. `parseManifest` + `readManifest`** (C1) — pure ก่อน แล้วห่อด้วย fs shell ที่มี `statSync` guard 1 MB · _ขึ้นกับ 2 · ส่งต่อ:_ `manifestOld`
- [ ] **4. `computeStale`** (C2 C3 C4 C5 C6 C11 C14) — pure ล้วน รับ `statOnDisk` + `sep` เป็น input · _ขึ้นกับ 2,3 · ส่งต่อ:_ `{stale, rejected}`
- [ ] **5. แก้ `copyTree` → `onFile`** (`spec.md §7 T1`) — **ย้าย `readFileSync` + `normalizeEol` ขึ้นเหนือ branch `exists && !overwrite`** แล้วเรียก `onFile(relPosix, sha256, owned)` ทั้งเคสเขียนจริง เคส byte-equal skip และเคส first-install ที่ผู้ใช้ชื่อชนแต่ byte-equal · **★★ forward `onFile` ที่บรรทัด recursion `cli.mjs:138` ด้วย** (`copyTree(rel, { overwrite, onFile })`) ไม่งั้น manifest ได้แค่ 33 จาก 91 ไฟล์ = ไฟล์ที่ลึกกว่าชั้นเดียวลบไม่ได้ตลอดกาล (`spec.md §7 T10`) · _ขึ้นกับ 2 · ส่งต่อ:_ `payloadNew`
- [ ] **6. `mergeManifest` + `writeManifest`** (C13) — union + คง hash เดิม · DRY-aware ตาม pattern `writeVersionStamp` · header ใช้ `readPkgVersion()` · เขียน **หลัง copy ก่อน prune** · _ขึ้นกับ 4,5_
- [ ] **7. `prune()`** (C7 C8 C9 C10 C12 C15) — ลำดับบังคับ `C9¹ → C7 → C8 → C9² → unlink → C15 → C10` · `lstat` ก้อนเดียวใช้ทั้ง size gate และ regular-file check · `realpathSync` ตัวเดียวกันสองฝั่ง · empty-dir candidate = `dirname` ของไฟล์ที่ **ลบใน run นี้** เท่านั้น (**ไม่ต้อง snapshot** — C10 ฉบับล่าสุด) และไต่ ancestor ด้วย **realpath ชุดเดียวกับ C8** · **`DRY` → ห้ามเรียก `unlink`/`rmdir` เลย** (C15) · _ขึ้นกับ 4,6_
- [ ] **8. flag + wiring ใน `main()`** (M2 M3 M7 M8) — `--no-prune` · `WARNYIN_NO_PRUNE=1` · `--prune-force` (**อยู่ใน `KNOWN_FLAGS` แต่ห้ามขึ้น `--help`** — runbook อย่างเดียว) · unknown-flag warn (`KNOWN_FLAGS` 8 ค่า) · **★★ `const stampBefore = readStamp(target)` ต้องอยู่ก่อน `copyTree` loop และก่อน `writeVersionStamp()` ในทั้งสองสาขา** แล้วส่งค่าที่อ่านไว้ต่อ (ไม่ใช่ไปอ่านใหม่ทีหลัง — `spec.md §7 T11`) · **wiring ที่เหลือแทรกจุดเดียวเป็น helper `runPrunePhase(...)` หลังปิด `if/else` ของ mode** ห้าม duplicate 2 สาขา · `prunableRoots` ต่างกันตาม mode · **C16: `--global` ห้ามใส่ entry ใต้ `.claude/agents|skills` ลง manifest** · บรรทัดสรุปเพิ่มช่อง `ลบ N` (พิมพ์เสมอ) · `--help` ใช้ wording canonical N1 · _ขึ้นกับ 2-7_
- [ ] **9. เขียน `src/tests/installer-prune.test.mjs`** — **U1–U34 + F1–F19 = 53 เคส** ตาม `spec.md §5` (copy harness จาก `installer.test.mjs` ห้าม import) · **เขียนเป็น 3 batch แล้วรันเทสปิดท้ายทุก batch** — B1: U1–U34 (unit ล้วน, ไม่ spawn) · B2: F1–F9 (guard/scope/cap) · B3: F10–F19 (dry-run · manifest shape · idempotent · **F18 stamp order** · **F19 global/C16**) · **ถ้า context เหลือน้อย: spawn sub-agent มาเขียนไฟล์เทสได้** (ส่ง `spec.md §5` + `standard.md §1.2` ให้ครบ) · _ขึ้นกับ 8_
- [ ] **10. self-verify scope ตัวเอง** — `node --test` เต็ม แล้วยืนยันว่า **`installer.test.mjs` 40 เคสเดิมยังเขียวโดยไม่แก้ไฟล์นั้น** (baseline ที่วัดจริง: ทั้ง repo = **248 pass / 0 fail**) + `npm run verify:pack` + mutation check ของ acceptance A3/A4/A5/**A12/A13** (แก้ชั่วคราว → เทสต้องแดง → revert) · _ขึ้นกับ 9_

### 3.1 ลำดับ commit + การจัดการ context (บังคับ — task นี้ใหญ่พอที่จะหมด context กลางทาง)

- **commit 2 ก้อน ห้ามรวบก้อนเดียว:**
  1. **ก้อนที่ 1 = `src/bin/cli.mjs` อย่างเดียว** (sub-task 2–8) → รัน `node --test src/tests/installer.test.mjs` แล้ว **ยืนยันว่า 40 เคสเดิมยังเขียว (`pass 40` / `fail 0`)** ก่อน commit — จุดนี้พิสูจน์ว่า `copyTree`/`main()`/`--help` ที่แก้ไป **ไม่ทำ regression** โดยยังไม่มีเทสใหม่มากลบเกลื่อน
  2. **ก้อนที่ 2 = `src/tests/installer-prune.test.mjs`** (sub-task 9–10) → รัน `node --test` เต็ม
  - แยกแบบนี้ทำให้ทั้ง reviewer และตัวเองแยกได้ว่า "เทสใหม่แดง" ต่างจาก "ของเดิมพัง" · ถ้าต้องย้อน ก็ย้อนได้ทีละก้อน
- **เขียนไฟล์เทสเป็น 3 batch** ตาม sub-task 9 — ปิดท้ายทุก batch ด้วยการรันเทสไฟล์นั้นไฟล์เดียว (`node --test src/tests/installer-prune.test.mjs`) ไม่ต้องรอครบ 53 เคสแล้วค่อยรันทีเดียว
- **จำนวนเคสเป็น floor ห้ามลด** — ถ้า context เหลือน้อยจนเขียนไม่ครบ ให้ **หยุดแล้วรายงานใน build report ว่าค้างที่ batch ไหน เคสไหนยังไม่เขียน** · **ห้ามลดจำนวนเคส · ห้ามยุบหลายเคสเป็นเคสเดียว · ห้าม `t.skip` · ห้ามผ่อน assert ให้หลวมลงเพื่อให้เขียนเร็วขึ้น** (`rule.md §1.2 config-protection`)
- **spawn sub-agent ได้เฉพาะงานเขียนไฟล์เทส** (sub-task 9) — ส่ง `spec.md §5` (ตารางเคสเต็ม) + `standard.md §1.2` (harness) + `rule.md §1.5` ไปให้ครบในคำสั่ง และย้ำขอบเขตไฟล์ว่าแตะได้เฉพาะ `src/tests/installer-prune.test.mjs` · **ห้าม spawn ให้ไปแก้ `cli.mjs`** (เจ้าของแต่ผู้เดียว = task นี้ และ sub-task 2–8 พึ่งบริบทเดียวกันทั้งชุด)

## 4. ขอบเขตไฟล์

### 4.1 ตารางไฟล์
| ไฟล์ | สิทธิ์ | หมายเหตุ |
|---|---|---|
| `src/bin/cli.mjs` | ✅ **เจ้าของแต่ผู้เดียว** (แก้) | รวม `--help` wording (N1) และบรรทัดสรุป (N2) |
| `src/tests/installer-prune.test.mjs` | ✅ **เจ้าของแต่ผู้เดียว** (สร้างใหม่) | U1–U34 + F1–F19 = **53 เคส** |
| `src/tests/installer-upgrade.test.mjs` | ⛔ ห้ามแตะ | slice 2 (`upgrade-path-test`) — จะแดงตลอด wave 1 โดยเจตนา |
| `src/tests/installer.test.mjs` | ⛔ ห้ามแตะ | **40 เคสเดิม** (วัดจริงที่ `0.30.0`) ต้องเขียวเอง; assert `--help` เป็นของ `release-hygiene` |
| `CHANGELOG.md` · `package.json` · `README.md` | ⛔ ห้ามแตะ | `release-hygiene` (wave 2) |
| `src/.warnyin/**` | ⛔ ห้ามแตะ | payload — wording 3 จุดเป็นของ `release-hygiene` |
| `docs/techstack/**` | ⛔ ห้ามแตะ | rule/standard กลาง (`build.md §3 ข้อ 6`) → note รอ SHIP ใน `rule.md §2` เท่านั้น |
| `src/scripts/**` | ⛔ ห้ามแตะ **และห้าม import** | ไม่อยู่ใน `package.json files` ⇒ ไม่ถูก publish (`spec.md §7 T8`) |
| `docs/stages/installer-stale-cleanup/**` | ⛔ ห้ามแตะ | topic docs — main loop อัปเดตตอน integrate |

### 4.2 กติกาโค้ด (ย่อจาก `rule.md`)
zero-dep (`node:*` เท่านั้น; `node:crypto` เป็นตัวใหม่ → note รอ SHIP) · ESM · ข้อความผู้ใช้ **ภาษาไทย** · **pure fn + injectable IO** · **ห้ามลด/ปิดเช็คเพื่อให้ผ่าน** · **ห้าม `t.skip`** · **ไม่ echo เนื้อไฟล์/absolute path**

## 5. Acceptance criteria
- [ ] A1 `node --test` เขียวทั้ง repo **ยกเว้น** `installer-upgrade.test.mjs` (slice 2) · `installer.test.mjs` **40 เคสเดิม** เขียวโดยไม่แก้ไฟล์นั้น · _baseline วัดจริงก่อนเริ่ม task: ทั้ง repo ปัจจุบัน = **248 pass / 0 fail**_
- [ ] A2 U1–U34 + F1–F19 ผ่านครบ — `installer-prune.test.mjs` = **53 เคสพอดี** (= 50 เดิม + U34 · F18 · F19) — `pass === tests`, ไม่มี skip, **ห้ามลดจำนวนเคส**
- [ ] A3 ย้อน `copyTree` กลับเป็น early-return ก่อนอ่าน content → **F13 แดง** (กับดัก T1 มีเทสคุ้ม)
- [ ] A4 ให้ hash ฝั่งใดฝั่งหนึ่งใช้ buffer ก่อน `normalizeEol` → **F3 หรือ F8 แดง** (กับดัก T2 มีเทสคุ้ม)
- [ ] A5 `PRUNE_BLAST_CAP` เป็น 51 → **F7 แดง**; เป็น 49 → **F8 แดง** (boundary ตาม `docs/rule.md §1 declared-threshold`)
- [ ] A6 `cli.mjs` ไม่มี `require`, ไม่มี import จาก `src/scripts/`, มี `node:crypto` 1 บรรทัด
- [ ] A7 `npm run verify:pack` เขียว
- [ ] A8 U33 พิสูจน์ reason set = **13 ค่าพอดี** (ไม่ขาดไม่เกิน) — สกัดจาก **declaration ของ const เซตปิด** (ท่อน ก) + literal hardcode ในส่วนรายงาน = **0** (ท่อน ข)
- [ ] A9 `  − ` ใช้ **U+2212** (assert ด้วย `'−'`) · ข้อความใหม่ทุกบรรทัดเป็นภาษาไทย
- [ ] A10 guard 6 ชั้นแยกกันจริง — แต่ละชั้นมีอย่างน้อย 1 เคสที่ **ชั้นนั้นชั้นเดียวเป็นเหตุให้ไม่ลบ** (C4→U9-U16 · C5→U17-U21 · C7→F3 · C8→F1/F2 · C9→F7/F8 · C11→F6/F9)
- [ ] A12 **ย้าย `readStamp` ไปเรียกหลัง `writeVersionStamp()`** → **F18 แดง** (กับดัก T11 มีเทสคุ้ม — known-stale ตายเงียบคือความเสี่ยงอันดับ 1 ของ task นี้)
- [ ] A13 **ถอด `onFile` ออกจากบรรทัด recursion `copyTree` (`cli.mjs:138`)** → **F11 แดง** (manifest ได้ 33 แทน 91 — กับดัก T10)
- [ ] A11 ผ่าน test ตาม `spec.md §5` · ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` (ตารางจุดแก้ · C1–C16 คำต่อคำ · needle N1–N10 · test-flow 53 เคส · กับดัก T1–T11)
- Standard: `./standard.md`
- Rule: `./rule.md`

## 7. Gate ที่ **รันไม่ได้/ยังไม่เขียว** ในรอบนี้ (ประกาศไว้ — ห้ามพยายามแก้ contract เพื่อให้ผ่าน)
| gate / เทส | สถานะรอบนี้ | เจ้าของ |
|---|---|---|
| `src/tests/installer-upgrade.test.mjs` (black-box + mutant harness) | **แดงตลอด wave 1 เป็นเรื่องปกติ** — เขียนจาก contract โดยไม่อ่านโค้ด slice 1 | ทำให้เขียว = **full-gate ของ BUILD** (`build.md §4 step 6`, main loop) · ห้าม task นี้แก้ไฟล์นั้น |
| `MIN_PASS` ใน `src/scripts/check-test-count.mjs` | ยังไม่ bump (เป็น floor จึงไม่แดง แต่ยังไม่สะท้อนเคสใหม่) | `release-hygiene` (wave 2) |
| negative-grep wording เก่า 3 ไฟล์ (`README.md` · `src/.warnyin/workflow/README.md` · `src/.warnyin/installer/templates/CLAUDE.md`) + assert `--help` ใน `installer.test.mjs` | ยังไม่ทำ — task นี้แก้เฉพาะ `--help` ใน `cli.mjs` | `release-hygiene` (wave 2) |
| unit เคสคู่ขนาน `checkFiles(['.warnyin/.warnyin-manifest'])` ใน `verify-pack.test.mjs` | ยังไม่มี | `release-hygiene` (wave 2) |
| `CHANGELOG.md` entry + bump `0.30.1` + runbook `docs/infra.md` | ยังไม่ทำ | `release-hygiene` (wave 2) |
| `npm run lint:md` ที่พึ่ง pointer ข้าม slice | ไม่ใช่ของ wave นี้ | `release-hygiene` (wave 2) |

> **เจอนโยบายที่ขัดกันระหว่างทาง → รายงานขึ้น build report ไม่แก้เอง** (`docs/rule.md §1` — wave ที่ decouple ด้วย contract ห้ามแก้ contract เพื่อให้ gate ผ่าน)
