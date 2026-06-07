# Spec — <ชื่อ task>

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`API` / `UX-UI` / `data` / `logic` / `infra` / ...

---

## 2. API SPEC (ถ้าเป็น API — ตามมาตรฐาน)
| | |
|---|---|
| Endpoint | `METHOD /path` |
| Auth | |
| Request | schema / body / params |
| Response | schema + ตัวอย่าง |
| Status / Error | 200 / 4xx / 5xx + error shape |

## 3. UX/UI SPEC (ถ้าเป็นงาน UI)
- Wireframe / Figma ref: `<ลิงก์ ถ้ามี>`
- States: default / loading / empty / error / success
- Responsive / accessibility:

## 4. Data-flow
> ข้อมูลไหลจากไหน → ผ่านอะไร → ไปไหน

## 5. User-flow
> ผู้ใช้เดินผ่านขั้นตอนไหนบ้าง

## 6. Persona
> task นี้ทำเพื่อใคร

## 7. Test-flow
> จะทดสอบ/ยืนยันความถูกต้องยังไง (เคสที่ต้องผ่าน, edge case)
- [ ]
