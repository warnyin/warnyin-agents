# Warnyin Standard Workflow

มาตรฐานกลางของ "วิธีทำงาน" (ways of work) สำหรับทุกโปรเจกต์ — สร้างทีม ผลิตผลงานคุณภาพ และเร็ว
โดยเดินผ่าน 5 stage:

```
Discovery (optional) ──▶ DESIGN ──▶ BUILD ──▶ VERIFY ──▶ SHIP
```

แต่ละ stage มี **playbook กลางหนึ่งชุด** เป็น single source of truth ที่ AI ทุกเจ้าอ่านเหมือนกัน

---

## หลักการออกแบบ: Tool-agnostic, single source of truth

แก่นของ workflow (กฎ / ขั้นตอน / เกณฑ์ผ่าน) เขียน **ครั้งเดียว** เป็น markdown ใน `workflow/stages/`
ส่วน AI แต่ละเครื่องมีแค่ **adapter บางๆ** ที่ "ชี้กลับ" มาที่ playbook กลางชุดเดียวกัน

| AI tool | Adapter (จุดเชื่อม) | อ่าน playbook จาก |
|---|---|---|
| **Claude Code** | `.claude/commands/*.md` + `CLAUDE.md` | `workflow/stages/*.md` |
| **Codex** | `AGENTS.md` | `workflow/stages/*.md` |
| **Antigravity** | `AGENTS.md` | `workflow/stages/*.md` |
| เครื่องอื่นๆ | ชี้มาที่ `workflow/stages/` ได้ทันที | `workflow/stages/*.md` |

> แก้กฎที่ `workflow/stages/` ที่เดียว → ทุกเครื่องได้เหมือนกันทันที
> เพิ่ม AI เจ้าใหม่ = เพิ่ม adapter บางๆ อีกหนึ่งไฟล์ ไม่ต้องแตะ logic

---

## โครงสร้าง repo

```
bin/cli.mjs            # npx installer — ติดตั้ง workflow ลงโปรเจกต์อื่น
installer/templates/   # template CLAUDE.md สำหรับโปรเจกต์ปลายทาง

workflow/
  README.md            # ไฟล์นี้ — ภาพรวม + วิธีรองรับหลาย AI
  init.md              # playbook: INIT — วิเคราะห์โปรเจกต์ + เติม docs/ ครั้งแรก
  stages/
    discovery.md       # playbook: Discovery (optional)  ✅
    design.md          # playbook: DESIGN  ✅
    build.md           # playbook: BUILD  ✅
    verify.md          # playbook: VERIFY  ✅
    ship.md            # playbook: SHIP  ✅
  scripts/
    build-wave.mjs     # Workflow script: fan-out sub-agent ต่อ task ใน wave (worktree)

docs/                  # ความรู้ถาวรระดับโปรเจกต์ (อ้างอิงข้ามงาน)
  project.md           # ★ จุดเริ่มของ Discovery — อ่านก่อนเสมอ
  rule.md  infra.md
  troubleshooting.md   # ★ KB ปัญหา-วิธีแก้ (อ่านก่อนเมื่อ build เจอ error; SHIP ป้อนเข้า)
  codemap/  features/  techstack/

warnyin-stages/        # พื้นที่ทำงานจริง ตาม topic
  context.md
  [topic]/             # ★ template ของหนึ่งหน่วยงาน — copy ไปตั้งชื่อจริง
    discovery.md  research.md       # output ของ Discovery
    business.md  proposal.md  design.md   # output ของ DESIGN
    tasks/[task-name]/...  build.md        # output ของ DESIGN (tasks) + BUILD (build.md)
    test.md  verify.md                     # output ของ VERIFY
    troubleshooting.md  ship.md            # KB ระหว่างงาน + สรุปส่งมอบของ SHIP
  achieved/[YYYY-MM-DD-topic]/             # archive หลัง SHIP
```

---

## การติดตั้งไปโปรเจกต์อื่น

```bash
cd my-project
npx github:warnyin/warnyin-agents             # ติดตั้ง (ข้ามไฟล์ที่มีอยู่ ไม่เขียนทับ)
npx github:warnyin/warnyin-agents --update    # อัปเดต playbook กลางเป็นเวอร์ชันล่าสุด
npx github:warnyin/warnyin-agents --dry-run   # ดูก่อนว่าจะสร้าง/อัปเดตอะไร
```

- โปรเจกต์ที่มี `CLAUDE.md`/`AGENTS.md` อยู่แล้ว → installer ต่อท้ายเป็น section ไม่เขียนทับ
- `--update` เขียนทับเฉพาะ core (`workflow/`, `.claude/commands/warnyin/`, template `[topic]`) — ไม่แตะ `docs/` และงานจริง
- หลังติดตั้ง → เปิด Claude Code แล้วรัน `/warnyin:init` ให้ agent วิเคราะห์โปรเจกต์ + เติม `docs/` (playbook: `workflow/init.md`)

## วิธีใช้

1. เริ่มงานใหม่ → copy `warnyin-stages/[topic]/` เป็น `warnyin-stages/<ชื่อ-งาน-kebab-case>/`
2. รัน stage ตามลำดับ (Discovery ข้ามได้ถ้าเข้าใจ scope ชัดแล้ว)
   - Claude Code: `/warnyin:discovery <topic>`, `/warnyin:design <slug> <change>`
   - Codex / Antigravity: บอกให้ทำตาม `workflow/stages/<stage>.md`
3. ผ่าน "gate" ของแต่ละ stage แล้วจึงไป stage ถัดไป
4. เมื่อ SHIP (`/warnyin:ship <slug>`) → promote ความรู้ของ topic ขึ้นเอกสารกลางใน `docs/`
   แล้วย้าย topic ไป `warnyin-stages/achieved/<YYYY-MM-DD>-<topic>/`
