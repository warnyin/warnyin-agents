# Contexts — context profile กลางของ workflow

> **แก่นกลาง tool-agnostic** — context card แต่ละใบคือ "posture ของทั้ง session" ในโหมดหนึ่ง
> AI ทุกเจ้าใช้ไฟล์ชุดเดียวกัน: อ่านตอนเริ่ม stage เพื่อ set โหมดของ session แล้วทำงานตาม playbook เดิม

## หลักการ

- **context = session-level posture** — วิธีคิด/ท่าทีรวมของ "ทั้ง session": ตอนนี้กำลังสำรวจ, กำลังสร้าง, หรือกำลังตรวจ
- **role = task-level lens** ([`roles/`](../roles/README.md)) — มุมมอง/checklist ของ "หนึ่งบทบาทต่อหนึ่งงาน" (BA, Developer, QA, ...)
- คนละมิติ ใช้คู่กันได้: เช่น session อยู่โหมด `build` (posture) + sub-agent สวม role `Developer` (lens ของงานนั้น)
- context **ไม่ duplicate** checklist ของ stage playbook/role card — ชี้กลับ playbook เสมอ (single source of truth)

## ตาราง context ↔ stage

| Stage playbook | Context ที่เข้าคู่ | เหตุผล |
|---|---|---|
| [`discovery.md`](../stages/discovery.md) | `research` | สำรวจ/เข้าใจก่อนตัดสิน |
| [`design.md`](../stages/design.md) | `research` + `build` | ต้น = research (propose), ปลาย = build (แตก task) |
| [`build.md`](../stages/build.md) | `build` | ลงมือสร้าง vertical slice |
| [`verify.md`](../stages/verify.md) | `review` | ตรวจ/ยืนยันด้วยการรันจริง |
| [`ship.md`](../stages/ship.md) | `review` | ตรวจความครบก่อนส่งมอบ/promote |

## วิธี activate (manual)

- **AI หลัก:** ตอนเริ่ม stage → เปิด playbook stage นั้น เจอ callout "Context profile" ชี้มา → อ่าน context card → สวม posture แล้วทำงานตาม playbook
- **User สั่งตรง:** บอกโหมดได้ชัดๆ เช่น "อยู่โหมด research" / "สวม build context" → AI อ่าน card ที่ตรง
- playbook ทุก stage มี callout ชี้กลับมาที่ context ที่เข้าคู่ (reference graph วนกลับ ไม่ duplicate)

## โครงของ context card ทุกใบ

1. **Mindset** — วิธีคิดรวมของ session โหมดนี้ (2–4 บรรทัด)
2. **Do / Don't** — bullet สั้น 2 ฝั่ง: ทำ vs ห้าม
3. **Tool preference** — เครื่องมือที่ควรใช้ / เลี่ยง (read-only vs edit vs run)
4. **ใช้คู่ stage ไหน** — ชี้ playbook stage ที่เข้าคู่ (→ ลิงก์)

> เพิ่ม context ใหม่ = เพิ่มไฟล์ที่นี่ + ใส่ callout ใน playbook stage ที่เข้าคู่ + อัปเดตตารางด้านบน
> (เก็บให้บาง opinionated — 3 context พอ; อย่าให้ไหลเป็น catalog)
