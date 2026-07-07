# Test plan — build-lean

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> component: `installer` — payload `.md` + workflow script + structural validator → ใช้ pattern จาก `docs/techstack/installer/test.md`: full-gate + executable install proof + canonical-consistency (คำต่อคำ) + behavioral fixture + negative-grep single-source
> regression baseline = union ของ `docs/features/{change-sizing, learning-loop-tuning, topic-validator, uxui-wireframe}/spec.md` (`build-orchestration` ยังไม่มี spec — scenario ใหม่มาจาก design §9 ADDED)

## Env

- local, branch `build/build-lean` (integrate ครบ + full gate BUILD เขียวแล้ว) — ไม่มี service ต้องรัน (payload `.md` + script zero-dep)
- executable proof ใช้ `npm run setup:sandbox` (temp target) — ห้ามรัน `cli.mjs` ที่ cwd=repo root (KB#6)
- verify ที่ `src/**` เสมอ (root dogfood = stale release — กัน false-green ตาม guideline)

## Cases

| # | ประเภท | เทสอะไร | วิธี / ผ่านเมื่อ |
|---|---|---|---|
| T1 | functional + regression | full gate 4 ตัว | `npm test \| check-test-count` (pass=tests, ≥9, fail=0) · `verify:pack` · `lint:md` — เขียวหมด |
| T2 | executable install proof | payload ใหม่ลง target จริง | `setup:sandbox` → target มี `template/stages/receipt.md` (นอก `[topic]/`), `workflow/loop-tuning.md`, triage/design/build/verify/ship + command ที่อัปเดต, CLAUDE.md registry ครอบ fast; ไม่มี topic leak; root dogfood ไม่โดนแตะ |
| T3 | canonical-copy (คำต่อคำ) | skip-list + wording block | ตาราง skip-list ใน `src/triage.md` = design §4.1 (diff เนื้อความว่าง) · wording block `build.md §4 ข้อ 6` = `verify.md §4 ข้อ 5` = design §4.5 (ยกเว้น indent) · §2C pointer เป็น md link → `loop-tuning.md` |
| T4 | single-source (negative-grep, falsifiable) | theory + default table + skip-list ไม่ duplicate | full why-block (credit horizon + ตัวเลือก ·/⚠) เจอเต็มเฉพาะ `loop-tuning.md` · ตาราง default-by-tier เจอเฉพาะ `triage.md` (ไม่อยู่ build/verify/loop-tuning) · ไม่มีตาราง skip-list inline ใน stage files · enum `per-finding \| batched` + "เหตุผล 1 บรรทัด" ยังอยู่ build.md+verify.md (regression learning-loop-tuning) |
| T5 | gate-count regression | checklist ไม่เปลี่ยนจำนวน | `build.md §7` = 7 `- [ ]` · `verify.md §6` = 7 · `ship.md §6` = 10 |
| T6 | template contract | receipt.md | ≤40 บรรทัด · บรรทัดแรกไม่ว่าง = H1 `# Receipt — <...>` (placeholder — contract กับ `isFilled`) · meta มี hard-floor row · มี §1-§5 ครบ |
| T7 | behavioral validator | fast/mixed/เดิม + dogfood self-validate | unit 121+ เคสใน T1 ครอบ fixture แล้ว; เพิ่ม executable กับ repo จริง: status mode → ตาราง topic เดิมไม่เปลี่ยน + `validate build-lean` ทำงาน; temp fixture fast topic → exit 0 + `fast-track` + ไม่มี ✖ |
| T8 | fast hooks (design §9 ADDED) | hook 3 stage + adapter | `build.md` §1 hook: code-first, ไม่ spawn/worktree, floor ครบ (full-gate + config-protection §3·12 + investigate §3·11 + ห้ามแตะ rule กลาง §3·6), md link skip-list · `verify.md` hook: เติม receipt §4, ไม่สร้าง test/verify.md, floor test เขียวจริง · `ship.md` hook: receipt §3/§5 + hard-floor 5 หมวด + upgrade §2B + archive · grep `★ fast-track hook` = 1/ไฟล์ · adapter 4 ตัว (design/build/verify/ship) มี fast path ชี้ playbook |
| T9 | worktree policy + prompt lean (design §9 ADDED) | build.md 2 mode + prompt() | `§3 ข้อ 3` + `§4 ข้อ 5` ครอบ wave ≥2 (worktree+checkout) และ wave เดี่ยว (isolate:false + orchestrator checkout build branch + agent ไม่ commit) · prompt() ไม่มี `stages/build.md`/`design.md`/`proposal.md` + มี role card + 4 ไฟล์ task + techstack rule.md (unit F-K ใน T1 = runtime proof) |
| T10 | UX-detect precedence (uxui-wireframe MODIFIED + regression) | exclusion ก่อน signals | `stages/design.md`: exclusion (docs/config/tooling ล้วน) เช็คก่อน signals + "เจอ → จบทันที" · regression: step 4.5 ตำแหน่งเดิม, approve gate, fallback lens, gate §8 N/A ยังครบ |
| T11 | caps (change-sizing MODIFIED) | `§2D` แยก anchor | fast receipt ≤40 บรรทัด · standard proposal ≤60 / design ≤120 · large judgment — อยู่ section แยกจาก skip-list · route §2A row fast = เวอร์ชันใหม่ (pre-flight receipt → code-first → verify-lite → ship-lite) |
| T12 | release hygiene | CHANGELOG ↔ version | `package.json` = 0.24.0 = หัว entry CHANGELOG · มี `[0.23.0]`/`[0.22.0]` ครบไม่ซ้ำ |
| T13 | next.md + stale mentions | fast-track row + ไม่มี mention ค้าง | `next.md` ตาราง stage-inference มี row receipt/fast-track · ไม่เหลือ "fast tier → 1 task เขียนเอง" ใน `stages/design.md`/command (โมเดลเก่า) |

## Regression mapping (baseline → case)

- change-sizing: rubric ครบ/hard-floor 5 หมวด/read-only adapter → T4, T8, T11 + T1 (ไม่มี test แตะ) · skip-list canonical + stage hook pointer → T3, T4, T8
- learning-loop-tuning: guidance block (MODIFIED → pointer) → T3, T4 · gate count → T5 · default table dedup → T4 · starting-artifact note (ไม่แตะ) → T10 ผ่าน grep design.md คงอยู่
- topic-validator: โหมดเดิมทุก scenario (C2/C3/exit codes/traversal) → unit ใน T1 + T7 dogfood
- uxui-wireframe: ทุก scenario เดิม → T10
