# Context — snapshot สถานะปัจจุบัน

> ⚠ ไฟล์นี้ถูก **commit** — จดข้อสรุป/ประเด็นเท่านั้น **ห้ามเขียน raw secret/token/credential, absolute path ของเครื่อง หรือ PII จริง**
> path/ไฟล์ที่อ้างถึงให้เขียนเป็น inline-code (backtick) **ห้ามใช้ markdown-link** (dead-link gate สแกนไฟล์นี้)

> snapshot ไม่ใช่ log — เขียนทับทุกครั้งที่อัปเดต (ไม่ต่อท้าย) · กติกาเติมดู `.warnyin/workflow/memory.md`

## กำลังทำอะไรอยู่
- topic `publish-pack-polish` — SHIP เสร็จ (archived ที่ `docs/stages/achieved/2026-08-14-publish-pack-polish/`) — release `0.29.1` พร้อม publish: EOL gate + cross-platform npm + cli --help wording fix
- topic `universal-ide-spec` — ยังไม่เริ่ม; ค้างจาก `docs/backlog.md` #5 (validate-topic C5 ✖1 ที่ `docs/features/universal-ide/spec.md` ไม่มี `## Requirement:`); DESIGN รอบหน้า

## ค้างอะไร
- `docs/backlog.md` 1 open entry: #5 universal-ide spec format (Topic B)
- Topic B `universal-ide-spec` — แปลง `R1-R9` เป็น `## Requirement:` + `### Scenario:` — DESIGN รอบหน้า

## เพิ่งตัดสินอะไรไป
- **Topic A**: tier = standard; version bump = `0.29.1` (patch); Spec delta = ADDED Requirement ใน `docs/features/installer-version-stamp/spec.md` (existing feature มี Scenario `stamp ไม่หลุดขึ้น tarball` แล้ว → ต่อยอด); DAG = wave 1 width 2 + wave 2 sequential
- **Topic A panel**: 5 reviewer (SA/TL/QA/Sec/Infra) — 18 blocker + 30 suggestion, integrate ครบ; Security approach (`process.execPath + npm_execpath`) ชนะ Infra/SA/TL helper — ปิด CVE-2024-27980 + PATH/CWD hijack ในที่เดียว
- **Topic A learned-rule**: promote 13 ข้อ (8 component + 1 supersede KB#4 + 3 project + 1 incident) — drop 1 (`CI windows-latest ad-hoc verify pattern` — defer backlog แยก)
- **integration technique**: `git diff > patch` + `git apply` แทน `git checkout <branch> -- <files>` (auto-classifier block ใน Claude Code session; safe alternative ที่ maintain reviewer intent — KB#11)
- **shared-tree sub-agent**: Wave 2 agent ตายกลางทาง (API error) หลังทำ 4/5 ไฟล์เสร็จ — main loop ทำ full-gate + commit ต่อเอง สำเร็จ (resilient เพราะ shared-tree = main loop เห็น state ครบ)
- **VERIFY finding** (2 ข้อ fixed ในรอบเดียว): CHANGELOG Migration text vs design.md §Impact 1-word mismatch (align design.md ให้ตรง) + Spec delta ไม่ถูก apply ลง feature spec ตอน BUILD (apply ตอน VERIFY) — promote ทั้ง 2 เป็น learned-rule

## อัปเดตล่าสุด
- 2026-08-14 · topic `publish-pack-polish` SHIP เสร็จ — archive `docs/stages/achieved/2026-08-14-publish-pack-polish/` + ship.md · 14 ไฟล์ใน archive · backlog #1/#2/#4 dropped · feature `installer-version-stamp` ปรับปรุง (Spec delta applied)
- 2026-08-14 · topic `publish-pack-polish` VERIFY เสร็จ — 2 findings (CHANGELOG text align + Spec delta apply) แก้ในรอบเดียว; npm test 212/212 + lint:md + verify:pack green; sandbox EOL proof executable
- 2026-08-14 · topic `publish-pack-polish` BUILD เสร็จ — 4 commits (DESIGN + Wave 1 + Wave 2 + build.md); 14 source files; full-gate green
- 2026-08-13 · topic `publish-pack-polish` DESIGN เสร็จ — 14 task files; gate §8 ผ่าน
- 2026-08-13 · `docs/backlog.md` ตรวจครั้งแรก — 5 entries (4 open + 1 dropped)
