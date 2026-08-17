// Black-box integration test: upgrade path U1–U20
// ★ ทุก side-effect อยู่ใน os.tmpdir() เท่านั้น — ห้ามแตะ repo/homedir จริง
// zero-dependency: ใช้เฉพาะ built-in node:*  ห้าม import logic จาก cli.mjs
// ห้าม t.skip — ห้ามมี mutation ใดๆ (เจ้าของ: tasks/mutant-harness wave 2)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync,
  existsSync, readdirSync, symlinkSync, chmodSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ★ ใช้ fileURLToPath ตรง ๆ — ห้าม .pathname (Windows คืน /D:/... → spawn MODULE_NOT_FOUND)
const cliPath = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))
// repoSrc = src/ ของ repo (payload "รุ่นใหม่" = ของจริงทั้งก้อน)
const repoSrc = fileURLToPath(new URL('..', import.meta.url))

// ─── constants ───────────────────────────────────────────────────────────────
// C14: รายชื่อตายตัว (ห้าม glob) — ไฟล์ที่ถูกยุบออกจาก payload รุ่น >= 0.30.1
const STALE_TOPIC_TEST   = '.warnyin/template/stages/[topic]/test.md'
const STALE_TOPIC_VERIFY = '.warnyin/template/stages/[topic]/verify.md'
const KNOWN_STALE = [STALE_TOPIC_TEST, STALE_TOPIC_VERIFY]

// C11: prunable roots project mode (5 dir) / global mode (3 dir)
const PRUNABLE_ROOTS_PROJECT = [
  '.warnyin/workflow',
  '.warnyin/template',
  '.claude/commands/warnyin',
  '.claude/agents',
  '.claude/skills',
]

// C15: เซตปิดของ reason — copy คำต่อคำจาก design.md §4 C15
const REASONS = new Set([
  'path:backslash',
  'path:dot-segment',
  'path:absolute',
  'path:control-char',
  'scope:outside-root',
  'scope:not-allowlisted',
  'hash:missing',
  'hash:mismatch',
  'prune:too-large',
  'prune:symlink',
  'prune:not-contained',
  'prune:io',
  'prune:blast-cap',
])

// ─── harness (copy รูปแบบจาก installer.test.mjs) ────────────────────────────
function makeTempProject(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-upg-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

function runCli(cwd, args = [], env) {
  const r = spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: 'utf8',
    ...(env ? { env } : {}),
  })
  return { code: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' }
}

// C11: env override สำหรับ --global — override ทั้ง HOME และ USERPROFILE
function globalEnv(home) {
  return { ...process.env, HOME: home, USERPROFILE: home }
}

// assert code===0 + surface stderr ใน message
function ok(r, msg = '') {
  assert.equal(r.code, 0, `${msg} exit!=0\nSTDERR:\n${r.stderr}\nSTDOUT:\n${r.stdout}`)
}

// เก็บ path ทุกไฟล์ (relative, sorted) — ใช้เทียบก่อน/หลัง
function listFiles(dir, base = dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) listFiles(full, base, acc)
    else acc.push(path.relative(base, full))
  }
  return acc.sort()
}

// ─── upgrade-specific helpers ────────────────────────────────────────────────

// zero-dep recursive copy — ห้าม fs.cpSync (compat node 20 บาง minor)
// ข้าม symlink โดยเจตนา
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const e of readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name)
    const d = path.join(dest, e.name)
    if (e.isDirectory()) copyDir(s, d)
    else if (e.isFile()) {
      mkdirSync(path.dirname(d), { recursive: true })
      writeFileSync(d, readFileSync(s))
    }
  }
}

function sha256OfFile(abs) {
  return createHash('sha256').update(readFileSync(abs)).digest('hex')
}

function manifestPath(target) {
  return path.join(target, '.warnyin', '.warnyin-manifest')
}

// เขียน manifest ปลอมสำหรับ adversarial test — header + lines, LF เสมอ
function writeManifest(target, lines) {
  const mp = manifestPath(target)
  mkdirSync(path.dirname(mp), { recursive: true })
  const content =
    '# warnyin manifest v1 — เขียนโดย installer 0.29.9 · ห้ามแก้มือ\n' +
    lines.join('\n') + '\n'
  writeFileSync(mp, content)
}

// ★ fixture B helper — สร้าง manifest จริงจากไฟล์บนดิสก์
// sha256 คำนวณจาก byte บนดิสก์ (LF หลังติดตั้ง) ตรงกับ design.md §3
function writeSyntheticManifest(target, roots = PRUNABLE_ROOTS_PROJECT) {
  const entries = []
  function walk(abs) {
    if (!existsSync(abs)) return
    for (const e of readdirSync(abs, { withFileTypes: true })) {
      const full = path.join(abs, e.name)
      if (e.isDirectory()) walk(full)
      else if (e.isFile()) {
        const sha = sha256OfFile(full)
        const rel = path.relative(target, full).split(path.sep).join('/') // POSIX
        entries.push(`${sha}  ${rel}`)
      }
    }
  }
  for (const root of roots) {
    walk(path.join(target, ...root.split('/')))
  }
  entries.sort()
  const header = '# warnyin manifest v1 — เขียนโดย installer 0.29.9 · ห้ามแก้มือ'
  writeFileSync(
    manifestPath(target),
    [header, ...entries].join('\n') + '\n',
  )
}

// เพิ่ม stale file + append entry ที่ hash ตรงจริงลงใน manifest
// rel = POSIX-relative จาก target
function addStaleEntry(target, rel, { content = 'stale-content\n' } = {}) {
  const abs = path.join(target, ...rel.split('/'))
  mkdirSync(path.dirname(abs), { recursive: true })
  writeFileSync(abs, content)
  const sha = sha256OfFile(abs)
  const mp = manifestPath(target)
  const existing = existsSync(mp)
    ? readFileSync(mp, 'utf8')
    : '# warnyin manifest v1 — เขียนโดย installer 0.29.9 · ห้ามแก้มือ\n'
  const tail = existing.endsWith('\n') ? existing : existing + '\n'
  writeFileSync(mp, tail + `${sha}  ${rel}\n`)
}

// ลบ known-stale files ออกจากดิสก์เพื่อให้ stale set ของเคส boundary เป็นตัวเลขที่ตั้งใจ
function rmKnownStale(target) {
  for (const rel of KNOWN_STALE) {
    rmSync(path.join(target, ...rel.split('/')), { force: true })
  }
}

// snapshot .warnyin + .claude ของ homedir จริง — sorted listFiles หรือ null ถ้าไม่มี dir
function realHomeSnapshot() {
  const home = os.homedir()
  function snap(sub) {
    const abs = path.join(home, sub)
    return existsSync(abs) ? listFiles(abs) : null
  }
  return { '.warnyin': snap('.warnyin'), '.claude': snap('.claude') }
}

// สร้าง pkgOld = copy src/ + package.json 0.29.9 + 2 stale files
function makeOldPkg(t) {
  const pkg = makeTempProject(t)
  writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({ version: '0.29.9' }))
  copyDir(repoSrc, path.join(pkg, 'src'))
  // เติม 2 ไฟล์ที่ถูกยุบกลับ (ไม่มีใน current src/)
  for (const rel of KNOWN_STALE) {
    const abs = path.join(pkg, 'src', ...rel.split('/'))
    mkdirSync(path.dirname(abs), { recursive: true })
    writeFileSync(abs, `# ${path.basename(rel)} — stale file from 0.29.9\n`)
  }
  return pkg
}

