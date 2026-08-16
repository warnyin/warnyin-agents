# Task — build-verify-seam

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `build-verify-seam` |
| **Slice อ้างอิง** | `design.md` slice #2 — "BUILD↔VERIFY ไร้รอยต่อ" |
| **Component** | `workflow core` + `templates` + `adapters` (`src/`) |
| **Model tier** | `balanced` |
| **สถานะ** | `build passed` |

## 1. เป้าหมายของ task (vertical slice)

ทำให้เส้นทาง **BUILD → VERIFY** ไร้รอยต่อและมีเอกสารชุดเดียว:
- full build & test gate เขียว → **ถามยืนยันหนึ่งครั้ง** แล้วเดิน VERIFY ต่อในเซสชันเดียวได้ (ปฏิเสธ → หยุด บอกให้สั่ง `/warnyin:verify`)
- VERIFY ระบุชัดว่า **ตรวจโดย agent/บทบาทอิสระจากผู้เขียนโค้ด** และ **ไม่มี** hook เขียน project memory (C7)
- ผลของสอง stage อยู่ใน **`build.md` ไฟล์เดียว 4 section** (C1) แทน `build.md`+`test.md`+`verify.md`
- ข้อความที่ซ้ำกันคำต่อคำระหว่างสอง playbook เหลือ **นิยามที่เดียว + pointer**

**ไม่ลด gate ใด ๆ** — full build+test blocking, regression baseline, UX/UI verify, contract validation ยังครบเหมือนเดิม

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- **ต้องทำหลัง:** ไม่มี — **wave 1** (ขนานกับ `design-stage-lean`, `validator-cap-gate`, `memory-hook-lean`)
- **ปลดล็อกให้:**
  - `tasks/validator-cap-gate/` — consumer ของ **C1** (assert 4 section แบบ exact) และ **C2** (stage inference `## 4. ผล verify`) · **decouple ด้วย contract** → slice 3 ไม่อ่านไฟล์ของ task นี้ ทั้งคู่ copy จาก `design.md §4`
  - `tasks/release-hygiene/` (wave 2) — dead-link gate + CHANGELOG + full test หลัง integrate ครบ
- **ส่ง output อะไรต่อ:** template `[topic]/build.md` โครงใหม่ + playbook 2 ไฟล์ที่ artifact/gate ตรงกัน
- **gate ที่รันไม่ได้ในรอบนี้ (ประกาศไว้กัน build agent ไล่แก้ผิดทาง):** `npm run lint:md` ระดับ repo อาจแดงจาก pointer ของ slice อื่นที่ยังไม่ integrate → **หน้าที่ของ `release-hygiene` (wave 2)**; ในรอบนี้ให้ยืนยันเฉพาะว่าไฟล์ที่ **task นี้แตะ** ไม่มีลิงก์ตาย

## 3. Sub-tasks (ตามลำดับ)

