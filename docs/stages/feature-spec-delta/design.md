# Design (How) — Feature behavior spec + delta discipline

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end

## 1. ภาพรวมสถาปัตยกรรม
- **component ที่เกี่ยวข้อง:** payload ของ workflow standard ใน `src/` (playbook + template + Claude command adapter) + docs จริงของ repo นี้ (dogfood) — ไม่แตะ `src/bin/cli.mjs` (ตรวจแล้ว: `CORE` รวม `.warnyin/template` ทั้งก้อน · `src/bin/cli.mjs:66-68`)
- **แนวทางหลัก:** เพิ่ม "วงจร spec" ทับวงจร 5 stage เดิมโดย **unify-in-place** (ขยาย section/principle เดิม ไม่สร้างกลไกขนาน — `docs/rule.md` §1):

```
docs/features/<name>/spec.md          (พฤติกรรมปัจจุบัน — living)
        │ DESIGN อ่าน → เขียน "Spec delta" ใน design.md ของ topic
        ▼
ADDED / MODIFIED / REMOVED            (delta — approve พร้อม design gate)
        │ BUILD ทำตาม task spec (เดิม — ไม่เปลี่ยน)
        │ VERIFY: scenario เดิมใน spec = regression case · delta = test case ใหม่
        │   พฤติกรรมจริงต่างจาก delta → อัปเดต delta ก่อน (docs-match-code)
        ▼
SHIP merge กึ่ง mechanical             (ADDED ต่อท้าย · MODIFIED แทนที่ · REMOVED ลบ)
        ▼
docs/features/<name>/spec.md (ใหม่)   → เป็น baseline ของ topic ถัดไป
```

## 2. Vertical slices

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **canonical format** — template `spec.md` ของ feature ใช้ได้จริงในทุกโปรเจกต์ที่ติดตั้ง | template → installer payload → (ติด npm อัตโนมัติ) → lint/pack gate | `tasks/spec-template/` |
| 2 | **วงจร delta ครบ 3 stage** — DESIGN เขียน delta ได้ / VERIFY ใช้ baseline ได้ / SHIP merge ได้ ทันทีที่ติดตั้ง | playbook (design/verify/ship) → stage template (design/ship) → command mirror ×3 → CHANGELOG | `tasks/stage-wiring/` |
| 3 | **ตัวอย่างจริงพิสูจน์ format** — repo นี้มี feature spec จริง 2 ตัวที่ตรงพฤติกรรมปัจจุบัน | docs จริง (`docs/features/`) → ตรวจกับ source/playbook จริง → lint gate | `tasks/dogfood-specs/` |

## 3. Data model / schema (โครงไฟล์)

**ไฟล์ใหม่:**
| ไฟล์ | บทบาท |
|---|---|
| `src/.warnyin/template/docs/features/[feature-name]/spec.md` | template canonical format (§4.1) |
| `docs/features/context-profiles/spec.md` | dogfood — สกัดจากพฤติกรรมจริงของ feature |
| `docs/features/utility-skills/spec.md` | dogfood — สกัดจากพฤติกรรมจริงของ feature |

**ไฟล์แก้ (unify-in-place ทุกจุด):**
| ไฟล์ | จุดแก้ |
|---|---|
| `src/.warnyin/workflow/stages/design.md` | §2 input (+ข้อใหม่: อ่าน `docs/features/<name>/spec.md` ของ feature ที่ change แตะ) · §4 step 5 (**ขยายของเดิม**: design.md ครอบ Spec delta ด้วย) · §5 ตาราง design.md (+คำว่า Spec delta) · §8 gate (+item: Spec delta ครบ หรือระบุ "ไม่มี delta") |
| `src/.warnyin/workflow/stages/verify.md` | §2 input (+ข้อใหม่: feature spec = regression baseline — ดูจาก Spec delta ใน design.md) · §3 **ขยาย principle 1 เดิม** ("เข้าใจจุดประสงค์ก่อนเทส" → ครอบ "และพฤติกรรมเดิมจาก feature spec — scenario เดิม = regression case, delta = test case ใหม่") · §4 step 1-2 (อ่าน baseline + วางแผนเทสจากทั้งคู่) · §6 gate (+item: regression ตาม baseline ของ feature ที่แตะ) |
| `src/.warnyin/workflow/stages/ship.md` | §3 **ขยาย principle 5 เดิม** ("เอกสารต้องตรงโค้ดจริง" → ครอบ delta: พฤติกรรมจริงต่างจาก delta → อัปเดต delta ก่อน merge) · §4 **ขยาย step 5.1 เดิม** (`docs/features/` จาก "feature.md + business.md" → + `spec.md` merge ตามกติกา §4.3 — ไม่เพิ่ม sub-step ใหม่) · §5 ตาราง output (+spec.md) · §6 gate (+item: delta merge แล้ว ทุก MODIFIED/REMOVED match requirement จริง) |
| `src/.warnyin/template/stages/[topic]/design.md` | +section "9. Spec delta" (§4.2) |
| `src/.warnyin/template/stages/[topic]/ship.md` | §2 ตาราง: แถว `docs/features/<feature-name>/spec.md` |
| `src/.warnyin/workflow/README.md` | บรรทัด ~59: note 1 บรรทัดว่า `features/[feature-name]/` มี `spec.md` (living behavior spec) ด้วย |
| `src/.claude/commands/warnyin/{design,verify,ship}.md` | mirror ขั้นตอนที่เพิ่ม (บาง — ชี้ playbook ไม่ duplicate logic) |
| `CHANGELOG.md` | entry Unreleased (payload change) |