// spawn old cli ด้วย pkg เก่า (ห้ามใช้ cliPath)
function installOld(pkgOld, target, args = [], env) {
  const oldCli = path.join(pkgOld, 'src', 'bin', 'cli.mjs')
  const r = spawnSync(process.execPath, [oldCli, ...args], {
    cwd: target,
    encoding: 'utf8',
    ...(env ? { env } : {}),
  })
  return { code: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' }
}

// install old pkg ลงใน fresh temp project — internal helper
function installOldInto(t, args = [], env) {
  const pkgOld = makeOldPkg(t)
  const target = makeTempProject(t)
  const r = installOld(pkgOld, target, args, env)
  if (r.code !== 0) {
    throw new Error(`installOld failed (exit ${r.code})\nSTDERR: ${r.stderr}\nSTDOUT: ${r.stdout}`)
  }
  return { target, pkgOld }
}

// fixture A: บังคับเส้น known-stale (C14) — ลบ manifest ทิ้งหลัง install
function fixtureA(t) {
  const { target, pkgOld } = installOldInto(t)
  rmSync(manifestPath(target), { force: true })
  return { target, pkgOld }
}

// fixture B: บังคับเส้น hash (C7) — สร้าง synthetic manifest เองจากไฟล์บนดิสก์
// ★ ต้องเขียนเองเพราะ pkgOld wave 1 ยังไม่มีโค้ดเขียน manifest → ไม่งั้น degenerate ไปเส้น known-stale
function fixtureB(t) {
  const { target, pkgOld } = installOldInto(t)
  writeSyntheticManifest(target)
  return { target, pkgOld }
}

// helper: escape regex special chars
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// helper: extract reasons จาก stdout (บรรทัดที่มี [reason])
function extractReasons(text) {
  const found = new Set()
  for (const line of text.split('\n')) {
    const m = line.match(/\[([^\]]+)\]/)
    if (m) found.add(m[1])
  }
  return found
}

// ─── U1–U20 ──────────────────────────────────────────────────────────────────

// U1: known-stale ถูกลบ (fixture A — C14)
// Wave 1 RED: ไฟล์ยังอยู่ เพราะ known-stale ยังไม่ implement
test('U1. known-stale ถูกลบ (fixture A — C14)', (t) => {
  const { target } = fixtureA(t)
  const r = runCli(target, ['--update'])
  ok(r, 'U1 --update') // C15: exit 0 เสมอ

  // C14: 2 known-stale files ต้องถูกลบเมื่อ stamp < 0.30.1
  assert.ok(
    !existsSync(path.join(target, ...STALE_TOPIC_TEST.split('/'))),
    `C14: ${STALE_TOPIC_TEST} ต้องถูกลบ (known-stale, stamp 0.29.9 < 0.30.1)`,
  )
  assert.ok(
    !existsSync(path.join(target, ...STALE_TOPIC_VERIFY.split('/'))),
    `C14: ${STALE_TOPIC_VERIFY} ต้องถูกลบ (known-stale, stamp 0.29.9 < 0.30.1)`,
  )
  // C15: stdout ต้องมีบรรทัด − (U+2212) ระบุทั้ง 2 path ใน POSIX form
  assert.ok(
    r.stdout.includes(`  \u2212 ${STALE_TOPIC_TEST}`),
    `C15: stdout ต้องมีบรรทัด − ${STALE_TOPIC_TEST}`,
  )
  assert.ok(
    r.stdout.includes(`  \u2212 ${STALE_TOPIC_VERIFY}`),
    `C15: stdout ต้องมีบรรทัด − ${STALE_TOPIC_VERIFY}`,
  )
  assert.ok(r.stdout.includes('ลบ 2'), 'C15: สรุปต้องมี "ลบ 2"')
})

// U2: เส้น hash ถูกลบ (fixture B — C7)
// Wave 1 RED: ไฟล์ยังอยู่ เพราะ hash-based prune ยังไม่ implement
test('U2. เส้น hash ถูกลบ (fixture B — C7)', (t) => {
  const { target } = fixtureB(t)

  // pre-assert: manifest ต้องมีจริงและไม่ว่าง (fixture B degenerate guard)
  assert.ok(
    existsSync(manifestPath(target)),
    'fixture B ไม่มี manifest — writeSyntheticManifest ล้มหรือ fixture degenerate',
  )
  assert.ok(
    readFileSync(manifestPath(target), 'utf8').trim().length > 0,
    'fixture B ไม่มี manifest — manifest ว่างเปล่า',
  )

  const r = runCli(target, ['--update'])
  ok(r, 'U2 --update')

  // C7: ไฟล์ที่ hash ตรงใน manifest + ไม่มีใน payloadNew ต้องถูกลบ
  assert.ok(
    !existsSync(path.join(target, ...STALE_TOPIC_TEST.split('/'))),
    `C7: ${STALE_TOPIC_TEST} ต้องถูกลบ (hash ตรงใน manifest, ไม่มีใน payloadNew)`,
  )
  assert.ok(
    !existsSync(path.join(target, ...STALE_TOPIC_VERIFY.split('/'))),
    `C7: ${STALE_TOPIC_VERIFY} ต้องถูกลบ (hash ตรงใน manifest, ไม่มีใน payloadNew)`,
  )
  assert.ok(r.stdout.includes('ลบ 2'), 'C15: สรุปต้องมี "ลบ 2"')
})

