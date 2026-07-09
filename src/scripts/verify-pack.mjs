import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// allowlist = safety net ชั้นสองของ package.json `files` — ดัก leak ชนิด "ใหม่" ที่ denylist จับไม่ได้
// narrow src/.claude/ → subdir ตรงกับ files (commands/agents/skills); กัน settings.local.json / subdir อื่นหลุดอนาคต
const ALLOWED_PREFIX = ['src/bin/', 'src/.warnyin/', 'src/.claude/commands/', 'src/.claude/agents/', 'src/.claude/skills/']
// Note: src/.warnyin/ ครอบ src/.warnyin/installer/templates/ อยู่แล้ว — ไม่ต้องเพิ่ม prefix แยก
// npm always-include: package.json / README / LICENSE / CHANGELOG + payload src/AGENTS.md (ต้องอยู่ใน list ไม่งั้น false-positive)
const ALLOWED_FILE = ['package.json', 'README.md', 'CHANGELOG.md', 'LICENSE', 'src/AGENTS.md']

// denylist = งานจริง/tooling/dogfood ที่ "ห้ามหลุด" ขึ้น package เด็ดขาด
// dev tooling + งานจริงของ repo ต้นทาง (installer สร้าง scaffold เปล่าเองตอนติดตั้ง)
const DENY_PREFIX = [
  'src/tests/', 'src/scripts/',           // dev tooling (R2)
  'docs/', '.github/',                     // งานจริง/CI ของ repo
  '.warnyin/', '.claude/',                 // root dogfood ที่ install ลงมา (topic นี้สร้างความเสี่ยงเอง)
]
const DENY_FILE = ['CLAUDE.md', 'AGENTS.md', 'settings.local.json'] // root dogfood doc + tripwire
// tripwire suffix: artifact/secret ที่ห้ามขึ้น package
const DENY_SUFFIX = ['.tgz']

// pure function — รับ file list (POSIX path จาก npm pack --json) คืน error[] (เทสได้โดยไม่เรียก npm pack)
export function checkFiles(files) {
  const errors = []

  // R1: nested dotfolder 2 ก้อนต้องติดทั้งคู่ (บทเรียน 0.6.0 ขยายผล — npm ไม่รวม nested dotfolder ถ้าไม่ระบุ)
  const hasWarnyin = files.some((p) => p.startsWith('src/.warnyin/workflow/'))
  const hasClaude = files.some((p) => p.startsWith('src/.claude/commands/warnyin/'))
  const hasSkills = files.some((p) => p.startsWith('src/.claude/skills/'))
  if (!hasWarnyin) errors.push('src/.warnyin/workflow/ ไม่ติดใน package (R1)')
  if (!hasClaude) errors.push('src/.claude/commands/warnyin/ ไม่ติดใน package (R1)')
  if (!hasSkills) errors.push('src/.claude/skills/ ไม่ติดใน package (R1)')

  // denylist: งานจริง/tooling/dogfood/tripwire รั่ว
  for (const p of files) {
    const base = p.split('/').pop()
    if (DENY_PREFIX.some((d) => p.startsWith(d))) errors.push(`denylist รั่ว: ${p}`)
    else if (DENY_FILE.includes(base) && !p.includes('/')) errors.push(`denylist รั่ว (root dogfood): ${p}`)
    else if (base === 'settings.local.json') errors.push(`tripwire รั่ว: ${p}`)
    else if (DENY_SUFFIX.some((s) => p.endsWith(s))) errors.push(`tripwire รั่ว: ${p}`)
    else if (base.startsWith('.env')) errors.push(`tripwire รั่ว: ${p}`)
  }

  // allowlist: ไฟล์นอก allow ทั้งหมด (กัน leak ชนิดใหม่ที่ denylist ไม่ครอบ)
  for (const p of files) {
    const allowed = ALLOWED_PREFIX.some((x) => p.startsWith(x)) || ALLOWED_FILE.includes(p)
    if (!allowed) errors.push(`ไฟล์นอก allowlist: ${p}`)
  }

  return errors
}

function main() {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' })
  const files = JSON.parse(out)[0].files.map((f) => f.path)
  const errors = checkFiles(files)
  if (errors.length) {
    console.error('✖ pack-verify ล้มเหลว:')
    for (const e of errors) console.error('  ✖', e)
    process.exit(1)
  }
  console.log('✓ pack-verify ผ่าน:', files.length, 'ไฟล์')
}

// main-guard: รันเฉพาะเมื่อ execute ตรง (ไม่ใช่ตอน import จาก unit test) — กัน import trigger npm pack
// ใช้ argv[1] comparison (ไม่ใช่ import.meta.main ที่ undefined บน node 20)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main()
}
