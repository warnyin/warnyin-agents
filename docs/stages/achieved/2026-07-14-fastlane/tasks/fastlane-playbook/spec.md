# Spec — fastlane-playbook

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะ task นี้ — payload เป็น `.md` ล้วน ไม่มี API/UI → ตัดหัวข้อที่ไม่เกี่ยว

## 1. ชนิดของ task
`logic` / `docs` — playbook `.md` = **instruction ที่ agent execute ต่อ** (logic ของ executor) + adapter surface (docs/config)
ไม่มี runtime ใหม่ ไม่มี dependency ใหม่

---

## 2. Contract ที่ต้องยึด (คำต่อคำ จาก `design.md` §4)
| # | สิ่งที่ต้องทำ |
|---|---|
| C1 | สร้าง `src/.warnyin/workflow/fastlane.md` |
| C2 | สร้าง `src/.claude/commands/warnyin/fastlane.md` (= `/warnyin:fastlane`) |
| C3 | heading 5 อันของ `fastlane.md` — **คัดลอกคำต่อคำ** จาก design |
| C4 | `description` (frontmatter) — **คัดลอกคำต่อคำ** จาก design |
| C5 | `argument-hint` — **คัดลอกคำต่อคำ** จาก design |
| C6-C11 | พฤติกรรมที่ playbook ต้อง cover (slug · resume · git posture · hard-floor gate · loop cap · no-test-suite) |
| C18 | ทุก path ใต้ `src/` — ห้ามแตะ root dogfood |

> **ห้ามแต่งคำใหม่** สำหรับ C3/C4/C5 — canonical-copy convention (`docs/rule.md:18`)

## 3. เนื้อหาที่แต่ละ section ต้องมี (ครบ = falsifiable)

**§1 fastlane คืออะไร / ใช้เมื่อไหร่**
- นิยาม: executor ของ fast tier — **บังคับ `tier=fast`** (ข้าม triage) เดิน fast-track skip-list (`triage.md`) ครบ 4 row ในคำสั่งเดียว
- ต่างจาก `triage` (read-only แนะนำแล้วหยุด) · ต่างจาก flow เต็ม (4 command แยก)
- **user-invoked เท่านั้น** (stateful + irreversible → ไม่ auto-invoke)

**§2 Pre-flight (บังคับ — ก่อนแตะโค้ด)**
- **slug (C6):** ระบุ → ใช้ตามนั้น · ไม่ระบุ → ตั้งเอง kebab-case จากคำอธิบาย change แล้ว**บอก user ว่าใช้ slug อะไร**
- **resume (C7):** มี `docs/stages/<slug>/receipt.md` อยู่แล้ว → resume จากจุดที่ค้าง **ห้ามเขียนทับ meta/§1/§2** (กัน goalpost moving) · ไม่มี → สร้างใหม่จาก template
- **hard-floor gate (C9) 2 ชั้น:** สแกน change เทียบหมวด hard-floor ที่ `triage.md §2B` (**ชี้ ไม่ลอกรายชื่อ**) →
  1. เจอ → **เตือนชัด ระบุหมวดที่แตะ** + **หยุดถาม user**: `upgrade เป็น standard (/warnyin:design)` \| `ยืนยันลุย fast ต่อ`
  2. user ยืนยัน → บันทึกหมวด + คำว่า `override โดย user` ลง receipt meta row Hard-floor → ไปต่อ
  3. **ไม่มีทางไปต่อโดยไม่ถาม** (ห้ามผ่านเงียบ)
- **git posture (C8):** อ่าน SHA ปัจจุบันเก็บเป็น `base` ใน meta (read-only ต่อ git) — ไม่ checkout / ไม่สร้าง branch / ไม่ commit
- **เขียน receipt: meta (+`base`) + §1 (≤3 บรรทัด) + §2 acceptance 1-3 ข้อ** — **ก่อนแตะโค้ดเสมอ**

**§3 ลำดับขั้นการทำงาน** — **pointer-per-row** (แต่ละ row ของ skip-list ชี้ row นั้น + section ของ stage playbook ที่เป็นเจ้าของกฎ; **ห้ามลอกเนื้อกฎ ไม่ว่าเป็นตารางหรือ prose**)
| ลำดับ step ที่บังคับ (test assert ลำดับบรรทัด) |
|---|
| 1. pre-flight → **เขียน receipt meta + §1 + §2** |
| 2. **แก้โค้ด** (code-first — main loop แก้เอง ไม่ build-wave ไม่ worktree ไม่ commit) — pointer: `stages/build.md` + `minimalism.md` |
| 3. gate loop (ดู §4) — pointer: `stages/verify.md` + `loop-tuning.md` |
| 4. เติม receipt §3 (จาก `git diff <base>`) · §4 · §5 |
| 5. ship-lite + archive — pointer: `stages/ship.md` |
- step 1 **ต้องมาก่อน** step 2 ในไฟล์ (ordering proxy)

