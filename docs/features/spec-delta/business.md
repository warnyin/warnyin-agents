# Business — Spec delta (living behavior spec)

> what & why เชิงคุณค่า · promote จาก topic `feature-spec-delta`

## คุณค่า (why)
เดิมความรู้เชิงพฤติกรรมของระบบ "ค้างอยู่ในอดีต" — spec ระดับ task ถูก archive ไปพร้อม topic ทำให้ (1) **VERIFY ไม่มี regression baseline** ต้องเทสตามความเข้าใจของ model ล้วน (2) **SHIP promote ด้วย judgment ล้วน** เสี่ยง drift ระหว่าง design กับ docs กลาง. spec-delta ปิดทั้งสองด้วย living doc ที่โตแบบมีวินัยผ่าน delta ที่ approve แล้ว

## persona
- **AI ที่เดิน workflow** — ได้ baseline ชัด (VERIFY) + ปลายทาง merge ชัด (SHIP)
- **ทีม/นักพัฒนา** — เปิด `docs/features/<name>/spec.md` แล้วรู้พฤติกรรมปัจจุบันโดยไม่ต้องขุด archive

## ทำไมคุ้ม
- `.md` ล้วน — ตรง **tool-agnostic** + **กระทัดรัด** (ไม่เพิ่มแกนใหม่ ไม่เพิ่ม artifact ต่อ topic — delta เป็น section ใน design.md เดิม)
- ได้ความ deterministic ของ OpenSpec โดยคงหลัก **ห้ามเดา** (key ไม่เจอ → STOP) + **user approve** (delta ผ่าน design gate + promotion plan เดิม — ไม่เพิ่มรอบถาม)

## success metric (ที่ verify แล้ว)
- วงจรครบ 3 stage ใน playbook + template + mirror — consistency ตรง canonical คำต่อคำ (T3)
- กติกา merge พิสูจน์ executable: trace 5 เคสรวม STOP (T5)
- ตัวอย่างจริง 2 spec accuracy ตรง source (T4 — ผ่านหลัง 1 fix)
- ติดตั้งจริงผ่าน sandbox + ไม่ seed leak (T2)

## ที่มา
วิเคราะห์ OpenSpec (Fission-AI) 2026-06-07 — ดู `research.md` ของ topic (achieved): ยืมเฉพาะ 2 เทคนิคที่ผ่านเกณฑ์ roadmap, ตัด OPSX engine/fluid-no-gate/workspaces ทิ้ง
