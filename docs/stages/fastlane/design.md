# Design (How) — fastlane

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> _cap §2D = 120 บรรทัด · ไฟล์นี้เกิน — เหตุผล: change แตะ **policy กลาง** (hard-floor override) จึงต้องตรึง contract คำต่อคำ + Spec delta 2 feature; ตัดแล้วจะเหลือช่องให้ agent เดา (ขัด rule ห้ามเดา)_

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` (payload `.md` ล้วน — ไม่มี runtime ใหม่, zero-dep คงเดิม)
- **แบ่ง ownership (กัน drift):** `triage.md` = **policy** (rubric / hard-floor / caps / skip-list) · `fastlane.md` = **orchestration** (ลำดับ + gate + escalation) · `stages/*.md` = กฎละเอียดของ stage (full-gate, config-protection, investigate-before-edit)
- **★ fastlane.md ห้ามเล่ากฎซ้ำ** — ไม่ว่าเป็นตารางหรือ prose: §3 ต้องเขียนแบบ **pointer-per-row** (ชี้ row ของ skip-list + section ของ stage playbook) และ §4 gate อ้าง gate เดิม ไม่ลอกเงื่อนไข (`docs/rule.md:17,18`)

## 2. Vertical slices
| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | user รัน `/warnyin:fastlane` แล้วได้ flow ครบ (pre-flight → code-first → gate → receipt → ship-lite) | adapter (surface) · playbook (logic) | `tasks/fastlane-playbook/` |
| 2 | policy/stage/registry เดิมรู้จัก executor ใหม่ + override + resume | policy (`triage.md`) · stage 4 ไฟล์ · router (`next.md`) · template receipt · registry 3 ไฟล์ | `tasks/fastlane-wiring/` |
| 3 | พิสูจน์ได้ว่าติดตั้งจริง + canonical ไม่ drift + release hygiene | test · CHANGELOG · version | `tasks/fastlane-test-release/` |

## 3. Data model — receipt lifecycle
"data" ของ fastlane = **`receipt.md`** (template `.warnyin/template/stages/receipt.md`)

| ช่วง | เขียนอะไร | เหตุผล |
|---|---|---|
| pre-flight (**ก่อนแตะโค้ด**) | meta (รวม hard-floor row + `base` = git SHA ปัจจุบัน) + §1 (≤3 บรรทัด) + §2 acceptance 1-3 ข้อ | correctness floor — กัน goalpost moving |
| ระหว่างทาง | **ไม่เขียนไฟล์** — note อยู่ในแชท | เจตนา "ไม่เขียน report ระหว่างทาง" |
| ตอนจบ (ก่อน ship-lite) | §3 ไฟล์ที่แตะ (จาก `git diff <base>`) · §4 ผล test · §5 learned rule | สรุปครั้งเดียว |

- cap `≤ 40 บรรทัด` (`triage.md §2D`) — **เช็คตอนก่อน ship-lite**
- **template ต้องแก้ 1 บรรทัด** (meta row): เพิ่ม `base` + รองรับ override — ดู contract §4

## 4. Interface / contract (คำต่อคำ — task 1/2 อ้างอันนี้ ไม่ต้องรอกัน)
| # | contract | ค่า (ห้ามแปลง) |
|---|---|---|
| C1 | playbook | `src/.warnyin/workflow/fastlane.md` → target `.warnyin/workflow/fastlane.md` |
| C2 | adapter | `src/.claude/commands/warnyin/fastlane.md` → command `/warnyin:fastlane` |
| C3 | anchor ใน `fastlane.md` | `## 1. fastlane คืออะไร / ใช้เมื่อไหร่` · `## 2. Pre-flight (บังคับ — ก่อนแตะโค้ด)` · `## 3. ลำดับขั้นการทำงาน` · `## 4. Gate → ปิดงานได้เมื่อ` · `## 5. หลักการ` |
| C4 | one-line description (adapter frontmatter **และ** registry ทุกไฟล์ — คำต่อคำ) | `รันงานขนาด fast จบในคำสั่งเดียว — บังคับ tier=fast: แก้โค้ดจน test เขียว + acceptance ผ่าน → receipt → ship-lite + archive` |
| C5 | argument-hint | `"[slug] [คำอธิบาย change ที่จะแก้]"` |
| C6 | **slug** | ระบุ slug → ใช้ตามนั้น · ไม่ระบุ → AI ตั้งจากคำอธิบาย change (kebab-case) แล้ว**บอก user ว่าใช้ slug อะไร** |
| C7 | **resume** | `docs/stages/<slug>/receipt.md` มีอยู่แล้ว (filled) → **resume จากจุดที่ค้าง — ห้ามเขียนทับ meta/§1/§2 ที่ประกาศไว้** (กัน goalpost moving); ไม่มี → สร้างใหม่จาก template |
| C8 | **git posture** | แก้บน **working tree / branch ปัจจุบัน** — ไม่ checkout, ไม่สร้าง branch, ไม่ commit เอง (ต่างจาก BUILD เต็มโดยเจตนา: งาน fast = 1-2 ไฟล์); อ่าน SHA ตอน pre-flight เก็บเป็น `base` ใน receipt meta (read-only ต่อ git) |
| C9 | **hard-floor gate** (2 ชั้น) | pre-flight สแกนเจอหมวด → **เตือนชัด + หยุดถาม user**: `upgrade เป็น standard (/warnyin:design)` \| `ยืนยันลุย fast ต่อ` — user ยืนยัน → บันทึกหมวด + คำว่า `override โดย user` ลง receipt meta row Hard-floor → ไปต่อ; **ship-lite ยอม ship ได้เฉพาะเมื่อ meta มี `override โดย user`** (ไม่มี → ห้าม ship-lite ตามเดิม) |
| C10 | **gate loop cap** | test แดง/acceptance ไม่ผ่าน → แก้วนได้ **สูงสุด 3 รอบ**; ครบ 3 รอบยังไม่เขียว → **หยุด รายงาน user พร้อม log** (ไม่ ship) |
| C11 | **ไม่มี test suite ในโปรเจกต์** | ห้ามเคลม "เขียว" — บันทึก `ไม่มี test suite` ใน receipt §4 + gate ตกไปที่ acceptance §2 อย่างเดียว + **เสนอ user เพิ่ม test** |
| C12 | pointer wording ที่ `stages/{build,verify,ship}.md` (แทนของเดิม ``(จาก `/warnyin:triage`)``) | ``(จาก `/warnyin:triage` หรือ `/warnyin:fastlane`)`` |
| C13 | `stages/design.md` **step 1.5 fast-track path** — ต่อท้ายประโยคเดิม | ``> งาน fast ทั้งเส้นรันจบได้ด้วย `/warnyin:fastlane` (executor) — command นี้ใช้เมื่อต้องการ pre-flight แยก/escalate`` |
| C14 | `next.md:29` row `fast-track` — แทน route เดิม | ``receipt §3/§4 ยังไม่เติม → `/warnyin:fastlane <slug>` (resume); เติมครบทุก section → `/warnyin:ship``` |
| C15 | `triage.md` skip-list — **เพิ่มบรรทัดใต้ตาราง** (ไม่แก้ 4 row เดิม, **ห้ามเปลี่ยน heading `## Fast-track skip-list`** — anchor ถูกอ้าง 5 ไฟล์) | ข้อความ: ดู **§4.1** ด้านล่าง (มี markdown-link → ต้องอยู่ใน fenced block ไม่งั้น `lint:md` resolve เทียบ dir ของ `design.md` แล้วแดง) |
| C16 | `triage.md` row SHIP + `stages/ship.md:17` — แก้เงื่อนไข hard-floor | เดิม "เจอ → ห้าม ship-lite" → ใหม่: ``เจอ → ห้าม ship-lite **เว้นแต่** receipt meta ระบุ `override โดย user` (fastlane §2 — user ยืนยันเอง)`` |
| C17 | registry (เพิ่ม 1 บรรทัดต่อไฟล์) | **C4 คำต่อคำ** (user-facing slash-command list): `src/.warnyin/installer/templates/CLAUDE.md` · `src/.warnyin/installer/templates/codebuddy-rules.md` — ส่วน `src/.warnyin/workflow/README.md` เป็น **capability tree** (dev-facing, format `file.md # capability: NAME — …`) → เพิ่ม entry `fastlane.md` แบบเดียวกับ sibling ไม่ใช่ C4 verbatim _(refined ตอน BUILD: contract เดิม lump README เข้า C4-verbatim ผิด convention ของ tree)_ |
| C18 | **path prefix** | ทุกไฟล์ที่แก้ต้องอยู่ใต้ `src/` — **ห้ามแตะ root `.warnyin/`, `.claude/`, `CLAUDE.md`** (dogfood gitignored — `docs/rule.md:79`) |

### 4.1 C15 — ข้อความคำต่อคำ (เขียนใต้ตาราง skip-list ใน `src/.warnyin/workflow/triage.md`)
```markdown
> **ผู้เดิน (executor):** user สั่งทีละ stage command · หรือ `/warnyin:fastlane` เดินครบ 4 row ในคำสั่งเดียว (บังคับ tier=fast) — ดู [fastlane](fastlane.md)
```
> link `fastlane.md` resolve ได้จริงเมื่ออยู่ใน `triage.md` (dir เดียวกัน) — แต่ resolve **ไม่ได้** ถ้าเขียนนอก fenced block ในไฟล์นี้

## 5. Flow
```
/warnyin:fastlane [slug] <change>
  ├─ 1. Pre-flight ─ resume? (C7) ─ hard-floor scan ─┬─ ไม่แตะ ─────────────▶ ต่อ
  │                                                  └─ แตะ ─▶ ⚠ ถาม user (C9) ─┬─ upgrade ─▶ /warnyin:design (จบ)
  │    └─ receipt: meta(+base SHA) + §1 + §2 acceptance   ← ก่อนแตะโค้ดเสมอ    └─ ยืนยัน ─▶ note override ─▶ ต่อ
  ├─ 2. Code-first ─ main loop แก้เอง (ไม่ build-wave / ไม่ worktree / ไม่ commit)
  ├─ 3. Gate loop ── full test + acceptance §2 ─┬─ แดง (≤3 รอบ) ─▶ แก้ ─┘
  │                                             └─ ครบ 3 รอบยังแดง ─▶ หยุด รายงาน user (ไม่ ship)
  ├─ 4. Receipt ──── เติม §3 (git diff base) · §4 · §5 · เช็ค cap ≤40 บรรทัด
  └─ 5. Ship-lite ── hard-floor scan diff (C16) → archive → promote rule จาก §5 (ถ้ามี, user ยืนยัน)
```
- **escalate กลางทาง** (พบว่างานใหญ่กว่าที่คิด) → หยุด เสนอ upgrade: เติม artifact ที่ข้ามไป แล้วเดิน flow เต็ม — topic ไม่ต้องเริ่มใหม่ (`triage.md §2B`)
- **user-invoked เท่านั้น** — stateful + irreversible (เขียนไฟล์/archive) → ห้ามทำเป็น skill auto-invoke (`docs/rule.md:10`)

## 6. ผลกระทบต่อระบบเดิม
- **`/warnyin:triage` ไม่เปลี่ยน** — ยัง read-only + ยัง**ห้ามแนะนำ** fast เมื่อแตะ hard-floor (override เกิดได้เฉพาะเมื่อ user สั่ง fastlane เอง + ยืนยันซ้ำ)
- **hard-floor policy ผ่อนลง 1 ระดับ** (C9/C16) — เป็น behavior change จริง ต้องมี Spec delta + note `docs/rule.md:26` ไว้ promote ตอน SHIP (BUILD ห้ามแตะ rule กลาง)
- `validate-topic.mjs` **ไม่ต้องแก้** — artifact set ของ fastlane = receipt อย่างเดียว → `detectMode()` คืน `fast` ตามเดิม; escalate แล้วเติม proposal/design → `mixed` + ⚠ C6 = พฤติกรรมที่ต้องการอยู่แล้ว
- `cli.mjs` / `verify-pack.mjs` / `lint-md.mjs` / `package.json files` **ไม่ต้องแก้** (copyTree recursive + prefix allowlist ครอบแล้ว)

## 7. Dependency
```
wave 1 (ขนาน):  fastlane-playbook ─┐
                fastlane-wiring   ─┴─▶ wave 2: fastlane-test-release
```
- **critical-path depth:** 2 · **max wave width:** 2
- **ขนานได้เพราะ:** task 2 ไม่ต้องอ่านเนื้อ `fastlane.md` — อ้าง contract §4 (C12-C17 คำต่อคำ); ไฟล์ที่แตะไม่ทับกัน (task 1 สร้างไฟล์ใหม่ 2 ไฟล์ · task 2 แก้ 8 ไฟล์เดิม)
- **task 3 serialize เพราะ:** ต้อง assert ไฟล์จริงของ task 1+2 และ release-hygiene (CHANGELOG/bump/lint) ต้องเป็น wave สุดท้ายเสมอ (`docs/rule.md:23`)

## 8. Test strategy (observable proxy — node ล้วน cross-platform, **ห้ามใช้ shell grep**)
- **install proof:** spawn `cli.mjs` ลง `mkdtemp` → target มี `.warnyin/workflow/fastlane.md` + `.claude/commands/warnyin/fastlane.md`
- **canonical falsifiable (negative-grep ด้วย string เอกลักษณ์):** สแกน `src/.warnyin/workflow/` ด้วย `readdirSync` — ประโยค ``pre-flight: สร้าง `receipt.md` จาก template`` ต้องเจอใน `triage.md` **ไฟล์เดียว**; และ `fastlane.md` ต้อง**ไม่มี** ทั้งรายชื่อ 5 หมวด hard-floor แบบเต็ม และคู่คำ `config-protection` + `investigate-before-edit` (กัน prose-duplication)
- **anchor structural:** ทุก link `#fast-track-skip-list` ต้อง match heading จริงใน `triage.md` (`lint-md` ตัด anchor ทิ้ง → ต้องเช็คเอง)
- **consistency:** C4 ตรงคำต่อคำใน adapter frontmatter ↔ registry 3 ไฟล์
- **ordering proxy (acceptance ก่อนแก้):** ใน `fastlane.md` บรรทัดของ step "เขียน receipt §1+§2" ต้อง **มาก่อน** step "แก้โค้ด"
- **regression:** `stages/{design,build,verify,ship}.md` ยังมี link `[fast-track skip-list](../triage.md#fast-track-skip-list)` ครบ 4/4 + ไม่มีตาราง inline · adapter `triage.md` ยังมี "แนะนำแล้วหยุด" + 0 write-intent · `src/.claude/skills/` ไม่มี `fastlane` · `pass === tests`

## 9. Spec delta

### ADDED
#### Requirement: รันงาน fast จบในคำสั่งเดียวด้วย `/warnyin:fastlane` (→ feature: `fastlane`)
executor ของ fast tier — บังคับ `tier=fast` โดยข้าม triage แล้วเดิน skip-list ครบ 4 row ในคำสั่งเดียว; กฎทั้งหมด reuse canonical ของ `triage.md` (executor ไม่ตั้งกฎใหม่ ไม่ว่าเป็นตารางหรือ prose)

##### Scenario: surface มีจริง + adapter บาง
- GIVEN `src/.claude/commands/warnyin/fastlane.md` และ `src/.warnyin/workflow/fastlane.md`
- WHEN อ่าน adapter
- THEN มี frontmatter `description` + `argument-hint`, ใช้ `$ARGUMENTS`, ชี้ playbook ด้วย inline-code (ไม่ใช่ markdown-link — กัน dead link) และไม่ duplicate ตาราง rubric/skip-list

##### Scenario: executor ไม่ตั้งกฎซ้ำ (canonical เดียว)
- GIVEN `src/.warnyin/workflow/`
- WHEN สแกนหาประโยค ``pre-flight: สร้าง `receipt.md` จาก template``
- THEN เจอใน `triage.md` ไฟล์เดียว — `fastlane.md` มีแต่ markdown-link ไป `[fast-track skip-list](triage.md#fast-track-skip-list)` ที่ resolve ได้ทั้ง path และ anchor

#### Requirement: Pre-flight บังคับก่อนแตะโค้ด — hard-floor gate + acceptance (→ feature: `fastlane`)
ก่อนแก้โค้ดบรรทัดแรก fastlane ต้องสแกน hard-floor 5 หมวดและเขียน `receipt.md` (meta + §1 + §2) เสมอ — เจอ hard-floor → **หยุดถาม user** (upgrade / ยืนยันลุยต่อ); ยืนยัน → บันทึก `override โดย user` ใน meta แล้วไปต่อ (ship-lite ปลายทางยอมรับเฉพาะ receipt ที่มี override นี้)

##### Scenario: acceptance ถูกประกาศก่อนแก้ (กัน goalpost moving)
- GIVEN `fastlane.md` §2 และ §3
- WHEN เทียบลำดับ step
- THEN step "เขียน receipt meta + §1 + §2" อยู่**ก่อน** step "แก้โค้ด" และ resume (C7) ระบุห้ามเขียนทับ §1/§2 เดิม

##### Scenario: hard-floor → ถาม ไม่ผ่านเงียบ
- GIVEN `fastlane.md` §2
- WHEN อ่าน branch hard-floor
- THEN มีครบ 3 องค์ประกอบ: คำเตือนระบุหมวดที่แตะ · ตัวเลือก `upgrade` vs `ยืนยันลุยต่อ` (หยุดรอ user) · การบันทึก `override โดย user` ลง receipt meta — และไม่มีทางที่จะไปต่อโดยไม่ถาม

#### Requirement: Gate ปิดงาน = test เขียว + acceptance ผ่าน + cap รอบแก้ (→ feature: `fastlane`)
วนแก้จน full test เขียว **และ** acceptance ทุกข้อใน receipt §2 ผ่าน จึง ship-lite ได้; แก้ได้สูงสุด 3 รอบ ครบแล้วยังแดง → หยุด รายงาน user (ไม่ ship); โปรเจกต์ที่ไม่มี test suite → ห้ามเคลม "เขียว" ต้องบันทึก `ไม่มี test suite` ใน §4 + เสนอเพิ่ม test; ห้ามลด bar ด้วยการแก้ config/disable test (config-protection ของ BUILD คงอยู่)

##### Scenario: ยังไม่เขียว → ห้าม ship
- GIVEN `fastlane.md` §4
- WHEN อ่าน gate
- THEN มี "full test เขียว" + "acceptance §2 ผ่านครบ" + "receipt ครบ §1-§5 และ ≤40 บรรทัด" + เงื่อนไขหยุดที่นับได้ ("3 รอบ") + สาขา "ไม่มี test suite"

### MODIFIED
#### Requirement: Fast-track ลด ceremony ไม่ลด correctness (canonical skip-list) (→ feature: `change-sizing`)
คงเดิมทุกข้อ (skip-list 4 row + correctness floor + caps §2D + hook ที่ stage ชี้ canonical) **และเพิ่ม:** skip-list ระบุ **ผู้เดิน (executor)** ได้ 2 ทาง — (ก) user สั่งทีละ stage command หรือ (ข) `/warnyin:fastlane` เดินครบ 4 row ในคำสั่งเดียว; hook ที่ `stages/{build,verify,ship}.md` จึงยอมรับ tier fast ที่มาจาก `/warnyin:triage` **หรือ** `/warnyin:fastlane`
_(เดิม: skip-list ไม่ระบุผู้เดิน — สมมุติว่า user รัน 4 command แยกเสมอ)_

#### Requirement: Hard-floor บังคับ ≥ standard (5 หมวด) (→ feature: `change-sizing`)
hard-floor 5 หมวดยังบังคับ ≥ standard เป็น**ค่าตั้งต้น** — `/warnyin:triage` ยัง**ห้ามแนะนำ** `fast` เมื่อแตะหมวดใดหมวดหนึ่ง (ไม่เปลี่ยน) **และเพิ่มข้อยกเว้นเดียว:** user สั่ง `/warnyin:fastlane` เอง + **ยืนยันซ้ำเมื่อถูกเตือน** → ลุย fast ต่อได้ โดยต้องบันทึก `override โดย user` + หมวดที่แตะ ลง receipt meta; ship-lite ยอม ship เฉพาะ receipt ที่มี override นี้ (ไม่มี → ห้าม ship-lite ตามเดิม)
_(เดิม: ห้าม fast ทุกกรณีเมื่อแตะ hard-floor — ไม่มีทาง override)_

### REMOVED
_(ไม่มี — `/warnyin:triage` ยัง read-only "แนะนำแล้วหยุด" ตามเดิม)_

> **นอก spec (แก้ตอน SHIP):** `docs/rule.md:26` (hard-floor "บังคับ ≥ standard เสมอ") + `docs/features/change-sizing/{feature.md:29, business.md:22}` ("ไม่เพิ่ม one-shot/auto-execution") ต้องอัปเดตให้ตรงพฤติกรรมใหม่ — note ไว้ใน `tasks/*/rule.md §2` (BUILD ห้ามแตะ rule กลาง)

---

## Design review (panel — SA · Tech Lead · QA, 2026-07-13)

รีวิวขนาน read-only ตาม `.warnyin/workflow/stages/design.md §4 step 6` — **ทั้ง 3 มุมตีกลับรอบแรก** (blocker ร่วม = hard-floor)

| # | Blocker (ผู้พบ) | แก้ยังไง |
|---|---|---|
| B1 | hard-floor "เตือนแล้วไปต่อ" ขัด canonical 3 จุด (`triage.md:75`, `ship.md:17`, receipt template) + `docs/rule.md:26` → flow ตันที่ ship-lite (SA·TL·QA — พบตรงกัน) | **user ตัดสิน:** gate 2 ชั้น (เตือน → ถาม → ยืนยัน) + บันทึก `override โดย user` → C9/C16 + MODIFIED requirement "Hard-floor" ใน Spec delta + note `rule.md` รอ SHIP |
| B2 | contract ครอบ hook ไม่ครบ — `stages/design.md` ไม่มี string เดิมให้แทน, `next.md` ไม่มี wording เลย → task 2 ต้องเดา (SA·TL) | เพิ่ม C13 (`design.md` step 1.5) + C14 (`next.md:29`) + C15 (`triage.md`) คำต่อคำ; hook แบบ `(จาก /warnyin:triage)` มีจริง **3 ไฟล์** ไม่ใช่ 4 |
| B3 | ไม่มี contract ของ slug / resume / branch → พังกลางทางแล้วกู้ไม่ได้ (SA·TL·QA) | **user ตัดสิน:** C5-C8 — slug optional (derive ได้), receipt เดิม → resume ห้ามทับ §1/§2, ไม่แตะ git (เก็บ base SHA อ่านอย่างเดียว) |
| B4 | path ในไฟล์ task ไม่มี prefix `src/` → agent อาจแก้ root dogfood (gitignored) แล้วงานหาย (TL) | C18 — บังคับ `src/` ทุกจุด + ห้ามแตะ root |
| B5 | gate loop "วนแก้หลายรอบ" ไม่มีขอบเขตนับได้ + "test เขียว" ในโปรเจกต์ที่ไม่มี test suite = false-green (QA) | C10 (cap 3 รอบ) + C11 (ไม่มี suite → ห้ามเคลมเขียว, บันทึก + เสนอเพิ่ม test) |

**Suggestion ที่รับมาแก้:** merge task registry เข้า `fastlane-wiring` (เล็กเกินไป overhead — TL) · §3 ต้องเป็น pointer-per-row กัน prose-duplication + negative-grep string เอกลักษณ์ (SA·QA) · ห้ามเปลี่ยน heading `## Fast-track skip-list` (anchor ถูกอ้าง 5 ไฟล์ — TL) · adapter อ้าง playbook ด้วย backtick ไม่ใช่ markdown-link (`lint-md` resolve relative → dead link — TL) · test ต้องเป็น node ล้วน ห้าม shell `grep` (cross-platform — TL·QA) · anchor ต้องเช็ค structural เอง (`lint-md` ตัด anchor ทิ้ง — QA) · เก็บ base SHA กัน diff ปนงานค้างของ topic อื่น (QA)

**Suggestion ที่รับทราบแต่ไม่ทำรอบนี้:** MIN_PASS — ไม่ bump (เป็น floor ไม่ใช่ยอดจริง; gate ที่ทำงานจริงคือ `pass === tests`) → ระบุเหตุผลใน task 3
