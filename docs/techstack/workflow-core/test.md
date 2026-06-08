# Test — workflow-core

> วิธีเทส component **workflow-core** · merge จาก `test.md` ของ topic `build-log-narrative`

## หลักการ — ทำไมไม่ใช่ unit test
`build-wave.mjs` = **Workflow script body** (top-level `await parallel()` + global `parallel`/`agent`/`log`/`phase`/`args` ที่ runtime inject, **ไม่มี main-guard**) → **import/`node --check` ตรงไม่ได้**:
- `node --check build-wave.mjs` → `Illegal return statement` (false-red, pre-existing — ดู `docs/troubleshooting.md` #16) → **ห้ามใช้เป็นเกณฑ์ผ่าน**
- แทนที่จะ unit test → ใช้ **structural** (parse object literal) + **executable trace** (mirror compose rule) เหมือน topic `context-working-memory`/`feature-spec-delta`

## วิธีเทส (ไม่ต้องรัน service)
เครื่องมือ: `node` (parse schema / compose trace), `npm test` (`node --test`), `npm run lint:md`, `node validate-topic.mjs <slug>`

### A. Structural
- **schema:** parse `RESULT_SCHEMA` จาก `build-wave.mjs` (brace-match → `new Function`) → assert field ที่เพิ่ม (เช่น `events`: array/`maxItems`/enum/`required`/**ไม่อยู่ root required**) + props/required เดิมครบ
- **canonical-copy:** template `[topic]/<artifact>.md` body == fenced block ใน design ของ topic (exact-match)
- **wiring:** command/playbook มีขั้น/principle/Output/Gate ที่ต้องเพิ่ม

### B. Executable trace (แทน "รัน BUILD จริง" ที่ติด chicken-egg)
- feed **synthetic `results[]`** (≥2 task: 1 มี field ครบ, 1 ไม่มี) → เดิน compose rule (reference impl mirror command/playbook) ด้วยมือ → assert **structural proxy** ของ design intent
- proxy ของ `build-log.md` (5 ข้อ): (1) `## Wave N` ครบ · (2) bullet `kind` ∈ 4 ค่า + ไอคอนตรง mapping · (3) task ไม่มี events → graceful จาก summary+status · (4) ไม่มี markdown status table · (5) events/task ≤ `maxItems`
- harness เป็น scratch script **นอก repo (OS temp)** → ไม่หลุด `node --test` glob (ไม่เพิ่ม test count); ผลเขียนเป็น manual proof ใน `verify.md`

### C. Self-dogfood (secondary)
- รัน BUILD กับ topic ของ component เอง → root dogfood ยังเป็น release เก่า (logic ใหม่ยังไม่ active) → main loop เขียน artifact ตาม canonical **ด้วยมือ** = artifact จริง; auto active หลัง `--update`/release ถัดไป

### D. Regression
- `npm test` → **pass == tests** (ไม่มี skip, ผ่าน `check-test-count.mjs`) — acceptance = **pass-count ไม่ใช่แค่ exit 0** (`docs/troubleshooting.md` #13)
- `lint:md` เขียว (ลิงก์ artifact ใหม่ resolve); `validate-topic.mjs <slug>` exit 0 (artifact ใหม่ที่อยู่นอก `STAGE_FILES` = no-op)

## qualitative (non-gate)
"เล่าเป็นเรื่อง"/คุณภาพ narrative = subjective → manual review note ใน `verify.md` ไม่ใช่ gate (วัด observable ด้วย proxy + machine guard `maxItems` แทน)
