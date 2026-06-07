# Design (How) — roadmap-sync-p0

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture**

## 1. ภาพรวมสถาปัตยกรรม
- **component ที่เกี่ยวข้อง:** ไม่ผูก component โค้ด — แตะเฉพาะ repo meta docs (`CHANGELOG.md`, `README.md`) + `docs/roadmap.md`; source-of-truth ของ migration content = `src/bin/cli.mjs` legacy warning (อ่านอย่างเดียว ไม่แก้)
- **แนวทางหลัก:** งานเอกสาร 1 slice เดียว ("sync P0 docs") แตกเป็น 3 sub-task ที่มี dependency ภายใน — CHANGELOG สร้าง anchor ก่อน → README ลิงก์ตาม; roadmap independent

## 2. Vertical slices
> change เล็ก — 1 slice ส่งมอบคุณค่า end-to-end ("P0 docs ตรงจริง + ผู้ใช้รุ่นเก่า migrate ได้")

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | ปิด gap P0 เอกสาร: migration guide + ลิงก์ + roadmap ตรงจริง | CHANGELOG · README · roadmap · verify (link/codepoint) | `tasks/sync-p0-docs/` |

## 3. Data model / schema
- ไม่มี entity/schema — เอกสาร markdown ล้วน
- **โครง Migration guide section (ใน `CHANGELOG.md`, anchor `#migration`):**
  - หัวข้อ `## Migration guide` (anchor GitHub = `#migration-guide`)
  - ตาราง `จากรุ่น → สิ่งที่เปลี่ยน → คำสั่งที่ต้องทำ` 2 แถว breaking (≤0.2.x, 0.3–0.5.x) mirror `cli.mjs` L43–58
  - บรรทัดระบุ **0.6.0→0.7.0 ผู้ใช้ปลายทางไม่ต้องทำอะไร** (payload คงเดิม) — เฉพาะ contributor (ดู `CONTRIBUTING.md`)

## 4. Interface / contract
- **anchor contract:** README link → `CHANGELOG.md#migration-guide` (GitHub slugify ของ `## Migration guide`) — sub-task README ต้องใช้ anchor ที่ตรงกับหัวข้อจริงที่ sub-task CHANGELOG เขียน

## 5. Flow
- **data-flow:** `cli.mjs` legacy warning (truth) → คัดลอกเป็นตาราง migration ใน CHANGELOG → README ชี้มา
- **user-flow:** ผู้ใช้รุ่นเก่า `npx` เจอ warning → เปิด README/CHANGELOG → ทำตาม migration table → โครงใหม่ใช้ได้

## 6. ผลกระทบต่อระบบเดิม
- **backward compat:** ไม่กระทบ — เพิ่ม section ใหม่ใน CHANGELOG (ไม่แก้ entry เดิม), เพิ่มบรรทัดใน README, ติ๊ก checkbox roadmap
- **ระวัง:** ห้ามแก้ entry `[0.7.0]` ที่มีอยู่; migration content ต้อง = string จริงใน `cli.mjs` ไม่แต่งใหม่

## 7. Dependency ระหว่าง slice/task
> 1 task, 3 sub-task ภายใน

```
sub-task A (CHANGELOG migration section + anchor)
        └──▶ sub-task B (README link → anchor ของ A)
sub-task C (roadmap sync checkbox)   [independent — ทำขนานได้]
```

## 8. Test strategy ระดับ design
- **verify เอกสาร (ไม่ใช่ unit test):**
  1. migration table ตรง legacy warning ใน `cli.mjs` (เทียบ 2 ช่วง + คำสั่ง `git mv` + codepoint en-dash/`≤`)
  2. README anchor link ใช้งานได้ (หัวข้อ `## Migration guide` → slug `#migration-guide` ตรงกับที่ link ชี้)
  3. roadmap checkbox สะท้อนสถานะจริง (#1/#2 ✅, #3/#4 ตามที่ปิดจริง) + วันที่ = 2026-06-07
  4. `git diff --stat` แตะเฉพาะ `CHANGELOG.md`, `README.md`, `docs/roadmap.md` — ไม่มี `src/`
- ไม่กระทบ `npm test` / CI (เอกสารล้วน) — แต่รัน `npm test` ยืนยัน regression-free ได้

---

## Design review
- **Review panel:** ข้าม — change เล็ก เอกสารล้วน ความเสี่ยงต่ำ (user ตัดสินใจตอนปิด gate)
