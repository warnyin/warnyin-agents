# Troubleshooting — Project memory

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ (ส่วนใหญ่ตอน BUILD) แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`
> เจอปัญหาใหม่ → อ่าน `docs/troubleshooting.md` ก่อนเสมอ เผื่อเคยแก้แล้ว

---

## วิธีบันทึก
บันทึกเฉพาะปัญหาที่ **ยากจะแก้** หรือ **เจอซ้ำ** (ไม่ใช่ทุก error เล็กน้อย) — หนึ่งปัญหา = หนึ่ง entry

---

### TS-1: Workflow ปัดตก build-wave เพราะ **root dogfood** เป็น CRLF (คนละชั้นกับ `src/`)
| | |
|---|---|
| **วันที่** | `2026-07-27` |
| **Component / Task** | `installer` / main loop (BUILD orchestration) |
| **ความถี่** | เจอซ้ำ (เคยแก้ที่ชั้น `src/` แล้วใน commit `0a2e7c4` แต่ยังเกิดอีก) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ / error message:**
  ```
  The permission handler returned updatedInput for Workflow that failed schema validation:
  { "path": ["script"], "message": "script contains control characters that would be hidden in the approval dialog" }
  ```
- **บริบทที่ทำให้เกิด (trigger):** เรียก `Workflow({ scriptPath: ".warnyin/workflow/scripts/build-wave.mjs" })` เพื่อ fan-out wave — พังทันทีก่อน agent ตัวแรกจะเริ่ม
- **สาเหตุที่แท้จริง (root cause):** **แก้ผิดชั้นมาก่อน** — `.gitattributes` (`* eol=lf`) + `src/tests/eol.test.mjs` คุมเฉพาะ **`src/**` (source ที่ publish)** แต่ไฟล์ที่ orchestrator โหลดจริงคือ **dogfood layer ที่ root** (`/.warnyin/` ซึ่ง gitignored ตาม `docs/rule.md §6`) ซึ่งมาจาก **published tarball 0.22.0 ที่ pack ก่อนมี `.gitattributes`** → payload เป็น CRLF ทั้ง 84 ไฟล์ และ `copyTree()` ใน `cli.mjs` ใช้ `fs.copyFileSync` (byte copy) จึงลอก CRLF ลง target ตรงๆ. **ผลกระทบไม่ได้จำกัดที่ repo นี้** — ผู้ใช้ทุกคนที่ติดตั้งจาก tarball ที่มี CRLF จะรัน `/warnyin:build` ไม่ได้เลย
- **วิธีแก้ที่ได้ผล (solution):**
  1. **ปลดล็อกทันที:** normalize `/.warnyin/**` + `/.claude/**` (นามสกุล text) จาก CRLF → LF ในที่ (gitignored ไม่กระทบ commit)
  2. **แก้ถาวรที่ต้นเหตุ:** installer ต้อง**เขียน payload เป็น LF เสมอ** ไม่ว่าไฟล์ต้นทางใน tarball จะเป็น EOL อะไร (normalize ตอนเขียน ไม่ใช่ byte-copy) — ป้องกัน tarball ที่ pack จาก checkout เก่า/เครื่องที่ `core.autocrlf=true` ทำผู้ใช้พังต่อ
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:**
  - `grep` บน Git Bash (MSYS) **เชื่อไม่ได้** สำหรับหา CR — text mode strip CR ทิ้ง ทำให้ `grep -c $'\r'` คืน 0 ทั้งที่ไฟล์เป็น CRLF → ใช้ `file <path>` หรืออ่าน buffer ด้วย node (`buf.includes(13)`) แทน
  - **gate ที่คุมแค่ source ไม่พอ ถ้า artifact ที่ runtime ใช้จริงคือ layer ที่ถูก generate/ติดตั้งลงมา** — ต้องคุมที่ "จุดเขียน" (installer) ไม่ใช่แค่ "จุด commit"

---

### TS-2: heading-freeze แดงเพราะ regex `^##` ของ task อื่นจับ `###` ติดมาด้วย
| | |
|---|---|
| **วันที่** | `2026-07-27` |
| **Component / Task** | `workflow core` / `tasks/memory-playbook` (T1) |
| **ความถี่** | เจอครั้งเดียว (ดักไว้ก่อนแดงจริง) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ:** acceptance บังคับ heading ระดับ `##` ครบ 9/9 คำต่อคำ แต่ playbook ต้องมีหัวข้อย่อยใน §3 — ถ้าใช้ `###` แล้วเทสของ wave ถัดไป (T6) เขียน regex เป็น `/^##/` (ไม่มี space) จะจับ `###` ติดมาด้วย → array heading ยาว 12 ไม่ใช่ 9 → **แดงทั้งที่ไฟล์ "ดูเหมือนถูก"**
- **สาเหตุที่แท้จริง:** heading-freeze contract ระบุแค่ "heading ระดับ `##`" แต่ไม่ระบุว่าไฟล์ห้ามมี heading ระดับลึกกว่า — ความถูกต้องจึงขึ้นกับว่า test ของ **อีก task** เขียน regex เข้มแค่ไหน (สัญญาไม่ครอบ)
- **วิธีแก้ที่ได้ผล:** ไม่ใช้ `###` เลยในไฟล์ที่มี heading freeze — แปลงหัวข้อย่อยเป็น bold label แทน แล้ว self-check ทั้ง 2 แบบ: `/^## /` (strict) และ `/^##[^#]/` (loose) ต้องได้ 9 เท่ากัน
- **วิธีป้องกันไม่ให้เกิดซ้ำ:** task ที่มี heading-freeze acceptance ให้เพิ่ม self-check ว่า "ไม่มีบรรทัดขึ้นต้น `###`" เสมอ — ทำให้ invariant ไม่ขึ้นกับความเข้มของ regex ที่ task อื่นจะเขียนทีหลัง

---

### TS-3: compound-needle ข้าม slice ทำให้ไฟล์ canonical กลายเป็น false positive
| | |
|---|---|
| **วันที่** | `2026-07-27` |
| **Component / Task** | `workflow core` / `tasks/memory-playbook` (T1) ↔ `tasks/release-hygiene` (T6) |
| **ความถี่** | เจอครั้งเดียว (ดักไว้ก่อนแดงจริง) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ:** T6 assert ว่าบรรทัดที่มีทั้ง `อัปเดต project memory` และ `ไม่มีอะไรเปลี่ยน → ข้าม` ต้องพบใน **6 ไฟล์เป๊ะ** — แต่ playbook ที่ **นิยาม** hook เองมีแนวโน้มสูงที่จะเขียนทั้ง 2 สตริงในบรรทัดเดียว → กลายเป็นไฟล์ที่ 7 → gate แดงหลัง integrate
- **สาเหตุที่แท้จริง:** ใช้ "ข้อความของ hook" เป็น needle ระบุไฟล์ที่ **มี** hook แต่ canonical playbook ก็พูดถึง hook เดียวกันโดยธรรมชาติ — needle จึงแยก "ไฟล์ที่มี hook" ออกจาก "ไฟล์ที่นิยาม hook" ไม่ได้
- **วิธีแก้ที่ได้ผล:** ในไฟล์ canonical เลี่ยงสตริงตัวใดตัวหนึ่งของ compound needle ทั้งไฟล์ + อธิบาย conditional แยกคนละบรรทัดกับ anchor table + ไม่ลอก wording ของ hook (เป็นของ task เจ้าของไฟล์ stage); self-check ด้วย node ว่าไม่มีบรรทัดใดมีทั้ง 2 สตริง
- **วิธีป้องกันไม่ให้เกิดซ้ำ:** เมื่อ design ใช้ compound-needle assert exact-set ของไฟล์ **ต้องเขียน constraint "ไฟล์ canonical ห้ามมีบรรทัดที่ match needle" ลงใน `task.md`/`spec.md` ของ task เจ้าของไฟล์ canonical ด้วย** — ไม่งั้น builder ของ wave 1 มองไม่เห็น (ไม่เห็นไฟล์เทสของ wave 2)

---

### TS-4: falsifiability check ต้องเป็น manual mutate-run-revert ไม่ใช่เคสถาวรในสวีท
| | |
|---|---|
| **วันที่** | `2026-07-27` |
| **Component / Task** | `workflow core` / `tasks/memory-status-script` (T5) |
| **ความถี่** | เจอครั้งเดียว |
| **ยกขึ้น KB กลางตอน SHIP?** | ⏳ พิจารณาตอน SHIP (เป็น practice ของ anti-false-green) |

- **อาการ/บริบท:** `task.md`/`rule.md` บังคับ anti-false-green — ต้องพิสูจน์ว่าเคส legend-only จะ **แดงจริง** ถ้า entry-detector พัง (ยอมรับทุกบรรทัดที่ขึ้นต้น `|`) ซึ่งเป็นขั้นตอนยืนยัน**คุณภาพเทส**ระหว่าง BUILD ไม่ใช่เคสถาวรในสวีท
- **วิธีแก้ที่ได้ผล:** แก้ `parseRow()` ชั่วคราวให้เงื่อนไขกรองคอลัมน์แรกเป็น no-op → รัน `node --test src/tests/memory-status.test.mjs` เห็นเคสแดงจริง → restore จาก backup → รันซ้ำเขียว 16/16 โดยไม่มีไฟล์ `.bak`/โค้ด mutate ตกค้าง
- **วิธีป้องกันไม่ให้เกิดซ้ำ:** ใช้ **copy-then-mutate-then-restore-from-backup** เสมอ (ไม่ใช้ sed/regex replace กลับ เพราะเสี่ยง diff ไม่ตรง 100%) แล้วยืนยันด้วย `git status` ว่าสะอาดก่อน commit
