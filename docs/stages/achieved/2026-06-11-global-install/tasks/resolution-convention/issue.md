# Dry-run issue — resolution-convention

> ผล dry-run (read-only, 2026-06-11) · **verdict: GO** (0 blocker / 1 defer)

## Blocker
- **ไม่มี** — `CLAUDE.global.md` ใหม่ใต้ `src/.warnyin/installer/templates/` ติด tarball ผ่าน allowlist เดิม (`package.json files: src/.warnyin` + verify-pack `ALLOWED_PREFIX 'src/.warnyin/'`; basename `CLAUDE.global.md` ไม่ชน DENY_FILE ที่จับเฉพาะ root `CLAUDE.md`) · marker `warnyin/workflow/stages/` เดิมใน CLAUDE.md = แก้ append ไม่ลบ (idempotent ไม่พัง) · AGENTS.md DQ3 limitation = spec assert แค่ wording per-project (ไม่ขัด)

## Defer (track)
| # | defer | สถานะ/แก้ |
|---|---|---|
| 1 | `installer/templates/` ถูก `lint:md` scan (ไม่อยู่ใน EXCLUDE) → ถ้าเขียน path เป็น markdown-link `[..](.warnyin/..)` = dead-link fail | ✅ **fold แล้ว** → rule §1: **path เป็น inline-code (backtick) ห้าม markdown-link**; standard.md sample ใช้ backtick อยู่แล้ว (ทำตาม = ปลอด) |

## สรุป
ไม่มี blocker — ไฟล์ใหม่ ship ผ่าน allowlist เดิม, marker เดิมคงอยู่, DQ3 consistent. ระวังเดียว = เขียน path เป็น backtick (fold เข้า rule แล้ว)
