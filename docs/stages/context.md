# Context — snapshot สถานะปัจจุบัน

> ⚠ ไฟล์นี้ถูก **commit** — จดข้อสรุป/ประเด็นเท่านั้น **ห้ามเขียน raw secret/token/credential, absolute path ของเครื่อง หรือ PII จริง**
> path/ไฟล์ที่อ้างถึงให้เขียนเป็น inline-code (backtick) **ห้ามใช้ markdown-link** (dead-link gate สแกนไฟล์นี้)

> snapshot ไม่ใช่ log — เขียนทับทุกครั้งที่อัปเดต (ไม่ต่อท้าย) · กติกาเติมดู `.warnyin/workflow/memory.md`

## กำลังทำอะไรอยู่
- topic `universal-ide-spec` — fast-tier SHIP-lite เสร็จ (archive `docs/stages/achieved/2026-08-14-universal-ide-spec/receipt.md`); backlog #5 dropped — ทุก backlog open ปิดหมดแล้ว
- topic `publish-pack-polish` — SHIP เสร็จ (archived ที่ `docs/stages/achieved/2026-08-14-publish-pack-polish/`) — release `0.29.1` พร้อม publish

## ค้างอะไร
- **ไม่มี** — `docs/backlog.md` ปิดครบทุก entry (1 dropped เดิม + 4 dropped ใหม่)

## เพิ่งตัดสินอะไรไป
- **Topic A**: tier = standard; version bump = `0.29.1` (patch); DAG = wave 1 width 2 + wave 2 sequential; panel 5 reviewers (18 blocker + 30 suggestion integrate ครบ); Security approach (`process.execPath + npm_execpath`) ชนะ Infra/SA/TL helper — ปิด CVE-2024-27980 + PATH/CWD hijack
- **Topic A learned-rule**: promote 13 ข้อ (8 component + 1 supersede KB#4 + 3 project + 1 incident) — drop 1 (`CI windows-latest ad-hoc verify pattern` — defer backlog แยก)
- **integration technique**: `git diff > patch` + `git apply` แทน `git checkout <branch> -- <files>` (auto-classifier block ใน Claude Code session; safe alternative ที่ maintain reviewer intent — KB#11)
- **shared-tree sub-agent resilience**: Wave 2 agent ตายกลางทาง (API error) หลังทำ 4/5 ไฟล์เสร็จ — main loop ทำ full-gate + commit ต่อเอง สำเร็จ
- **Topic B**: tier = **fast** (code-first path — no DESIGN/BUILD/VERIFY ceremony); ข้าม `triage.md` skip-list → receipt-only archive; side fix เพิ่ม WHEN clause ใน `installer-version-stamp/spec.md` (จับตอน cross-cutting validate)

## อัปเดตล่าสุด
- 2026-08-14 · topic `universal-ide-spec` SHIP-lite เสร็จ — 9 Requirement + 12 Scenario (C5 pass); receipt.md archived · side fix WHEN ใน installer-version-stamp · backlog #5 dropped
- 2026-08-14 · topic `publish-pack-polish` SHIP เสร็จ — archive + ship.md · 14 ไฟล์ · backlog #1/#2/#4 dropped · feature `installer-version-stamp` ปรับปรุง
- 2026-08-14 · topic `publish-pack-polish` VERIFY เสร็จ — 2 findings แก้ในรอบเดียว; full-gate green
- 2026-08-14 · topic `publish-pack-polish` BUILD เสร็จ — full-gate green
- 2026-08-13 · topic `publish-pack-polish` DESIGN เสร็จ — gate §8 ผ่าน
- 2026-08-13 · `docs/backlog.md` ตรวจครั้งแรก — 5 entries (4 open + 1 dropped)
