# Standard — stage-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน **playbook markdown** ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/workflow-core/standard.md` (ถ้ามี) — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack / payload เดิม)

- **ภาษาไทย กระชับ** — สไตล์เดียวกับ playbook ที่มีอยู่ (`stages/*.md`, `next.md`, `explore.md`)
- **tool-agnostic** — ห้ามอ้างชื่อรุ่น/ผลิตภัณฑ์ของ harness ใน payload (`docs/rule.md §1`); contract ที่ copy มาไม่มีอยู่แล้ว **ห้ามเติมเอง**
- **hook แบบ conditional** — ทุก hook ที่เพิ่มต้องมีทางออก "ไม่เข้าเงื่อนไข → ข้าม" (stage-invoked capability convention) เพื่อไม่ block topic ที่ memory ไม่เกี่ยว
- **pointer บาง ไม่ inline กฎ** — canonical-copy: กติกาเต็มอยู่ `.warnyin/workflow/memory.md` (ของ T1) ที่นี่ชี้กลับเท่านั้น
- **LF ล้วน** — ไฟล์ payload ทุกใบต้องเป็น LF (บทเรียน CRLF: commit `0a2e7c4`); แก้บน Windows ระวัง editor แปลง EOL ทั้งไฟล์

## 2. Pattern การเขียนของ task นี้

### 2.1 รูปแบบการวาง hook ท้าย §4

ใช้ **blockquote บรรทัดเดียว** คั่นจาก step list ด้วยบรรทัดว่าง — สไตล์เดียวกับ blockquote ปิดท้าย §4 ของ `design.md` และ callout `★ fast-track hook` ใน `ship.md §1`:

```
7. **ปิดงาน:** ...บรรทัดสุดท้ายของ step list เดิม...

> **★ อัปเดต project memory (conditional):** ...
```

- ขึ้นต้นด้วย `> **★ ` เพื่อให้เข้าชุดกับ callout เดิมของ payload
- **ห้ามใส่เป็นข้อ 8 ของ numbered list** — hook เป็น note ท้าย stage ไม่ใช่ step ในลำดับงาน (ยกเว้น C4b ที่ contract ระบุชัดว่าเป็น **ข้อย่อย 8 ของ step 5**)

### 2.2 รูปแบบ replacement (C3a/C3b/C3c)

- **แทนที่ทั้งบรรทัด** ด้วย string จาก contract — คงเลขข้อเดิม (contract มีเลขข้อมาให้แล้ว: `5.`, `2.`, `4.`)
- **ห้ามเพิ่มบรรทัดใหม่ซ้อน** — unify-in-place (`docs/rule.md §1`); ผลลัพธ์ต้องไม่มีคำสั่งอ่าน `context.md` 2 บรรทัดในไฟล์เดียว
- **sub-bullet ที่ห้อยอยู่ใต้บรรทัดเดิมต้องคงไว้** (เคส `explore.md` ข้อ 4 มี sub-bullet เรื่อง `achieved/` = archive)

### 2.3 รูปแบบ append (C5a/C5b)

- **ต่อท้ายบรรทัดเดิม ไม่ขึ้นบรรทัดใหม่** — string ของ contract ขึ้นต้นด้วยตัวคั่น (`; ` และ `· `) มาแล้ว จึงต่อได้ตรงๆ
- ห้ามเปลี่ยนถ้อยคำเดิมของบรรทัดที่ต่อท้าย

### 2.4 รูปแบบแถวตาราง (C2c)

- คอลัมน์ `#` ใช้ `—` (em dash) ไม่ใช่ตัวเลข — เพราะไม่ใช่ step ตามลำดับ แต่เป็น note ท้ายตาราง
- จำนวนคอลัมน์ต้องตรงกับ header ของตารางเดิม (3 คอลัมน์: `# | step | เจ้าของกฎ`)

### 2.5 error handling / edge case

- **ไฟล์ปลายทางมี hook อยู่แล้ว** (rerun/resume) → **idempotent: ไม่เพิ่มซ้ำ** ตรวจก่อนเขียนทุกครั้ง
- **หา anchor บรรทัดเดิมไม่เจอ** (ไฟล์ถูกแก้ไปแล้ว) → **หยุด รายงาน ห้ามเดาตำแหน่ง** (`docs/rule.md §1` investigate-before-edit)
- **contract string ใน `design.md §4` ต่างจากที่จำ** → `design.md` ชนะเสมอ อ่านซ้ำก่อน copy

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)

- **`design.md §4`** = แหล่ง string เดียว — ไม่มี util ให้ import; "reuse" ในบริบทนี้คือ **copy คำต่อคำ** ไม่แต่งใหม่
- **`.warnyin/workflow/memory.md`** (T1) = เจ้าของกฎเต็ม — ที่นี่ชี้กลับด้วย relative link เท่านั้น
- **`.warnyin/workflow/scripts/memory-status.mjs`** (T5) = ตัวรัน — `next.md` อ้างชื่อ path ผ่านข้อความ ไม่ import
- Callout pattern เดิมที่ลอกโครงได้: `ship.md §1` (`★ fast-track hook`), `build.md §4 ข้อ 6` (`★ loop tuning`), `discovery.md §4 ข้อ 3` (conditional "ไม่มี → ข้าม")

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)

- **contract-as-copy-source workflow** — ก่อนแก้แต่ละไฟล์: เปิด `design.md §4` → copy block → paste → เทียบด้วยตาเปล่า 1 รอบ (ไม่พิมพ์เอง ไม่ย่อ ไม่แปลง `**` เป็นอย่างอื่น)
- **verify ทีละไฟล์ ไม่รอจบทั้งหมด** — grep ตาม `spec.md §7` หลังแก้แต่ละไฟล์ ลด rework (lean self-verify ตาม `docs/rule.md §1` DAG-width)
