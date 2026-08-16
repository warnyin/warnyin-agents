# Rule — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow

### จาก `docs/rule.md §1` (project)
- [ ] **release-hygiene เป็น wave สุดท้ายเสมอของ topic multi-slice** — gate ที่ต้องเห็นไฟล์/pointer ครบข้าม slice (`lint:md`, negative-grep, pass-count) ต้องรัน **หลัง integrate ครบ** เท่านั้น; อย่าเริ่ม task นี้ก่อน `prune` + `upgrade-path-test` เข้า branch
- [ ] **wave สุดท้ายแก้ได้เฉพาะ "จุดเชื่อม"** (pointer / ชื่อไฟล์ / wording ตาม contract / ตัวเลข gate) — เจอ **นโยบาย** ที่ขัดกัน → **รายงานขึ้น VERIFY ไม่แก้เอง**
- [ ] **CHANGELOG header ownership ระหว่าง multi-slice SHIP** — slice สุดท้ายเติม **วันที่** + `### Migration`
  - **★ ข้อยกเว้นของ topic นี้ (ประกาศไว้ล่วงหน้า):** slice 1 (`prune`) และ slice 2 (`upgrade-path-test`) **ถูกห้ามแตะ `CHANGELOG.md`** ⇒ **task นี้เป็นผู้เขียน entries ของ `[0.30.1]` ทั้งก้อน** รวมของ slice อื่น (ไม่งั้น feature หลักของ release จะไม่มี entry เลย = ขัด `docs/rule.md §2` "CHANGELOG ทุก user-facing change") · ที่ยังห้ามคือ **แก้/ย้าย/ลบ entries ของ release เก่า** (`[0.30.0]` ลงไป)
- [ ] **runbook section ใน infra docs** (ไม่ทิ้ง gate orphan) — พฤติกรรมใหม่ที่ผู้ใช้อาจเจอ "ผลลบ" ต้องมี section ใน `docs/infra.md` ที่มี **category + อาการ + วิธีแก้** และอ้าง **prefix ของ reason code** เป็น identifier
- [ ] **declared-threshold ต้อง enforce ได้จริง + version bump ต้องบันทึกเหตุผล minor/patch ลง build report** — `0.30.0 → 0.30.1` = **patch** เพราะเป็น **bugfix ของ upgrade path** (ไม่มี API/flag ที่ทำให้ผู้ใช้เดิมพัง; flag ใหม่เป็น opt-out ที่ backward compatible) — เขียนเหตุผลนี้ลง build report ไม่ใช่แค่แก้ตัวเลข
- [ ] **canonical-copy convention** — canonical wording นิยามที่ `design.md §6` ที่เดียว แล้ว **copy คำต่อคำ** ทุกไฟล์; **string ที่ถูก assert คำต่อคำชนะ pattern ประจำไฟล์** — ห้าม paraphrase ให้ "เข้ากับสไตล์ไฟล์" (ข้อยกเว้นเดียวคือการตัด backtick ใน `--help` ซึ่ง **ประกาศไว้แล้วใน `spec.md §4.3`**)
- [ ] **config-protection** — ห้ามแก้ config/threshold (`MIN_PASS`, `DENY_PREFIX`, cap ของ validator) หรือ disable rule **เพื่อให้ gate ผ่าน**; แก้ได้เมื่อ config ผิดจริงและมีเหตุผล+note (การ **bump** `MIN_PASS` ขึ้นตามยอดจริงคือการทำตามกฎ — การ **ลด** เพื่อให้เขียวคือการละเมิด)
- [ ] **assertion ที่ "ไม่มี slice เดียวทำให้เขียวได้" เป็นของ wave สุดท้าย + ต้องพิสูจน์ก่อนแก้ expected** — เทส `--help wording regression` เปลี่ยน expected ได้ **หลัง** negative-grep ยืนยันว่า wording จริงเปลี่ยนตาม contract แล้วเท่านั้น (ไม่ใช่แก้เพราะเทสแดง)
- [ ] **investigate-before-edit** — ก่อนแก้ทุกไฟล์: อ่านว่าใครอ่าน/assert ไฟล์นั้นอยู่ (โดยเฉพาะ `cli.mjs --help` ที่มีเทส string-equality)

