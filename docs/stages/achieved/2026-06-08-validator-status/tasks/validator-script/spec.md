# Spec — validator-script

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — สร้าง script validator + unit test ตาม **canonical contract design §4 (copy ห้ามแต่งใหม่)**

## 1. ชนิดของ task
`code` (zero-dep `node:*` script + unit test) — payload dev-tooling, pattern เดียวกับ `lint-md.mjs`/`verify-pack.mjs` (pure fn + injectable IO + main-guard)

---

## 2. ผลลัพธ์ที่ต้องสร้าง (2 ไฟล์ เท่านั้น)
- `src/.warnyin/workflow/scripts/validate-topic.mjs` — script เดียว 2 โหมด (status/validate)
- `src/tests/validate-topic.test.mjs` — unit feed `Map` ปลอม (ไม่แตะ fs) + executable spawn (temp fixture)

---

## 3. CLI contract (ฝังตรงจาก design §4.1 — ห้ามแต่งใหม่)

| โหมด | คำสั่ง | output | exit |
|---|---|---|---|
| **status** | `node .warnyin/workflow/scripts/validate-topic.mjs` | ตารางทุก active topic: `slug · stage (ประมาณการ) · ✖N/⚠N`; ไม่มี topic → "ไม่มีงานค้าง" | `0` เสมอ (status เป็นรายงาน ไม่ใช่ gate) |
| **validate** | `node .warnyin/workflow/scripts/validate-topic.mjs <slug>` | รายการ `✖ [C2] <จุดที่ขาด>` / `⚠ [C1] <เตือน>` ละเอียด (มี code กำกับ); ครบ → `✓` | `1` เมื่อมี ✖ ≥1 · `0` เมื่อมีแค่ ⚠/สะอาด · `2` slug ไม่ถูกต้อง/ไม่พบ topic |

- ทำงานจาก **cwd ของโปรเจกต์ปลายทาง** (หา `docs/stages/` จาก `process.cwd()` — เหมือน `lint-md`)
- **slug sanitize (Security B7):** รับ slug จาก argv แล้ว **whitelist ด้วย `readdirSync('docs/stages/')`** — slug ต้องตรง basename ของ dir ที่มีอยู่จริง (ไม่เอา arg ไปต่อ path ตรงๆ); ไม่ match (รวม `../`, path แปลก) → **exit 2 "ไม่พบ topic"** — กัน path traversal
- arg ผิดรูป/เกิน 1 ตัว → exit 2

---

## 4. เช็คที่ทำ C1–C5 (structural เท่านั้น — ฝังตรงจาก design §4.2; ห้ามเพิ่มเช็คเอง)

> **หลักการแยกระดับ (panel SA-B1/B2 · TechLead-B1/B2 · QA-B2):** เช็คระดับ **✖ ต้องไม่พึ่ง "filled detection"** (existence/structure ล้วน — deterministic) · เช็คที่พึ่งการเดาว่า artifact "เติมแล้วหรือยัง" เป็น **⚠ best-effort** (heuristic หยาบ ยอมรับ false ได้ ไม่ block)

| กลุ่ม | เช็ค | ระดับ | พึ่ง filled? |
|---|---|---|---|
| C2 tasks | ทุกโฟลเดอร์ใน `tasks/` (ข้าม `[...]`) มีครบ 4 ไฟล์ `spec.md` `standard.md` `rule.md` `task.md` | ✖ | ไม่ (existence) |
| C3 ship data | **เฉพาะเมื่อ `ship.md` เริ่มเติมแล้ว** (H1 ไม่มี `<...>`) → ต้องมี section `## 3. Learned rules` + **≥1 data row จริง** (ไม่ใช่ header/separator/row ว่าง) | ✖ | บาง (เฉพาะ trigger ด้วย H1) |
| C5 feature spec format | `docs/features/*/spec.md` (เฉพาะที่มีไฟล์): มี `## Requirement:` ≥1 · ทุก Requirement มี `### Scenario:` ≥1 · ทุก Scenario มี GIVEN+WHEN+THEN ครบ (case-insensitive, ไม่ enforce order) | ✖ | ไม่ (structure) |
| C1 artifact ลำดับ | artifact ที่ "เริ่มเติม" ข้าม stage ก่อนหน้า (เช่น `build.md` เริ่มเติมแต่ `design.md` ยัง template) — เทียบตาราง §5 | ⚠ | ใช่ (heuristic) |
| C4 spec delta | `design.md` ที่เริ่มเติมแล้ว มี section `Spec delta` (หรือ `ไม่มี delta`) | ⚠ | ใช่ + backward compat |

