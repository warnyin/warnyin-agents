<!-- warnyin:global-note -->

## การ resolve playbook (local-first → global)
- path `.warnyin/workflow/...` / `.warnyin/template/...`: หาในโปรเจกต์ `./.warnyin/` ก่อน ไม่มี → `~/.warnyin/` (global install)
- ถ้ายังไม่มี `docs/stages/` (global mode โปรเจกต์ใหม่) → รัน `/warnyin:init` ก่อน (สร้าง workspace)

## Project memory
**เฉพาะโปรเจกต์ที่ติดตั้ง warnyin แล้ว (มี `.warnyin/` ที่ root) — ไม่มี → ข้าม section นี้ทั้งหมด**
ความจำระดับโปรเจกต์อยู่ใน repo: `docs/stages/context.md` (สถานะล่าสุด) + `docs/memory.md` (บทเรียนที่ยังไม่เป็นกฎ)
เครื่องที่มี memory store ของตัวเอง (นอก repo) → **เขียนลง 2 ไฟล์นี้แทน** เพื่อไม่ให้ความจำแยกเป็นสองแหล่ง
**ยกเว้น sub-agent ที่ทำงานใน git worktree ของ BUILD: ห้ามเขียน memory เอง** (main loop เขียนตอน integrate)
จดข้อสรุป — **ห้ามเขียน raw secret/token/credential, absolute path ของเครื่อง, หรือ PII จริง** (ไฟล์นี้ถูก commit)
กติกาเต็ม: `.warnyin/workflow/memory.md`
