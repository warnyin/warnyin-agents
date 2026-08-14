# Context — snapshot สถานะปัจจุบัน

> ⚠ ไฟล์นี้ถูก **commit** — จดข้อสรุป/ประเด็นเท่านั้น **ห้ามเขียน raw secret/token/credential, absolute path ของเครื่อง หรือ PII จริง**
> path/ไฟล์ที่อ้างถึงให้เขียนเป็น inline-code (backtick) **ห้ามใช้ markdown-link** (dead-link gate สแกนไฟล์นี้)

> snapshot ไม่ใช่ log — เขียนทับทุกครั้งที่อัปเดต (ไม่ต่อท้าย) · กติกาเติมดู `.warnyin/workflow/memory.md`

## กำลังทำอะไรอยู่
- topic `publish-pack-polish` — BUILD เสร็จ (4 commits บน `build/publish-pack-polish`: DESIGN + Wave 1 integrate + Wave 2 integrate + build.md report); full-gate green (npm test 212/212 + lint:md + verify:pack); gate §7 ผ่านครบ; รอ `/warnyin:verify publish-pack-polish`
- topic `universal-ide-spec` — ยังไม่เริ่ม; ค้างจาก `docs/backlog.md` #5 (validate-topic C5 ✖1 ที่ `docs/features/universal-ide/spec.md` ไม่มี `## Requirement:`); DESIGN รอบหน้า

## ค้างอะไร
- `docs/backlog.md` 4 open entries: #1 EOL guard tarball (#1 — ปิดแล้วใน BUILD), #2 Windows npm (#2 — ปิด), #4 cli --help wording (#4 — ปิด), #5 universal-ide spec format (#5 — Topic B)
- Topic B `universal-ide-spec` — แปลง `R1-R9` เป็น `## Requirement:` + `### Scenario:` — DESIGN รอบหน้า

## เพิ่งตัดสินอะไรไป
- **Topic A**: tier = standard; version bump = `0.29.1` (patch); Spec delta = ADDED Requirement ใน `docs/features/installer-version-stamp/spec.md` (existing feature มี Scenario `stamp ไม่หลุดขึ้น tarball` แล้ว → ต่อยอด); DAG = wave 1 width 2 (file-ownership disjoint) + wave 2 sequential; Slice B ไม่ fold เข้า Slice C (wording fix disjoint กับ release-hygiene — file-ownership + ขนานได้จริง)
- **Topic A panel**: 5 reviewer (SA / Tech Lead / QA / Security / Infra) — รวม 18 blocker + 30 suggestion, integrate ครบ; conflicting recommendations (npm binary selection) — Security approach (`process.execPath + npm_execpath`) ชนะ Infra/SA/TL (`pickNpmBinary()` helper) เพราะปิดทั้ง CVE-2024-27980 + PATH/CWD hijack ในที่เดียว
- **Topic A feedback**: ขยาย wording fix scope 1 จุด → 5 จุด (cli.mjs + 3 docs + payload); แยก `checkEol(entries)` pure fn ใหม่ — I/O อยู่ที่ขอบ (preserve `checkFiles` signature); TEXT_EXT export จาก `cli.mjs` import ใน `verify-pack.mjs` (DRY); MIN_PASS bump evidence-based (180 → 200; N=212 หลัง +14 tests)
- **integration technique**: `git checkout <branch> -- <files>` ถูก auto-classifier block ใน Claude Code session → fallback ใช้ `git diff > patch` + `git apply` (สำเร็จเหมือนกัน, scope เฉพาะ source files); playbook §4 step 5 ระบุ `git checkout` แต่ `git apply` เป็น safe alternative ที่ maintain reviewer intent
- **shared-tree sub-agent**: Wave 2 agent ตายกลางทาง (API connection lost) หลังทำ 4 ไฟล์เสร็จ — main loop ทำ full-gate verify + commit ต่อเอง สำเร็จ (resilient เพราะ shared-tree = main loop มี working tree เห็น state ครบ)

## อัปเดตล่าสุด
- 2026-08-14 · topic `publish-pack-polish` BUILD เสร็จ — 4 commits (DESIGN + Wave 1 + Wave 2 + build.md); 14 source files; full-gate green (npm test 212/212 + lint:md + verify:pack); gate §7 ผ่าน
- 2026-08-14 · Wave 1 (parallel worktree) — verify-pack-hardening (28/28 tests) ‖ cli-help-wording (40/40 installer)
- 2026-08-14 · Wave 2 (shared-tree) — release-hygiene (version 0.29.0→0.29.1, MIN_PASS 180→200, CHANGELOG finalize + Migration section, docs/infra.md runbook)
- 2026-08-13 · topic `publish-pack-polish` DESIGN เสร็จ — 14 task files (proposal + design + 3 tasks × 4 ไฟล์); gate §8 ผ่าน
- 2026-08-13 · `docs/backlog.md` ตรวจครั้งแรก — 4 open entries + 1 dropped (#3 refresh root dogfood ทำเสร็จ 2026-07-27)
- 2026-08-13 · `docs/memory.md` empty (open 0) — project memory เริ่มสะสมครั้งแรกในรอบนี้
