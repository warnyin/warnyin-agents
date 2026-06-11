# Task — triage-playbook

> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ · ชี้ canonical `design.md` §3 (ไม่ลอก)

| | |
|---|---|
| **Task** | `triage-playbook` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (playbook กลาง) |
| **Model tier** | `deepest` (เขียน rubric judgment + hard-floor taxonomy + escalation = งานคิดหนัก กำหนด taxonomy ใหม่) |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
สร้าง **`src/.warnyin/workflow/triage.md`** — playbook canonical ของ `/warnyin:triage`: rubric ครบ (3-tier + signals + hard-floor + escalation + route + fast-track skip-list) แบบ read-only router (pattern เดียวกับ `next.md`) — เป็น single source of truth ที่ command/§7/verify/ship ชี้มา

## 2. Dependency
- **ต้องทำหลัง:** — (wave 1, ไม่มี dependency; อ่าน `design.md` §3A/§3B/§3C/§3D เป็น input)
- **ปลดล็อกให้:** T2 (command ชี้ path นี้) + T3 (§7/verify/ship ชี้ skip-list) — แต่ผ่าน **contract** (path + canonical) ที่ตกลงใน design §3 แล้ว → ขนานได้
- **ส่ง output:** ไฟล์ `triage.md` ที่ถือ canonical rubric

## 3. Sub-tasks
- [x] 1. โครงไฟล์ตาม pattern `next.md` (read-only utility: §1 คืออะไร/ใช้เมื่อไหร่, §2 วิธีประเมิน, §3 รูปแบบรายงาน, §4 หลักการ read-only)
- [x] 2. **§Tier taxonomy (3A)** — ตาราง fast/standard/large + route (copy คำต่อคำจาก design §3A)
- [x] 3. **§Signals + Hard-floor + tie-break + Escalation (3B)** — signals, tie-break ก้ำกึ่ง→standard, hard-floor 5 หมวด, escalation/downgrade 3 step (copy จาก design §3B)
- [x] 4. **§Fast-track skip-list (3C)** — ตารางต่อ stage (DESIGN/BUILD/VERIFY/SHIP: ทำอะไร + correctness floor); heading = `## Fast-track skip-list` (อังกฤษ เป๊ะ → slug `fast-track-skip-list`) ให้ T3 link `../triage.md#fast-track-skip-list` ตรง (copy จาก design §3C)
- [x] 5. **§Route behavior (3D)** — read-only: ประเมิน→รายงาน tier+เหตุผล+route+คำเตือน hard-floor→หยุด; ระบุ **ต่างจาก `next`** (request by size vs topic by stage) (copy จาก design §3D)

## 4. ขอบเขตไฟล์ที่จะแตะ (★ disjoint — ห้ามแตะนอกนี้)
- `src/.warnyin/workflow/triage.md` (ใหม่)
- ❌ **ห้ามแตะ** `command/`, `stages/`, `README.md`, `installer/templates/` (เจ้าของ task อื่น)

## 5. Acceptance criteria
- [x] `triage.md` มี rubric ครบ 3A/3B/3C/3D ตรง canonical §3 (canonical-copy คำต่อคำ)
- [x] hard-floor ครบ **5 หมวด** + tie-break + escalation 3 step
- [x] §Fast-track skip-list heading = `## Fast-track skip-list` (อังกฤษเป๊ะ ให้ T3 ลิงก์มาได้)
- [x] read-only เด็ดขาด (ระบุชัดเหมือน next §4) + ต่างจาก next ชัด
- [x] payload generic — ไม่มีชื่อรุ่น/tool ผูก harness (tool-agnostic)
- [x] `lint:md` own-file ผ่าน (ไม่มี error attribute ถึง triage.md) · ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิง
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical: `../../design.md` §3A/§3B/§3C/§3D, §10 (panel)
