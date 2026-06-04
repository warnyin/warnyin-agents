# warnyin-agents

[![npm](https://img.shields.io/npm/v/%40warnyin%2Fagents)](https://www.npmjs.com/package/@warnyin/agents)

**Warnyin Standard Workflow** — มาตรฐานกลางของ "วิธีทำงาน" (ways of work) สำหรับทุกโปรเจกต์
ให้ AI agent (Claude Code / Codex / Antigravity / อื่นๆ) เดินงานผ่าน 5 stage ด้วย playbook กลางชุดเดียวกัน:

```
Discovery (optional) ──▶ DESIGN ──▶ BUILD ──▶ VERIFY ──▶ SHIP
     ตี scope             ออกแบบ +     fan-out      เทสจริง       ส่งมอบ +
   จนเข้าใจตรงกัน          แตก task    sub-agent    แก้จนผ่าน    promote ความรู้
```

ทุก stage มี **Gate** — ผ่านเกณฑ์ครบจึงไปต่อได้ และความรู้ที่เกิดระหว่างงานจะถูก SHIP
กลั่นกลับเข้า `docs/` เสมอ → งานถัดไปเริ่มจากความรู้ล่าสุดทุกครั้ง

## ติดตั้ง

```bash
cd my-project
npx @warnyin/agents             # ติดตั้ง (ข้ามไฟล์ที่มีอยู่ ไม่เขียนทับ)
npx @warnyin/agents --dry-run   # ดูก่อนว่าจะสร้างอะไร
npx @warnyin/agents --update    # อัปเดต playbook กลางเป็นเวอร์ชันล่าสุด
# ทางสำรอง (ดึงตรงจาก main): npx github:warnyin/warnyin-agents
```

- โปรเจกต์ที่มี `CLAUDE.md` / `AGENTS.md` อยู่แล้ว → installer **ต่อท้ายเป็น section** ไม่เขียนทับ
- `--update` เขียนทับเฉพาะ core (`warnyin/workflow/`, `.claude/commands/warnyin/`, template ใน `warnyin/template/`) — ไม่แตะ `docs/` และงานจริง

## เริ่มใช้งาน

```bash
# 1. ติดตั้งแล้วเปิด Claude Code ในโปรเจกต์ → รัน
/warnyin:init                      # agent วิเคราะห์โปรเจกต์ + เติม docs/ ให้
/warnyin:install-skill             # (optional) ติดตั้ง skill เสริมประจำ role

# 2. เริ่มงานแรก
/warnyin:discovery <topic>         # โจทย์กว้าง/กำกวม → ตี scope ก่อน
/warnyin:design <slug> <change>    # scope ชัดแล้ว → ออกแบบ + แตก task เลย

# 3. ไล่ตาม stage จนจบ
/warnyin:build <slug>              # fan-out sub-agent implement ตาม dependency
/warnyin:verify <slug>             # strategy tester เทสจริงใน local env แก้จนผ่าน
/warnyin:ship <slug>               # promote ความรู้ขึ้น docs/ + archive topic
```

## แนวคิดหลัก: Tool-agnostic, single source of truth

แก่นของ workflow (กฎ / ขั้นตอน / เกณฑ์ผ่าน) เขียน**ครั้งเดียว**เป็น markdown ใน `warnyin/workflow/stages/`
AI แต่ละเครื่องมีแค่ adapter บางๆ ชี้กลับมาที่ playbook กลางชุดเดียวกัน

| AI tool | Adapter | อ่าน playbook จาก |
|---|---|---|
| **Claude Code** | `.claude/commands/warnyin/*` + `CLAUDE.md` | `warnyin/workflow/stages/*.md` |
| **Codex / Antigravity** | `AGENTS.md` | `warnyin/workflow/stages/*.md` |
| เครื่องอื่นๆ | ชี้มาที่ `warnyin/workflow/stages/` ได้ทันที | `warnyin/workflow/stages/*.md` |

> แก้กฎที่ `warnyin/workflow/stages/` ที่เดียว → ทุกเครื่องได้เหมือนกันทันที

## โครงสร้างที่ติดตั้งลงโปรเจกต์

```
warnyin/               # ★ ทุกอย่างของ workflow รวมใต้โฟลเดอร์เดียว
  workflow/            #   playbook กลาง — single source of truth
    init.md            #     INIT: วิเคราะห์โปรเจกต์ + เติม docs/ ครั้งแรก
    roles/             #     role card: BA · PO · SA · Tech Lead · Developer · QA · Security · Infra
    stages/            #     discovery / design / build / verify / ship
    scripts/           #     build-wave.mjs — fan-out sub-agent ต่อ wave (worktree isolation)
  template/            #   template ทั้งหมด: stages/[topic]/ · docs/ (project/rule/infra/troubleshooting/codemap
                       #   + techstack/[component]/ · features/[feature-name]/)
  stages/              #   พื้นที่ทำงานจริงราย topic (copy [topic] เป็น <slug>)
    achieved/          #     archive หลัง SHIP (<YYYY-MM-DD>-<slug>)

docs/                  # ความรู้ถาวรระดับโปรเจกต์ — ของจริงล้วน (seed จาก warnyin/template/docs ตอนติดตั้ง)
  project.md           #   ★ จุดเริ่มของ Discovery
  rule.md  infra.md  troubleshooting.md
  codemap/  features/  techstack/<component>/{about,rule,standard,structure,test}.md

.claude/commands/warnyin/   # adapter สำหรับ Claude Code (slash commands)
.claude/agents/             # reviewer subagent: warnyin-{sa,tech-lead,qa,security,infra}
AGENTS.md                   # adapter สำหรับ Codex / Antigravity
CLAUDE.md                   # adapter สำหรับ Claude Code
```

รายละเอียดเต็ม: [`warnyin/workflow/README.md`](warnyin/workflow/README.md)

## จุดเด่นของแต่ละ stage

- **Discovery** — สัมภาษณ์ทีละข้อ + เสนอคำตอบแนะนำทุกครั้ง; คำถามที่โค้ดตอบได้ → ไปอ่านโค้ดเอง
- **DESIGN** — vertical slice architecture, task self-contained พร้อมโยน sub-agent, มี **review panel** (optional — SA/Tech Lead/QA/Security/Infra รีวิวขนานก่อนแตก task) และ **dry-run** (optional) สแกนหา blocker/defer ก่อนเข้า BUILD
- **BUILD** — จัด task เป็น wave ตาม dependency (DAG), รัน parallel ใน git worktree แยกกัน, ปิดท้ายด้วย full build + full test gate แก้จนเขียวหมด
- **VERIFY** — เทสตาม "จุดประสงค์ของ topic" ในสภาพแวดล้อมจริง ไม่ใช่แค่ unit test เขียว; FE ตรวจ UX/UI ด้วย
- **SHIP** — จำแนก feature ใหม่/ปรับปรุง, promote rule/standard/test/troubleshooting ขึ้นไฟล์กลาง, อัปเดต code map, archive topic

## Role system

role card กลางที่ `warnyin/workflow/roles/` — แต่ละใบกำหนด Mission / Lens / Checklist / Output ของหนึ่งบทบาท

| Role | ใช้ใน | รูปแบบ |
|---|---|---|
| BA + PO | Discovery | lens ของ AI หลักตอนสัมภาษณ์/จัด priority |
| SA + Tech Lead | DESIGN | lens ตอนออกแบบ/แตก task + reviewer ใน panel |
| Developer | BUILD | system prompt ของ build agent ทุกตัว |
| QA | VERIFY + panel | lens ของ strategy tester |
| Security + Infra | DESIGN panel | reviewer (read-only) |

- Tech Lead/Security ผูกกับ built-in `/code-review` และ `/security-review` ของ Claude Code
- skill เสริมต่อ role ติดตั้งด้วย `/warnyin:install-skill` (รายการกลาง: `warnyin/workflow/roles/README.md`)

## Release เวอร์ชันใหม่ (สำหรับผู้ดูแล repo นี้)

```bash
npm version patch      # bump เวอร์ชัน + git tag
npm publish            # ขึ้น npm registry (มี OTP)
git push --follow-tags
```

## License

MIT
