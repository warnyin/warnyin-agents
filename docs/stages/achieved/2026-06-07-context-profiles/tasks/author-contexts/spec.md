# Spec — author-contexts

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — context vocabulary (3 card + README)

## 1. ชนิดของ task
`docs` / `content` — สร้าง `.md` แก่นกลาง workflow (ไม่มี runtime)

## 2. สิ่งที่ต้องสร้าง (4 ไฟล์ใน `src/.warnyin/workflow/contexts/`)
| ไฟล์ | เนื้อหา |
|---|---|
| `research.md` | context card โหมดสำรวจ/เข้าใจ |
| `build.md` | context card โหมดลงมือสร้าง |
| `review.md` | context card โหมดตรวจ/ยืนยัน |
| `README.md` | ภาพรวม context vs role + ตาราง context↔stage + วิธี activate |

## 3. โครง context card (ทุกใบเหมือนกัน — บางตาม D2; design.md §3)
```
# Context — <name> (<one-liner>)
> session-level posture · playbook: .warnyin/workflow/stages/*
## Mindset            (2–4 บรรทัด)
## Do / Don't         (bullet สั้น 2 ฝั่ง)
## Tool preference    (ควรใช้ / เลี่ยง)
## ใช้คู่ stage ไหน    (→ ลิงก์ playbook ที่เข้าคู่)
```

## 4. สาระแต่ละ card (ยึดตามนี้ — ไม่ duplicate checklist ของ stage playbook)
- **research** — mindset: เข้าใจก่อนตัดสิน, กว้างก่อนลึก, ตั้งคำถาม > สรุป. Do: อ่านโค้ด/เอกสารจริง, ถามทีละข้อ+เสนอคำตอบ, บันทึก evidence. Don't: เดา, แก้ไฟล์ production, รีบสรุป. Tool: read-only (Read/Grep/Glob/fast-context, `/warnyin:explore`) — เลี่ยง Edit/Write โค้ดจริง. Stage: Discovery, ต้น DESIGN, `/warnyin:next`
- **build** — mindset: ส่งมอบ vertical slice ทำงานจริง, ทำตาม spec/standard/rule, slice เล็กจบในตัว. Do: ทำตาม task spec, อ่าน `troubleshooting.md` ก่อนแก้ error, commit เล็ก. Don't: หลุด scope task, เดา spec (กลับไปอ่าน design/ถาม), แก้ rule กลาง (note รอ SHIP). Tool: Edit/Write/Bash, sub-agent fan-out, `build-wave`. Stage: ปลาย DESIGN (แตก task), BUILD
- **review** — mindset: หาจุดพลาดก่อนปล่อย, ยืนยันด้วยการรันจริง/หลักฐาน, skeptical. Do: รัน test/verify จริง, ไล่ acceptance, ตรวจ edge/security, เทียบ spec. Don't: เชื่อว่าผ่านโดยไม่รัน, ปล่อย CRITICAL/HIGH, แก้เยอะระหว่าง review (note ไว้). Tool: Read + Bash (รัน test), reviewer sub-agents, `/code-review` `/security-review`. Stage: VERIFY, SHIP, DESIGN review panel

## 5. Persona
AI หลัก (และ sub-agent) ที่เดิน workflow — อ่าน context เพื่อ set posture ของ session; user ที่อยากสั่งโหมดชัดๆ

## 6. Test-flow
- [ ] มีครบ 4 ไฟล์ใน `src/.warnyin/workflow/contexts/`
- [ ] ทุก card มีครบ 4 section ตามโครง §3 + บาง (ไม่ copy checklist ของ stage playbook)
- [ ] README มีตาราง context↔stage ตรง mapping (design.md §4) + อธิบาย context(session) vs role(task)
- [ ] `npm run verify:pack` เขียว → `contexts/*.md` ติด tarball (ship ได้ ไม่ต้องแตะ installer)
- [ ] `npm test` เขียว (ไม่กระทบ test เดิม)
