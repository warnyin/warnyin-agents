// Unit test ของ pure function checkFiles (BL-4 — testable denylist)
// import checkFiles ตรง — ไม่ trigger npm pack เพราะ main-guard (argv[1] !== module url ตอน import)
// zero-dependency: ใช้เฉพาะ built-in node:*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, symlinkSync, rmSync, readFileSync, statSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { checkFiles, getNpmCmd, checkEol, readTextEntries } from '../scripts/verify-pack.mjs'

// payload ที่ถูกต้อง (allow ครบ + assertion ทั้ง 2 ก้อนผ่าน) — baseline สำหรับ mutate
const GOOD = [
  'package.json',
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'src/AGENTS.md',
  'src/bin/cli.mjs',
  'src/.warnyin/workflow/README.md',
  'src/.warnyin/template/x.md',
  'src/.warnyin/template/docs/memory.md',
  'src/.claude/commands/warnyin/build.md',
  'src/.claude/agents/warnyin-x.md',
  'src/.claude/skills/explore/SKILL.md',
]

test('payload ถูกต้อง → ไม่มี error', () => {
  assert.deepEqual(checkFiles(GOOD), [])
})

test('R2 denylist: src/tests/ หลุด → จับได้ (กัน gate ลวง)', () => {
  const errors = checkFiles([...GOOD, 'src/tests/x.test.mjs'])
  assert.ok(errors.length > 0, 'denylist ต้องจับ src/tests/')
  assert.ok(errors.some((e) => e.includes('src/tests/x.test.mjs')), `error ต้องอ้าง src/tests/: ${errors.join(' | ')}`)
})

test('R2 denylist: src/scripts/ หลุด → จับได้', () => {
  const errors = checkFiles([...GOOD, 'src/scripts/verify-pack.mjs'])
  assert.ok(errors.some((e) => e.includes('src/scripts/')), `ต้องจับ src/scripts/: ${errors.join(' | ')}`)
})

test('R2 denylist: docs/ และ .github/ หลุด → จับได้', () => {
  const errors = checkFiles([...GOOD, 'docs/project.md', '.github/workflows/ci.yml'])
  assert.ok(errors.some((e) => e.includes('docs/project.md')), 'ต้องจับ docs/')
  assert.ok(errors.some((e) => e.includes('.github/workflows/ci.yml')), 'ต้องจับ .github/')
})

test('denylist: root dogfood (.warnyin/, .claude/, CLAUDE.md, AGENTS.md) หลุด → จับได้', () => {
  const errors = checkFiles([...GOOD, '.warnyin/workflow/x.md', '.claude/commands/warnyin/x.md', 'CLAUDE.md', 'AGENTS.md'])
  assert.ok(errors.some((e) => e.includes('.warnyin/workflow/x.md')), 'ต้องจับ root .warnyin/')
  assert.ok(errors.some((e) => e.includes('.claude/commands/warnyin/x.md')), 'ต้องจับ root .claude/')
  assert.ok(errors.some((e) => /(\s|:)CLAUDE\.md/.test(e) || e.includes('CLAUDE.md')), 'ต้องจับ root CLAUDE.md')
  assert.ok(errors.some((e) => e.includes('AGENTS.md') && !e.includes('src/')), 'ต้องจับ root AGENTS.md')
})

test('tripwire: settings.local.json / *.tgz / .env หลุด → จับได้', () => {
  const errors = checkFiles([...GOOD, 'src/.claude/commands/settings.local.json', 'warnyin-agents-0.7.0.tgz', '.env'])
  assert.ok(errors.some((e) => e.includes('settings.local.json')), 'ต้องจับ settings.local.json')
  assert.ok(errors.some((e) => e.includes('.tgz')), 'ต้องจับ *.tgz')
  assert.ok(errors.some((e) => e.includes('.env')), 'ต้องจับ .env*')
})

test('R1 assertion: ขาด src/.warnyin/workflow/ → คืน error', () => {
  const noWarnyin = GOOD.filter((p) => !p.startsWith('src/.warnyin/workflow/'))
  const errors = checkFiles(noWarnyin)
  assert.ok(errors.some((e) => e.includes('src/.warnyin/workflow/')), `hasWarnyin assertion ต้องทำงาน: ${errors.join(' | ')}`)
})

