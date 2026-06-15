# Troubleshooting — Ponytail Minimalism

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ (ส่วนใหญ่ตอน BUILD) แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`
> เจอปัญหาใหม่ → อ่าน `docs/troubleshooting.md` ก่อนเสมอ เผื่อเคยแก้แล้ว

---

### TS-1: verify:pack ล้ม ENOENT บน Windows (node execFileSync)
| | |
|---|---|
| **วันที่** | `2026-06-15` |
| **Component / Task** | `installer` / `tasks/embed-minimalism-principle` |
| **ความถี่** | เจอซ้ำ (มีอยู่ก่อนแล้ว — ตรงกับ KB กลาง #4) |
| **ยกขึ้น KB กลางตอน SHIP?** | ❌ (มีใน `docs/troubleshooting.md #4` แล้ว — ไม่ duplicate) |

- **อาการ / error message:**
  ```
  npm run verify:pack → spawnSync npm ENOENT
  ```
- **บริบทที่ทำให้เกิด (trigger):** รัน `verify:pack` (ใช้ `execFileSync('npm', ...)`) บน Windows dev — `execFileSync` ไม่ทำ PATHEXT resolution จึงหา `npm.cmd` ไม่เจอ
- **สาเหตุที่แท้จริง (root cause):** Windows ต้องการ `npm.cmd` แต่ `execFileSync` ไม่ spawn ผ่าน shell (known issue ของ repo — KB #4)
- **วิธีแก้ที่ได้ผล (solution):** ยืนยัน payload ด้วย `npm pack --dry-run --json` ใน PowerShell แล้วตรวจ `files` list (ยืนยัน `src/.warnyin/workflow/minimalism.md` ติด package) + unit gate `verify-pack.test.mjs` (checkFiles) ผ่าน — logic เดียวกัน
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** บน Windows dev ใช้ PowerShell `npm pack --dry-run --json` แยก หรือถือ CI (ubuntu) เป็น authoritative gate ของ `verify:pack`

---

### หมายเหตุ (ไม่ใช่ปัญหาของ change นี้)
- `npm test` มี 2 fail `isEntrypoint` (`installer.test.mjs:423/428`) — realpath/symlink บน Windows, **pre-existing** (ยืนยัน fail บน clean base ด้วย `git stash`) ไม่เกี่ยวกับ topic นี้ → ไม่บันทึกเป็น TS (ไม่ได้แก้ + ไม่ใช่ของใหม่)
