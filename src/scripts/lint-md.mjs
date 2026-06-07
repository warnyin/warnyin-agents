import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, resolve, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// dead-link gate ของ .md ทั้ง repo — zero-dep (mirror verify-pack.mjs: pure fn + main-guard)
// EXCLUDE = prefix (relative-from-root, POSIX) ที่ไม่สแกน (ตาม spec §2):
//  - src/.warnyin/template/ = scaffold (placeholder link ที่ target สร้างเอง)
//  - docs/stages/achieved/  = archived stages (ลิงก์เก่า ไม่ enforce — task.md §4)
const EXCLUDE_PREFIX = ['src/.warnyin/template/', 'docs/stages/achieved/']
// dir ที่ไม่เดินลงไปเลย (walk-time skip)
const SKIP_DIR = new Set(['node_modules'])
// root ที่สแกนหา *.md
const SCAN_ROOTS = ['src', 'docs']

// strip code ก่อน match link — กัน false-positive จาก [](...) ใน fenced/inline code
// alternation pass เดียว (fenced | inline) จับ "อันที่เปิดก่อน" ตามลำดับเอกสาร —
// กันเคส triple-backtick ที่ฝังอยู่ใน inline-code (เอกสาร repo-lint เองอธิบาย regex นี้)
const CODE_RE = /```[\s\S]*?```|`[^`\n]*`/g
const LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g

// pure function — รับ docs[] ({file: relative POSIX, content}) + injectable exists → คืน error[]
// เทสได้โดยไม่แตะ fs จริง (feed exists ปลอม) — BL-4 แบบ checkFiles
export function checkLinks(docs, exists) {
  const errors = []
  for (const { file, content } of docs) {
    const stripped = content.replace(CODE_RE, '')
    const linkRe = new RegExp(LINK_RE.source, 'g')
    let m
    while ((m = linkRe.exec(stripped)) !== null) {
      const target = m[1].trim()
      if (/^https?:/.test(target) || /^mailto:/.test(target) || target.startsWith('#')) continue
      const p = target.split('#')[0]
      if (!p) continue // anchor ล้วน (#sec) — ไม่มี path ให้เช็ค
      const abs = resolve(dirname(file), p)
      if (!exists(abs)) errors.push(`${file}: ลิงก์เสีย -> ${target}`)
    }
  }
  return errors
}

// แปลง absolute path → relative-from-root แบบ POSIX (สำหรับ EXCLUDE prefix + error message)
function toPosixRel(rootDir, absPath) {
  return relative(rootDir, absPath).split(sep).join('/')
}

// เดิน dir เก็บ *.md (ข้าม node_modules) → คืน absolute path[]
function walkMd(dir, acc) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIR.has(entry.name)) continue
      walkMd(join(dir, entry.name), acc)
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      acc.push(join(dir, entry.name))
    }
  }
  return acc
}

function main() {
  const rootDir = process.cwd()
  const docs = []
  for (const root of SCAN_ROOTS) {
    const rootAbs = join(rootDir, root)
    if (!existsSync(rootAbs) || !statSync(rootAbs).isDirectory()) continue
    for (const abs of walkMd(rootAbs, [])) {
      const file = toPosixRel(rootDir, abs)
      if (EXCLUDE_PREFIX.some((pre) => file.startsWith(pre))) continue
      docs.push({ file, content: readFileSync(abs, 'utf8') })
    }
  }

  // file เป็น relative → resolve(dirname(file), p) ใน checkLinks ผูกกับ cwd อยู่แล้ว (abs จริง)
  const errors = checkLinks(docs, existsSync)

  if (errors.length) {
    console.error('✖ lint-md ล้มเหลว:')
    for (const e of errors) console.error('  ✖', e)
    process.exit(1)
  }

  // นับลิงก์ relative ที่ตรวจ (เพื่อ log)
  let linkCount = 0
  for (const { content } of docs) {
    const stripped = content.replace(CODE_RE, '')
    const linkRe = new RegExp(LINK_RE.source, 'g')
    let m
    while ((m = linkRe.exec(stripped)) !== null) {
      const t = m[1].trim()
      if (/^https?:/.test(t) || /^mailto:/.test(t) || t.startsWith('#')) continue
      if (!t.split('#')[0]) continue
      linkCount++
    }
  }
  console.log('✓ lint-md ผ่าน:', docs.length, 'ไฟล์', linkCount, 'ลิงก์')
}

// main-guard: รันเฉพาะเมื่อ execute ตรง (ไม่ใช่ตอน import จาก unit test) — กัน import trigger main
// argv[1] comparison (ไม่ใช่ import.meta.main ที่ undefined บน node 20)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main()
}
