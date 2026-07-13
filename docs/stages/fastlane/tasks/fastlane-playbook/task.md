# Task — fastlane-playbook

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> สร้าง **2 ไฟล์ใหม่**: playbook กลาง + command adapter ของ `/warnyin:fastlane`

| | |
|---|---|
| **Task** | `fastlane-playbook` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` |
| **Model tier** | `deepest` _(เป็นแก่นกลางของ executor — orchestration + gate 2 ชั้น + resume + escalation; ผิดพลาดแล้วกระจายทั้ง flow)_ |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
user รัน `/warnyin:fastlane [slug] <change>` แล้วได้ flow ครบเส้น: pre-flight (resume + hard-floor gate + receipt meta/§1/§2) → code-first → gate loop → เติม receipt → ship-lite
โดย **fastlane เป็น "ผู้เดิน" ไม่ใช่ "ผู้ตั้งกฎ"** — กฎทั้งหมด reuse canonical เดิม (`triage.md` + stage playbook)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: **ไม่มี** — wave 1, ขนานกับ `tasks/fastlane-wiring/`
- ปลดล็อกให้: `tasks/fastlane-test-release/` (wave 2 — assert ไฟล์จริงของ task นี้)
- ส่ง output อะไรต่อให้ task ถัดไป: ไฟล์ `src/.warnyin/workflow/fastlane.md` + `src/.claude/commands/warnyin/fastlane.md` (anchor ตาม C3, description ตาม C4)
- **ไม่ทับไฟล์กับ `fastlane-wiring`** — task นี้ **สร้างไฟล์ใหม่ 2 ไฟล์เท่านั้น ห้ามแก้ไฟล์เดิม** (registry/stage/policy เป็นของ `fastlane-wiring`)

## 3. Sub-tasks

- [ ] 1. เขียน `src/.warnyin/workflow/fastlane.md` — 5 section ตาม **C3 เป๊ะ** (heading คำต่อคำ):
  `## 1. fastlane คืออะไร / ใช้เมื่อไหร่` · `## 2. Pre-flight (บังคับ — ก่อนแตะโค้ด)` · `## 3. ลำดับขั้นการทำงาน` · `## 4. Gate → ปิดงานได้เมื่อ` · `## 5. หลักการ`
  _ผลลัพธ์:_ playbook กลาง tool-agnostic ที่ทุก harness อ่านได้
- [ ] 2. เขียน `src/.claude/commands/warnyin/fastlane.md` — adapter บาง mirror รูปแบบ `src/.claude/commands/warnyin/triage.md`
  _ขึ้นกับ 1:_ ต้องชี้ playbook ที่มีจริง (ด้วย **inline-code backtick**)
- [ ] 3. self-check ก่อนปิด: heading 5 อัน ตรง C3 · ลำดับ step ใน §3 (receipt ก่อนแก้โค้ด) · negative-grep duplication · ทุก markdown-link resolve

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **สร้างใหม่:** `src/.warnyin/workflow/fastlane.md`
- **สร้างใหม่:** `src/.claude/commands/warnyin/fastlane.md`
- **ห้ามแตะอย่างอื่นทั้งสิ้น** — โดยเฉพาะ root `.warnyin/`, `.claude/`, `CLAUDE.md` (dogfood gitignored → แก้แล้วงานหาย — C18)

## 5. Acceptance criteria (วัดได้จริง)
- [ ] **A1 (ไฟล์มีจริง):** ทั้ง 2 ไฟล์ถูกสร้างใต้ `src/` และ `git status` ไม่มีไฟล์ใหม่นอก `src/` + `docs/stages/fastlane/`
- [ ] **A2 (anchor ครบ):** `fastlane.md` มี heading ตรง C3 ครบ **5/5 คำต่อคำ** (เทียบ string ตรงๆ)
- [ ] **A3 (description คำต่อคำ):** frontmatter `description:` ของ adapter = C4 คำต่อคำ · `argument-hint:` = C5 คำต่อคำ · body ใช้ `$ARGUMENTS`
- [ ] **A4 (adapter บาง):** adapter ชี้ `.warnyin/workflow/fastlane.md` ด้วย **inline-code backtick** — ไม่มี markdown-link ไป playbook (กัน dead link ของ `lint:md`) และไม่มีตาราง rubric/skip-list
- [ ] **A5 (ไม่ลอกกฎซ้ำ — negative):** `fastlane.md` **ไม่มี** ประโยค ``pre-flight: สร้าง `receipt.md` จาก template`` · **ไม่มี** รายชื่อ 5 หมวด hard-floor แบบเต็ม · **ไม่มี** คู่คำ `config-protection` + `investigate-before-edit` ปรากฏพร้อมกัน
- [ ] **A6 (ordering):** ในไฟล์ `fastlane.md` บรรทัดของ step "เขียน receipt meta+§1+§2" มี **line-number น้อยกว่า** บรรทัดของ step "แก้โค้ด"
- [ ] **A7 (link resolve):** ทุก markdown-link ใน `fastlane.md` resolve ได้จริง (`npm run lint:md` ผ่าน) และมี link `[fast-track skip-list](triage.md#fast-track-skip-list)`
- [ ] **A8 (พฤติกรรมครบ):** `fastlane.md` cover C6 slug · C7 resume · C8 git posture · C9 hard-floor gate 2 ชั้น · C10 cap 3 รอบ · C11 ไม่มี test suite + cap receipt ≤40 บรรทัด
- [ ] **A9 (pointer หลักการกลาง):** มี pointer ไป `minimalism.md` (ตอน generate) และ `loop-tuning.md` (ตอน fix loop)
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Contract คำต่อคำ: `../../design.md` §4 (C1-C11, C18)
