#!/usr/bin/env node
/**
 * setup:dogfood — คืน dogfood env ที่ root จาก release เสถียร
 *
 * ทำอะไร:
 *   1. query latest version จาก registry (npm view) → pin exact version
 *   2. ติดตั้ง release `@warnyin/agents@<EXPECTED>` ลง repo root (gitignored: .warnyin/ .claude/ CLAUDE.md AGENTS.md)
 *   3. verifyInstalled(root, expected) เทียบ stamp กับ expected (transition-safe)
 *   4. append pointer "อ่าน CONTRIBUTING.md" ต่อท้าย root CLAUDE.md แบบ idempotent
 *
 * วิธีติดตั้ง:
 *   - ลอง `npx --yes @warnyin/agents@<EXPECTED> --update` ก่อน (เร็ว, ทางหลัก)
 *     (env: npm_config_prefer_online=true กัน stale npx cache — เสริม pin-exact)
 *   - ★ บาง dev env (Windows) bin-shim ของ npx ไม่ถูก resolve → ENOENT/`is not recognized`
 *     → fallback: `npm pack` → extract tarball → `node <pkg>/bin/cli.mjs --update` (cwd = repoRoot)
 *     (ดู docs/troubleshooting — npx-Windows bin-shim)
 *
 * dev-only: อยู่ใน src/scripts/ (ไม่อยู่ใน package.json files → ไม่ publish)
 * zero-dep / ESM / cross-platform
 *
 * ⚠ payload ที่ติดตั้ง (root .warnyin/.claude/CLAUDE.md) ถูก agent execute ต่อ —
 *   review diff ของ payload ก่อนเปิด session (supply-chain surface; low risk เพราะ release ของ repo เอง)
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const PKG_NAME = '@warnyin/agents'
const isWin = process.platform === 'win32'

/**
 * release แรกที่มี stamp writer (feature: installer-version-stamp, v0.17.0)
 * expected ≥ STAMP_MIN_VERSION → active guard (stamp ขาด = install ผิด/payload เก่า)
 * expected < STAMP_MIN_VERSION → transition-safe (bootstrapping window)
 */
const STAMP_MIN_VERSION = '0.17.0'

/**
 * parse stdout จาก `npm view <pkg> version` → semver string หรือ null
 * แยกเป็น pure fn เพื่อ testability — unit ไม่ต้อง spawn จริง
 * กรณี npm บาง config print warning/notice ปนใน stdout → ดึงบรรทัดสุดท้ายที่เป็น semver
 * @param {string} stdout
 * @returns {string|null}
 */
export function parseNpmViewVersion(stdout) {
  const last = (stdout || '').trim().split(/\r?\n/).pop()?.trim()
  return last && /^\d+\.\d+\.\d+/.test(last) ? last : null
}

/**
 * query registry หา latest version — คืน semver string หรือ null (degrade)
 * timeout 15s กัน registry ค้าง hang
 * @returns {string|null}
 */
function resolveExpectedVersion() {
  const npm = isWin ? 'npm.cmd' : 'npm'
  const r = spawnSync(npm, ['view', PKG_NAME, 'version'], {
    timeout: 15000,
    encoding: 'utf8',
  })
  const ver = parseNpmViewVersion(r.status === 0 ? r.stdout : '')
  if (!ver) {
    console.warn(`⚠ npm view ล้มเหลว → ข้าม version check รอบนี้ (degrade: ใช้ @latest)`)
  }
  return ver
}

/**
 * อ่าน version stamp จาก root/.warnyin/.warnyin-version
 * คืน semver string (หลัง trim) หรือ null เมื่อไฟล์ไม่มี/อ่านไม่ได้/empty
 * @param {string} root
 * @returns {string|null}
 */
export function readStamp(root) {
  try {
    const s = fs.readFileSync(path.join(root, '.warnyin', '.warnyin-version'), 'utf8').trim()
    return s || null // empty/whitespace → null (ตกแถว transition)
  } catch {
    return null
  }
}

/**
 * เปรียบเทียบ semver แบบ numeric tuple — a ≥ b คืน true (pure, zero-dep)
 * แต่ละ field: parseInt(x,10) — NaN fallback เป็น 0 (input ไม่ใช่ semver จริง → 0)
 * input ที่มี prerelease suffix เช่น '0.17.0-rc.1' → parseInt ตัด suffix อัตโนมัติ
 * @param {string} a — version ซ้าย
 * @param {string} b — version ขวา
 * @returns {boolean}
 */
