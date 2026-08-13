# Context — snapshot สถานะปัจจุบัน

> ⚠ ไฟล์นี้ถูก **commit** — จดข้อสรุป/ประเด็นเท่านั้น **ห้ามเขียน raw secret/token/credential, absolute path ของเครื่อง หรือ PII จริง**
> path/ไฟล์ที่อ้างถึงให้เขียนเป็น inline-code (backtick) **ห้ามใช้ markdown-link** (dead-link gate สแกนไฟล์นี้)

> snapshot ไม่ใช่ log — เขียนทับทุกครั้งที่อัปเดต (ไม่ต่อท้าย) · กติกาเติมดู `.warnyin/workflow/memory.md`

## กำลังทำอะไรอยู่
- topic `publish-pack-polish` — DESIGN เสร็จ (gate §8 ผ่าน: proposal + design + 3 tasks × 4 ไฟล์); รอ `/warnyin:build publish-pack-polish` (wave 1: verify-pack-hardening ‖ cli-help-wording → wave 2: release-hygiene)
- topic `universal-ide-spec` — ยังไม่เริ่ม; ค้างจาก `docs/backlog.md` #5 (validate-topic C5 ✖1 ที่ `docs/features/universal-ide/spec.md` ไม่มี `## Requirement:`); DESIGN ต่อไป

## ค้างอะไร
- `docs/backlog.md` 4 open entries: #1 EOL guard tarball (#1 — topic นี้ปิด), #2 Windows npm (#2 — ปิด), #4 cli --help wording (#4 — ปิด), #5 universal-ide spec format (#5 — Topic B)
- Topic B `universal-ide-spec` — แปลง `R1-R9` เป็น `## Requirement:` + `### Scenario:` — DESIGN รอบหน้า

## เพิ่งตัดสินอะไรไป
- **Topic A**: tier = standard; version bump = `0.29.1` (patch); Spec delta = ADDED Requirement ใน `docs/features/installer-version-stamp/spec.md` (existing feature มี Scenario `stamp ไม่หลุดขึ้น tarball` แล้ว → ต่อยอด); DAG = wave 1 width 2 (file-ownership disjoint) + wave 2 sequential; Slice B ไม่ fold เข้า Slice C (wording fix disjoint กับ release-hygiene — file-ownership + ขนานได้จริง)
- **Topic A panel**: 5 reviewer (SA / Tech Lead / QA / Security / Infra) — รวม 18 blocker + 30 suggestion, integrate ครบ; conflicting recommendations (npm binary selection) — Security approach (`process.execPath + npm_execpath`) ชนะ Infra/SA/TL (`pickNpmBinary()` helper) เพราะปิดทั้ง CVE-2024-27980 + PATH/CWD hijack ในที่เดียว
- **Topic A feedback**: ขยาย wording fix scope 1 จุด → 5 จุด (cli.mjs + 3 docs + payload); แยก `checkEol(entries)` pure fn ใหม่ — I/O อยู่ที่ขอบ (preserve `checkFiles` signature); TEXT_EXT export จาก `cli.mjs` import ใน `verify-pack.mjs` (DRY); MIN_PASS baseline 180 (ไม่ใช่ 46) → bump ตาม pass count จริง (estimated 190 หลัง +5 เคส)

## อัปเดตล่าสุด
- 2026-08-13 · topic `publish-pack-polish` DESIGN เสร็จ — 14 ไฟล์ (`proposal.md` + `design.md` + 3 tasks × 4 ไฟล์); gate §8 ผ่าน (C1/C2/C4 clean; C5 fail เป็น Topic B scope)
- 2026-08-13 · `docs/backlog.md` ตรวจครั้งแรก — 4 open entries + 1 dropped (#3 refresh root dogfood ทำเสร็จ 2026-07-27)
- 2026-08-13 · `docs/memory.md` empty (open 0) — project memory เริ่มสะสมครั้งแรกในรอบนี้