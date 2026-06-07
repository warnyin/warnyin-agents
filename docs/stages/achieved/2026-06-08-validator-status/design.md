# Design (How) — Structural validator + status script

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end

## 1. ภาพรวมสถาปัตยกรรม
- **component:** installer/dev-tooling (`docs/techstack/installer/` — zero-dep lint-gate convention) + workflow payload (`src/.warnyin/workflow/`)
- **แนวทางหลัก:** script เดียวใน payload ตาม pattern `lint-md.mjs` (pure fn + injectable IO + main-guard) — **structural เท่านั้น, semantic เป็นของ model** (gate เดิมไม่หาย แค่ส่วนโครงให้ script ทำ):

```
node .warnyin/workflow/scripts/validate-topic.mjs            → STATUS: ตารางทุก topic (exit 0 เสมอ)
node .warnyin/workflow/scripts/validate-topic.mjs <slug>     → VALIDATE: ✖ error / ⚠ warn (exit 1 เมื่อมี ✖)

ผู้เรียก: /warnyin:next (pre-scan) · DESIGN gate (หลังเขียนไฟล์ task) · SHIP step 1 (ก่อน promote)
```

## 2. Vertical slices

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **validator ใช้งานได้จริง** — script 2 โหมดรันได้ในทุกโปรเจกต์ที่ติดตั้ง + พิสูจน์ด้วย unit | script (payload) → unit test → gate (test/lint/pack) | `tasks/validator-script/` |
| 2 | **workflow เรียกใช้จริง 3 จุด** — next/DESIGN/SHIP ชี้ script แบบบาง | playbook 3 ไฟล์ → command mirror → CHANGELOG | `tasks/playbook-wiring/` |

## 3. Data model / schema (โครงไฟล์)

**ไฟล์ใหม่:**
| ไฟล์ | บทบาท |
|---|---|
| `src/.warnyin/workflow/scripts/validate-topic.mjs` | script เดียว 2 โหมด (§4.1-4.3) |
| `src/tests/validate-topic.test.mjs` | unit — feed fake file map เข้า pure fn (ไม่แตะ fs) + เคส executable บน fixture ใน temp |

**ไฟล์แก้ (unify-in-place):**
| ไฟล์ | จุดแก้ |
|---|---|
| `src/.warnyin/workflow/next.md` | §2 เพิ่ม step 0: รัน script โหมด status เป็น structural pre-scan (ถ้ารัน node ได้) แล้วใช้ model ตัดสิน semantic ต่อ — ตาราง heuristic เดิมคงไว้ (fallback เครื่องที่รัน script ไม่ได้) |
| `src/.warnyin/workflow/stages/design.md` | §8 **ขยาย gate item เดิม** "ทุก task มี `spec.md` + `standard.md` + `rule.md` + `task.md` ครบ" → เติม "(เช็คโครงด้วย `node .warnyin/workflow/scripts/validate-topic.mjs <slug>` ได้)" |
| `src/.warnyin/workflow/stages/ship.md` | §4 **ขยาย step 1 เดิม** (อ่านทำความเข้าใจ+เช็ค VERIFY ผ่าน) → เติมรัน validate `<slug>` ก่อน — โครงขาด (✖) ต้องแก้ก่อน promote |
| `src/.claude/commands/warnyin/{next,design,ship}.md` | mirror บาง — pointer 1 บรรทัดต่อไฟล์ ชี้ playbook (ไม่ duplicate รายการเช็ค) |
| `CHANGELOG.md` | entry `[Unreleased]` (payload + script ใหม่) |

**ไม่แตะ:** `src/bin/cli.mjs` (CORE ครอบ `.warnyin/workflow` ทั้งก้อน) · `verify-pack.mjs` (allowlist `src/.warnyin/` ครอบ — precedent `build-wave.mjs`) · `src/.claude/skills/next/SKILL.md` (body ชี้ playbook อยู่แล้ว ไม่ duplicate)

## 4. Interface / contract — **canonical (ทุก task copy จากที่นี่ ห้ามแต่งใหม่)**

