# Proposal — Support Universal IDE

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `support-universal-ide` |
| **ประเภท** | `feature` |
| **ขนาด** | `standard` |
| **วันที่** | `2026-07-09` |
| **มาจาก Discovery?** | ไม่มี |

## 1. สรุป change (what)

เพิ่ม adapter file สำหรับ IDE/harness ที่ใช้ root instruction file pattern — ได้แก่ Cursor, Windsurf, Copilot Chat, Cline/Roo Code, Gemini CLI — โดย installer (`cli.mjs`) จะ **ติดตั้งทุก adapter พร้อมกัน** (unconditional, ไม่ต้อง detect) เพื่อให้ IDE ใดก็ตามที่ user เปิดโปรเจกต์อ่าน Warnyin workflow ได้ทันที

## 2. ทำไม (why)

- **ปัญหา/โอกาส:** ปัจจุบัน installer วาง `CLAUDE.md` (Claude Code) + `AGENTS.md` (Codex/Antigravity) เท่านั้น ทีมที่ใช้ Cursor, Windsurf, Copilot Chat, Cline, Gemini CLI ต้องตั้งค่าเองหรือไม่ได้ประโยชน์จาก workflow
- **ผลถ้าไม่ทำ:** Warnyin workflow ยึดติดกับ Claude Code/Codex — ขัดกับปรัชญา "tool-agnostic" ของ `docs/rule.md §1`

## 3. ทางเลือกที่พิจารณา

| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A: ติดตั้งทุก adapter เสมอ (unconditional) | ง่าย zero-config; user เปิด IDE ไหนก็พร้อม; ไม่ต้อง detect IDE | มีไฟล์เพิ่มในโปรเจกต์ (แต่ส่วนใหญ่ gitignore ได้) | ✅ |
| B: auto-detect IDE ที่ใช้แล้วติดตั้งเฉพาะตัว | ไฟล์น้อย | logic detect ซับซ้อน เปราะ (IDE อาจไม่ install หรือเปลี่ยน path), ต้องรัน installer ใหม่เมื่อเปลี่ยน IDE | |
| C: flag `--ide=cursor,windsurf,...` | user ควบคุมได้ | ต้องรู้ล่วงหน้า, friction สูง | |

- เหตุผลที่เลือก A: สอดกับหลัก "zero-config" ของ project และ "ห้ามเดา" — ไม่เดา IDE ของ user; ทุก adapter เป็นไฟล์ `.md` เบา ไม่มี side-effect ข้าม IDE

## 4. Scope

**In scope**
- เพิ่ม template adapter file สำหรับ: Cursor (`.cursor/rules/warnyin.mdc`), Windsurf (`.windsurf/rules/warnyin.md`), Copilot Chat (`.github/copilot-instructions.md`), Cline/Roo Code (`.clinerules`), Gemini CLI (`GEMINI.md`)
- แก้ `cli.mjs` ให้ install adapter เหล่านี้ทั้ง project mode และ global mode
- `--update` เขียนทับ adapter (เหมือน CORE อื่นๆ)
- เพิ่ม adapter paths ใน `CORE` array
- อัปเดต `CLAUDE.md` template และ `AGENTS.md` section "รองรับหลาย AI" ให้แสดง IDE ที่รองรับใหม่
- อัปเดต verify-pack (`ALLOWED_PREFIX`/`ALLOWED_FILE`) ให้รู้จัก path ใหม่
- เขียน test ครอบ adapter install (black-box)

**Out of scope**
- slash command / skill เฉพาะ IDE ใหม่ (เช่น Cursor rules syntax พิเศษ) — deferred
- auto-detect IDE แล้วเลือก install เฉพาะตัว
- adapter สำหรับ IDE ที่ยังไม่มี root instruction file pattern ชัดเจน (เช่น JetBrains AI)

## 5. ผลกระทบ & ความเสี่ยง

- **verify-pack gate:** ต้องอัปเดต `ALLOWED_PREFIX`/`ALLOWED_FILE` ก่อน publish ไม่งั้น gate หัก
- **global install:** `.github/copilot-instructions.md` เมื่อ install ลง `~/` จะเป็น `~/.github/copilot-instructions.md` — Copilot Chat global อ่านได้ปกติ; Cursor global rules `~/.cursor/rules/` ก็ใช้ได้
- **ไฟล์ซ้อนทับ:** `.clinerules` และ `.cursorrules` เป็น top-level file บางโปรเจกต์อาจมีอยู่ก่อน → ใช้ logic `installRootDoc` (append section ถ้ามี, สร้างใหม่ถ้าไม่มี) แทน `copyTree` เพื่อกัน overwrite งานของ user
- **backward compat:** user ที่ไม่ใช้ IDE เหล่านี้จะมีไฟล์เพิ่มขึ้นเล็กน้อย — รับได้, สามารถ gitignore ได้เอง

## 6. ลิงก์

- Design (how): `./design.md`
- Tasks: `./tasks/`
