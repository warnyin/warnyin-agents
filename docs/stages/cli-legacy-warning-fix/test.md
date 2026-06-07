# Test Plan — cli-legacy-warning-fix

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> guideline: `docs/techstack/installer/test.md` §executable migration proof (promote จาก topic `roadmap-sync-p0`)

| | |
|---|---|
| **Slug** | `cli-legacy-warning-fix` |
| **Component** | `installer` |
| **จุดประสงค์ที่ต้อง verify** | cli legacy warning บอกคำสั่งที่ทำงานจริงถูก (ตรง Migration guide robust) — ผู้ใช้ทำตาม warning แล้ว migrate สำเร็จไม่ซ้อน |

## 1. ขอบเขตการเทส
- คำสั่งใน cli warning (stderr) **execute ได้จริง** → migrate ไม่ซ้อน `docs/stages/stages/`, ไม่ warn ซ้ำ
- **3-way consistency:** คำสั่งใน `cli.mjs` = `CHANGELOG.md` Migration guide = `installer.test.mjs` assertion (invariant design §4)
- regression: `npm test` 18/18

## 2. ชนิดการเทส
- [x] Functional (test-flow ใน `tasks/fix-legacy-warning/spec.md`)
- [x] Behavioral: executable migration proof (`docs/techstack/installer/test.md`)
- [x] **3-way consistency check** (cli ↔ CHANGELOG ↔ test)
- [x] Regression (npm test)

## 3. Local env
| Service | คำสั่ง | หมายเหตุ |
|---|---|---|
| ไม่มี | — | temp dir (`mktemp -d`) เท่านั้น — ห้ามรัน cli ที่ cwd=repo root (troubleshooting #6) |

## 4. Test cases
| # | สถานการณ์ | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|---|
| V1 | migration 0.3–0.5.x (install-after) | จำลอง legacy → install → ทำตามคำสั่งจาก warning ใหม่ → assert | งานจริงอยู่ `docs/stages/mywork/`, ไม่ซ้อน, ไม่ warn ซ้ำ |
| V2 | migration ≤0.2.x (install-after) | เช่นเดียวกัน | เช่นเดียวกัน |
| V3 | 3-way consistency | extract คำสั่งจาก cli spawn / CHANGELOG / test → เทียบ | ตรงกันทั้ง 2 รุ่น |
| V4 | regression | `npm test` + `git diff main` | 18/18 pass; แตะเฉพาะ `cli.mjs` + `installer.test.mjs` |

## 7. วิธีรันเทส (reproducible)
```bash
# ดู build.md §3.5 (executable migration proof) + 3-way consistency script ใน verify.md
npm test
# 3-way: extract 'git mv .../* docs/stages/' จาก cli spawn (stderr), CHANGELOG.md, installer.test.mjs → ต้องตรงกัน
```
