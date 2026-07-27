# Build Report — Project memory

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`
> รายงานผลการ implement ต่อ task + การ integrate

| | |
|---|---|
| **Slug** | `project-memory` |
| **Build branch** | `build/project-memory` (fork จาก `main` @ `3d5e5d2`) |
| **Isolation** | `worktree` |
| **วันที่** | `2026-07-27` |
| **ผลรวม** | ผ่าน 6 / ล้ม 0 / ทั้งหมด 6 task |

## 1. Execution plan (waves ตาม dependency)
```
wave 1 (parallel 5 — file ownership disjoint ตาม design §7)
  ├── memory-playbook          (T1)  tier deepest  → opus
  ├── stage-wiring             (T2)  balanced      → sonnet
  ├── installer-seed           (T3)  balanced      → sonnet
  ├── memory-command-adapter   (T4)  balanced      → sonnet
  └── memory-status-script     (T5)  balanced      → sonnet
                    ▼
wave 2
  └── release-hygiene          (T6)  balanced      → sonnet
```
> tier→รุ่นจริง map ที่ adapter ของ harness นี้: `deepest → opus` · `balanced → sonnet`
> (ชื่อรุ่นที่เขียนไว้เดิมใน command เป็นรุ่นเก่าที่ harness ปัจจุบันไม่รู้จัก — orchestrator map เป็น alias ที่ใช้ได้จริง)

## 2. ผลต่อ task
| Wave | Task | สถานะ | Test/Lint | ไฟล์ที่แก้ | Branch | หมายเหตุ |
|---|---|---|---|---|---|---|
| 1 | `memory-playbook` (T1) | ✅ passed | self-check 42/42 · `npm test` เขียว · `lint:md` เขียว | `workflow/memory.md` (ใหม่ 191 บรรทัด) · `workflow/README.md` | `worktree-wf_6633c8a1-b60-1` | heading freeze 9/9 ตรง C1 คำต่อคำ · registry C11a/b/c indent 4/6/2 · เลี่ยง compound-needle ของ T6 โดยตั้งใจ (ดู TS-3) |
| 1 | `stage-wiring` (T2) | ✅ passed | self-verify 13 จุดตาม spec §7 (W1-W4/R1-R4/S1-S4/N1-N2) | `stages/{discovery,design,build,verify,ship}.md` · `next.md` · `explore.md` · `fastlane.md` | `worktree-wf_6633c8a1-b60-2` | copy คำต่อคำจาก contract §4 ทุกจุด · SHIP gate = 12 item · ordering proxy ผ่าน |
| 1 | `installer-seed` (T3) | ✅ passed | `npm test` เขียว (installer เคสใหม่ + เคส 1-9 เดิมไม่ถูกแก้) | `template/docs/memory.md` · `template/docs/stages/context.md` · `bin/cli.mjs` · `workflow/init.md` · `tests/installer.test.mjs` | `worktree-wf_6633c8a1-b60-3` | ถอด `context.md` ออกจาก `SCAFFOLD_FILES` → มาจาก `seedDocs()` แทน |
| 1 | `memory-command-adapter` (T4) | ✅ passed | grep assert ครบทุก needle | `commands/warnyin/memory.md` (ใหม่) · `installer/templates/{CLAUDE.md,CLAUDE.global.md,codebuddy-rules.md}` · `src/AGENTS.md` | `worktree-wf_6633c8a1-b60-4` | C6 ครบ 3 root doc · C7 ครบ 2 registry · ไม่ทำเป็น skill (คงเป็น command) |
| 1 | `memory-status-script` (T5) | ✅ passed | unit 16/16 + spawn จริง exit 0 · falsifiability พิสูจน์แล้ว | `workflow/scripts/memory-status.mjs` (ใหม่) · `tests/memory-status.test.mjs` (ใหม่) | `worktree-wf_6633c8a1-b60-5` | parse contract ครบ (legend-only → 0 · CRLF · unknown · flags) · ไม่พิมพ์เนื้อ entry |
| 2 | `release-hygiene` (T6) | ✅ passed | `npm test` 192/192 · `lint:md` เขียว · pack assert เขียว · `setup:sandbox` ผ่าน | `tests/memory.test.mjs` (ใหม่ 21 เคส) · `scripts/verify-pack.mjs` · `tests/verify-pack.test.mjs` · `scripts/check-test-count.mjs` · `CHANGELOG.md` | `worktree-wf_191df3a5-653-1` | ปิด gate ลวงของ `verify:pack` (assert template ติด tarball) · `MIN_PASS` 46→180 |

## 3. Integration notes
- **ไม่มี conflict เลย** — file ownership ของ design §7 disjoint จริง; integrate ด้วย `git checkout <branch> -- <ไฟล์ source ที่ scoped>` ต่อ branch (ไม่ checkout ทั้ง tree เพื่อเลี่ยง topic-docs copy ที่ agent merge เข้า worktree)
- ทุก agent ยืนยัน step 0 (`git merge build/project-memory`) เป็น **fast-forward** และเห็น `task.md` ของตัวเองจริงหลัง merge (hard-stop gate ไม่ทำงาน = sync สำเร็จ)
- commit: `fe27c98` (wave 1) → `b2b482a` (wave 2) → `882e7a4` (fix EOL ของ installer — ดู §3.6)
- gate ระหว่างทาง: หลัง wave 1 integrate → `npm test` **170/170** เขียว; หลัง wave 2 integrate → **192/192** เขียว

## 3.5 Full build & test gate (หลัง integrate ทุก wave)
> รันบน `build/project-memory` ที่ integrate ครบแล้ว

| Component | Build | Unit test | Test อื่น | รอบที่แก้ |
|---|---|---|---|---|
| `workflow core` (playbook + script) | N/A (ไม่มี build step) | รวมใน suite | `lint:md` ✅ 170 ไฟล์ 109 ลิงก์ · 0 dead link | 0 |
| `installer` (`src/bin/cli.mjs`) | N/A | ✅ รวมใน suite | `verify:pack` ✅ (107 ไฟล์, errors=[]) · install-proof `setup:sandbox` ✅ | 1 (fix EOL — ดู §3.6) |
| `templates` | N/A | ✅ seed จริงใน sandbox | ✅ | 0 |
| **รวมทั้ง repo** | — | **`npm test` = tests 195 · pass 195 · fail 0 · skipped 0** | **pass-count gate OK** (`pass===tests`, `pass ≥ MIN_PASS 180`) | — |

**install-proof (ตรวจไฟล์จริงที่ผู้ใช้ได้ ไม่ใช่แค่ `src/`):**
```
sandbox: C:\Users\...\Temp\wy-sandbox-ycBRuL   (npm run setup:sandbox → สร้างใหม่ 126 ไฟล์)
  docs/stages/context.md      711 bytes · heading ครบ 4 section
  docs/memory.md              683 bytes · closed-set {open,promoted,dropped} ครบ
  .warnyin/workflow/memory.md            ✓ ติดตั้ง
  .warnyin/workflow/scripts/memory-status.mjs ✓ ติดตั้ง
  node .../memory-status.mjs <sandbox>   → exit 0 · "open 0 · promoted 0 · dropped 0 · unknown 0"
                                            (พิสูจน์ legend ไม่ถูกนับเป็น entry — parse contract C10 ถูกต้อง)
  ไฟล์ text ที่ติดตั้งทั้งหมด: CRLF 0 ไฟล์ ✓
