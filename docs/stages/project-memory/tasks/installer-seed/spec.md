# Spec — installer-seed

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task

## 1. ชนิดของ task

`template` (payload `.md` 2 ใบ) + `infra` (installer) + `logic` (test) + playbook (`init.md`) — ไม่มี API/UI/data schema ใหม่

---

## 3. Template contract (ไฟล์ที่ task นี้สร้าง — copy จาก `design.md` ไม่ต้องอ่านไฟล์ของ task อื่น)

> **บังคับทั้ง 2 ใบ:**
> - **คำเตือน C12 ที่หัวไฟล์ คำต่อคำ** (T6 assert แบบ string-equality) — block ด้านล่างนี้
> - **0 markdown-link** (`[](...)`) ในทั้งไฟล์ — เพราะสำเนาที่ seed ลง `docs/` **ถูก `lint-md.mjs` สแกน** (`SCAN_ROOTS=['src','docs']`, EXCLUDE เฉพาะ `src/.warnyin/template/` + `docs/stages/achieved/`) → เขียน path ทุกที่เป็น **inline-code (backtick)**
> - เนื้อหาเป็น **โครงเปล่าให้ผู้ใช้เติม** — ห้ามใส่ข้อมูลจริงของ repo นี้

**คำเตือน C12a (variant หัวไฟล์ template — copy คำต่อคำ ที่หัวไฟล์ทั้ง 2 ใบ; `memory.md §2` ของ T1 ใช้ C12b คนละข้อความ):**
```
> ⚠ ไฟล์นี้ถูก **commit** — จดข้อสรุป/ประเด็นเท่านั้น **ห้ามเขียน raw secret/token/credential, absolute path ของเครื่อง หรือ PII จริง**
> path/ไฟล์ที่อ้างถึงให้เขียนเป็น inline-code (backtick) **ห้ามใช้ markdown-link** (dead-link gate สแกนไฟล์นี้)
```

### 3.1 `src/.warnyin/template/docs/stages/context.md` — snapshot (ไม่ใช่ log)

4 section คงที่ **เขียนทับทุกครั้ง** (ไม่ต่อท้าย) ตาม `design.md` §3.2 — heading ต้องตรงคำต่อคำ:

```
## กำลังทำอะไรอยู่      → topic + stage ปัจจุบัน (1-3 บรรทัด)
## ค้างอะไร             → งาน/คำถามที่ยังไม่ปิด ระดับข้ามงาน (ค้างภายใน topic เป็นของ issue.md)
## เพิ่งตัดสินอะไรไป     → decision ที่ยังไม่เป็น artifact (≤5 รายการ ของเก่าตกไป)
## อัปเดตล่าสุด          → YYYY-MM-DD · <stage/เหตุการณ์>
```
- ใต้แต่ละ heading ใส่ **คำใบ้สั้น 1 บรรทัด** (comment หรือ prose สั้น) ว่าเขียนอะไร — ไม่ใส่ข้อมูลจริง
- ทั้งไฟล์ควรอยู่ในเกณฑ์ **≤ 60 บรรทัด** (`design.md` §3.3) — template ต้องสั้นกว่านั้นมาก

### 3.2 `src/.warnyin/template/docs/memory.md` — entry สะสม (ตาราง 6 คอลัมน์)

ตาม `design.md` §3.1 — header ของตารางต้องเป็น 6 คอลัมน์นี้:

```
| # | บทเรียน (what) | ที่มา (evidence pointer) | ประเภท | วันที่ | สถานะ |
```
- **legend closed-set (ต้องปรากฏในไฟล์):** ประเภท ∈ `gotcha` · `บทเรียน` · `ข้อสังเกต` — สถานะ ∈ `open` · `promoted` · `dropped`
- **วันที่** = `YYYY-MM-DD` ที่บันทึก · **evidence pointer เป็น inline-code เท่านั้น** (ห้าม markdown-link)
- **ไม่มี field:** priority · assignee · vector/embedding
- **pointer บาง** ไปกติกาเต็มที่ `.warnyin/workflow/memory.md` — เขียนเป็น **inline-code** (ห้าม markdown-link)
- **★ แถวตัวอย่าง (ถ้าจะใส่) ต้องเป็น HTML comment** — `memory-status.mjs` (T5) นับ entry จาก "แถวที่คอลัมน์แรกเป็นตัวเลขล้วน" → แถวตัวอย่างที่ไม่ comment จะถูกนับเป็น entry จริงของผู้ใช้ทุกโปรเจกต์
- ตารางเปล่า (header + separator) = สถานะตั้งต้นที่ถูกต้อง → `counts` ทุกช่องเป็น 0

