# Design (How) — Test ของ installer + GitHub Actions CI

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** · lens: `.warnyin/workflow/roles/sa.md`

## 1. ภาพรวมสถาปัตยกรรม
- **component ที่เกี่ยวข้อง:** `bin/cli.mjs` (target ที่ทดสอบ — ไม่แตะ), `package.json` (scripts/engines), `tests/` (ใหม่), `.github/workflows/` (ใหม่)
- **แนวทางหลัก:** black-box integration test — spawn CLI จริงด้วย `node:test` + `node:assert/strict` ในโฟลเดอร์ temp แล้ว assert จาก **side-effect จริง** (ไฟล์ที่ออกมา + exit code + stdout) ไม่ mock, ไม่ import logic ภายใน → robust ต่อการ refactor `cli.mjs`
- **zero-dependency:** ใช้เฉพาะ built-in (`node:test`, `node:assert`, `node:child_process`, `node:fs`, `node:os`, `node:path`) — คง `devDependencies` ว่าง

## 2. Vertical slices
> tooling repo — "คุณค่า end-to-end" = ผู้พัฒนารัน/CI รันแล้วได้ความมั่นใจจริง (ไม่ใช่ UI→API→data)

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **รัน `npm test` แล้วยืนยัน installer ถูกต้อง 4 พฤติกรรม** — local ก็รันได้ | test harness · spawn CLI · assert filesystem · package.json wiring | `tasks/installer-test-suite/` |
| 2 | **เปิด PR แล้ว CI เขียวอัตโนมัติ** + บันทึก CHANGELOG | GitHub Actions · matrix · `node --test` · pack-verify · `CHANGELOG.md` | `tasks/ci-pipeline/` |

## 3. Data model / schema
ไม่มี persistent data — แต่กำหนด **test fixture/harness contract**:
- `makeTempProject()` → คืน path temp dir ใหม่ (`fs.mkdtempSync(os.tmpdir()+'/wy-test-')`)
- `runCli(cwd, args=[])` → spawn `process.execPath` + `[cliPath, ...args]`, `{cwd}` → คืน `{code, stdout, stderr}`
- cleanup: `t.after(() => fs.rmSync(dir,{recursive,force}))` ทุกเคส (แม้ fail)
- `cliPath` = resolve จาก repo root (`new URL('../bin/cli.mjs', import.meta.url)`)

## 4. Interface / contract
**Behavior contract ที่ test ยึด** (verify ทุก row กับ `cli.mjs` จริง — รวม branch ที่ panel ชี้ว่าเปราะ)

> กฎร่วมทุกเคส: **assert `code===0` ก่อนเสมอ** แล้วค่อย assert ไฟล์ — ถ้า spawn fail ให้ surface `stderr` ใน assertion message (กัน false-positive "ไฟล์ไม่มี" บังสาเหตุจริง) · `runCli` คืน `{code, stdout, stderr}` แยก stream

