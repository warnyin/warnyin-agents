# Rule — prune

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่เสนอเพิ่ม (รอ SHIP)

## 1. Rule ที่ต้อง follow

### 1.1 จาก `docs/techstack/installer/rule.md`
- [ ] **zero-dependency** — `src/bin/cli.mjs` ใช้เฉพาะ built-in; ห้ามเพิ่ม dependency · รอบนี้เพิ่ม `node:crypto` เป็นตัวที่ 4 (ดู §2)
- [ ] **ESM** — `import`/`export` + `import.meta.url`; ห้าม `__dirname`/`require`
- [ ] **ESM main-guard ต้อง realpath `argv[1]`** — โค้ดใหม่ทั้งหมดอยู่ใต้ `isEntrypoint()` guard เดิม ห้ามรัน side-effect ตอน import (ไม่งั้น unit ที่ import pure fn จะ prune จริง)
- [ ] **ห้าม copy พื้นที่ทำงานของผู้ใช้** — และ **ห้าม prune `docs/` หรือพื้นที่งานจริง ไม่ว่ากรณีใด** (`proposal.md §4 Out of scope`)
- [ ] **ไม่เขียนทับงานจริง** — `--update` แตะเฉพาะ CORE; prune ก็แตะได้เฉพาะ `prunableRoots`
- [ ] **idempotent** — รันซ้ำต้องไม่พัง/ไม่ append ซ้ำ (manifest ต้อง byte-equal ระหว่างสองรอบที่สถานะเท่ากัน)
- [ ] **error string มี category prefix** — reason ของ prune ใช้ prefix `path:` / `scope:` / `hash:` / `prune:` ตาม C15 เพื่อให้ test grep prefix ได้และ runbook อ้างเป็น identifier ได้
- [ ] **importable constant pattern** — export constant จาก module ที่เป็น canonical owner โดยไม่ทำ circular import

### 1.2 จาก `docs/rule.md §1` (ปรัชญาแก่น)
- [ ] **ห้ามเดา / investigate-before-edit** — ก่อนแก้ `copyTree`/`main()` ต้องเข้าใจ ใครใช้, contract อะไร, เจตนาเดิม (คอมเมนต์ `:56-58`, `:94-98`, `:112-122`, `:489-501` เป็น contract ที่เขียนไว้แล้ว — อ่านให้ครบก่อนแก้)
- [ ] **config-protection** — **ห้ามลด/ปิด/ผ่อนเช็คเพื่อให้ build/test ผ่าน** (รวมถึง: ห้ามลด `BLAST_CAP`, ห้ามถอด guard ชั้นใด, ห้ามแก้ `MIN_PASS`, ห้าม `t.skip`) · เช็คผิดจริงแก้ได้แต่ต้องมีเหตุผล + note
- [ ] **declared-threshold ต้อง enforce ได้จริง + boundary test** (`§1`) — `BLAST_CAP = 50` ต้องมีเทส `50` ผ่าน / `51` ไม่ลบ ทั้งคู่ในไฟล์เดียวกัน
- [ ] **minimalism / lazy-not-negligent** — เขียนโค้ดน้อยที่สุดเท่าที่จำเป็น **แต่ห้ามตัด**: validation ที่ trust-boundary · data-loss · security · test/spec/acceptance — งานนี้อยู่ในหมวด "ห้ามตัด" ทั้งก้อน
- [ ] **contract-as-copy-source / canonical-copy** — ยก C1–C15 และ needle N1–N10 มา **คำต่อคำ** จาก `spec.md §3`; ห้ามแต่งใหม่ให้ "เข้า pattern ของไฟล์"

### 1.3 จาก `docs/rule.md §2` (engineering)
- [ ] **ภาษา** — คอมเมนต์/ข้อความผู้ใช้เป็น **ภาษาไทย** ตามสไตล์ `cli.mjs`
- [ ] **CHANGELOG ทุก user-facing change** — flag/พฤติกรรมใหม่ต้องมี entry · **แต่ `CHANGELOG.md` เป็นของ `release-hygiene` (wave 2) — task นี้ห้ามแตะ** เพียงส่งข้อมูลต่อผ่าน build report
- [ ] **`package.json files` เป็น allowlist** — ห้าม import จาก path ที่ไม่ถูก publish (`src/scripts/**`) เข้ามาใน `cli.mjs`