// U3: ของผู้ใช้รอดทุกไฟล์ (C10, C11)
// Wave 1 RED: diff listFiles ไม่ตรง — stale ยังไม่ถูกลบ
test('U3. ของผู้ใช้รอดทุกไฟล์ (C10, C11)', (t) => {
  const { target } = fixtureB(t)

  // เพิ่มไฟล์ผู้ใช้หลายประเภท
  const agentFile = path.join(target, '.claude', 'agents', 'my-agent.md')
  const skillFile = path.join(target, '.claude', 'skills', 'playwright-cli', 'SKILL.md')
  const stageFile = path.join(target, 'docs', 'stages', 'demo', 'x.md')
  const emptyDir  = path.join(target, '.warnyin', 'workflow', 'user-empty')

  mkdirSync(path.dirname(agentFile), { recursive: true })
  mkdirSync(path.dirname(skillFile), { recursive: true })
  mkdirSync(path.dirname(stageFile), { recursive: true })
  mkdirSync(emptyDir, { recursive: true })
  writeFileSync(agentFile, '# user agent — ห้ามลบ\n')
  writeFileSync(skillFile, '# playwright-cli user skill — ห้ามลบ\n')
  writeFileSync(stageFile, '# demo stage file — ห้ามลบ\n')

  const projectMd = path.join(target, 'docs', 'project.md')
  const projectContentBefore = existsSync(projectMd) ? readFileSync(projectMd, 'utf8') : null
  if (!existsSync(projectMd)) writeFileSync(projectMd, '# project placeholder\n')

  const beforeAll = listFiles(target)

  const r = runCli(target, ['--update'])
  ok(r, 'U3 --update')
  const afterAll = listFiles(target)

  // ไฟล์ผู้ใช้ต้องรอดครบ
  assert.ok(existsSync(agentFile), 'C11: .claude/agents/my-agent.md ต้องรอด')
  assert.ok(existsSync(skillFile), 'C11: .claude/skills/playwright-cli/SKILL.md ต้องรอด')
  assert.ok(existsSync(stageFile), 'C11: docs/stages/demo/x.md ต้องรอด')
  assert.ok(existsSync(emptyDir),  'C10: dir ว่างของผู้ใช้ต้องรอด (ไม่เป็น empty-dir candidate)')
  if (projectContentBefore !== null) {
    assert.equal(
      readFileSync(projectMd, 'utf8'),
      projectContentBefore,
      'C11: docs/project.md เนื้อหาต้องไม่เปลี่ยน',
    )
  }

  // diff listFiles ก่อน/หลัง ต้องเป็นเฉพาะ 2 known-stale ที่หาย (ไม่เกิน ไม่น้อยกว่า)
  const removed = beforeAll.filter(f => !afterAll.includes(f))
  const added   = afterAll.filter(f => !beforeAll.includes(f))
  assert.deepEqual(added, [], 'ต้องไม่มีไฟล์เพิ่มใหม่ที่ไม่ได้ install')
  const removedPosix = removed.map(f => f.split(path.sep).join('/'))
  assert.deepEqual(
    removedPosix.sort(),
    [...KNOWN_STALE].sort(),
    'C14: diff listFiles ก่อน/หลัง ต้องเป็นเฉพาะ KNOWN_STALE 2 ไฟล์',
  )
})

// U4: hash mismatch ไม่ถูกลบเงียบ (C7)
// Wave 1 RED: verify.md ยังอยู่ (ไม่ถูกลบ), ไม่มี [hash:mismatch]
test('U4. hash mismatch ไม่ถูกลบเงียบ (C7)', (t) => {
  const { target } = fixtureB(t)

  // แก้ test.md หลัง writeSyntheticManifest → entry ถือ hash เก่า → mismatch
  const testAbs = path.join(target, ...STALE_TOPIC_TEST.split('/'))
  writeFileSync(testAbs, readFileSync(testAbs, 'utf8') + '\n# appended — causes hash mismatch\n')

  const r = runCli(target, ['--update'])
  ok(r, 'U4 --update')

  // C7: hash mismatch → ไม่ถูกลบ
  assert.ok(existsSync(testAbs), `C7: ${STALE_TOPIC_TEST} ต้องยังอยู่ (hash mismatch)`)

  // C15: stdout ต้องมี ⚠ + [hash:mismatch]
  assert.ok(
    r.stdout.includes('[hash:mismatch]'),
    `C15: stdout ต้องมี [hash:mismatch] สำหรับ ${STALE_TOPIC_TEST}`,
  )

  // verify.md hash ยังตรง → ต้องถูกลบ (พิสูจน์ว่า prune ทำงานรันเดียวกัน)
  assert.ok(
    !existsSync(path.join(target, ...STALE_TOPIC_VERIFY.split('/'))),
    `C7: ${STALE_TOPIC_VERIFY} ต้องถูกลบ (hash ตรง — พิสูจน์ว่า prune ทำงานในรันเดียวกัน)`,
  )
  assert.ok(r.stdout.includes('ลบ 1'), 'C15: สรุปต้องมี "ลบ 1"')
})

// U5: manifest ปลอมชี้นอกขอบเขต / ไฟล์ผู้ใช้ — 7 รูป (C4, C5, C8, C15)
// Wave 1 RED: ไม่มี reason ใดถูกพิมพ์ (prune ยังไม่ implement)
test('U5. manifest ปลอม 7 รูป — เหยื่อไม่หาย + reason อยู่ใน closed-set (C4, C5, C8, C15)', (t) => {
  const { target } = fixtureB(t)

  const outsideDir = mkdtempSync(path.join(os.tmpdir(), 'wy-u5out-'))
  t.after(() => rmSync(outsideDir, { recursive: true, force: true }))

  // สร้างไฟล์เหยื่อ
  const dotSegVictim = path.join(outsideDir, 'victim.md')
  const absVictim    = path.join(outsideDir, 'abs.md')
  const bsVictim     = path.join(target, '.warnyin', 'workflow', 'bs.md')
  const evilDir      = path.join(target, '.warnyin', 'workflow-evil')
  const evilVictim   = path.join(evilDir, 'x.md')
  const agentVictim  = path.join(target, '.claude', 'agents', 'my-agent.md')

  writeFileSync(dotSegVictim, 'dot-seg victim\n')
  writeFileSync(absVictim,    'abs victim\n')
  mkdirSync(path.dirname(bsVictim), { recursive: true })
  writeFileSync(bsVictim, 'backslash victim\n')
  mkdirSync(evilDir, { recursive: true })
  writeFileSync(evilVictim, 'evil victim\n')
  mkdirSync(path.dirname(agentVictim), { recursive: true })
  writeFileSync(agentVictim, '# my agent — user file\n')

  // control char victim — POSIX เท่านั้น
  let ctrlVictimAbs = null
  if (process.platform !== 'win32') {
    const ctrlPath = path.join(target, '.warnyin', 'workflow', 'vic\x01tim.md')
    try {
      writeFileSync(ctrlPath, 'ctrl victim\n')
      ctrlVictimAbs = ctrlPath
    } catch (_) {
      console.error('  ⚠ ข้ามสร้างไฟล์ control-char — platform ไม่รองรับ; CI ubuntu ครอบ')
    }
  } else {
    console.error('  ⚠ ข้ามสร้างไฟล์ control-char (win32) — CI ubuntu ครอบ')
  }

  // sha256 ของแต่ละ victim
  const shaDotSeg = sha256OfFile(dotSegVictim)
  const shaAbs    = sha256OfFile(absVictim)
  const shaBs     = sha256OfFile(bsVictim)
  const shaCtrl   = ctrlVictimAbs
    ? sha256OfFile(ctrlVictimAbs)
    : createHash('sha256').update('ctrl victim\n').digest('hex')
  const shaEvil   = sha256OfFile(evilVictim)
  const shaAgent  = sha256OfFile(agentVictim)

  const docsProjAbs = path.join(target, 'docs', 'project.md')
  const shaDocs = existsSync(docsProjAbs)
    ? sha256OfFile(docsProjAbs)
    : createHash('sha256').update('docs\n').digest('hex')

  // outsideDir ใน POSIX form สำหรับ absolute entry
  const outsidePosix = outsideDir.split(path.sep).join('/')

  // เขียนทับ manifest ด้วย 7 adversarial entries (§7.2.1)
  writeManifest(target, [
    `${shaDotSeg}  .warnyin/workflow/../../outside/victim.md`,   // path:dot-segment
    `${shaAbs}  ${outsidePosix}/abs.md`,                          // path:absolute
    `${shaBs}  .warnyin\\workflow\\bs.md`,                        // path:backslash
    `${shaCtrl}  .warnyin/workflow/vic\x01tim.md`,                // path:control-char (byte \x01 จริง)
    `${shaEvil}  .warnyin/workflow-evil/x.md`,                    // scope:outside-root
    `${shaAgent}  .claude/agents/my-agent.md`,                    // scope:not-allowlisted
    `${shaDocs}  docs/project.md`,                                // scope:outside-root (docs ไม่ใน prunableRoots)
  ])

  const r = runCli(target, ['--update'])
  ok(r, 'U5 --update') // C15: exit 0 เสมอ

  // ไม่มีไฟล์เหยื่อหายแม้แต่ตัวเดียว
  assert.ok(existsSync(dotSegVictim), 'C4: dot-segment victim ต้องยังอยู่')
  assert.ok(existsSync(absVictim),    'C4: absolute path victim ต้องยังอยู่')
  assert.ok(existsSync(bsVictim),     'C4: backslash victim ต้องยังอยู่')
  assert.ok(existsSync(evilVictim),   'C5: scope:outside-root victim ต้องยังอยู่')
  assert.ok(existsSync(agentVictim),  'C5: scope:not-allowlisted victim ต้องยังอยู่')
  if (ctrlVictimAbs) assert.ok(existsSync(ctrlVictimAbs), 'C4: control-char victim ต้องยังอยู่')
  if (existsSync(docsProjAbs)) assert.ok(existsSync(docsProjAbs), 'C5: docs/project.md ต้องยังอยู่')

  // C15: ทุก reason ที่พิมพ์ต้องอยู่ใน เซตปิด REASONS
  const combined = r.stdout + r.stderr
  const foundReasons = extractReasons(combined)
  for (const reason of foundReasons) {
    assert.ok(REASONS.has(reason), `C15: reason "${reason}" ไม่อยู่ใน closed-set C15`)
  }

  // ต้องมี reason ขั้นต่ำจาก spec §7.2.1
  for (const reason of ['path:dot-segment', 'path:absolute', 'path:backslash', 'scope:outside-root', 'scope:not-allowlisted']) {
    assert.ok(r.stdout.includes(reason), `C15: stdout ต้องมี reason "${reason}"`)
  }
  // control-char: entry อยู่ใน manifest → C4 รัน pure ก่อน statOnDisk → reason ต้องพิมพ์ไม่ว่าไฟล์มีจริงหรือไม่
  assert.ok(r.stdout.includes('path:control-char'), 'C15: stdout ต้องมี reason "path:control-char"')
})

