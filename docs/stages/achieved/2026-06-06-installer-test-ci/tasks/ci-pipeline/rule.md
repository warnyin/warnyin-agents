# Rule — ci-pipeline

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow
> จากปรัชญา `CLAUDE.md` + review panel (Security/Infra) — ข้อ Security เป็น **บังคับ** (ถ้าผิดพร้อมกัน = pwn-request)
- [ ] **`permissions: contents: read`** ที่ top-level (least-privilege)
- [ ] **`on: pull_request` — ห้าม `pull_request_target`** (job รันโค้ดจาก PR → pwn-request ถ้าใช้ target + secret)
- [ ] **ไม่มี `secrets.*`** ในไฟล์ (ไม่ publish/ไม่ใช้ token; เพิ่ม publish ต้องผ่าน review แยก)
- [ ] **ไม่มี `npm ci`/`cache: npm`** (zero-dep ไม่มี lockfile — จะ fail)
- [ ] pin action ด้วย commit SHA
- [ ] CHANGELOG ทุก user-facing change (engines bump = user-facing)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ไฟล์กลางตอนนี้ — note ไว้ก่อน
- [ ] rule ที่เสนอ: **"CI security baseline"** — ทุก workflow ต้อง `permissions` ขั้นต่ำ + `pull_request` (ไม่ `pull_request_target`) + pin SHA + ไม่มี secret เว้นจำเป็น — เหตุผล: กัน pwn-request/supply-chain (สอดคล้อง roadmap P1#7 security checklist)
- [ ] rule ที่เสนอ: **"ทุกการ bump version / breaking → ต้องมี CHANGELOG entry"** — เหตุผล: ผู้ใช้ npm ต้องรู้ migration (เชื่อม roadmap P0#3)
- [ ] standard ที่เสนอ: **pack-verify เป็น CI gate ก่อน publish** — `.warnyin/` ติด & ไม่มีไฟล์รั่ว — เหตุผล: 0.6.0 dotfolder เกือบหลุด เป็นบทเรียนจริง
