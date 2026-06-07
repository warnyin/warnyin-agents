# Task — add-security-checklist

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `add-security-checklist` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | workflow core (payload `.md`) + adapter command |
| **สถานะ** | `build เสร็จ (passed)` |

## 1. เป้าหมายของ task (vertical slice)
ทำให้ **agent-runtime + supply-chain security ปรากฏครบทุก enforce point** — runtime section (P1+P2+P3 + Claude note) + supply-chain item (S1) ใน `roles/security.md`, reference ใน `verify.md` §2, warning prompt-injection ใน `install-skill.md` step 4 ด้วย wording สม่ำเสมอ (canonical) + note global bullet "agent-runtime baseline" รอ SHIP

## 2. Dependency
- ต้องทำหลัง: — (task เดียว ไม่มี dependency)
- ปลดล็อกให้: —

## 3. Sub-tasks
- [x] 1. `roles/security.md` — เพิ่ม section "## Runtime / operational security" (P1+P2+P3 ฉบับเต็ม + Claude adapter note) ต่อจาก Checklist ก่อน Output
- [x] 2. `roles/security.md` — เพิ่ม checklist item S1 (supply-chain/MCP = prompt-injection) + เสริม Lens "supply chain" ให้ครอบ skill/MCP/payload
- [x] 3. `stages/verify.md` §2 — เพิ่ม reference สั้น ชี้ runtime security (`roles/security.md`) ตอนรันเทส local env ที่มี secret จริง
- [x] 4. `.claude/commands/warnyin/install-skill.md` step 4 — เสริม warning prompt-injection (S1 เวอร์ชันสั้น) ไม่ลบของเดิม
- [x] 5. ตรวจ wording ทุกจุดสอดคล้อง canonical §2 (3-way: security.md ↔ install-skill ↔ global note) — global bullet note ใน `rule.md` §2
- [x] 6. `npm test` + `npm run verify:pack`

## 4. ขอบเขตไฟล์ที่จะแตะ
- แก้: `src/.warnyin/workflow/roles/security.md` + `src/.warnyin/workflow/stages/verify.md` + `src/.claude/commands/warnyin/install-skill.md`
- **ห้ามแตะ:** `docs/rule.md` (central — รอ SHIP), `cli.mjs`/installer, root dogfood, app-security checklist เดิม (ไม่ทับ)

## 5. Acceptance criteria
- [x] section "Runtime / operational security" (P1+P2+P3 + Claude note) ปรากฏใน `security.md`
- [x] checklist item S1 supply-chain/MCP ปรากฏใน `security.md` Checklist
- [x] reference runtime security ปรากฏใน `verify.md` §2
- [x] warning prompt-injection ปรากฏใน `install-skill.md` step 4 (ของเดิมยังอยู่)
- [x] wording สอดคล้อง canonical design §2 ทุกจุด (portable + Claude note ระบุชัด)
- [x] global bullet "agent-runtime baseline" note ใน rule.md §2 (รอ SHIP)
- [x] `npm test` 18/18 + `verify:pack` เขียว
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
