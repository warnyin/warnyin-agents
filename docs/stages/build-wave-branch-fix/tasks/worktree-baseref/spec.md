# Spec — worktree-baseref

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ให้ build sub-agent ใน worktree **sync build branch เข้า worktree ก่อนทำงาน** — แก้ 3 ไฟล์ payload + CHANGELOG โดย **copy contract จาก design §4 เท่านั้น ห้ามแต่งใหม่** (canonical-copy)

## 1. ชนิดของ task
`refactor` (reliability fix) / payload — แก้ `build-wave.mjs` (prompt string + arg parse) + adapter command `build.md` + playbook `stages/build.md` + CHANGELOG; **ทุกจุด unify-in-place** (ขยาย arg/step/principle เดิม ไม่สร้างกลไกขนาน — `docs/rule.md` §1).
**ไม่มี unit test ใหม่** — build-wave เป็น agent-driven workflow script (ไม่มี harness ทดสอบ `agent()` ตรง); การแก้เป็น **prompt string + 1 arg** พิสูจน์ด้วย static check + dogfood topic ถัดไป (design §8 / panel ยอมรับสำหรับ surface เล็ก).

---

## 2. Canonical contract (copy จาก design §4 — ใช้ตรงนี้ทุกจุด ห้ามแต่งใหม่)

> source of truth = `docs/stages/build-wave-branch-fix/design.md` §4.1–§4.4
> ใต้นี้คือ contract ที่ต้อง **ฝังตรงคำ (verbatim)** — ถ้าต่างจาก design §4 ให้ยึด design §4 เป็นหลัก

### 2.1 build-wave.mjs args (design §4.1 — เพิ่ม field)
```js
// args = { slug, tasks, isolate?, baseRef? }
const baseRef = A.baseRef || null   // ชื่อ build branch เช่น "build/my-topic"; ไม่ส่ง = ไม่ sync (backward compat)
```

### 2.2 prompt step sync (design §4.2 verbatim — แทรกเป็น step แรกของ agent เฉพาะ `isolate && baseRef`)
```
0. **★ Sync build branch เข้า worktree ก่อน (ทำก่อน Read ไฟล์ใดๆ):** รัน
   `git merge <baseRef> --no-edit || (git merge --abort; <รายงาน failed>)`
   (worktree fork จาก main — ต้อง merge build branch เพื่อให้เห็น docs/stages/<slug>/ + output ของ wave ก่อนหน้า)
   - ปกติเป็น fast-forward (main มักเป็น ancestor ของ build branch); ถ้าเป็น 3-way แล้ว conflict → **abort + รายงาน failed** (ห้ามทิ้ง worktree ค้าง MERGE state — step commit ท้ายจะพัง)
   - ถ้าล้มด้วย lock error ชั่วคราว (transient `index.lock`/`packed-refs`) → **retry 1 ครั้ง** ก่อนรายงาน failed
   - **★ hard-stop กัน improvise (panel B2):** หลัง merge ถ้าไฟล์ `docs/stages/<slug>/tasks/<task>/task.md` **ยังไม่ปรากฏ** → **STOP รายงาน failed ทันที ห้าม improvise/git reset เอง** (กันวนรอย KB#14)
   - บันทึกผล merge ลงฟิลด์ `notes` (เช่น "merged <baseRef>: fast-forward to <sha>") เพื่อ main loop verify ว่า sync เกิดจริง (Infra-S5)
```
- ใส่ก่อน step "1. อ่านให้ครบก่อนเขียนโค้ด"; **ใช้ "0." นำหน้า ไม่ renumber** (unify-in-place — กันเลขเพี้ยนกับ step git commit ท้าย step 9)
- ถ้า `!baseRef` (ไม่ส่ง) → **ไม่แทรก** step นี้ (พฤติกรรมเดิม backward compat)

