# Spec — Adaptive API documentation

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior (ทำอะไร เห็นอะไร) — ไม่เก็บ implementation
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, ลิงก์ resolve)
> ค่าใน scenario ใช้ placeholder/ค่าสังเคราะห์เท่านั้น

## Requirement: capability doc กลางของ API-doc

มีไฟล์ playbook กลาง `src/.warnyin/workflow/api-doc.md` เป็น single source ของ adaptive API documentation

### Scenario: ไฟล์ capability มีอยู่ + ครอบ section หลัก
- GIVEN ไดเรกทอรี `src/.warnyin/workflow/`
- WHEN เปิด `api-doc.md`
- THEN มีไฟล์นี้ และมี section "Auto-detect", "เลือกโหมด" (design-first/code-first/hybrid), "บทบาทต่อ stage" (DESIGN/VERIFY/SHIP)

## Requirement: auto-detect แบบ adaptive

capability ระบุสัญญาณตรวจว่า topic แตะ backend/REST API ไหม และระบุชัดว่าไม่ใช่ → ข้าม

### Scenario: §Auto-detect มีสัญญาณ + ทางออกเมื่อไม่ใช่
- GIVEN section "Auto-detect" ใน `api-doc.md`
- WHEN อ่านเนื้อหา
- THEN ระบุสัญญาณ (techstack เป็น HTTP service, route ในโค้ด, annotation, API task, endpoint change) และระบุว่า "ไม่ใช่ → ข้าม"

## Requirement: stage hook ชี้ capability ไม่ duplicate

playbook `design.md`/`verify.md`/`ship.md` แต่ละไฟล์มี pointer ไป `.warnyin/workflow/api-doc.md` แทนการ copy logic

### Scenario: สาม stage มี pointer ไป api-doc
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/{design,verify,ship}.md`
- WHEN ค้นข้อความที่อ้าง `api-doc.md`
- THEN ทั้งสามไฟล์มีสตริง `.warnyin/workflow/api-doc.md` อย่างน้อยไฟล์ละหนึ่งครั้ง ในจุดที่ stage เรียกใช้จริง (design §6/gate, verify §4/gate, ship process/gate)

## Requirement: gate item เป็น conditional (N/A เมื่อไม่ใช่ REST API)

gate ของ 3 stage มีข้อ API contract ที่ระบุว่าใช้เฉพาะ topic ที่แตะ REST API

### Scenario: gate item ระบุเงื่อนไข
- GIVEN section Gate ของ `design.md`/`verify.md`/`ship.md`
- WHEN อ่านข้อ gate ที่เกี่ยวกับ API contract/openapi
- THEN ข้อความระบุเงื่อนไข "ถ้าแตะ REST API" หรือ "N/A" หรือ "ถ้ามี openapi.yaml" สำหรับ topic ที่ไม่ใช่ backend

## Requirement: reference ไม่ vendor

อ้างอิง skill ภายนอก + เครื่องมือแบบติดตั้งเอง โดยไม่ก๊อป SKILL.md/template เข้า repo

### Scenario: roles README มีแถว reference + ไม่มี vendored skill
- GIVEN `src/.warnyin/workflow/roles/README.md` section "Skill เสริม"
- WHEN อ่านตาราง + ตรวจไดเรกทอรี `src/.claude/skills/`
- THEN มีแถว `openapi-spec-generation` ที่ชี้ที่มา `wshobson/agents` และไดเรกทอรี `src/.claude/skills/` ไม่มีโฟลเดอร์ `openapi-spec-generation`

## Requirement: tool-agnostic — ไม่ผูก model-tier ของ harness

`api-doc.md` ไม่ฝัง guidance ที่อ้างชื่อรุ่น/tier ของ AI model เจาะจง (header callout ที่ระบุชื่อ harness product ไม่นับ — เป็น convention เดียวกับทุก stage playbook)

### Scenario: ไม่มีชื่อ model-tier ฝังเป็น guidance
- GIVEN เนื้อหา `src/.warnyin/workflow/api-doc.md` ไม่รวมบรรทัด header callout "AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน ..."
- WHEN ค้นชื่อ model-tier/รุ่นที่ใช้เป็นคำสั่ง/guidance (เช่น Opus, Sonnet, GPT-4, Gemini-Pro)
- THEN ไม่พบ — guidance ใช้ vocab generic หรือมาตรฐาน domain (tooling เช่น Spectral/FastAPI/tsoa อนุญาต)

## Requirement: spec.md ของ API task ชี้ openapi.yaml ไม่เขียน schema ซ้ำ (unify-in-place)

`design.md` §6 ถูกขยายในที่เดิมให้ spec.md ของ API task ชี้มาที่ `openapi.yaml` เป็น single source ไม่สร้างกลไกขนาน

### Scenario: design.md §6 มีคำสั่ง single-source
- GIVEN section "spec.md — กำหนด spec ตามชนิดของ task" ใน `src/.warnyin/workflow/stages/design.md`
- WHEN อ่านข้อ "API task"
- THEN มีถ้อยคำสั่งให้ผลิต `openapi.yaml` และให้ `spec.md` "ชี้มาที่ openapi.yaml" โดยไม่เขียน schema ซ้ำ