### 4.1 CLI contract
| โหมด | คำสั่ง | output | exit |
|---|---|---|---|
| **status** | `node .warnyin/workflow/scripts/validate-topic.mjs` | ตารางทุก active topic: `slug · stage (ประมาณการ) · ✖N/⚠N`; ไม่มี topic → "ไม่มีงานค้าง" | `0` เสมอ (status เป็นรายงาน ไม่ใช่ gate) |
| **validate** | `node .warnyin/workflow/scripts/validate-topic.mjs <slug>` | รายการ `✖ [C2] <จุดที่ขาด>` / `⚠ [C1] <เตือน>` ละเอียด (มี code กำกับ); ครบ → `✓` | `1` เมื่อมี ✖ ≥1 · `0` เมื่อมีแค่ ⚠/สะอาด · `2` slug ไม่ถูกต้อง/ไม่พบ topic |
- ทำงานจาก **cwd ของโปรเจกต์ปลายทาง** (หา `docs/stages/` จาก cwd — เหมือน lint-md ใช้ `process.cwd()`)
- **slug sanitize (Security B1):** รับ slug จาก argv แล้ว **whitelist ด้วย `readdirSync('docs/stages/')`** — slug ต้องตรง basename ของ dir ที่มีอยู่จริง (ไม่เอา arg ไปต่อ path ตรงๆ); ไม่ match (รวม `../`, path แปลก) → exit 2 "ไม่พบ topic" — กัน path traversal
- arg ผิดรูป/เกิน 1 ตัว → exit 2

### 4.2 เช็คที่ทำ (structural เท่านั้น — ตาม roadmap #14, ห้ามเพิ่มเอง)
> **หลักการแยกระดับ (panel SA-B1/B2 · TechLead-B1/B2 · QA-B2):** เช็คระดับ **✖ ต้องไม่พึ่ง "filled detection"** (existence/structure ล้วน — deterministic แน่นอน) · เช็คที่พึ่งการเดาว่า artifact "เติมแล้วหรือยัง" เป็น **⚠ best-effort** (heuristic หยาบ ยอมรับ false ได้ ไม่ block)

| กลุ่ม | เช็ค | ระดับ | พึ่ง filled? |
|---|---|---|---|
| C2 tasks | ทุกโฟลเดอร์ใน `tasks/` (ข้าม `[...]`) มีครบ 4 ไฟล์ `spec.md` `standard.md` `rule.md` `task.md` | ✖ | ไม่ (existence) |
| C3 ship data | **เฉพาะเมื่อ `ship.md` เริ่มเติมแล้ว** (H1 ไม่มี `<...>`) → ต้องมี section `## 3. Learned rules` + **≥1 data row จริง** (ไม่ใช่ header/separator/row ว่าง) | ✖ | บาง (เฉพาะ trigger ด้วย H1) |
| C5 feature spec format | `docs/features/*/spec.md` (เฉพาะที่มีไฟล์): มี `## Requirement:` ≥1 · ทุก Requirement มี `### Scenario:` ≥1 · ทุก Scenario มี GIVEN+WHEN+THEN ครบ (case-insensitive, ไม่ enforce order) | ✖ | ไม่ (structure) |
| C1 artifact ลำดับ | artifact ที่ "เริ่มเติม" ข้าม stage ก่อนหน้า (เช่น build.md เริ่มเติมแต่ design.md ยัง template) — เทียบตาราง §4.5 | ⚠ | ใช่ (heuristic) |
| C4 spec delta | `design.md` ที่เริ่มเติมแล้ว มี section `Spec delta` (หรือ `ไม่มี delta`) | ⚠ | ใช่ + backward compat |

