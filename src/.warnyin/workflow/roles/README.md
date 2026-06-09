# Roles — role card กลางของ workflow

> **แก่นกลาง tool-agnostic** — role card แต่ละใบคือ "วิธีคิด + checklist" ของหนึ่งบทบาท
> AI ทุกเจ้าใช้ไฟล์ชุดเดียวกัน: เป็น **lens** ของ AI หลัก หรือเป็น **system prompt** ของ sub-agent

## หลักการ

- **lens** = AI หลักอ่าน role card แล้วใช้มุมมอง/checklist นั้นทำงานเอง (role ที่ต้องคุยกับ user เป็น lens เสมอ — sub-agent คุยกับ user ไม่ได้)
- **sub-agent (reviewer)** = fan-out ตัวแทน role ไปวิเคราะห์/รีวิวแบบอิสระขนานกัน (read-only) — ได้หลายมุมพร้อมกันโดยไม่ bias
- Claude Code มี adapter ที่ `.claude/agents/warnyin-<role>.md`; เครื่องอื่นใช้ role card เป็น prompt ตรงๆ ได้

## ตาราง role ↔ stage

| Role | ไฟล์ | ใช้ใน stage | รูปแบบ |
|---|---|---|---|
| BA (Business Analyst) | `ba.md` | Discovery | lens ตอนสัมภาษณ์/ตี scope |
| PO (Product Owner) | `po.md` | Discovery | lens ตอนจัด priority/ตัด scope |
| SA (Solution Architect) | `sa.md` | DESIGN | lens ตอนออกแบบ + reviewer ใน panel |
| Tech Lead | `tech-lead.md` | DESIGN | lens ตอนแตก task + reviewer ใน panel |
| Developer | `developer.md` | BUILD | system prompt ของ build agent ทุกตัว |
| QA | `qa.md` | VERIFY + DESIGN panel | lens ของ strategy tester + reviewer |
| Security (DevSecOps) | `security.md` | DESIGN panel | reviewer |
| Infra | `infra.md` | DESIGN panel | reviewer |

## โครงของ role card ทุกใบ

1. **Mission** — บทบาทนี้มีไว้ทำอะไร
2. **Lens** — มองงานผ่านมุมไหน
3. **Checklist** — สิ่งที่ต้องไล่เช็คทุกครั้ง
4. **Output** — ต้องส่งมอบอะไร รูปแบบไหน

> เพิ่ม role ใหม่ = เพิ่มไฟล์ที่นี่ + adapter `.claude/agents/warnyin-<role>.md` (ถ้าใช้เป็น sub-agent) + ระบุจุดใช้ใน playbook

## Skill เสริมต่อ role (optional)

แต่ละ role card มี section "Skill เสริม" — แนวทางคือ **reference ไม่ vendor**: โปรเจกต์ไหนอยากใช้ค่อยติดตั้งเอง

| Role | Skill | ที่มา |
|---|---|---|
| SA | `architect-review` | `npx skills add sickn33/antigravity-awesome-skills@architect-review -g` |
| PO | `product-management` | `npx skills add vasilyu1983/ai-agents-public@product-management -g` |
| Developer | `tdd-orchestrator` | `npx skills add sickn33/antigravity-awesome-skills@tdd-orchestrator -g` |
| QA | `browser-test` | `npx skills add ruvnet/ruflo@browser-test -g` |
| Tech Lead | `/code-review` | Claude Code built-in |
| Security | `/security-review` | Claude Code built-in |
| SA, Developer | `openapi-spec-generation` | `wshobson/agents` → `plugins/documentation-generation/skills/openapi-spec-generation/` (template library — ใช้คู่ capability `.warnyin/workflow/api-doc.md`) · ⚠ third-party: ตรวจ `SKILL.md`/`references` ก่อนติดตั้ง + pin ที่ commit/tag (prompt-injection surface — `docs/rule.md` §3.2) |
| BA, Infra | — | ยังไม่มี skill ภายนอกที่ผ่านเกณฑ์คุณภาพ (ใช้ role card พอ) |
