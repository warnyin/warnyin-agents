# Troubleshooting — fix-setup-dogfood

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`

---

### TS-1: setup:dogfood false-green — npx exit 0 โดยไม่ install จริง
| | |
|---|---|
| **วันที่** | 2026-06-11 |
| **Component / Task** | `installer` (dev-tooling) / `tasks/setup-dogfood-reliable` |
| **ความถี่** | เจอตอน release 0.15.0 (topic `discovery-mode-selector`) → fix ที่ topic นี้ |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ / error message:**
  ```
  npm run setup:dogfood → รายงาน "เสร็จ" แต่ root CORE ยังเป็น version เก่า
  (discovery.md ไม่มี mode ใหม่; build-wave.mjs ยังมี top-level export)
  ```
- **บริบทที่ทำให้เกิด (trigger):** หลัง publish release ใหม่ รัน `setup:dogfood` เพื่อ sync root dogfood
- **สาเหตุที่แท้จริง (root cause):** 2 จุด — (1) `installViaNpx` รัน `npx --yes @latest` **ไม่มี `--update`** → cli `copyTree({overwrite:false})` ข้าม CORE ที่มีอยู่; (2) `installViaNpx` เชื่อ `r.status===0` อย่างเดียว → npx exit 0 ได้โดยไม่ install จริง (bin resolution เพี้ยน) → return true → ไม่ fallback `installViaPack`
- **วิธีแก้ที่ได้ผล (solution):** (1) ส่ง `--update` ทั้ง npx + node paths; (2) เพิ่ม `verifyInstalled(root)` เช็ค side-effect (root CORE markers `.warnyin/workflow/stages/discovery.md` + `.claude/commands/warnyin` exists) → success-detection = `status===0 && !shimMissing && verifyInstalled(repoRoot)`; false → fallback/exit
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** dev-tooling ที่ spawn external install (npx/npm) **ต้อง verify side-effect ไม่เชื่อ exit 0** + ส่ง flag ตรงเจตนา (`--update`); unit test ต้องมีเคส partial→false พิสูจน์ guard ทำงาน
