# Task — discovery-command-adapter

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `discovery-command-adapter` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (payload command + workflow README) |
| **Model tier** | `balanced` _(adapter บาง + keyword map + README pointer)_ |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
> ให้ `/warnyin:discovery` รับ/แนะนำ mode แล้วพา agent เข้า flow — command map keyword → mode (explicit) หรือ ชี้ playbook auto-suggest (ไม่ระบุ); + เพิ่ม mode ใน capability tree (`README.md`)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: _(ไม่มี)_ — พึ่ง **mode taxonomy contract `design.md §4`** (ชื่อ mode + keyword alias §4.1 + section anchor §4.2) ที่ fix แล้ว ไม่ใช่ runtime ของ Task A
- ปลดล็อกให้: VERIFY (เรียก command เลือก mode)
- รับ input: ชื่อ section anchor "Discovery modes (ความเข้มของ Discovery)" ที่ Task A สร้าง — **ชี้ด้วยชื่อ ไม่ inline behavior** (contract-first → ขนานกับ Task A ได้)

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
- [ ] 1. แก้ command `src/.claude/commands/warnyin/discovery.md` — เพิ่มขั้น "เลือก/แนะนำ mode": map keyword จาก `$ARGUMENTS` (§4.1) → mode; multi-match/ไม่ match → ชี้ playbook auto-suggest; **mention 4 mode + ชี้ section anchor playbook (ไม่ duplicate behavior/auto-suggest table)** — _ผลลัพธ์:_ entry mode
- [ ] 2. แก้ `src/.warnyin/workflow/README.md` — เพิ่ม mode ใน capability ของ discovery (capability tree) ชี้ playbook canonical — _ขึ้นกับ 1:_ สอดคล้องชื่อ

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **owns:** `src/.claude/commands/warnyin/discovery.md` + `src/.warnyin/workflow/README.md`
- **ห้ามแตะ:** playbook `discovery.md` (Task A owns), AGENTS.md (Codex อ่าน playbook ตรง), `cli.mjs`, `package.json`

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] command รับ keyword mode (ไทย/อังกฤษ §4.1) → เข้า mode ถูก; multi-match/ไม่ระบุ → auto-suggest
- [ ] command **ไม่ duplicate** behavior contract (§4.3) / auto-suggest signal (§4.4) — มีแค่ keyword-alias map + ชี้ section anchor §4.2 (no-duplicate test ผ่าน)
- [ ] README capability tree มี mode ของ discovery ชี้ playbook
- [ ] idempotent / additive — ผู้ใช้เดิมไม่ระบุ mode ยังเรียก command ได้ (backward-compat)
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
