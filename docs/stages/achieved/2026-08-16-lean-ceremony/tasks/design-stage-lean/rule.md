# Rule — design-stage-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow

### 1.1 ★ contract-as-copy-source (`docs/rule.md §2`) — ข้อบังคับอันดับ 1

- [ ] copy needle **C5** จาก `../../design.md §4` **คำต่อคำ** — ห้ามย่อ ห้ามเรียงคำใหม่ ห้ามแก้เครื่องหมาย (`**`, `→`, `;`, backtick, `≥`)
- [ ] **C6 เป็นของ slice `memory-hook-lean`** — `design.md` **อ้างถึงเท่านั้น** (fragment `ที่ user ยืนยันในเซสชัน` + `นับเป็น user-invoked`) **ห้าม copy ประโยค C6 เต็ม**
- [ ] **ห้ามอ่าน/ลอก wording จากไฟล์ปลายทางของ slice อื่น** (`fastlane.md`, `memory.md`, `stages/build.md` …) — wave 1 decouple ด้วย contract; ไฟล์เหล่านั้นอาจยังไม่ถูกแก้ตอนรัน

### 1.2 ★ canonical-copy / single-source (`docs/rule.md §1`)

- [ ] needle C5 ปรากฏ **ครั้งเดียว** ในไฟล์ A — อีก 3 จุดเป็น pointer `signal ตาม §3 ข้อ 7`
- [ ] adapter (`.claude/commands/warnyin/design.md`) **ชี้ playbook + เลข step** ไม่ duplicate ขั้นตอน/เงื่อนไข
- [ ] `design.md` **ไม่ลอกขั้นตอนของ `fastlane.md`/`triage.md`** (executor-playbook convention `docs/rule.md §2`) — พิสูจน์ด้วย negative-grep `pre-flight: สร้าง`

### 1.3 ★ unify-in-place (`docs/rule.md §1`)

- [ ] ขยาย principle/step เดิมในที่เดิม — **ห้ามเพิ่มข้อใหม่ใน §3 หรือ step ใหม่ใน §4**
- [ ] blockquote handoff ของ step 1.5 = **เขียนทับของเดิม** ไม่ใช่เพิ่มใบใหม่

### 1.4 ★ stage-invoked capability convention (`docs/rule.md §1`)

- [ ] step 4.5 ต้องคง **detect ที่ระบุ "ไม่เข้าเงื่อนไข → ข้าม" ชัด** และ **exclusion เช็คก่อน signals**
- [ ] gate item §8 ของ wireframe ต้องคง **conditional/N-A** (`ไม่มี UI surface → ข้อนี้ N/A`) — backward compatible
- [ ] ตัดได้เฉพาะ **คำถาม "จะวาดไหม"** — **approve gate ของภาพยังอยู่** (user ยืนยันก่อนแตก task)

### 1.5 ★ gate เดิมห้ามถูกลดทอน (config-protection `docs/rule.md §1`)

- [ ] §8 ยังมี **11 item** เท่าเดิม ถ้อยคำเดิม — ห้ามเพิ่ม/ลบ/แก้
- [ ] C5 ทำให้ gate ถูก **เสนอ** น้อยลง ไม่ได้ทำให้ gate อ่อนลง — เข้า signal แล้ว **ยังถาม user ก่อนเสมอ ห้าม auto-run agent**
- [ ] ทุกจุด fan-out ยังต้องมี **fallback "เครื่องที่ fan-out ไม่ได้ → ทำตามลำดับเหมือนเดิม"**

### 1.6 ★ file ownership disjoint (`../../design.md §7`)

- [ ] แตะได้ **2 ไฟล์เท่านั้น**: `src/.warnyin/workflow/stages/design.md` · `src/.claude/commands/warnyin/design.md`
- [ ] ✖ ห้ามแตะ `stages/{build,verify,discovery,ship}.md` · `workflow/{memory,fastlane,triage}.md` · `scripts/validate-topic.mjs` · `src/tests/**` · `src/.warnyin/template/**` · `CHANGELOG.md`
- [ ] ✖ **ห้ามแก้ root `.warnyin/` / `.claude/`** — dogfood gitignored (`docs/rule.md §6`, `installer/rule.md` registry-target) → แก้ที่ `src/` เท่านั้น; ไม่แน่ใจให้เช็ค `git check-ignore <file>` ก่อน

