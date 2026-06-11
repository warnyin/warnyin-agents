# Ship report — build-wave-export-fix (ship-lite)

> Output ของ SHIP stage · ส่งมอบ 2026-06-11 · fast tier · topic ปิดสมบูรณ์

## Topic นี้ทำอะไร
ลบ top-level `export function` ออกจาก `build-wave.mjs` (คง `export const meta`) → Workflow tool launch ได้ ไม่เจอ `SyntaxError` — ปิดบั๊กที่ documented ค้างไว้ + เจอซ้ำ 3 ครั้ง (fix ถาวรครั้งแรก)

## Feature
**build-orchestration** — bugfix คืนความสามารถ launch ของ build-wave (กลไก #3 model routing เดิม); ไม่เปลี่ยน behavior/spec → **ไม่อัปเดต feature.md** (ไม่มี delta)

## Learned-rules
| candidate | ผล |
|---|---|
| R (planned/emergent) — lint-gate ตรวจ `^export function` ใน workflow scripts | ⚠️ **ไม่ promote เป็น rule** (rule ห้าม export มีอยู่แล้ว `installer/rule.md:26`) → **note เป็น roadmap follow-up** (`roadmap.md` #12) ตามที่ user เลือก: manual rule เจอละเมิดซ้ำ 3× → mechanical gate เป็นทางแก้ root cause (bounded ทำเมื่อคุ้ม) |

## เอกสารกลางที่อัปเดต
| ไฟล์ | สาระ |
|---|---|
| `docs/troubleshooting.md` #20 | ✅ FIXED — fix ถาวร + executable proof (run `wf_4898135a-19c`) + ชี้ follow-up |
| `docs/troubleshooting.md` #16 | note: export ส่วนนี้ปิดแล้ว แต่ข้อจำกัด `node --check` ยังคงอยู่ (ใช้ runtime-proof ต่อ) |
| `docs/techstack/installer/rule.md` §build orchestration | เติม "✅ fix ถาวรแล้ว" + proof + follow-up ใน rule export เดิม (ไม่ duplicate) |
| `docs/roadmap.md` #12 | + follow-up: lint-gate workflow-script exports (เหตุผล: เจอละเมิดซ้ำ 3× ไม่มี gate) |
| `CHANGELOG.md` | `### Fixed` entry (ทำตอน BUILD) |

## ไม่แตะ (เหตุผล)
- **`build-wave.test.mjs`** — extraction-based อยู่แล้ว ไม่ต้องแก้
- **feature.md / spec.md** — ไม่มี behavior delta
- **codemap** — `build-wave.mjs` index entry โครงไม่เปลี่ยน (ยังอธิบาย normalizeTasks/buildOpts ถูก — แค่ไม่ export ภายใน)
- **structure.md** — ไม่เปลี่ยน

## ★ env note
root dogfood `build-wave.mjs` ถูก sync (cp src→root) ตอน VERIFY เพื่อ T3 — release sync src→root จะทำให้ถาวร

## สถานะ: ✅ topic ปิดสมบูรณ์
- archived → `docs/stages/achieved/2026-06-11-build-wave-export-fix/`
- บั๊ก export ปิดถาวร (Workflow launch ได้จริง) · KB/rule/roadmap สะท้อนการแก้
- code (branch `build/build-wave-export-fix`) → merge เข้า main นอก workflow