// U6: symlink ancestor — ไฟล์นอกขอบเขตผ่าน symlink dir (C8)
// Wave 1 RED: ไม่มี reason prune:not-contained, stale ปกติไม่ถูกลบ
test('U6. symlink ancestor — ไฟล์นอกขอบเขตรอด (C8)', (t) => {
  if (process.platform === 'win32') {
    console.error('  ⚠ ข้าม symlink ancestor (win32) — CI ubuntu ครอบ')
    return
  }

  const { target } = fixtureB(t)

  const outsideDir = mkdtempSync(path.join(os.tmpdir(), 'wy-u6-'))
  t.after(() => rmSync(outsideDir, { recursive: true, force: true }))

  const victim   = path.join(outsideDir, 'victim.md')
  const linkPath = path.join(target, '.warnyin', 'template', 'linked')

  writeFileSync(victim, 'ancestor victim\n')
  const shaVictim = sha256OfFile(victim)

  try {
    symlinkSync(outsideDir, linkPath, 'dir')
  } catch (e) {
    console.error(`  ⚠ ข้ามสร้าง symlink dir (${e.code || e.message}) — CI ubuntu ครอบ`)
    return
  }

  // เพิ่ม entry ใน manifest ชี้ผ่าน symlink dir ด้วย hash ของ victim จริง (ผ่าน C7 แล้วไปตายที่ C8)
  addStaleEntry(target, '.warnyin/template/linked/victim.md', { content: '' })
  // แทนที่ hash ด้วย sha จาก victim จริง
  const mp = manifestPath(target)
  writeFileSync(mp,
    readFileSync(mp, 'utf8').replace(
      /[0-9a-f]{64}  \.warnyin\/template\/linked\/victim\.md\n/,
      `${shaVictim}  .warnyin/template/linked/victim.md\n`,
    ),
  )

  const r = runCli(target, ['--update'])
  ok(r, 'U6 --update')

  // C8: victim นอกขอบเขตผ่าน symlink ancestor ต้องยังอยู่
  assert.ok(existsSync(victim), 'C8: victim ผ่าน symlink ancestor ต้องยังอยู่')
  // C15: reason prune:not-contained ต้องพิมพ์
  assert.ok(r.stdout.includes('prune:not-contained'), 'C15: ต้องมี reason "prune:not-contained"')
  // ไฟล์ตกรุ่นปกติในรันเดียวกันต้องถูกลบ (พิสูจน์ว่า prune ยังทำงาน)
  assert.ok(
    !existsSync(path.join(target, ...STALE_TOPIC_VERIFY.split('/'))),
    `C14/C7: ${STALE_TOPIC_VERIFY} ต้องถูกลบในรันเดียวกัน (guard ชั้นอื่นไม่ block)`,
  )
})

// U7: symlink leaf — hash ตรงกับปลายทาง symlink (C8)
// Wave 1 RED: ไม่มี reason prune:symlink, stale ปกติไม่ถูกลบ
test('U7. symlink leaf — symlink + ปลายทางรอด (C8)', (t) => {
  if (process.platform === 'win32') {
    console.error('  ⚠ ข้าม symlink leaf (win32) — CI ubuntu ครอบ')
    return
  }

  const { target } = fixtureB(t)

  const outsideDir = mkdtempSync(path.join(os.tmpdir(), 'wy-u7-'))
  t.after(() => rmSync(outsideDir, { recursive: true, force: true }))

  const leafVictim = path.join(outsideDir, 'leaf-victim.md')
  writeFileSync(leafVictim, 'leaf victim\n')
  // ★ hash ของปลายทาง symlink (ไม่ใช่ hash ไฟล์เดิมที่ถูกแทน)
  const shaLeaf = sha256OfFile(leafVictim)

  // แทนที่ test.md ด้วย symlink ชี้ไป leafVictim
  const testAbs = path.join(target, ...STALE_TOPIC_TEST.split('/'))
  rmSync(testAbs, { force: true })
  try {
    symlinkSync(leafVictim, testAbs)
  } catch (e) {
    console.error(`  ⚠ ข้ามสร้าง symlink file (${e.code || e.message}) — CI ubuntu ครอบ`)
    return
  }

  // แก้ entry ของ test.md ใน manifest → hash = sha ของปลายทาง symlink
  // ★ ต้องใช้ hash ปลายทาง ไม่งั้น C7 reject ก่อน แล้ว reason = hash:mismatch ไม่ใช่ prune:symlink
  const mp = manifestPath(target)
  writeFileSync(mp,
    readFileSync(mp, 'utf8').replace(
      new RegExp(`[0-9a-f]{64}  ${escapeRegex(STALE_TOPIC_TEST)}`),
      `${shaLeaf}  ${STALE_TOPIC_TEST}`,
    ),
  )

  const r = runCli(target, ['--update'])
  ok(r, 'U7 --update')

  // C8: symlink + ปลายทางต้องยังอยู่
  assert.ok(existsSync(leafVictim), 'C8: ปลายทาง symlink ต้องยังอยู่')
  // C15: reason prune:symlink ต้องพิมพ์
  assert.ok(r.stdout.includes('prune:symlink'), 'C15: ต้องมี reason "prune:symlink"')
  // verify.md ไม่ใช่ symlink → ต้องถูกลบ
  assert.ok(
    !existsSync(path.join(target, ...STALE_TOPIC_VERIFY.split('/'))),
    `C7/C8: ${STALE_TOPIC_VERIFY} ต้องถูกลบ (ไม่ใช่ symlink)`,
  )
})

