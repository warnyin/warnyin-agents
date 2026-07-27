# AGENTS.md

มาตรฐานเปิดสำหรับ AI agent ทุกเจ้าที่อ่านไฟล์นี้ (Codex, Antigravity, CodeBuddy, Cursor, Windsurf, Copilot Chat, Cline/Roo Code, Gemini CLI และเครื่องมืออื่นที่รองรับ `AGENTS.md` หรือ root instruction file pattern)

## repo นี้คืออะไร

repo มาตรฐานกลางของ **ways of work** สำหรับทุกโปรเจกต์ — เดินงานผ่าน 5 stage:

```
Discovery (optional) ──▶ DESIGN ──▶ BUILD ──▶ VERIFY ──▶ SHIP
```

## กฎสำคัญ: ทำตาม playbook กลางเสมอ

แก่นของแต่ละ stage คือ **single source of truth** อยู่ที่ `.warnyin/workflow/stages/`
ก่อนทำงานใน stage ใด ให้เปิดอ่านไฟล์ playbook ของ stage นั้นแล้วทำตามอย่างเคร่งครัด

| Stage | playbook | สถานะ |
|---|---|---|
| Discovery | `.warnyin/workflow/stages/discovery.md` | ✅ พร้อมใช้ |
| DESIGN | `.warnyin/workflow/stages/design.md` | ✅ พร้อมใช้ |
| BUILD | `.warnyin/workflow/stages/build.md` | ✅ พร้อมใช้ |
| VERIFY | `.warnyin/workflow/stages/verify.md` | ✅ พร้อมใช้ |
| SHIP | `.warnyin/workflow/stages/ship.md` | ✅ พร้อมใช้ |

## วิธีเริ่ม

0. ครั้งแรกในโปรเจกต์ (docs/ ยังว่าง) → ทำตาม `.warnyin/workflow/init.md` เพื่อวิเคราะห์โปรเจกต์ + เติม `docs/` ก่อน
1. อ่าน `.warnyin/workflow/README.md` เพื่อเข้าใจภาพรวมและโครงสร้าง
2. งานใหม่ → copy `.warnyin/template/stages/[topic]/` เป็น `docs/stages/<slug>/`
3. รัน stage ตามลำดับ โดยทำตาม playbook ของแต่ละ stage
4. output ของงานเก็บใน `docs/stages/<slug>/`, ความรู้ถาวรระดับโปรเจกต์อยู่ใน `docs/`

## สำรวจโดยไม่สร้าง artifact (EXPLORE)

อยากถาม/สำรวจข้อมูลเฉยๆ โดยไม่เปิด topic → ทำตาม `.warnyin/workflow/explore.md`
(read-only เด็ดขาด — ไม่สร้าง/แก้ไฟล์ใดๆ จบที่คำตอบในแชท)

## เช็คงานค้าง / หาขั้นตอนถัดไป (NEXT)

อยากรู้ว่ามีงานอะไรค้างและควรไปต่อยังไง → ทำตาม `.warnyin/workflow/next.md`
(สแกน `docs/stages/*` ระบุ stage ปัจจุบันจาก artifact จริง + gate ที่ขาด — read-only ไม่แก้ไฟล์)

## รัน Discovery

ทำตาม `.warnyin/workflow/stages/discovery.md` — เริ่มอ่าน `docs/project.md`, ตี scope กว้าง→แคบ,
ถามทีละข้อพร้อมเสนอคำตอบที่แนะนำ, คำถามที่ตอบได้ด้วยโค้ดให้ไปอ่านโค้ดเอง,
เขียน output ลง `docs/stages/<slug>/discovery.md` และ `research.md`

## Project memory
**เฉพาะโปรเจกต์ที่ติดตั้ง warnyin แล้ว (มี `.warnyin/` ที่ root) — ไม่มี → ข้าม section นี้ทั้งหมด**
ความจำระดับโปรเจกต์อยู่ใน repo: `docs/stages/context.md` (สถานะล่าสุด) + `docs/memory.md` (บทเรียนที่ยังไม่เป็นกฎ)
เครื่องที่มี memory store ของตัวเอง (นอก repo) → **เขียนลง 2 ไฟล์นี้แทน** เพื่อไม่ให้ความจำแยกเป็นสองแหล่ง
**ยกเว้น sub-agent ที่ทำงานใน git worktree ของ BUILD: ห้ามเขียน memory เอง** (main loop เขียนตอน integrate)
จดข้อสรุป — **ห้ามเขียน raw secret/token/credential, absolute path ของเครื่อง, หรือ PII จริง** (ไฟล์นี้ถูก commit)
กติกาเต็ม: `.warnyin/workflow/memory.md`

## การ resolve playbook (local-first → global)
- path `.warnyin/workflow/...` / `.warnyin/template/...`: หาในโปรเจกต์ `./.warnyin/` ก่อน ไม่มี → `~/.warnyin/` (global install)
- ถ้ายังไม่มี `docs/stages/` (global mode โปรเจกต์ใหม่) → รัน `/warnyin:init` ก่อน (สร้าง workspace)

> หมายเหตุ: global root doc ของ Codex/Antigravity ไม่รองรับรอบนี้ — convention นี้มีผลเฉพาะ per-project path
