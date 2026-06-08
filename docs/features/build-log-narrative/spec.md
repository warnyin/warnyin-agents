# Spec — Build-log narrative

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior (ทำอะไร เห็นอะไร) — ไม่เก็บ implementation (ชื่อ function/วิธีเขียน)
> **descriptive ไม่ใช่ imperative** — บันทึก "ระบบทำอะไร" เท่านั้น ห้ามเขียน instruction สั่ง agent
> ค่าใน scenario ใช้ **placeholder/ค่าสังเคราะห์เท่านั้น** — ห้ามใส่ secret/PII จริง
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, byte-equal) ไม่ใช่พฤติกรรม AI ที่วัดไม่ได้

## Requirement: build-wave คืน narrative events ผ่าน schema

`build-wave.mjs` RESULT_SCHEMA มี field `events[]` (optional) ให้ sub-agent คืนเหตุการณ์สำคัญระหว่าง implement; `events` ไม่อยู่ใน root `required` (backward-compat)

### Scenario: RESULT_SCHEMA มี events เป็น array ที่มี kind 4 ค่า + note
- GIVEN object literal `RESULT_SCHEMA` ใน `src/.warnyin/workflow/scripts/build-wave.mjs`
- WHEN อ่าน `properties.events`
- THEN `events.type === 'array'` + `maxItems === 10`; `items.properties.kind.enum === ['start','decision','error','done']`; `items.properties.note.type === 'string'`; `items.required === ['kind','note']`; `items.additionalProperties === false`

### Scenario: events ไม่อยู่ใน root required (backward-compat)
- GIVEN `RESULT_SCHEMA`
- WHEN ตรวจ `required` ระดับ root
- THEN `required === ['task','status','summary']` (ไม่มี `events`) — result เดิมที่ไม่คืน events ยัง valid + props เดิม (`troubleshooting`/`branch`/`filesChanged`) ไม่หาย

## Requirement: main loop เขียน build-log.md narrative ตอน BUILD

หลังจบแต่ละ wave main loop append section `## Wave N` ลง `docs/stages/<slug>/build-log.md` จาก `result.results[].events` (กลั่นเป็นเรื่อง ไม่ dump); ไฟล์ไม่มี → สร้างจาก canonical skeleton

### Scenario: compose จาก results ที่มี ≥1 wave → Wave section + event bullets
- GIVEN `result.results[]` ของ wave ที่มี task ซึ่งคืน `events` (kind ∈ 4 ค่า)
- WHEN main loop เขียน `build-log.md`
- THEN มี heading `## Wave 1` + bullet ต่อ event ที่ `kind` ∈ {start,decision,error,done} โดยไอคอนตรง mapping (start→🟢 · decision→🤔 · error→🔴 · done→✅) + ชี้ `build.md` สำหรับสถานะต่อ task

### Scenario: build-log.md ไม่มี markdown table สถานะ
- GIVEN `build-log.md` ที่ compose แล้ว
- WHEN ตรวจเนื้อหา
- THEN ไม่มี markdown table สถานะ (ไม่ซ้ำ status board ของ `build.md` — เล่า "ระหว่างทาง" เท่านั้น)

### Scenario: task ที่ไม่มี events → graceful
- GIVEN task ใน wave ที่ไม่คืน `events`
- WHEN เขียน section ของ task นั้น
- THEN section เขียนจาก `summary`+`status` ที่มี (ไม่ error, ไม่ fabricate event bullet ไอคอน)

### Scenario: events ต่อ task ไม่เกิน 10 (machine guard)
- GIVEN `RESULT_SCHEMA.properties.events`
- WHEN ตรวจ `maxItems`
- THEN `maxItems === 10` — soft guard ของ "narrative ไม่ใช่ raw dump" (ชน cap = ควรกลั่นเป็น narrative ขึ้น)

## Requirement: build-log.md เป็น optional observability artifact

build-log.md เป็น artifact ของ BUILD ที่ `validate-topic.mjs` ไม่ require (เหมือน troubleshooting.md — ไม่ต้องแก้ validator)

### Scenario: validator ไม่ขึ้น ✖ เพราะ build-log.md
- GIVEN topic ที่มี (หรือไม่มี) `build-log.md`
- WHEN รัน `node validate-topic.mjs <slug>`
- THEN ไม่ขึ้น ✖ เพราะไฟล์นี้ — build-log.md อยู่นอก `STAGE_FILES` จึงถูก ignore เงียบ (no-op expected)