### 1.7 ★ anchor-immutability + dead-link (`docs/rule.md §2` / `installer/rule.md`)

- [ ] **ห้าม rename/เปลี่ยน heading ใดๆ** ในไฟล์ A/B (`lint-md.mjs` ตัด anchor ก่อนเช็ค → ลิงก์พังเงียบ)
- [ ] ลิงก์ที่เพิ่ม/แก้ต้อง resolve จาก **ที่อยู่ของไฟล์ผู้ชี้** — `../fastlane.md` จาก `stages/`
- [ ] คงลิงก์เดิม `../triage.md#fast-track-skip-list` ไว้ (anchor ถูกอ้าง 5 ไฟล์)

### 1.8 ★ gate ที่ยังรันไม่ได้ในรอบนี้ (wave-1 declaration)

- [ ] **ห้ามรัน `npm run lint:md` แล้วไล่แก้** — dead-link ข้าม slice เป็นของ `release-hygiene` (wave 2)
- [ ] **`npm test` จะแดงที่เคส `M2` ของ `src/tests/memory.test.mjs`** (เพราะลบ hook ตาม C7) — **คาดไว้แล้ว ห้าม "แก้ให้เขียว" ด้วยการคืน hook หรือแก้ไฟล์เทส** — expected ของ M2 (6→3) เป็นของ `tasks/release-hygiene` (wave 2) ซึ่งแก้หลัง integrate ครบและพิสูจน์ด้วย negative-grep แล้ว

### 1.9 ★ investigate-before-edit + payload hygiene

- [ ] อ่านไฟล์เป้าหมายทั้งไฟล์ก่อนแก้; หา anchor ไม่เจอ → **หยุด รายงาน ห้ามเดา**
- [ ] idempotent — รันซ้ำไม่เพิ่มซ้ำ
- [ ] tool-agnostic (ห้ามชื่อรุ่น/ผลิตภัณฑ์) · LF ล้วน · ห้าม secret/absolute path ลง payload

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

> ห้ามแก้ `docs/rule.md` / `docs/techstack/*/rule.md` ตอนนี้ — note ไว้ก่อน

- [ ] **rule ที่เสนอ:** _optional gate ในทุก playbook ต้องเป็น **trigger-by-signal** ไม่ใช่ "ถามทุกครั้ง"_ — เกณฑ์เปิด gate ต้องเขียนเป็นเงื่อนไขที่ตัดสินได้ (tier / hard-floor / จำนวน task) และ **ไม่เข้าเงื่อนไข = ข้ามเงียบ**; เข้าเงื่อนไขแล้วยังถาม user ก่อนเสมอ — **เหตุผล:** คำถาม optional ที่ถามทุกครั้งคือ ceremony ที่จ่ายเต็มโดยไม่ดูขนาดงาน (วัดได้จาก 39 topic ใน achieved) แต่ถ้า auto-run จะเสีย property "ห้ามเดา" → signal คือจุดสมดุล (ทิศเดียวกับ change-sizing router)
- [ ] **rule ที่เสนอ:** _capability ที่มี **approve gate ของ artifact** อยู่แล้ว ไม่ต้องมี "คำถามก่อนผลิต" อีกชั้น_ — ถาม 2 ชั้น (จะทำไหม → ผลลัพธ์ใช้ได้ไหม) ให้ตัดชั้นแรกทิ้ง เพราะ **detect + approve gate ครอบ correctness ครบแล้ว** และการเห็นภาพจริงตัดสินง่ายกว่าตอบคำถามลอย ๆ — **เหตุผล:** generalize จาก step 4.5 (wireframe) ใช้ซ้ำได้กับ capability generator ตัวอื่นในอนาคต
- [ ] **rule ที่เสนอ:** _hook ที่ถูกลบออกจาก stage ต้องลบ **ทั้ง blockquote** ไม่เหลือ pointer กำพร้า_ — pointer ที่เหลือค้างจะถูกอ่านว่า "ยังมี write point" และทำ negative-grep ของ slice อื่นแดง — **เหตุผล:** C7 ของ topic นี้แยก "เจ้าของนิยาม (`memory.md`)" กับ "เจ้าของข้อความ (stage)" ชัด → การลบต้องลบฝั่งข้อความให้หมดจริง
