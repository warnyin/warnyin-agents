# Rule — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)
> ดึงจาก `docs/techstack/installer/rule.md` และ `docs/rule.md` — เฉพาะข้อที่เกี่ยวกับ task นี้
- [x] **★ config-protection** (`rule.md §1`) — ห้ามแก้ config (linter/formatter/test threshold) "เพื่อให้ build/test ผ่าน" แทนการแก้โค้ดจริง; config ผิดจริงแก้ได้แต่ต้องมีเหตุผลชัด + note; **MIN_PASS bump ต้อง evidence-based** (อ่าน pass count จริงจาก test output)
- [x] **★ `MIN_PASS` bump ต้อง bump พร้อม topic ที่เพิ่มเคส + คอมเมนต์ระบุที่มา** (`docs/techstack/installer/rule.md`) — bump ใกล้ยอดจริง (เว้น headroom) + comment ที่มา
- [x] **★ release-hygiene task เป็น wave สุดท้ายเสมอของ topic multi-slice** (`rule.md §1`) — gate ที่ต้องเห็นไฟล์/pointer ครบข้าม slice ต้องรันหลัง integrate ครบ (กัน false-negative จาก pointer ข้าม slice + กัน CHANGELOG เขียนก่อนรู้ผลจริง)
- [x] **CHANGELOG ทุก user-facing change** (`rule.md §2`) — bump `engines`, breaking, เปลี่ยนพฤติกรรม installer → ต้องมี entry ใน `CHANGELOG.md` (Keep a Changelog)
- [x] **Keep a Changelog format** (`docs/techstack/installer/standard.md`)
- [x] **SemVer**: 0.29.1 = patch (fix/improvement)
- [x] **★ verify เอกสาร narrative = accuracy เทียบ source** (`rule.md §5`) — CHANGELOG Migration section ต้อง executable-verified ใน sandbox (คำสั่งทำงานจริง) ไม่ใช่เขียนตามจำ
- [x] **migration guide ต้อง executable-verified — ไม่ mirror legacy warning ของ `cli.mjs` แบบดิบ** (`docs/techstack/installer/rule.md` §migration)
- [x] **★ ถ้า `cli.mjs` legacy warning มี edge → เอกสารทำให้ถูกก่อน แล้ว defer แก้ cli ให้ตรง** (`docs/techstack/installer/rule.md`) — task นี้ทำ wording fix ของ cli.mjs ให้ตรง (Slice B) + docs ให้ตรง (Slice C)
- [x] **★ structural validator ✖ ไม่พึ่ง filled-detection** (`rule.md §1`) — `check-test-count.mjs` MIN_PASS check = structural (count-based) ไม่พึ่ง filled
- [x] **lint:md dead-link gate** (`docs/rule.md §4`) — link ทุก link resolve ไม่ dead; backtick inline-code ปลอดภัย (rule §4)
- [x] **agent เขียน path เป็น inline-code** (`rule.md §4`) — CHANGELOG Migration section ใช้ backtick กับ path (`git rm --cached -r .`)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/techstack/.../rule.md` ตอนนี้ — แค่ note ไว้ก่อน ถึง SHIP ค่อยพิจารณาย้ายขึ้นไป
- [ ] **CHANGELOG header ownership ระหว่าง multi-slice** — slice แรก (หลาย slice) สร้าง `## [version]` header (ว่างไม่มีวันที่) + entries ตัวเอง; slice สุดท้าย (release-hygiene) เติมวันที่ + Migration — ลด risk "header ไม่มีใคร create" หรือ "B รอ C สร้าง header" (pattern เดียวกับ task นี้)
- [ ] **Migration section executable proof required** — CHANGELOG migration note ทุก section ต้องผ่าน sandbox test (คำสั่งทำงานจริง) + warn "commit/stash ก่อน" ถ้าคำสั่ง destructive (เช่น `reset --hard`) — ลด risk "คำสั่งใน CHANGELOG ลบงาน user" (Security suggestion #5)
- [ ] **runbook section ใน infra docs** — gate ใหม่ทุกครั้งควรมี runbook section อธิบาย error category + วิธีแก้ — note ใน rule.md (Infra suggestion #3)
- [ ] **CI windows-latest ad-hoc verify pattern** — ถ้า maintainer ไม่มี Windows dev, gate ที่ต้อง manual verify บน Windows → CI workflow ad-hoc บน `windows-latest` — note ใน rule.md (Infra suggestion #4)
- [ ] **MIN_PASS bump evidence-based only** — bump จาก pass count จริง (ไม่ derive จากคาด) + comment ใน source ระบุที่มา (rule §1 KB TS-6) — pattern enforced ใน task นี้; note ใน rule.md