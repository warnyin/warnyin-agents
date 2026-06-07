# Task — sync-p0-docs

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `sync-p0-docs` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (repo meta docs) |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
> ปิด gap P0 เอกสารให้ครบ end-to-end: ผู้ใช้รุ่นเก่า migrate ได้ (CHANGELOG + README ลิงก์) และ roadmap สะท้อนสถานะ P0 จริง — ใน task เดียว

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: — (task เดียวใน topic)
- ปลดล็อกให้: — (เข้า VERIFY ได้เลย)
- **dependency ภายใน (sub-task):** B ขึ้นกับ A (README ลิงก์ไป anchor ที่ A สร้าง); C อิสระ

## 3. Sub-tasks (แตกย่อย — ระบุลำดับ/สิ่งที่ส่งต่อ)

- [x] **A. CHANGELOG migration section** — เพิ่ม `## Migration guide` ใน `CHANGELOG.md` (L8)
  - ตาราง 2 แถว breaking mirror `src/bin/cli.mjs` L43–58 (≤0.2.x · 0.3–0.5.x) — codepoint ตรง (en-dash U+2013, ≤ U+2264 — verified); คำสั่ง `git mv`/`git rm` ตรง legacy warning
  - บรรทัดระบุ 0.6.0→0.7.0 ผู้ใช้ปลายทางไม่ต้องทำอะไร (payload คงเดิม — contributor ดู `CONTRIBUTING.md`)
  - _ผลลัพธ์:_ anchor `#migration-guide` พร้อม (slug ตรง verified)
- [x] **B. README link** (_ขึ้นกับ A_) — เพิ่มบรรทัดลิงก์ใน `README.md` (L30) ใต้ section "ติดตั้ง" ชี้ `CHANGELOG.md#migration-guide` (anchor ตรง slug A)
- [x] **C. roadmap sync** (_อิสระ_) — `docs/roadmap.md`: ติ๊ก P0 #3/#4 ✅ + หมายเหตุ (topic `roadmap-sync-p0`) + อัปเดตวันที่ → 2026-06-07

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `CHANGELOG.md` (เพิ่ม section)
- `README.md` (เพิ่ม 1 บรรทัดลิงก์)
- `docs/roadmap.md` (ติ๊ก checkbox + วันที่ + หมายเหตุ)
- **อ่านอย่างเดียว (ห้ามแก้):** `src/bin/cli.mjs` (source-of-truth migration)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [x] sub-task A/B/C เสร็จครบตาม `spec.md` §7 (test-flow)
- [x] migration table ตรง legacy warning `cli.mjs` (codepoint en-dash/≤ + คำสั่ง git mv/git rm — verified)
- [x] README anchor link ใช้งานได้ (`## Migration guide` → slug `#migration-guide` ตรง)
- [x] roadmap checkbox ตรงสถานะจริง + วันที่ 2026-06-07 (ไม่ติ๊กลวง)
- [x] `git diff --name-only` แตะเฉพาะ 3 ไฟล์ docs (+ artifact topic) — ไม่มี `src/` (verified: 0)
- [x] `npm test` ยังเขียว (18/18 pass, fail 0)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern เอกสาร): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
