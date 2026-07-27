# Rule — stage-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก `docs/rule.md` — ข้อบังคับของ task นี้)

### 1.1 ★ contract-as-copy-source (`docs/rule.md §2`) — ข้อบังคับอันดับ 1

- [ ] **copy canonical string จาก `design.md §4` คำต่อคำ** — C2 · C2b · C2c · C3a · C3b · C3c · C4a · C4b · C4c · C5a · C5b
- [ ] **ห้ามแต่งใหม่ ห้ามย่อ ห้ามเรียงคำใหม่ ห้ามแก้เครื่องหมาย** (`**`, `★`, `→`, `;`, backtick, em dash) — string เหล่านี้ถูก assert แบบ **string-equality** โดย `src/tests/memory.test.mjs` (T6)
- [ ] **ห้ามอ่านไฟล์ปลายทางของ task อื่นเพื่อลอก wording** — decouple ของ wave 1 อยู่ที่ contract; ไฟล์ของ T1/T4/T5 อาจยังไม่มีตอนรัน

### 1.2 ★ unify-in-place (`docs/rule.md §1`) — C3a/C3b/C3c เป็น replacement

- [ ] **แทนที่บรรทัดเดิมทั้งบรรทัด ห้ามเพิ่มบรรทัดใหม่ซ้อน** — ขยายในที่เดิมให้ของเก่ากลายเป็น subset
- [ ] ผลลัพธ์ต้องผ่านเทส **"ไม่มีคำสั่งอ่าน `docs/stages/context.md` 2 บรรทัดในไฟล์เดียว"** (T6) — ตรวจทั้ง `discovery.md`, `next.md`, `explore.md`
- [ ] คง sub-bullet/บริบทที่ห้อยอยู่ใต้บรรทัดเดิมไว้ (เคส `explore.md` ข้อ 4)

### 1.3 ★ path ต่างกันตามที่อยู่ไฟล์ (ห้ามสลับ)

- [ ] ไฟล์ใต้ `stages/` → **`../memory.md`** (C2, C2b, C3a, C4a)
- [ ] ไฟล์ระดับ `workflow/` → **`./memory.md`** (C2c, C3b, C3c)
- [ ] **ไม่คิดเอง** — path มาพร้อม string ใน contract แล้ว; copy ตามนั้น (C3a ใช้ `../`, C3b/C3c ใช้ `./`)

### 1.4 ★ executor-playbook convention (`docs/rule.md §2`) — `fastlane.md`

- [ ] `fastlane.md` ต้องเป็น **pointer เท่านั้น ห้าม inline กฎ** — เป็น "ผู้เดิน ไม่ใช่ผู้ตั้งกฎ"
- [ ] แถวใหม่ต้องเป็น pointer-per-row ชี้กลับ `memory.md` — ห้ามลอกกติกา schema/lifecycle/write-point ลงมา
- [ ] พิสูจน์ได้ด้วย negative-grep: สตริงเอกลักษณ์ของ canonical (เช่น `working state (ปัจจุบัน)`) **ต้องไม่ปรากฏ** ใน `fastlane.md` หรือไฟล์ใดของ task นี้

### 1.5 ★ file ownership disjoint (`design.md §7` + cross-task note)

- [ ] **ห้ามแตะ `src/.warnyin/workflow/memory.md`** (T1 เป็นเจ้าของ) — แม้ pointer ทุกตัวจะชี้ไปไฟล์นั้น ก็ **ไม่สร้าง ไม่แก้**
- [ ] **ห้ามแตะ `src/.warnyin/workflow/README.md`** (T1 เป็นเจ้าของ registry — C11)
- [ ] **ห้ามแตะ `src/.warnyin/workflow/scripts/memory-status.mjs`** (T5) — C5a เป็นแค่ข้อความสั่งเรียก
- [ ] **ห้ามแตะ `src/tests/`** (T6) — T2 ไม่เขียนเทส
- [ ] ✔ ในทางกลับกัน **C5a/C5b เป็นของ T2** เพราะอยู่ใน `next.md` (T5 ห้ามแตะ `next.md`) — T2 ต้องเป็นคน copy เอง อย่าคิดว่า T5 ทำให้

### 1.6 ★ self-verify ด้วย grep เท่านั้น

