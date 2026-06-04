# Warnyin Standard Workflow

มาตรฐานกลางของ "วิธีทำงาน" (ways of work) สำหรับทุกโปรเจกต์ — สร้างทีม ผลิตผลงานคุณภาพ และเร็ว
โดยเดินผ่าน 5 stage:

```
Discovery (optional) ──▶ DESIGN ──▶ BUILD ──▶ VERIFY ──▶ SHIP
```

แต่ละ stage มี **playbook กลางหนึ่งชุด** เป็น single source of truth ที่ AI ทุกเจ้าอ่านเหมือนกัน

---

## หลักการออกแบบ: Tool-agnostic, single source of truth

แก่นของ workflow (กฎ / ขั้นตอน / เกณฑ์ผ่าน) เขียน **ครั้งเดียว** เป็น markdown ใน `warnyin/workflow/stages/`
ส่วน AI แต่ละเครื่องมีแค่ **adapter บางๆ** ที่ "ชี้กลับ" มาที่ playbook กลางชุดเดียวกัน

| AI tool | Adapter (จุดเชื่อม) | อ่าน playbook จาก |
|---|---|---|
| **Claude Code** | `.claude/commands/*.md` + `CLAUDE.md` | `warnyin/workflow/stages/*.md` |
| **Codex** | `AGENTS.md` | `warnyin/workflow/stages/*.md` |
| **Antigravity** | `AGENTS.md` | `warnyin/workflow/stages/*.md` |
| เครื่องอื่นๆ | ชี้มาที่ `warnyin/workflow/stages/` ได้ทันที | `warnyin/workflow/stages/*.md` |

> แก้กฎที่ `warnyin/workflow/stages/` ที่เดียว → ทุกเครื่องได้เหมือนกันทันที
> เพิ่ม AI เจ้าใหม่ = เพิ่ม adapter บางๆ อีกหนึ่งไฟล์ ไม่ต้องแตะ logic

---

## โครงสร้าง repo

```
bin/cli.mjs            # npx installer — ติดตั้ง workflow ลงโปรเจกต์อื่น

warnyin/               # ★ ทุกอย่างของ workflow รวมใต้โฟลเดอร์เดียว
  installer/templates/ #   template CLAUDE.md สำหรับโปรเจกต์ปลายทาง (installer ใช้เอง — ไม่ถูก copy ไป target)
  workflow/            # playbook กลาง — single source of truth
    README.md          #   ไฟล์นี้ — ภาพรวม + วิธีรองรับหลาย AI
    init.md            #   playbook: INIT — วิเคราะห์โปรเจกต์ + เติม docs/ ครั้งแรก
    roles/             #   role card กลาง: ba, po, sa, tech-lead, developer, qa, security, infra
    stages/            #   discovery ✅ · design ✅ · build ✅ · verify ✅ · ship ✅
    scripts/
      build-wave.mjs   #   Workflow script: fan-out sub-agent ต่อ task ใน wave (worktree)
  template/            # ★ template ทั้งหมดรวมที่เดียว
    stages/[topic]/    #   หนึ่งหน่วยงาน — copy เป็น warnyin/stages/<slug>
      discovery.md  research.md            # output ของ Discovery
      business.md  proposal.md  design.md  # output ของ DESIGN
      tasks/[task-name]/...  build.md      # output ของ DESIGN (tasks) + BUILD
      test.md  verify.md                   # output ของ VERIFY
      troubleshooting.md  ship.md          # KB ระหว่างงาน + สรุปส่งมอบของ SHIP
    docs/                                  #   โครง docs — installer seed เข้า docs/ ตอนติดตั้ง
      project.md  rule.md  infra.md  troubleshooting.md  codemap/index.md
      techstack/[component]/               #   copy เป็น docs/techstack/<component> (โดย /warnyin:init)
      features/[feature-name]/             #   copy เป็น docs/features/<feature-name> (โดย SHIP)
  stages/              # พื้นที่ทำงานจริง ตาม topic
    context.md
    achieved/          #   archive หลัง SHIP (<YYYY-MM-DD>-<slug>/)

docs/                  # ความรู้ถาวรระดับโปรเจกต์ — ของจริงล้วน (seed จาก warnyin/template/docs)
  project.md           # ★ จุดเริ่มของ Discovery — อ่านก่อนเสมอ
  rule.md  infra.md
  troubleshooting.md   # ★ KB ปัญหา-วิธีแก้ (อ่านก่อนเมื่อ build เจอ error; SHIP ป้อนเข้า)
  codemap/  features/  techstack/
```

---

## การติดตั้งไปโปรเจกต์อื่น

```bash
cd my-project
npx @warnyin/agents             # ติดตั้ง (ข้ามไฟล์ที่มีอยู่ ไม่เขียนทับ)
npx @warnyin/agents --update    # อัปเดต playbook กลางเป็นเวอร์ชันล่าสุด
npx @warnyin/agents --dry-run   # ดูก่อนว่าจะสร้าง/อัปเดตอะไร
# ทางสำรอง (ไม่ผ่าน npm): npx github:warnyin/warnyin-agents
```

- โปรเจกต์ที่มี `CLAUDE.md`/`AGENTS.md` อยู่แล้ว → installer ต่อท้ายเป็น section ไม่เขียนทับ
- `--update` เขียนทับเฉพาะ core (`warnyin/workflow/`, `.claude/commands/warnyin/`, template ใน `warnyin/template/`) — ไม่แตะ `docs/` และงานจริง
- หลังติดตั้ง → เปิด Claude Code แล้วรัน `/warnyin:init` ให้ agent วิเคราะห์โปรเจกต์ + เติม `docs/` (playbook: `warnyin/workflow/init.md`)

## วิธีใช้

1. เริ่มงานใหม่ → copy `warnyin/template/stages/[topic]/` เป็น `warnyin/stages/<ชื่อ-งาน-kebab-case>/`
2. รัน stage ตามลำดับ (Discovery ข้ามได้ถ้าเข้าใจ scope ชัดแล้ว)
   - Claude Code: `/warnyin:discovery <topic>`, `/warnyin:design <slug> <change>`
   - Codex / Antigravity: บอกให้ทำตาม `warnyin/workflow/stages/<stage>.md`
3. ผ่าน "gate" ของแต่ละ stage แล้วจึงไป stage ถัดไป
4. เมื่อ SHIP (`/warnyin:ship <slug>`) → promote ความรู้ของ topic ขึ้นเอกสารกลางใน `docs/`
   แล้วย้าย topic ไป `warnyin/stages/achieved/<YYYY-MM-DD>-<topic>/`
