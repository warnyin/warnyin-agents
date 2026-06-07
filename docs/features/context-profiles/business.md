# Business — Context profiles

> what & why เชิงคุณค่า · promote จาก topic `context-profiles`

## คุณค่า (why)
workflow เดิมมี **role card** (task-level lens) แต่ไม่มีกลไกกำหนด "โหมดการทำงานทั้ง session" — session ที่เน้นสำรวจ vs ลงมือ vs ตรวจ ต้องการ posture/default behavior ต่างกัน. context profiles เติม **layer ระดับ session** ที่เป็น anchor ให้ AI สวมท่าทีถูกตั้งแต่ต้น stage แทนที่จะสลับเองแบบไร้หลักยึด

## persona
- **AI หลัก (+ sub-agent)** ที่เดิน workflow — ได้ตัวชี้ posture ทันทีจากหัว playbook
- **user** ที่อยากสั่งโหมดชัดๆ ("อยู่โหมด research")

## ทำไมคุ้ม (จาก roadmap P1 #5 "คุ้มสุด — แทบฟรี")
- `.md` ล้วน — ตรงปรัชญา **tool-agnostic** (ทุก harness อ่านได้) + **กระทัดรัด opinionated**
- risk ต่ำสุดใน P1 — ไม่แตะ runtime/installer; เพิ่มคุณค่าเชิงโครงสร้างโดยไม่เพิ่ม surface

## success metric (ที่ verify แล้ว)
- 3 context card + README ครบ, โครงบาง ไม่ duplicate (D2)
- 5 stage playbook ชี้ context ถูก mapping (3-way consistency: README ↔ callout ↔ card)
- ship ติด payload โดยไม่แตะ installer (verify:pack + sandbox proof)

## ที่มา
ECC `contexts/` pattern — หยิบเฉพาะสาระ portable มาเป็น `.md` กลาง (ไม่ผูก vendor)
