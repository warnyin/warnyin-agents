# Spec — sync-p0-docs

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`docs` (repo meta + roadmap sync) — ไม่ใช่ API/UI/data/logic

---

## 4. Data-flow
> source-of-truth ของ migration content = `src/bin/cli.mjs` legacy warning (L43–58, **อ่านอย่างเดียว**)

```
src/bin/cli.mjs  (legacy warning — truth)
   ├─ ≤0.2.x:    workflow/ + warnyin-stages/  →  .warnyin/ + docs/stages
   └─ 0.3–0.5.x: warnyin/{workflow,template,installer,stages}  →  .warnyin/ (core) + docs/stages
        │  คัดลอกเป็นตาราง (codepoint ตรง: en-dash U+2013, ≤ U+2264)
        ▼
CHANGELOG.md ## Migration guide  (anchor #migration-guide)
        │  ลิงก์ชี้มา
        ▼
README.md  (บรรทัดลิงก์ใต้ section ติดตั้ง/เริ่มใช้งาน)
```

## 5. User-flow
> ผู้ใช้รุ่นเก่า `npx @warnyin/agents` → เห็น legacy warning จาก `cli.mjs` → เปิด README เจอลิงก์ → อ่าน Migration guide ใน CHANGELOG → ทำตามตาราง `git mv` → โครงใหม่ใช้ได้

## 6. Persona
> **ผู้ใช้ npm รุ่นเก่า** (≤0.2.x / 0.3–0.5.x) ที่ต้อง migrate; รอง: **maintainer** ที่ดู roadmap หาว่า P0 เหลืออะไร

## 7. Test-flow
> verify เอกสาร (ไม่ใช่ unit test) — เคสที่ต้องผ่าน:
- [ ] CHANGELOG มี `## Migration guide` + ตาราง 2 แถว breaking (≤0.2.x, 0.3–0.5.x) ตรง legacy warning ใน `cli.mjs` (เทียบคำสั่ง `git mv` + codepoint en-dash/`≤`)
- [ ] CHANGELOG ระบุ **0.6.0→0.7.0 ผู้ใช้ปลายทางไม่ต้องทำอะไร** (payload คงเดิม — contributor เท่านั้น)
- [ ] README มีลิงก์ชี้ `CHANGELOG.md#migration-guide` และ anchor ตรงกับหัวข้อจริง (slug ของ `## Migration guide`)
- [ ] `docs/roadmap.md` — P0 #1/#2 ✅, #3/#4 ติ๊กตามจริง (+ หมายเหตุส่วนที่ปิด), วันที่อัปเดต = 2026-06-07
- [ ] `git diff --name-only` = เฉพาะ `CHANGELOG.md`, `README.md`, `docs/roadmap.md` (+ artifact ใต้ `docs/stages/roadmap-sync-p0/`) — **ไม่มี `src/`**
- [ ] `npm test` ยังเขียว (regression-free — เอกสารไม่กระทบ test)