```
> หมายเหตุ `verify:pack`: `npm run verify:pack` บน Windows dev shell ล้ม `ENOENT spawn npm` — เป็นข้อจำกัดของ env ที่บันทึกไว้แล้วใน `docs/troubleshooting.md #4` ไม่ใช่ปัญหาของโค้ด; ใช้ workaround ที่ KB แนะนำ (รัน `npm pack --dry-run --json` แล้วป้อน file list เข้า `checkFiles()` ตรง) → `errors=[]` กับ tarball จริง + unit negative ใน `verify-pack.test.mjs` ยืนยันว่า assertion จับได้จริง

## 3.6 งานนอกแผนที่ทำเพิ่ม (user สั่งให้รวมเข้า topic นี้)
**บั๊ก:** `Workflow` ปัดตก `build-wave.mjs` ด้วย `script contains control characters` → BUILD เริ่มไม่ได้เลย (เจอซ้ำ)

- **ต้นเหตุจริง 2 ชั้น:** (1) `.gitattributes` (`* eol=lf`) ไม่ renormalize working tree ที่ checkout ไปแล้ว — วัดจริง `git ls-files --eol` = `i/lf w/crlf` **812 ไฟล์** (2) `npm pack` แพ็คจาก **working tree** → tarball CRLF → `copyFileSync` ลอกลง target ตรง ๆ
- **แก้:** normalize root dogfood ทันที (84 ไฟล์) → renormalize working tree ทั้ง repo (`git rm --cached -r . && git reset --hard` → 889 ไฟล์เป็น `i/lf w/lf`, `git status` สะอาด) → **แก้ถาวรที่จุดเขียน**: `export function normalizeEol()` ใน `cli.mjs` ใช้ทุกจุดที่เขียนเนื้อจาก package ลง target
- **เทสที่เพิ่ม (3 เคส, 192 → 195):** `EOL3` unit ของ `normalizeEol` (string/Buffer · lone CR · utf-8 ไทย · binary ไม่แตะ) · `EOL4` ไฟล์ text ทุกนามสกุลใต้ `src/` ไม่มี CR (เดิมครอบแค่ `.mjs` — จุดที่ทำให้ gate เดิมเขียวทั้งที่ repo เป็น CRLF) · `EOLI` black-box ประกอบ package ปลอมที่ payload เป็น CRLF → ยืนยันไฟล์ที่ติดตั้งเป็น LF
- **ไฟล์ที่แตะ:** `src/bin/cli.mjs` · `src/tests/eol.test.mjs` · `src/tests/installer.test.mjs` · `CHANGELOG.md` (section `Fixed`)
- รายละเอียดเต็ม: `./troubleshooting.md` **TS-1**