- **filled heuristic (B1 — ใช้กับ ⚠ เท่านั้น):** "เริ่มเติม" = **H1 (บรรทัดแรก) ไม่มี placeholder `<...>`** (regex `/<[^>]+>/` บน H1) — ทุก template artifact มี `— <ชื่อ...>` ที่ H1. **ห้ามใช้ `const FILLED_MARKERS` list** (panel B1: เปราะ ไม่ครบ template จริง — `design.md` มี `<ชื่อ>`/`<feature-name>` ที่ list 4 ตัวไม่ครอบ)
- **C3 ใช้ filled-trigger แก้ chicken-egg (B4 — QA-B2):** topic ที่ `ship.md` ยัง template (H1 มี `<ชื่อ topic>`) → C3 **ข้าม** (ไม่ ✖) — validator รันกับ topic ตัวเองตอน DESIGN ไม่ false-fail; ยิง ✖ เฉพาะเมื่อเริ่มเขียน ship แล้วแต่ไม่มี data row
- **C3 ต้องเช็ค ≥1 data row จริง (B3):** header ตาราง 4 คอลัมน์มีใน template เปล่าเสมอ → ห้ามนับว่าผ่านแค่เจอ header/separator (`|---|`) หรือ row ที่ทุก cell ว่าง
- semantic (เนื้อหาถูก, claim ตรง source, delta ตรง code) = **หน้าที่ model ตาม gate เดิม** — script ไม่แตะ

---

## 5. stage → artifact (canonical สำหรับ C1 + stage inference — ฝังตรงจาก design §4.3)

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
- optional artifact ขาด = ไม่ count (กัน false-fail topic ที่ข้าม `business.md`/Discovery ปกติ)

---

## 6. โครงโค้ด + security invariant (ฝังตรงจาก design §4.4 — ห้ามแต่งใหม่)

```js
// error/warning เป็น object มี code (SA-S1): {code:'C2', level:'error', msg:'tasks/foo ขาด rule.md'}
export function checkTopic(files)            // pure: Map<relPath,content> ของ topic เดียว → {issues:[{code,level,msg}], stage}
export function checkFeatureSpec(name, content) // pure: ชื่อ+เนื้อหา spec.md → issues[] (C5)
// main(): walk docs/stages/ (ข้าม achieved/, context.md) + docs/features/*/spec.md → เรียก pure fn → print/exit
// main-guard: argv[1] comparison (ไม่ใช่ import.meta.main)
```

- **security invariant (pin — Security S1/S2/S3):** ใช้เฉพาะ `node:fs`/`node:path`/`node:url` — **ไม่มี `child_process`/network/write fs**; output รายงาน **structural เท่านั้น** (ชื่อไฟล์/section/code ที่ขาด — **ห้าม echo เนื้อ artifact** กัน sensitive content รั่วลง CI log); อ่านไฟล์มี guard ENOENT/EACCES → exit สะอาด ไม่พ่น absolute path ของ target
- unit feed `Map` ปลอม — ไม่แตะ fs จริง (testable แบบ `checkLinks`/`checkFiles`); error มี `code` → test assert structured ไม่ใช่ regex string (SA-S1)
- ภาษา output ไทย + สัญลักษณ์ `✓`/`✖`/`⚠` ตามสไตล์ script เดิม
- **main-guard:** `if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()` (ไม่ใช่ `import.meta.main` ที่ undefined บน node 20) — import จาก unit ไม่ trigger main

---