### จาก `docs/rule.md §2` (engineering)
- [ ] **zero-dependency** (`devDependencies` ว่างเสมอ) · **ESM** · **ข้อความ/คอมเมนต์ภาษาไทย**
- [ ] **CHANGELOG ทุก user-facing change** — destructive behavior ใหม่ต้องอธิบายให้ผู้ใช้ npm migrate เองได้โดยไม่ต้องเดา

### จาก `docs/techstack/installer/rule.md` (component — อ่านอย่างเดียว ห้ามแก้)
- [ ] **`MIN_PASS` ต้อง bump พร้อม topic ที่เพิ่มเคส + คอมเมนต์ระบุที่มาของตัวเลข** (`N` ที่วัดได้ + วันที่ + topic)
- [ ] **error string ของ gate script ต้องมี category prefix** — runbook อ้าง prefix (`path:` / `scope:` / `hash:` / `prune:`) เป็น identifier

### ขอบเขต/ข้อห้ามเฉพาะ task
- [ ] **ห้ามแตะ logic ใน `src/bin/cli.mjs`** — แก้ได้เฉพาะ **ข้อความในบล็อก `--help`** เท่านั้น (ข้อยกเว้นเดียวที่ task นี้แตะไฟล์นี้ได้)
- [ ] **ห้ามแก้ `src/tests/installer-prune.test.mjs` และ `src/tests/installer-upgrade.test.mjs`** — แดงเพราะ contract ไม่ตรง → **รายงาน ไม่แก้เทส**
- [ ] **ห้ามแก้ `src/scripts/verify-pack.mjs`** — `DENY_PREFIX '.warnyin/'` ครอบ manifest แล้ว (ตรวจรันจริงยืนยันแล้ว) เพิ่มเฉพาะ **unit เคสคู่ขนาน**
- [ ] **ห้ามแก้ `docs/techstack/installer/*`** — `build.md §3 ข้อ 6` ห้าม BUILD แตะ rule/standard กลาง ⇒ note ไว้ที่ §2 รอ SHIP

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/techstack/.../rule.md` หรือ `docs/rule.md` ตอนนี้ — note ไว้ก่อน ถึง SHIP ค่อยพิจารณาย้ายขึ้นไป

- [ ] **เพิ่ม `node:crypto` ในรายการ built-in ที่อนุญาต** (`docs/techstack/installer/rule.md` — zero-dependency) — เหตุผล: slice 1 ใช้ `node:crypto` คำนวณ sha256 ของ manifest; ยัง zero-dep (built-in) แต่รายการปัจจุบันไม่ได้ enumerate ไว้ ⇒ ต้องเพิ่มเพื่อไม่ให้ audit ครั้งหน้าเข้าใจผิดว่าเป็น dep ใหม่ (`design.md §2` note)
- [ ] **rule: destructive operation ในเครื่องผู้ใช้ต้องมาคู่ 4 อย่างเสมอ** — (1) วิธีดูก่อน (`--dry-run`) (2) วิธีปิด (flag + env) (3) runbook กู้คืนใน `docs/infra.md` (4) `### Migration` ใน CHANGELOG — เหตุผล: `--update` เดิมเป็น copy-only จึงไม่มี pattern นี้; topic นี้เป็นเคสแรกของ repo ที่ลบไฟล์ในเครื่องผู้ใช้
- [ ] **rule: gate/phase ที่ `exit 0 เสมอ` ต้องประกาศ "อ่าน stdout ไม่ใช่ exit code" ทั้งในเอกสารและ runbook** — เหตุผล: prune fail-toward-under-delete (C12/C9) ⇒ automation ที่ดูแต่ exit code จะเข้าใจผิดว่าสำเร็จ; ต่อยอดจาก `installer/rule.md §2` **report-script ≠ gate-script** ที่ครอบเฉพาะ script รายงาน ยังไม่ครอบ **เฟสภายใน gate-script**
- [ ] **rule: ตาราง reason code ใน runbook ต้อง ⊇ เซตปิดของ reason ในโค้ด + มีเทส/grep พิสูจน์** — เหตุผล: เซตปิด C15 มี 13 ค่า ถ้าโค้ดเพิ่ม reason ใหม่แล้วลืมเติม runbook ผู้ใช้จะเจอ reason ที่ไม่มีคำอธิบาย (คู่กับ "ไม่ทิ้ง gate orphan")
