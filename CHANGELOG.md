# Changelog

ทุกการเปลี่ยนแปลงที่สำคัญของโปรเจกต์นี้ถูกบันทึกในไฟล์นี้

รูปแบบอ้างอิง [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
และโปรเจกต์ยึด [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## Migration guide

อัปเกรดจากรุ่นเก่าที่ layout ต่างไป (installer จะ **เตือนให้ย้ายเอง ไม่แตะงานจริงของคุณ**) — ทำตามตารางก่อนรัน `npx @warnyin/agents` รอบใหม่:

| จากรุ่น | layout เดิม | ต้องทำเอง (งานจริงปลอดภัย ไม่ถูกแตะ) |
|---|---|---|
| **≤0.2.x** | core อยู่ `workflow/` + งานจริง `warnyin-stages/` ที่ root | `git mv warnyin-stages docs/stages` แล้ว `git rm -r workflow` |
| **0.3–0.5.x** | ทุกอย่างใต้ `warnyin/{workflow,template,installer,stages}` | `git mv warnyin/stages docs/stages` แล้ว `git rm -r warnyin/workflow warnyin/template` |

จากนั้นรัน installer อีกครั้ง — installer จะวาง `.warnyin/` (core) ชุดใหม่ + แยกงานจริงไว้ที่ `docs/stages/` ให้

> **0.6.0 → 0.7.0:** ผู้ใช้ปลายทาง (`npx @warnyin/agents`) **ไม่ต้องทำอะไร** — payload ที่ติดตั้งคงเดิม การเปลี่ยนแปลงทั้งหมด (bin path → `src/`, dogfood 2-layer) เป็นเรื่องภายใน repo เท่านั้น; ผู้พัฒนา repo เอง (contributor) ดู [`CONTRIBUTING.md`](CONTRIBUTING.md)

## [Unreleased]

## [0.7.0] - 2026-06-07

### Added
- **Bootstrap / self-hosting (2-layer):** แยก source ของ warnyin ทั้งหมดเข้า `src/` (committed/publish layer); repo install release เสถียรไว้ root เป็น dogfood (`.warnyin/`/`.claude/`/`CLAUDE.md`/`AGENTS.md` — gitignored) เพื่อพัฒนา `src/` โดย workflow ที่ใช้ทำงานยังเสถียร
- `npm run setup:dogfood` — คืน dogfood env ที่ root จาก release (`npx @latest` + fallback `npm pack`→extract→node สำหรับ Windows), append pointer → `CONTRIBUTING.md` แบบ idempotent
- `npm run setup:sandbox` — install v-next จาก `src/` ลง temp dir (`os.tmpdir()`) เพื่อทดสอบ version skew โดยไม่แตะ dogfood ที่ root
- `CONTRIBUTING.md` — dev-instructions ของ repo (แยกจาก root `CLAUDE.md` เดิม)
- pass-count gate (`src/scripts/check-test-count.mjs`) — anti-false-green: fail ถ้า `fail≠0` / `pass<9` / `pass≠tests`
- Automated installer test suite (`node:test` black-box — spawn `src/bin/cli.mjs` จริงใน temp dir แล้ว assert side-effect) + unit test `checkFiles` รันด้วย `npm test`
- GitHub Actions CI (`.github/workflows/ci.yml`) — matrix node 20/22/24 + job `pack-verify`
- npm-pack verify (`src/scripts/verify-pack.mjs`) — testable `checkFiles(files)→errors[]`: allowlist granular + denylist (tooling/`docs/`/dogfood ที่ root) + tripwire (`settings.local.json`/`*.tgz`/`.env*`); assert `src/.warnyin/workflow/` + `src/.claude/commands/warnyin/` ติด tarball

### Changed
- **bin path** `bin/cli.mjs` → `src/bin/cli.mjs` (restructure source เข้า `src/`) — `pkgRoot` resolve เป็น `src/` อัตโนมัติ, payload คงเดิม
- `package.json files` เป็น allowlist granular — nested dotfolder ระบุชัด (`src/.warnyin`, `src/.claude/commands`, `src/.claude/agents`); ตัด `src/tests`/`src/scripts` (dev-only)
- test/scripts ย้ายไป `src/tests/` + `src/scripts/`; `npm test` = `node --test` bare (auto-discover, portable node 20/22/24)
- `engines.node` `>=18` → `>=20` (node 18 EOL)
- `.gitignore` เพิ่ม dogfood layer (root-anchored ทุกบรรทัด — กัน match `src/.claude`/`src/.warnyin`)

### Removed
- รองรับ node 18 (drop ตาม EOL)

[Unreleased]: https://github.com/warnyin/warnyin-agents/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/warnyin/warnyin-agents/compare/v0.6.0...v0.7.0