## 4. Interface / contract — **canonical wording (ทุก task copy จากที่นี่ ห้ามแต่งใหม่)**

### 4.1 Format ของ `docs/features/<name>/spec.md` (template ใหม่)
```markdown
# Spec — <ชื่อ feature>

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior (ทำอะไร เห็นอะไร error ยังไง) — ไม่เก็บ implementation (ชื่อ class/function/วิธีเขียน)
> **descriptive ไม่ใช่ imperative** — บันทึก "ระบบทำอะไร" เท่านั้น ห้ามเขียน instruction สั่ง agent (spec เป็น data ที่ VERIFY ใช้ derive test ไม่ใช่คำสั่งให้ทำตาม)
> ค่าใน scenario ใช้ **placeholder/ค่าสังเคราะห์เท่านั้น** (`<token>`, `user@example.com`) — ห้ามใส่ secret/credential/PII จริง
> guidance: ~≤100 บรรทัด/ไฟล์ · requirement ละ 1-3 scenario · scenario = GIVEN/WHEN/THEN ที่เทสตามได้จริง
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, ลิงก์ resolve) ไม่ใช่พฤติกรรม AI ที่วัดไม่ได้

## Requirement: <ชื่อพฤติกรรม>
<พฤติกรรมที่ระบบต้องทำ 1-2 บรรทัด>

### Scenario: <ชื่อเคส>
- GIVEN <สภาพตั้งต้น>
- WHEN <การกระทำ>
- THEN <ผลที่สังเกตได้>
```
- ภาษาไทย/อังกฤษผสมได้ ไม่บังคับ RFC 2119 (Discovery #2)
- `Requirement:` เป็น **หน่วยยึดของ delta** — **key ของ merge = (feature ปลายทาง + ชื่อ requirement)** ไม่ใช่ชื่อ requirement เดี่ยวๆ (ชื่อซ้ำข้าม feature ไม่ชนกัน — แยกด้วยไฟล์)
- **ตำแหน่ง template ต้องอยู่ใต้ `[feature-name]/` เท่านั้น** — `seedDocs` ข้ามโฟลเดอร์ `[...]` (`src/bin/cli.mjs:133-134`); วาง spec ชื่อ concrete ใน template = seed leak ลง target จริง

### 4.2 Section "Spec delta" ใน `design.md` ของ topic (template stages/[topic]/design.md)
```markdown
## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> พฤติกรรมที่ change นี้ เพิ่ม/แก้/ลบ — SHIP จะ merge ตามนี้แบบกึ่ง mechanical
> change ไม่แตะพฤติกรรม feature (refactor/docs/tooling) → เขียน "ไม่มี delta" บรรทัดเดียวพอ

### ADDED
#### Requirement: <ชื่อ> (→ feature: <feature-name>)
<พฤติกรรม + scenario ตาม format ของ spec.md>

### MODIFIED
#### Requirement: <ชื่อใหม่> (→ feature: <feature-name>) [เดิมชื่อ: <ชื่อเก่า> — ใส่เฉพาะกรณี rename]
<เวอร์ชันใหม่เต็ม> _(เดิม: <สรุปสั้น>)_

### REMOVED
#### Requirement: <ชื่อเดิมใน spec> (→ feature: <feature-name>) — เหตุผลที่เลิก
```
- **rename requirement** → ใช้ MODIFIED พร้อม `[เดิมชื่อ: <ชื่อเก่า>]` — SHIP หา requirement ด้วยชื่อเก่า แล้วแทนที่ด้วยชื่อใหม่+เนื้อหาใหม่ (ห้าม rename โดยไม่ระบุ — จะกลายเป็น ADDED ซ้ำ + ของเก่าค้าง)

### 4.3 กติกา merge ตอน SHIP (ขยาย ship playbook §4 step 5.1 เดิม)
- **ADDED** → ต่อท้าย `spec.md` ของ feature ปลายทาง · **MODIFIED** → แทนที่ requirement ชื่อตรงกัน (rename → หาด้วย `[เดิมชื่อ:]`) · **REMOVED** → ลบ requirement นั้น
- **read-modify-verify — key ไม่เจอ → STOP:** ก่อนแทนที่/ลบ ต้องพบ requirement ชื่อตรงใน `spec.md` ของ feature ที่ `(→ feature:)` ระบุ **จริง**; MODIFIED/REMOVED ที่หา key ไม่เจอ → **หยุด ถาม user ห้าม merge เงียบ** (ห้ามตีความเป็น ADDED เอง — กัน silent drift)
- **feature ใหม่** → สร้าง `spec.md` จาก ADDED ทั้งก้อน (template `[feature-name]/spec.md`)
- **feature เดิมยังไม่มี `spec.md`** (organic backfill — Discovery #6) → สร้างใหม่จาก delta + พฤติกรรมจริง ไม่ต้องไล่เขียนย้อนหลังทั้ง feature
- **docs-match-code:** ถ้า BUILD/VERIFY ทำให้พฤติกรรมจริงต่างจาก delta ที่ approve ไว้ → **อัปเดต delta ใน design.md ก่อน แล้วค่อย merge**; และ **re-check delta เทียบ spec ปัจจุบัน ณ เวลา ship** (ไม่ใช่ ณ เวลา design — กัน stale delta เมื่อ topic อื่น ship แทรกก่อน)
- delta อยู่ใน promotion plan ที่ user approve ครั้งเดียว (Discovery #5 — ไม่เพิ่มรอบถาม)

### 4.4 VERIFY ใช้ spec (ใส่ใน verify playbook §2/§4)
- ก่อนวางแผนเทส: อ่าน `docs/features/<name>/spec.md` ของ **feature ที่ topic แตะ** (ดูจาก Spec delta ใน design.md)
- **topic แตะหลาย feature → baseline = union ของ spec ทุก feature ที่ delta อ้างถึง** (regression ครอบทุก feature ที่อ้าง ไม่เลือกเทสบางตัว)
- **scenario เดิมใน spec = regression case** (พฤติกรรมเดิมต้องไม่พัง — ยกเว้นที่ MODIFIED/REMOVED ระบุ) · **scenario ใน delta = test case ใหม่**
- feature ยังไม่มี spec → ข้ามได้ (ใช้วิธีเดิม) — backward compatible

## 5. Flow
- **data-flow:** spec ปัจจุบัน → (DESIGN อ่าน) → Spec delta ใน design.md → (VERIFY อ้างทั้งคู่) → (SHIP merge) → spec ใหม่ — วงจรปิด รอบถัดไปเริ่มจาก spec ล่าสุด
- **user-flow:** user approve delta ตอน design gate (ของเดิม) + เห็น delta ซ้ำใน promotion plan ตอน SHIP (approve รวมครั้งเดียวของเดิม) — **ไม่มีรอบถามเพิ่ม**

## 6. ผลกระทบต่อระบบเดิม
- **backward compatible ทุกทาง:** feature ไม่มี spec → VERIFY ใช้วิธีเดิม + SHIP สร้างให้ตอนแตะครั้งแรก; topic เก่าไม่มี Spec delta section → SHIP ทำแบบเดิม (กลั่นจาก design) — ไม่มี breaking
- installer/test/pack: **ไม่ต้องแก้** — `CORE` ครอบ template ใหม่อัตโนมัติ, `seedDocs` ข้าม `[...]`, verify-pack allowlist ครอบ `src/.warnyin/` อยู่แล้ว
- จุดระวัง: wording 3 playbook + 3 command + 2 template ต้องสอดคล้อง — บังคับ copy จาก §4 นี้เท่านั้น

## 7. Dependency ระหว่าง slice/task

```
spec-template ──▶ stage-wiring     (อ้าง path + format ของ template)
       └────────▶ dogfood-specs    (ใช้ format เดียวกัน)
```
- wave 1: `spec-template` · wave 2 (ขนานกันได้): `stage-wiring`, `dogfood-specs`

## 8. Test strategy ระดับ design
- gate เดิมของ repo: `npm test` (19) + `npm run lint:md` (dead-link — ลิงก์ใหม่ทุกอันต้อง resolve) + `npm run verify:pack` (template ใหม่ติด tarball)
- consistency check: grep canonical key (`Spec delta`, `Requirement:`, `ADDED`/`MODIFIED`/`REMOVED`, `GIVEN`/`WHEN`/`THEN`) ครบทุกไฟล์ที่แก้ + **เทียบ semantic ของกติกา merge ใน 3 playbook ตรง §4.3 คำต่อคำ** (grep จับ key หาย แต่จับ wording ขัดกันไม่ได้)
- dogfood spec 2 ไฟล์: ตรวจ accuracy เทียบ source จริง (`docs/rule.md` §5 — verify เอกสาร narrative)
- **merge trace ด้วยมือ (executable proof ของ slice 2 ในรอบนี้):** สร้าง delta สมมติ 1 ชุดครบทุกเคส — ADDED + MODIFIED + MODIFIED-rename (`[เดิมชื่อ:]`) + REMOVED + **key-ไม่เจอ (ต้อง STOP)** — trace ตามกติกา §4.3 บนสำเนา dogfood spec (sandbox — ไม่แตะไฟล์จริง) แล้ว assert ผลลัพธ์ทุกเคสใน VERIFY ของ topic นี้ — ไม่ defer merge logic ทั้งก้อนไป topic หน้า
- (optional) black-box assert: รัน installer ลง sandbox (`npm run setup:sandbox`) แล้วยืนยัน `docs/features/[feature-name]/spec.md` **ไม่** ถูก seed ลง target (seedDocs ข้าม `[...]`)
- พิสูจน์วงจรเต็มใน workflow จริง: topic **ถัดไป** ที่เดินครบ 5 stage = end-to-end proof (verify ของ topic นี้ครอบ static + dogfood + merge trace แล้ว)

---

## Design review (panel 5 role — 2026-06-07)

fan-out reviewer ขนาน read-only: SA / Tech Lead / QA / Security / Infra (role card `.warnyin/workflow/roles/`)

**Blockers ที่พบ + การแก้ (ปิดครบ):**
| # | Role | Blocker | แก้แล้วที่ |
|---|---|---|---|
| B1 | SA | merge key ไม่รองรับ rename requirement → MODIFIED กลายเป็น ADDED เงียบ | §4.2 เพิ่ม `[เดิมชื่อ: <ชื่อเก่า>]` + กติกา rename ใน §4.3 |
| B2 | SA | พิกัดจุดแก้ใน §3 ไม่ตรงไฟล์จริง (verify "principle 1" คลุมเครือ, ship "step 5.1" ไม่ระบุว่าขยายของเดิม) → task เสี่ยงแก้ผิดที่/สร้างกลไกขนาน | §3 normalize ทุกแถว — ระบุชัด "ขยาย principle/step เดิม" ตาม unify-in-place |
| B3 | QA | slice 2 (วงจร delta) ไม่มี test ที่รันได้ในรอบตัวเอง — defer ไป topic หน้าทั้งก้อน | §8 เพิ่ม **merge trace ด้วยมือ** ครบทุกเคส (ADDED/MODIFIED/rename/REMOVED/key-ไม่เจอ) บน sandbox copy |
| B4 | QA | MODIFIED/REMOVED ที่ key ไม่เจอ ไม่มีกติกา → silent drift | §4.3 เพิ่ม **read-modify-verify + key ไม่เจอ → STOP ถาม user** + gate item ใน ship §6 |

**Suggestions ที่รับ:** SA-S1 key=(feature+ชื่อ) ระบุชัด (§4.1) · SA-S3/QA-S2 multi-feature → union baseline (§4.4) · QA-S1 THEN = observable artifact สำหรับ feature เอกสาร (§4.1) · QA-S3 stale delta → re-check ณ เวลา ship (§4.3) · QA-S5 semantic check กติกา merge 3 playbook (§8) · Security-S1 descriptive ไม่ใช่ imperative (§4.1) · Security-S2 placeholder ห้าม secret/PII (§4.1) · Security-S3 read-modify-verify + gate item (§4.3) · TechLead-S4 workflow README 1 บรรทัด (§3) · Infra-S1 template ต้องใต้ `[feature-name]/` (§4.1) · Infra-S2 sandbox seed assert (§8 optional)

**Suggestions ที่ไม่รับ + เหตุผล:** Tech Lead เสนอแยก stage-wiring per-stage → **ไม่แยก** (ตัว Tech Lead เองก็สรุปว่าคงไว้ถูกแล้ว — กัน wording เพี้ยนจากการตีความ canonical 3 รอบ; precedent `learned-rule` 1 task/3 ไฟล์) · Infra เสนอ note ใน `docs/infra.md` → ไม่ใส่ (invariant ของ installer อยู่ที่ `docs/techstack/installer/rule.md` เหมาะกว่า — พิจารณาเป็น learned-rule ตอน SHIP)

**ผลรวม:** Tech Lead / Security / Infra = ไม่มี blocker; SA×2 + QA×2 = แก้ครบใน design นี้แล้ว — ไม่มี blocker ค้าง