export function semverGte(a, b) {
  const parse = (v) => String(v).split('.').map((x) => parseInt(x, 10) || 0)
  const pa = parse(a)
  const pb = parse(b)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0
    const vb = pb[i] ?? 0
    if (va > vb) return true
    if (va < vb) return false
  }
  return true // เท่ากัน = true (gte boundary)
}

/**
 * ตรวจว่า tarball ที่ extract มี version ตรงกับ expected (pin-exact — ชั้น A primary guard ของ pack path)
 * อ่าน package.json ของ tarball แล้วเทียบ pj.version กับ expected แบบ exact-equality (trim สองฝั่ง)
 * expected falsy → คืน true (ข้าม version-check, degrade offline — ไม่งั้น false-fail ทุกครั้งที่ offline)
 * @param {string} extractDir — path ไปยัง dir ที่ extract tarball แล้ว (รับ param → testable ด้วย temp dir + fake package.json)
 * @param {string|null|undefined} expected — version ที่คาดไว้ (ค่า exact, ไม่ใช่ range)
 * @returns {boolean}
 */
export function checkTarballVersion(extractDir, expected) {
  if (!expected) return true // degrade offline (ไม่งั้น 'x' !== null false-fail)
  try {
    const pj = JSON.parse(fs.readFileSync(path.join(extractDir, 'package.json'), 'utf8'))
    return String(pj.version).trim() === String(expected).trim()
  } catch {
    // อ่าน package.json ไม่ได้ → degrade (ข้าม version-check ที่ source)
    return true
  }
}

/**
 * ตรวจว่า root มี CORE markers ครบ + (optional) เทียบ version stamp กับ expected
 * truth table (design.md §4B — LR2 active ตั้งแต่ release ที่ 2):
 *   - CORE markers ไม่ครบ → false
 *   - markers ครบ · expected falsy (undefined/null/'') → true (degrade + warn)
 *   - markers ครบ · expected set · stamp ขาด · expected ≥ STAMP_MIN_VERSION → false (active — install ผิด/payload เก่า)
 *   - markers ครบ · expected set · stamp ขาด · expected < STAMP_MIN_VERSION (หรือ non-semver) → true (transition/degrade-safe)
 *   - markers ครบ · expected set · stamp = expected (หลัง trim สองฝั่ง) → true
 *   - markers ครบ · expected set · stamp ≠ expected → false (warn: drift)
 * @param {string} root — path ไปยัง repo root (รับ param กัน hardcode — ให้ unit test ส่ง temp dir ได้)
 * @param {string|null|undefined} [expected] — version ที่คาดว่าติดตั้ง (optional, ไม่ส่ง = marker-only เหมือนเดิม)
 * @returns {boolean}
 */
export function verifyInstalled(root, expected) {
  // ตรวจ CORE markers ก่อน (เดิม)
  const markersOk =
    fs.existsSync(path.join(root, '.warnyin', 'workflow', 'stages', 'discovery.md')) &&
    fs.existsSync(path.join(root, '.claude', 'commands', 'warnyin'))
  if (!markersOk) return false

  // markers ครบ: เช็ค expected
  if (!expected) {
    // falsy (undefined/null/'') = degrade → marker-only (backward compat)
    console.warn('⚠ ข้าม version check (npm view ไม่ได้ผล) — verify แบบ marker-only')
    return true
  }

  const stamp = readStamp(root)
  if (stamp === null) {
    // stamp ขาด: ตรวจ active vs transition ตาม LR2
    if (semverGte(expected, STAMP_MIN_VERSION)) {
      // expected ≥ 0.17.0 (release ที่มี stamp writer) แต่ stamp ขาด → install ผิด/payload เก่า (active)
      console.warn(
        `⚠ payload @${expected} ไม่มี version stamp ทั้งที่ ≥${STAMP_MIN_VERSION} — npm cache เก่า? \`npm cache clean --force\` แล้วลอง setup:dogfood ใหม่`,
      )
      return false
    }
    // expected < 0.17.0 หรือ non-semver → transition/degrade-safe (bootstrapping window)
    console.warn('⚠ payload ไม่มี version stamp (เวอร์ชันก่อน feature stamp writer) — ข้าม version check (transition)')
    return true
  }

  // เทียบ exact-equality หลัง trim สองฝั่ง (normalize CRLF/whitespace)
  if (stamp.trim() !== expected.trim()) {
    console.warn(`⚠ version drift: ติดตั้ง ${stamp} แต่คาด ${expected} (stale cache?) → fallback`)
    return false
  }

  return true
}

