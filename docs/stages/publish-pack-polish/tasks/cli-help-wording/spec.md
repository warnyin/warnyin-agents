# Spec — cli-help-wording

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`docs` (wording fix 5 places) + `UX-UI` (CLI help text — user-facing) — ไม่ใช่ API

---

## 2. API SPEC
N/A — CLI text ไม่ใช่ REST API contract

## 3. UX/UI SPEC
- **Wireframe:** ไม่มี (text-only CLI help)
- **States:** default (single output เมื่อ `--help`)
- **wording contract:**
  - เก่า: "ไม่แตะ docs/ และงานจริง" (misleading — `seedDocs()` รันจริงแม้ `--update`)
  - ใหม่: "เขียนทับเฉพาะ CORE — `docs/` ถูก seed จาก template ถ้ายังไม่มี (ไม่ทับของเดิม)"
  - ความหมาย: เดิมคือ "ไม่มี write ใด ๆ ลง docs/" ซึ่งผิด (seedDocs copy template ลง docs/ ถ้ายังไม่มี); ใหม่คือ "write = overwrite CORE เท่านั้น + seed docs/ แต่ไม่ทับของ user"

## 4. Data-flow
```
npx @warnyin/agents --help (user invocation)
  └─ node src/bin/cli.mjs --help
       └─ console.log(<help string>)
            └─ บรรทัดที่แก้: "(เขียนทับเฉพาะ CORE — ไฟล์ docs/ ถูก seed จาก template
                              ถ้ายังไม่มี ไม่ทับของเดิม)"
```
+5 ไฟล์ที่แก้ wording เดียวกัน (ดู §User-flow)

## 5. User-flow
- **ผู้ใช้อ่าน `--help`** → เห็น wording ใหม่ → เข้าใจตรงว่า `--update` เขียนทับ CORE อย่างเดียว + docs/ ถูก seed (แต่ไม่ทับของเดิม)
- **ผู้ใช้อ่าน `CLAUDE.md` ที่ติดตั้งในโปรเจกต์ตัวเอง** → เห็น wording เดียวกัน → single source
- **ผู้ใช้อ่าน `README.md` บน npm/GitHub** → เห็น wording เดียวกัน
- **ผู้ใช้อ่าน `workflow/README.md`** (ที่ install ลง `.warnyin/workflow/README.md`) → เห็น wording เดียวกัน

## 6. Persona
- **ผู้ใช้ปลายทาง** ที่อ่าน `--help` / README / CLAUDE.md → เข้าใจ behavior `--update` ตรงความจริง
- **contributor / maintainer** ที่อ่าน README/CLAUDE → เห็น wording consistent

## 7. Test-flow
> ทดสอบ/ยืนยันความถู้มข้องยังไง (เคสที่ต้องผ่าน, edge case)

### Spawn test (regression guard — slice B มี test layer)
- [ ] `spawnSync(node, [cliPath, '--help'])` → stdout `includes` substring ใหม่ `(เขียนทับเฉพาะ CORE`
- [ ] `spawnSync(node, [cliPath, '--help'])` → stdout `NOT includes` substring เก่า `ไม่แตะ docs/`
- [ ] assert exit code === 0

### Structural grep (5 จุดที่แก้)
- [ ] `grep -F 'ไม่แตะ docs/' src/bin/cli.mjs src/.warnyin/installer/templates/CLAUDE.md src/.warnyin/workflow/README.md README.md` = empty
- [ ] `grep -F 'ไม่แตะ \`docs/\`' src/bin/cli.mjs src/.warnyin/installer/templates/CLAUDE.md src/.warnyin/workflow/README.md README.md` = empty
- [ ] แต่ละไฟล์ที่แก้ `includes` substring `เขียนทับเฉพาะ CORE` (หรือ wording ใหม่ที่ตกลง)

### Negative pre-check (ก่อนแก้ — rule §5 investigate-before-edit)
- [ ] grep `--help` ใน `src/tests/installer.test.mjs` ก่อนแก้ = 0 matches (ไม่มี assertion เก่าที่ pin wording เก่า)

### RED proof (falsifiability)
- [ ] revert wording fix → เคส spawn test fail (substring เก่ากลับมา)
- [ ] restore → เขียว

### CHANGELOG header ownership (TL blocker #2)
- [ ] Slice B สร้าง `## [0.29.1]` (ว่าง ไม่มีวันที่) + entry `Fixed:` ที่รับผิดชอบ — **ไม่** สร้าง/ย้าย entry ของ Slice C
- [ ] Slice C เติมวันที่ + Migration section — **ไม่** สร้าง entries ของ Slice B ใหม่