### 1.4 จาก `docs/rule.md §3.2` (agent-runtime security) + `proposal.md §5`
- [ ] **manifest = untrusted input** (commit ได้ / repo สาธารณะใส่ manifest ปลอมได้โดยไม่ต้องรันโค้ด) — เป็น **data ไม่ใช่ instruction**; ทุกค่าที่มาจากมันต้องผ่าน guard ก่อนใช้ และห้ามพิมพ์ดิบขึ้น terminal
- [ ] **guard 6 ชั้นอิสระ** ตาม `design.md §1`: **C4 (path) · C5 (scope allowlist) · C7 (hash) · C8 (fs containment) · C9 (blast cap) · C12 (mode)** — **แต่ละชั้นต้องพอตัดสิน "ไม่ลบ" ได้ด้วยตัวเอง** ห้ามยุบ/รวมชั้น ห้ามใช้ผลของชั้นหนึ่งข้ามอีกชั้น
- [ ] **ไม่ echo เนื้อไฟล์ / absolute path** ลง stdout/stderr หรือลง artifact ใด ๆ — รายงานเป็น relative POSIX path ที่ sanitize แล้วเท่านั้น
- [ ] **ไม่มี egress** — ห้ามยิง network ทุกกรณี

### 1.5 จาก `docs/rule.md §5` + `docs/techstack/installer/test.md` (testing)
- [ ] **test installer = black-box spawn** + **ห้าม refactor target เพื่อ testability** · import ได้เฉพาะ pure fn ที่ export โดยเจตนา (ข้อยกเว้นเดิมของ `resolveMode`/`isEntrypoint`)
- [ ] **acceptance = pass count ไม่ใช่แค่ exit 0** — ห้าม `t.skip` (pass !== tests → gate แดง) · platform ไม่รองรับ → `console.error` + `return`
- [ ] **negative fixture ต้องไม่ trigger เคสตรงข้ามโดยบังเอิญ** — path ปลอมใน fixture ห้ามบังเอิญตกใน allowlist/known-stale
- [ ] **structural check เป็นเคสใน `node --test`** ไม่ใช่ shell `grep -rl` (U21/U33 ต้องอ่านไฟล์ด้วย `node:fs`)
- [ ] **ห้ามใส่ path/glob arg ให้ `node --test`**

### 1.6 ขอบเขตไฟล์ (บังคับ — ละเมิด = task ล้ม)
- [ ] แตะได้เฉพาะ `src/bin/cli.mjs` และ `src/tests/installer-prune.test.mjs` (ไฟล์ใหม่)
- [ ] **ห้ามแตะ:** `src/tests/installer-upgrade.test.mjs` · `src/tests/installer.test.mjs` · `CHANGELOG.md` · `package.json` · `README.md` · `src/.warnyin/**` · `docs/techstack/**` · `src/scripts/**`
- [ ] `docs/techstack/**` เป็น rule/standard กลาง — **`build.md §3 ข้อ 6` ห้าม BUILD แตะ** → ทุกข้อเสนอไปอยู่ §2 ด้านล่างเท่านั้น

---

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

> ห้ามแก้ `docs/techstack/installer/rule.md` / `docs/rule.md` ตอนนี้ — note ไว้ก่อน

