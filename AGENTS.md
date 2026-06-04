# AGENTS.md

มาตรฐานเปิดสำหรับ AI agent ทุกเจ้าที่อ่านไฟล์นี้ (Codex, Antigravity, และเครื่องมืออื่นที่รองรับ `AGENTS.md`)

## repo นี้คืออะไร

repo มาตรฐานกลางของ **ways of work** สำหรับทุกโปรเจกต์ — เดินงานผ่าน 5 stage:

```
Discovery (optional) ──▶ DESIGN ──▶ BUILD ──▶ VERIFY ──▶ SHIP
```

## กฎสำคัญ: ทำตาม playbook กลางเสมอ

แก่นของแต่ละ stage คือ **single source of truth** อยู่ที่ `warnyin/workflow/stages/`
ก่อนทำงานใน stage ใด ให้เปิดอ่านไฟล์ playbook ของ stage นั้นแล้วทำตามอย่างเคร่งครัด

| Stage | playbook | สถานะ |
|---|---|---|
| Discovery | `warnyin/workflow/stages/discovery.md` | ✅ พร้อมใช้ |
| DESIGN | `warnyin/workflow/stages/design.md` | ✅ พร้อมใช้ |
| BUILD | `warnyin/workflow/stages/build.md` | ✅ พร้อมใช้ |
| VERIFY | `warnyin/workflow/stages/verify.md` | ✅ พร้อมใช้ |
| SHIP | `warnyin/workflow/stages/ship.md` | ✅ พร้อมใช้ |

## วิธีเริ่ม

0. ครั้งแรกในโปรเจกต์ (docs/ ยังว่าง) → ทำตาม `warnyin/workflow/init.md` เพื่อวิเคราะห์โปรเจกต์ + เติม `docs/` ก่อน
1. อ่าน `warnyin/workflow/README.md` เพื่อเข้าใจภาพรวมและโครงสร้าง
2. งานใหม่ → copy `warnyin/template/stages/[topic]/` เป็น `warnyin/stages/<slug>/`
3. รัน stage ตามลำดับ โดยทำตาม playbook ของแต่ละ stage
4. output ของงานเก็บใน `warnyin/stages/<slug>/`, ความรู้ถาวรระดับโปรเจกต์อยู่ใน `docs/`

## รัน Discovery

ทำตาม `warnyin/workflow/stages/discovery.md` — เริ่มอ่าน `docs/project.md`, ตี scope กว้าง→แคบ,
ถามทีละข้อพร้อมเสนอคำตอบที่แนะนำ, คำถามที่ตอบได้ด้วยโค้ดให้ไปอ่านโค้ดเอง,
เขียน output ลง `warnyin/stages/<slug>/discovery.md` และ `research.md`
