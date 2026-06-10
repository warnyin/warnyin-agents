# Troubleshooting — improve-performance (BUILD)

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ (ส่วนใหญ่ตอน BUILD) แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`
> เจอปัญหาใหม่ → อ่าน `docs/troubleshooting.md` ก่อนเสมอ เผื่อเคยแก้แล้ว

---

### TS-1: BUILD worktree ว่าง — ไม่มี `.warnyin/` + topic docs (root build-wave.mjs stale)
| | |
|---|---|
| **วันที่** | `2026-06-10` |
| **Component / Task** | `installer` / `tasks/build-wave-model-arg` (wave 1) |
| **ความถี่** | เจอครั้งเดียวรอบนี้ (แต่เป็น sync gap เชิงระบบ — เสี่ยงเจอซ้ำ) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ:** sub-agent ใน worktree อ่าน `.warnyin/workflow/stages/build.md`, `roles/developer.md`, และ `docs/stages/<topic>/tasks/<task>/*.md` ไม่เจอ — `find docs/stages` เจอแค่ `achieved/` + `context.md` ว่าง; agent หยุดรายงาน `failed` (ถูกต้อง — ไม่เดา spec)
- **บริบท (trigger):** เรียก `Workflow` ด้วย root path `.warnyin/workflow/scripts/build-wave.mjs` แบบ worktree isolation โดยไม่ส่ง `baseRef`
- **root cause (ซ้อน 2 ชั้น):**
  1. **root `.warnyin/` ถูก gitignore** (dogfood) → ไม่เคย commit → worktree (fresh checkout) ไม่มี playbook กลาง
  2. **root build-wave.mjs stale กว่า `src/`** — ขาด `baseRef` step-0 sync (merge build branch เข้า worktree) ที่ src มีแล้ว → worktree fork จาก base คนละสาย ไม่มี DESIGN output ของ topic
- **solution (ที่ใช้จริง):**
  - task ที่ผ่านแต่ branch base ปนเปื้อน → `git cherry-pick <commit เดี่ยวของ agent>` เอาแค่ diff ไฟล์ที่ own (ไม่ merge ทั้ง branch — กันลาก divergence)
  - task ที่ fail + wave ถัดไป → re-run `isolate:false` (**shared-tree**): agent ทำใน working tree จริง เห็นไฟล์ครบ → main loop commit
- **ป้องกันซ้ำ:**
  - worktree mode ต้องเรียก script ที่มี `baseRef` step-0 (`src/.warnyin/...`) **และส่ง `baseRef: "build/<slug>"`**; repo ที่ root playbook gitignore → ใช้ shared-tree
  - **SHIP release sync src→root** ให้ root build-wave.mjs converge (ปิด sync gap ถาวร)

---

### TS-2: Runtime e2e proof ของ payload workflow script ต้องใช้ AsyncFunction
| | |
|---|---|
| **วันที่** | `2026-06-10` |
| **Component / Task** | `installer` / `tasks/build-wave-model-arg` |
| **ความถี่** | เจอครั้งเดียว (ต่อยอด KB#16) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ (เสริม KB#16) |

- **อาการ:**
  ```
  SyntaxError: await is only valid in async functions and the top level bodies of modules
  ```
  (ที่ `const results = await parallel(...)` เมื่อ `new Function(body)`)
- **root cause:** build-wave.mjs ใช้ top-level await (harness wrap body เป็น async + inject globals) — `new Function` สร้าง sync function จึงไม่รองรับ
- **solution:** `const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor; new AsyncFunction('args','agent','parallel','log','phase', body)` แล้ว `await fn(...)`; neutralize `export` (`export function`→`function`, `export const meta`→`const meta`) ก่อน wrap
- **ป้องกันซ้ำ:** unit test ที่สกัด **pure helper** (`normalizeTasks`/`buildOpts` — ไม่มี await) ใช้ `new Function` ปกติได้; เฉพาะ runtime-proof **ทั้ง body** ที่มี top-level await จึงต้อง AsyncFunction (ดู KB#16 + `techstack/installer/test.md`)

---

### TS-3: Root dogfood (`.claude/`, `.warnyin/`) ถูก gitignore — git status ไม่เห็น edit
| | |
|---|---|
| **วันที่** | `2026-06-10` |
| **Component / Task** | `installer` / `tasks/model-routing-docs` (wave 2) |
| **ความถี่** | เจอซ้ำได้ทุก task ที่แตะ playbook/command/contexts |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ:** แก้ไฟล์ root `.claude/commands/warnyin/` หรือ `.warnyin/workflow/` แล้ว `git status` ไม่ขึ้น modified; Edit `old_string` ที่ root command ไม่ match ทั้งที่ copy จาก src (root stale — ขาด baseRef line)
- **root cause:** tracked source = `src/` เท่านั้น; root เป็น dogfood install ที่ release sync src→root regenerate
- **solution:** แก้ canonical ที่ `src/` ก่อน (tracked) → ยืนยัน scope ด้วย `git check-ignore <path>`; ถ้าต้อง sync root เพื่อ runtime ให้ apply **เฉพาะ delta ของ task** (อย่า `cp` ทับทั้งไฟล์ — กัน revert ฟีเจอร์อื่นที่ root ยังเก่า)
- **ป้องกันซ้ำ:** task ที่แตะ playbook/command/contexts/template → แก้ `src/` เป็นหลัก; อย่ารายงานไฟล์ root เป็น `filesChanged` ที่ main loop ต้อง commit (ถูก ignore)
