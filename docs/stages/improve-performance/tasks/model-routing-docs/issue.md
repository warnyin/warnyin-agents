# Issue — dry-run: model-routing-docs

> ผล dry-run · 2026-06-10 · verdict: **GO — ไม่มี blocker**

## Blocker
- ไม่มี — ทุก anchor/contract/ขอบเขตสอดคล้องไฟล์จริง:
  - §Model tier มีจริง (README ~39, build.md ~21) → ขยาย unify ได้
  - ชื่อรุ่นจริงใน `.claude/commands/` ไม่ขัด rule (adapter — payload-guidance ผูกเฉพาะ `.warnyin/`)
  - field `Model tier` ใน template ไม่ทำ test แดง (validate-topic เช็ค existence; ไม่มี test assert meta table)
  - regression `balanced+`: subset `{cheap,balanced,deepest}` คนละมิติ → 7 Scenario ของ context-profiles ยัง pass

## ⚠️ ข้อต้องระวังตอน BUILD
1. รอ `build-wave-model-arg` (wave 1) ส่ง arg shape จริงก่อน (chain แท้ — DAG ถูก)
2. แก้ `command/build.md` บรรทัด ~15 ส่ง `{name, model}[]` + เพิ่มขั้น map tier→รุ่น (orchestrator map ไม่ใช่ payload)
3. **เพิ่มอย่างเดียวใน `contexts/`/`template/` ห้ามแก้/ลบของเดิม** (กัน regression 7 Scenario) — ห้ามแตะ heading 4 section, แถว mapping เดิม, บรรทัด `**Model tier:**` ของ research/build/review
4. **ห้ามชื่อรุ่นจริงรั่วเข้า payload** แม้ในประโยคปฏิเสธ (rule §1 กัน grep false-positive)

## Defer
| # | ประเด็น | เหตุผล |
|---|---|---|
| D1 | รูปแบบ field `Model tier` (table row vs note) | เลือกตอน BUILD — แนะนำ row ตาม precedent `build-wave-model-arg/task.md` |
| D2 | rule ใหม่ "tier→model map ที่ adapter เท่านั้น" | รอ SHIP (rule.md §2) |
| D3 | pointer ใน command/design.md | pointer บาง — wording เลือกตอน BUILD |

## สรุป
ไม่มี blocker ค้าง — ข้อ 1-4 เป็น guard ที่บันทึกใน task แล้ว