test('R1 assertion: ขาด src/.claude/commands/warnyin/ → คืน error', () => {
  const noClaude = GOOD.filter((p) => !p.startsWith('src/.claude/commands/warnyin/'))
  const errors = checkFiles(noClaude)
  assert.ok(errors.some((e) => e.includes('src/.claude/commands/warnyin/')), `hasClaude assertion ต้องทำงาน: ${errors.join(' | ')}`)
})

test('allowlist: ไฟล์นอก allow (เช่น src/.vscode/) → จับได้', () => {
  const errors = checkFiles([...GOOD, 'src/.vscode/x.json'])
  assert.ok(errors.some((e) => e.includes('src/.vscode/x.json')), `narrow allowlist ต้องจับ subdir นอก allow: ${errors.join(' | ')}`)
})

test('R1 assertion: ขาด src/.claude/skills/ → คืน error', () => {
  const noSkills = GOOD.filter((p) => !p.startsWith('src/.claude/skills/'))
  const errors = checkFiles(noSkills)
  assert.ok(errors.some((e) => e.includes('src/.claude/skills/')), `hasSkills assertion ต้องทำงาน: ${errors.join(' | ')}`)
})

test('R1 assertion: ขาด src/.warnyin/template/docs/ → คืน error (กัน gate ลวงของ template)', () => {
  const noTemplateDocs = GOOD.filter((p) => !p.startsWith('src/.warnyin/template/docs/'))
  const errors = checkFiles(noTemplateDocs)
  assert.ok(
    errors.some((e) => e.includes('src/.warnyin/template/docs/')),
    `hasTemplateDocs assertion ต้องทำงาน: ${errors.join(' | ')}`,
  )
})

// T2: adapter template paths pass allowlist (src/.warnyin/ ครอบ installer/templates/ อยู่แล้ว)
test('T2-adapter-templates: adapter template paths ผ่าน allowlist (ไม่ error)', () => {
  const withAdapters = [
    ...GOOD,
    'src/.warnyin/installer/templates/cursor-rules.mdc',
    'src/.warnyin/installer/templates/windsurf-rules.md',
    'src/.warnyin/installer/templates/copilot-instructions.md',
    'src/.warnyin/installer/templates/clinerules',
    'src/.warnyin/installer/templates/GEMINI.md',
  ]
  assert.deepEqual(checkFiles(withAdapters), [], 'adapter template paths ต้องผ่าน allowlist โดยไม่มี error')
})

// T2-negative: path ต้องห้าม (docs/, src/tests/) ยังจับได้แม้ add adapter
test('T2-negative: denylist ยังจับ path ต้องห้ามหลัง add adapter template', () => {
  const withAdapters = [
    ...GOOD,
    'src/.warnyin/installer/templates/cursor-rules.mdc',
    'docs/stages/demo.md',
  ]
  const errors = checkFiles(withAdapters)
  assert.ok(errors.some((e) => e.includes('docs/stages/demo.md')), `denylist ต้องยังจับ docs/: ${errors.join(' | ')}`)
})

// stamp deny: .warnyin/.warnyin-version (root-level) ต้องถูกจับ — พิสูจน์ gate จับได้ถ้า stamp หลุดขึ้น tarball
test('stamp deny: .warnyin/.warnyin-version (root) หลุดขึ้น tarball → gate จับได้', () => {
  const errors = checkFiles([...GOOD, '.warnyin/.warnyin-version'])
  assert.ok(errors.length > 0, 'gate ต้องจับ .warnyin/.warnyin-version ที่ root')
  assert.ok(
    errors.some((e) => e.includes('.warnyin/.warnyin-version')),
    `error ต้องอ้าง .warnyin/.warnyin-version: ${errors.join(' | ')}`,
  )
})

// ─────────────────────────────────────────────────────────────
// Slice A: verify-pack-hardening — เพิ่ม EOL gate + cross-platform npm binary
// (4 + 4 + 5 = 13 เคส — pattern isEntrypoint-style injectable เพื่อ testable)
// ─────────────────────────────────────────────────────────────

// === getNpmCmd (pure fn, 4 เคส — Windows/mac/linux selection) ===
test('getNpmCmd-darwin: คืน { bin: npm, prefix: [] }', () => {
  assert.deepEqual(getNpmCmd('darwin'), { bin: 'npm', prefix: [] })
})

