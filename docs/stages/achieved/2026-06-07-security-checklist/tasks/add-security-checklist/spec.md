# Spec — add-security-checklist

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`docs` / `content` — แก้ `.md` แก่นกลาง workflow (role card + playbook) + adapter command

## 2. Canonical wording (ใช้ตรงนี้ทุกจุด — design.md §2)
### A. Runtime / operational security (3 principle)
- **P1 secret isolation:** กัน agent อ่าน/เข้าถึง secret ที่ไม่เกี่ยวกับงาน — `.env`, `~/.ssh`, credential/token, keychain; ให้สิทธิ์อ่านเฉพาะ scope ของงาน (least-privilege ระดับ filesystem)
- **P2 no unnecessary egress:** payload/skill ที่ agent execute ต่อ ไม่ควรส่งข้อมูลออกได้อิสระ — รันใน sandbox/network ที่จำกัด egress เท่าที่งานต้องใช้
- **P3 identity separation:** แยก identity ของ session agent ออกจาก credential ส่วนตัว/prod — ไม่ใช้ token ส่วนตัว/สิทธิ์ prod ใน session ที่รัน automation/agent
- **Claude adapter note** (syntax เฉพาะ Claude, harness อื่นปรับเทียบ): `settings.json` → `permissions.deny`: `Read(**/.env*)`, `Read(~/.ssh/**)`; sandbox no-egress เมื่อไม่ต้องการเครือข่าย

### B. Supply-chain
- **S1 third-party = prompt-injection surface:** third-party skill/MCP/payload `.md` = โค้ด+instruction ที่ AI execute ต่อ → ตรวจเนื้อหาก่อนติดตั้ง (อ่าน source/skills.sh), ติด global ไม่ vendor เข้า repo, จำกัดสิทธิ์
- เวอร์ชันสั้น (install-skill warning): "third-party skill = instruction ที่ AI execute ต่อ (prompt-injection surface) — ตรวจเนื้อหาก่อนติดตั้ง"

## 3. จุดที่ต้องแก้ (design.md §4)
| ไฟล์ | ใส่อะไร |
|---|---|
| `src/.warnyin/workflow/roles/security.md` | +section "## Runtime / operational security" (P1+P2+P3 + Claude note) ต่อจาก Checklist ก่อน Output; +1 checklist item S1; เสริม Lens "supply chain" ให้ครอบ skill/MCP |
| `src/.warnyin/workflow/stages/verify.md` §2 | +reference สั้น: รันเทส local env ที่มี secret จริง → ทบทวน runtime security (`roles/security.md`) |
| `src/.claude/commands/warnyin/install-skill.md` step 4 | เสริม warning เดิมด้วย prompt-injection wording (S1 เวอร์ชันสั้น) |

## 4. Data-flow
ไม่มี runtime — security reviewer อ่าน `security.md` (app + runtime + supply-chain); VERIFY tester เห็น reference ตอนเตรียม env; ผู้ติดตั้ง skill เห็น warning prompt-injection

## 5. Persona
security reviewer (DESIGN panel) + strategy tester (VERIFY) + ผู้ติดตั้ง skill — ได้ guidance ครอบ agent-runtime + supply-chain ที่ app-security เดิมยังไม่มี

## 6. Test-flow
- [ ] section "Runtime / operational security" (P1+P2+P3 + Claude note) ปรากฏใน `security.md` (grep "runtime"/"egress"/"identity")
- [ ] checklist item S1 supply-chain/MCP ปรากฏใน `security.md` Checklist
- [ ] reference runtime security ปรากฏใน `verify.md` §2
- [ ] warning prompt-injection ปรากฏใน `install-skill.md` step 4 (grep "prompt-injection")
- [ ] wording ทุกจุดสอดคล้อง canonical §2 (3-way: security.md ↔ install-skill ↔ global note)
- [ ] global bullet "agent-runtime baseline" ถูก note ใน `rule.md` §2 (รอ SHIP)
- [ ] `npm test` 18/18 + `npm run verify:pack` เขียว (ไม่กระทบ test เดิม)
