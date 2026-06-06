import { execFileSync } from 'node:child_process'

const out = execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' })
const files = JSON.parse(out)[0].files.map(f => f.path)

// allowlist = safety net ชั้นสองของ package.json `files` — ดัก leak ชนิด "ใหม่" ที่ denylist จับไม่ได้
const ALLOWED_PREFIX = ['bin/', '.warnyin/', '.claude/']
// npm always-include: package.json / README / LICENSE / CHANGELOG (ต้องอยู่ใน list ไม่งั้น false-positive)
const ALLOWED_FILE = ['package.json', 'README.md', 'CLAUDE.md', 'AGENTS.md', 'CHANGELOG.md', 'LICENSE']

const hasWarnyin = files.some(p => p.startsWith('.warnyin/workflow/'))  // dotfolder ติดจริง (บทเรียน 0.6.0)
// docs/stages = งานจริงของ repo ต้นทาง — ห้ามหลุดขึ้น package เด็ดขาด (installer สร้าง scaffold เปล่าเองตอนติดตั้ง; บทเรียน verify installer-test-ci)
const stagesLeak = files.filter(p => p.startsWith('docs/'))
const unexpected = files.filter(p =>
  !ALLOWED_PREFIX.some(x => p.startsWith(x)) && !ALLOWED_FILE.includes(p))

if (!hasWarnyin) { console.error('✖ .warnyin/ ไม่ติดใน package'); process.exit(1) }
if (stagesLeak.length) { console.error('✖ docs/ หลุดขึ้น package (งานจริงของ repo — installer ต้องสร้าง scaffold เปล่าเอง):', stagesLeak); process.exit(1) }
if (unexpected.length) { console.error('✖ ไฟล์นอก allowlist รั่วขึ้น package:', unexpected); process.exit(1) }
console.log('✓ pack-verify ผ่าน:', files.length, 'ไฟล์')