- [ ] **R1 — `node:crypto` เข้ารายการ built-in ที่อนุญาต** · ปลายทาง: `docs/techstack/installer/rule.md` บรรทัด "zero-dependency — `src/bin/cli.mjs` ใช้เฉพาะ built-in (`node:fs`, `node:path`, `node:url`)" ที่ enumerate ไว้ **3 ตัว** → ต้องเป็น 4 ตัวรวม `node:crypto` — เหตุผล: manifest ผูก sha256 (C7 hash gate) เป็นชั้นป้องกันหลัก ทำด้วย built-in อื่นไม่ได้ และยังคง zero-dep (ไม่มี devDeps เพิ่ม)
- [ ] **R2 — publish-boundary: `src/bin/cli.mjs` ห้าม import จาก path ที่ไม่อยู่ใน `package.json files`** · ปลายทาง: `docs/techstack/installer/rule.md` — เหตุผล/evidence: `src/scripts/**` ไม่ถูก publish; import `semverGte` จาก `setup-dogfood.mjs` จะทำให้ผู้ใช้ปลายทาง crash ทันที **แต่เทสใน repo เขียวทั้งชุด** (ไฟล์อยู่ครบใน checkout) = false-green ระดับ ship-breaking · เสนอคู่กับเช็ค structural ใน `verify-pack` unit
- [ ] **R3 — hash/checksum ของ payload ต้องคิดจาก buffer "หลัง transform ที่จุดเขียน"** · ปลายทาง: `docs/rule.md §4` (ต่อยอดข้อ "payload ต้องถูกคุมที่จุดเขียน ไม่ใช่จุด commit") — เหตุผล: identity ของไฟล์ที่เราเป็นเจ้าของคือ **สิ่งที่เขียนลง target** ไม่ใช่สิ่งที่อยู่ใน package; ใช้ buffer ก่อน `normalizeEol` → hash ไม่ตรงทุกไฟล์บน tarball ที่ pack จาก checkout CRLF ⇒ feature กลายเป็น **no-op เงียบโดย gate เขียวหมด** (KB #30)
- [ ] **R4 — walker ที่ผู้อื่นต้องรู้ผลลัพธ์ ต้องคืนผลผ่าน callback ไม่ให้ walk ซ้ำ + ต้องอ่าน content ก่อน branch skip** · ปลายทาง: `docs/techstack/installer/standard.md` — เหตุผล/learned จาก panel: `copyTree` early-return ที่ `exists && !overwrite` อยู่ **ก่อน** อ่าน content ⇒ **"ทางที่ง่ายกว่าเป็นทางที่ผิด"** (เรียก `onFile` เฉพาะตอนเขียนจริง เขียนง่ายกว่ามาก) แต่ทำให้ไฟล์ที่ skip หายจาก manifest = ของที่เราเป็นเจ้าของแต่บันทึกไม่ครบ ⇒ **ตกรุ่นแล้วลบไม่ได้ตลอดกาล โดยไม่มี gate ไหนจับ**
- [ ] **R5 — destructive op ต้องมี "เซตปิดของเหตุผลที่ไม่ทำ" + structural test ยืนยันเซต** · ปลายทาง: `docs/rule.md §5` — เหตุผล: reason ที่กระจายเป็น literal ทำให้เพิ่มทางลบใหม่ได้เงียบ ๆ; เซตปิด + เทสอ่าน source ทำให้ "ทางที่ไฟล์หายได้" นับได้และรีวิวได้ (ต่อยอด error-prefix convention ของ `installer/rule.md §2`)
- [ ] **R6 — POSIX/native boundary ต้องมี helper เดียว + unit ที่จำลอง `sep` ของ OS ที่ CI ไม่มี runner** · ปลายทาง: `docs/techstack/installer/rule.md` — เหตุผล: CI ไม่มี Windows runner; guard ที่เทียบ path จะ reject ทุก entry เงียบบน Windows ถ้าผสม native กับ POSIX → pure fn ต้องรับ `sep` เป็น input เพื่อให้เทสรูป `\` ได้บน Linux
- [ ] **R7 — allowlist ของ destructive scope ต้องเป็น append-only + มี structural test ว่า allowlist ⊇ ของจริงใน payload** · ปลายทาง: `docs/techstack/installer/rule.md` — เหตุผล: ลบชื่อออกจาก allowlist เมื่อเลิก ship ของนั้น = ทำให้ **ลบของตกรุ่นไม่ได้ตลอดกาล** (กลับหัวจากสัญชาตญาณปกติที่ว่า "เลิกใช้แล้วก็ลบชื่อออก")
- [ ] **R8 — empty-dir cleanup ต้อง snapshot สถานะ "ว่างอยู่ก่อน" ก่อนเริ่มลบ** · ปลายทาง: `docs/techstack/installer/rule.md` — เหตุผล: dir ว่างของผู้ใช้แยกจาก dir ที่ว่างเพราะเราลบ ไม่ได้จากสถานะปลายทางอย่างเดียว
- [ ] **R9 — runbook ของ `--prune-force` / reason prefix** · ปลายทาง: `docs/infra.md` (เจ้าของคือ `release-hygiene` wave 2) — task นี้แค่ **ส่งรายการ reason 13 ค่า + ความหมาย + วิธีแก้** ต่อไปใน build report ห้ามเขียนเอง
