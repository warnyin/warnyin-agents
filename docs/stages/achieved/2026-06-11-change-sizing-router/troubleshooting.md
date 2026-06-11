# Troubleshooting — change-sizing-router

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ (ส่วนใหญ่ตอน BUILD) แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`
> เจอปัญหาใหม่ → อ่าน `docs/troubleshooting.md` ก่อนเสมอ เผื่อเคยแก้แล้ว

---

## วิธีบันทึก
บันทึกเฉพาะปัญหาที่ **ยากจะแก้** หรือ **เจอซ้ำ** (ไม่ใช่ทุก error เล็กน้อย) — หนึ่งปัญหา = หนึ่ง entry

---

### TS-1: `verify:pack` ล้มด้วย `spawnSync npm ENOENT` บน Windows
| | |
|---|---|
| **วันที่** | `2026-06-11` |
| **Component / Task** | `installer` / full-gate (เจอทั้ง build-agent ใน worktree + main loop) |
| **ความถี่** | เจอซ้ำ 3 ครั้ง (build sub-agent 2 ตัว + main loop full-gate) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ (เป็น env/tooling ระดับ repo ที่ทุก contributor บน Windows จะเจอ) |

- **อาการ / error message:**
  ```
  Error: spawnSync npm ENOENT
    syscall: 'spawnSync npm', path: 'npm', spawnargs: ['pack','--dry-run','--json']
    errno: -4058, code: 'ENOENT'   (src/scripts/verify-pack.mjs:53)
  ```
- **บริบทที่ทำให้เกิด (trigger):** รัน `npm run verify:pack` บน Windows — script ใช้ `execFileSync('npm', ...)` ตรงๆ
- **สาเหตุที่แท้จริง (root cause):** บน Windows ตัว executable ของ npm คือ `npm.cmd` (ไม่ใช่ `npm`). `child_process.execFileSync('npm')` **ไม่ได้** ผ่าน shell → ไม่ resolve `.cmd` extension ผ่าน PATHEXT → ENOENT. ไม่เกี่ยวกับ change ของ topic นี้ (reproduce ได้บน clean tree ที่ไม่มี triage.md)
- **วิธีแก้ที่ได้ผล (solution):** พิสูจน์เจตนาของ gate โดยตรงแทน — รัน `npm pack --dry-run --json` (ผ่าน shell ปกติ) แล้วเช็คว่าไฟล์ใหม่ใต้ `src/.warnyin/` + `src/.claude/commands/` ติด tarball ครบ (ตรงกับ allowlist `files` ใน `package.json`) → ยืนยันไฟล์ทั้ง 7 INCLUDED
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** ปม fix ถาวร = ใน `verify-pack.mjs` ใช้ `process.platform === 'win32' ? 'npm.cmd' : 'npm'` หรือเพิ่ม `shell: true` ใน `execFileSync` (เสนอเป็น learned-rule รอ SHIP); ระหว่างนี้บน Windows ตรวจ pack inclusion ด้วย `npm pack --dry-run --json` ตรงๆ

---

### TS-2: lint:md dead-link จาก markdown-link เชิงอธิบายใน task-brief
| | |
|---|---|
| **วันที่** | `2026-06-11` |
| **Component / Task** | `installer` / `tasks/playbook-wiring` (full-gate) |
| **ความถี่** | เจอครั้งเดียว (pre-existing บน main) |
| **ยกขึ้น KB กลางตอน SHIP?** | ❌ (เฉพาะ topic — แต่เป็น pattern ที่ดีควรจำ) |

- **อาการ / error message:**
  ```
  ✖ docs/stages/.../tasks/playbook-wiring/task.md: ลิงก์เสีย -> ../triage.md#fast-track-skip-list
  ```
- **บริบทที่ทำให้เกิด (trigger):** task-brief เขียน **ตัวอย่าง** markdown-link ที่ agent ต้องไปใส่ใน `src/.warnyin/workflow/stages/*.md` แต่เขียนเป็น live link `[..](../triage.md#..)` ในตัว brief เอง → `lint:md` resolve จาก location ของ brief (`tasks/playbook-wiring/`) → `../triage.md` = `tasks/triage.md` (ไม่มี) → dead-link
- **สาเหตุที่แท้จริง (root cause):** link เชิงอธิบาย (illustrative) ที่ตั้งใจให้เป็น "ข้อความสั่ง" ถูกเขียนเป็น live markdown-link แทน inline-code — บรรทัดที่ห่อ backtick (` `[..](..)` `) lint จะข้าม แต่บรรทัดที่ไม่ห่อ lint พยายาม resolve. ไฟล์ artifact จริงใน `src/.warnyin/workflow/stages/` resolve ถูกต้องอยู่แล้ว (lint ไม่ flag)
- **วิธีแก้ที่ได้ผล (solution):** ห่อ illustrative link ใน task-brief ด้วย backtick (inline-code) ให้เป็น documentation ไม่ใช่ live link — ตรงกับวิธีที่บรรทัดอื่นในไฟล์เดียวกันทำอยู่แล้ว (consistency)
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** เวลาเขียน task-brief ที่ยกตัวอย่าง markdown-link สำหรับไฟล์ปลายทาง → ห่อ backtick เสมอ (illustrative ≠ live). dead-link ของ artifact จริงต่างหากที่เป็น integration-proof (full-gate)