| # | พฤติกรรม | input | assert |
|---|---|---|---|
| 1 | ติดตั้งสด | `runCli(tmp)` | `code===0`; มี `.warnyin/workflow/`, `.warnyin/template/`, `.claude/commands/warnyin/`, `docs/stages/`, seed `docs/project.md`, `CLAUDE.md`, `AGENTS.md` |
| 2 | idempotent | รัน 2 ครั้ง | ครั้งที่ 2 `code===0`; `stdout` มี "ข้าม"; ไฟล์ **byte-equal** กับรอบแรก (เทียบเนื้อหา ไม่ใช่ mtime — flaky ข้าม OS); `CLAUDE.md`/`AGENTS.md` ขนาดไม่โตขึ้น (ไม่ append ซ้ำ) |
| 3 | `--update` ไม่ทับงานจริง | ติดตั้ง → แก้ `docs/project.md` + เพิ่ม `docs/stages/demo/x.md` → `runCli(tmp,['--update'])` | `docs/project.md` ยังเป็นค่าที่แก้; `docs/stages/demo/x.md` ยังอยู่; `CLAUDE.md` ไม่ถูก append section ซ้ำ; `.warnyin/workflow/*` (CORE) ถูกเขียนทับได้ |
| 4 | `installRootDoc` append + heading | temp ที่มี `CLAUDE.md` เดิม (ไม่มี marker) → `runCli` | `code===0`; `CLAUDE.md` มี section `## Warnyin Standard Workflow` ต่อท้าย; รันซ้ำ → ไม่ append อีก (skip ผ่าน marker `cli.mjs:142`) |
| 5 | legacy 0.3–0.5.x | temp ที่มี `warnyin/workflow/` → `runCli` (ใช้ `--dry-run` ได้ เร็วกว่า) | **`stderr`** (เป็น `console.warn`) มี `พบโครงเลย์เอาต์เก่า (0.3–0.5.x)` + `git mv warnyin/stages docs/stages` (`cli.mjs:55,57`) |
| 6 | legacy ≤0.2.x | temp ที่มี `workflow/` + `warnyin-stages/` ที่ root → `runCli` | **`stderr`** มี `พบโครงเลย์เอาต์เก่า (≤0.2.x)` + `git mv warnyin-stages docs/stages` (`cli.mjs:43,45` — คนละ string จากเคส 5) |
| 7 | `seedDocs` ข้าม `[...]` | ติดตั้งสด | **ไม่มี** path ใต้ `docs/` ที่ชื่อขึ้นต้น `[` (negative — `cli.mjs:110` ข้าม `[topic]`/`[component]`) |
| 8 | `--dry-run` ไม่เขียนไฟล์ | `runCli(tmp,['--dry-run'])` ใน temp เปล่า | `code===0`; `stdout` มีรายการไฟล์ (`+ ...`); **filesystem ยังว่าง** (ไม่มี `.warnyin`/`docs`/`CLAUDE.md`) |

> **จงใจไม่ครอบ:** guard `pkgRoot === target` (`cli.mjs:35-38`) — เป็น dead branch ในมุม black-box (cwd=temp ต่างจาก pkgRoot เสมอ) ระบุไว้กัน reviewer รอบหน้าทักว่าลืม
> **ก่อนเขียน test:** verify `.warnyin/template/docs/project.md` มีจริง (ไม่อยู่ใต้ `[...]`) — กัน assert เคส 1 ตาม contract ที่ผิด

## 5. Flow
- **data-flow (test):** `node:test` → `runCli` spawn → `cli.mjs` อ่าน source จาก repo (`pkgRoot` จาก `import.meta.url`) เขียนลง `cwd=temp` → test อ่าน temp กลับมา assert → cleanup
- **CI-flow:** PR/push(main) → GitHub Actions → matrix `{20,22,24}` → checkout + setup-node → **`node --test tests/` ตรง ๆ (ไม่มี `npm ci`/`npm install`/cache)** → job แยก pack-verify

> **★ Blocker จาก panel (Tech Lead + Infra):** repo zero-dep **ไม่มี `package-lock.json`** → `npm ci` จะ fail ทันที (`npm ci can only install with an existing package-lock.json`) และ `cache: npm` ก็ต้องการ lockfile → **ห้ามใช้ทั้งคู่** ไม่มี dependency ให้ install อยู่แล้ว รัน `node --test` ตรง ๆ ได้เลย

**CI workflow contract (lock ใน `tasks/ci-pipeline/spec.md`):**
- `on: { pull_request:, push: { branches: [main] } }` — **ห้าม `pull_request_target`** (pwn-request: test รันโค้ดจาก PR)
- `permissions: { contents: read }` ที่ top-level (least-privilege)
- **ห้ามอ้าง `secrets.*` ใด ๆ** (ไม่มี publish/token ใน CI นี้ — `npm pack` ไม่ต้องใช้ credential)
- pin action ด้วย commit SHA + คอมเมนต์เวอร์ชัน (`actions/checkout@<sha> # v5`)
- **ไม่ตั้ง `cache: npm`** (ไม่มี lockfile + ไม่มี dependency)
- **pack-verify เป็น node script (cross-runner, 2 ทาง)** ไม่ใช่ shell grep: parse `npm pack --dry-run --json` แล้ว assert (a) มี path ขึ้นต้น `.warnyin/` **และ** (b) **ไม่มี** path ขึ้นต้น `tests/` หรือ `.github/` (allowlist พังเงียบได้ถ้ามีคนเติม entry)

