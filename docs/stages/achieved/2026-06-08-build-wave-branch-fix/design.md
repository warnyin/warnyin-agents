# Design (How) — build-wave worktree fork จาก build branch

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end

## 1. ภาพรวมสถาปัตยกรรม
- **component:** BUILD orchestration tooling — `build-wave.mjs` (payload script) + command adapter `build.md` + playbook `stages/build.md`
- **แนวทางหลัก:** harness `isolation:'worktree'` fork worktree จาก main (คุมไม่ได้) → แก้ที่ฝั่งเราด้วยการให้ **agent sync build branch เข้า worktree เอง** (prompt-driven, unify-in-place):

```
orchestrator (BUILD): สร้าง build/<slug> → commit topic docs (E1 เดิม) → wave 1 merge เข้า build branch
        │ เรียก Workflow build-wave.mjs args={slug, tasks, isolate, baseRef:'build/<slug>'}
        ▼
build-wave.mjs: ถ้า isolate && baseRef → prompt step 0 = "git merge <baseRef> --no-edit"
        ▼
agent ใน worktree (fork จาก main): merge build/<slug> → เห็น topic docs + output wave ก่อน → ทำงาน
```

## 2. Vertical slices

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **worktree เห็น dependency ครบทุก wave** — build-wave สั่ง agent sync baseRef + orchestrator ส่ง baseRef + playbook อธิบายกลไก | script (payload) → command adapter → playbook → CHANGELOG | `tasks/worktree-baseref/` |

> change เดียวเชื่อมกันแน่น (script รับ arg ↔ command ส่ง arg ↔ playbook อธิบาย) — 1 task ตาม precedent `learned-rule`/`stage-wiring` (canonical เดียว กัน wording เพี้ยน)

## 3. ไฟล์ที่แก้ (unify-in-place)
| ไฟล์ | จุดแก้ |
|---|---|
| `src/.warnyin/workflow/scripts/build-wave.mjs` | (1) รับ `baseRef` จาก args (บรรทัด ~18-20 ที่ parse slug/tasks/isolate) · (2) ใน `prompt(task)` ก่อน block `if (isolate)` เพิ่ม step sync — **เฉพาะเมื่อ `isolate && baseRef`** — แทรกเป็น step แรกของ agent (ก่อน "อ่านให้ครบ") |
| `src/.claude/commands/warnyin/build.md` | step 6: Workflow args เพิ่ม `baseRef: "<build branch>"` · integrate note: checkout เฉพาะไฟล์ source ที่ scoped จาก worktree branch (workaround → convention) + main loop อัปเดต `task.md` ตอน integrate (E1) |
| `src/.warnyin/workflow/stages/build.md` | §3 principle 3 (Worktree isolation) ขยาย: worktree fork จาก main → agent ต้อง sync build branch ก่อน (กลไกใน build-wave); §4 step 5 ระบุ orchestrator ส่ง baseRef |
| `CHANGELOG.md` | entry `[Unreleased]` |

**ไม่แตะ:** `src/bin/cli.mjs`, `verify-pack.mjs` (script อยู่ใน CORE+allowlist แล้ว) · `validate-topic.mjs` · docs กลาง · root dogfood

## 3.1 หมายเหตุ KB#11 (จาก panel TL-S2)
- main loop integrate ด้วย `git checkout <branch> -- <scoped src files>` (§4.4) — scope เป็น `src/` ล้วน จึงไม่แตะ dogfood path ที่ root → ปลอดภัยจาก KB#11 (tracked-deletion เมื่อ merge branch ที่ track dogfood ต่างจาก main); ระบุใน task rule.md กันพลาด

## 4. Interface / contract — **canonical (task copy จากที่นี่ ห้ามแต่งใหม่)**

### 4.1 build-wave.mjs args (เพิ่ม field)
```js
// args = { slug, tasks, isolate?, baseRef? }
const baseRef = A.baseRef || null   // ชื่อ build branch เช่น "build/my-topic"; ไม่ส่ง = ไม่ sync (backward compat)
```

