# Standard — fix-legacy-warning

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **อิงจาก** `docs/techstack/installer/standard.md` + `rule.md` + `test.md` (อัปเดตจาก topic ก่อน)

## 1. Standard กลางที่ยึด (จาก techstack)
- **zero-dependency / ESM** — `cli.mjs` ใช้ built-in เท่านั้น (ไม่กระทบ — แค่แก้ string)
- **ภาษาไทย** ในข้อความ warning ตามสไตล์เดิม
- **legacy string ใน test = copy codepoint ตรงจาก `cli.mjs`** (`docs/techstack/installer/standard.md` — en-dash U+2013, ≤ U+2264)
- **migration guide ต้อง executable-verified ไม่ mirror cli ดิบ** (`docs/techstack/installer/rule.md` §เอกสาร migration) — งานนี้กลับด้าน: ทำ **cli ให้ตรง guide ที่ robust แล้ว**

## 2. Pattern การเขียนโค้ดของ task นี้
- แก้เฉพาะ template literal ใน `console.warn(...)` ของ 2 block (`legacyV2`, `legacyV5`) — ไม่แตะ logic detection (`fs.existsSync` filter) / flow
- รักษารูปแบบเดิม: หัวข้อ `⚠ พบโครงเลย์เอาต์เก่า (...)` + บรรทัดเลข `1.`/`2.` + คอมเมนต์ `#` ท้ายคำสั่ง + `แล้วรันคำสั่งนี้อีกครั้ง`
- คอมเมนต์ท้ายคำสั่งอัปเดตให้ตรงพฤติกรรมใหม่ (เช่น `rm -rf warnyin` = "core เก่าทั้งหมด")

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- harness เทสกลาง `makeTempProject(t)` + `runCli(cwd,args)` ใน `installer.test.mjs` — ใช้ซ้ำ ไม่เขียนใหม่
- คำสั่ง migration = ชุดเดียวกับ `CHANGELOG.md` Migration guide (verify แล้ว) — copy ให้ตรง ไม่คิดใหม่

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- หลังแก้ → คำสั่งใน cli warning, `CHANGELOG.md` guide, และ test assertion **ต้องเป็นชุดเดียวกันทั้งสาม** (single source of truth ของคำสั่ง migration)