- **filled heuristic (ใช้กับ ⚠ เท่านั้น):** "เริ่มเติม" = **H1 (บรรทัดแรก) ไม่มี placeholder `<...>`** (regex `/<[^>]+>/` บน H1) — ทุก template artifact มี `— <ชื่อ...>` ที่ H1; แก้ heading = ขั้นแรกที่ทุกคนทำ จึงเป็น signal "เริ่มแตะ" ที่หยาบแต่พอสำหรับ ⚠. **ไม่ใช้ const FILLED_MARKERS list** (panel: เปราะ ไม่ครบ template จริง — `design.md` มี `<ชื่อ>`/`<feature-name>` ที่ list 4 ตัวไม่ครอบ)
- **C3 ใช้ filled-trigger แก้ chicken-egg (QA-B2):** topic ที่ `ship.md` ยัง template (H1 มี `<ชื่อ topic>`) → C3 **ข้าม** (ไม่ ✖) — validator รันกับ topic ตัวเองตอน DESIGN ไม่ false-fail; ยิง ✖ เฉพาะเมื่อเริ่มเขียน ship แล้วแต่ไม่มี data row
- semantic (เนื้อหาถูก, claim ตรง source, delta ตรง code) = **หน้าที่ model ตาม gate เดิม** — script ไม่แตะ

### 4.3 stage → artifact (canonical สำหรับ C1 + stage inference — panel SA-B2/TechLead)
> required = ต้องมีถึงจะนับว่าผ่าน stage · optional = ข้ามได้ปกติ (ไม่ count เป็น "ข้าม stage")

| ลำดับ | stage | artifact "เริ่มเติม" ที่บ่งชี้ | required/optional |
|---|---|---|---|
| 1 | Discovery | `discovery.md`, `research.md` | optional (ข้าม Discovery ได้) |
| 2 | DESIGN | `proposal.md`, `design.md` | **required** · `business.md` optional |
| 3 | DESIGN-tasks | `tasks/<x>/` ≥1 | required (ถ้าถึง BUILD) |
| 4 | BUILD | `build.md` | required (ถ้าถึง VERIFY) |
| 5 | VERIFY | `verify.md` (+`test.md`) | required (ถ้าถึง SHIP) · ขาดตัวใดตัวหนึ่งใน VERIFY = ⚠ |
| 6 | SHIP | `ship.md` (data) | required ตอนปิด |
- stage ปัจจุบัน = stage สูงสุดที่มี artifact "เริ่มเติม"; **C1 ⚠** = มี artifact ของ stage N เริ่มเติม แต่ required ของ stage < N ยัง template (ข้ามลำดับ)
- optional artifact ขาด = ไม่ count (กัน false-fail topic ที่ข้าม business.md/Discovery ปกติ)

### 4.4 โครงโค้ด (pattern `lint-md.mjs` — zero-dep lint-gate convention `docs/rule.md` §2)
```js
// error/warning เป็น object มี code (SA-S1): {code:'C2', level:'error', msg:'tasks/foo ขาด rule.md'}
export function checkTopic(files)            // pure: Map<relPath,content> ของ topic เดียว → {issues:[{code,level,msg}], stage}
export function checkFeatureSpec(name, content) // pure: ชื่อ+เนื้อหา spec.md → issues[] (C5)
// main(): walk docs/stages/ (ข้าม achieved/, context.md) + docs/features/*/spec.md → เรียก pure fn → print/exit
// main-guard: argv[1] comparison (ไม่ใช่ import.meta.main)
```
- **security invariant (pin — Security S1/S2/S3):** ใช้เฉพาะ `node:fs`/`node:path`/`node:url` — **ไม่มี `child_process`/network/write fs**; output รายงาน **structural เท่านั้น** (ชื่อไฟล์/section/code ที่ขาด — **ห้าม echo เนื้อ artifact** กัน sensitive content รั่วลง CI log); อ่านไฟล์มี guard ENOENT/EACCES → exit สะอาด ไม่พ่น absolute path ของ target
- unit feed `Map` ปลอม — ไม่แตะ fs จริง (BL-4 testable แบบ `checkFiles`/`checkLinks`); error มี `code` → test assert structured ไม่ใช่ regex string (SA-S1)
- ภาษา output ไทย + สัญลักษณ์ `✓`/`✖`/`⚠` ตามสไตล์ script เดิม

