# Business — Topic validator (structural validator + status)

> what & why เชิงคุณค่า · promote จาก topic `validator-status`

## คุณค่า (why)
งาน structural (เช็ค artifact ครบ, task มี 4 ไฟล์, โครง spec/delta ถูก, สแกนงานค้าง) เคยใช้ model ทำทั้งหมด — เปลือง token, ไม่ deterministic, พลาดได้เมื่อ topic เยอะ. validator ย้ายส่วน **โครง** ไปเป็น script ที่ deterministic + ฟรี token (เทียบ `openspec validate`/`status`) เหลือให้ model ทำเฉพาะ **semantic** ที่ต้องใช้วิจารณญาณจริง

## persona
- **AI ที่เดิน workflow** — `/warnyin:next` ได้ structural pre-scan ก่อนอ่าน semantic, gate เช็คโครงได้เร็ว/แน่นอน
- **maintainer** — รัน status เห็นภาพรวมทุก topic + validate ก่อน promote

## ทำไมคุ้ม
- `.md`/script `node:*` ล้วน — ตรง **zero-dep** + **tool-agnostic** (script ใน payload ทุก harness เรียกได้ผ่าน node)
- **opinionated** — เช็คเฉพาะ high-signal 5 กลุ่ม (roadmap #14) ไม่ไหลเป็น validation framework; ✖ ไม่พึ่งการเดา (กัน false-fail)

## success metric (ที่ verify แล้ว)
- validator รันจริง 2 โหมด — status/validate/path-traversal/C1-C5 ครบ (verify T2)
- dogfood: เช็ค feature spec จริง 3 ไฟล์ผ่าน C5 + self-validate topic ตัวเอง (verify T3)
- wiring 3 จุด + node-guard fallback (verify T5) · suite 26→53

## ที่มา
วิเคราะห์ OpenSpec (Fission-AI) 2026-06-07 — ข้อ 3 ที่แยกเป็น topic ต่างหาก (validator/status) หลัง `feature-spec-delta` ship; ทำหลัง spec/delta format นิ่งแล้ว validator ถึงเช็คโครงได้ตรง (ตกลงไว้ตอน discovery feature-spec-delta)
