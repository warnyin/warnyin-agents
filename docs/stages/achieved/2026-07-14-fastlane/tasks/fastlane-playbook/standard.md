# Standard — fastlane-playbook

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **อิงจาก** `docs/techstack/installer/standard.md` — task นี้เป็น payload `.md` (ไม่มีโค้ด) → ยึด pattern ของ payload/adapter

## 1. Standard กลางที่ยึด (จาก techstack)
- **mirror layout `src/` = target paths** — `src/.warnyin/workflow/fastlane.md` → install เป็น `.warnyin/workflow/fastlane.md`; `src/.claude/commands/warnyin/fastlane.md` → `/warnyin:fastlane` (ไม่มี mapping table — วางผิดที่ = ไม่ติดตั้ง)
- **command namespace** — `/warnyin:<action>` map กับ `.claude/commands/warnyin/<action>.md`; `copyTree` recursive อยู่แล้ว → **ไม่ต้องแก้ packaging** (`package.json files` มี `src/.claude/commands` แล้ว)
- **ภาษา:** ข้อความผู้ใช้/เอกสารเป็น **ภาษาไทย** ตามสไตล์ payload เดิม
- **assertion เคส install เป็น target-side path** — test ของ task 3 จะ assert `.warnyin/...` ไม่ใช่ `src/.warnyin/...`

## 2. Pattern การเขียนของ task นี้

### 2.1 Playbook กลาง (`src/.warnyin/workflow/fastlane.md`)
mirror โครงของ `src/.warnyin/workflow/triage.md` (top-level playbook พี่น้องกัน):
- ขึ้นต้นด้วย `# FASTLANE — <คำอธิบายสั้น>` + blockquote 2-3 บรรทัด: "Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน" + เป้าหมาย + **★ บรรทัดประกาศ non-canonical** ("กฎทั้งหมด reuse canonical ของ `triage.md`/stage playbook — ไฟล์นี้เป็นผู้เดิน ไม่ตั้งกฎใหม่")
- แบ่ง section ด้วย `---` · หัวข้อระดับ `##` ตาม C3 เป๊ะ (5 อัน — ห้ามเพิ่ม/ลด/เปลี่ยนคำ)
- ★ ใช้ `**★ ...**` นำหน้าข้อที่เป็น hard constraint (สไตล์เดิมของ payload)
- **pointer style (บังคับ):** markdown-link relative จาก `.warnyin/workflow/` — dir เดียวกัน → **ไม่มี `../`** นำหน้า:
  - skip-list: `[fast-track skip-list](triage.md#fast-track-skip-list)` (คำต่อคำ — anchor ต้อง match heading `## Fast-track skip-list`)
  - principle: link ไป `minimalism.md` และ `loop-tuning.md` ด้วย pattern เดียวกับ `stages/build.md:38` / `build.md:67` (label เป็น inline-code ใน bracket)
  - stage: อ้างเป็นข้อความ `stages/build.md §<n>` (inline-code) หรือ markdown-link `stages/verify.md` ก็ได้
- **§3 = pointer-per-row** — ตารางที่มีคอลัมน์ "ชี้ไปที่ไหน" ต่อ step (row ของ skip-list + section ของ stage playbook) **ไม่มีคอลัมน์ที่เล่าเนื้อกฎซ้ำ**
- ASCII flow block ได้ (สั้น) — เหมือน `design.md §5`

### 2.2 Adapter (`src/.claude/commands/warnyin/fastlane.md`) — **mirror `triage.md` adapter**
```md
---
description: <C4 คำต่อคำ>
argument-hint: <C5 คำต่อคำ>
---

ทำหน้าที่เป็น executor ของ fast tier ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `.warnyin/workflow/fastlane.md` ให้ครบก่อน แล้วทำตามทุกหลักการในนั้นอย่างเคร่งครัด
2. ขอบเขต: $ARGUMENTS
   ...
```
- **★ ชี้ playbook ด้วย inline-code backtick เท่านั้น** — ห้าม markdown-link (`lint-md` resolve relative จาก `.claude/commands/warnyin/` → dead link)
- adapter = **บาง** — เล่าแค่ "อ่าน playbook แล้วทำตาม" + map `$ARGUMENTS` + note ข้อบังคับสำคัญสั้นๆ (เช่น "ห้ามแตะโค้ดก่อนเขียน receipt", "หยุดถาม user เมื่อเจอ hard-floor"); **ห้าม duplicate ตาราง rubric/skip-list/gate**
- ความยาวเทียบ `triage.md` adapter (~15 บรรทัด) — ยาวได้แต่ไม่ควรเกินเท่าตัว

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **template receipt:** `.warnyin/template/stages/receipt.md` (มีอยู่แล้ว — playbook แค่**ชี้** ห้าม inline โครง receipt)
- **canonical rubric/skip-list/caps:** `triage.md` (§2B hard-floor · §2C loop-tuning default · §2D caps · Fast-track skip-list)
- **กฎ stage:** `stages/{build,verify,ship}.md` (full-gate · config-protection · investigate-before-edit · archive/promote)
- **principle:** `minimalism.md` (ตอน generate) · `loop-tuning.md` (ตอน fix loop)
> ทั้งหมดนี้ **ชี้ ไม่ copy** — มีเนื้อซ้ำเมื่อไหร่ = test T5/T6 แดง

## 4. เพิ่มเติมเฉพาะ task
- **executor-playbook pattern (ใหม่)** — playbook ที่ "เดิน" กฎของ playbook อื่นแบบ end-to-end ต้องเป็น **orchestration ล้วน** (ลำดับ + gate + escalation) และ pointer-per-row ไปเจ้าของกฎ
  → ถ้าใช้ซ้ำได้ ควรเป็นมาตรฐานกลาง — note ไว้ใน `rule.md §2` (รอ SHIP)