/** ติดตั้ง dogfood ลง root ด้วย npx — คืน true ถ้าสำเร็จ (exit 0 + ไม่มีสัญญาณ shim-not-found + verifyInstalled) */
function installViaNpx(expected) {
  // pin exact version (ตัวหลัก defeat cache); prefer-online = เสริม revalidate metadata
  const spec = expected ? `${PKG_NAME}@${expected}` : `${PKG_NAME}@latest`
  console.log(`+ ติดตั้ง dogfood จาก release: npx --yes -p ${spec} warnyin-agents --update`)
  // npx บน Windows เป็น .cmd → spawn array args จะ ENOENT ถ้าไม่ shell
  // shell:true เฉพาะ win32 = "หนีไม่พ้น shell" สำหรับ npx เท่านั้น (ไม่มี user input → ปลอดภัย)
  // ระบุ -p + bin name ชัด (กัน scope-strip mismatch: @warnyin/agents bin=warnyin-agents ≠ agents)
  const r = spawnSync('npx', ['--yes', '-p', spec, 'warnyin-agents', '--update'], {
    cwd: repoRoot,
    stdio: ['inherit', 'inherit', 'pipe'],
    shell: isWin,
    encoding: 'utf8',
    env: { ...process.env, npm_config_prefer_online: 'true' },
  })
  const stderr = r.stderr || ''
  if (stderr) process.stderr.write(stderr)
  const shimMissing =
    r.error?.code === 'ENOENT' ||
    /is not recognized as an internal or external command/i.test(stderr) ||
    /command not found/i.test(stderr)
  if (r.status === 0 && !shimMissing && verifyInstalled(repoRoot, expected)) return true
  if (shimMissing) {
    console.warn('⚠ npx resolve bin-shim ของ @warnyin/agents ไม่สำเร็จ — ลอง fallback (npm pack + node)')
  }
  return false
}

/** fallback: npm pack tarball → extract → node <pkg>/bin/cli.mjs --update (cwd = repoRoot) — คืน true ถ้าสำเร็จ */
function installViaPack(expected) {
  const spec = expected ? `${PKG_NAME}@${expected}` : `${PKG_NAME}@latest`
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'wy-dogfood-'))
  try {
    console.log(`+ fallback: npm pack ${spec} → ${work}`)
    const npm = isWin ? 'npm.cmd' : 'npm'
    const packed = spawnSync(npm, ['pack', spec, '--pack-destination', work], {
      cwd: work,
      stdio: ['inherit', 'pipe', 'inherit'],
      encoding: 'utf8',
      env: { ...process.env, npm_config_prefer_online: 'true' }, // symmetric กับ npx path — cache-bust ชั้น A (LR1)
    })
    if (packed.status !== 0) {
      console.error(`✖ npm pack ${spec} ล้มเหลว (exit ${packed.status ?? '?'})`)
      return false
    }
    // npm pack print ชื่อ tarball บรรทัดสุดท้ายของ stdout
    const tgz = (packed.stdout || '')
      .trim()
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.endsWith('.tgz'))
      .pop()
    const tgzPath = tgz ? path.join(work, path.basename(tgz)) : null
    if (!tgzPath || !fs.existsSync(tgzPath)) {
      console.error('✖ หา tarball ที่ npm pack สร้างไม่เจอ')
      return false
    }
    // extract: ใช้ tar (มีทั้ง Windows 10+ / mac / linux); --strip-components 1 ตัด prefix package/
    const extractDir = path.join(work, 'pkg')
    fs.mkdirSync(extractDir, { recursive: true })
    const untar = spawnSync('tar', ['-xzf', tgzPath, '-C', extractDir, '--strip-components', '1'], {
      stdio: 'inherit',
    })
    if (untar.status !== 0) {
      console.error('✖ extract tarball ล้มเหลว (ต้องมี tar ในระบบ)')
      return false
    }
    // resolve cli entry จาก package.json `bin` ของ tarball — ★ 0.6.0 baseline = bin/cli.mjs (layout เก่า),
    // 0.7.0+ = src/bin/cli.mjs (หลัง restructure) → อย่า hardcode path เดียว
    let binRel
    try {
      const pj = JSON.parse(fs.readFileSync(path.join(extractDir, 'package.json'), 'utf8'))
      binRel = typeof pj.bin === 'string' ? pj.bin : pj.bin && (pj.bin['warnyin-agents'] || Object.values(pj.bin)[0])
    } catch {
      /* package.json อ่านไม่ได้ → ใช้ candidate ด้านล่าง */
    }
    // ★ ชั้น A version-check: ตรวจ package.json version ของ tarball ก่อนรัน --update (pin-exact กัน payload เก่า)
    if (!checkTarballVersion(extractDir, expected)) {
      console.error(
        `✖ tarball version ไม่ตรง expected (${expected}) — payload เก่า? ลอง \`npm cache clean --force\` แล้วรัน setup:dogfood ใหม่`,
      )
      return false
    }
    const cli = [binRel, 'src/bin/cli.mjs', 'bin/cli.mjs']
      .filter(Boolean)
      .map((rel) => path.join(extractDir, rel))
      .find((p) => fs.existsSync(p))
    if (!cli) {
      console.error('✖ ไม่พบ cli ใน tarball ที่ extract (ลอง bin จาก package.json + src/bin/cli.mjs + bin/cli.mjs)')
      return false
    }
    console.log(`+ ติดตั้ง dogfood: node ${cli} --update (cwd = repoRoot)`)
    const run = spawnSync(process.execPath, [cli, '--update'], { cwd: repoRoot, stdio: 'inherit' })
    return run.status === 0 && verifyInstalled(repoRoot, expected)
  } finally {
    try {
      fs.rmSync(work, { recursive: true, force: true })
    } catch {
      /* best-effort cleanup */
    }
  }
}

