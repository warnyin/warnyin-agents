# Standard — workflow-core

> มาตรฐาน/แพทเทิร์นการเขียนของ component **workflow-core** · อิง `docs/rule.md` (global) + ใช้คู่ `./rule.md`

## RESULT_SCHEMA (สัญญา sub-agent ↔ main loop)
- field เป็น **JSON Schema object literal** ใน `build-wave.mjs`; object มี `additionalProperties: false`
- **field ใหม่ต่อท้าย `properties`** — optional (**ไม่อยู่ root `required`**) เพื่อ backward-compat; pattern อ้างอิง: `troubleshooting[]` และ `events[]` (array ของ object ที่ `additionalProperties:false` + `required` ของตัวเอง)
- enum field ที่ opinionated (เช่น `status`, `events[].kind`) เขียนเป็น `{ enum: [...] }` ไม่ใส่ `type` ซ้ำ (ตาม pattern เดิมใน schema)

## main loop เขียน topic file เอง (ไม่ใช่ sub-agent)
- artifact ระดับ topic ที่ต้องรวมผลจากหลาย agent (`troubleshooting.md`, `build-log.md`) → **main loop ดึง field จาก `result.results[]` แล้วเขียนไฟล์เอง** — กันไฟล์ชนใน worktree (`docs/troubleshooting.md` #14) และให้ผ่านการกลั่น (ไม่ dump ดิบ)
- pattern อ้างอิง: command `build.md` ขั้นรวม troubleshooting (ดึง `result.results[].troubleshooting`) — `events` ใช้ pattern เดียวกัน (`result.results[].events`)

## compose = instruction ใน playbook/command ไม่ใช่ code
- การกลั่น narrative (`build-log.md`) เขียนเป็น **ขั้นตอนใน command/playbook** ให้ main loop (AI) ทำ — **ไม่สร้าง compose function** ใน script (narrative = AI judgment; deterministic script จะได้ raw dump)
- โครง/ไอคอน/นิยามเต็มของ artifact = canonical เดียว (design ของ topic §3 / template `[topic]/build-log.md`) → prompt ใน script, ขั้น compose ใน command/playbook = **pointer copy คำต่อคำ** (canonical-copy)

## validate Workflow script (ทดสอบ)
- `build-wave.mjs` **import/`node --check` ตรงไม่ได้** (top-level `await parallel()` + global runtime, ไม่มี main-guard) → schema validate ด้วย **parse object literal** (brace-match → `new Function`) + behavior พิสูจน์ด้วย **executable trace** (mirror compose rule กับ synthetic results) — ไม่ใช่ unit test ของ script ตรง ๆ
- เทียบ pattern testable ของ dev script (`lint-md.mjs`/`verify-pack.mjs` แยก pure fn + main-guard) — **Workflow script ทำแบบนั้นไม่ได้** เพราะ runtime contract ต่างกัน → ใช้ structural + trace แทน (ดู `./test.md`)

## ทั่วไป
- ภาษาไทย, เขียนแบบ playbook (สั้น ชี้กลับแก่น); tool-agnostic (ทุก harness อ่าน `.md` เดียวกัน)
- `events`/`build-log.md` มี **soft guard** (`maxItems:10`) เป็น machine-enforced ของ design intent ("narrative ไม่ใช่ dump") — ออกแบบเกณฑ์ที่ **observable/วัดได้** แทน subjective
