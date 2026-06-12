# Troubleshooting — feedback-issue-command

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ (ส่วนใหญ่ตอน BUILD) แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`
> เจอปัญหาใหม่ → อ่าน `docs/troubleshooting.md` ก่อนเสมอ เผื่อเคยแก้แล้ว

---

### TS-1: registry CLAUDE.md — canonical คือ installer template ไม่ใช่ root dogfood
| | |
|---|---|
| **วันที่** | `2026-06-12` |
| **Component / Task** | `installer` / `tasks/feedback-registration` |
| **ความถี่** | เจอครั้งเดียว (ยาก — design defect) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ:** agent registration แก้ `CLAUDE.md` ที่ root → ไม่ถูก commit (build-wave รายงาน filesChanged มี CLAUDE.md แต่ branch worktree ไม่ติด)
- **บริบทที่ทำให้เกิด (trigger):** design.md §1.1 Contract ระบุ registry target เป็น "CLAUDE.md (root)"
- **สาเหตุที่แท้จริง (root cause):** `CLAUDE.md` ที่ root เป็น **dogfood install (gitignored + not tracked)** — canonical ที่ ship จริงอยู่ที่ `src/.warnyin/installer/templates/CLAUDE.md` (อยู่ใน `package.json` `files`); design ระบุ target คลาดเคลื่อน
- **วิธีแก้ที่ได้ผล (solution):** orchestrator แก้ที่ canonical `src/.warnyin/installer/templates/CLAUDE.md` แทน — ยืนยันด้วย `git check-ignore CLAUDE.md` + `git ls-files --error-unmatch` ก่อนเลือก target (investigate-before-edit, ไม่เดา)
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** ก่อนแก้ไฟล์ registry ที่ root (`CLAUDE.md`/`AGENTS.md`) รัน `git check-ignore <file>` ก่อนเสมอ — ถ้า ignored = dogfood → หา canonical source ใน `src/.warnyin/installer/templates/`

---

### TS-2: nested command namespace ต้อง mkdir directory ก่อน Write
| | |
|---|---|
| **วันที่** | `2026-06-12` |
| **Component / Task** | `installer` / `tasks/feedback-playbook-command` |
| **ความถี่** | เจอครั้งเดียว |
| **ยกขึ้น KB กลางตอน SHIP?** | ❌ (เล็กน้อย — เก็บไว้ระดับ topic พอ) |

- **อาการ:** Write ไฟล์ `src/.claude/commands/warnyin/feedback/issue.md` fail เพราะโฟลเดอร์ `feedback/` ยังไม่มี
- **สาเหตุที่แท้จริง (root cause):** nested namespace แรกใน `.claude/commands/warnyin/` (เดิม flat) — directory `feedback/` ยังไม่ถูกสร้าง
- **วิธีแก้ที่ได้ผล (solution):** `mkdir -p` ก่อน Write ไฟล์ใน nested path ใหม่
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** เช็ค `ls` ก่อน Write ทุกครั้งที่ path มี subdirectory ใหม่
