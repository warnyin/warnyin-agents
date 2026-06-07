# Test Plan — <ชื่อ change>

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> แผน/วิธีเทสของ topic นี้ — ตอน **SHIP** จะ merge เข้า `docs/techstack/<component>/test.md`
> อิง guideline จาก `docs/techstack/<component>/test.md` (ถ้าไม่มี = เสนอวิธีใหม่ที่นี่)

| | |
|---|---|
| **Slug** | `<kebab-case>` |
| **Component** | `api-service` / `admin-console` |
| **จุดประสงค์ที่ต้อง verify** | (สรุปจาก spec/tasks) |

## 1. ขอบเขตการเทส (ตามจุดประสงค์ topic)
- สิ่งที่ต้องยืนยันว่าทำงานถูก:

## 2. ชนิดการเทส
- [ ] Functional (ตาม test-flow ใน `tasks/*/spec.md`)
- [ ] E2E smoke — เครื่องมือ: `playwright-cli` (ถ้าเป็น FE)
- [ ] Integration / API
- [ ] UX/UI verify (ถ้าเป็น FE)
- [ ] อื่นๆ:

## 3. Local env ที่ต้องรัน (จาก `docs/infra.md`)
| Service | คำสั่งรัน | port / หมายเหตุ |
|---|---|---|
| | | |

## 4. Test cases
| # | สถานการณ์ (อิงจุดประสงค์) | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|---|
| 1 | | | |

## 5. E2E smoke (FE)
- flow ที่ smoke:
- คำสั่ง playwright-cli:

## 6. UX/UI checklist (FE)
- [ ] layout ตรงตาม spec/wireframe
- [ ] states: loading / empty / error / success
- [ ] responsive
- [ ] interaction / user-flow ลื่นไหล

## 7. วิธีรันเทส (reproducible)
```
<คำสั่ง / ขั้นตอน>
```
