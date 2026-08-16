# Spec — build-verify-seam

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`docs/playbook` (payload markdown) — ไม่มี API/UI/DB · surface ที่แตะ = playbook กลาง + template + adapter
(§2 API SPEC / §3 UX-UI SPEC = **N/A**)

---

## 2. ไฟล์ที่เป็น surface ของ spec นี้

| ไฟล์ | บทบาทหลังงานนี้ |
|---|---|
| `src/.warnyin/workflow/stages/build.md` | **เจ้าของนิยาม** ของ 4 block ที่เคยซ้ำ + จุด handoff เข้าสู่ VERIFY + hook memory ของ BUILD (คงไว้) |
| `src/.warnyin/workflow/stages/verify.md` | รับ handoff · ระบุ **ผู้ตรวจอิสระจากผู้เขียน** · **ไม่มี** hook memory · block ที่ซ้ำเหลือ pointer |
| `src/.warnyin/template/stages/[topic]/build.md` | artifact เดียวของ BUILD+VERIFY — 4 section ตาม C1 |
| `src/.warnyin/template/stages/[topic]/test.md` | **ลบ** |
| `src/.warnyin/template/stages/[topic]/verify.md` | **ลบ** |
| `src/.claude/commands/warnyin/build.md` | adapter — เพิ่ม confirm handoff, ชี้ artifact ใหม่ |
| `src/.claude/commands/warnyin/verify.md` | adapter — เขียนผลลง `build.md §3/§4` แทน `test.md`/`verify.md` |

---

## 3. Contract ที่ต้อง copy คำต่อคำ (จาก `design.md §4`)

### C1 — 4 section ของ template `[topic]/build.md`
ต้องเป็น heading ระดับ `##` **สี่อันนี้เท่านั้น** (คำต่อคำ รวมเลข จุด และวงเล็บ):

```
## 1. ผล build ต่อ task
## 2. Full build & test gate
## 3. แผนเทส (VERIFY)
## 4. ผล verify + การแก้
```

> ⚠ slice `validator-cap-gate` assert string นี้แบบ **exact** — เปลี่ยนคำ/เว้นวรรค/เลข = gate แดง
> เนื้อหาย่อยทั้งหมด (execution plan, ตารางผลต่อ task, gate checklist, rule note รอ SHIP, pointer troubleshooting) ให้อยู่ใต้สี่ section นี้ด้วย heading ระดับ `###` — **จำนวน heading `^## ` ในไฟล์ = 4 พอดี**

### W1 — wording ผู้ตรวจอิสระ (ใหม่ · owner = task นี้)
ต้องปรากฏใน `src/.warnyin/workflow/stages/verify.md` §3 (หลักการข้อ 1):

```
VERIFY ต้องทำโดย agent/บทบาทที่ **อิสระจากผู้เขียนโค้ด** — self-check ของ build agent ไม่นับ
```

(ที่มา: `docs/rule.md §5` "ตรวจโดย agent อิสระจากผู้เขียน" + `design.md §9` scenario "ผู้ตรวจอิสระจากผู้เขียน")

### W2 — wording handoff BUILD→VERIFY (ใหม่ · owner = task นี้)
ต้องปรากฏใน `src/.warnyin/workflow/stages/build.md` §4 (ปิดงาน):

```
ถามยืนยันหนึ่งครั้ง ว่าจะเดิน VERIFY ต่อในเซสชันเดียวไหม — ตกลง → เดิน `stages/verify.md` ต่อทันที; ปฏิเสธ → หยุดที่นี่ แล้วบอก user ว่าสั่ง `/warnyin:verify <slug>` เองได้
```

---

## 4. Data-flow (artifact)

```
เดิม:  BUILD ─► build.md            VERIFY ─► test.md (แผน) ─► verify.md (ผล)
ใหม่:  BUILD ─► build.md §1,§2  ─(confirm 1 ครั้ง)─►  VERIFY ─► build.md §3,§4
SHIP:  แผนเทส merge ขึ้น docs/techstack/<component>/test.md  ← อ่านจาก build.md §3 (เดิมอ่านจาก test.md)
```

- **single-writer คงเดิม:** main loop เป็นคนเขียน `build.md` ทั้ง 4 section (build sub-agent ใน worktree ไม่เขียน)
- **stage inference:** validator แยก BUILD/VERIFY ด้วยการมี heading `## 4. ผล verify` (structural) — งานฝั่ง validator เป็นของ slice `validator-cap-gate` (C2) task นี้แค่ต้องไม่ทำให้ heading เพี้ยน

