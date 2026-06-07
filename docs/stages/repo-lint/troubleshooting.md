# Troubleshooting — repo-lint

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ (ส่วนใหญ่ตอน BUILD) แล้วแก้สำเร็จ

## 1. strip-code 2-pass พังเมื่อ markdown มี triple-backtick ฝังใน inline-code (meta-doc อธิบาย regex)
- **อาการ:** `lint-md` จับ false-positive — `docs/stages/repo-lint/design.md: ลิงก์เสีย -> ...` + `spec.md: ลิงก์เสีย -> y` ทั้งที่ `[](...)`/`[x](y)` อยู่ใน code-span (เอกสาร repo-lint เองอธิบาย regex จึงมี `` ``` `` ฝังใน inline-code)
- **Root cause:** strip code ทำเป็น 2 pass แยก `.replace(fenced).replace(inline)` — เมื่อ inline-code มี `` ``` `` ฝัง (เช่น `` `content.replace(/```...```/g,'')` ``) fenced-pass แรกกินทะลุ inline span ทำลาย backtick ที่ป้องกัน `[](...)`; สลับ inline-first ก็พังอีกทาง (fenced block จริงโดน inline regex กินครึ่ง → `y` หลุด)
- **วิธีแก้:** ใช้ **alternation regex pass เดียว** `/```[\s\S]*?```|`[^`\n]*`/g` — match code construct "อันที่เปิดก่อน" ตามลำดับเอกสาร (left-to-right); inline span ที่ห่อ `` ``` `` ถูกกินเป็น inline-match ก่อน fenced regex เอื้อม → ทั้ง fenced block จริง + inline span ที่มี `` ``` `` ฝัง strip ถูกพร้อมกัน. verify: unit (fenced+inline เคส) + repo จริง 0 dead — **คง exclude แค่ `docs/stages/achieved/`** (ตาม design D), active stage docs lint สะอาดได้ด้วย strip-fix (ไม่ต้อง over-exclude `docs/stages/` ทั้งก้อน)
- **ป้องกันซ้ำ:** strip หลาย code construct ที่ nest/overlap ได้ — **ห้าม sequential `.replace().replace()`** ใช้ **alternation เดียว** ให้ regex engine จัดลำดับ match ตาม position; เทสด้วย input ที่ delimiter ชนิดหนึ่งฝังในอีกชนิด (`` ``` `` ใน inline-code) เสมอ
- **บทเรียน gate ปิดท้าย:** sub-agent self-verify เคลม "0 dead เขียว" แต่จริงแดง (น่าจะ `| tail` บัง exit code) → **main-loop full-gate ตรวจ exit จริง** (`cmd > f 2>&1; E=$?`) จับได้ — ตอกย้ำว่า full-gate ห้ามเชื่อรายงาน sub-agent ต้องรันเอง
