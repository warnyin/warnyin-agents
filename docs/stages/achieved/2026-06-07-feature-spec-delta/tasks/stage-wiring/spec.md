# Spec — stage-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> wiring วงจร Spec delta ครบ 3 stage — แก้ playbook/template/command/CHANGELOG ตาม design §3 โดย **copy canonical wording จาก design §4.2–§4.4 เท่านั้น ห้ามแต่งใหม่**

## 1. ชนิดของ task
`docs` / `content` — แก้ `.md` แก่นกลาง workflow (playbook design/verify/ship) + stage template + adapter command + CHANGELOG; **ทุกจุด unify-in-place** (ขยาย principle/step/gate/section เดิม ไม่เพิ่มกลไกขนาน — `docs/rule.md` §1)

---

## 2. Canonical wording (copy จาก design §4.2–§4.4 — ใช้ตรงนี้ทุกจุด ห้ามแต่งใหม่)

> source of truth = `docs/stages/feature-spec-delta/design.md` §4.2 / §4.3 / §4.4 + §3 ตารางไฟล์แก้ + Design review (B2/B4)
> ใต้นี้คือสรุป key ที่ต้องปรากฏตรงคำ — ถ้าต่างจาก design §4 ให้ยึด design §4 เป็นหลัก

### 2.1 Section "9. Spec delta" ใน stage template design.md (= design §4.2 verbatim)
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
+ note rename (design §4.2): rename requirement → ใช้ MODIFIED พร้อม `[เดิมชื่อ: <ชื่อเก่า>]` (SHIP หาด้วยชื่อเก่า แล้วแทนที่ด้วยชื่อใหม่+เนื้อหาใหม่ — ห้าม rename โดยไม่ระบุ)

### 2.2 กติกา merge ตอน SHIP (= design §4.3 — ขยาย ship playbook §4 step 5.1 เดิม **ครบทุก key**)
- **ADDED** → ต่อท้าย `spec.md` · **MODIFIED** → แทนที่ requirement ชื่อตรงกัน (rename → หาด้วย `[เดิมชื่อ:]`) · **REMOVED** → ลบ requirement
- **read-modify-verify — key ไม่เจอ → STOP:** MODIFIED/REMOVED ที่หา key ไม่เจอใน `spec.md` ของ feature ที่ `(→ feature:)` ระบุ → **หยุด ถาม user ห้าม merge เงียบ** (ห้ามตีความเป็น ADDED เอง)
- **feature ใหม่** → สร้าง `spec.md` จาก ADDED ทั้งก้อน (template `[feature-name]/spec.md`)
- **feature เดิมยังไม่มี `spec.md`** (organic backfill) → สร้างใหม่จาก delta + พฤติกรรมจริง
- **docs-match-code + stale delta re-check:** พฤติกรรมจริงต่างจาก delta → **อัปเดต delta ใน design.md ก่อน แล้วค่อย merge**; และ **re-check delta เทียบ spec ปัจจุบัน ณ เวลา ship** (ไม่ใช่ ณ เวลา design)

### 2.3 VERIFY ใช้ spec (= design §4.4 — ขยาย verify playbook §2/§3/§4 เดิม)
- ก่อนวางแผนเทส: อ่าน `docs/features/<name>/spec.md` ของ **feature ที่ topic แตะ** (ดูจาก Spec delta ใน design.md)
- **topic แตะหลาย feature → baseline = union ของ spec ทุก feature ที่ delta อ้างถึง**
- **scenario เดิมใน spec = regression case** (ยกเว้นที่ MODIFIED/REMOVED ระบุ) · **scenario ใน delta = test case ใหม่**
- feature ยังไม่มี spec → ข้ามได้ (วิธีเดิม) — backward compatible

---

## 3. จุดที่ต้องแก้ (file | content) — ตาม design §3 ตารางไฟล์แก้

> พิกัด § ต่อไฟล์มาจาก design §3 (B2 normalize แล้ว — ระบุชัด "ขยายของเดิม"); **ทุกจุด unify-in-place**

