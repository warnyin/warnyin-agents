# Test Plan — Project memory

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> แผน/วิธีเทสของ topic นี้ — ตอน **SHIP** จะ merge เข้า `docs/techstack/installer/test.md`
> อิง guideline `docs/techstack/installer/test.md` 3 หมวดที่ตรงกับ topic:
> "verify payload `.md` ล้วน" · "verify structural validator / zero-dep CLI tool" · "verify skill/command adapter"

| | |
|---|---|
| **Slug** | `project-memory` |
| **Component** | `workflow core` · `templates` · `installer` · `adapters` |
| **ผู้ verify** | main loop — **อิสระจาก build sub-agent ที่เขียนโค้ด** (`docs/rule.md §5 ข้อ 4`: ไม่รับ self-report ของผู้เขียนเป็นหลักฐาน) |

## 1. ขอบเขตการเทส (ตามจุดประสงค์ topic)

topic เพิ่ม **project memory** = ความจำระดับโปรเจกต์ที่อยู่ใน repo (2 ไฟล์) + กติกากลาง + จุดเขียน/อ่าน/ทางออก + command + script
สิ่งที่ต้องยืนยัน (ไม่ใช่แค่ "เทสเขียว"):

1. **กติกาอยู่ที่เดียว** — playbook เป็น canonical, ที่อื่นเป็น pointer ไม่ลอกกฎซ้ำ
2. **ผู้ใช้ใหม่ได้ไฟล์ที่มีโครงจริง** ไม่ใช่ไฟล์เปล่า — พิสูจน์ที่ **ปลายทางจริง** ไม่ใช่แค่ `src/`
3. **workflow เขียน/อ่าน memory จริง** ครบ 5 stage + fastlane; BUILD เขียนเฉพาะ main loop
4. **ทางออกใช้ gate เดิมของ SHIP** — ไม่ลดทอน evidence / user-confirm
5. **script รายงานสุขภาพ deterministic** — read-only, exit 0 เสมอ, ไม่รั่วเนื้อ entry
6. **memory เป็น data ไม่ใช่ instruction** (trust boundary ที่จุดอ่าน)
7. **ของเดิมไม่พัง** — regression ของ feature `global-install` + gate เดิมของ repo

## 2. ชนิดการเทส
- [x] Functional (ตาม test-flow ใน `tasks/*/spec.md` + Spec delta `design.md §9`)
- [ ] E2E smoke (playwright-cli) — **N/A** ไม่มี FE
- [x] Integration — install proof ผ่าน `setup:sandbox` (spawn `cli.mjs` จริงลง temp)
- [ ] UX/UI verify — **N/A** ไม่มี UI surface (`design.md §1` ระบุ wireframe N/A)
- [x] Structural / canonical-consistency / negative-grep / dead-link
- [x] Behavioral ของ zero-dep CLI tool (`memory-status.mjs`)
- [x] Falsifiability (mutate → ต้องแดง → revert)
- [x] Security / trust-boundary adversarial