### 2.3 command build.md — orchestrator ส่ง baseRef (design §4.3)
```
6. เรียก Workflow args = { slug, tasks: [...], isolate, baseRef: "<ชื่อ build branch ที่สร้าง step 4>" }
```
- baseRef = ชื่อจริงที่ orchestrator สร้าง (เช่น `build/<slug>`) — **ไม่ hardcode pattern**

### 2.4 integrate note (design §4.4 — workaround → convention)
- agent commit งานใน worktree → รายงาน `branch`; main loop **checkout เฉพาะไฟล์ source ที่ task แก้** จาก branch นั้น (`git checkout <branch> -- <files>`) เลี่ยง topic-docs copy ที่ agent merge เข้า worktree
- `task.md` status/checklist → main loop อัปเดตที่ main working dir ตอน integrate (E1 — agent แก้จาก worktree ไม่ได้ถ้า gitignored)

### 2.5 จุดบังคับจาก panel (ใส่ครบทุกตัว)
- **(B2) hard-stop** — merge สำเร็จแต่ `task.md` ไม่ปรากฏ → **STOP failed ห้าม improvise** (กัน KB#14 ซ้ำ)
- **abort-on-conflict** — `git merge ... || (git merge --abort; failed)` กันค้าง MERGE state (Infra-S2)
- **retry transient lock 1 ครั้ง** (`index.lock`/`packed-refs`) ก่อนรายงาน failed (Infra-S1)
- **บันทึกผล merge ใน `notes`** (Infra-S5)
- **step 0 แทรกก่อน step 1** "อ่านให้ครบ" — ใช้ `"0."` ไม่ renumber (SA-S2 ordering)
- **`isolate && baseRef` guard** — ไม่แทรก step 0 เมื่อ `!baseRef` (backward compat)
- **KB#11** — main loop checkout เฉพาะ scoped `src/` files (ไม่แตะ dogfood path ที่ root → ปลอด tracked-deletion)

---

## 3. จุดที่ต้องแก้ (file | content) — ตาม design §3 ตารางไฟล์แก้

> พิกัดต่อไฟล์มาจาก design §3 (unify-in-place — "ขยายของเดิม"); copy contract จาก §2 ข้างบน / design §4 verbatim

| ไฟล์ | จุดแก้ (copy จาก §2 ข้างบน / design §4) |
|---|---|
| `src/.warnyin/workflow/scripts/build-wave.mjs` | **(1)** บรรทัด ~16-20 (ที่ parse `slug`/`tasks`/`isolate`) → เพิ่ม `const baseRef = A.baseRef \|\| null` ตาม §2.1 + อัปเดต comment block `args = {...}` (บรรทัด ~4-8) เพิ่มฟิลด์ `baseRef?` · **(2)** ใน `prompt(task)` (บรรทัด ~61-93) — **ก่อน** บรรทัด `1. อ่านให้ครบก่อนเขียนโค้ด:` แทรก step `0.` ตาม §2.2 verbatim **เฉพาะเมื่อ `isolate && baseRef`** (เช่น `if (isolate && baseRef) lines.unshift(...)` หรือ build array ตามเงื่อนไข — ใช้ `<baseRef>`/`<slug>`/`<task>` แทนค่าจริง); `if (!baseRef)` → ไม่แทรก |
| `src/.claude/commands/warnyin/build.md` | **step 6** (บรรทัด ~15 ที่เรียก Workflow): เพิ่ม `baseRef: "<build branch ที่สร้าง step 4>"` ใน args ตาม §2.3 + **integrate note** (บรรทัด ~16): ระบุ checkout เฉพาะไฟล์ source ที่ scoped (`git checkout <branch> -- <files>`) + main loop อัปเดต `task.md` ตอน integrate (E1) ตาม §2.4 |
| `src/.warnyin/workflow/stages/build.md` | **§3 principle 3** (Worktree isolation, บรรทัด ~31): ขยาย — ระบุ worktree fork จาก **main** (ไม่ใช่ build branch) → agent ต้อง **sync build branch ก่อน** (กลไกใน build-wave) ; **§4 step 5** (บรรทัด ~54-57): ระบุ orchestrator ส่ง `baseRef` (= build branch) เข้า build-wave + integrate checkout scoped files — **ขยายข้อเดิม ไม่เพิ่ม principle/step ใหม่** |
| `CHANGELOG.md` | entry `[Unreleased]` (payload change — reliability fix, user-facing ตาม `docs/rule.md` §2) |

**ห้ามแตะ:** `src/bin/cli.mjs` · `src/scripts/verify-pack.mjs` · `src/.warnyin/workflow/scripts/validate-topic.mjs` · `src/tests/**` · docs/ กลาง (`docs/rule.md`/`docs/techstack/`/`docs/features/`) · `src/.warnyin/workflow/stages/{verify,design,ship,discovery}.md` (ไม่เกี่ยว) · root dogfood (`.warnyin/`, `.claude/` ที่ root)

---

## 4. Data-flow
orchestrator สร้าง build branch + commit topic docs (E1 เดิม) → ส่ง `baseRef` เข้า build-wave → build-wave แทรก prompt step 0 (เฉพาะ `isolate && baseRef`) → agent ใน worktree (fork จาก main) `git merge <baseRef>` → เห็น `docs/stages/<slug>/` + output ของ wave ก่อน → implement → commit → main loop **checkout เฉพาะ scoped src files** จาก worktree branch (เลี่ยง topic-docs copy + KB#11)

## 5. User-flow
- **ไม่เปลี่ยน** — user สั่ง `/warnyin:build <slug>` เหมือนเดิม (เสถียรขึ้นเบื้องหลัง: agent wave 2 เห็น dependency โดยไม่ต้อง improvise)
- caller เก่าที่ไม่ส่ง `baseRef` → ไม่ sync = พฤติกรรมเดิม (backward compat); `isolate:false` (shared tree) → ไม่มี worktree = ไม่เกี่ยว

## 6. Persona
AI ทุก harness ที่เดิน BUILD ตาม playbook กลาง (Claude Code มี Workflow tool ใช้ build-wave; เครื่องอื่นทำตามหลักการ §3-§4) + ผู้ใช้ปลายทางที่ `--update` รับพฤติกรรมใหม่อัตโนมัติ

## 7. Test-flow (design §8 — ไม่มี unit, static + dogfood)
- [ ] **static existence** — grep `baseRef` ใน `build-wave.mjs` (พบทั้งใน arg parse + ใน `prompt`) + ใน `build.md` (orchestrator ส่ง arg)
- [ ] **node syntax** — `node --check src/.warnyin/workflow/scripts/build-wave.mjs` ผ่าน
- [ ] **static ordering (SA-S2)** — step `0.` (git merge) ปรากฏ **ก่อน** บรรทัด `1. อ่านให้ครบ` ใน prompt (grep ลำดับ ไม่ใช่แค่ existence — กันแทรกผิดที่ → agent อ่าน task ก่อน sync = พัง)
- [ ] **guard ครบ** — grep ว่า merge มี `|| (git merge --abort` (กันค้าง MERGE state) + hard-stop "task.md ... ไม่ปรากฏ → ... failed" + `isolate && baseRef` guard (ไม่แทรกเมื่อ `!baseRef`) + retry transient lock + บันทึก `notes`
- [ ] **playbook + command** — `stages/build.md` §3 principle 3 ระบุ worktree fork จาก main → sync build branch · `build.md` step 6 ส่ง `baseRef` + integrate note checkout scoped files
- [ ] **gate เดิม** — `npm test` 53/53 (ไม่มี regression) · `npm run lint:md` · `npm run verify:pack` (build-wave.mjs ยังติด tarball) เขียว
- [ ] **executable proof** = dogfood **topic ถัดไป** ที่ BUILD แบบ multi-wave (agent wave 2 เห็น dependency โดยไม่ improvise + เห็นผล merge ใน `notes`) — VERIFY ของ topic นี้ตรวจ static + รอ dogfood รอบหน้า (real proof แข็งกว่า unit ตาม KB#13)
