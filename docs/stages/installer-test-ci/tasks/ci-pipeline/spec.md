# Spec — ci-pipeline

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`infra` (GitHub Actions CI + CHANGELOG)

## 4. Data-flow
PR/push(main) → GitHub Actions trigger → matrix job (node 20/22/24): checkout + setup-node → `node --test tests/` → pack-verify job: `npm pack --dry-run --json` → node script ตรวจ file list

## 6. Persona
maintainer Warnyin + contributor ที่เปิด PR (อยากเห็น check เขียวก่อน merge) + ผู้ใช้ npm (ได้ package ที่ verify แล้วว่าครบ)

## 7. Test-flow / Acceptance (CI contract — lock ตาม review panel)

### `.github/workflows/ci.yml`
- [ ] `on: { pull_request:, push: { branches: [main] } }` — **ห้าม `pull_request_target`** (pwn-request: job รันโค้ดจาก PR)
- [ ] `permissions: { contents: read }` ที่ top-level (least-privilege)
- [ ] **ไม่มี `secrets.*`** ใด ๆ ในไฟล์ (CI นี้ไม่ publish/ไม่ใช้ token)
- [ ] action pin commit SHA + คอมเมนต์เวอร์ชัน เช่น `uses: actions/checkout@<sha> # v5`
- [ ] job `test`: `strategy.matrix.node: [20, 22, 24]` → `actions/setup-node` (`node-version: ${{ matrix.node }}`, **ไม่ตั้ง `cache`**) → `run: node --test tests/`
- [ ] **ไม่มี `npm ci`/`npm install`** (zero-dep, ไม่มี lockfile — จะ fail)
- [ ] job `pack-verify` (รันครั้งเดียว ไม่ต้อง matrix): `run: node scripts/verify-pack.mjs`

### `scripts/verify-pack.mjs` (pack-verify — **allowlist** safety net, decision BK-1)
```js
import { execFileSync } from 'node:child_process'
const out = execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' })
const files = JSON.parse(out)[0].files.map(f => f.path)

// allowlist = safety net ชั้นสองของ package.json `files` — ดัก leak ชนิด "ใหม่" ที่ denylist จับไม่ได้
const ALLOWED_PREFIX = ['bin/', '.warnyin/', '.claude/', 'docs/stages/']
// npm always-include: package.json / README / LICENSE / CHANGELOG (ต้องอยู่ใน list ไม่งั้น false-positive)
const ALLOWED_FILE = ['package.json', 'README.md', 'CLAUDE.md', 'AGENTS.md', 'CHANGELOG.md', 'LICENSE']

const hasWarnyin = files.some(p => p.startsWith('.warnyin/workflow/'))  // dotfolder ติดจริง (บทเรียน 0.6.0)
const unexpected = files.filter(p =>
  !ALLOWED_PREFIX.some(x => p.startsWith(x)) && !ALLOWED_FILE.includes(p))

if (!hasWarnyin) { console.error('✖ .warnyin/ ไม่ติดใน package'); process.exit(1) }
if (unexpected.length) { console.error('✖ ไฟล์นอก allowlist รั่วขึ้น package:', unexpected); process.exit(1) }
console.log('✓ pack-verify ผ่าน:', files.length, 'ไฟล์')
```
> **★ BK-1 (decision: allowlist):** ดักไฟล์รั่ว *ชนิดใหม่* ในอนาคต ไม่ใช่แค่ `tests/`/`.github/` ที่รู้ล่วงหน้า · `.warnyin/installer/` อยู่ใน allowlist (`.warnyin/` prefix) ถูกต้อง — `cli.mjs:157` อ่านไฟล์นั้นตอนติดตั้ง จึงต้องอยู่ใน package
> หมายเหตุ runner: CI รัน ubuntu (`npm` ใน PATH); dev บน Windows รัน script ตรง ๆ จะ ENOENT (`npm`→`npm.cmd`) — dev-only ไม่ขวาง CI (defer)

### `CHANGELOG.md` (Keep a Changelog)
- [ ] header + ลิงก์ format Keep a Changelog
- [ ] section เวอร์ชันถัดไป (เช่น `## [Unreleased]` หรือ `## [0.7.0]`) — **Changed:** `engines.node` `>=20` (drop node 18 EOL); **Added:** automated installer test (`node:test`) + GitHub Actions CI + npm-pack verify
- [ ] (optional) ย้อนบันทึก `0.6.0` ย่อ ๆ ว่าย้ายโครง `.warnyin/`+`docs/stages` — migration เต็มรูปทำใน roadmap P0#3