### 4.5 wording ของ wiring (copy ตรง — บาง ไม่ duplicate รายการเช็ค · node-guard ทุกจุด — Infra-S1)
- **next.md** step 0: "ถ้ารัน node ได้ → รัน `node .warnyin/workflow/scripts/validate-topic.mjs` (โหมด status) เป็น structural pre-scan ก่อน แล้วค่อยอ่านเชิง semantic เฉพาะจุดที่ต้องตัดสิน — เครื่องที่รันไม่ได้ ใช้ตาราง heuristic ด้านล่างเหมือนเดิม"
- **design.md §8** (ต่อท้าย gate item เดิมข้อ task ครบ): "(ถ้ารัน node ได้: `node .warnyin/workflow/scripts/validate-topic.mjs <slug>` ควรไม่มี ✖ — เช็คโครง ไม่แทนการอ่าน semantic)"
- **ship.md §4 step 1** (ต่อท้าย): "ถ้ารัน node ได้ → รัน `node .warnyin/workflow/scripts/validate-topic.mjs <slug>` — มี ✖ ควรแก้ก่อน promote (script เช็คโครง; ความถูกของเนื้อหายังเป็นหน้าที่ผู้ ship)"

## 5. Flow
- **data-flow:** `docs/stages/<slug>/**` + `docs/features/*/spec.md` → pure fn → errors/warnings/stage → stdout (+exit code ที่ AI/CI อ่านได้)
- **user-flow:** ไม่มีรอบถามเพิ่ม — AI เรียก script เองตามจุด wiring; user เห็นผลในรายงานของ stage เดิม

## 6. ผลกระทบต่อระบบเดิม
- **backward compatible:** topic เก่า/format เก่า → C4 เป็น ⚠ ไม่ fail; เครื่องไม่มี node ที่รัน script ได้ → playbook คง fallback (ตาราง heuristic ใน next.md, gate checklist เดิม)
- ไม่มี breaking ต่อ installer/test/pack — path ใหม่อยู่ใต้ prefix ที่ allowlist+CORE ครอบแล้ว
- จุดระวัง: filled heuristic (H1 placeholder) เป็น signal หยาบ — ใช้กับ ⚠ เท่านั้น ไม่กระทบ ✖ (existence/structure); ถ้า template เปลี่ยนโครง H1 ในอนาคต กระทบแค่ความแม่นของ stage inference (⚠) ไม่ทำ gate พัง

## 7. Dependency ระหว่าง slice/task

```
validator-script ──▶ playbook-wiring   (wiring อ้างชื่อ/CLI contract ของ script ที่มีจริง)
```
- wave 1: `validator-script` · wave 2: `playbook-wiring`

## 8. Test strategy ระดับ design
- **unit pure fn (`validate-topic.test.mjs`, feed Map ปลอม — ไม่แตะ fs):** positive+negative ต่อเช็ค (QA-S1) —
  - C2: tasks ครบ 4 ไฟล์ (✓) · ขาด rule.md (✖) · `tasks/` ว่าง/ไม่มี dir (ไม่ crash ไม่ false-fail) · โฟลเดอร์ `[task-name]` ถูก skip
  - C3: ship.md ยัง template H1 placeholder → ข้าม (chicken-egg) · เริ่มเติมแต่มีแค่ header ตาราง → ✖ · มี data row จริง → ✓
  - C5: Requirement ไม่มี Scenario → ✖ · Scenario ขาด WHEN → ✖ · ครบ (case-insensitive) → ✓
  - C1/C4 (⚠): design ไม่มี Spec delta → ⚠ · build.md เริ่มเติมแต่ design ยัง template → ⚠ (ข้าม stage)
  - stage inference: topic ทุกไฟล์ template → stage ต่ำสุด/ไม่ crash · artifact filled ผสม → stage ถูก
  - error object มี `code` → assert structured (ไม่ regex string output)
