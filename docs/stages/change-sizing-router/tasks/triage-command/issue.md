# Issue — dry-run: triage-command

> ผล dry-run · 2026-06-11 · verdict: **GO (after design fix)** — blocker แก้ที่ design แล้ว

## Blocker (แก้แล้วใน design)
| # | blocker | แก้ |
|---|---|---|
| B1 | pointer ใน command บังคับเป็น markdown-link แต่ relative จาก `.claude/commands/warnyin/` ไป `.warnyin/workflow/triage.md` = `../../../...` (ผิด convention + เปราะ); next.md command ใช้ **backtick target-root runtime-ref** ไม่ใช่ link | ✅ design §4 + task/spec/standard/rule แก้เป็น backtick `` `.warnyin/workflow/triage.md` `` เหมือน next.md; integration proof มาจาก T3 links แทน |

## Defer / by-design
| # | ประเด็น | สถานะ |
|---|---|---|
| D1 | root `CLAUDE.md` (dogfood) ไม่ถูก sync → command list ที่ root ยังไม่เห็น `/warnyin:triage` จนกว่า release-sync | by-design (design §2; root gitignored) — command file มีจริงจึงรันได้; list เป็น doc-surface เท่านั้น |
| D2 | cross-file dead-link (ถ้ามี) พิสูจน์ที่ full-gate | by-design — task-scope = own-file (worktree ไม่มี T1) |

## ✅ Pass (dry-run ยืนยัน)
- frontmatter next.md = `description` + `argument-hint` ลอกครบ
- `installer/templates/CLAUDE.md` มี Slash-commands list (บรรทัด ~12-22) format ตรง (ลอก next/explore)

## สรุป
ไม่มี blocker ค้าง — B1 แก้ที่ design/task แล้ว, D1/D2 by-design
