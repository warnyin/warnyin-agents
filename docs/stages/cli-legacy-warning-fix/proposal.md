# Proposal — cli-legacy-warning-fix (cli legacy warning ตรง Migration guide)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Slug** | `cli-legacy-warning-fix` |
| **ประเภท** | `bugfix` |
| **ขนาด** | `เล็ก` |
| **วันที่** | 2026-06-07 |
| **มาจาก Discovery?** | ไม่มี (defer จาก VERIFY topic `roadmap-sync-p0` — scope ชัด) |

## 1. สรุป change (what)
> แก้ legacy warning string ใน `src/bin/cli.mjs` 2 จุด (`legacyV2` ≤0.2.x, `legacyV5` 0.3–0.5.x) ให้คำสั่งตรงกับ Migration guide robust ใน `CHANGELOG.md` (`git mv .../* docs/stages/` + `rm -rf` core เก่า) + อัปเดต test เคส 5/6 ที่ assert string เดิม

## 2. ทำไม (why)
- **ปัญหา:** VERIFY topic `roadmap-sync-p0` พิสูจน์ว่าคำสั่งใน warning (`git mv warnyin/stages docs/stages`) ทำงานจริง**ซ้อน** `docs/stages/stages/` เมื่อ `docs/stages/` ถูกสร้างไปแล้ว + ไม่ลบ `warnyin/installer` → warn ซ้ำ; ตอนนี้เอกสาร robust แล้วแต่ **cli ยังบอกคำสั่งเก่าที่พัง**
- **ผลถ้าไม่ทำ:** ผู้ใช้ที่อ่าน warning จาก installer (ไม่เปิด CHANGELOG) ยังทำตามคำสั่งที่ทำให้งานจริงซ้อน — เอกสารกับ cli ขัดกัน

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A (แนะนำ) แก้ warning string ให้ตรง guide | low-risk, เอกสาร+cli sync, ตรง defer | ไม่แก้ root (warn-but-not-block) — แต่ guide robust ครอบแล้ว | ✅ |
| B แก้ behavior (skip ensureScaffold เมื่อ legacy) | แก้ root | แตะ behavior installer, เสี่ยง regress, UX เปลี่ยน | (user ปัด) |

- **เหตุผล:** A — guide robust แก้ปัญหาแล้วโดยไม่ต้องเปลี่ยน behavior; แค่ทำ cli ให้ sync เอกสาร (decision user)

## 4. Scope
**In scope**
- `src/bin/cli.mjs` — แก้ string ใน `legacyV2` block (≤0.2.x) + `legacyV5` block (0.3–0.5.x): คำสั่งเป็น `mkdir -p docs/stages && git mv .../* docs/stages/` + `rm -rf` core เก่า
- `src/tests/installer.test.mjs` — เคส 5/6 อัปเดต assert ให้ตรง string ใหม่

**Out of scope**
- behavior `ensureScaffold` / block install เมื่อ legacy (option B)
- payload, packaging, อื่นๆ ใน cli

## 5. ผลกระทบ & ความเสี่ยง
- **กระทบ:** `cli.mjs` legacy warning (เฉพาะ stderr message — ไม่กระทบ install behavior), test เคส 5/6
- **ความเสี่ยง:** ต่ำ; mitigate — รัน `npm test` เขียว + re-run executable migration proof กับ cli ที่แก้ (คำสั่งใน warning = คำสั่งที่ verify ผ่านแล้วใน topic ก่อน) + zero-dep คงเดิม

## 6. ลิงก์
- Design: `./design.md` · Tasks: `./tasks/`
- อ้างอิง: `docs/stages/achieved/2026-06-07-roadmap-sync-p0/verify.md` (TS-1), `docs/troubleshooting.md` #10, `docs/techstack/installer/{rule,test}.md`