## 7. Data-flow
`docs/stages/<slug>/**` + `docs/features/*/spec.md` (cwd ปลายทาง) → `main()` walk → pure fn (`checkTopic`/`checkFeatureSpec`) → `issues[]`+`stage` → stdout + exit code (ที่ AI/CI อ่านได้)

## 8. ขอบเขตไฟล์ — **สร้างใหม่ 2 ไฟล์เท่านั้น**
- **สร้าง:** `src/.warnyin/workflow/scripts/validate-topic.mjs` · `src/tests/validate-topic.test.mjs`
- **ห้ามแตะ:** `src/bin/cli.mjs`, `src/scripts/verify-pack.mjs` (Infra ยืนยัน CORE+allowlist `src/.warnyin/` ครอบ path ใหม่แล้ว — ไม่ต้องแก้) · playbook/command (`src/.warnyin/workflow/*.md`, `src/.claude/commands/` — เป็นของ task `playbook-wiring`) · docs/ กลาง (`docs/rule.md`, `docs/techstack/`, `docs/features/`) · root dogfood (`.warnyin/`, `.claude/` ที่ root) · CHANGELOG (ของ wiring task)

## 9. Persona
maintainer ของ repo + `/warnyin:next`/DESIGN gate/SHIP ที่จะเรียก script + sub-agent BUILD ที่รับ task นี้ทำ self-contained

## 10. Test-flow (ตามเคส design §8 — positive+negative ต่อเช็ค)

> unit feed `Map` ปลอม (ไม่แตะ fs) + executable spawn (pattern `makeTempProject`/`runCli` จาก `installer.test`)

### unit pure fn (`checkTopic`/`checkFeatureSpec`)
- [ ] **C2:** tasks ครบ 4 ไฟล์ → ✓ · ขาด `rule.md` → ✖ [C2] ระบุไฟล์ · `tasks/` ว่าง/ไม่มี dir → ไม่ crash ไม่ false-fail · โฟลเดอร์ `[task-name]` ถูก skip
- [ ] **C3:** `ship.md` ยัง template H1 placeholder → ข้าม (chicken-egg, ไม่ ✖) · เริ่มเติมแต่มีแค่ header ตาราง → ✖ [C3] · มี data row จริง → ✓
- [ ] **C5:** Requirement ไม่มี Scenario → ✖ · Scenario ขาด WHEN → ✖ · ครบ GIVEN/WHEN/THEN (case-insensitive) → ✓
- [ ] **C1/C4 (⚠):** `design.md` เริ่มเติมแต่ไม่มี Spec delta → ⚠ [C4] (ไม่ใช่ ✖) · `build.md` เริ่มเติมแต่ `design.md` ยัง template → ⚠ [C1] (ข้าม stage)
- [ ] **stage inference:** topic ทุกไฟล์ template → stage ต่ำสุด/ไม่ crash · artifact filled ผสม → stage ถูก
- [ ] **structured error:** error object มี `code` → assert structured (ไม่ regex string output)

### executable (spawn ใน temp)
- [ ] slug ไม่ถูกต้อง/`../..` → **exit 2** (path traversal guard, ไม่อ่านไฟล์นอก `docs/stages/`)
- [ ] fixture topic ขาดไฟล์ → **exit 1** (มีบรรทัด `✖ [C2]`)
- [ ] status หลาย topic (1 สะอาด 1 ✖) → ตารางรวมถูก + **exit 0**
- [ ] skip `achieved/` + `context.md`

### gate + self-validate
- [ ] `npm test` เขียว (suite โตจาก 26 — เพิ่ม unit+executable ของ task นี้)
- [ ] `npm run lint:md` ผ่าน
- [ ] `npm run verify:pack` ผ่าน — script ใหม่ติด tarball (allowlist `src/.warnyin/` ครอบ; ไม่ต้องแก้ verify-pack)
- [ ] **self-validate:** รัน validate กับ topic `validator-status` เองได้ (ผลตรงสถานะจริง) — proof ของ slice ตอน VERIFY (ตอน DESIGN gate `ship.md` ยัง template → C3 ข้าม ไม่ false-fail; QA-B2)