- **executable (spawn ใน temp — pattern `makeTempProject`/`runCli` จาก installer.test):** slug ไม่ถูกต้อง/`../` → exit 2 (path traversal guard) · fixture topic ขาดไฟล์ → exit 1 · status หลาย topic (1 สะอาด 1 ✖) → ตารางรวมถูก + exit 0 · skip `achieved/`+`context.md`
- gate เดิม: `npm test` (26→~35) + `lint:md` + `verify:pack` (script ใหม่ติด tarball)
- VERIFY ของ topic: เทียบผล status mode กับสถานะจริงของ repo · **self-validate เป็น proof ของ slice 1 ตอน VERIFY** (artifact ของ topic ครบแล้ว — ไม่ใช่ตอน DESIGN gate ที่ ship.md ยัง template; QA-B2) · feature `topic-validator` รอบนี้ = **establish baseline** (สร้าง spec ใหม่จาก ADDED — ยังไม่มี regression เพราะเป็น feature ใหม่; QA-B3) · regression เทียบ `docs/features/spec-delta/spec.md` (ใช้ validator เช็ค format spec ตัวเอง = dogfood)

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> พฤติกรรมที่ change นี้ เพิ่ม/แก้/ลบ — SHIP จะ merge ตามนี้แบบกึ่ง mechanical
> **feature ใหม่ `topic-validator`** → SHIP สร้าง `docs/features/topic-validator/spec.md` จาก ADDED ทั้งก้อน

### ADDED
#### Requirement: script validator อยู่ใน payload (→ feature: topic-validator)
ติดตั้ง workflow แล้ว target มี `.warnyin/workflow/scripts/validate-topic.mjs` พร้อมใช้
##### Scenario: ติดตั้งแล้วรันได้
- GIVEN โปรเจกต์ที่ติดตั้งผ่าน installer
- WHEN รัน `node .warnyin/workflow/scripts/validate-topic.mjs`
- THEN ได้ตาราง status (หรือ "ไม่มีงานค้าง") + exit 0

#### Requirement: โหมด validate จับโครงขาดเป็น error (→ feature: topic-validator)
ใส่ `<slug>` แล้ว script รายงาน ✖ ต่อจุดที่ขาดระดับ structural (task ไม่ครบ 4 ไฟล์ / ship เริ่มเขียนแต่ไม่มี data row learned-rules / feature spec ผิดโครง) และ exit 1
##### Scenario: task ขาดไฟล์
- GIVEN topic ที่ `tasks/<task>/` ไม่มี `rule.md`
- WHEN รัน validate `<slug>`
- THEN มีบรรทัด `✖ [C2]` ระบุไฟล์ที่ขาด + exit 1
##### Scenario: ship เริ่มเขียนแต่ตาราง learned-rules ไม่มี data row
- GIVEN topic ที่ `ship.md` แก้ H1 แล้ว (ไม่ใช่ template) แต่ section "Learned rules" มีแค่ header ตาราง ไม่มีแถวข้อมูล
- WHEN รัน validate `<slug>`
- THEN ได้ `✖ [C3]` + exit 1
##### Scenario: slug ไม่ถูกต้องหรือ path traversal
- GIVEN arg เป็น slug ที่ไม่ตรง dir ใน `docs/stages/` (รวม `../..`)
- WHEN รัน validate ด้วย arg นั้น
- THEN exit 2 "ไม่พบ topic" — ไม่อ่านไฟล์นอก `docs/stages/`

#### Requirement: เช็คที่พึ่งการเดา "เติมแล้ว" เป็น warning ไม่ใช่ error (→ feature: topic-validator)
เช็คที่ผูก filled-heuristic (artifact ข้าม stage = C1, Spec delta = C4) เป็น ⚠ — ไม่ทำให้ topic เก่า/topic ที่ design ตัวเองยังรันอยู่ fail
##### Scenario: design เก่าไม่มี Spec delta
- GIVEN topic ที่ `design.md` เริ่มเติมแล้วแต่ไม่มี section "Spec delta"
- WHEN รัน validate `<slug>`
- THEN ได้ `⚠ [C4]` (ไม่ใช่ `✖`) + exit 0 (ถ้าไม่มี ✖ อื่น)
##### Scenario: artifact ข้าม stage
- GIVEN topic ที่ `build.md` เริ่มเติมแล้วแต่ `design.md` (required ของ stage ก่อน) ยังเป็น template
- WHEN รัน validate `<slug>`
- THEN ได้ `⚠ [C1]` (ข้ามลำดับ) + exit 0 (ถ้าไม่มี ✖ อื่น)

