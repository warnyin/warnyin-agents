# Design (How) — learned-rule

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> Lens: SA (`.warnyin/workflow/roles/sa.md`) · แตก task ด้วย Tech Lead lens

## 1. ภาพรวมสถาปัตยกรรม
- **component:** workflow core (playbook `src/.warnyin/workflow/stages/ship.md`) + adapter command (`src/.claude/commands/warnyin/ship.md`) + template (`.warnyin/template/stages/[topic]/ship.md`) — ไม่แตะ installer/runtime
- **แนวทางหลัก:** **unify** — ขยายกลไก "รอ SHIP" เดิมให้ครอบ **emergent learned rule** (จาก BUILD/VERIFY) เป็น capture step เดียว; ทุก rule candidate = `rule + evidence(บังคับ) + scope` → fold เข้า approval เดิมให้ user ยืนยัน per-rule → promote ตาม scope (reuse target เดิม)
- **หลักการกัน drift:** mechanism wording เป็น **canonical ใน design §2** — playbook (นิยามเต็ม) + command (สั่งทำ) + template (ที่ artifact ลง) อ้างชุดเดียวกัน (1 task เขียนทุกจุดรอบเดียว — precedent #6/#7)

## 2. Canonical — learned-rule mechanism (สัญญาหลัก — ทุกจุดใช้ตรงนี้)

### นิยาม
> **learned-rule** = กฎถาวรที่ **generalize จากบทเรียนของ topic** (ไม่ใช่ incident log) — superset ของ note "รอ SHIP": รวม **planned** (วางแผนตอน DESIGN) + **emergent** (โผล่ตอนลงมือ)

### Capture sources (รวบรวมตอน SHIP)
- **planned:** `tasks/*/rule.md` §2 "เสนอเพิ่ม rule ใหม่ (รอ SHIP)"
- **emergent:** สแกนหาบทเรียนใน `build.md` (pattern แก้ซ้ำ/integration), `verify.md` (รายการแก้+จำนวนรอบ), `troubleshooting.md` (ปัญหายาก→"กันซ้ำ" = candidate ชัดสุด), diff/commit

### Entry format (ทุก candidate)
| field | กฎ |
|---|---|
| **rule** | ข้อความกฎ **generalize** — ถ้าเป็น incident ("X พังเพราะ Y") ต้องยกเป็นกฎ ("ก่อนแก้ Z เช็ค Y เสมอ") |
| **evidence** | **บังคับ** — concrete pointer 1 บรรทัด (ที่มา + ลิงก์ artifact: `build.md`/`verify.md`/`troubleshooting.md`/diff/commit); **ไม่มี evidence = ไม่ promote** |
| **scope** | `component:<c>` → `docs/techstack/<c>/rule.md` · `project` → `docs/rule.md` |
| **promote?** | **user ยืนยัน per-rule** (fold เข้า approval เดิม §5) — ✅ promote / ✂️ ตัด + เหตุผล |

### หลักการ (1 บรรทัดสำหรับ principle 7 ขยาย)
> "เก็บ rule ที่จะ promote ให้หมด — ทั้ง **planned** (`tasks/*/rule.md` §2) และ **emergent** (บทเรียนจาก build/verify/troubleshooting); ทุกตัวต้องมี **evidence (บังคับ)** + **scope** + **user ยืนยัน** ก่อน promote — ไม่มี evidence ไม่ promote (สอด 'ห้ามเดา'); learned-rule = กฎ generalize ไม่ใช่ incident"

## 3. Vertical slices
> change เล็ก + mechanism เดียวกระจาย 3 ไฟล์ → **1 task เดียว** (แยก task = wording drift; vertical slice = "learned-rule mechanism ปรากฏครบ playbook+command+template สม่ำเสมอ") — precedent #6/#7

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **learned-rule capture ครบทุกจุด** — playbook (นิยาม+process+gate) + command (mirror) + template (section) wording สม่ำเสมอ + global noted | playbook · command · template · (global note) · verify (npm test/pack) | `tasks/add-learned-rule/` |

## 4. Interface / contract — จุดเกาะ (mapping)
| จุดเกาะ | ไฟล์ | ใส่อะไร |
|---|---|---|
| principle | `stages/ship.md` §3 principle 7 | ขยาย "เก็บ รอ SHIP" → planned+emergent + evidence บังคับ + scope + user-confirm (canonical §2 หลักการ) |
| process: collect | `stages/ship.md` §4 step 1 | ตอนอ่านเข้าใจ topic → รวบรวม learned-rule candidate (planned `tasks` + emergent build/verify/troubleshooting) |
| process: confirm | `stages/ship.md` §4 step 3 (+ §3 process 3) | fold ตาราง learned-rule (rule+evidence+scope) เข้า AskUserQuestion approval — user ยืนยัน per-rule |
| process: promote | `stages/ship.md` §4 step 5 | promote ตาม scope: component→`techstack/<c>/rule.md`, project→`docs/rule.md` (มีอยู่แล้ว — ผูกกับ scope) |
| gate | `stages/ship.md` §6 | +item "learned-rules (planned+emergent) พิจารณาครบ — ทุก promote มี evidence + user ยืนยัน; ตัดทิ้งมีเหตุผล" |
| command mirror | `.claude/commands/warnyin/ship.md` | step 3 (+collect emergent) + step 5 (fold learned-rule table เข้า approval) |
| template | `template/stages/[topic]/ship.md` §3 | แทน "note รอ SHIP ที่ตัดทิ้ง" → section "Learned rules" (ตาราง rule\|evidence\|scope\|promote?) ครอบทั้ง promote + ตัด |
| global (รอ SHIP) | note `tasks/add-learned-rule/rule.md` §2 → `docs/rule.md` §1 | 1 bullet: continuous-learning discipline (ความรู้ตอนทำ → จับเป็น rule ที่ SHIP, evidence+user-confirm) |

## 5. Flow
- ไม่มี runtime — SHIP process: อ่าน topic (step 1) → **รวบรวม learned-rule candidate** (planned+emergent, ใส่ evidence+scope) → fold เข้า approval (step 3) user ยืนยัน per-rule → archive → promote เฉพาะที่ยืนยัน ตาม scope (step 5) → บันทึกใน `achieved/ship.md` section "Learned rules"

## 6. ผลกระทบต่อระบบเดิม
- backward compat: ต่อยอด §3/§5/§6 เดิม — note "รอ SHIP" กลายเป็น **subset** (planned) ของ learned-rule; ไม่ลบ/แก้ logic เดิม; ผู้ใช้รุ่นเก่ารับตอน `--update`
- template `[topic]/ship.md` §3 เดิม ("note รอ SHIP ที่ตัดทิ้ง") → ขยายเป็น "Learned rules" (ครอบทั้ง promote + ตัด) — achieved ship.md ของ #5-#7 ใช้ pattern ตารางนี้อยู่แล้ว (เป็น superset ธรรมชาติ)
- **regression check:** ไม่มี test assert เนื้อหา playbook/command/template `.md` (installer test = black-box cli behavior) → `npm test` ควรเขียว; **ยืนยันแล้ว:** source template อยู่ `src/.warnyin/template/stages/[topic]/ship.md` (git-tracked) — ติด tarball ผ่าน allowlist `src/.warnyin` (ครอบ `template` ด้วย)
- ไม่ duplicate: learned-rule ≠ troubleshooting (กฎ generalize vs incident) — ระบุชัดในนิยาม §2

## 7. Dependency ระหว่าง slice/task
```
add-learned-rule   (task เดียว — ไม่มี dependency)
```

## 8. Test strategy ระดับ design
- **structural:** mechanism ปรากฏใน ship.md (§3 principle 7 + §4 step 1/3/5 + §6 gate) + command ship.md (step 3/5) + template section "Learned rules" (grep "learned"/"evidence"/"emergent")
- **consistency:** wording 3 จุดมาจาก canonical §2 (playbook นิยามเต็ม ↔ command สั่งทำ ↔ template ตาราง)
- **regression:** `npm test` 18/18 + `verify:pack` เขียว
- **VERIFY (ภายหลัง):** อ่าน behavioral — capture step actionable, evidence บังคับชัด, learned-rule vs troubleshooting ไม่สับสน, fold approval ไม่เพิ่ม gate ซ้อน, global bullet พร้อม promote

## 9. หมายเหตุการตัดสินใจ (ไม่ block)
- **1 task** — mechanism เดียวกระจาย 3 ไฟล์, แยก task เสี่ยง wording drift (precedent #6/#7)
- **source layer ของ template (ยืนยันแล้ว):** แก้ที่ `src/.warnyin/template/stages/[topic]/ship.md` (source, git-tracked) — **ไม่ใช่** root `.warnyin/template/` (dogfood, gitignored)
- root dogfood copy: ข้าม (รอ release — precedent #5-#7)
- global rule placement = `docs/rule.md` §1 (ปรัชญาแก่น — continuous learning discipline คู่ "ห้ามเดา"); ยืนยันตอน SHIP