| ไฟล์ | จุดแก้ (copy wording จาก §2 ข้างบน / design §4) |
|---|---|
| `src/.warnyin/workflow/stages/design.md` | **§2 input** +ข้อใหม่: อ่าน `docs/features/<name>/spec.md` ของ feature ที่ change แตะ · **§4 step 5** ขยายของเดิม: design.md ครอบ Spec delta ด้วย · **§5 ตาราง** design.md +คำว่า Spec delta · **§8 gate** +item: Spec delta ครบ หรือระบุ "ไม่มี delta" |
| `src/.warnyin/workflow/stages/verify.md` | **§2 input** +ข้อใหม่: feature spec = regression baseline (ดูจาก Spec delta ใน design.md) · **§3 ขยาย principle 1 เดิม** ("เข้าใจจุดประสงค์ก่อนเทส" → +"และพฤติกรรมเดิมจาก feature spec — scenario เดิม = regression case, delta = test case ใหม่") · **§4 step 1-2** อ่าน baseline + วางแผนเทสจากทั้งคู่ · **§6 gate** +item: regression ตาม baseline ของ feature ที่แตะ |
| `src/.warnyin/workflow/stages/ship.md` | **§3 ขยาย principle 5 เดิม** ("เอกสารต้องตรงโค้ดจริง" → ครอบ delta: พฤติกรรมจริงต่างจาก delta → อัปเดต delta ก่อน merge) · **§4 ขยาย step 5.1 เดิม** (`docs/features/` จาก "feature.md + business.md" → + `spec.md` merge ตามกติกา §2.2 — **ไม่เพิ่ม sub-step ใหม่**) · **§5 ตาราง output** +spec.md · **§6 gate** +item: delta merge แล้ว ทุก MODIFIED/REMOVED match requirement จริง (read-modify-verify, key ไม่เจอ → STOP) |
| `src/.warnyin/template/stages/[topic]/design.md` | **+section "9. Spec delta"** ตาม §2.1 (verbatim design §4.2) — ต่อท้ายหลัง §8 Test strategy |
| `src/.warnyin/template/stages/[topic]/ship.md` | **§2 ตาราง** +แถว `docs/features/<feature-name>/spec.md` (merge delta จาก design.md) |
| `src/.warnyin/workflow/README.md` | **บรรทัด ~59** note 1 บรรทัดว่า `features/[feature-name]/` มี `spec.md` (living behavior spec) ด้วย |
| `src/.claude/commands/warnyin/design.md` | mirror **บาง** — ชี้ playbook §2/§4/§8 (Spec delta) ไม่ duplicate logic |
| `src/.claude/commands/warnyin/verify.md` | mirror **บาง** — ชี้ playbook §2/§3/§4 (regression baseline จาก feature spec) ไม่ duplicate |
| `src/.claude/commands/warnyin/ship.md` | mirror **บาง** — ชี้ playbook §4 step 5 (merge delta + key ไม่เจอ → STOP) ไม่ duplicate |
| `CHANGELOG.md` | entry `[Unreleased]` (payload change — user-facing) ตาม `docs/rule.md` §2 |

**ห้ามแตะ:** `src/bin/cli.mjs` · `src/tests/` · docs/ กลาง (`docs/rule.md`/`docs/techstack/`/`docs/features/`) · template `spec.md` ของ feature (`src/.warnyin/template/docs/features/[feature-name]/spec.md` — งานของ task `spec-template`) · root dogfood (`.warnyin/`, `.claude/` ที่ root)

---

## 4. Data-flow
ไม่มี runtime — wiring เอกสาร: spec ปัจจุบัน → (DESIGN เขียน delta ใน design.md §9) → (VERIFY อ่าน baseline + delta) → (SHIP merge ตามกติกา §2.2) → spec ใหม่ = baseline รอบถัดไป (วงจรปิด)

## 5. User-flow
user approve delta ตอน design gate (ของเดิม) + เห็น delta ซ้ำใน promotion plan ตอน SHIP (approve รวมครั้งเดียวของเดิม) — **ไม่มีรอบถามเพิ่ม**

## 6. Persona
AI ทุก harness ที่เดิน 3 stage (DESIGN/VERIFY/SHIP) ตาม playbook กลาง + ผู้ใช้ปลายทางที่ `--update` รับพฤติกรรมใหม่อัตโนมัติ

## 7. Test-flow
- [ ] **design.md** — §2 input อ่าน spec, §4 step 5 ครอบ Spec delta, §5 ตาราง +Spec delta, §8 gate +item (grep `Spec delta` ในไฟล์)
- [ ] **verify.md** — §3 principle 1 **ขยายของเดิม** (ไม่เพิ่ม principle ใหม่), §2/§4 อ่าน baseline+delta, §6 gate +item regression (grep `regression`/`baseline`)
- [ ] **ship.md** — §3 principle 5 ขยาย delta, §4 step 5.1 **ขยายของเดิม ไม่มี sub-step ใหม่** (`spec.md` merge ตามกติกา), §5 ตาราง +spec.md, §6 gate +item key-ไม่เจอ→STOP (grep `spec.md`/`STOP`/`read-modify-verify`)
- [ ] **template design.md** — มี section "9. Spec delta" ตรงตาม §2.1 (verbatim design §4.2 — รวม `[เดิมชื่อ:]`)
- [ ] **template ship.md** — §2 ตารางมีแถว `docs/features/<feature-name>/spec.md`
- [ ] **workflow README** — บรรทัด ~59 มี note `spec.md` (living behavior spec); ลิงก์/path resolve ผ่าน `lint:md`
- [ ] **command mirror ×3** — ชี้ playbook ไม่ duplicate logic (เนื้อกติกา merge เต็มอยู่ใน playbook เท่านั้น)
- [ ] **CHANGELOG** — มี entry `[Unreleased]` ครอบ payload change นี้
- [ ] **consistency check** — grep canonical key (`Spec delta`, `Requirement:`, `ADDED`/`MODIFIED`/`REMOVED`, `GIVEN`/`WHEN`/`THEN`) ครบทุกไฟล์ที่แก้ + **เทียบ semantic กติกา merge ใน 3 playbook ตรง design §4.3 คำต่อคำ** (read-modify-verify + key ไม่เจอ→STOP + rename `[เดิมชื่อ:]` + stale delta re-check + union baseline)
- [ ] `npm test` (19) + `npm run lint:md` + `npm run verify:pack` เขียว
