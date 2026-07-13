# Task — fastlane-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `fastlane-wiring` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
ทำให้ **ระบบเดิมรู้จัก executor ใหม่** (`/warnyin:fastlane`) — policy (`triage.md`) · stage playbook 4 ไฟล์ · router (`next.md`) · template `receipt.md` · registry 3 ไฟล์ — โดย **แก้ไฟล์เดิม 8 ไฟล์** ใต้ `src/` เท่านั้น ไม่สร้างไฟล์ใหม่

> **ห้ามอ่าน/ห้ามรอ `fastlane.md`** (ของ task `fastlane-playbook`) — ทุกข้อความที่ต้องเขียนอยู่ใน `design.md §4` contract C12-C18 แล้ว **คำต่อคำ**

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: **ไม่มี** — wave 1 (ขนานกับ `tasks/fastlane-playbook/` เพราะไฟล์ที่แตะไม่ทับกันเลย: task นั้นสร้างไฟล์ใหม่ 2 ไฟล์, task นี้แก้ไฟล์เดิม 8 ไฟล์)
- ปลดล็อกให้: `tasks/fastlane-test-release/` (wave 2)
- ส่ง output อะไรต่อให้ task ถัดไป: ไฟล์เดิม 8 ไฟล์ที่ถูก wire แล้ว → task 3 เขียน test assert canonical/anchor/consistency ทับ

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)

- [ ] 1. `src/.warnyin/workflow/triage.md` — C15 (บรรทัด executor ใต้ตาราง skip-list) + C16 (row SHIP) — _ผลลัพธ์:_ policy รู้จัก executor + hard-floor override
- [ ] 2. `src/.warnyin/workflow/stages/{build,verify,ship}.md` — C12 (pointer wording) — _ขึ้นกับ 1 (ต้องรู้ว่า policy รับ executor แล้ว):_ hook 3 ไฟล์ยอมรับ tier fast ที่มาจาก fastlane
- [ ] 3. `src/.warnyin/workflow/stages/ship.md` — C16 (เงื่อนไข hard-floor เดียวกับ triage row SHIP) — _ขึ้นกับ 1 (wording ต้องตรงกัน)_
- [ ] 4. `src/.warnyin/workflow/stages/design.md` — C13 (ต่อท้าย step 1.5 fast-track path — **คนละ shape กับข้อ 2 ห้ามเดา**)
- [ ] 5. `src/.warnyin/workflow/next.md` — C14 (row `fast-track` → route resume)
- [ ] 6. `src/.warnyin/template/stages/receipt.md` — meta row: เพิ่ม `base` (git SHA) + Hard-floor row รองรับ `override โดย user`
- [ ] 7. `src/.warnyin/workflow/README.md` + `src/.warnyin/installer/templates/{CLAUDE.md,codebuddy-rules.md}` — C17 (registry 3 ไฟล์ ใช้ description C4 คำต่อคำ)
- [ ] 8. เช็คปิดท้าย: markdown-link ที่เพิ่มทุกอันต้อง resolve ได้ (`node src/scripts/lint-md.mjs` หรือ npm script ที่มี) + heading/anchor เดิมไม่เปลี่ยนสักตัว

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

> **C18 — ห้ามแตะ root `.warnyin/`, `.claude/`, `CLAUDE.md`** (dogfood **gitignored** — แก้แล้วงานหายไม่ติด commit; `docs/rule.md:79`) · แก้ **เฉพาะใต้ `src/`** เท่านั้น · เช็คด้วย `git check-ignore <file>` ก่อนแก้ถ้าไม่มั่นใจ

