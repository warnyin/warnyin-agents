# Business — Minimalism principle

> คุณค่าเชิงธุรกิจของ feature · promote จาก topic `ponytail-minimalism` (achieved 2026-06-15)

## Goal
ยกระดับคุณภาพ output ของ AI agent ที่เดินผ่าน Warnyin workflow ให้ **กระชับ ไม่ over-engineer** โดยไม่เพิ่ม config และไม่เพิ่ม dependency

## คุณค่า
- ลดแนวโน้ม over-engineering ของ LLM (custom สิ่งที่ stdlib/native ทำได้, abstraction ที่ยังไม่จำเป็น, เขียนเกิน spec) → โค้ดบวมน้อยลง, cost/เวลา/ภาระรีวิวลดลง
- เป็นของที่ **ทุก install ได้ฟรี** (ship ใน playbook กลาง) — สอดเป้าหมายโปรเจกต์ "ติดตั้งแล้ว ways of work กลางใช้ได้ครบ โดยไม่ตั้งค่าเพิ่ม"
- ตกผลึก seed ที่กระจัดกระจายอยู่แล้ว (build context "reuse ก่อนเขียนใหม่", developer "ไม่แถมสิ่งที่ไม่ได้ขอ") ให้มีแกนร่วมเดียว (unify-in-place)

## Persona
- **build sub-agent** (ฝั่งผลิต) — ได้ decision hierarchy เป็น default ตอน generate
- **VERIFY/review session** (ฝั่งตรวจ) — ได้ over-engineering lens จับ bloat
- **ทุกทีม/โปรเจกต์ที่ `npx @warnyin/agents`** — ได้ principle ติดมากับ payload

## Success metric
- `minimalism.md` เป็น single source (full hierarchy ปรากฏที่เดียว) + reachable จากทุก surface ผลิต/ตรวจ (pointer resolve ครบ)
- backward-compatible 100% (เพิ่ม pointer เท่านั้น)
- ship integrity: ติด package + install ลง target จริงผ่าน installer
- มีตัวอย่าง before/after เชิงรูปธรรม (output กระชับลงจริง) ในไฟล์แกน

## ที่มา
- แรงบันดาลใจ: ปรัชญา "lazy senior dev" ของ `ponytail` (https://github.com/DietrichGebert/ponytail) — หยิบ *แนวคิด* มาฝัง native ไม่ใช่ติดตั้ง plugin (รักษา zero-dependency)
