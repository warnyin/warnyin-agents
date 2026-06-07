// Unit test ของ pure function checkLinks (gate testable — BL-4)
// import checkLinks ตรง — ไม่ trigger main เพราะ main-guard (argv[1] !== module url ตอน import)
// fake exists = injectable → ไม่แตะ fs จริง
// zero-dependency: ใช้เฉพาะ built-in node:*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkLinks } from '../scripts/lint-md.mjs'

const always = () => true
const never = () => false

test('good link (exists→true) → ไม่มี error', () => {
  const docs = [{ file: 'docs/a.md', content: '[x](./b.md)' }]
  assert.deepEqual(checkLinks(docs, always), [])
})

test('dead link (exists→false) → error มี target', () => {
  const docs = [{ file: 'docs/a.md', content: '[x](./missing.md)' }]
  const errors = checkLinks(docs, never)
  assert.equal(errors.length, 1)
  assert.ok(errors[0].includes('./missing.md'), `error ต้องอ้าง target: ${errors[0]}`)
})

test('link ใน inline-code → ข้าม (ไม่ error แม้ exists→false)', () => {
  const docs = [{ file: 'docs/a.md', content: 'ตัวอย่าง `[x](./nope.md)` ในโค้ด' }]
  assert.deepEqual(checkLinks(docs, never), [])
})

test('link ใน fenced code → ข้าม', () => {
  const docs = [{ file: 'docs/a.md', content: '```\n[x](./nope.md)\n```' }]
  assert.deepEqual(checkLinks(docs, never), [])
})

test('http(s):// / mailto: / #anchor → ข้าม', () => {
  const docs = [{
    file: 'docs/a.md',
    content: '[h](https://x.com) [m](mailto:a@b.com) [a](#sec)',
  }]
  assert.deepEqual(checkLinks(docs, never), [])
})

test('path#sec (path exists) → ไม่ error (ตัด anchor ก่อนเช็ค path)', () => {
  const docs = [{ file: 'docs/a.md', content: '[x](./b.md#section)' }]
  // exists ปลอม: true เฉพาะเมื่อ path ไม่มี '#' (พิสูจน์ว่าตัด anchor แล้วค่อยเช็ค)
  const exists = (abs) => !abs.includes('#')
  assert.deepEqual(checkLinks(docs, exists), [])
})

test('fake exists injectable — บันทึก path ที่ถูกเช็ค (ไม่แตะ fs จริง)', () => {
  const seen = []
  const exists = (abs) => { seen.push(abs); return true }
  checkLinks([{ file: 'docs/a.md', content: '[x](./b.md)' }], exists)
  assert.equal(seen.length, 1, 'ต้องเรียก exists ที่ inject ครั้งเดียว')
  assert.ok(seen[0].endsWith('b.md'), `path ที่ส่งให้ exists ต้องเป็น resolved b.md: ${seen[0]}`)
})
