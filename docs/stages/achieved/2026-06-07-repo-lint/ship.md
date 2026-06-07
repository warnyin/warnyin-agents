# Ship Report — repo-lint (zero-dep dead-link gate)

> ส่งมอบ 2026-06-07 · archive ของ topic `repo-lint` (P2 #12 — ข้อสุดท้ายของ roadmap)

## 1. feature: ไม่มี (dev tooling)
dead-link gate = dev tooling (เหมือน verify-pack/check-test-count) → ไม่สร้าง `docs/features/`; บันทึกใน `docs/techstack/installer/` + rule + roadmap

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/rule.md` §2 | **L1** zero-dep lint-gate convention — lint/format = node:* script เอง (pure fn+main-guard+CI) ไม่ devDeps; testable + executable-verify |
| `docs/techstack/installer/structure.md` | +`lint-md.mjs` + `lint-md.test.mjs` ใน dev tooling + `checkLinks` helper |
| `docs/techstack/installer/test.md` | +lint-md 7 เคส; section "lint-md dead-link gate" (**L2** strip-code alternation + executable positive/negative verify + skip backtick runtime-ref); count 19→26 |
| `docs/troubleshooting.md` | **#12** strip-code alternation (L2); **#13** main-loop ตรวจ exit จริง ไม่เชื่อ sub-agent self-verify (L3) |
| `docs/roadmap.md` #12 | ✅ DONE + หมายเหตุเลือก dead-link แทน markdownlint/prettier (zero-dep) |
| `docs/codemap/{index,architecture}.md` | +lint-md ใน dev tooling + CI gate |

## 3. note "รอ SHIP" — พิจารณาครบ
- **zero-dep lint-gate convention** (task rule.md §2) → **promote** L1 (`rule.md` §2) ✅
- **strip-code-before-link-match** (task rule.md §2) → **promote** L2 (`installer/test.md` + troubleshooting #12) ✅

## 4. Learned-rule (dogfood #8 — user ยืนยัน per-rule)
| # | rule | evidence | scope | ปลายทาง |
|---|---|---|---|---|
| L1 | zero-dep lint-gate convention | task rule.md §2 + lint-md.mjs (devDeps ว่าง) | project | `rule.md` §2 |
| L2 | strip nested code = alternation pass เดียว | troubleshooting #1 + lint-md.mjs CODE_RE | component:installer | `installer/test.md` + troubleshooting #12 |
| L3 | main-loop ตรวจ exit จริง ไม่เชื่อ self-verify | build.md (examples + repo-lint, `\| tail` บัง exit) | project | troubleshooting #13 |

## 5. troubleshooting
- #12 (strip-code alternation) + #13 (self-verify false-green) — promote จาก topic troubleshooting #1 + build lesson

## 6. โค้ด/deliverable (merge นอก workflow)
- branch `build/repo-lint` (commit `a7f82ba` build + `cf99e8a` verify) → merge `main`
- **docs-only ของกลาง** (SHIP) แยกจาก code (build branch); **ไม่ bump version** — lint-md.mjs + test เป็น dev tooling (`src/scripts/`+`src/tests/`) ไม่ ship (denylist ครอบ); package.json scripts + ci.yml ไม่กระทบ payload behavior
- verify: lint:md 0 dead · executable positive (inject→จับ) · npm test 26/26 · zero-dep คง

## 7. ผลพลอยได้
- **dogfood gate ตัวเอง:** หลัง SHIP รัน `npm run lint:md` เช็คเอกสารกลางที่เพิ่ง promote ว่า dead-link 0
- ปิด **roadmap ครบทุกข้อ** (P0 #1–4, P1 #5–9, P2 #10 #12; #11 เลื่อน YAGNI)

## 8. สถานะ
✅ topic ปิดสมบูรณ์ — **roadmap เหลือแค่ #11 ที่เลื่อน (YAGNI)**; P0/P1/P2(ทำได้) ครบหมด
