# Issue — add-utility-skills (จาก dry-run 2026-06-07)

> ผล dry-run (read-only) ก่อน BUILD · **ไม่มี hard blocker** — design §4 mapping ครอบครบ, pipeline สอดคล้อง
> พิสูจน์จริง: npm pack รวม `src/.claude/skills/*/SKILL.md` ได้เมื่อใส่ `files` (nested dotfolder); `src/.vscode/` เป็น leak นอก allowlist จริง; baseline 18 pass/0 fail

## Soft blocker (แก้ด้วย "ลำดับ atomic" ตอน BUILD — ไม่ใช่ design flaw)
| # | sev | ปัญหา | แก้ |
|---|---|---|---|
| B1 | HIGH | case 9 เดิม (verify-pack.test.mjs:70) assert `src/.claude/skills/x.md` = leak → พอเพิ่มใน ALLOWED_PREFIX จะ**แดงทันที** | เขียน case 9 ใหม่ leak=`src/.vscode/x.json` (ยืนยันนอก allowlist) — **ห้ามลบ assertion เฉยๆ** (config-protection) |
| B2 | HIGH | `hasSkills` assert ทำ GOOD baseline (ไม่มี skill) แดงที่เคส `deepEqual([])` (บรรทัด 22-24) | **ลำดับ atomic:** เพิ่ม skill ใน GOOD **ก่อน** เพิ่ม hasSkills |
| B3 | MED | `hasSkills` prefix ผิดได้ (เช่นผูก subdir `update-codemaps/`) → mismatch GOOD ที่ใช้ `explore/` | ใช้ prefix กว้าง `'src/.claude/skills/'` (ตรง pattern hasWarnyin) |

## Gap (เพิ่ม coverage)
| # | sev | จุด | action |
|---|---|---|---|
| G1 | MED | installer.test --update overwrite skills ไม่ได้ assert | assert skill ลงในเคส "ติดตั้งสด" พอ (CORE → --update overwrite อัตโนมัติ cli.mjs:177); optional assert เคส --update |
| G2 | LOW | test count: verify-pack 9→10 (เพิ่ม **เคส R1 ใหม่** ไม่ใช่ rename case 9), installer คง 9 → รวม 19 | BUILD ต้องเพิ่มเคส R1 ใหม่จริง (ไม่งั้น coverage R1 หาย) |

## Defer → VERIFY
- D1: skill body ไม่พึ่ง `$ARGUMENTS` — ยืนยัน behavioral (skill รับ context จาก conversation)
- D3: `allowed-tools` frontmatter syntax ถูก parse — ยืนยัน behavioral
- dead-link: skill body ชี้ playbook path จริง

## Defer → SHIP
- D2: global skill-adapter rule → `docs/rule.md` (BUILD แค่ note ใน task rule.md §2 — ถูกแล้ว)

## สถานะ
- [x] ปรับ task.md §3 ให้ลำดับ atomic (B1/B2/B3 + G2) — ปิด soft blocker
- ไม่มี blocker ค้าง → พร้อม BUILD