---

## 4. Data-flow

```
src/.warnyin/template/docs/memory.md            ──┐  (ไฟล์ของ task นี้)
src/.warnyin/template/docs/stages/context.md    ──┤
                                                  │
project mode:  cli.mjs main() ──▶ ensureScaffold() ──▶ seedDocs()  ──▶ <target>/docs/memory.md
                                       │                    │            <target>/docs/stages/context.md
                                       │                    └─ recursive · ข้าม `[...]` · skip ถ้า existsSync
                                       └─ SCAFFOLD_FILES (หลังแก้: เหลือ docs/stages/achieved/.gitkeep)

global mode:   cli.mjs ข้าม scaffold+seed ──▶ /warnyin:init step 0 ทำแทน (seed ก่อน → ไฟล์เปล่าเป็น fallback)
```

### 4.1 กลไกที่ต้องเข้าใจก่อนแก้ (ยืนยันแล้วกับโค้ดจริง — `src/bin/cli.mjs`)

1. **ลำดับใน `main()` เป็นเหตุผลหลักที่ต้องถอด `context.md` ออกจาก `SCAFFOLD_FILES`**
   `main()` (project branch) เรียก `ensureScaffold()` **ก่อน** `seedDocs()`; `ensureScaffold` เขียนไฟล์เปล่า (`fs.writeFileSync(dest, '')`) ให้ทุก entry ใน `SCAFFOLD_FILES` ที่ยังไม่มี ส่วน `seedDocs` **skip ไฟล์ที่ `existsSync(dest)`**
   → ถ้าไม่ถอด `docs/stages/context.md` ออกจาก `SCAFFOLD_FILES` **ไฟล์เปล่า 0 byte จะบล็อก template ตลอดกาล** (seed ไม่มีวันลง) — เป็น bug เชิงลำดับ ไม่ใช่เรื่อง flag

2. **`ensureScaffold()` + `seedDocs()` ถูกเรียก "ทุกครั้ง" ไม่ว่ามี `--update` หรือไม่**
   ทั้งคู่อยู่ใน project branch ของ `main()` โดยไม่มีเงื่อนไข `UPDATE` (ต่างจาก `copyTree(dir,{overwrite: UPDATE})`)
   → **ผู้ใช้เดิมได้ `docs/memory.md` ทันที** ที่รัน `npx @warnyin/agents` (มีหรือไม่มี `--update` ก็ตาม) เพราะไฟล์นี้ยังไม่เคยมี
   → **แต่ `docs/stages/context.md` ที่เป็นไฟล์ 0 byte จาก `SCAFFOLD_FILES` รุ่นก่อน จะยัง skip ต่อไป** (`existsSync` = true) — **นี่คือพฤติกรรมที่ตั้งใจของ installer** (ไม่เขียนทับงานจริง — `docs/techstack/installer/rule.md`)
   → เคสไฟล์ว่างนี้ **แก้ที่ระดับ playbook ด้วย C13** ("ไฟล์ว่าง/ไม่มี heading = ถือว่ายังไม่มี → เขียนทับด้วยโครงเต็ม" — playbook ของ T1) **ไม่ใช่ที่ installer** — task นี้ **ห้าม** เพิ่ม logic ตรวจไฟล์ว่างแล้วเขียนทับใน `cli.mjs` (จะกลายเป็นการทับงานผู้ใช้)

3. **global mode ข้าม scaffold/seed** — `main()` global branch มีคอมเมนต์ชัด (`ข้าม scaffold/seedDocs (ยกให้ /warnyin:init)`)
   → `init.md` step 0 เป็น **ผู้รับผิดชอบเดียว** ของ workspace bootstrap ในโหมดนี้ → ต้อง seed จาก template ก่อน ไม่ใช่สร้างไฟล์เปล่า (ไม่งั้น global user ได้ `context.md` 0 byte ซ้ำรอยเดิม แล้วโดน skip ตลอดกาลตามข้อ 1)

4. **seed loop ต้อง recursive** — `seedDocs` ใน `cli.mjs` recursive อยู่แล้ว (เรียกตัวเองเมื่อ `entry.isDirectory()`) และมี subdir จริงที่ไม่ใช่ `[...]` ใช้ทางนี้อยู่แล้ว (`template/docs/codemap/index.md`); task นี้เพิ่ม `template/docs/stages/context.md` เป็น subdir ใบถัดไป
   → แต่ **`init.md` step 0 เขียนอธิบายแบบ flat** (`ปลายทาง docs/<entry>`) → ต้องแก้ให้ระบุ recursive ชัด ไม่งั้น agent ที่ทำ INIT ในโหมด global จะ seed ไม่ถึง `docs/stages/context.md`

