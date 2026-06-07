# Spec — wire-playbooks

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — ผูก context เข้า playbook stage + workflow README

## 1. ชนิดของ task
`docs` / `integration` — แก้ `.md` playbook เดิม (เพิ่ม callout) ไม่มี runtime

## 2. สิ่งที่ต้องทำ
### 2.1 เพิ่ม callout ใน 5 stage playbook (`src/.warnyin/workflow/stages/*.md`)
แทรก callout ใต้ blockquote title ของแต่ละไฟล์ — pattern เดียวกัน (design.md §4):
```
> **Context profile:** สวมโหมด `<name>` (`.warnyin/workflow/contexts/<name>.md`) — session-level posture ของ stage นี้
```

| ไฟล์ | context | callout |
|---|---|---|
| `discovery.md` | `research` | สวมโหมด `research` |
| `design.md` | `research` + `build` | `research` ช่วงต้น (proposal/design) · `build` ช่วงแตก task |
| `build.md` | `build` | สวมโหมด `build` |
| `verify.md` | `review` | สวมโหมด `review` |
| `ship.md` | `review` | สวมโหมด `review` |

### 2.2 อัปเดต structure tree ใน `src/.warnyin/workflow/README.md`
- เพิ่มบรรทัด `contexts/` ข้างๆ `roles/` ใน tree (inner dir name locally correct)
- **ไม่แก้** outer-layout staleness (`warnyin/`/`bin/cli.mjs`) — out of scope (proposal §5)

## 3. Data-flow
ไม่มี runtime — doc reference graph: `stages/*.md` ─callout─▶ `contexts/*.md` (ไฟล์จาก author-contexts)

## 4. User-flow
เปิด playbook stage ไหน → เห็น callout → รู้ว่าต้องสวม session posture อะไร → ไปอ่าน context card

## 5. Persona
AI หลักที่เริ่มทำ stage นั้น — ได้ตัวชี้ posture ทันทีจากหัว playbook

## 6. Test-flow
- [ ] 5 playbook มี callout ครบ + ชี้ context ตรง mapping §2.1 (path ลิงก์ถูก = ไฟล์ที่ author-contexts สร้าง)
- [ ] `design.md` ชี้ทั้ง `research` และ `build`
- [ ] `workflow/README.md` tree มีบรรทัด `contexts/`
- [ ] `npm test` เขียว (18 เคส — ไม่มี assertion พังจากการแก้ playbook)
- [ ] ไม่มีลิงก์ตาย: ทุก `contexts/<name>.md` ที่ callout อ้าง มีอยู่จริง