- [x] **1. สำรวจผู้อ้างถึงก่อนแก้** (investigate-before-edit) — `grep -rn "test\.md\|verify\.md" src/` แล้วแยกเป็น 2 กอง: (ก) ไฟล์ที่ task นี้เป็นเจ้าของ (แก้เอง) (ข) ไฟล์ของ slice อื่น (จดลง §6 ข้อสังเกตส่งต่อ) — _ผลลัพธ์: รายการไฟล์ที่ต้องแก้ + รายการส่งต่อ_
- [x] **2. ยุบ template 3→1 (C1)** — เขียน `src/.warnyin/template/stages/[topic]/build.md` ใหม่: meta table + 4 heading `##` คำต่อคำจาก `spec.md §3 C1` โดย**ย้ายเนื้อจาก `test.md`/`verify.md` เข้ามาเป็น `###` ใต้ §3/§4** (แผนเทส/test cases/local env/e2e/UXUI checklist → §3; ผลเทส/ตารางแก้ไข/จำนวนรอบ/หมายเหตุถึง user → §4) + gate checklist ของ BUILD ใต้ §2 และของ VERIFY ใต้ §4 → `git rm` `test.md` + `verify.md` — _ขึ้นกับ 1_
- [x] **3. seam ฝั่ง BUILD** — `stages/build.md`: §4 ปิดงาน (ข้อ 7) เพิ่ม **W2 confirm handoff** ต่อจาก full-gate; อัปเดตชื่อ artifact ใน §4 ข้อ 7 + ตาราง Output §5 ให้ตรง 4 section; **คง hook memory ของ BUILD ไว้เหมือนเดิมทุกคำ** (`main loop เท่านั้น` / `build sub-agent … ห้ามเขียน memory เอง`) — _ขึ้นกับ 2 (รู้ชื่อ section แน่นอนแล้ว)_
- [x] **4. seam ฝั่ง VERIFY** — `stages/verify.md`: §1 ระบุว่าเข้าได้ทั้งจาก `/warnyin:verify` และ handoff ที่ user ยืนยันใน BUILD; §3 ข้อ 1 ใส่ **W1 ผู้ตรวจอิสระจากผู้เขียนโค้ด** (+ fallback เครื่องที่ fan-out ไม่ได้ → main loop สวม lens `roles/qa.md`); **ลบ hook `อัปเดต project memory` ทั้งบรรทัด** (C7); เปลี่ยนทุกจุดที่เขียน `test.md`/`verify.md` → `build.md §3` / `build.md §4` (§2 ข้อ 3, §3 ข้อ 8, §4 ข้อ 2/6, §5 ตาราง Output, §6 gate); แก้ fast-track hook §1 ที่อ้างไฟล์ที่ไม่มีแล้ว — _ขึ้นกับ 2_
- [x] **5. unify 4 block ที่ซ้ำ** — เจ้าของ = `stages/build.md` (นิยามเต็มคงอยู่ที่เดิม), `stages/verify.md` เหลือ **pointer + สรุป 1 บรรทัด** โดย**คงหมายเลขข้อเดิม**:
      - step 0 context window: `verify.md §4 ข้อ 0` → ชี้ `build.md §4 ข้อ 0`
      - investigate-before-edit: `verify.md §3 ข้อ 10` → ชี้ `build.md §3 ข้อ 11`
      - config-protection: `verify.md §3 ข้อ 11` → ชี้ `build.md §3 ข้อ 12` + **คงประโยคเฉพาะ VERIFY** (`"แก้จนผ่าน"` = แก้ root cause ไม่ลด bar)
      - Loop-tuning report block: `verify.md §4 ข้อ 5` → คงลิงก์ `loop-tuning.md` + ชี้ `build.md §4 ข้อ 6 · Loop-tuning report`
      ตรวจด้วย negative-grep ใน `spec.md §7 B` — _ขึ้นกับ 3, 4_
- [x] **6. adapter** — `src/.claude/commands/warnyin/build.md`: step ปิดงานเพิ่ม confirm handoff (ใช้ AskUserQuestion) + artifact ใหม่; `src/.claude/commands/warnyin/verify.md`: step 5 → เขียนแผนลง `build.md §3`, step 9 → เขียนผลลง `build.md §4`, หมายเหตุท้ายไฟล์เปลี่ยนจาก "`test.md` เขียนระดับ topic" → "`build.md §3`"; adapter ทั้งสอง**คงเป็น command (user-only)** ไม่แปลงเป็น skill — _ขึ้นกับ 3, 4_
- [x] **7. self-verify** — ไล่ `spec.md §7` A–G ทีละข้อ, รัน `npm test` + `npm run lint:md` เฉพาะเพื่อยืนยันว่าไม่พังจากไฟล์ที่ตัวเองแตะ, สรุปข้อที่ยังแดงเพราะ slice อื่น → ใส่ §6 — _ขึ้นกับ 2-6_

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

**แก้/สร้าง (แก้ที่ `src/` เท่านั้น — root เป็น dogfood gitignored):**
- `src/.warnyin/workflow/stages/build.md`
- `src/.warnyin/workflow/stages/verify.md`
- `src/.warnyin/template/stages/[topic]/build.md`
- `src/.claude/commands/warnyin/build.md`
- `src/.claude/commands/warnyin/verify.md`

**ลบ:**
- `src/.warnyin/template/stages/[topic]/test.md`
- `src/.warnyin/template/stages/[topic]/verify.md`

**★ ห้ามแตะเด็ดขาด (ของ slice อื่น / นอก scope):**
`src/.warnyin/workflow/stages/design.md` · `src/.claude/commands/warnyin/design.md` · `src/.warnyin/workflow/memory.md` · `src/.warnyin/workflow/fastlane.md` · `src/.warnyin/workflow/scripts/validate-topic.mjs` · `CHANGELOG.md` · `src/tests/**` · ไฟล์ใด ๆ ที่ root (`.warnyin/`, `.claude/`)

## 5. Acceptance criteria