## 6. ผลกระทบต่อระบบเดิม
- `package.json`: `+scripts.test`, `engines.node` `>=18`→`>=20` (node 18 EOL)
- **`CHANGELOG.md` ใหม่** — บันทึกขั้นต่ำของ topic นี้ (engines >=20 / drop node 18, +test/CI) ตาม decision panel; migration 0.6.0 เต็มรูปยังเป็น topic แยก (roadmap P0#3)
- เพิ่มโฟลเดอร์ `tests/` + `.github/` ที่ root — **ต้องเช็คว่าไม่ถูก publish** (`package.json` `files` เป็น allowlist อยู่แล้ว ไม่รวม `tests`/`.github` → ปลอดภัย แต่ task ต้อง verify ด้วย pack-verify §5)
- ไม่แตะ `bin/cli.mjs`, ไม่แตะ playbook/template

## 7. Dependency ระหว่าง slice/task
```
installer-test-suite ──▶ ci-pipeline
   (สร้าง npm test)        (CI เรียก npm test + เพิ่ม pack verify)
```
- `ci-pipeline` ต้องทำหลัง เพราะ workflow เรียก `npm test` ที่ task แรกสร้าง (ถ้าทำก่อน CI จะแดง)
- แตะไฟล์คนละชุด (`tests/`+`package.json` ↔ `.github/`) — ไม่ชนไฟล์ แต่มี logical dependency จึง **sequential**

## 8. Test strategy ระดับ design
- **ตัว test เอง = การทดสอบ** (นี่คืองาน) — ยืนยันความถูกของ test โดย: รัน `npm test` local บน Windows (เครื่อง dev) ให้เขียวก่อน แล้ว CI ยืนยันบน Linux/node อื่น
- **edge case ที่ต้องครอบ:** cross-platform path (Windows `\` vs Linux `/`), cleanup เมื่อ test fail, spawn ด้วย `process.execPath` (ไม่ hardcode `node`)
- รายละเอียดเคสอยู่ใน `tasks/installer-test-suite/spec.md` (test-flow)

---

## 9. Design review (panel — 2026-06-06)

fan-out 5 reviewer subagent (read-only): SA · Tech Lead · QA · Security · Infra

### Blocker (แก้แล้วครบ)
| # | ผู้พบ | blocker | การแก้ |
|---|---|---|---|
| B1 | Tech Lead + Infra | `npm ci`/`cache: npm` จะ fail เพราะ repo ไม่มี `package-lock.json` (zero-dep) | §5: ตัด `npm ci`/cache ทั้งหมด รัน `node --test tests/` ตรง ๆ |

### Security — ยกเป็น contract บังคับใน `tasks/ci-pipeline/spec.md` (ถ้าผิดพร้อมกัน = pwn-request)
- `permissions: { contents: read }` · `on: pull_request` (ห้าม `pull_request_target`) · ห้าม `secrets.*` · spawn array args (ไม่มี `shell: true`) · SHA-pin actions → บันทึกใน §5 แล้ว

### Suggestion ที่รับมา (integrate เข้า §4/§5)
- assert `code===0` ก่อน assert ไฟล์ + surface `stderr` (SA) · idempotent ใช้ byte-content + stdout "ข้าม" ไม่ใช่ mtime (SA) · legacy assert ที่ **`stderr`** (`console.warn`) (SA)
- เพิ่มเคสที่ขาด (QA): legacy 2 branch แยก (≤0.2.x / 0.3–0.5.x), `installRootDoc` append+marker idempotent, `seedDocs` ข้าม `[...]` (negative), `--dry-run` ไม่เขียนไฟล์
- `node --test tests/` ระบุ path (node 20 glob ยังไม่นิ่ง) (Infra) · pack-verify เป็น node script 2 ทาง (Infra) · CHANGELOG เขียนพร้อม topic นี้ (Infra → ถาม user → ตกลงทำขั้นต่ำ)

### Suggestion ที่บันทึกเหตุผล (ไม่ทำใน topic นี้)
- migration note 0.6.0 เต็มรูป → คงเป็น roadmap P0#3 แยก (topic นี้ทำ CHANGELOG ขั้นต่ำพอ)
- guard `pkgRoot===target` จงใจไม่ครอบใน test (dead branch ในมุม black-box) — ระบุใน §4

### ผ่านมุม panel
black-box + zero-dep + vertical slice 2 ก้อน + harness contract (`makeTempProject`/`runCli`/`t.after`) — SA/QA/Security ยืนยัน **ไม่มี blocker เชิงสถาปัตยกรรม**; dependency `installer-test-suite ▶ ci-pipeline` Tech Lead ยืนยันถูกต้อง
