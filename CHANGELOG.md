# Changelog

ทุกการเปลี่ยนแปลงที่สำคัญของโปรเจกต์นี้ถูกบันทึกในไฟล์นี้

รูปแบบอ้างอิง [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
และโปรเจกต์ยึด [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [Unreleased]

### Added
- Automated installer test suite (`node:test` black-box — spawn `bin/cli.mjs` จริงใน temp dir แล้ว assert side-effect: ไฟล์ที่ออก + exit code + stdout/stderr) รันด้วย `npm test`
- GitHub Actions CI (`.github/workflows/ci.yml`) — matrix node 20/22/24 + job `pack-verify`
- npm-pack verify (`scripts/verify-pack.mjs`) — allowlist safety net ยืนยัน `.warnyin/` ติด package และไม่มีไฟล์รั่ว (`tests/`/`.github/`) ขึ้น tarball

### Changed
- `engines.node` `>=18` → `>=20` (node 18 EOL)

### Removed
- รองรับ node 18 (drop ตาม EOL)

[Unreleased]: https://github.com/warnyin/warnyin-agents/compare/v0.6.0...HEAD
