# Test Plan — command `/warnyin:feedback:issue`

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> แผน/วิธีเทสของ topic นี้ — ตอน **SHIP** จะ merge เข้า `docs/techstack/installer/test.md`

| | |
|---|---|
| **Slug** | `feedback-issue-command` |
| **Component** | `installer` |
| **จุดประสงค์ที่ต้อง verify** | command `/warnyin:feedback:issue` (payload `.md` + nested adapter) ติดตั้งได้ + playbook flow ครบตามจุดประสงค์ (3 ประเภท + detect ladder + confirm gate + privacy) + registry/contract สอดคล้อง + ไม่ทำของเดิมพัง |

## 1. ขอบเขตการเทส
- payload `.md` ล้วน (playbook + command adapter) — **ไม่มี runtime จริง** → verify เชิงโครงสร้าง + executable install proof + observable behavior + consistency (แนว topic `discovery-mode-selector`/`skill-format` ใน `docs/techstack/installer/test.md`)
- **ไม่ยิง issue จริงขึ้น GitHub** (เลี่ยง side-effect public) — ตรวจว่า playbook ระบุ gh command/URL ประกอบถูกเชิงโครงสร้าง

## 2. ชนิดการเทส
- [x] Functional/structural (playbook ครอบ flow ตาม spec)
- [x] Executable install proof (`setup:sandbox`)
- [x] Consistency (contract §1.1 ↔ adapter ↔ registry)
- [x] Regression (command/registry เดิมไม่พัง — additive)
- [ ] E2E/UX-UI — N/A (ไม่ใช่ FE)

## 3. Local env
| Service | คำสั่งรัน | หมายเหตุ |
|---|---|---|
| ไม่มี service — payload `.md` | `npm test` / `npm run verify:pack` / `lint:md` / `setup:sandbox` | dev tooling ของ repo เอง |

## 4. Test cases
| # | สถานการณ์ (อิงจุดประสงค์) | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|---|
| T1 | unit suite ไม่ regress | `npm test` | 69/69 pass |
| T2 | payload ติด tarball | `npm run verify:pack` + `npm pack --dry-run \| grep feedback` | pack ผ่าน + `feedback.md` + `issue.md` ติด |
| T3 | dead-link | `npm run lint:md` | 0 dead |
| T4 | install proof | `npm run setup:sandbox` → ตรวจ target | target มี `.claude/commands/warnyin/feedback/issue.md` + `.warnyin/workflow/feedback.md` + CLAUDE.md/README registry · root dogfood ไม่โดนแตะ |
| T5 | frontmatter + pointer | อ่าน adapter | มี `description`+`argument-hint` + ชี้ `.warnyin/workflow/feedback.md` + `$ARGUMENTS` + confirm-gate note |
| T6 | consistency contract §1.1 | grep ค่าใน adapter/playbook/registry | description/path/repo ตรง contract; repo hardcode `warnyin/warnyin-agents` |
| T7 | command-only intent | `ls src/.claude/skills/ \| grep feedback` | ไม่มี skill feedback (action-utility = command user-only) |
| T8 | observable behavior (playbook flow) | grep keyword ใน `feedback.md` | ครบ: 3 ประเภท + prefix `[Bug]/[Feature]/[Improvement]` + `gh issue create` + `gh auth status` + `issues/new` + urlenc + confirm/preview + no-session-pull + best-effort label retry |
| T9 | regression additive | grep command list เดิม | feedback เพิ่มเข้า + command/utility เดิมครบ ไม่ถูกลบ |

## 5–6. E2E / UX-UI
- N/A (payload `.md` ไม่ใช่ FE)

## 7. วิธีรันเทส (reproducible)
```
npm test
npm run verify:pack && npm pack --dry-run 2>&1 | grep -i feedback
npm run lint:md
npm run setup:sandbox   # แล้วตรวจ target sandbox: feedback command/playbook/registry + root dogfood ไม่แตะ
# structural: grep frontmatter/flow keyword ใน src/.warnyin/workflow/feedback.md + adapter
```