// U8: --global ครึ่งที่ต้องรอด — ไฟล์ผู้ใช้ + realHomeSnapshot (C11, C16)
// Wave 1 RED: C16 manifest global ไม่ถูกสร้าง (cli ยังไม่เขียน manifest)
test('U8. --global: ไฟล์ผู้ใช้รอด + realHomeSnapshot ไม่เปลี่ยน (C11, C16)', (t) => {
  const home   = makeTempProject(t)
  const pkgOld = makeOldPkg(t)

  const ri = installOld(pkgOld, home, ['--global'], globalEnv(home))
  if (ri.code !== 0) throw new Error(`installOld --global failed: ${ri.stderr}`)

  // เพิ่มไฟล์ผู้ใช้ใน temp home
  const agentFile = path.join(home, '.claude', 'agents', 'my.md')
  const skillFile = path.join(home, '.claude', 'skills', 'mine', 'SKILL.md')
  mkdirSync(path.dirname(agentFile), { recursive: true })
  mkdirSync(path.dirname(skillFile), { recursive: true })
  writeFileSync(agentFile, '# my agent\n')
  writeFileSync(skillFile, '# mine skill\n')

  const snapBefore = realHomeSnapshot()

  const r = runCli(home, ['--update', '--global'], globalEnv(home))
  ok(r, 'U8 --update --global')

  const snapAfter = realHomeSnapshot()

  // C11: ไฟล์ผู้ใช้ต้องรอด (global ไม่ prune .claude/{agents,skills})
  assert.ok(existsSync(agentFile), 'C11: ~/.claude/agents/my.md ต้องรอด')
  assert.ok(existsSync(skillFile), 'C11: ~/.claude/skills/mine/SKILL.md ต้องรอด')
  assert.ok(existsSync(path.join(home, '.warnyin', 'workflow')), 'global install ต้องมี .warnyin/workflow')

  // ★ assertion ต่างชั้น: realHomeSnapshot ก่อน/หลัง ต้องเท่ากันแบบ set
  assert.deepEqual(
    snapAfter['.warnyin'],
    snapBefore['.warnyin'],
    'C11: os.homedir()/.warnyin ต้องไม่เปลี่ยน (ถ้าเปลี่ยน = override HOME ไม่ติด)',
  )
  assert.deepEqual(
    snapAfter['.claude'],
    snapBefore['.claude'],
    'C11: os.homedir()/.claude ต้องไม่เปลี่ยน (ถ้าเปลี่ยน = override HOME ไม่ติด)',
  )

  // C16: global manifest ต้องถูกสร้างและต้องไม่มี entry ใต้ .claude/agents/ หรือ .claude/skills/
  const globalManifest = manifestPath(home)
  assert.ok(existsSync(globalManifest), 'C16: global manifest ต้องถูกสร้าง (.warnyin/.warnyin-manifest)')
  const mLines = readFileSync(globalManifest, 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#'))
  const badEntries = mLines.filter(l => {
    const parts = l.split('  ')
    if (parts.length < 2) return false
    const p = parts[1]
    return p.startsWith('.claude/agents/') || p.startsWith('.claude/skills/')
  })
  assert.equal(
    badEntries.length,
    0,
    `C16: global manifest ต้องไม่มี entry ใต้ .claude/agents/ หรือ .claude/skills/ (พบ: ${badEntries.join(', ')})`,
  )
})

// U9: --global ครึ่งที่ต้องลบ — stale ใต้ .warnyin/template (C11, C14)
// Wave 1 RED: ไฟล์ตกรุ่นไม่ถูกลบ
test('U9. --global: stale ใต้ .warnyin/template ถูกลบ (C11, C14)', (t) => {
  const home   = makeTempProject(t)
  const pkgOld = makeOldPkg(t)

  const ri = installOld(pkgOld, home, ['--global'], globalEnv(home))
  if (ri.code !== 0) throw new Error(`installOld --global failed: ${ri.stderr}`)

  const testAbs   = path.join(home, ...STALE_TOPIC_TEST.split('/'))
  const verifyAbs = path.join(home, ...STALE_TOPIC_VERIFY.split('/'))
  // defensive: ensure stale files exist (in case global install skipped template subdir)
  if (!existsSync(testAbs)) {
    mkdirSync(path.dirname(testAbs), { recursive: true })
    writeFileSync(testAbs, '# test — stale\n')
  }
  if (!existsSync(verifyAbs)) {
    mkdirSync(path.dirname(verifyAbs), { recursive: true })
    writeFileSync(verifyAbs, '# verify — stale\n')
  }

  const r = runCli(home, ['--update', '--global'], globalEnv(home))
  ok(r, 'U9 --update --global')

  // C14: known-stale ใต้ .warnyin/template ต้องถูกลบ (global mode ครอบ .warnyin/template)
  assert.ok(!existsSync(testAbs),   `C14: ${STALE_TOPIC_TEST} ต้องถูกลบ (global known-stale)`)
  assert.ok(!existsSync(verifyAbs), `C14: ${STALE_TOPIC_VERIFY} ต้องถูกลบ (global known-stale)`)
  assert.ok(r.stdout.includes('ลบ 2'), 'C15: สรุปต้องมี "ลบ 2"')
})

// U10: blast cap boundary — 50 ผ่านพอดี (C9)
// Wave 1 RED: ไม่มีการลบ 50 ไฟล์
test('U10. blast cap boundary 50 — ผ่านพอดี ลบครบ (C9)', (t) => {
  const { target } = fixtureB(t)
  // ★ ต้อง rmKnownStale ก่อนเพื่อให้ stale set = 50 พอดี (ไม่ใช่ 52)
  rmKnownStale(target)

  for (let i = 0; i < 50; i++) {
    addStaleEntry(target, `.warnyin/workflow/legacy/f${String(i).padStart(2, '0')}.md`)
  }

  const r = runCli(target, ['--update'])
  ok(r, 'U10 --update')

  // C9: 50 ≤ PRUNE_BLAST_CAP=50 → ลบครบทุกตัว
  for (let i = 0; i < 50; i++) {
    assert.ok(
      !existsSync(path.join(target, '.warnyin', 'workflow', 'legacy', `f${String(i).padStart(2, '0')}.md`)),
      `C9: f${String(i).padStart(2, '0')}.md ต้องถูกลบ (50 ≤ PRUNE_BLAST_CAP)`,
    )
  }
  assert.ok(!r.stdout.includes('[prune:blast-cap]'), 'C9: ต้องไม่มี [prune:blast-cap] (50 พอดี cap)')
  assert.ok(r.stdout.includes('ลบ 50'), 'C15: สรุปต้องมี "ลบ 50"')
})

// U11: blast cap boundary — 51 ชน cap (C9)
// Wave 1 RED: ไม่มี [prune:blast-cap] message (แม้ไฟล์ไม่หายก็ถือว่าผ่านครึ่ง)
test('U11. blast cap boundary 51 — ชน cap ไม่ลบเลย (C9)', (t) => {
  const { target } = fixtureB(t)
  rmKnownStale(target)

  for (let i = 0; i < 51; i++) {
    addStaleEntry(target, `.warnyin/workflow/legacy/f${String(i).padStart(2, '0')}.md`)
  }

  const r = runCli(target, ['--update'])
  ok(r, 'U11 --update')

  // C9: 51 > PRUNE_BLAST_CAP → ไม่ลบเลย
  for (let i = 0; i < 51; i++) {
    assert.ok(
      existsSync(path.join(target, '.warnyin', 'workflow', 'legacy', `f${String(i).padStart(2, '0')}.md`)),
      `C9: f${String(i).padStart(2, '0')}.md ต้องยังอยู่ (blast-cap trip: 51 > 50)`,
    )
  }
  // C9: ต้องมี [prune:blast-cap] + จำนวน
  assert.ok(r.stdout.includes('[prune:blast-cap]'), 'C9: ต้องมี [prune:blast-cap] เมื่อ 51 > PRUNE_BLAST_CAP')
})

// U12: --dry-run ยกเว้น cap — แสดงรายการครบ 51 (C9, C15)
// Wave 1 RED: ไม่มี จะลบ: heading, ไม่มีบรรทัด − 51 ตัว
test('U12. --dry-run ยกเว้น blast cap — แสดงรายการครบ (C9, C15)', (t) => {
  const { target } = fixtureB(t)
  rmKnownStale(target)

  for (let i = 0; i < 51; i++) {
    addStaleEntry(target, `.warnyin/workflow/legacy/f${String(i).padStart(2, '0')}.md`)
  }

  const r = runCli(target, ['--update', '--dry-run'])
  ok(r, 'U12 --update --dry-run')

  // C15: --dry-run ใช้หัวข้อ จะลบ:
  assert.ok(r.stdout.includes('จะลบ:'), 'C15: --dry-run ต้องมีหัวข้อ "จะลบ:"')

  // C9: --dry-run ยกเว้น cap → ต้องแสดงครบ 51 บรรทัด −
  const minusLines = r.stdout.split('\n').filter(l => l.startsWith('  \u2212 '))
  assert.ok(minusLines.length >= 51, `C9: --dry-run ต้องแสดงบรรทัด − ครบ 51 (พบ ${minusLines.length})`)

  // C15: ห้าม unlink — ไฟล์ต้องยังอยู่ครบ
  for (let i = 0; i < 51; i++) {
    assert.ok(
      existsSync(path.join(target, '.warnyin', 'workflow', 'legacy', `f${String(i).padStart(2, '0')}.md`)),
      `C15: f${String(i).padStart(2, '0')}.md ต้องยังอยู่ (--dry-run ห้าม unlink)`,
    )
  }
})

// U13: --no-prune รอบแรก → รอบสองยังลบได้ (C13)
// Wave 1 RED: รอบสองไม่ลบ (prune ยังไม่ implement)
test('U13. --no-prune รอบแรก → รอบสองยังเห็น stale (C13)', (t) => {
  const { target } = fixtureB(t)

  const manifestBefore = readFileSync(manifestPath(target), 'utf8')
  const testEntry   = manifestBefore.split('\n').find(l => l.endsWith(`  ${STALE_TOPIC_TEST}`))
  const verifyEntry = manifestBefore.split('\n').find(l => l.endsWith(`  ${STALE_TOPIC_VERIFY}`))
  assert.ok(testEntry,   'fixtureB manifest ต้องมี entry ของ STALE_TOPIC_TEST')
  assert.ok(verifyEntry, 'fixtureB manifest ต้องมี entry ของ STALE_TOPIC_VERIFY')

  // รอบ 1: --no-prune
  const r1 = runCli(target, ['--update', '--no-prune'])
  ok(r1, 'U13 round1 --no-prune')
  assert.ok(existsSync(path.join(target, ...STALE_TOPIC_TEST.split('/'))),   'C12: --no-prune รอบ 1 ต้องไม่ลบ test.md')
  assert.ok(existsSync(path.join(target, ...STALE_TOPIC_VERIFY.split('/'))), 'C12: --no-prune รอบ 1 ต้องไม่ลบ verify.md')
  assert.ok(!r1.stdout.includes('\u2212 '), 'C12: --no-prune ต้องไม่มีบรรทัด −')

  // C13: manifest หลังรอบ 1 ต้องยังมี entry ของทั้ง 2 ไฟล์พร้อม hash เดิม
  const manifestAfterR1 = readFileSync(manifestPath(target), 'utf8')
  assert.ok(manifestAfterR1.includes(testEntry),
    `C13: manifest หลัง --no-prune ต้องยังมี entry ของ ${STALE_TOPIC_TEST}`)
  assert.ok(manifestAfterR1.includes(verifyEntry),
    `C13: manifest หลัง --no-prune ต้องยังมี entry ของ ${STALE_TOPIC_VERIFY}`)

  // รอบ 2: --update ปกติ → ต้องลบ 2 ไฟล์
  const r2 = runCli(target, ['--update'])
  ok(r2, 'U13 round2 --update')
  assert.ok(!existsSync(path.join(target, ...STALE_TOPIC_TEST.split('/'))),   `C13: รอบ 2 ต้องลบ ${STALE_TOPIC_TEST}`)
  assert.ok(!existsSync(path.join(target, ...STALE_TOPIC_VERIFY.split('/'))), `C13: รอบ 2 ต้องลบ ${STALE_TOPIC_VERIFY}`)
  assert.ok(r2.stdout.includes('ลบ 2'), 'C15: รอบ 2 สรุปต้องมี "ลบ 2"')
})

// U14: --dry-run ไม่แตะ manifest (C15)
// Wave 1 PASS: manifest byte-equal (cli ไม่เขียน manifest), listFiles เท่าเดิม
test('U14. --dry-run ไม่แตะ manifest (C15)', (t) => {
  const { target } = fixtureB(t)

  const manifestBefore = readFileSync(manifestPath(target))
  const filesBefore    = listFiles(target)

  const r = runCli(target, ['--update', '--dry-run'])
  ok(r, 'U14 --dry-run')

  // C15: manifest ต้องไม่เปลี่ยน byte
  assert.deepEqual(
    readFileSync(manifestPath(target)),
    manifestBefore,
    'C15: --dry-run ต้องไม่เขียน manifest',
  )
  // C15: listFiles เท่าเดิม
  assert.deepEqual(
    listFiles(target),
    filesBefore,
    'C15: --dry-run ต้องไม่ลบไฟล์ใด',
  )
})

// U15: T1 payloadNew semantics — install สด แล้ว --update ทันที (C15)
// Wave 1 RED: ไม่มี "ลบ 0" ในสรุป
test('U15. T1 payloadNew: install สด → --update ทันที → ไม่มีไฟล์หาย (C15)', (t) => {
  const target = makeTempProject(t)
  ok(runCli(target), 'U15 fresh install')

  const filesBefore = listFiles(target)

  const r = runCli(target, ['--update'])
  ok(r, 'U15 --update')
  const filesAfter = listFiles(target)

  // listFiles ก่อน/หลัง ต้องเท่ากัน (payloadNew ไม่ลบของตัวเอง)
  assert.deepEqual(
    filesAfter,
    filesBefore,
    'C15: T1 — install สด + --update ต้องไม่มีไฟล์หาย (payloadNew semantics)',
  )
  assert.ok(!r.stdout.includes('\u2212 '), 'C15: T1 — ต้องไม่มีบรรทัด − เลย')
  assert.ok(r.stdout.includes('ลบ 0'), 'C15: T1 — สรุปต้องมี "ลบ 0"')
})

// U16: idempotent หลัง prune (C13, C15)
// Wave 1 RED: รอบ 1 ไม่ลบ (assertion แรกแดง)
test('U16. idempotent หลัง prune — รอบ 2 ลบ 0 (C13, C15)', (t) => {
  const { target } = fixtureB(t)

  // รอบ 1: --update → ลบ 2 stale
  const r1 = runCli(target, ['--update'])
  ok(r1, 'U16 round1')
  assert.ok(
    !existsSync(path.join(target, ...STALE_TOPIC_TEST.split('/'))),
    `C14/C7: รอบ 1 ต้องลบ ${STALE_TOPIC_TEST}`,
  )
  assert.ok(
    !existsSync(path.join(target, ...STALE_TOPIC_VERIFY.split('/'))),
    `C14/C7: รอบ 1 ต้องลบ ${STALE_TOPIC_VERIFY}`,
  )

  const filesAfterR1    = listFiles(target)
  const manifestAfterR1 = readFileSync(manifestPath(target))

  // รอบ 2: --update → ลบ 0 (idempotent)
  const r2 = runCli(target, ['--update'])
  ok(r2, 'U16 round2')
  assert.deepEqual(listFiles(target), filesAfterR1, 'C13: รอบ 2 ต้องไม่มีไฟล์หาย (idempotent)')
  assert.deepEqual(
    readFileSync(manifestPath(target)),
    manifestAfterR1,
    'C13: manifest รอบ 2 ต้อง byte-equal กับหลังรอบ 1',
  )
  assert.ok(r2.stdout.includes('ลบ 0'), 'C15: รอบ 2 สรุปต้องมี "ลบ 0"')
})

// U17: manifest เสีย (บรรทัดใช้ไม่ได้) + duplicate (C1, C2)
// Wave 1 RED: manifest ไม่ถูกเขียนทับ, ไม่มี ⚠
test('U17. manifest เสีย + duplicate — fail-closed ไม่ลบ verify.md (C1, C2)', (t) => {
  const { target } = fixtureB(t)

  // อ่าน sha ของ payload ที่ยังใช้อยู่ (entry (ง) — ปิดความกำกวม C2)
  const readmePath = path.join(target, '.warnyin', 'workflow', 'README.md')
  const readmeSha  = existsSync(readmePath)
    ? sha256OfFile(readmePath)
    : createHash('sha256').update('readme\n').digest('hex')
  const readmeRel  = '.warnyin/workflow/README.md'

  const verifyAbs   = path.join(target, ...STALE_TOPIC_VERIFY.split('/'))
  const verifySha   = sha256OfFile(verifyAbs)
  const verifyOther = createHash('sha256').update('different\n').digest('hex')

  writeManifest(target, [
    'bad-line-no-separator',                          // (ก) บรรทัดขยะ
    `NOTAHEX  ${STALE_TOPIC_VERIFY}`,                 // (ข) sha ไม่ใช่ hex64
    `${verifySha}  ${STALE_TOPIC_VERIFY}`,            // (ค) duplicate entry 1
    `${verifyOther}  ${STALE_TOPIC_VERIFY}`,          // (ค) duplicate entry 2 (hash ต่างกัน)
    `${readmeSha}  ${readmeRel}`,                     // (ง) entry ถูกต้อง 1 ตัว (ปิด C2 ambiguity)
  ])

  const r = runCli(target, ['--update'])
  ok(r, 'U17 --update')

  // ไฟล์ payload ที่มี entry ถูกต้องต้องครบ
  if (existsSync(readmePath)) {
    assert.ok(existsSync(readmePath), `C1: ${readmeRel} ต้องยังอยู่`)
  }

  // C1: duplicate → fail-closed → verify.md ต้องยังอยู่ + ต้องไม่มีบรรทัด − ของ verify.md
  assert.ok(existsSync(verifyAbs), 'C1: verify.md ต้องยังอยู่ (duplicate entry → fail-closed)')
  assert.ok(
    !r.stdout.includes(`\u2212 ${STALE_TOPIC_VERIFY}`),
    `C1: ต้องไม่มีบรรทัด − ของ ${STALE_TOPIC_VERIFY} (duplicate → ไม่ลบ)`,
  )

  // C15: ต้องมี ⚠ (manifest มีบรรทัดผิดรูปแบบ)
  assert.ok(r.stdout.includes('\u26a0'), 'C15: ต้องมี ⚠ เมื่อ manifest มีบรรทัดผิดรูปแบบ')

  // manifest ต้องถูกเขียนทับเป็นรูปแบบถูกต้อง
  const newManifest  = readFileSync(manifestPath(target), 'utf8')
  const entryLines   = newManifest.split('\n').filter(l => l && !l.startsWith('#'))
  for (const line of entryLines) {
    assert.ok(
      /^[0-9a-f]{64}  \S/.test(line),
      `C13: manifest ใหม่ทุกบรรทัดต้องเป็น hex64 + 2space + path (พบ: "${line}")`,
    )
  }
})

// U18: manifest เกินเพดาน (>1MB / >5000 entry) — C1 → known-stale → C14 ลบ 2 ไฟล์
// Wave 1 RED: 2 known-stale files ไม่ถูกลบ (cli ไม่ implement C1 cap check)
test('U18. manifest เกินเพดาน — fail-closed เปิด known-stale ลบ 2 ไฟล์ (C1, C2, C14)', (t) => {
  // (ก) manifest > 1 MB
  {
    const { target: tA } = fixtureB(t)
    const mp = manifestPath(tA)
    const comment = '# padding — ยาวเพื่อ pad manifest ให้เกิน 1 MB\n'
    const needed  = Math.ceil((1024 * 1024 + 512) / comment.length) + 1
    writeFileSync(mp, readFileSync(mp, 'utf8') + comment.repeat(needed))

    const r = runCli(tA, ['--update'])
    ok(r, 'U18a --update (>1MB)')

    // C1: manifest >1MB → manifestUsable=false → C2: known-stale → C14: ลบ 2 ไฟล์
    assert.ok(
      !existsSync(path.join(tA, ...STALE_TOPIC_TEST.split('/'))),
      'C1/C14: manifest >1MB → known-stale → test.md ต้องถูกลบ',
    )
    assert.ok(
      !existsSync(path.join(tA, ...STALE_TOPIC_VERIFY.split('/'))),
      'C1/C14: manifest >1MB → known-stale → verify.md ต้องถูกลบ',
    )
    assert.ok(r.stdout.includes('ลบ 2'), 'C15: สรุปต้องมี "ลบ 2" (known-stale 2 ไฟล์ หลัง manifest ถูก discard)')
    assert.ok(r.stdout.includes('\u26a0'), 'C15: ต้องมี ⚠ (manifest เกิน size cap)')

    // ไฟล์ payload ที่ยังใช้อยู่ต้องครบ
    const readme = path.join(tA, '.warnyin', 'workflow', 'README.md')
    if (existsSync(readme)) {
      assert.ok(existsSync(readme), 'C2: payload README.md ต้องยังอยู่ (ไม่ใช่ stale)')
    }
  }

  // (ข) manifest > 5000 entry
  {
    const { target: tB } = fixtureB(t)
    const mp      = manifestPath(tB)
    const fakeSha = createHash('sha256').update('fake').digest('hex')
    const fakeLines = Array.from(
      { length: 5001 },
      (_, i) => `${fakeSha}  .warnyin/workflow/fake-${String(i).padStart(4, '0')}.md`,
    )
    writeFileSync(mp, readFileSync(mp, 'utf8') + fakeLines.join('\n') + '\n')

    const r = runCli(tB, ['--update'])
    ok(r, 'U18b --update (>5000 entry)')

    assert.ok(
      !existsSync(path.join(tB, ...STALE_TOPIC_TEST.split('/'))),
      'C1/C14: manifest >5000 entry → known-stale → test.md ต้องถูกลบ',
    )
    assert.ok(
      !existsSync(path.join(tB, ...STALE_TOPIC_VERIFY.split('/'))),
      'C1/C14: manifest >5000 entry → known-stale → verify.md ต้องถูกลบ',
    )
    assert.ok(r.stdout.includes('ลบ 2'), 'C15: สรุปต้องมี "ลบ 2" (known-stale หลัง entry cap)')
    assert.ok(r.stdout.includes('\u26a0'), 'C15: ต้องมี ⚠ (manifest เกิน entry cap)')

    const readme = path.join(tB, '.warnyin', 'workflow', 'README.md')
    if (existsSync(readme)) {
      assert.ok(existsSync(readme), 'C2: payload README.md ต้องยังอยู่')
    }
  }
})

// U19: EACCES ระหว่างลบ — stale ตัวที่ 3 คนละ dir ยังถูกลบสำเร็จ (C12)
// Wave 1 RED: ไม่มี [prune:io], gone.md ไม่ถูกลบ
test('U19. EACCES ระหว่างลบ — prune ทำงานต่อ ไม่ล้มทั้ง run (C12)', (t) => {
  if (process.platform === 'win32' || process.getuid?.() === 0) {
    console.error('  ⚠ ข้าม EACCES test (win32 หรือ root — chmod ไม่บล็อก) — CI ubuntu ครอบ')
    return
  }

  const { target } = fixtureB(t)

  // ★ stale ตัวที่ 3 — คนละ dir กับ KNOWN_STALE (พิสูจน์ว่า prune ทำงานต่อ)
  addStaleEntry(target, '.warnyin/workflow/legacy-io/gone.md')

  const lockedDir = path.join(target, '.warnyin', 'template', 'stages', '[topic]')
  // ★ ห้ามพึ่ง t.after คืนสิทธิ์ — node:test รัน after hook แบบ FIFO ⇒ rmSync ของ makeTempProject
  //   (ลงทะเบียนก่อนใน fixtureB) จะรันก่อน แล้วล้มด้วย ENOTEMPTY เพราะ dir ยังปิดสิทธิ์อยู่
  //   ⇒ คืนสิทธิ์ใน finally ของ test body ให้เสร็จก่อน hook ใดๆ แม้ assert จะ throw
  chmodSync(lockedDir, 0o500) // ปิดสิทธิ์ write — ลบไฟล์ใน dir นี้ไม่ได้
  try {
  const r = runCli(target, ['--update'])
  ok(r, 'U19 --update') // C12: ห้าม exit != 0 แม้มี EACCES

  // C12: ไฟล์ใน dir ที่ล็อก → EACCES → ต้องมี ⚠ [prune:io]
  assert.ok(r.stdout.includes('[prune:io]'), 'C12: ต้องมี ⚠ [prune:io] สำหรับไฟล์ในdir ที่ล็อก')

  // ★ stale ตัวที่ 3 คนละ dir → ต้องถูกลบสำเร็จ (พิสูจน์ว่า prune ทำงานต่อไม่หยุด)
  const goneAbs = path.join(target, '.warnyin', 'workflow', 'legacy-io', 'gone.md')
  assert.ok(!existsSync(goneAbs), 'C12: .warnyin/workflow/legacy-io/gone.md ต้องถูกลบ (คนละ dir กับ locked)')
  assert.ok(
    r.stdout.includes('\u2212 .warnyin/workflow/legacy-io/gone.md'),
    'C15: ต้องมีบรรทัด − ของ gone.md',
  )
  assert.ok(r.stdout.includes('ลบ 1'), 'C15: สรุปต้องมี "ลบ 1"')
  } finally {
    chmodSync(lockedDir, 0o700)
  }
})

// U20: install สดไม่ลบอะไร + manifest ถูกสร้าง (C13, C15)
// Wave 1 RED: ไม่มี .warnyin-manifest, ไม่มี "ลบ 0" ในสรุป
test('U20. install สดไม่ลบอะไร + manifest ถูกสร้าง (C13, C15)', (t) => {
  const target = makeTempProject(t)
  const r = runCli(target) // install สด ไม่มี --update
  ok(r, 'U20 fresh install')

  // C15: ห้ามมีบรรทัด −
  assert.ok(!r.stdout.includes('\u2212 '), 'C15: install สดต้องไม่มีบรรทัด −')
  // C15: สรุปต้องมี ลบ 0
  assert.ok(r.stdout.includes('ลบ 0'), 'C15: install สดสรุปต้องมี "ลบ 0"')

  // C13: manifest ต้องถูกสร้าง
  const mp = manifestPath(target)
  assert.ok(existsSync(mp), 'C13: install สดต้องสร้าง .warnyin/.warnyin-manifest')

  // ทุก entry ต้อง match /^[0-9a-f]{64}  \S/
  const mContent   = readFileSync(mp, 'utf8')
  const entryLines = mContent.split('\n').filter(l => l && !l.startsWith('#'))
  for (const line of entryLines) {
    assert.ok(
      /^[0-9a-f]{64}  \S/.test(line),
      `C13: manifest entry format ผิด: "${line}"`,
    )
  }

  // C13: ต้องไม่มี entry ขึ้นต้น docs/ (นอกขอบเขต manifest)
  const docsEntries = entryLines.filter(l => (l.split('  ')[1] ?? '').startsWith('docs/'))
  assert.equal(docsEntries.length, 0, 'C13: manifest ต้องไม่มี entry ขึ้นต้น docs/')

  // C13: ต้องไม่มี entry ของตัว manifest เอง
  const selfEntry = entryLines.find(l => l.includes('.warnyin-manifest'))
  assert.equal(selfEntry, undefined, 'C13: manifest ต้องไม่มี entry ของตัวเอง')
})
