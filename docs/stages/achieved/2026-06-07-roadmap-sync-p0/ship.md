# Ship — roadmap-sync-p0 (ปิด gap P0 เอกสาร + sync roadmap)

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ — เขียนหลังย้าย topic เข้า `docs/stages/achieved/2026-06-07-roadmap-sync-p0/` แล้ว

## 1. สรุป topic
- **ทำอะไร:** ปิด gap P0 ที่ค้างจริงหลัง ship 0.7.0 — เพิ่ม **Migration guide section** ใน `CHANGELOG.md` (ครอบ ≤0.2.x / 0.3–0.5.x + ระบุ 0.6.0→0.7.0 ไม่กระทบผู้ใช้ปลายทาง), เพิ่มลิงก์จาก `README.md` ชี้ไป, และ sync checkbox P0 #3/#4 ใน `docs/roadmap.md` ให้ตรงสถานะจริง · VERIFY ทำ **executable migration proof** จับ bug ที่คำสั่งเดิม `git mv warnyin/stages docs/stages` ทำงานจริงซ้อน `docs/stages/stages/` แล้วแก้เป็น robust (`git mv .../* docs/stages/` + `rm -rf` core เก่า) verify ผ่านทั้ง 2 ลำดับ × 2 รุ่น
- **ประเภท:** ☑ ไม่ใช่ feature ใหม่ — งานเอกสาร repo meta + แก้ correctness ของ migration guide (component `installer`)

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/` | — (ไม่ใช่ feature ใหม่ของ tool — งานเอกสาร) |
| `docs/techstack/installer/rule.md` | rule ใหม่ §"เอกสาร migration / CHANGELOG" — migration guide ต้อง **executable-verified ไม่ mirror cli ดิบ** (รุ่น/codepoint ตรง cli แต่คำสั่งทน edge `docs/stages/`); cli มี edge → เอกสารทำถูกก่อน + defer แก้ cli |
| `docs/techstack/installer/test.md` | pattern เทสใหม่ §"executable migration proof" — จำลอง legacy → รันคำสั่งในเอกสารจริง → assert; เทส 2 ลำดับ (migrate-ก่อน/หลัง-install) × ทุกรุ่น legacy |
| `docs/troubleshooting.md` | entry **#10** — migration command ซ้อน `docs/stages/stages/` (อาการ/root cause/วิธีแก้/ป้องกันซ้ำ) ภายใต้หัวข้อใหม่ "migration / upgrade" |
| `docs/rule.md` | — (rule ที่ promote ผูกกับ component installer → ลงที่ `techstack/installer/rule.md` ไม่ใช่ global) |
| `docs/infra.md` / `docs/project.md` | — (ไม่กระทบ env/scope) |
| `docs/codemap/` | — (ไม่แตะ `src/` — `git diff` ยืนยัน src touched: 0; codemap ยังตรงโค้ดจริง) |
| `docs/roadmap.md` | (อัปเดตแล้วใน BUILD/VERIFY — อยู่ `docs/` ถาวร) P0 #3/#4 ✅ + **defer item:** แก้ `cli.mjs` legacy warning ให้ตรง guide robust |

## 3. note "รอ SHIP" ที่ตัดทิ้ง (ไม่ promote)
| note | เหตุผล |
|---|---|
| rule เสนอเดิม: "เอกสาร migration ต้อง **mirror legacy warning ใน `cli.mjs` ตรง**" | **ไม่ promote ตามถ้อยคำเดิม** — VERIFY พิสูจน์ว่า mirror ดิบ = inherit bug (`git mv <dir> <dir>` ซ้อน) → promote เป็นเวอร์ชันที่ถูกต้องกว่า: "executable-verified ไม่ mirror ดิบ; cli มี edge → เอกสารทำถูกก่อน + defer แก้ cli" (`techstack/installer/rule.md`) |

## 4. Archive
- ย้ายจาก `docs/stages/roadmap-sync-p0/` → `docs/stages/achieved/2026-06-07-roadmap-sync-p0/` เมื่อ 2026-06-07 (`git mv`)

## 5. งานค้างต่อ (defer — ไม่ block topic นี้)
- **แก้ `src/bin/cli.mjs` legacy warning** ให้ตรง Migration guide ใหม่ (`git mv .../* docs/stages/` + `rm -rf` core เก่า) — track ใน `docs/roadmap.md` P0 #3; เป็นงาน DESIGN/BUILD รอบใหม่ (แตะ `src/`)
