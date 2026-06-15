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
| UX/UI Designer | `ux.md` | DESIGN (step 4.5 — เฉพาะ change มี UI surface) | generator |
| Developer | `developer.md` | BUILD | system prompt ของ build agent ทุกตัว |
| QA | `qa.md` | VERIFY + DESIGN panel | lens ของ strategy tester + reviewer |
| Security (DevSecOps) | `security.md` | DESIGN panel | reviewer |
| Infra | `infra.md` | DESIGN panel | reviewer |

> **generator vs reviewer:** `generator` = ผลิต artifact (เช่น ASCII wireframe + user flow + screen states) และคืนเป็น text ให้ main loop persist — ต่างจาก `reviewer` ที่อ่าน artifact แล้วให้ความเห็น blocker/suggestion. UX/UI Designer (`warnyin-ux`) เป็น generator ไม่ใช่ reviewer ของ panel — อย่า fan-out เป็น reviewer ตัวที่ 6

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
| QA | `browser-test` | `npx skills add ruvnet/ruflo@browser-test` · ⚠ **PromptScript — global `-g` ไม่รองรับ** (`-g` จะ fail "does not support global skill installation"); ติด **local ต่อ project เท่านั้น** → vendor เข้า project `.claude/skills/` (ยอมรับ หรือใช้ `@playwright/cli` แทนสำหรับ e2e) |
| QA | `@playwright/cli` | Microsoft official (e2e web test — record/codegen/inspect selector/screenshot; ใช้คู่ FE e2e smoke ใน `verify.md`): `npm i -g @playwright/cli@latest` → `playwright-cli install --skills` (★ **workspace-local** — เขียน `.claude/skills/playwright-cli` ลง **project cwd** ไม่ใช่ global `~/.claude`; โปรเจกต์ปลายทางควร **gitignore `.claude/skills/playwright-cli`** กัน vendor เข้า repo) · `npx playwright-cli` ถ้าไม่ติด global |
| Tech Lead | `/code-review` | Claude Code built-in |
| Security | `/security-review` | Claude Code built-in |
| UX | `ui-ux-pro-max` | Claude plugin (MIT, hi-fi design intelligence — styles/palettes/stacks; ต่อยอด hi-fi จาก low-fi wireframe): `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` → `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` (หรือ `uipro-cli`) · ⚠ third-party: ตรวจ `SKILL.md`/`scripts/*.cjs` ก่อนติดตั้ง + pin version/commit (prompt-injection surface — `docs/rule.md` §3.2) |
| SA, Developer | `openapi-spec-generation` | `wshobson/agents` → `plugins/documentation-generation/skills/openapi-spec-generation/` (template library — ใช้คู่ capability `.warnyin/workflow/api-doc.md`) · ⚠ third-party: ตรวจ `SKILL.md`/`references` ก่อนติดตั้ง + pin ที่ commit/tag (prompt-injection surface — `docs/rule.md` §3.2) |
| BA, Infra | — | ยังไม่มี skill ภายนอกที่ผ่านเกณฑ์คุณภาพ (ใช้ role card พอ) |

> **cross-cutting comprehension tool:** ถ้าโปรเจกต์มี `.understand-anything/knowledge-graph.json` → ทุก role ใช้ graph เป็นเบาะแสเสริม (ไม่ผูกกับ role ใดโดยเฉพาะ) — ดู [`../interop`](../interop.md) สำหรับ convention การ consult + trust-boundary guard