test('getNpmCmd-linux: คืน { bin: npm, prefix: [] }', () => {
  assert.deepEqual(getNpmCmd('linux'), { bin: 'npm', prefix: [] })
})

test('getNpmCmd-win32 + npm_execpath: คืน { bin: process.execPath, prefix: [npm_execpath] }', () => {
  const fakePath = '/abs/path/to/node_modules/npm/bin/npm-cli.js'
  const prev = process.env.npm_execpath
  process.env.npm_execpath = fakePath
  try {
    const result = getNpmCmd('win32')
    assert.equal(result.bin, process.execPath, 'bin ต้องเป็น process.execPath (ไม่ใช่ .cmd)')
    assert.deepEqual(result.prefix, [fakePath], 'prefix ต้องเป็น [npm_execpath]')
  } finally {
    if (prev === undefined) delete process.env.npm_execpath
    else process.env.npm_execpath = prev
  }
})

test('getNpmCmd-win32 ไม่มี npm_execpath: คืน null (false-green guard)', () => {
  const prev = process.env.npm_execpath
  delete process.env.npm_execpath
  try {
    assert.equal(getNpmCmd('win32'), null, 'ต้องคืน null เพื่อให้ main() exit 1 + error "ต้องรันผ่าน npm run verify:pack"')
  } finally {
    if (prev !== undefined) process.env.npm_execpath = prev
  }
})

// === checkEol (pure fn, 4 เคส — Buffer-level byte check + TEXT_EXT gate) ===
test('checkEol-LF-only: text ext + buf มีแต่ LF → ไม่มี error', () => {
  const errors = checkEol([{ path: 'src/a.md', buf: Buffer.from('hello\nworld\n'), ext: '.md' }])
  assert.deepEqual(errors, [], 'LF-only ต้องไม่มี error')
})

test('checkEol-CRLF: text ext + buf มี \\r\\n → error prefix eol: พร้อมจำนวน', () => {
  const errors = checkEol([{ path: 'src/a.md', buf: Buffer.from('a\r\nb\r\nc\r\nd'), ext: '.md' }])
  assert.equal(errors.length, 1, 'ต้องมี 1 error')
  assert.ok(errors[0].startsWith('eol:'), `error ต้องขึ้นต้นด้วย "eol:": ${errors[0]}`)
  assert.ok(errors[0].includes('3 ครั้ง'), `error ต้องระบุจำนวน CR: ${errors[0]}`)
  assert.ok(errors[0].includes('src/a.md'), `error ต้องระบุ path: ${errors[0]}`)
})

test('checkEol-binary-skip: ext ไม่อยู่ใน TEXT_EXT (เช่น .png) → ข้ามแม้มี 0x0D', () => {
  const errors = checkEol([{ path: 'icon.png', buf: Buffer.from([0xff, 0x0d, 0xd8]), ext: '.png' }])
  assert.deepEqual(errors, [], 'binary ext (.png) ต้องข้าม แม้มี 0x0D ใน buf')
})

test('checkEol-empty: buf ว่าง → ไม่มี error', () => {
  const errors = checkEol([{ path: 'empty.md', buf: Buffer.alloc(0), ext: '.md' }])
  assert.deepEqual(errors, [], 'empty buf ต้องไม่มี error')
})

