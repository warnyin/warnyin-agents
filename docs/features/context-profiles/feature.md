# Feature — Context profiles

> ความรู้ถาวรระดับ feature · promote จาก topic `context-profiles` (achieved 2026-06-07)

## คืออะไร
**context profile** = **session-level posture** (โหมดการทำงานของทั้ง session) เป็น `.md` บางใน `.warnyin/workflow/contexts/` ที่ AI อ่านเพื่อ set ท่าทีรวมของ session — คนละมิติกับ **role card** (`roles/` = task-level lens ต่อบทบาท)

มี 3 โหมด:
| Context | โหมด | สาระ |
|---|---|---|
| `research` | สำรวจ/เข้าใจก่อนตัดสิน | read-only, ถามทีละข้อ, เก็บ evidence, ไม่เดา/ไม่แก้ production |
| `build` | ลงมือสร้าง vertical slice | ทำตาม spec/standard/rule, เขียวต้องเขียวจริง, ไม่หลุด scope |
| `review` | ตรวจ/ยืนยันก่อนปล่อย | รัน test จริง, skeptical, ไม่ปล่อย CRITICAL/HIGH |

## ทำงานยังไง
- แต่ละ context card โครงบางคงที่ 4 section: **Mindset · Do/Don't · Tool preference · ใช้คู่ stage ไหน** (ชี้กลับ playbook)
- playbook ทุก stage มี **callout `Context profile`** ใต้ title ชี้ context ที่เข้าคู่ → reference graph วนกลับ (stage ↔ context) ไม่ duplicate logic
- **mapping (primary posture ต่อ stage):**
  Discovery→`research` · DESIGN→`research`+`build` · BUILD→`build` · VERIFY→`review` · SHIP→`review`
- **activate = manual:** AI เปิด stage เจอ callout → อ่าน context → สวม posture; หรือ user สั่งโหมดตรงๆ
- **model-tier guidance** (ใน "Tool preference" ของแต่ละ context) — แนะนำ model tier ตาม posture เพื่อคุม token/cost: `research`→`deepest reasoning` · `build`→`balanced` (fan-out worker เชิงกลไก→`cheap`) · `review`→`balanced+` (ไม่ลด); **generic vocab ไม่ผูกชื่อรุ่น** (harness map เอง — `docs/rule.md` §1 payload-guidance generic); legend ใน `contexts/README.md`
- `contexts/README.md` อธิบาย context-vs-role + ตาราง mapping + วิธี activate + โครง card + **ตาราง model-tier**

## ขอบเขต / ข้อจำกัด
- **manual activation** (ไม่ auto ตาม stage — เก็บเป็น future)
- **3 context พอ** (opinionated — ไม่ไหลเป็น catalog)
- **ไม่แตะ installer** — `contexts/` ใต้ `.warnyin/workflow/` ship อัตโนมัติผ่าน CORE copyTree + allowlist `src/.warnyin`
- context **ไม่ duplicate** checklist ของ stage/role — เป็น posture layer เหนือขึ้นมา

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/workflow/contexts/{research,build,review,README}.md`
- callout ใน `src/.warnyin/workflow/stages/{discovery,design,build,verify,ship}.md`
- เทียบมิติ: `src/.warnyin/workflow/roles/` (task-level lens)