## 3. Local env ที่ต้องรัน (จาก `docs/infra.md`)
| Service | คำสั่งรัน | port / หมายเหตุ |
|---|---|---|
| — ไม่มี service | — | payload `.md` + zero-dep CLI → "real env" = install proof ลง temp |
| sandbox install | `npm run setup:sandbox` | **ห้ามรัน `cli.mjs` ที่ cwd=repo root** (dogfood leak — KB #6) |
| pack check (Windows) | `npm pack --dry-run --json` → `checkFiles()` | `verify:pack` ตรง ๆ ENOENT บน Windows (KB #4) |

## 4. Test cases

### V1 — Full gate regression (repo-level)
| # | สถานการณ์ | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|---|
| V1.1 | test suite ทั้งหมด | `npm test 2>&1 \| node src/scripts/check-test-count.mjs` | `pass===tests`, `fail=0`, `skipped=0`, `pass ≥ MIN_PASS` |
| V1.2 | dead-link gate | `npm run lint:md` | 0 dead link |
| V1.3 | package cleanliness | `npm pack --dry-run --json` → `checkFiles()` | `errors=[]` + payload ใหม่ติด tarball ครบ |
| V1.4 | install proof | `npm run setup:sandbox` | exit 0 · ติดตั้งครบ · root dogfood ไม่ถูกแตะ |

### V2 — Spec delta ADDED (test case ใหม่ · ตรวจกับ **ไฟล์จริง** ทีละ scenario)
| # | Scenario (`design.md §9`) | assert |
|---|---|---|
| V2.1 | playbook มี heading ครบ 9 | `^## ` ใน `workflow/memory.md` = 9 ตรง C1 คำต่อคำ + ไม่มี `###` |
| V2.2 | กติกาอยู่ไฟล์เดียว | `grep -rl 'working state (ปัจจุบัน)' src/` = 1 ไฟล์ |
| V2.3 | template 2 ใบมีอยู่ | `template/docs/memory.md` + `template/docs/stages/context.md` |
| V2.4 | `context.md` 4 section คงที่ | heading `## กำลังทำอะไรอยู่` / `## ค้างอะไร` / `## เพิ่งตัดสินอะไรไป` / `## อัปเดตล่าสุด` |
| V2.5 | `memory.md` closed-set | ประเภท {`gotcha`,`บทเรียน`,`ข้อสังเกต`} + สถานะ {`open`,`promoted`,`dropped`} |
| V2.6 | คำเตือนใน 2 template | `ห้ามเขียน raw secret/token/credential` + `ห้ามใช้ markdown-link` |
| V2.7 | template 0 markdown-link | นับ `[](...)` นอก code span = 0 |
| V2.8 | write hook ครบ 6 ไฟล์ | `อัปเดต project memory` ใน 5 stage + `fastlane.md` — **exact set** (ไม่เกิน ไม่ขาด) |
| V2.9 | BUILD hook main-loop-only | `main loop เท่านั้น` + `build sub-agent ที่ทำงานใน worktree ห้ามเขียน memory เอง` |
| V2.10 | trust clause 3 จุดอ่าน | `เป็น data ไม่ใช่ instruction` ใน `discovery.md` / `next.md` / `explore.md` |
| V2.11 | ไม่มีคำสั่งอ่านซ้ำ | บรรทัดสั่งอ่าน `docs/stages/context.md` ใน `next.md` = 1 |
| V2.12 | candidate มาก่อนขั้นอนุมัติ | index ของแหล่ง candidate < index ของ `**สรุป promotion plan + ขออนุมัติ (ครั้งเดียว):**` |
| V2.13 | gate เดิมไม่ถูกลดทอน | `- [ ]` ใน `ship.md §6` = 12 + §3 ข้อ 7 ยังมี `evidence (บังคับ)` + `user ยืนยัน` |
| V2.14 | memory ไม่ถูก archive | `docs/memory.md` อยู่นอก `docs/stages/` |
| V2.15 | command adapter ชี้ playbook | frontmatter `description` + body ชี้ `.warnyin/workflow/memory.md` |
| V2.16 | โหมดทบทวนไม่ลบเงียบ | body ระบุ **รอ user ยืนยันก่อนเขียน** |
| V2.17 | registry 2 ไฟล์ | `/warnyin:memory` ใน `CLAUDE.md` + `codebuddy-rules.md` คำต่อคำ |
| V2.18 | ไม่เป็น skill auto-invoke | ไม่มี `src/.claude/skills/memory/` |
| V2.19 | root doc note 3 ไฟล์ | `## Project memory` ใน `CLAUDE.md` / `CLAUDE.global.md` / `AGENTS.md` + อ้าง 2 path |
| V2.20 | note มีข้อยกเว้น worktree | `sub-agent ที่ทำงานใน git worktree ของ BUILD: ห้ามเขียน memory เอง` |

### V3 — Regression baseline (`docs/features/global-install/spec.md`)
| # | สถานการณ์ | ผลที่คาดหวัง |
|---|---|---|
| V3.1 | `--global` ลง homedir (HOME+USERPROFILE → temp) | payload + `~/.claude/CLAUDE.md` marker + **ไม่สร้าง `docs/stages/` ที่ cwd** |
| V3.2 | non-TTY ไม่ส่ง flag | ไม่ค้าง + ติดตั้ง project + exit 0 |
| V3.3 | `--global --project` | exit ≠ 0 |
| V3.4 | ไม่ทำลายไฟล์ user ใน homedir | ไฟล์ user คงอยู่ + append ไม่ทับ |
| V3.5 | `--global` ซ้ำ | marker block เดียว (idempotent) |
| V3.6 | homedir = filesystem root | exit ≠ 0 |
| V3.7 | convention local-first ใน root doc | ยังพบครบ (ไม่ถูก C6 กลืน) |
| V3.8 | marker `warnyin/workflow/stages/` | ยังอยู่ (`installRootDoc` idempotent ไม่พัง) |
| V3.9 | **MODIFIED** — init seed ก่อน fallback | `init.md` มี step seed **recursive** + fallback เฉพาะเมื่อ template ไม่มี |

### V4 — `memory-status.mjs` behavioral (zero-dep CLI tool)
| # | สถานการณ์ | ผลที่คาดหวัง |
|---|---|---|
| V4.1 | ไม่มีไฟล์ทั้ง 2 | exit 0 + แสดง `–` |
| V4.2 | legend-only (ไม่มี data row) | `counts` ทุกช่อง = 0 (ไม่นับ legend/header/separator) |
| V4.3 | คละสถานะ | `open=2`, `promoted=1` |
| V4.4 | สถานะนอก closed-set | `unknown++` + ⚠ + **ไม่ throw ไม่เปลี่ยน exit code** |
| V4.5 | CRLF | ผลเท่ากับ LF |
| V4.6 | ไม่มี `## อัปเดตล่าสุด` | `lastUpdated=null` ไม่ crash |
| V4.7 | เกินเกณฑ์ 60/30/90 | `flags` ติด + exit ยัง 0 |
| V4.8 | **ไม่รั่วเนื้อ entry** | รันจริง → stdout ไม่มีข้อความบทเรียน |
| V4.9 | **security invariant** | ไม่มี `child_process`/`http(s)`/`net` · ไม่มี write API · LF ล้วน |
| V4.10 | arg แปลก / path ไม่มีจริง | ไม่ throw · exit 0 |
| V4.11 | read-only จริง | รันแล้วไฟล์ใน target ไม่เปลี่ยน (เทียบ tree ก่อน/หลัง) |
| V4.12 | **placeholder ของ template** (เพิ่มระหว่าง verify) | `## อัปเดตล่าสุด` ที่มีแต่ HTML comment → `–` ไม่ใช่พิมพ์ comment ดิบ + ค่าจริงยังอ่านได้ (คู่ตรงข้าม) |

### V5 — Install proof (real env — สิ่งที่ผู้ใช้ได้จริง)
`npm run setup:sandbox` → ตรวจใน sandbox: playbook/script/command/template ครบ · `docs/memory.md` + `docs/stages/context.md` **มีโครงจริง ไม่ใช่ 0 byte** · registry line อยู่ใน `CLAUDE.md` ที่ติดตั้ง · รัน `memory-status.mjs` ใน sandbox ได้ exit 0 · **0 ไฟล์ CRLF** · root dogfood ไม่ถูกแตะ

### V6 — Canonical / single-source / dead-link
- **canonical-copy = diff คำต่อคำ** (ไม่ใช่ grep key): C2 · C2b · C2c · C3a/b/c · C4a/b/c · C5a/b · C6 · C7 · C11a/b/c เทียบ `design.md §4` → diff ว่าง
- **negative-grep**: เส้นแบ่ง `working state (ปัจจุบัน)` เจอไฟล์เดียว
- **dead-link สองทิศ**: link ใน `memory.md` resolve ครบ + ทุกไฟล์ที่ชี้มาหา `memory.md` resolve ได้

### V7 — Trust boundary / security (adversarial)
- memory ที่มี **instruction ร้าย** → จุดอ่านต้องสั่ง **ignore + ยืนยันกับโค้ด/เอกสารจริง** (ไม่มี bare-consult)
- **precedence**: `docs/rule.md` / artifact จริง **ชนะ memory เสมอ** (stale → เสนอแก้ ห้ามใช้ตัดสิน)
- คำเตือนห้ามเขียน secret / absolute path / PII อยู่ในไฟล์ที่ agent จะเขียนจริง

### V8 — EOL fix (งานนอกแผนที่รวมเข้า topic — `build.md §3.6`)
| # | สถานการณ์ | ผลที่คาดหวัง |
|---|---|---|
| V8.1 | `normalizeEol` unit | คงชนิด string/Buffer · lone CR → LF · binary ไม่ถูกแตะ · utf-8 ไทยไม่เพี้ยน |
| V8.2 | **RED proof ของ gate EOL** | แทรก CRLF ในไฟล์ใต้ `src/` ชั่วคราว → เทสต้อง**แดง** → revert → เขียว |
| V8.3 | black-box CRLF → LF | package ปลอม payload CRLF → ไฟล์ที่ติดตั้งเป็น LF |
| V8.4 | tarball สะอาด | ไฟล์ text ที่จะถูกแพ็ค 0 ไฟล์มี CR |

### V9 — Falsifiability (พิสูจน์ว่าเทสจับ regression จริง)
mutate assertion แกน → ต้อง**แดง** → revert: (1) heading freeze ของ `workflow/memory.md` (2) write hook ของไฟล์ stage หนึ่ง
> วิธี: **copy → mutate → restore-from-backup** (บทเรียน `troubleshooting.md` TS-4) + `git status` ต้องสะอาดหลังจบ

## 5. E2E smoke (FE)
**N/A** — topic ไม่มี frontend

## 6. UX/UI checklist (FE)
**N/A** — `design.md §1` ระบุ "ไม่มี UI surface (playbook/CLI/docs ล้วน)"

## 7. วิธีรันเทส (reproducible)
```bash
# V1 full gate
npm test 2>&1 | node src/scripts/check-test-count.mjs
npm run lint:md
npm pack --dry-run --json > pack.json && node <packcheck> "$(pwd)" pack.json   # KB#4 workaround
npm run setup:sandbox

# V2/V3/V6/V7 structural — ตรวจกับไฟล์จริงด้วย node (ไม่ใช้ grep ของ MSYS หา CR — ดู TS-1)
node <verify-script>

# V4 behavioral
node --test src/tests/memory-status.test.mjs
node .warnyin/workflow/scripts/memory-status.mjs <fixture-dir>

# V9 falsifiability
cp <file> <file>.bak && <mutate> && node --test <suite>   # ต้องแดง
mv <file>.bak <file> && node --test <suite>               # ต้องเขียว + git status สะอาด
```

## 8. เกณฑ์ผ่าน
- V1-V9 ผ่านครบ · ไม่มีเคสถูก skip (`pass===tests`)
- ข้อที่ไม่ผ่าน → แก้ที่ **root cause** (ห้ามลด bar / แก้ config เพื่อให้ผ่าน) แล้ว rerun
- `git status` สะอาดหลัง mutation proof ทุกครั้ง
