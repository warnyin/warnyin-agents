# Discovery — security-checklist (security รูปธรรม: runtime + supply-chain)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `security-checklist` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-07 |
| **ผู้ร่วมตัดสินใจ** | user (smf.claude) + AI |
| **เริ่มจาก** | `docs/roadmap.md` P1 #7 · `roles/security.md` · `docs/rule.md` §3 |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> เสริม **security รูปธรรม 2 thrust** เป็น guidance `.md` (tool-agnostic): **(A) agent-runtime security** — permission deny อ่าน secret/.env/~/.ssh, sandbox no-egress, แยก identity → เขียนเป็น **principle portable + Claude example เป็น adapter note** ใน `roles/security.md` (section runtime ใหม่) + reference ใน `verify.md` + note global `docs/rule.md`; **(B) supply-chain hardening** — เสริม warning prompt-injection ใน `install-skill.md` + เพิ่ม item supply-chain/MCP-skill ใน security.md checklist

## 2. Problem & Why now
- **ปัญหา/โอกาส:** `roles/security.md` เป็น **DESIGN-panel reviewer เท่านั้น** — checklist เน้น app security (input/authz/injection) แต่ไม่มี **agent-runtime security** (AI agent ทำงานในเครื่อง user → ถ้าไม่กัน อ่าน secret/มี egress/ใช้ identity ร่วม = เสี่ยง); `install-skill` มี warning third-party แต่ยังไม่ระบุ **prompt-injection** ชัด
- **ทำไมตอนนี้:** roadmap P1 #7; payload ของ workflow ถูก AI execute ต่อ (ดู `setup-dogfood` comment "supply-chain surface") — security baseline ของ "การรัน agent" ควรเป็นแก่น
- **ผูกเป้าหมายโปรเจกต์:** `docs/rule.md` §3 มี CI security baseline แล้ว — #7 เติม **agent-runtime + supply-chain** ให้ครบมิติ; คง tool-agnostic (principle + adapter note)

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- **A:** `roles/security.md` — เพิ่ม section **"Runtime / operational security"** (principle: กัน agent อ่าน secret/.env/~/.ssh, รัน sandbox no-egress, แยก identity) + Claude adapter note (เช่น settings deny `Read(**/.env*)`, `~/.ssh`)
- **A:** `stages/verify.md` — reference สั้นๆ ชี้ runtime security checklist (ตอนรันเทส local env)
- **A:** note global bullet ใน `docs/rule.md` §3 (agent-runtime security baseline) — รอ SHIP
- **B:** `.claude/commands/warnyin/install-skill.md` — เสริม warning step 4 ระบุ **prompt-injection risk** ของ third-party skill ชัด
- **B:** `roles/security.md` checklist — เพิ่ม item supply-chain/MCP-skill (third-party = prompt-injection surface)

**Out of scope (จะไม่ทำ)**
- runtime enforcement / hook ตรวจ permission อัตโนมัติ (เป็น guidance ไม่ใช่โปรแกรม)
- ผูก syntax เฉพาะ tool เป็น rule หลัก (Claude settings เป็น *example/adapter note* เท่านั้น — D3)
- security ของ app ปลายทาง (มีใน security.md checklist เดิมแล้ว — ไม่ซ้ำ)
- แตะ `docs/rule.md` ตอน BUILD (central — รอ SHIP)

## 4. Decision Log
| # | ประเด็น | ทางเลือก | เลือกจริง | เหตุผล |
|---|---|---|---|---|
| 1 | thrust | A+B / A / B | **ทั้ง A + B** | ตรง 2 bullet roadmap #7 |
| 2 | placement A | security.md+VERIFY+global / security.md only / security.md+infra | **security.md (section runtime) + verify.md reference + global rule (รอ SHIP)** | ครอบ design-time (reviewer) + verify-time + ปรัชญากลาง |
| 3 | tool-agnostic | principle+Claude note / principle only | **principle portable + Claude example เป็น adapter note** | คง tool-agnostic แต่ actionable (permission-deny syntax = Claude เฉพาะ) |
| 4 | supply-chain B | เสริม warning + security.md item / warning only | **เสริม install-skill warning (prompt-injection) + security.md checklist item** | reviewer ไล่เช็คได้ + จุดติดตั้งเตือนชัด |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** security.md ขยายบทบาทเป็น reviewer (DESIGN panel) **+ runtime guidance**; AI/maintainer อ่าน runtime checklist ตอน setup/verify
- **ข้อจำกัด:** 2-layer — แก้ `src/.warnyin/workflow/` + `src/.claude/commands/warnyin/install-skill.md` (publish) เท่านั้น; docs/rule.md central → รอ SHIP; tool-agnostic (Claude = adapter note)
- ต้องกระทัดรัด — เพิ่ม section/บรรทัด ไม่บวม

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- `roles/security.md` มี section "Runtime / operational security" (3 principle + Claude note) + checklist item supply-chain/MCP
- `stages/verify.md` มี reference ชี้ runtime security
- `install-skill.md` warning ระบุ prompt-injection ชัด
- global rule bullet note ใน `tasks/*/rule.md` §2 (รอ SHIP → `docs/rule.md` §3)
- `npm test` 18/18 + `verify:pack` เขียว

## 7. Feature ideas / ทางเลือกของวิธีแก้
- runtime principle (portable): "กัน agent อ่าน secret (`.env`, `~/.ssh`, credential) / รันใน sandbox ไม่มี egress โดยไม่จำเป็น / แยก identity (ไม่ใช้ credential ส่วนตัว/prod ใน session agent)"
- Claude adapter note: settings `permissions.deny`: `Read(**/.env*)`, `Read(~/.ssh/**)`; sandbox no-egress
- supply-chain item: "third-party skill/MCP = prompt-injection surface — ตรวจเนื้อหา (skills.sh) ก่อนติดตั้ง, ติด global ไม่ vendor เข้า repo, จำกัดสิทธิ์"
- slice (design detail): A (security.md runtime + verify + rule) / B (install-skill + security.md item) — อาจ 1-2 task

## 8. Open questions
- ไม่มี open question ที่ block — scope/placement/expression ปิดครบ (slice เป็น design detail)

## 9. ความเสี่ยงหลัก
- **ต่ำ** — `.md` ล้วน ไม่แตะ runtime/installer; ความเสี่ยง = checklist ผูก tool เกินไป (เลี่ยงด้วย D3 principle+note) หรือซ้ำ security.md เดิม (เลี่ยง: เพิ่ม "runtime" คนละมิติกับ "app security" เดิม)

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- `docs/roadmap.md` P1 #7 · `roles/security.md` · `docs/rule.md` §3 · `.claude/commands/warnyin/install-skill.md` · `setup-dogfood.mjs` (supply-chain comment)

---

## ✅ Gate → DESIGN
- [x] Problem / why-now ชัด ผูกกับ project.md/rule.md
- [x] Scope in/out ชัด
- [x] Decision log ปิดครบ 4 ประเด็น ไม่มี open question block
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (2026-06-07)
