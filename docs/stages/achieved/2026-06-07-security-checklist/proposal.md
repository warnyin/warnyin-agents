# Proposal — security-checklist (security รูปธรรม: agent-runtime + supply-chain)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Slug** | `security-checklist` |
| **ประเภท** | `docs` (`.md` ล้วน — แก่นกลาง workflow + adapter command) |
| **ขนาด** | `เล็ก` |
| **วันที่** | 2026-06-07 |
| **มาจาก Discovery?** | `./discovery.md` + `./research.md` |

## 1. สรุป change (what)
เสริม **security รูปธรรม 2 thrust** เป็น guidance `.md` tool-agnostic — **(A) agent-runtime security:** เพิ่ม section "Runtime / operational security" ใน `roles/security.md` (3 portable principle: secret isolation / no unnecessary egress / identity separation + Claude adapter note) + reference สั้นใน `verify.md` + note global bullet รอ SHIP เข้า `docs/rule.md` §3; **(B) supply-chain hardening:** เสริม warning step 4 ของ `install-skill.md` ให้ระบุ **prompt-injection risk** ของ third-party skill ชัด + เพิ่ม supply-chain/MCP item ใน security.md checklist

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** `roles/security.md` เป็น **DESIGN-panel reviewer** เน้น **app security** (input/authz/injection) แต่ไม่มี **agent-runtime security** — AI agent ทำงานในเครื่อง user เข้าถึง secret/.env/~/.ssh ได้, มี egress, อาจใช้ identity ร่วม → เสี่ยง; `install-skill` มี warning third-party แต่ยังไม่ระบุ **prompt-injection** ชัด (third-party skill = instruction ที่ AI execute ต่อ)
- **ผลถ้าไม่ทำ:** roadmap P1 #7 ค้าง; "การรัน agent" ไม่มี security baseline ทั้งที่ payload ถูก AI execute ต่อ (`setup-dogfood` comment เตือน "supply-chain surface")
- **ทำไมตอนนี้:** ต่อยอด #6 (playbook `.md` work, risk ต่ำ); `docs/rule.md` §3 มี CI security baseline แล้ว — #7 เติม **agent-runtime + supply-chain** ให้ครบมิติ คง tool-agnostic (principle + adapter note)

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. principle portable ใน security.md + verify ref + install-skill + global note (เบา) | tool-agnostic, ตรงปรัชญา, ไม่ duplicate app-security เดิม | พึ่ง AI/maintainer อ่าน (ไม่ auto-enforce) | ✅ (D1–D4) |
| B. Claude-specific config (settings deny) เป็น rule หลัก | actionable ทันที | ผูก Claude ขัด tool-agnostic | — (D3: เป็น adapter note เท่านั้น) |
| C. runtime hook/enforcement ตรวจ permission อัตโนมัติ | enforce แข็ง | เป็นโปรแกรม ไม่ใช่ guidance, runtime หนัก | — (out of scope) |

- **เหตุผลที่เลือก A:** ตรง D1 (ทั้ง A+B), D2 (security.md + VERIFY + global), D3 (portable + Claude note), D4 (install-skill warning + checklist item) — portable, เบา, ไม่ซ้ำ app-security เดิม (คนละมิติ)

## 4. Scope
**In scope**
- `src/.warnyin/workflow/roles/security.md` — +section "Runtime / operational security" (3 principle + Claude adapter note) + 1 checklist item supply-chain/MCP
- `src/.warnyin/workflow/stages/verify.md` — reference สั้นชี้ runtime security (ตอนรันเทส local env ที่มี secret จริง)
- `src/.claude/commands/warnyin/install-skill.md` — เสริม warning step 4 ระบุ prompt-injection risk ชัด
- note global bullet "agent-runtime security baseline" → `tasks/*/rule.md` §2 (รอ SHIP → `docs/rule.md` §3)

**Out of scope**
- runtime enforcement / hook ตรวจ permission อัตโนมัติ (เป็น guidance ไม่ใช่โปรแกรม)
- ผูก syntax เฉพาะ tool เป็น rule หลัก (Claude settings = adapter note เท่านั้น — D3)
- security ของ app ปลายทาง (มีใน security.md checklist เดิมแล้ว — ไม่ซ้ำ)
- แตะ `docs/rule.md` ตอน BUILD (central → รอ SHIP)

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบเดิมที่กระทบ:** ไม่มี runtime/installer; เพิ่ม section/บรรทัดใน 3 ไฟล์ payload — ไม่ลบ/แก้ logic เดิม; `install-skill.md` แก้ wording warning เดิม (ไม่เปลี่ยนพฤติกรรม command)
- **ความเสี่ยง + ลด:** (1) checklist ผูก tool เกินไป → *ลด:* เขียน principle portable, Claude = adapter note (D3); (2) ซ้ำ app-security เดิม → *ลด:* "runtime" คนละมิติชัดเจน (research RQ1) — section แยก; (3) wording กระจายไม่สม่ำเสมอ → *ลด:* canonical ใน design §2, 1 task เขียนทุกจุดรอบเดียว

## 6. ลิงก์
- Design (how): `./design.md` · Tasks: `./tasks/`
- Discovery: `./discovery.md` · Research: `./research.md`
