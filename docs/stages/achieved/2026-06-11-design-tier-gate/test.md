# Test Plan — design-tier-gate (verify-lite)

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> **fast-track → verify-lite:** functional ตาม spec + test เขียว, ข้าม empirical/panel (skip-list)

| | |
|---|---|
| **Slug** | `design-tier-gate` |
| **Component** | `installer` (payload `.md` — playbook + template) |
| **จุดประสงค์** | DESIGN establish tier ก่อนเดิน (มั่นใจกำหนด/ไม่มั่นใจถาม options/hard-floor) + proposal vocab ตรง tier |

## 1. ขอบเขต (verify-lite)
- structural: design.md §4 step 1.5 + §7 tie + proposal vocab ตรง spec.md test-flow · correctness floor: test เขียว + lint + validate
- **ข้าม (fast-track):** empirical demo, review panel, install proof หนัก — ไม่เกี่ยวกับ wording change

## 2. ชนิดการเทส
- [x] Structural (grep section/string ตาม spec.md)
- [x] Regression (node --test + change-sizing feature spec ไม่พัง)
- [ ] ~~empirical/E2E/UXUI~~ — N/A (payload `.md`, fast-track)

## 3. Test cases
| # | เคส | ผลที่คาดหวัง |
|---|---|---|
| 1 | §4 มี step Establish tier | grep "Establish tier" = 1 |
| 2 | มั่นใจ→กำหนด | §4 ระบุ "มั่นใจ→กำหนด tier" |
| 3 | ไม่มั่นใจ→ถาม options | §4 ระบุ ถาม user (triage / user กำหนดเอง) |
| 4 | hard-floor บังคับ | §4 ระบุ hard-floor → ≥ standard |
| 5 | §7 tie | §7 ชี้ "established ที่ §4 step 1.5" |
| 6 | proposal vocab | `ขนาด` = fast/standard/large |
| 7 | tier=judgment | มี ⚠/judgment (ไม่ใช่ validator ✖) |

## 4. correctness floor (ยัง blocking ตาม fast-track)
- `node --test` เขียว · `lint:md` 0 · `validate-topic` ไม่มี ✖

## 5. วิธีรัน (reproducible)
```bash
grep -c "Establish tier" src/.warnyin/workflow/stages/design.md   # = 1
node --test && npm run lint:md && node .warnyin/workflow/scripts/validate-topic.mjs design-tier-gate
```
