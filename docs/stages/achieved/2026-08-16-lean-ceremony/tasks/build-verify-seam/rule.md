# Rule — build-verify-seam

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก `docs/rule.md`)

### แหล่งความรู้ / โครงสร้าง
- [ ] **§6 source/dogfood แยกชั้นเด็ดขาด** — แก้ **`src/**` เท่านั้น**; root `.warnyin/`, `.claude/` gitignored (แก้ไปก็ไม่ถูก commit และจะถูกทับตอน sync)
- [ ] **§1 canonical-copy** — นิยามของกฎที่ต้องใช้หลายที่อยู่ **ไฟล์เดียว** ที่เหลือเป็น pointer; พิสูจน์ด้วย **negative-grep** (needle เจอไฟล์เดียว)
- [ ] **§1 unify-in-place ไม่สร้างกลไกขนาน** — ตัดของซ้ำโดย**ขยาย/ชี้กลับในที่เดิม** ห้ามสร้าง section/ไฟล์ใหม่มารับ
- [ ] **§1 canonical-copy (ข้อย่อย ★)** — **string ที่ถูก assert คำต่อคำชนะ pattern ประจำไฟล์เสมอ**: C1 (4 section) และ W1/W2 ใน `spec.md §3` ต้อง copy ตรงตัว ห้าม paraphrase ให้ "เข้าสไตล์ไฟล์"
- [ ] **§2 contract-as-copy-source** — ห้ามอ่านไฟล์ปลายทางของ task อื่นเพื่อเอา wording (wave 1 ต้องขนานได้จริง); ทุก string เอาจาก `design.md §4` / `spec.md §3` ของ task นี้
- [ ] **§2 anchor-immutability** — heading ที่มี inbound link ≥2 ไฟล์ = public API ห้าม rename (`#fast-track-skip-list`); เลขข้อ §3/§4 ของ playbook ถูกอ้างจาก `loop-tuning.md` / `backlog.md` / `api-doc.md` → ห้าม renumber

### ปรัชญา / ความปลอดภัยของ workflow
- [ ] **§1 กระทัดรัด opinionated** — ยุบ artifact/ตัดของซ้ำได้ แต่ห้ามเพิ่ม knob/mode ใหม่ให้ user ตั้งค่า
- [ ] **§1 tool-agnostic + adapter บาง** — กฎอยู่ `.warnyin/`; `.claude/commands/warnyin/*` เป็น adapter บางชี้กลับ ไม่ duplicate
- [ ] **§1 ห้ามเดา** — เนื้อกฎที่ตัดออกต้อง**ยังอ่านถึงได้จาก pointer**; ห้ามลบทิ้งเฉย ๆ แล้วสรุปเอง
- [ ] **§1 investigate-before-edit** — ก่อนแก้/ลบไฟล์ ต้องรู้ว่าใครอ้างถึง (`grep -rn "test.md\|verify.md" src/`) แล้วจึงแก้
- [ ] **§1 config-protection** — ห้ามแก้ test/lint config เพื่อให้เขียว (ถ้าเทสเดิมแดงเพราะยุบ artifact = แก้เนื้องานหรือส่งต่อให้ slice เจ้าของเทส)
- [ ] **§1 build-orchestration ★ hook ของ stage ที่มี fan-out ต้องมี main-loop-only variant แยกชัด** — hook memory ของ BUILD ต้องคง `main loop เท่านั้น` + `build sub-agent ที่ทำงานใน worktree ห้ามเขียน memory เอง`
- [ ] **§1 structural validator ✖ ไม่พึ่ง filled-detection** — โครง 4 section ต้องเป็น structural ล้วน (heading คงที่) เพื่อให้ slice 3 infer stage ได้โดยไม่เดาว่า "เติมแล้วหรือยัง"

### คุณภาพ / การตรวจ
- [ ] **§5 ★ ตรวจโดย agent อิสระจากผู้เขียน** — self-check ของ build agent ไม่พอ; **นี่คือ property ที่ task นี้ต้องเขียนให้ชัดใน `verify.md`** (เหตุผลที่ทางเลือก B "ยุบ VERIFY เข้า BUILD" ถูกตัดใน `proposal.md §3`)
- [ ] **§5 ★ structural single-source / anchor check = เคส node ใน suite ไม่ใช่ shell grep** — grep ใน `spec.md §7` ใช้ **ยืนยันระหว่าง build** ได้ แต่ถ้าจะทำให้เป็น gate ถาวรต้องเป็นเคสใน `node --test` (ไฟล์เทสเป็นของ slice `validator-cap-gate`/`release-hygiene` → ส่งต่อ ไม่เขียนเอง)
- [ ] **§4 ★ payload ที่ผู้ใช้ต้องได้ ต้องถูก assert** — ลบไฟล์ template แล้ว `verify-pack`/existence gate ต้องไม่แดง; ถ้าแดงเพราะ assert ชื่อไฟล์เดิม → รายงาน (ไฟล์ script เป็นของ slice อื่น)
- [ ] **§2 CHANGELOG ทุก user-facing change** — change นี้ user-facing **แต่ CHANGELOG เป็นของ slice `release-hygiene`** → **ห้ามเขียน `CHANGELOG.md` เอง**

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

> ห้ามแก้ `docs/rule.md` / `docs/techstack/*/rule.md` ตอนนี้ — note ไว้ก่อน

- [ ] **stage-seam confirm convention** — การเดิน stage ถัดไปในเซสชันเดียวต้องเป็น **confirm หนึ่งครั้งหลัง gate ของ stage ปัจจุบันเขียว** + มีทางออกให้ user สั่ง command เองเสมอ (ปฏิเสธ → หยุด ไม่เดินต่อเงียบ ๆ); ห้าม auto-continue โดยไม่ถาม — เหตุผล: คง property "user-invoked" ของ stage ที่ stateful/irreversible (คู่กับ C6 ของ fastlane) โดยไม่ต้องพิมพ์ command ที่สอง · evidence: task นี้ + `design-stage-lean`
- [ ] **independent-verifier เป็น property ของ stage ไม่ใช่แค่กฎเทสเอกสาร** — ยก `docs/rule.md §5` ข้อ "ตรวจโดย agent อิสระจากผู้เขียน" ขึ้นเป็นข้อใน §1 (ปรัชญา) เพราะเป็นเหตุผลที่ workflow ยังแยก VERIFY ออกจาก BUILD — เหตุผล: ถ้าอยู่ใน "Testing rules" อย่างเดียว จะถูกอ่านว่าใช้เฉพาะเอกสาร narrative
- [ ] **ยุบ artifact ข้าม stage ได้เมื่อ stage inference เป็น structural** — เกณฑ์: (1) มี heading คงที่ที่แยก stage ได้, (2) single-writer เดียวกัน, (3) ปลายทาง promote ตอน SHIP ยังชี้ section ได้ — เหตุผล: กันการยุบไฟล์ในอนาคตแล้ว validator/`next.md` อ่านสถานะเพี้ยน · evidence: C1/C2 ของ topic นี้
- [ ] **pointer ข้ามไฟล์ต้องระบุพิกัด section/ข้อ ไม่ใช่ชี้ทั้งไฟล์** — เพราะ `lint-md.mjs` ตัด anchor ทิ้ง → พิกัดที่เป็นข้อความ (`§3 ข้อ 11`) คือสิ่งเดียวที่ผู้อ่านตามต่อได้ · evidence: 4 block ที่ unify ใน task นี้