## 5. User-flow

1. `/warnyin:build <slug>` → fan-out → integrate → **full build & test gate เขียว (blocking เหมือนเดิม)**
2. main loop เขียน `build.md §1/§2` + อัปเดต `task.md` + hook memory ของ BUILD (main loop เท่านั้น)
3. **ถามยืนยันหนึ่งครั้ง** — "เดิน VERIFY ต่อในเซสชันเดียวไหม"
   - **ตกลง** → เดินต่อตาม `stages/verify.md` ในเซสชันเดิม (VERIFY phase ต้องใช้ agent/บทบาทอิสระจากผู้เขียนโค้ด)
   - **ปฏิเสธ** → จบที่ BUILD บอก user ว่าสั่ง `/warnyin:verify <slug>` เองได้
4. VERIFY เขียนแผนลง `build.md §3` → รันเทส/แก้ → เขียนผลลง `build.md §4` → เสนอเข้า SHIP (**ไม่เขียน memory**)

## 6. Persona
ผู้ใช้ workflow (dev/AI orchestrator) ที่เดิมต้องพิมพ์ command ที่สอง + เปิดอ่าน 3 ไฟล์เพื่อรู้สถานะเดียวกัน

---

## 7. Test-flow (falsifiable — รันได้จริง, cwd = repo root)

> ทุกข้อเป็น grep/ls บนไฟล์จริง ไม่ใช่การอ่านเอาเรื่อง

### A. artifact 3→1 (C1)
- [ ] **A1** ครบ 4 heading คำต่อคำ — ทุกคำสั่งต้องคืน `1`:
      `grep -cFx '## 1. ผล build ต่อ task' 'src/.warnyin/template/stages/[topic]/build.md'`
      `grep -cFx '## 2. Full build & test gate' 'src/.warnyin/template/stages/[topic]/build.md'`
      `grep -cFx '## 3. แผนเทส (VERIFY)' 'src/.warnyin/template/stages/[topic]/build.md'`
      `grep -cFx '## 4. ผล verify + การแก้' 'src/.warnyin/template/stages/[topic]/build.md'`
- [ ] **A2** ไม่มี section `##` เกิน 4 — `grep -c '^## ' 'src/.warnyin/template/stages/[topic]/build.md'` = `4`
- [ ] **A3 (negative)** `ls 'src/.warnyin/template/stages/[topic]/test.md'` และ `.../verify.md` → **ไม่พบไฟล์ (exit ≠ 0)**
- [ ] **A4** `build.md` ยังมีเนื้อที่ย้ายมาครบ: gate checklist ของ BUILD (ใต้ §2), gate checklist ของ VERIFY (ใต้ §4), ช่องจำนวนรอบ/จำนวนจุดที่แก้ (ใต้ §4), UX/UI checklist (ใต้ §3 หรือ §4), rule/standard ใหม่รอ SHIP (ใต้ §1) — ไม่มีข้อไหนหายไปเฉย ๆ

### B. unify-in-place — นิยามเหลือที่เดียว
> รูปแบบเช็ค: `grep -rlF "<needle>" src/.warnyin/workflow/stages/` ต้องคืน **`build.md` ไฟล์เดียว**

- [ ] **B1** step 0 context window — needle `ไม่หายไปกับ context`
- [ ] **B2** investigate-before-edit — needle `ใครใช้/อ่านไฟล์นี้`
- [ ] **B3** config-protection — needle `เพื่อให้ build/test ผ่าน`
- [ ] **B4** loop-tuning report — needle `ระบุ credit-horizon choice (per-finding | batched)`
- [ ] **B5 (ห้ามลบเนื้อกฎทิ้ง)** `verify.md` ต้องยัง**ชี้กลับ**ครบทั้ง 4 จุด — `grep -c 'build.md' src/.warnyin/workflow/stages/verify.md` ≥ `4` และแต่ละ pointer ระบุพิกัด section/ข้อของ `build.md` (เช่น `§3 ข้อ 11`, `§4 ข้อ 0`)
- [ ] **B6** ข้อกำหนดเฉพาะ VERIFY ที่ไม่ใช่ของซ้ำ ยังอยู่: `"แก้จนผ่าน"` = แก้ root cause ไม่ลด bar (คู่ config-protection) ยังปรากฏใน `verify.md`

