# Test Plan — fix-setup-dogfood

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> ตอน **SHIP** จะ merge เข้า `docs/techstack/installer/test.md`
> อิง guideline: `docs/techstack/installer/test.md` §"dev tooling" + BL-4 testable (export + main-guard)

| | |
|---|---|
| **Slug** | `fix-setup-dogfood` |
| **Component** | `installer` (dev-tooling `src/scripts/setup-dogfood.mjs`) |
| **จุดประสงค์ที่ต้อง verify** | setup:dogfood refresh CORE ได้จริง (--update) + จับ false-green (verify side-effect) ไม่เชื่อ exit 0 |

## 1. ขอบเขตการเทส
- `verifyInstalled` เช็ค CORE markers ถูกต้อง (false/true/partial)
- `--update` ส่งทั้ง npx + node paths
- success-detection ผูก verifyInstalled (ไม่เชื่อ exit 0 อย่างเดียว)
- main-guard: import ไม่ trigger install
- regression: npm test suite ไม่พัง

## 2. ชนิดการเทส
- [x] Functional (unit `verifyInstalled` — behavior จริง)
- [ ] E2E smoke — N/A
- [x] Structural (grep --update/wire/main-guard)
- [ ] UX/UI — N/A

## 3. Local env
| Service | คำสั่งรัน | port / หมายเหตุ |
|---|---|---|
| ไม่มี service | `node --test src/tests/setup-dogfood.test.mjs` · `npm test` · `npm run lint:md` | zero-dep node ≥20 |

## 4. Test cases
| # | สถานการณ์ | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|---|
| V1 | verifyInstalled behavior | `node --test setup-dogfood.test.mjs` | false (เปล่า) / true (ครบ) / **false (partial)** — 3 เคสผ่าน |
| V2 | --update 2 paths | grep `'--update'` | npx (:51) + node (:125) |
| V3 | wire verify | grep `verifyInstalled(repoRoot)` | success-detection 2 จุด (:63 npx, :126 pack) |
| V4 | main-guard | grep argv[1]===fileURLToPath | import ไม่ trigger main (:175) |
| V5 | false-green guard | เคส partial→false | พิสูจน์ detection ทำงาน (ไม่เชื่อ exit 0) |
| V6 | regression | `npm test` + `lint:md` | 69/69 เขียว + lint ผ่าน |

## 5-6. E2E / UX/UI — N/A

## 7. วิธีรันเทส (reproducible)
```
cd <repo root>
node --test src/tests/setup-dogfood.test.mjs   # V1
npm test && npm run lint:md                      # V6
# V2-V5: grep structural บน src/scripts/setup-dogfood.mjs
```

> **defer (executable integration):** รัน `npm run setup:dogfood` จริง → root CORE = release version (spawn npx/npm + network) — manual proof ตอน release ถัดไป (ตามที่เพิ่งเจอใน topic discovery-mode-selector); unit `verifyInstalled` + structural ครอบ logic แล้ว