## 5. User-flow

```
npx @warnyin/agents            → docs/stages/context.md (4 section) + docs/memory.md (ตาราง + legend) พร้อมใช้
npx @warnyin/agents --update   → ผู้ใช้เดิมได้ docs/memory.md ทันที; context.md เดิม (0 byte) คงเดิม ไม่พัง
npx @warnyin/agents --global   → ไม่มีไฟล์ในโปรเจกต์ → /warnyin:init step 0 seed ให้ตอนเปิดโปรเจกต์
```

## 6. Persona

**ผู้ใช้ปลายทางที่เพิ่งติดตั้ง** — ต้องเห็นโครงว่า memory เขียนอะไรลงไป โดยไม่ต้องเปิด playbook อ่านก่อน; และ **ผู้ใช้เดิมที่ `--update`** — ต้องไม่โดนทับงาน ไม่เจอ error

## 7. Test-flow

> ไฟล์: `src/tests/installer.test.mjs` — **เพิ่มเคสใหม่เท่านั้น ห้ามแก้ assertion ของเคส 1-9 เดิม**
> reuse harness เดิม: `makeTempProject(t)` · `runCli(cwd,args)` · `ok(r,msg)` (assert `code===0` + surface stderr)
> **ห้าม `t.skip()` เด็ดขาด** — `src/scripts/check-test-count.mjs` fail เมื่อ `pass !== tests`
> **ไม่มี existence guard** — template 2 ใบเป็นของ task นี้ อยู่ใน worktree เดียวกัน → `runCli()` ได้ไฟล์จริงเสมอ → **assert ตรง ๆ** (guard ที่ไม่จำเป็น = เคส vacuous)

**M1 — `context.md` ที่ถูก seed มี 4 heading ครบ**
- [ ] `makeTempProject` → `ok(runCli(tmp), 'install')`
- [ ] อ่าน `path.join(tmp,'docs','stages','context.md')` (**target-side path ไม่มี prefix `src/`**) แล้ว assert `includes` ครบ 4: `## กำลังทำอะไรอยู่` · `## ค้างอะไร` · `## เพิ่งตัดสินอะไรไป` · `## อัปเดตล่าสุด` (วน array ของ heading + assertion message ระบุ heading ที่ขาด)
- [ ] assert เพิ่ม: ไฟล์ **ไม่ว่าง** (`length > 0`) — กัน false-green ถ้า seed ลงแต่ได้ไฟล์เปล่า

**M2 — `docs/memory.md` ถูก seed + มี legend closed-set**
- [ ] `makeTempProject` → `ok(runCli(tmp), 'install')`
- [ ] assert `existsSync(path.join(tmp,'docs','memory.md'))`
- [ ] เนื้อไฟล์มีครบ 3 ค่าสถานะ: `open` · `promoted` · `dropped` (legend closed-set)

**R1 — regression: `context.md` ว่างอยู่ก่อน → `--update` → ไม่ถูกทับ ไม่ crash (พฤติกรรมที่ตั้งใจ)**
- [ ] `makeTempProject` → `mkdirSync(path.join(tmp,'docs','stages'), {recursive:true})` → `writeFileSync(path.join(tmp,'docs','stages','context.md'), '')`
- [ ] `ok(runCli(tmp, ['--update']), 'update over empty context.md')` — ต้อง exit 0 ไม่ crash
- [ ] assert `readFileSync(...,'utf8') === ''` — seed **ไม่ทับ** ไฟล์ที่มีอยู่ (`existsSync` → skip) = พฤติกรรมที่ตั้งใจ; เคสไฟล์ว่างถูกแก้ที่ playbook (C13) ไม่ใช่ installer
- [ ] assert เสริม: `docs/memory.md` **ถูกสร้าง** ในรอบเดียวกัน — พิสูจน์ว่า seed ยังทำงาน (ไม่ใช่ผ่านเพราะ seed ไม่รันเลย = false-green)

**gate ระดับ suite**
- [ ] `npm test` — `pass === tests`, `fail === 0` (0 skip); `MIN_PASS=46` เป็น floor **ไม่ต้อง bump**
- [ ] **เคส 9 เดิม** (`ต้องสร้าง docs/stages/context.md`) ยังเขียว — ตอนนี้ผ่านทาง `seedDocs()` แทน `ensureScaffold()`
- [ ] `npm run lint:md` (init.md ไม่มี dead link; template ถูก EXCLUDE แต่ **สำเนาใน `docs/` ไม่ถูก** → 0 markdown-link ในต้นทางคือสิ่งที่กัน) · `npm run verify:pack` เขียว
