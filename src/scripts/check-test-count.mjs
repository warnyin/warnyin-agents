// Pass-count gate ของ test suite (anti-false-green — troubleshooting #3)
// อ่าน summary ของ `node --test` จาก stdin แล้ว fail ถ้า test ไม่ได้ "เขียวจริง"
//   - ดัก false-green แบบ #3: `node --test <dir>` คืน tests=1 pass=0 แต่ exit อาจหลอก
//   - กัน silent drop: ถ้า pass != tests (มีเคสถูก skip/cancel) → fail
// zero-dependency: ใช้เฉพาะ built-in node:* · ESM (import.meta) ห้าม __dirname/require
//
// ใช้ใน CI: `npm test 2>&1 | node src/scripts/check-test-count.mjs`
// ค่า MIN_PASS = 9 (เคส installer ขั้นต่ำ — bare discovery ต้องเจอครบ; suite อาจมีไฟล์ test อื่นเพิ่ม)
import process from 'node:process'

const MIN_PASS = 9

// อ่าน stdin ทั้งหมด (output ของ node --test ที่ pipe มา)
async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

// ดึงตัวเลขจาก summary line ของ node --test
// รองรับทั้ง spec/tap reporter: `ℹ pass 9` / `# pass 9`
function readMetric(text, name) {
  const re = new RegExp(`^[#ℹ\\s]*${name}\\s+(\\d+)\\s*$`, 'm')
  const m = text.match(re)
  return m ? Number(m[1]) : null
}

const out = await readStdin()
// echo ต่อ เพื่อให้ log ของ CI ยังเห็น output เดิม
process.stdout.write(out)

const tests = readMetric(out, 'tests')
const pass = readMetric(out, 'pass')
const fail = readMetric(out, 'fail')

const errors = []
if (tests === null || pass === null || fail === null) {
  errors.push(`อ่าน summary ของ node --test ไม่ได้ (tests=${tests} pass=${pass} fail=${fail}) — output ผิดรูปหรือ test ไม่ได้รัน`)
} else {
  if (fail !== 0) errors.push(`มี test fail: fail=${fail}`)
  if (pass < MIN_PASS) errors.push(`pass count ต่ำกว่าขั้นต่ำ: pass=${pass} < ${MIN_PASS} (false-green แบบ troubleshooting #3?)`)
  if (pass !== tests) errors.push(`pass != tests (มีเคสถูก skip/cancel): pass=${pass} tests=${tests}`)
}

if (errors.length) {
  console.error('\n✗ pass-count gate FAILED:')
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.error(`\n✓ pass-count gate OK: pass=${pass} tests=${tests} fail=${fail} (>= ${MIN_PASS})`)