- [x] template `[topic]/build.md` มี 4 heading คำต่อคำตาม C1 และ `grep -c '^## '` = `4`; `test.md`/`verify.md` ของ template **ไม่มีอยู่แล้ว** (spec §7 A)
- [x] เนื้อของ `test.md`/`verify.md` เดิมถูกย้ายเข้า §3/§4 ครบ ไม่มีหัวข้อไหนหายเงียบ (spec §7 A4)
- [x] negative-grep ผ่านทั้ง 4 needle — นิยามเหลือใน `build.md` ไฟล์เดียว และ `verify.md` ชี้กลับครบทุกจุดพร้อมพิกัด (spec §7 B)
- [x] `build.md` มี W2 (confirm หนึ่งครั้ง หลัง full-gate) · `verify.md` มี W1 (ผู้ตรวจอิสระจากผู้เขียนโค้ด) (spec §7 C)
- [x] `verify.md` ไม่มีข้อความ `อัปเดต project memory`; `build.md` ยังมีและยังระบุ `main loop เท่านั้น` (spec §7 D)
- [x] ตาราง Output + gate ของสอง playbook + adapter ทั้งสองตรงกับ artifact ใหม่ (spec §7 E)
- [x] **gate เดิมครบทุกข้อ**: full build+test blocking · regression baseline จาก `docs/features/*/spec.md` · UX/UI verify · contract validation (`openapi.yaml`) (spec §7 F)
- [x] ลิงก์ในไฟล์ที่แตะ resolve ทุกเส้น · ไม่ rename anchor/เลขข้อที่มี inbound link · `npm test` pass count ไม่ลด (spec §7 G — M2 แดงจาก design intent C7 ซึ่ง memory-hook-lean/release-hygiene จะแก้ test expected set)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. ข้อสังเกตส่งต่อ (ไฟล์ของ slice อื่น — **ห้ามแก้ในรอบนี้** รายงานตอน integrate)

| ไฟล์ | จุดที่จะไม่สอดคล้องหลัง C1 | เจ้าของที่ควรแก้ |
|---|---|---|
| `src/.warnyin/workflow/stages/ship.md` (§4 ข้อ 2 promote) | "`test.md` (merge แผนเทสจาก `test.md` ของ topic)" → ต้องเป็น "จาก `build.md §3`" | slice #4 `memory-hook-lean` แตะไฟล์นี้อยู่แล้ว (hook) — ถ้าไม่รับ ให้ตกไป `release-hygiene` |
| `src/.warnyin/workflow/stages/ship.md` (§3 ข้อ 7 / §4 ข้อ 1) | สแกน emergent lesson จาก "`build.md`/`verify.md`" + เช็ค gate ว่ามี `verify.md` สรุปผลผ่าน | เดียวกับข้างบน — เกณฑ์ใหม่ = `build.md §4` |
| `src/.claude/commands/warnyin/ship.md` (step 3) | อ้าง "`verify.md` สรุปผลผ่าน" + สแกน `build.md`/`verify.md` | `release-hygiene` |
| `src/.warnyin/workflow/next.md` (ตาราง stage inference) | แถว `` `test.md` / `verify.md` `` → VERIFY ต้องเปลี่ยนเป็น "`build.md` มี `## 4. ผล verify`" (ให้ตรง C2) | `release-hygiene` (หรือ `validator-cap-gate` ถ้าจะ unify กับ C2) |
| `src/.warnyin/workflow/README.md` (แผนผัง `template/stages/[topic]/`) | บรรทัด `test.md  verify.md   # output ของ VERIFY` ต้องหาย และ `build.md` ระบุว่าเป็น output ของ BUILD+VERIFY | `release-hygiene` |
| `src/.warnyin/workflow/scripts/validate-topic.mjs` (`STAGES` order 5) | `required: ['verify.md','test.md']` → section-based (C2) | **slice #3 `validator-cap-gate`** (owner) |
| `src/.warnyin/workflow/loop-tuning.md` (บรรทัดท้าย) | ชี้ wording requirement ไปทั้ง `build.md` และ `verify.md` — หลัง unify นิยามอยู่ `build.md` เดียว (pointer ยัง resolve แต่ควรกระชับ) | `release-hygiene` |
| `docs/rule.md §1` (loop-tuning convention) + `docs/features/build-orchestration/spec.md` | ข้อความบรรยายว่า report requirement อยู่ทั้งสอง stage / artifact 3 ไฟล์ | **SHIP** (promote — ห้ามแก้ `docs/` ตอน BUILD) |

## 7. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern การเขียน playbook/template): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