### C. seam BUILD→VERIFY
- [ ] **C1** `build.md` มี W2 คำต่อคำ (`grep -cF 'ถามยืนยันหนึ่งครั้ง' src/.warnyin/workflow/stages/build.md` ≥ 1 และประโยคระบุทั้งทางตกลงและทางปฏิเสธ + `/warnyin:verify`)
- [ ] **C2** confirm อยู่**หลัง** full build & test gate — บรรทัด W2 อยู่หลัง §4 ข้อ 6 (gate) ในไฟล์
- [ ] **C3** `verify.md` §1 ระบุว่ารับ handoff จาก BUILD ได้ (เข้าได้ทั้งจาก `/warnyin:verify` และจากการยืนยันในเซสชัน BUILD)
- [ ] **C4** `verify.md` มี W1 คำต่อคำ (ผู้ตรวจอิสระจากผู้เขียนโค้ด · self-check ของ build agent ไม่นับ)

### D. memory hook (C7 — เฉพาะส่วนที่ task นี้รับผิดชอบ)
- [ ] **D1 (negative)** `grep -c 'อัปเดต project memory' src/.warnyin/workflow/stages/verify.md` = `0`
- [ ] **D2** `grep -c 'อัปเดต project memory' src/.warnyin/workflow/stages/build.md` = `1` และบรรทัดนั้นยังมี `main loop เท่านั้น` + `build sub-agent ที่ทำงานใน worktree ห้ามเขียน memory เอง`

### E. Output table + adapter ตรงกับ artifact ใหม่
- [ ] **E1** ตาราง Output ของ `build.md` (§5) ระบุ `docs/stages/<slug>/build.md` เป็นที่เก็บผลของทั้ง BUILD และ VERIFY (อ้าง section 1-4)
- [ ] **E2** ตาราง Output ของ `verify.md` (§5) **ไม่มีแถว** `test.md` และ `verify.md` — มีแถวที่ชี้ `build.md §3` (ปลายทาง SHIP: `docs/techstack/<component>/test.md`) และ `build.md §4`
- [ ] **E3** Gate ของ `verify.md` (§6) เปลี่ยนข้อ "`test.md` + `verify.md` เขียนครบ" → "`build.md` §3 + §4 เขียนครบ" โดย**ข้ออื่นครบเท่าเดิม**
- [ ] **E4** `src/.claude/commands/warnyin/verify.md` ไม่สั่งเขียน `docs/stages/<slug>/test.md` หรือ `.../verify.md` อีก (`grep -c 'stages/<slug>/test.md\|stages/<slug>/verify.md'` = `0`) และสั่งเขียนลง `build.md` §3/§4 แทน
- [ ] **E5** `src/.claude/commands/warnyin/build.md` step ปิดงานมี confirm handoff (สอดคล้อง W2) และยังบอกทางเลือกสั่ง `/warnyin:verify` เอง
- [ ] **E6** fast-track hook ใน `verify.md` §1 ที่เดิมเขียน "ไม่สร้าง `test.md`/`verify.md` สำหรับ fast" ถูกปรับให้ตรงโลกใหม่ (fast ใช้ `receipt.md` — ไม่อ้างไฟล์ที่ไม่มีแล้ว)

### F. gate ที่ห้ามลด (regression — ต้องยังอยู่ครบ)
- [ ] **F1** `build.md` §3 ข้อ 8 + §4 ข้อ 6 + §7 ยังระบุ full build + test เป็น **blocking** ("ห้ามลด bar" / "ห้ามปิด BUILD ถ้ายังแดง")
- [ ] **F2** `verify.md` §6 ยังมี: regression baseline จาก `docs/features/<name>/spec.md` · UX/UI verify (FE) · API contract (`openapi.yaml`) · แก้จนผ่านหมด
- [ ] **F3** `verify.md` §2 ยังอ่าน baseline + `openapi.yaml` + `docs/techstack/<component>/test.md` + `infra.md` + `troubleshooting.md` + runtime security ครบ

### G. link/anchor integrity
- [ ] **G1** `npm run lint:md` ผ่าน (ทุก markdown-link resolve — ไม่มี dead path จากไฟล์ template ที่ลบ)
- [ ] **G2** ไม่มีการ rename heading ที่มี inbound link — โดยเฉพาะ `#fast-track-skip-list` (`triage.md`) และเลขข้อใน `build.md §3`/`§4` ที่ `loop-tuning.md` และ `backlog.md` อ้างถึง (`build.md §4 step 6`, `verify.md §4 step 5`, `verify.md §3 + §4 fix loop`)
- [ ] **G3** `npm test` เขียว (pass count ไม่ลด) — โดยเฉพาะ `src/tests/fastlane.test.mjs` (STAGE_FILES) และ `src/tests/memory.test.mjs`