**§4 Gate → ปิดงานได้เมื่อ** (อ้าง gate เดิมของ stage — ไม่ลอกเงื่อนไข)
- full test เขียว (gate ของ `stages/build.md`) **และ** acceptance ใน receipt §2 ผ่านครบ
- **cap 3 รอบ (C10):** แดง/ไม่ผ่าน → แก้วนได้สูงสุด 3 รอบ; ครบ 3 รอบยังไม่เขียว → **หยุด รายงาน user พร้อม log ไม่ ship**
- **ไม่มี test suite (C11):** ห้ามเคลม "เขียว" → บันทึก `ไม่มี test suite` ใน receipt §4 + gate ตกไปที่ acceptance §2 อย่างเดียว + **เสนอ user เพิ่ม test**
- receipt ครบ §1-§5 และ **≤ 40 บรรทัด** (cap ของ `triage.md §2D` — อ้าง ไม่ลอกตัวเลขเป็นกฎใหม่)
- ship-lite ยอม ship เมื่อ hard-floor scan diff ผ่าน **หรือ** meta มี `override โดย user`

**§5 หลักการ**
- fastlane = **ผู้เดิน ไม่ใช่ผู้ตั้งกฎ** — กฎอยู่ที่ canonical เดิม
- acceptance ก่อนแก้ (กัน goalpost moving) · ไม่ลด bar เพื่อให้ผ่าน · escalate ได้กลางทาง (เติม artifact ที่ข้ามไป — topic ไม่เริ่มใหม่) · ไม่แตะ git

## 4. Data-flow
`$ARGUMENTS` → adapter → playbook → `docs/stages/<slug>/receipt.md` (meta+§1+§2 ตอน pre-flight → §3/§4/§5 ตอนจบ) → `docs/stages/achieved/<slug>/` (archive)
git = read-only (อ่าน SHA + `git diff <base>` เท่านั้น)

## 5. User-flow
```
user: /warnyin:fastlane [slug] <change>
  → AI: (ถ้าไม่มี slug) บอก slug ที่ตั้งให้
  → AI: hard-floor scan → [เจอ] เตือน + ถาม → user เลือก → [ยืนยัน] note override
  → AI: receipt meta+§1+§2  ← ก่อนแตะโค้ด
  → AI: แก้โค้ด → test+acceptance (≤3 รอบ) → receipt §3/§4/§5 → ship-lite + archive
```

## 6. Persona
user ที่มีงานเล็ก (1-2 ไฟล์) และรู้อยู่แล้วว่าเล็ก — ไม่อยากสั่ง 4 command; ต้องการ correctness floor เดิมโดยไม่จ่าย ceremony

## 7. Test-flow (falsifiable — node ล้วน cross-platform, **ห้ามใช้ shell grep**)
- [ ] **T1 install proof** — spawn `cli.mjs` ลง `mkdtemp` → target มี `.warnyin/workflow/fastlane.md` **และ** `.claude/commands/warnyin/fastlane.md`
- [ ] **T2 anchor structural** — `readFileSync` `src/.warnyin/workflow/fastlane.md` → มี heading ครบ 5/5 ตรง C3 คำต่อคำ
- [ ] **T3 consistency C4/C5** — frontmatter ของ adapter: `description` ตรง C4 คำต่อคำ · `argument-hint` ตรง C5 คำต่อคำ · body มี `$ARGUMENTS`
- [ ] **T4 adapter บาง (negative)** — adapter **ไม่มี** `](.warnyin/workflow/fastlane.md)` หรือ markdown-link ใดไป playbook (ต้องเป็น backtick) และไม่มีตาราง rubric/skip-list
- [ ] **T5 no-duplication (negative-grep)** — `fastlane.md` **ไม่มี** substring ``pre-flight: สร้าง `receipt.md` จาก template`` (ต้องเจอใน `triage.md` ไฟล์เดียวเมื่อสแกน `src/.warnyin/workflow/` ด้วย `readdirSync`)
- [ ] **T6 no-hard-floor-list (negative)** — `fastlane.md` **ไม่มี** รายชื่อ 5 หมวดแบบเต็ม (ไม่มีทั้ง `auth/authz` + `data migration/schema` + `secret/credential` + `public API/contract` + `security-sensitive` ปรากฏครบในไฟล์เดียว) **และไม่มี** คู่คำ `config-protection` + `investigate-before-edit` พร้อมกัน
- [ ] **T7 ordering** — `indexOf` บรรทัด step "receipt" (meta/§1/§2) **< ** `indexOf` บรรทัด step "แก้โค้ด" ใน `fastlane.md`
- [ ] **T8 link resolve** — ทุก markdown-link ใน `fastlane.md` ชี้ไฟล์ที่มีจริง (`npm run lint:md` เขียว) + มี `[fast-track skip-list](triage.md#fast-track-skip-list)` และ anchor `#fast-track-skip-list` match heading `## Fast-track skip-list` จริงใน `triage.md`
- [ ] **T9 behavior coverage** — `fastlane.md` มีครบ: คำว่า `override โดย user` · ตัวเลข `3 รอบ` · `40 บรรทัด` · `ไม่มี test suite` · `resume` · `base` (git SHA) · pointer `minimalism.md` + `loop-tuning.md`
- [ ] **T10 tool-agnostic (negative)** — ทั้ง 2 ไฟล์ไม่มีชื่อรุ่น/ผลิตภัณฑ์ AI (`docs/rule.md:9`)
- [ ] **T11 scope** — `git status` หลัง build: ไม่มีไฟล์ใหม่/แก้ไข นอก `src/` (ยกเว้น `docs/stages/fastlane/`)