- [ ] **ห้ามรัน `npm run lint:md`** — wave 1 ยังไม่มีไฟล์ปลายทางของ T1 ลิงก์ `memory.md` จะแดงเป็นปกติ; dead-link เป็น **gate ของ T6** หลัง integrate ครบ
- [ ] ห้าม "แก้ให้ lint เขียว" ด้วยการถอด/เปลี่ยนลิงก์ในลิงก์ที่ contract กำหนด (**config-protection** `docs/rule.md §1` — ห้ามลด bar เพื่อให้ gate ผ่าน)
- [ ] `npm test` ก็ยังไม่ใช่หน้าที่ของ task นี้ (lean self-verify — integration เลื่อนไป full-gate ของ T6)

### 1.7 ★ gate เดิมห้ามถูกลดทอน (`ship.md`)

- [ ] เพิ่ม gate item ได้ **แต่ห้ามแก้/ลบของเดิม 11 ข้อ** → นับ `- [ ]` ใน §6 ต้องได้ **12 พอดี**
- [ ] §3 ข้อ 7 ต้องคงข้อความ `evidence (บังคับ)` และ `user ยืนยัน` ไว้ครบ
- [ ] gate item ใหม่ต้อง **conditional/N-A** (stage-invoked capability convention `docs/rule.md §1`) — ไม่มี `docs/memory.md` → N/A ไม่ block topic ที่ memory ไม่เกี่ยว

### 1.8 ★ investigate-before-edit + idempotent

- [ ] อ่านไฟล์ปลายทางทั้งไฟล์ก่อนแก้ทุกใบ — เข้าใจโครง §/ลำดับ step ก่อนแทรก
- [ ] **หา anchor เดิมไม่เจอ → หยุด รายงาน ห้ามเดาตำแหน่ง**
- [ ] **รันซ้ำต้องไม่เพิ่มซ้ำ** — ตรวจว่ามี hook อยู่แล้วหรือยัง ก่อนเขียน

### 1.9 ★ payload hygiene

- [ ] **tool-agnostic** — ห้ามเติมชื่อรุ่น/ผลิตภัณฑ์ของ harness ลง payload (`docs/rule.md §1`)
- [ ] **LF ล้วน** — ห้ามให้ไฟล์กลายเป็น CRLF (บทเรียน commit `0a2e7c4`: CRLF ทำ Workflow ปัดตก BUILD)
- [ ] **anchor-immutability** (`docs/rule.md §2`) — ห้าม rename/เปลี่ยน heading ของไฟล์ที่แก้ (มี inbound link ≥2 ไฟล์ เช่น `#fast-track-skip-list`) — task นี้ **เพิ่มเนื้อในเท่านั้น ไม่แตะ heading**
- [ ] ห้ามเขียน raw secret/token/absolute path ของเครื่อง ลง payload ที่ commit

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

> ห้ามแก้ `docs/rule.md` / `docs/techstack/*/rule.md` ตอนนี้ — note ไว้ก่อน ถึง SHIP ค่อยพิจารณา

- [ ] **rule ที่เสนอ:** _pointer path ต้อง resolve จากที่อยู่ของไฟล์ผู้ชี้ ไม่ใช่จากรากของ payload_ — contract ที่กระจายหลายไดเรกทอรีต้องระบุ **path variant ต่อไฟล์** ไว้ใน contract เอง ไม่ปล่อยให้ผู้ copy คำนวณเอง — **เหตุผล:** panel B4 ของ topic นี้จับได้ว่า C3 เวอร์ชันแรกใช้ `./memory.md` ชุดเดียว ซึ่ง resolve ผิดเมื่ออยู่ใต้ `stages/`; แก้ด้วยการแตกเป็น C3a/C3b/C3c — generalize เป็นกฎของ canonical-copy ได้
- [ ] **rule ที่เสนอ:** _wave 1 ของ topic ที่ decouple ด้วย contract ต้องประกาศ "gate ไหนยังรันไม่ได้" ไว้ใน task file_ — เช่น dead-link/lint ที่พึ่งไฟล์ของ task อื่น → ระบุชัดว่าเป็นหน้าที่ของ release-hygiene wave — **เหตุผล:** กัน build agent เสียเวลา (หรือแย่กว่า: แก้ contract เพื่อให้ gate ผ่าน) กับ gate ที่ยังไม่ควรเขียวในรอบนั้น
- [ ] **rule ที่เสนอ:** _การเดินสาย hook เข้า playbook ต้องแยก "main-loop-only variant" ให้ชัดทุกครั้งที่ stage มี fan-out sub-agent_ — **เหตุผล:** BUILD เป็น stage เดียวที่ fan-out worktree; hook ที่ไม่แยก variant จะทำให้ sub-agent เขียน memory ทับกัน/conflict (เหตุผลเดียวกับ topic docs ใน `docs/rule.md §1` build-orchestration)