## 4. ปัญหา/ค้าง (ถ้ามี)
- ไม่มี task ล้ม · ไม่มี conflict ค้าง · ไม่มี gate แดงค้าง
- **ข้อจำกัดของ env (ไม่ block):** `npm run verify:pack` รันตรงบน Windows ไม่ได้ (KB #4) — ยืนยัน logic ด้วย workaround + unit แทน; ควรได้รับการยืนยันอีกครั้งบน CI ubuntu ตอน VERIFY/SHIP
- **defer ที่ยัง track ต่อ:** รายการใน `tasks/*/issue.md` ของแต่ละ task (T1 7 · T2 8 · T4 3 · T5 7) — ไม่มีข้อใด block VERIFY

## 5. Rule/standard ใหม่ที่ note ไว้ (รอ SHIP)
> รวบรวมจาก `tasks/<task>/rule.md` และ `standard.md` — รอ SHIP อัปเดตไฟล์กลางใน `docs/`
- rule candidate ทั้งหมดถูก pre-populate ไว้ตั้งแต่ DESIGN ใน `tasks/*/rule.md §2` — **BUILD ไม่แตะไฟล์กลางใน `docs/` เลย** (ยืนยันจาก `git status` ของทุก worktree)
- **candidate ที่เกิดใหม่ระหว่าง BUILD (เสนอ SHIP พิจารณา):**
  - **payload ที่ generate/ติดตั้งลงเครื่องผู้ใช้ ต้องถูกคุมที่ "จุดเขียน" ไม่ใช่แค่ "จุด commit"** — gate ที่สแกนเฉพาะ source จะเขียวลวงเมื่อ artifact ที่ runtime ใช้จริงมาจากอีก layer (หลักฐาน: TS-1)
  - **compound-needle ที่ assert exact-set ของไฟล์ ต้องมี constraint ผูกที่ task เจ้าของไฟล์ canonical ด้วย** (หลักฐาน: TS-3)

## 6. ปัญหายาก/ซ้ำที่เจอ
> บันทึกละเอียดที่ `./troubleshooting.md` (SHIP ยกขึ้น `docs/troubleshooting.md`)
- **TS-1** Workflow ปัดตก build-wave เพราะ root dogfood/working tree เป็น CRLF (แก้ถาวรแล้ว)
- **TS-2** heading-freeze แดงเพราะ regex `^##` ของ task อื่นจับ `###` ติดมา
- **TS-3** compound-needle ข้าม slice ทำให้ไฟล์ canonical กลายเป็น false positive
- **TS-4** falsifiability check ต้องเป็น manual mutate-run-revert ไม่ใช่เคสถาวรในสวีท

## ✅ Gate → VERIFY (ดู `.warnyin/workflow/stages/build.md` ข้อ 7)
- [x] ทุก task implement + merge เข้า build branch แล้ว (6/6)
- [x] ทุก task `passed` (test/build เขียว) ไม่มี `failed` ค้าง
- [x] ไม่มี merge conflict ค้าง
- [x] Full build ของทุก component ผ่าน (ไม่มี build error — repo นี้ไม่มี build step, ใช้ lint/pack แทน)
- [x] test suite ทั้งหมด (รวม unit test) เขียวหมดบน build branch — **195/195, fail 0, skipped 0**
- [x] build.md สรุปครบทุก task + ผล full build/test
- [x] ไม่แตะ rule/standard กลางใน `docs/`
