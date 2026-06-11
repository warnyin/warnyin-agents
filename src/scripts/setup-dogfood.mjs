#!/usr/bin/env node
/**
 * setup:dogfood — คืน dogfood env ที่ root จาก release เสถียร
 *
 * ทำอะไร:
 *   1. ติดตั้ง release `@warnyin/agents@latest` ลง repo root (gitignored: .warnyin/ .claude/ CLAUDE.md AGENTS.md)
 *   2. append pointer "อ่าน CONTRIBUTING.md" ต่อท้าย root CLAUDE.md แบบ idempotent
 *
 * วิธีติดตั้ง:
 *   - ลอง `npx --yes @warnyin/agents@latest --update` ก่อน (เร็ว, ทางหลัก)
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
const PKG = '@warnyin/agents@latest'
const isWin = process.platform === 'win32'

/**
 * ตรวจว่า root มี CORE markers ครบ (install สำเร็จต้องมีแน่)
 * คืน true เมื่อ root มีทั้ง:
 *   - .warnyin/workflow/stages/discovery.md
 *   - .claude/commands/warnyin (dir)
 * @param {string} root — path ไปยัง repo root (รับ param กัน hardcode — ให้ unit test ส่ง temp dir ได้)
 * @returns {boolean}
 */
export function verifyInstalled(root) {
  return (
    fs.existsSync(path.join(root, '.warnyin', 'workflow', 'stages', 'discovery.md')) &&
    fs.existsSync(path.join(root, '.claude', 'commands', 'warnyin'))
  )
}

/** ติดตั้ง dogfood ลง root ด้วย npx — คืน true ถ้าสำเร็จ (exit 0 + ไม่มีสัญญาณ shim-not-found + verifyInstalled) */
function installViaNpx() {
  console.log(`+ ติดตั้ง dogfood จาก release: npx --yes ${PKG} --update`)
  // npx บน Windows เป็น .cmd → spawn array args จะ ENOENT ถ้าไม่ shell
  // shell:true เฉพาะ win32 = "หนีไม่พ้น shell" สำหรับ npx เท่านั้น (ไม่มี user input → ปลอดภัย)
  const r = spawnSync('npx', ['--yes', PKG, '--update'], {
    cwd: repoRoot,
    stdio: ['inherit', 'inherit', 'pipe'],
    shell: isWin,
    encoding: 'utf8',
  })
  const stderr = r.stderr || ''
  if (stderr) process.stderr.write(stderr)
  const shimMissing =
    r.error?.code === 'ENOENT' ||
    /is not recognized as an internal or external command/i.test(stderr) ||
    /command not found/i.test(stderr)
  if (r.status === 0 && !shimMissing && verifyInstalled(repoRoot)) return true
  if (shimMissing) {
    console.warn('⚠ npx resolve bin-shim ของ @warnyin/agents ไม่สำเร็จ — ลอง fallback (npm pack + node)')
  }
  return false
}

/** fallback: npm pack tarball → extract → node <pkg>/bin/cli.mjs --update (cwd = repoRoot) — คืน true ถ้าสำเร็จ */
function installViaPack() {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'wy-dogfood-'))
  try {
    console.log(`+ fallback: npm pack ${PKG} → ${work}`)
    const npm = isWin ? 'npm.cmd' : 'npm'
    const packed = spawnSync(npm, ['pack', PKG, '--pack-destination', work], {
      cwd: work,
      stdio: ['inherit', 'pipe', 'inherit'],
      encoding: 'utf8',
    })
    if (packed.status !== 0) {
      console.error(`✖ npm pack ${PKG} ล้มเหลว (exit ${packed.status ?? '?'})`)
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
    return run.status === 0 && verifyInstalled(repoRoot)
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

  const ok = installViaNpx() || installViaPack()
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