// === readTextEntries (I/O + path guards + size cap, 5 เคส) ===
test("readTextEntries-happy-path: files=['src/a.md'] + readFile=fake + root=tmp → 1 entry (buf populated)", () => {
  // สร้างไฟล์จริงใน tmpdir เพื่อให้ lstatSync ผ่าน (path.resolve(root, p) ต้องชี้ไฟล์จริง)
  const fakeBuf = Buffer.from('hello\nworld\n')
  const tmp = mkdtempSync(path.join(tmpdir(), 'wy-rte-happy-'))
  try {
    const subdir = path.join(tmp, 'src')
    const fileAbs = path.join(subdir, 'a.md')
    mkdirSync(subdir, { recursive: true })
    writeFileSync(fileAbs, 'unused') // content จะถูก fake override
    let readFileCalled = false
    const fakeReadFile = (abs) => {
      readFileCalled = true
      assert.ok(abs.endsWith('a.md'), `readFile ต้องถูกเรียกกับ absolute path ลงท้าย a.md: ${abs}`)
      return fakeBuf
    }
    const { entries, errors } = readTextEntries(['src/a.md'], { readFile: fakeReadFile, root: tmp })
    assert.deepEqual(errors, [], 'happy path ต้องไม่มี error')
    assert.equal(entries.length, 1)
    assert.equal(entries[0].path, 'src/a.md')
    assert.ok(entries[0].buf.equals(fakeBuf), 'buf ต้องมาจาก readFile')
    assert.equal(entries[0].ext, '.md')
    assert.ok(readFileCalled, 'readFile injectable ต้องถูกเรียก')
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})

test("readTextEntries-absolute-path: files=['/etc/passwd'] → error prefix path: absolute path", () => {
  const { entries, errors } = readTextEntries(['/etc/passwd'], { readFile: () => Buffer.from('x') })
  assert.equal(entries.length, 0, 'absolute path ห้ามถูก read (ไม่ push entry)')
  assert.equal(errors.length, 1, 'ต้องมี 1 error')
  assert.ok(errors[0].startsWith('path:'), `error ต้องขึ้นต้นด้วย "path:": ${errors[0]}`)
  assert.ok(errors[0].includes('absolute path'), `error ต้องระบุ "absolute path": ${errors[0]}`)
  assert.ok(errors[0].includes('/etc/passwd'), `error ต้องระบุ path ที่บล็อก: ${errors[0]}`)
})

test("readTextEntries-traversal: files=['../../../etc/passwd'] → error prefix path: มี segment ..", () => {
  const traversal = '../../../etc/passwd'
  const { entries, errors } = readTextEntries([traversal], { readFile: () => Buffer.from('x') })
  assert.equal(entries.length, 0, 'traversal path ห้ามถูก read')
  assert.equal(errors.length, 1)
  assert.ok(errors[0].startsWith('path:'), `error ต้องขึ้นต้นด้วย "path:": ${errors[0]}`)
  assert.ok(errors[0].includes('..'), `error ต้องระบุ ".." segment: ${errors[0]}`)
})

test('readTextEntries-symlink-guard: lstat.isSymbolicLink()=true → error path: symlink (ไม่ read)', () => {
  // สร้าง symlink จริงใน os.tmpdir() (test pattern เดียวกับ installer.test — ใช้ fs จริง)
  const tmp = mkdtempSync(path.join(tmpdir(), 'wy-rte-symlink-'))
  try {
    const target = path.join(tmp, 'real.md')
    writeFileSync(target, 'hello\n')
    const link = path.join(tmp, 'link.md')
    symlinkSync(target, link)
    const { entries, errors } = readTextEntries([link], { root: tmp, readFile: (abs) => readFileSync(abs) })
    assert.equal(entries.length, 0, 'symlink ห้ามถูก read (ไม่ push entry)')
    assert.equal(errors.length, 1)
    assert.ok(errors[0].startsWith('path:'), `error ต้องขึ้นต้นด้วย "path:": ${errors[0]}`)
    assert.ok(errors[0].includes('symlink'), `error ต้องระบุ "symlink": ${errors[0]}`)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})

test('readTextEntries-size-cap: size > maxBytes → entries.buf=null + ไม่ error', () => {
  // สร้างไฟล์จริงใน tmp (เล็ก 1 byte) + maxBytes=0 → trigger size cap → buf=null, ไม่ error
  const tmp = mkdtempSync(path.join(tmpdir(), 'wy-rte-sizecap-'))
  try {
    const huge = path.join(tmp, 'huge.md')
    writeFileSync(huge, 'x') // 1 byte แต่ maxBytes=0 → cap trigger
    const { entries, errors } = readTextEntries(['huge.md'], { root: tmp, maxBytes: 0, readFile: (abs) => readFileSync(abs) })
    assert.deepEqual(errors, [], 'size cap ต้องไม่ error (warn เท่านั้น)')
    assert.equal(entries.length, 1)
    assert.equal(entries[0].buf, null, 'buf ต้องเป็น null เมื่อ size > maxBytes')
    assert.equal(entries[0].path, 'huge.md')
    assert.equal(entries[0].ext, '.md')
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})

// === Integration regression: existing checkFiles baseline ===
test('checkFiles-GOOD-baseline: payload GOOD (LF) → checkFiles(GOOD) === [] (signature เดิมผ่าน)', () => {
  // sanity — pure fn signature คงเดิม (regression guard ของ purity contract)
  assert.deepEqual(checkFiles(GOOD), [])
})
