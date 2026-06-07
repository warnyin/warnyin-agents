# Ship — cli-legacy-warning-fix (cli legacy warning ตรง Migration guide)

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`

## 1. สรุป topic
- **ทำอะไร:** แก้ legacy warning string ใน `src/bin/cli.mjs` 2 block (`legacyV2` ≤0.2.x, `legacyV5` 0.3–0.5.x) ให้คำสั่งตรง Migration guide robust ใน `CHANGELOG.md` (`mkdir -p docs/stages && git mv .../* docs/stages/` + `rm -rf` core เก่า) + อัปเดต test เคส 5/6 — ปิด **defer item P0 #3** ที่เปิดจาก VERIFY ของ topic `roadmap-sync-p0`
- **ประเภท:** ☑ bugfix (string fix — ไม่ใช่ feature ใหม่)

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/roadmap.md` P0 #3 | **ปิด defer item** → `[x]` (cli แก้ตรง guide + 3-way consistency + migration proof ผ่าน) |
| `docs/features/` | — (ไม่ใช่ feature) |
| `docs/techstack/installer/{rule,standard,test,structure}.md` | — (ไม่เปลี่ยน — cli 192 บรรทัดเท่าเดิม, flow คงเดิม; rule "executable-verified + เอกสาร↔cli sync" promote ไปแล้วใน topic ก่อน, task นี้แค่ทำ cli compliant) |
| `docs/troubleshooting.md` | — (ไม่มี finding ใหม่ — ต้นเรื่องอยู่ #10 จาก `roadmap-sync-p0`) |
| `docs/codemap/` | — (string warning ไม่กระทบ architecture/flow) |
| `docs/rule.md`, `docs/infra.md`, `docs/project.md` | — (ไม่กระทบ) |

## 3. note "รอ SHIP" ที่ตัดทิ้ง (ไม่ promote)
| note | เหตุผล |
|---|---|
| — | ไม่มี note ใหม่ — `tasks/fix-legacy-warning/rule.md` §2 ระบุชัดว่าไม่มี rule ใหม่ (task ปิด defer ที่ rule promote ไปแล้ว) |

## 4. Archive
- ย้ายจาก `docs/stages/cli-legacy-warning-fix/` → `docs/stages/achieved/2026-06-07-cli-legacy-warning-fix/` เมื่อ 2026-06-07 (`git mv`)

## 5. ผลรวม — คู่ topic ปิดวงจร
- `roadmap-sync-p0` (เอกสาร robust + เปิด defer) → `cli-legacy-warning-fix` (cli ตามให้ตรง + ปิด defer) — **เอกสาร ↔ cli ↔ test sync สมบูรณ์**; ไม่มี defer ค้างจากคู่นี้