/** append pointer ชี้ CONTRIBUTING.md ต่อท้าย root CLAUDE.md แบบ idempotent (marker check) */
function appendContributingPointer() {
  const claudePath = path.join(repoRoot, 'CLAUDE.md')
  if (!fs.existsSync(claudePath)) {
    console.warn('⚠ ไม่พบ root CLAUDE.md หลังติดตั้ง dogfood — ข้ามการ append pointer')
    return
  }
  const content = fs.readFileSync(claudePath, 'utf8')
  // marker = 'CONTRIBUTING.md' (คนละ marker กับ installRootDoc ที่เช็ค 'warnyin/workflow/stages/')
  if (content.includes('CONTRIBUTING.md')) {
    console.log('± root CLAUDE.md มี pointer CONTRIBUTING.md อยู่แล้ว — ข้าม (idempotent)')
    return
  }
  const pointer =
    '\n\n## พัฒนา repo นี้\n' +
    'เอกสารพัฒนา/contributor ของ repo นี้: ดู `CONTRIBUTING.md` (source อยู่ใน `src/`, dogfood ที่ root นี้เป็น release เสถียร)\n'
  fs.appendFileSync(claudePath, pointer)
  console.log('± root CLAUDE.md (ต่อท้าย pointer → CONTRIBUTING.md)')
}

function main() {
  console.log(`Warnyin dogfood setup → ${repoRoot}\n`)

  // query registry → pin exact version (กัน stale cache); null = degrade (ใช้ @latest)
  const EXPECTED = resolveExpectedVersion()

  const ok = installViaNpx(EXPECTED) || installViaPack(EXPECTED)
  if (!ok) {
    console.error(
      '\n✖ ติดตั้ง dogfood ไม่สำเร็จ (ทั้ง npx และ fallback npm pack) — dogfood env ที่ root ยังไม่ครบ\n' +
        '  ลองตรวจ network/npm registry หรือรัน manual: npm pack @warnyin/agents@latest → extract → node <pkg>/src/bin/cli.mjs',
    )
    process.exit(1)
  }

  appendContributingPointer()
  console.log('\nเสร็จ — dogfood env ที่ root พร้อมใช้งาน (gitignored)')
  console.log('★ review diff ของ root .warnyin/.claude/CLAUDE.md ก่อนเปิด session (payload ถูก agent execute ต่อ)')
}

// main-guard: รันเฉพาะเมื่อ execute ตรง (ไม่ใช่ตอน import จาก unit test) — กัน import trigger install
// ใช้ argv[1] comparison (ไม่ใช่ import.meta.main ที่ undefined บน node 20)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main()
}
