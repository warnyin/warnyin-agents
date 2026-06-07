# Rule — validator-script

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow
> ดึงจาก `docs/rule.md` + design §4 — เฉพาะข้อที่เกี่ยวกับ task นี้

### Engineering (zero-dep / pattern)
- [ ] **zero-dependency (`docs/rule.md` §2)** — `devDependencies` ว่างเสมอ; ใช้เฉพาะ built-in `node:fs`/`node:path`/`node:url` + `node:test`/`node:assert` — **ห้ามเพิ่ม devDeps** ใดๆ
- [ ] **zero-dep lint-gate convention (`docs/rule.md` §2)** — pure fn + injectable IO (feed `Map`) + main-guard + executable verify (positive/negative) — pattern เดียวกับ `lint-md.mjs`/`verify-pack.mjs`
- [ ] **ESM + main-guard (`docs/rule.md` §2)** — `export`/`import`, `import.meta.url`; main-guard ด้วย `argv[1]` comparison ไม่ใช่ `import.meta.main`
- [ ] **ภาษาไทย (`docs/rule.md` §2)** — คอมเมนต์/output เป็นไทย + `✓`/`✖`/`⚠`
- [ ] **canonical-copy (`docs/rule.md` §1)** — CLI contract + C1–C5 + stage→artifact + security invariant **copy verbatim จาก design §4** — ห้ามแต่งใหม่/เพิ่มเช็คเอง (roadmap #14: structural เท่านั้น)

### จุดบังคับจาก panel (design "Design review" B1–B7) — **ต้องสะท้อนในโค้ด+test**
- [ ] **(B1) filled heuristic = H1-placeholder** — ใช้ `/<[^>]+>/` บน H1 บรรทัดแรก; **ห้ามใช้ `const FILLED_MARKERS` list** (เปราะ ไม่ครอบ placeholder จริงของ template)
- [ ] **(B2) C1 ใช้ตาราง stage→artifact design §4.3** — required/optional ตามตาราง (business/discovery = optional → ไม่ false-fail)
- [ ] **(B3) C3 เช็ค ≥1 data row จริง** — ไม่ใช่แค่ header/separator (`|---|`)/row ที่ทุก cell ว่าง (header 4 คอลัมน์มีใน template เปล่าเสมอ)
- [ ] **(B4) C3 ข้ามถ้า `ship.md` ยัง template H1** — chicken-egg: validator รัน topic ตัวเองตอน DESIGN ต้องไม่ false-fail
- [ ] **(B5) error มี `code` field** — `{code,level,msg}` → test assert structured ไม่ใช่ regex string
- [ ] **(B7) slug whitelist จาก `readdirSync('docs/stages/')`** — กัน path traversal → arg ไม่ตรง dir จริง (รวม `../`) = **exit 2**
- [ ] **ระดับเช็คถูกต้อง** — ✖ checks (C2/C3/C5) **ไม่พึ่ง filled-detection** (existence/structure ล้วน); C1/C4 = **⚠ เท่านั้น** (heuristic — ไม่ block)

### Security (design §4.4 / `docs/rule.md` §3.2)
- [ ] **no shell / no egress / no write** — เฉพาะ `node:fs`/`node:path`/`node:url`; **ไม่มี `child_process`** (Security S1), ไม่มี network, ไม่ write fs (read-only tool)
- [ ] **report structural เท่านั้น (Security S2)** — output ชื่อไฟล์/section/code ที่ขาด — **ห้าม echo เนื้อ artifact** (กัน sensitive content รั่วลง CI log)
- [ ] **ENOENT/EACCES guard (Security S3)** — อ่านไฟล์มี guard → exit สะอาด ไม่พ่น absolute path ของ target

### ทั่วไป
- [ ] **ห้ามเดา (`docs/rule.md` §1 / investigate-before-edit)** — อ่าน precedent (`lint-md.mjs`/`installer.test.mjs`) + template artifact จริง (`src/.warnyin/template/stages/[topic]/{ship,design}.md`, `docs/features/spec-delta/spec.md`) ก่อนเขียน heuristic/เช็ค; ไม่ชัด → อ่านซ้ำ ไม่เติมจากความจำ
- [ ] **config-protection (`docs/rule.md` §1)** — ห้ามแก้ test threshold/config เพื่อให้เขียว; แก้โค้ดจริง
- [ ] **ขอบเขตไฟล์** — สร้างใหม่ 2 ไฟล์เท่านั้น; ห้ามแตะ `cli.mjs`/`verify-pack.mjs`/playbook/command/docs กลาง/root dogfood
- [ ] **acceptance = pass count (`docs/rule.md` §5)** — เห็น pass count โตขึ้นจริง ไม่ใช่แค่ exit 0; spawn array args ห้าม `shell:true`; ห้ามรัน cwd=repo root (dogfood leak)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` ตอนนี้ — note ไว้ก่อน; promote ต้อง user ยืนยัน (continuous-learning discipline — `docs/rule.md` §1)

- [ ] **candidate (scope `project`):** "**structural validator เช็คเฉพาะโครง ✖ ต้องไม่พึ่ง filled-detection** (existence/structure ล้วน — deterministic); heuristic ที่เดา 'เติมแล้ว' (H1-placeholder ฯลฯ) เป็น **⚠ best-effort เท่านั้น** ไม่ block"
  - **evidence:** design review B1 (FILLED_MARKERS list เปราะ → เปลี่ยนเป็น H1-heuristic + demote C1 เป็น ⚠) + design §4.2 (ตารางแยกระดับ ✖/⚠ + คอลัมน์ "พึ่ง filled?")
  - **scope:** `project` (หลักการระดับ workflow/tooling ของ repo — ใช้กับ validator/gate อื่นในอนาคต ไม่ผูก component เดียว)
- [ ] **อื่นๆ (เฝ้าดู ไม่บังคับเสนอ):** ถ้าตอน build พบ nuance ของ executable-spawn-harness สำหรับ payload script (ต่างจาก installer spawn) ที่ควรเป็นมาตรฐานกลาง → note พร้อม evidence (ไฟล์+บรรทัด) ส่ง learned-rule ตอน SHIP; **ห้าม promote เองในรอบ build**
