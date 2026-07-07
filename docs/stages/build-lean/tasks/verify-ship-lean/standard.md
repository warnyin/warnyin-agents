# Standard — verify-ship-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack)

- แก้เฉพาะ **`src/**`** (SOURCE layer) — ห้ามแตะ root dogfood (`.warnyin/`, `.claude/` ที่ root — gitignored, sync หลัง release)
- **ภาษาไทย** — เนื้อหา playbook/command เขียนภาษาไทยตามสไตล์ไฟล์เดิม (ศัพท์เทคนิคทับศัพท์ได้)
- command adapter (`.claude/commands/warnyin/*`) = **adapter บาง ชี้ playbook กลาง ไม่ duplicate logic**

## 2. Pattern การเขียนของ task นี้

- **MODIFY พร้อม anchor quote (investigate-before-edit):** ทุกจุดแก้เป็นการแก้ hook/block **ที่มีอยู่** — หา anchor ตาม quote ใน `task.md §3` ก่อนแก้ แล้วแทนที่ in-place; **ห้ามเพิ่ม hook/block ใหม่ซ้อนของเดิม** (ผลลัพธ์: `★ fast-track hook` เหลือ 1 อันต่อไฟล์เท่าเดิม)
- **canonical-copy:** wording block loop-tuning ใช้ก้อนจาก `design.md §4.5` **คำต่อคำ — ห้ามแต่งใหม่/ย่อ/สลับคำ** (indent ปรับตามตำแหน่ง nesting เดิมได้อย่างเดียว); ส่วน skip-list/lifecycle รายละเอียดเต็มอยู่ `triage.md` — hook เขียนสั้นแล้ว **ชี้ pointer** ไม่ inline ตารางมา
- **md link เท่านั้น** สำหรับ pointer ข้ามไฟล์ — `[ข้อความ](../loop-tuning.md)` / `[fast-track skip-list](../triage.md#fast-track-skip-list)`; **ห้ามใช้ inline code เป็น pointer** (หลุด dead-link gate `lint:md`)
- **โครงเดิมของไฟล์ห้ามขยับ:** เลข section, จำนวน gate item (`verify.md §6` / `ship.md §6`), ตาราง output — แตะเฉพาะจุดที่ `task.md §3` ระบุ

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)

- ก้อน wording สำเร็จรูป: `docs/stages/build-lean/design.md §4.5` (canonical block) + `§4.1` (skip-list row VERIFY/SHIP — ที่มาของสาระใน hook)
- link anchor เดิมที่ต้องคงไว้: `../triage.md#fast-track-skip-list` (canonical skip-list — slice 1 เจ้าของฝั่ง triage.md)
- gate ที่มีอยู่แล้ว: `npm run lint:md` (dead-link) — ใช้ตรวจ pointer หลัง merge wave

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)

- hook wording ควรคงโครงประโยคเดิมของ hook (`ถ้า topic เป็น tier \`fast\` ... → **verify-lite/ship-lite** ตาม [skip-list] — ...; **correctness floor คงไว้ — ...**. tier \`standard\`/\`large\` → flow เต็มด้านล่าง`) เพื่อให้ diff อ่านง่ายและ grep เดิมของ feature change-sizing ไม่พัง — เปลี่ยนเฉพาะสาระตรงกลาง (receipt lifecycle / hard-floor scan)