### 4.2 prompt step sync (แทรกเป็น step แรกของ agent — เฉพาะ `isolate && baseRef`)
```
0. **★ Sync build branch เข้า worktree ก่อน (ทำก่อน Read ไฟล์ใดๆ):** รัน
   `git merge <baseRef> --no-edit || (git merge --abort; <รายงาน failed>)`
   (worktree fork จาก main — ต้อง merge build branch เพื่อให้เห็น docs/stages/<slug>/ + output ของ wave ก่อนหน้า)
   - ปกติเป็น fast-forward (main มักเป็น ancestor ของ build branch); ถ้าเป็น 3-way แล้ว conflict → **abort + รายงาน failed** (ห้ามทิ้ง worktree ค้าง MERGE state — step commit ท้ายจะพัง)
   - ถ้าล้มด้วย lock error ชั่วคราว (transient `index.lock`/`packed-refs`) → **retry 1 ครั้ง** ก่อนรายงาน failed
   - **★ hard-stop กัน improvise (panel B2):** หลัง merge ถ้าไฟล์ `docs/stages/<slug>/tasks/<task>/task.md` **ยังไม่ปรากฏ** → **STOP รายงาน failed ทันที ห้าม improvise/git reset เอง** (กันวนรอย KB#14)
   - บันทึกผล merge ลงฟิลด์ `notes` (เช่น "merged <baseRef>: fast-forward to <sha>") เพื่อ main loop verify ว่า sync เกิดจริง (Infra-S5)
```
- ใส่ก่อน step "1. อ่านให้ครบก่อนเขียนโค้ด"; **ใช้ "0." นำหน้า ไม่ renumber** (unify-in-place, กันเลขเพี้ยนกับ step git commit ท้าย step 9)
- ถ้า `!baseRef` (ไม่ส่ง) → ไม่แทรก step นี้ (พฤติกรรมเดิม)

### 4.3 command build.md — orchestrator ส่ง baseRef
```
6. เรียก Workflow args = { slug, tasks: [...], isolate, baseRef: "<ชื่อ build branch ที่สร้าง step 4>" }
```
- baseRef = ชื่อจริงที่ orchestrator สร้าง (เช่น `build/<slug>`) — ไม่ hardcode pattern

### 4.4 integrate note (command build.md step 6 — ทำ workaround เป็น convention)
- agent commit งานใน worktree → รายงาน `branch`; main loop **checkout เฉพาะไฟล์ source ที่ task แก้** จาก branch นั้น (`git checkout <branch> -- <files>`) เลี่ยง topic-docs copy ที่ agent merge เข้า worktree
- `task.md` status/checklist → main loop อัปเดตที่ main working dir ตอน integrate (E1 — agent แก้จาก worktree ไม่ได้ถ้า gitignored)

## 5. Flow
- **data-flow:** orchestrator สร้าง build branch + commit topic docs → ส่ง baseRef เข้า build-wave → agent merge baseRef เข้า worktree → เห็น docs + dependency → implement → commit → main loop checkout scoped files
- **user-flow:** ไม่เปลี่ยน — user สั่ง `/warnyin:build <slug>` เหมือนเดิม (เสถียรขึ้นเบื้องหลัง)

## 6. ผลกระทบต่อระบบเดิม
- **backward compatible:** `baseRef` optional — caller ที่ไม่ส่ง (เช่น manual invoke เก่า) → ไม่ sync = พฤติกรรมเดิม; `isolate:false` (shared tree) → ไม่เกี่ยว (ไม่มี worktree)
- merge **ปกติเป็น fast-forward** (main มักเป็น ancestor ของ build branch) → ไม่มี conflict ในเคสทั่วไป; เคส 3-way (main ขยับหลัง build branch แตก) ที่ conflict → agent abort + รายงาน failed (§4.2) — ไม่ทิ้ง state ค้าง
- ไม่กระทบ installer/pack — แก้เนื้อ script ที่อยู่ใน CORE+allowlist แล้ว

## 7. Dependency ระหว่าง slice/task
- task เดียว (`worktree-baseref`) — ไม่มี dependency ภายใน

