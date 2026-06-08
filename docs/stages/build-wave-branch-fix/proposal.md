# Proposal — build-wave worktree fork จาก build branch

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `build-wave-branch-fix` |
| **ประเภท** | `refactor` (reliability fix ของ BUILD orchestration tooling) |
| **ขนาด** | `เล็ก` |
| **วันที่** | `2026-06-08` |
| **มาจาก Discovery?** | ไม่มี — root cause ชัดจาก KB#14 + TS-2 (topic `feature-spec-delta`/`validator-status`) + roadmap defer |

## 1. สรุป change (what)
ให้ build sub-agent ใน worktree **merge build branch เข้า worktree ก่อนเริ่มงาน** — ส่ง `baseRef` (ชื่อ build branch) เข้า `build-wave.mjs` args แล้ว prompt สั่ง agent ทำ `git merge <baseRef>` เป็น step แรก เพื่อให้ worktree เห็น **topic docs + output ของ wave ก่อนหน้า** ครบ แทนที่ agent จะ improvise workaround เอง

## 2. ทำไม (why)
- **ปัญหา (KB#14 + TS-2):** harness `isolation:'worktree'` fork worktree จาก **`main`** (ไม่ใช่ build branch ที่ orchestrator อยู่) → worktree **ไม่เห็น** (1) `docs/stages/<slug>/` (topic docs ที่ commit บน build branch) + (2) output ของ wave ก่อน (merge เข้า build branch แล้ว) → agent อ่าน task ของตัวเอง/dependency ไม่ได้
- **อาการจริงที่เจอซ้ำ:** ทุก wave 2 ของ 2 topic ที่ผ่านมา agent ต้อง `git merge build/<slug>` หรือ `git reset --hard` เอง (improvise) + แก้ `task.md` ไม่ได้จาก worktree (Edit tool block)
- **ผลถ้าไม่ทำ:** ทุก BUILD ต้องพึ่ง agent improvise (เปราะ — agent อาจลืม/ทำต่างกัน) + main loop ต้อง reconcile ไฟล์ด้วยมือทุกครั้ง

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A (แนะนำ) — ส่ง `baseRef` + prompt สั่ง agent `git merge <baseRef>` step แรก | explicit + reliable, แก้ที่ root, worktree fork จากไหนก็ทำงาน (merge เป็น fast-forward เพราะ main เป็น ancestor ของ build branch), backward compatible (ไม่ส่ง baseRef → พฤติกรรมเดิม) | agent ต้องรัน git 1 คำสั่งเพิ่ม | ✅ |
| B — main loop checkout เฉพาะไฟล์ scoped จาก worktree branch (workaround ปัจจุบัน) | ไม่แตะ script | ไม่แก้ปัญหา agent ตอน build (ยังไม่เห็น dependency); ต้องทำมือทุกครั้ง | ❌ |
| C — เลิกใช้ harness worktree, สร้าง worktree เองใน script | คุม base ได้เต็ม | invasive, ต้องจัดการ lifecycle worktree เอง — เกินขนาดปัญหา | ❌ |
| D — บังคับ harness ให้ fork จาก build branch | ตรงเหตุ | คุมไม่ได้จาก script (harness feature) | ❌ |

- **เหตุผลที่เลือก:** A แก้ root cause ด้วย footprint เล็กสุด + robust regardless of worktree base (merge เป็น no-op ถ้า worktree มี build branch อยู่แล้ว, เป็น fast-forward ถ้า fork จาก main)

## 4. Scope
**In scope** (แก้ที่ `src/`)
- `src/.warnyin/workflow/scripts/build-wave.mjs` — รับ `baseRef` ใน args; ถ้ามี + isolate → prompt เพิ่ม step 0 "`git merge <baseRef> --no-edit` ก่อนอ่าน task"
- `src/.claude/commands/warnyin/build.md` — orchestrator ส่ง `baseRef: <build branch>` ใน Workflow args (step 6) + อัปเดต integrate note ให้ checkout เฉพาะไฟล์ scoped (จาก E1 workaround → ทำให้เป็น convention)
- `src/.warnyin/workflow/stages/build.md` — §3 principle 3 ขยาย: ระบุ worktree fork จาก main → agent merge build branch ก่อน (unify-in-place)
- CHANGELOG entry (payload change)

**Out of scope**
- unit test ของ build-wave — เป็น agent-driven workflow script (ไม่มี harness ทดสอบ; พิสูจน์ด้วย dogfood BUILD ของ topic ถัดไป)
- แก้ harness worktree base (คุมไม่ได้)
- feature spec ใหม่ — ดู §9 (ไม่มี delta — internal mechanics)

## 5. ผลกระทบ & ความเสี่ยง
- **กระทบ:** ทุก BUILD ที่ใช้ worktree isolation (ทุกโปรเจกต์ที่ `--update`) — เสถียรขึ้น, ไม่ต้อง improvise
- **ความเสี่ยง + วิธีลด:**
  - merge conflict ใน worktree → ไม่เกิด: main เป็น strict ancestor ของ build branch → `git merge` เป็น fast-forward เสมอ (มี note ใน prompt ว่าถ้า conflict ผิดปกติ → รายงาน)
  - baseRef ไม่มีอยู่ (เช่น caller เก่าไม่ส่ง) → optional: ไม่ส่ง = พฤติกรรมเดิม (backward compatible)
  - target ที่ build branch ไม่ได้ตั้งชื่อ `build/<slug>` → orchestrator ส่งชื่อจริงที่สร้าง ไม่ hardcode

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Business: ข้าม — internal tooling fix, คุณค่าอยู่ใน §2
