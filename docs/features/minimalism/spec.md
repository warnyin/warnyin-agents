# Spec — Minimalism principle

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior (ทำอะไร เห็นอะไร) — ไม่เก็บ implementation
> **descriptive ไม่ใช่ imperative** — บันทึก "ระบบมีอะไร/เป็นอย่างไร" เท่านั้น
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, ลิงก์ resolve)

## Requirement: มีไฟล์แกน minimalism เป็น single source

มีไฟล์ `minimalism.md` ใน workflow บรรจุ decision hierarchy + guardrail "lazy not negligent" เป็นแหล่งเดียว (full block ไม่ duplicate ที่อื่น)

### Scenario: ไฟล์แกนมีอยู่ + โครงครบ
- GIVEN ไดเรกทอรี `src/.warnyin/workflow/`
- WHEN ดูไฟล์ `minimalism.md`
- THEN ไฟล์มีอยู่ และมี: guardrail "lazy not negligent" วาง**ก่อน** decision hierarchy, decision hierarchy 6 ขั้น, ตัวอย่าง before/after ≥1, section ขอบเขตกัน over-cut

### Scenario: full hierarchy ปรากฏที่เดียว
- GIVEN ทุกไฟล์ `.md` ใต้ `src/.warnyin/workflow/`
- WHEN grep หา full decision-hierarchy block (6 ขั้นพร้อม decision logic เช่น "one-liner ได้?")
- THEN พบเฉพาะใน `minimalism.md` ไฟล์เดียว (surface อื่นเป็น pointer ไม่ใช่ full block)

## Requirement: surface ฝั่งผลิตชี้มาที่ minimalism

surface ที่ใช้ตอน generate โค้ด (BUILD) มี pointer ไปไฟล์แกน เพื่อให้ agent ใช้ decision hierarchy เป็น default

### Scenario: pointer ฝั่งผลิตครบ
- GIVEN ไฟล์ `roles/developer.md`, `contexts/build.md`, `stages/build.md`
- WHEN อ่านเนื้อหา
- THEN แต่ละไฟล์มี markdown-link ไป `../minimalism.md` พร้อม arrow-summary `YAGNI→stdlib→native→dep→one-liner→ขั้นต่ำ` (wording เดียวกันทุกไฟล์)

## Requirement: surface ฝั่งตรวจมี over-engineering lens

surface ที่ใช้ตอน review/verify มี lens จับ over-engineering ที่ชี้ไฟล์แกน (เป็น lens ไม่ใช่ hard gate)

### Scenario: lens ใน review context
- GIVEN ไฟล์ `contexts/review.md`
- WHEN อ่าน heading ระดับ `##`
- THEN พบ section `## Over-engineering lens` ที่มี markdown-link ไป `../minimalism.md`

### Scenario: pointer ใน verify stage — ไม่แตะ gate
- GIVEN ไฟล์ `stages/verify.md`
- WHEN อ่าน section operating principles (§3) และ section Gate (§6)
- THEN §3 มี pointer ไป `../minimalism.md`; §6 (Gate → เข้า SHIP) **ไม่มี** gate item เรื่อง minimalism เพิ่ม

## Requirement: guardrail กัน over-cut

ไฟล์แกนระบุชัดว่า minimalism ห้ามตัดอะไร เพื่อกันการตัดเกินจน negligent

### Scenario: รายการห้ามตัดครบ
- GIVEN ไฟล์ `minimalism.md`
- WHEN อ่าน guardrail/ขอบเขต
- THEN ระบุ "ห้ามตัด": validation ที่ trust-boundary, data-loss handling, security, accessibility, test, spec, acceptance

## Requirement: tool-agnostic

ไฟล์แกนใช้ vocab generic ไม่ผูกชื่อรุ่น/tool/ผลิตภัณฑ์

### Scenario: ไม่มีชื่อรุ่น/tool
- GIVEN ไฟล์ `minimalism.md`
- WHEN grep หาชื่อรุ่น/tool/ผลิตภัณฑ์ (เช่น ชื่อ LLM, ชื่อ IDE, ชื่อ plugin ต้นทาง)
- THEN ไม่พบ (เนื้อหาเป็น vocab generic ล้วน)

## Requirement: ship integrity + always-on

ไฟล์แกน ship ไป downstream ทุก install โดยไม่มี config/intensity knob

### Scenario: ติด package
- GIVEN `npm pack --dry-run`
- WHEN ดู file list ของ tarball
- THEN มี `src/.warnyin/workflow/minimalism.md`

### Scenario: install ลง target
- GIVEN รัน installer (`cli.mjs`) ลง target เปล่า
- WHEN ดู target
- THEN มี `.warnyin/workflow/minimalism.md` + pointer ใน surface (developer/review/README) wire ครบ

### Scenario: ไม่มี intensity knob
- GIVEN workflow payload
- WHEN หา command/state สลับระดับความเข้ม minimalism (lite/full/ultra/off)
- THEN ไม่พบ (always-on zero-config — ปรับความเข้มผ่าน triage tier เดิมถ้าจำเป็น)
