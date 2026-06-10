// Unit test ของ build-wave.mjs — normalizeTasks + buildOpts (model arg pass-through)
// ★ runtime-extract ห้าม import ตรง (troubleshooting #16): build-wave.mjs มี top-level return/export
//   + ใช้ globals ที่ harness inject (args/agent/parallel/log/phase) → import/node --check พัง
//   วิธี: fs.readFileSync → สกัด function ด้วย brace-count → new Function inject RESULT_SCHEMA ปลอม → assert
// zero-dependency: ใช้เฉพาะ built-in node:*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SRC = readFileSync(
  fileURLToPath(new URL('../.warnyin/workflow/scripts/build-wave.mjs', import.meta.url)),
  'utf8',
)

// สกัด source ของ function declaration หนึ่งตัวด้วยการนับวงเล็บปีกกา (รองรับ nested {})
function extractFn(src, name) {
  const start = src.indexOf(`function ${name}`)
  assert.ok(start !== -1, `ไม่พบ function ${name} ใน build-wave.mjs`)
  const open = src.indexOf('{', start)
  let depth = 0
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') {
      depth--
      if (depth === 0) return src.slice(start, i + 1)
    }
  }
  throw new Error(`สกัด function ${name} ไม่ครบ — วงเล็บปีกกาไม่ปิด`)
}

// โหลด normalizeTasks + buildOpts เข้า sandbox เดียว (buildOpts อ้าง RESULT_SCHEMA → inject เป็น global ปลอม)
const RESULT_SCHEMA = { type: 'object', __fake: true }
const factory = new Function(
  'RESULT_SCHEMA',
  `${extractFn(SRC, 'normalizeTasks')}\n${extractFn(SRC, 'buildOpts')}\nreturn { normalizeTasks, buildOpts }`,
)
const { normalizeTasks, buildOpts } = factory(RESULT_SCHEMA)

// เคส A (backward-compat): tasks เป็น string[] → normalize เป็น {name, model: undefined}
// + agent opts (isolate) ไม่มี key model
test('เคส A: string[] → normalize {name, model: undefined} + opts ไม่มี key model', () => {
  const norm = normalizeTasks(['a', 'b'])
  assert.deepEqual(norm, [
    { name: 'a', model: undefined },
    { name: 'b', model: undefined },
  ])

  const opts = buildOpts(norm[0], true)
  assert.equal('model' in opts, false, 'opts ต้องไม่มี key model เมื่อ task เป็น string เดิม')
  assert.equal(opts.label, 'build:a')
  assert.equal(opts.isolation, 'worktree')
  assert.equal(opts.schema, RESULT_SCHEMA)
})

// เคส B (มี model): {name, model:'opus'} → opts มี model: 'opus' (pass-through)
test("เคส B: {name, model:'opus'} → opts มี model: 'opus' (pass-through)", () => {
  const norm = normalizeTasks([{ name: 'a', model: 'opus' }])
  assert.deepEqual(norm, [{ name: 'a', model: 'opus' }])

  const opts = buildOpts(norm[0], true)
  assert.equal(opts.model, 'opus', 'opts ต้องมี model pass-through ตรงค่าที่รับมา')
  assert.equal(opts.isolation, 'worktree')
})

// เคส C (ไม่มี model): {name} → opts ไม่มี key model (ไม่ใช่ undefined)
test('เคส C: {name} ไม่มี model → opts ไม่มี key model (ไม่ใช่ undefined)', () => {
  const norm = normalizeTasks([{ name: 'a' }])
  assert.deepEqual(norm, [{ name: 'a', model: undefined }])

  const opts = buildOpts(norm[0], true)
  assert.equal('model' in opts, false, 'opts ต้องไม่มี key model เมื่อ task ไม่มี model')
})

// เคส D (shared tree, !isolate): opts ไม่มี key isolation + ยัง honor model
test('เคส D: !isolate → opts ไม่มี key isolation; model ยัง pass-through', () => {
  const opts = buildOpts({ name: 'a', model: 'haiku' }, false)
  assert.equal('isolation' in opts, false, 'opts ต้องไม่มี key isolation เมื่อ shared tree')
  assert.equal(opts.model, 'haiku')
})

// เคส E (empty/undefined input): normalizeTasks รับ undefined → [] (backward: ไม่ส่ง tasks)
test('เคส E: normalizeTasks(undefined) → [] (ไม่ throw)', () => {
  assert.deepEqual(normalizeTasks(undefined), [])
  assert.deepEqual(normalizeTasks([]), [])
})
