# Ship — <ชื่อ topic>

> Output ของ SHIP stage · playbook: `warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ — เขียนหลังย้าย topic เข้า `warnyin/stages/achieved/<YYYY-MM-DD>-<slug>/` แล้ว

## 1. สรุป topic
- ทำอะไร: <!-- หนึ่งย่อหน้า: topic นี้ทำอะไร ทำอย่างไร -->
- ประเภท: ☐ feature ใหม่ / ☐ ปรับปรุง feature เดิม → `docs/features/<feature-name>/`

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/<feature-name>/` | |
| `docs/techstack/<component>/rule.md` | |
| `docs/techstack/<component>/standard.md` | |
| `docs/techstack/<component>/structure.md` | |
| `docs/techstack/<component>/test.md` | |
| `docs/rule.md` | |
| `docs/troubleshooting.md` | |
| `docs/infra.md` / `docs/project.md` | <!-- ถ้าเกี่ยวข้อง --> |
| `docs/codemap/` | |

## 3. note "รอ SHIP" ที่ตัดทิ้ง (ไม่ promote)
| note | เหตุผลที่ตัด |
|---|---|
| | |

## 4. Archive
- ย้ายจาก `warnyin/stages/<slug>/` → `warnyin/stages/achieved/<YYYY-MM-DD>-<slug>/` เมื่อ <YYYY-MM-DD>