#### Requirement: playbook เรียก validator 3 จุด (→ feature: topic-validator)
next/DESIGN gate/SHIP step 1 อ้างคำสั่ง validator แบบบาง (ชี้ script — รายการเช็คอยู่ใน script เดียว)
##### Scenario: จุด wiring ครบ
- GIVEN payload ที่ติดตั้งแล้ว
- WHEN grep `validate-topic.mjs` ใน `.warnyin/workflow/`
- THEN พบใน `next.md` + `stages/design.md` (§8) + `stages/ship.md` (§4) — 3 ไฟล์

### MODIFIED
(ไม่มี)

### REMOVED
(ไม่มี)

---

## Design review (panel 5 role — 2026-06-07)

fan-out reviewer ขนาน read-only: SA / Tech Lead / QA / Security / Infra

**Blockers ที่พบ + การแก้ (ปิดครบ):**
| # | Role | Blocker | แก้แล้วที่ |
|---|---|---|---|
| B1 | SA + TechLead | FILLED_MARKERS (const 4 ตัว) ไม่ครอบ placeholder จริงของ template + heading-edit-first ทำทั้งไฟล์นับว่า "เติม" → stage inference/C1 false | §4.2 เปลี่ยนเป็น H1-placeholder heuristic + **demote C1 เป็น ⚠** (✖ checks ไม่พึ่ง filled แล้ว) |
| B2 | SA | C1 ขาดนิยาม stage sequence + required/optional (business/discovery optional → false-fail) | §4.3 เพิ่มตาราง canonical stage→artifact + required/optional |
| B3 | TechLead | C3 gate ลวง — header ตาราง 4 คอลัมน์มีใน template เปล่าเสมอ → ผ่านฟรี | §4.2 C3 เช็ค **≥1 data row จริง** (ไม่ใช่ header) |
| B4 | QA | self-validate chicken-egg ตอน DESIGN gate (ship.md ยัง template → C3 fail topic ตัวเอง) | §4.2 C3 filled-trigger (ship.md ยัง template → ข้าม) + §8 self-validate เป็น proof ตอน VERIFY |
| B5 | QA | §9 ขาด scenario คุม C1/C3/exit2 | §9 เพิ่ม 4 scenario (ship no-data-row, slug invalid, artifact ข้าม stage, ...) |
| B6 | QA | baseline `topic-validator` ยังไม่มี → "regression" กำกวมรอบแรก | §8 ระบุรอบนี้ = establish baseline (feature ใหม่) |
| B7 | Security | slug arg → path traversal (design เงียบเรื่อง sanitize) | §4.1 whitelist slug จาก `readdirSync('docs/stages/')` + exit 2 |

**Suggestions ที่รับ:** SA-S1 error มี `code` field → structured test (§4.4) · SA-S2/QA case-insensitive GIVEN/WHEN/THEN (§4.2 C5) · Security-S1 pin no-shell/no-egress/no-write invariant (§4.4) · Security-S2 report structural ไม่ dump content (§4.4) · Security-S3 handle ENOENT ไม่ leak path (§4.4) · Infra-S1 node-guard ทุกจุด wiring (§4.5) · Infra-S3/QA skip achieved + edge cases (§8 unit list) · QA-S1 positive+negative ต่อเช็ค (§8)

**Suggestions ที่ไม่รับ + เหตุผล:** TechLead-S3 split wave 1 → ไม่แยก (script+unit เป็นหน่วยเดียว sub-agent ตัวเดียวจบ ตาม precedent lint-md/verify-pack ขนาดใกล้กัน) · Infra-S2 ความสับสน precedent → เป็น note ตอน BUILD ไม่ใช่ design change (packaging proof ใช้ build-wave ถูกแล้ว)

**ผลรวม:** Infra = ไม่มี blocker (packaging claim ยืนยันได้ทั้งหมด); SA×2 + TechLead×2 + QA×3 + Security×1 = แก้ครบใน design นี้แล้ว — ไม่มี blocker ค้าง
