# Business — Adaptive API documentation

> what & why เชิงคุณค่า · promote จาก topic `adaptive-api-doc` (achieved 2026-06-09)

## Goal
ให้โปรเจกต์ backend ที่ใช้ Warnyin workflow ได้ **API contract มาตรฐาน (OpenAPI 3.1)** ที่ machine-readable โดยอัตโนมัติ — โดยไม่กระทบโปรเจกต์ที่ไม่ใช่ backend

## คุณค่า
- **contract-driven:** API design ถูก capture เป็น spec ที่ gen SDK / lint / diff ได้ ไม่ใช่ prose ลอย
- **กัน drift:** VERIFY ยืนยันโค้ดจริงตรง contract — spec กับ implementation ไม่หลุดจากกัน
- **ส่งต่อได้:** contract ถาวรใน `docs/techstack/<component>/openapi.yaml` เป็น living doc ของทีม
- **ไม่เพิ่มภาระโปรเจกต์ที่ไม่เกี่ยว:** auto-detect ข้ามเงียบถ้าไม่ใช่ REST API

## Persona
- **ทีม backend** ที่ติดตั้ง workflow แล้วต้องการ API doc/contract โดยไม่ต้องตั้งค่าเพิ่ม
- **AI ทุก harness** (Claude/Codex/Antigravity) ที่เดิน lifecycle — รู้เองว่าเมื่อไหร่ต้องทำ contract

## Success metric
- topic ที่แตะ REST API → ได้ `openapi.yaml` ที่ valid + ผ่านการ verify ตรงโค้ดจริง
- topic ที่ไม่ใช่ backend → ไม่มี artifact/ภาระเพิ่ม (gate N/A)
