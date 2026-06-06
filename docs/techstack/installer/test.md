# Test — installer

> วิธีเทส component installer · guideline สำหรับ VERIFY ของ topic ที่แตะ installer

## รันเทส
- **local:** `npm test` (= `node --test` bare, ไม่มี path — portable ทุก node 20/22/24)
- **CI:** `.github/workflows/ci.yml` รัน `npm test` matrix node [20,22,24] ทุก PR/push(main) + job `pack-verify` (`node scripts/verify-pack.mjs`)

## เคสที่ test suite ครอบ (`tests/installer.test.mjs` — 9 เคส, black-box)
1. ติดตั้งสด — โครงครบ (`.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`, `docs/stages`, `docs/project.md`, `CLAUDE.md`, `AGENTS.md`)
2. idempotent — รัน 2 ครั้ง byte-equal + ไม่ append ซ้ำ (`stdout` มี "ข้าม")
3. `--update` ไม่ทับงานจริง — `docs/project.md`/`docs/stages/demo/` คงเดิม
4. `installRootDoc` append section + ไม่ append ซ้ำ (marker)
5. legacy 0.3–0.5.x → warn ที่ `stderr` (string ตรงจาก `cli.mjs`)
6. legacy ≤0.2.x → warn ที่ `stderr` (คนละ string จากเคส 5)
7. `seedDocs` ข้าม `[...]` (negative — ไม่มี path ใต้ `docs/` ขึ้นต้น `[`)
8. `--dry-run` ไม่เขียนไฟล์ (temp ยังว่าง)
9. **scaffold สร้างเปล่า ไม่ leak `docs/stages/<topic>`** — มี `context.md`+`achieved/.gitkeep` แต่ไม่มี topic ของ repo ต้นทาง

## หลักการเทส
- **black-box spawn จริง** — ห้าม import logic จาก `cli.mjs`; assert side-effect จริง
- assert `code===0` ก่อน + surface `stderr`; assert stream ให้ตรง; เทียบ byte ไม่ใช่ mtime
- cross-platform: `process.execPath`, `path.join`, `fileURLToPath` (ห้าม `.pathname` — Windows คืน `/D:/...`)
- cleanup `t.after()` ลงทะเบียนก่อน assert (ลบ temp แม้ fail)

## verify ระดับ topic (VERIFY stage)
- functional: `npm test` เขียวทั้ง suite
- package cleanliness: `npm pack --dry-run --json` → `.warnyin/` ติด + ไม่มี `docs/`/`tests`/`.github` รั่ว
- installer behavior: ติดตั้งจริงใน temp → ตรวจ target ได้เฉพาะ scaffold เปล่า (ไม่มี topic leak)
- CI เขียวจริงบน PR = ยืนยันบน Linux/node อื่น (ทำตอนเปิด PR/merge — outward)
- **dev Windows:** `verify-pack.mjs` รันตรงจะ ENOENT (`troubleshooting.md` #4) → apply allowlist logic เองบน `npm pack --json`