| # | ไฟล์ (ทั้งหมด prefix `src/`) | บรรทัดอ้างอิง (ณ วันเขียน) | ทำอะไร |
|---|---|---|---|
| 1 | `src/.warnyin/workflow/triage.md` | **หลังบรรทัด 75** (ท้ายตาราง skip-list ก่อน `---` บรรทัด 77) | **แทรกบรรทัดใหม่ — ข้อความคำต่อคำอยู่ที่ `design.md` §4.1** (อยู่ใน fenced block เพราะมี markdown-link)<br>เว้นบรรทัดว่างคั่นจากตาราง · **ห้ามแก้ 4 row เดิม** · **ห้ามเปลี่ยน heading `## Fast-track skip-list` (บรรทัด 66)** — anchor `#fast-track-skip-list` ถูกอ้าง 5 ไฟล์ |
| 2 | `src/.warnyin/workflow/triage.md` | **บรรทัด 75** (row SHIP คอลัมน์ "คงไว้") | **C16** — เดิม `hard-floor scan ผ่าน (เจอ → upgrade ตาม §2B ห้าม ship-lite)` → ใหม่ต้องสื่อคำต่อคำว่า:<br>``เจอ → ห้าม ship-lite **เว้นแต่** receipt meta ระบุ `override โดย user` (fastlane §2 — user ยืนยันเอง)``<br>ส่วนที่เหลือของ row (receipt ครบทุก section + archive ครบ) คงเดิม |
| 3 | `src/.warnyin/workflow/stages/build.md` | **บรรทัด 14** | **C12** — แทน ``(จาก `/warnyin:triage`)`` ด้วย ``(จาก `/warnyin:triage` หรือ `/warnyin:fastlane`)`` — **ห้ามแตะส่วนอื่นของบรรทัด** |
| 4 | `src/.warnyin/workflow/stages/verify.md` | **บรรทัด 14** | **C12** — เหมือนข้อ 3 |
| 5 | `src/.warnyin/workflow/stages/ship.md` | **บรรทัด 17** | **C12** — เหมือนข้อ 3 · **และ C16** ในบรรทัดเดียวกัน: เดิม `เจอ → ห้าม ship-lite ต้อง upgrade ตาม triage §2B` → ใหม่ตามข้อ 2 (wording เดียวกับ triage row SHIP **เป๊ะ**) |
| 6 | `src/.warnyin/workflow/stages/design.md` | **ต่อท้าย step 1.5 fast-track path — หลังบรรทัด 65** | **C13** — เพิ่มบรรทัดใหม่ (คำต่อคำ):<br>``> งาน fast ทั้งเส้นรันจบได้ด้วย `/warnyin:fastlane` (executor) — command นี้ใช้เมื่อต้องการ pre-flight แยก/escalate``<br>**ห้ามแก้บรรทัด 65 เดิม** (ยังคง link `[fast-track skip-list](../triage.md#fast-track-skip-list)` ครบ) |
| 7 | `src/.warnyin/workflow/next.md` | **บรรทัด 29** (row `fast-track` คอลัมน์ "ขั้นถัดไป") | **C14** — แทน route เดิมด้วย:<br>``receipt §3/§4 ยังไม่เติม → `/warnyin:fastlane <slug>` (resume); เติมครบทุก section → `/warnyin:ship``` |
| 8 | `src/.warnyin/template/stages/receipt.md` | **บรรทัด 11** + เพิ่ม 1 row ในตาราง meta | **base row:** เพิ่ม `| **Base** | \`<git SHA ตอน pre-flight>\` |` (ใช้เทียบ `git diff <base>` ตอนเติม §3)<br>**Hard-floor row:** เพิ่มตัวเลือกที่ 3 — นอกจาก "ผ่าน" / "แตะหมวด X → upgrade" ต้องรองรับ ``แตะหมวด X → `override โดย user```(ค่านี้เท่านั้นที่ ship-lite ยอม ship ตาม C16) |
| 9 | `src/.warnyin/workflow/README.md` | **หลังบรรทัด 44** (ใน capability tree — ใต้ `triage.md`) | **C17** — เพิ่ม 1 บรรทัดใน code-fence โครงสร้าง คง alignment คอลัมน์ comment เดิม:<br>`    fastlane.md        #   capability: FASTLANE — executor ของ fast tier (บังคับ tier=fast; รัน pre-flight → code-first → gate → receipt → ship-lite จบในคำสั่งเดียว)` |
| 10 | `src/.warnyin/installer/templates/CLAUDE.md` | **หลังบรรทัด 18** (ใต้ `/warnyin:triage`) | **C17** — เพิ่ม 1 บรรทัด ใช้ **description C4 คำต่อคำ**:<br>``- `/warnyin:fastlane [slug] [คำอธิบาย change]` → รันงานขนาด fast จบในคำสั่งเดียว — บังคับ tier=fast: แก้โค้ดจน test เขียว + acceptance ผ่าน → receipt → ship-lite + archive (`.warnyin/workflow/fastlane.md`)`` |
| 11 | `src/.warnyin/installer/templates/codebuddy-rules.md` | **หลังบรรทัด 26** (ใต้ `/warnyin:triage`) | **C17** — เพิ่ม 1 บรรทัด **description C4 คำต่อคำ** (ไฟล์นี้ไม่ใส่ path playbook ตาม pattern เดิม):<br>``- `/warnyin:fastlane [slug] [คำอธิบาย change]` → รันงานขนาด fast จบในคำสั่งเดียว — บังคับ tier=fast: แก้โค้ดจน test เขียว + acceptance ผ่าน → receipt → ship-lite + archive`` |

> **บรรทัดเป็น "จุดอ้างอิง" ไม่ใช่ "กฎเหล็ก"** — ถ้าเลขไม่ตรง (ไฟล์ถูกแก้ระหว่างทาง) ให้หา **ข้อความเดิม** ที่ระบุในคอลัมน์ "ทำอะไร" แล้วแก้ตรงนั้น (investigate-before-edit) — ห้ามแก้มั่วตามเลขบรรทัด

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] 8 ไฟล์ใต้ `src/` ถูกแก้ครบตามตาราง §4 — **ไม่มีไฟล์ใหม่, ไม่แตะ root `.warnyin/` / `.claude/` / `CLAUDE.md`** (`git status` ต้องไม่โผล่ path เหล่านี้)
- [ ] ทุกข้อความที่เพิ่ม/แทน **ตรงคำต่อคำกับ `design.md §4` (C12-C17)** — ห้าม paraphrase (test ของ task 3 จะ diff)
- [ ] heading `## Fast-track skip-list` (`triage.md`) และ heading/anchor อื่นทั้งหมด **ไม่ถูกเปลี่ยน**; link `#fast-track-skip-list` ทั้ง 5 จุดยัง resolve ได้
- [ ] `/warnyin:triage` ยัง **read-only** — ไม่มีการเพิ่ม write-intent / auto-execute (`triage.md §4` ข้อ 1 + "แนะนำแล้วหยุด" คงอยู่ครบ)
- [ ] ผ่าน test ตาม `spec.md` (test-flow) — รวม regression 4 stage ไฟล์
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Contract คำต่อคำ (แหล่งเดียว): `../../design.md` §4 (C12-C18)