## 8. Test strategy ระดับ design
- **ไม่มี unit test** — build-wave เป็น agent-driven workflow script (ไม่มี harness ทดสอบ agent() ตรง; panel ยอมรับ static+dogfood สำหรับ surface เล็ก = string + 1 arg); การแก้เป็น **prompt string + arg parsing** ที่พิสูจน์ด้วย:
  - static existence: grep `baseRef` ใน build-wave.mjs (parse + prompt) + command build.md (ส่ง arg) ครบ; node syntax ผ่าน (`node --check`)
  - **static ordering (SA-S2):** step `0.` (git merge) ต้องปรากฏ **ก่อน** บรรทัด "1. อ่านให้ครบ" ใน prompt — grep ลำดับ ไม่ใช่แค่ existence (กันแทรกผิดที่ → agent อ่าน task ก่อน sync = พัง)
  - **guard ครบ:** grep ว่า merge มี `|| (git merge --abort` (กันค้าง MERGE state) + hard-stop "task.md ไม่ปรากฏ → failed" + `isolate && baseRef` guard (ไม่แทรกเมื่อ !baseRef)
  - gate เดิม: `npm test` 53/53 (ไม่มี regression) · `lint:md` · `verify:pack` (build-wave.mjs ยังติด tarball)
  - **executable dogfood:** topic **ถัดไป** ที่ BUILD แบบ multi-wave จะพิสูจน์ว่า agent wave 2 เห็น dependency โดยไม่ต้อง improvise + เห็นผล merge ใน `notes` (VERIFY ของ topic นี้ตรวจ static + รอ dogfood รอบหน้า — เหมือน validator self-validate; dogfood เป็น real proof แข็งกว่า unit ในเคสนี้ เพราะ KB#13 เตือน self-report เขียวปลอม)

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> **ไม่มี delta** — เป็น reliability fix ของ internal orchestration mechanics ไม่เปลี่ยน **observable behavior ที่ user เห็น** (BUILD ยังทำงานเหมือนเดิมจากมุม user — สั่ง `/warnyin:build` แล้วได้ผลเดิม แค่เบื้องหลังเสถียรขึ้น ไม่ต้อง improvise)
> ไม่มี feature `build-orchestration` ใน `docs/features/` และ fix นี้ไม่ถึงเกณฑ์สร้าง feature spec ใหม่ (mechanics ภายใน ไม่ใช่ capability ใหม่) — ถ้าอนาคตอยากมี behavior spec ของ BUILD orchestration ค่อยทำเป็น topic แยก

---

## Design review (panel — 2026-06-08)

fan-out reviewer ขนาน read-only: Tech Lead / SA / Infra (QA/Security ผลกระทบน้อย — change รอบ git/worktree ภายใน, ไม่มี user input/secret)

**Blockers ที่พบ + การแก้ (ปิดครบ):**
| # | Role | Blocker | แก้แล้วที่ |
|---|---|---|---|
| B1 | TechLead | task folder `worktree-baseref/` ยังไม่ถูกสร้าง | สร้างหลัง panel (ขั้นปกติ — แตก task หลังแก้ blocker) |
| B2 | TechLead | contract ไม่มี hard-stop เมื่อ merge สำเร็จแต่ไฟล์ task ไม่ปรากฏ → agent improvise ซ้ำ KB#14 | §4.2 เพิ่ม hard-stop "task.md ไม่ปรากฏหลัง merge → STOP failed ห้าม improvise" |

**Suggestions ที่รับ:** TL-S/SA-S1 soften "FF เสมอ" → "ปกติ FF; 3-way conflict → abort+failed" (§4.2/§6) · Infra-S2 `git merge \|\| (git merge --abort; failed)` กันค้าง MERGE state (§4.2) · Infra-S1 retry transient lock 1 ครั้ง (§4.2) · Infra-S5 บันทึกผล merge ใน `notes` (§4.2) · SA-S2/TL-S6 static ordering assertion (step 0 ก่อน step 1) ใน VERIFY (§8) · TL-S2 หมายเหตุ KB#11 scoped src files (§3.1)

**Suggestions ที่ไม่รับ + เหตุผล:** TL-S6/SA-S2 refactor `prompt` เป็น pure fn เพื่อ unit test → **ไม่ทำ** (panel ทั้งคู่สรุปว่า static+dogfood ยอมรับได้สำหรับ surface เล็ก = string+1 arg; dogfood เป็น real proof แข็งกว่า unit ตาม KB#13; คง footprint เล็กตาม design intent) — แต่เสริม static ordering check ชดเชย

**ผลรวม:** SA + Infra = ไม่มี blocker (backward-compat/packaging/worktree-concurrency ยืนยันปลอดภัย); TechLead B1 (สร้าง task) + B2 (hard-stop) = แก้ครบ — ไม่มี blocker ค้าง
