// Unit test ของ pure function checkFiles (BL-4 — testable denylist)
// import checkFiles ตรง — ไม่ trigger npm pack เพราะ main-guard (argv[1] !== module url ตอน import)
// zero-dependency: ใช้เฉพาะ built-in node:*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkFiles } from '../scripts/verify-pack.mjs'

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
