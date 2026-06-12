# Troubleshooting — setup-dogfood-version-check

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`

---

### TS-1: `verify:pack` ENOENT บน Windows dev (เจอซ้ำ — ตรงกับ KB กลาง #4)
| | |
|---|---|
| **วันที่** | 2026-06-12 |
| **Component / Task** | `installer` / `tasks/installer-version-stamp` (full-gate) |
| **ความถี่** | เจอทุกครั้งที่รัน `npm run verify:pack` บน Windows dev (pre-existing) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ มีอยู่แล้ว (#4) — ยืนยันซ้ำ ไม่ต้องเพิ่มใหม่ |

- **อาการ:** `npm run verify:pack` → `Error: spawnSync npm ENOENT` (Node.js v24, Windows)
- **root cause:** `execFileSync('npm', ...)` ใน `verify-pack.mjs` ไม่ผ่าน shell บน Windows — executable จริงคือ `npm.cmd` แต่ execFile ไม่ทำ PATHEXT resolution (KB กลาง #4)
- **วิธีแก้ที่ใช้ (verify รอบนี้):** (1) unit gate `checkFiles()` ใน `verify-pack.test.mjs` ผ่านครบ (รวมเคสใหม่ "stamp deny: `.warnyin/.warnyin-version` (root) หลุด → จับได้") — logic gate เดียวกัน ไม่ต้องการ npm process จริง; (2) **executable proof แบบ portable:** `npm pack --dry-run --json` (ผ่าน shell) → ยืนยัน stamp **ไม่หลุด** ขึ้น tarball + payload ครบ (83 files, src/.warnyin/workflow + src/.claude/commands/warnyin ติด, ไม่มี leak)
- **ป้องกันซ้ำ:** acceptance ที่ระบุ "npm run verify:pack ผ่าน" บน Windows dev → ใช้ unit gate + `npm pack --dry-run --json` แทน; `npm run verify:pack` ทำงานได้บน CI ubuntu ปกติ (CI เป็น gate จริงตอนเปิด PR)

---

### TS-2: warn `⚠ version drift / ⚠ ข้าม version check` ปรากฏใน test output (ไม่ใช่ error)
| | |
|---|---|
| **วันที่** | 2026-06-12 |
| **Component / Task** | `installer` / `tasks/setup-dogfood-verify` |
| **ความถี่** | ทุกครั้งที่ test เรียก `verifyInstalled` ใน path degrade/transition/drift |
| **ยกขึ้น KB กลางตอน SHIP?** | ➖ ไม่ใช่ปัญหา — note ไว้กัน misread |

- **อาการ:** test output มี `⚠ version drift...` / `⚠ ข้าม version check...` บน stderr ระหว่างรัน `setup-dogfood.test.mjs`
- **root cause:** `verifyInstalled` log warn loud ทุกครั้งที่ degrade/transition/drift — เป็น **expected behavior** ตาม design §4B (warn loud บังคับ เพื่อผู้ใช้ไม่ surprise); test ที่ assert เคสเหล่านี้จึง trigger warn เป็น informational
- **ข้อสรุป:** ไม่ suppress — test ผ่านครบ (80/80 ตอน task, 85/85 ตอน full-gate); warn อยู่บน stderr เป็น informational ไม่ใช่ failure
- **ถ้า noise รบกวนอนาคต:** refactor `verifyInstalled` คืน `{ok, reason}` แล้วให้ caller log แทน (design §4B ระบุ impl เลือกได้ตราบที่ message ครบ) — ยกเป็น defer ไม่ทำตอนนี้
