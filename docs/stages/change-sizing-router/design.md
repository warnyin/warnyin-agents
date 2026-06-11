# Design (How) — change-sizing-router

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** · lens `sa.md`
> ★ ไฟล์นี้ **canonical** (rule `canonical-copy`): นิยาม §3 (rubric) ถูก copy ไปไฟล์จริงโดยแต่ละ slice — ห้ามแต่งใหม่ต่อไฟล์

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` (playbook กลาง `.md` + command adapter) — แก้ที่ `src/` แล้ว sync root dogfood
- **แนวทาง:** triage = **utility router** (pattern เดียวกับ `next.md`/`explore.md`): playbook `.warnyin/workflow/triage.md` (canonical, ทุก harness อ่าน) + command adapter บาง (`.claude/`) + register ใน `README.md` ; reframe `design.md §7` ให้ชี้ canonical rubric (unify ที่เดียว ไม่ duplicate ลงทุก stage)
- **dogfood:** topic นี้เอง = ขนาด **standard** ตาม rubric ที่กำลังสร้าง; แตก 3 slice **file-ownership disjoint** → ขนาน wave เดียว (พิสูจน์ build-orchestration toolkit อีกครั้ง)

## 2. Vertical slices
> หนึ่ง slice = หน่วยคุณค่า end-to-end · จัดแบบ **file-ownership disjoint** (ไม่มี task แตะไฟล์เดียวกัน → parallel ปลอด conflict)

| # | Task | ส่งมอบคุณค่า | ไฟล์ที่เป็นเจ้าของ (disjoint) | Model tier | wave |
|---|---|---|---|---|---|
| 1 | **triage-playbook** | สมองของ triage — rubric ครบ (3-tier + signals + hard-floor + escalation + route + fast-track skip-list canonical) | `src/.warnyin/workflow/triage.md` (ใหม่) | `deepest` | 1 |
| 2 | **triage-command** | surface + ปรากฏใน command list ของผู้ใช้ — adapter `/warnyin:triage` (read-only) **+ register slash-command** | `src/.claude/commands/warnyin/triage.md` (ใหม่), `src/.warnyin/installer/templates/CLAUDE.md` (เพิ่มบรรทัด list) | `cheap` | 1 |
| 3 | **playbook-wiring** | reframe `design.md §7` 3-tier (ชี้ canonical) + **fast-track hook ใน verify.md + ship.md** (panel SA-B1) + register capability ใน workflow README | `src/.warnyin/workflow/stages/design.md`, `src/.warnyin/workflow/stages/verify.md`, `src/.warnyin/workflow/stages/ship.md`, `src/.warnyin/workflow/README.md` | `balanced` | 1 |

> **disjoint ตรวจแล้ว (panel TL-B1):** triage.md→T1 · command/triage.md + installer/templates/CLAUDE.md→T2 · design.md+verify.md+ship.md+workflow/README.md→T3 — ไม่ทับกัน
> **register แยก 2 จุดคนละ slice (TL-B1):** slash-command list ที่ผู้ใช้เห็น (`installer/templates/CLAUDE.md`) = T2 (ไปกับ command); capability tree ใน `workflow/README.md` = T3 (ไปกับ playbook wiring) — root dogfood `CLAUDE.md` gitignored → release sync ไม่ต้องแตะใน BUILD
> **fast-track ครบ 4 stage (SA-B1):** DESIGN hook = §7 (T3) · VERIFY/SHIP hook = pointer สั้นใน verify.md/ship.md ชี้ skip-list canonical §3C (T3) — เหมือน api-doc.md hook ทุก stage ที่แตะ; rubric เต็มอยู่ triage.md เดียว (ไม่ duplicate)
> **ทำไมขนานได้ (contract-first decouple, toolkit 3A ข้อ 1):** T2/T3 อ้าง **contract** = "มีไฟล์ `.warnyin/workflow/triage.md` ที่ถือ canonical rubric" ซึ่งตกลงใน design นี้แล้ว (§3) — ไม่พึ่ง runtime output ของ T1; dead-link/integration พิสูจน์ที่ **full-gate** (lint:md). critical-path depth = 1, wave width = 3

## 3. Canonical definitions (★ slice copy จากที่นี่)

### 3A. Tier taxonomy (3 ระดับ 1 มิติ) → ใส่ `triage.md`
| tier | ตัวอย่าง | route ที่แนะนำ |
|---|---|---|
| **fast** | bugfix, typo, config tweak, แก้/เพิ่ม wording-guidance สั้น, 1-2 ไฟล์, modify ของเดิม ไม่ cross-cutting | `/warnyin:design` แบบ **fast-track** (skip-list §3C) → build → verify-lite → ship-lite |
| **standard** | feature ใหม่ขนาดปกติ, modify หลายไฟล์/หลาย component, มี logic ใหม่ | flow เต็มปัจจุบัน (`design` → build → verify → ship) |
| **large** | greenfield/project ใหม่, cross-cutting หลาย component, mega | **บังคับ `/warnyin:discovery` ก่อน** → design → ... (decompose เต็ม = future) |

### 3B. Signals + Hard-floor + Escalation (judgment heuristic ⚠ ไม่ใช่ ✖) → ใส่ `triage.md`
- **signals ประเมิน tier:** #ไฟล์/#component ที่แตะ · new-vs-modify · greenfield · มี logic/algorithm ใหม่ · dep ใหม่ · UI/ผู้ใช้กระทบ
- **★ tie-break ก้ำกึ่ง → ปัดขึ้น (fail-safe; panel QA-S4):** signals เป็น judgment ไม่มี threshold ตายตัว — เคสก้ำกึ่ง fast/standard → **เลือก standard** (ปรัชญาเดียวกับ hard-floor: ระวังไว้ก่อน) เพื่อให้พฤติกรรมก้ำกึ่ง consistent ไม่สุ่ม
- **★ Hard-floor — บังคับ ≥ standard เสมอ (ไม่ว่าดูเล็กแค่ไหน):** แตะ **(1) auth/authz · (2) data migration/schema · (3) secret/credential · (4) public API/contract (breaking) · (5) security-sensitive (input handling/crypto/permission)** → triage ห้ามแนะนำ fast (**5 หมวด**)
- **★ Escalation/Downgrade เป็น step (symmetric; panel SA-S1/TL-S4/QA-S3):**
  1. **Upgrade (fast→standard/large):** พบว่าใหญ่กว่า/แตะ hard-floor กลางทาง → **เติม artifact ที่ fast-track ข้ามไป** (business.md/proposal-design เต็ม/panel/dry-run/แตก task เพิ่ม) แล้วเดิน flow tier ใหม่ต่อ — topic ไม่ต้องเริ่มใหม่
  2. **Downgrade (standard→fast):** ถ้าประเมินเกิน (over-size) → ตัด ceremony ที่ยังไม่ทำได้ แต่ **ห้าม downgrade ข้าม hard-floor**
  3. sizing เป็น **default ที่ปรับได้ทุกเมื่อ ไม่ lock**

### 3C. Fast-track skip-list (canonical ที่เดียว) → ใส่ `triage.md`; `design.md §7` ชี้มา
> fast tier = **ข้าม ceremony ที่ไม่จำเป็น ไม่ใช่ข้าม correctness**
| stage | fast-track ทำ | คงไว้ (correctness floor) |
|---|---|---|
| DESIGN | ข้าม `business.md`, proposal/design สั้น, **ไม่ panel ไม่ dry-run**, 1 task, model tier `cheap` | spec/acceptance ขั้นต่ำของ task |
| BUILD | 1 agent (DAG width 1, ไม่ต้อง fan-out) | **full-gate (test เขียว) ยัง blocking** |
| VERIFY | lite — functional ตาม spec + test เขียว, ข้าม empirical/panel ที่ไม่เกี่ยว | test เขียวจริง |
| SHIP | lite — promote เฉพาะที่มี (อาจไม่มี learned-rule), archive | archive ครบ + ไม่แตะ rule กลางมั่ว |

### 3D. Route recommendation behavior (read-only — pattern ตาม `next.md`) → ใส่ `triage.md` + command
- triage **อ่าน input = คำอธิบาย change ของ user** (+ inspect โค้ดที่อ้างถึงได้) → ประเมิน tier ตาม 3A/3B → **รายงาน: tier + เหตุผล (signals ที่เจอ) + route ที่แนะนำ + คำเตือน hard-floor (ถ้ามี)** → **หยุด ให้ user สั่ง command เอง** (ไม่รัน stage ต่อ — เหมือน `next`)
- **ต่างจาก `next`:** triage = ประเมิน **request ใหม่ by size** ; next = route **topic เดิม by stage** — คนละแกน input (เขียนให้ชัดใน triage.md + README)

## 4. Interface / contract (ระหว่าง task)
- **canonical = design นี้ §3** — ทุก task อ่านเป็น input ก่อนลงมือ (มีก่อน BUILD → wave 1 ไม่ depend output กัน)
- **contract ที่ T2/T3 พึ่ง:** ไฟล์ `.warnyin/workflow/triage.md` (path + ถือ canonical rubric) — ตกลงที่นี่; T2 command ชี้ path นี้, T3 design.md §7 + verify.md/ship.md hook ชี้ path นี้ — **เขียน pointer เท่านั้น ห้าม inline/copy rubric** (กัน duplicate; rubric เต็มอยู่ triage.md เดียว)
- **★ pointer convention (panel SA-S3 + dry-run T2):** แยก 2 แบบตามชนิดไฟล์:
  - **T3 playbook hooks** (`stages/design.md §7`, `verify.md`, `ship.md` — repo-relative docs) → **relative markdown link** `[..](../triage.md#fast-track-skip-list)` (จาก `stages/` ขึ้น 1 ชั้น) — `lint:md` จับ dead-link ของ path ได้ที่ full-gate = **integration proof** ว่า triage.md มีจริง
  - **T2 command adapter** (`.claude/commands/warnyin/triage.md`) → **backtick target-root runtime-ref** `` `.warnyin/workflow/triage.md` `` ตาม convention `next.md` command (path ที่ agent เห็นตอน install ที่ target root — ไม่ใช่ repo-relative; `installer/test.md`: lint ไม่ validate backtick runtime-ref ของ adapter) — **ห้ามทำ markdown-link ใน command** (จะได้ path ผิด `../../../...` + ขัด pattern adapter)
- **★ anchor `#fast-track-skip-list` (dry-run D1):** `lint:md` **strip anchor** (`lint-md.mjs` `target.split('#')[0]`) → ตรวจแค่ path มีจริง **ไม่ validate ว่า anchor resolve** → **T1 heading ต้องเป็น `## Fast-track skip-list` (อังกฤษ เป๊ะ → slug `fast-track-skip-list`)** ให้ตรง link ของ T3; ตัวกันพลาดจริง = **VERIFY ตรวจ anchor resolve ด้วยตา** (gate ไม่ช่วย — ดู §8)
- **canonical-copy:** wording §3A/§3B/§3C/§3D ที่ลง triage.md = copy จาก design §3 คำต่อคำ

## 5. Flow
- **triage flow:** user อธิบาย change → `/warnyin:triage` → อ่าน playbook triage.md → ประเมิน signals → ตัด tier (เคารพ hard-floor) → รายงาน tier+route+เหตุผล → หยุด → user สั่ง command ที่แนะนำ
- **fast-track flow:** triage บอก fast → user รัน `/warnyin:design` → DESIGN เห็น tier fast (§7) → ข้าม panel/dry-run/business, 1 task cheap → build (1 agent) → verify-lite → ship-lite

## 6. ผลกระทบต่อระบบเดิม
- **backward compatible:** triage = capability ใหม่ (opt-in) — ไม่ใช้ก็เดิน flow เดิมได้; `design.md §7` reframe = ขยาย (เล็ก→fast เป็น superset, กลาง/ใหญ่→standard/large) ไม่ลบพฤติกรรมเดิม
- **จุดระวัง:** lint:md dead-link (T2/T3 ชี้ triage.md ต้อง resolve หลัง T1 merge) · sync src→root · README โครงตาราง capability เดิมต้องไม่พัง

## 7. Dependency ระหว่าง task (dogfood: DAG กว้าง)
```
        [canonical = design.md §3 — มีก่อน BUILD]
                       │ (ทุก task อ่านเป็น input)
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  triage-        triage-        design-reframe     ◀── wave 1: ขนาน 3 (file-ownership disjoint)
  playbook       command        + register
        └──────────────┴──────────────┘
                       ▼
        full-gate (sync root + lint:md dead-link + validate-topic + empirical demo @ VERIFY)
```
- **critical-path depth = 1 · max wave width = 3** — ไม่มี chain (contract-first decouple ทั้งหมด)
- เหตุผลขนานได้: file-ownership disjoint + canonical ใน design (contract-first ระดับ topic) — dogfood toolkit 3A อีกเคส

## 8. Test strategy ระดับ design
- **task-scope (panel TL-S3):** ไฟล์ที่แตะ syntax/own-file สะอาด ; triage.md/command/§7 wording ตรง canonical §3 (consistency) — **task-scope ไม่รัน cross-file dead-link ไป triage.md** (worktree ยังไม่มี T1 → false-fail); dead-link ข้ามไฟล์ = full-gate เท่านั้น (lean self-verify)
- **full-gate:** `node --test` เขียว (ไม่มี assertion เดิมพัง) + `lint:md` dead-link 0 (pointer ทุกตัว resolve ถึง triage.md หลัง merge) + `validate-topic` ไม่มี ✖ + `verify:pack` (ไฟล์ใหม่ใต้ `src/.warnyin/`+`src/.claude/commands/` ติด tarball) + `src`↔root sync
- **empirical (VERIFY, gate ตัดสิน = structural/observable):**
  - **(1) fast-track ข้าม ceremony — วิธีนับ deterministic (panel QA-S1):** เดิน bugfix 1 เคสจริงทั้ง 2 ทาง → **standard demo = N stage-artifact, fast demo = M, ต้อง M < N และ fast ข้ามครบ ≥3 จาก {`business.md`, review panel, dry-run, multi-task}** (mirror pattern `installer/test.md` empirical DAG-width "≥1 wave>1") ; wall-clock fast < standard = **informational** (non-deterministic)
  - **(2) hard-floor — ครบทุกหมวด (panel QA-S2):** เดิน ≥1 เคสต่อหมวดใน §3B (**5 หมวด** — เน้น security-sensitive ที่ judgment กว้างสุด) → triage บังคับ ≥ standard ทุกเคส (observable: รายงานไม่มี tier fast)
  - **(6) anchor resolve (dry-run D1):** ตรวจด้วยตา/manual ว่า markdown-link `../triage.md#fast-track-skip-list` ใน design.md§7/verify/ship resolve ตรง heading `## Fast-track skip-list` ใน triage.md (lint:md strip anchor ไม่ช่วย)
  - **(3) escalation — observable (panel QA-S3):** topic เริ่ม fast (proposal สั้น 1 task) → พบแตะ hard-floor กลางทาง → เติม artifact ที่ข้าม → topic ไม่พัง (วัดที่ artifact ปลายทาง ไม่ใช่ที่ AI ตัดสิน)
  - **(4) read-only — executable (panel QA-S6):** รัน `/warnyin:triage` ใน sandbox → `git status` สะอาด (0 file changed) + ไม่รัน stage ต่อ
  - **(5) regression §7 (panel QA-S5):** design.md §7 หลัง reframe ชี้ canonical §3C **โดยไม่ inline rubric** + Gate §8 เดิมของ design.md ยังใช้ได้กับ tier standard/large (fast-track ไม่ทำ gate มาตรฐานหลวม)

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
### ADDED
#### Requirement: Triage ประเมินขนาด change → แนะนำ tier + route (→ feature ใหม่: `change-sizing`)
- **พฤติกรรม:** `/warnyin:triage` รับคำอธิบาย change → จัดเป็น tier `{fast, standard, large}` ตาม signals (#ไฟล์/component, new-vs-modify, cross-cutting) โดย **hard-floor** (auth/migration/secret/public-API/security) บังคับ ≥ standard → รายงาน tier + เหตุผล + route ที่แนะนำ → **หยุด** (read-only ไม่รัน stage ต่อ)
- **Scenario: change เล็กไม่ sensitive → fast**
  - GIVEN คำอธิบาย change ที่แตะ 1-2 ไฟล์ modify ของเดิม ไม่ cross-cutting
  - WHEN รัน `/warnyin:triage`
  - THEN รายงาน tier `fast` + route fast-track (`/warnyin:design` แบบ skip panel/dry-run)
- **Scenario: change แตะ hard-floor → บังคับ ≥ standard** (ครอบ 5 หมวด §3B)
  - GIVEN change ที่แตะหมวดใดหมวดหนึ่งใน: auth/authz · data-migration/**schema** · secret/credential · public-API/contract(breaking) · **security-sensitive** (input/crypto/permission)
  - WHEN รัน `/warnyin:triage`
  - THEN ไม่แนะนำ `fast` — tier ≥ `standard` พร้อมเหตุผลระบุหมวด hard-floor ที่ตรง
- **Scenario: escalation กลางคัน — topic ไม่พัง**
  - GIVEN topic เริ่ม fast-track (proposal สั้น 1 task) WHEN พบว่าแตะ hard-floor/ใหญ่กว่าที่ประเมิน
  - THEN เติม artifact ที่ fast-track ข้าม (business/proposal-design เต็ม) แล้วเดิน flow tier ใหม่ต่อได้ — artifact ปลายทางครบ topic ไม่ต้องเริ่มใหม่
- **Scenario: read-only — แนะนำแล้วหยุด**
  - GIVEN รัน `/warnyin:triage`
  - THEN รายงาน tier+route ในแชท **ไม่สร้าง/แก้ไฟล์** (git status สะอาด) + ไม่รัน stage ถัดไป (user สั่งเอง)

> **behavior change ที่ตั้งใจ (panel QA-S5):** `design.md §7` reframe — tier `large` **บังคับ `/warnyin:discovery`** (เดิม "ใหญ่" ไม่บังคับ) = เปลี่ยนพฤติกรรม DESIGN playbook โดยตั้งใจ (บันทึกไว้ที่นี่; §7 เป็น playbook ไม่ใช่ feature-spec จึงไม่มี delta ต่อ `docs/features/` แต่ระบุ behavior ใน scenario `change-sizing` ด้านบนแล้ว)
> **ไม่แตะ** spec เดิมของ `build-orchestration`/`context-profiles` (fast→cheap tier เป็นการ *ใช้* tier เดิม ไม่เปลี่ยนพฤติกรรม)
> feature `change-sizing` = **สร้างใหม่ตอน SHIP** (feature.md + business.md) — DESIGN/BUILD บันทึก behavior ที่นี่ก่อน

## 10. Design review
**Panel:** SA + Tech Lead + QA (fan-out ขนาน read-only, 2026-06-11)

**Blocker → แก้ครบ:**
| # | จาก | blocker | แก้ |
|---|---|---|---|
| 1 | SA-B1 | fast-track lite อ้าง 4 stage แต่ enforce แค่ DESIGN — VERIFY/SHIP ไม่มี hook | **user เคาะ: wire ครบ 4 stage** → T3 เพิ่ม pointer hook ใน verify.md/ship.md ชี้ §3C canonical (§2) |
| 2 | TL-B1 | "register" ปลายทางจริง = slash-list `installer/templates/CLAUDE.md` ไม่ใช่ workflow/README → ownership ไม่ครบ | T2 ถือ command + `installer/templates/CLAUDE.md`; T3 ถือ workflow/README (§2 + disjoint note) |
| — | TL-B2 | task briefs ยังไม่แตก | **expected** — panel = step 6 ก่อนแตก task (step 7); แตกหลังปิด panel |

**Suggestion → รับ (fold เข้า design):**
| # | จาก | รับเป็น |
|---|---|---|
| SA-S1 | downgrade (over-size) ไม่ระบุ | §3B escalation step 2 (symmetric downgrade, ห้ามข้าม hard-floor) |
| SA-S3 | pointer ต้องเป็น markdown link จริง | §4 (pointer = relative markdown link → lint:md จับ dead-link ได้) |
| TL-S3 | task-scope lint ไม่รวม cross-file dead-link | §8 task-scope (own-file เท่านั้น; cross-file = full-gate) |
| TL-S4 | escalation เป็น step | §3B escalation 3 step |
| QA-S1 | นิยามวิธีนับ #artifact deterministic | §8 empirical (1): N vs M + ข้ามครบ ≥3 |
| QA-S2 | hard-floor ครบ 6 หมวด | §3B (6 หมวด) + §9 scenario + §8 empirical (2) ต่อหมวด |
| QA-S3 | escalation scenario | §9 scenario escalation + §8 empirical (3) |
| QA-S4 | tie-break ก้ำกึ่ง | §3B tie-break → ปัดขึ้น standard |
| QA-S5 | §7 large = behavior change | §9 note (intentional) + §8 empirical (5) regression |
| QA-S6 | read-only verify executable | §9 scenario + §8 empirical (4) git status สะอาด |

**ผ่านมุม panel:** router pattern (เทียบ next.md) · canonical-copy (rubric ที่ triage.md เดียว) · triage↔next แยกแกน · contract-first decouple (T2/T3 ขนาน T1 ไม่มี hidden dep) · model tier per task · gate = observable (wall-clock informational)

**ไม่มี blocker ค้าง — พร้อมแตก task**

## 11. Dry-run (3 task ขนาน read-only, 2026-06-11)
ผลเต็มใน `tasks/<task>/issue.md`

| task | verdict | ประเด็นเด่น → แก้ |
|---|---|---|
| triage-playbook | GO | heading ต้อง `## Fast-track skip-list` อังกฤษ (lint strip anchor ไม่จับ) + hard-floor 6→**5 หมวด** → ✅ แก้ task/spec/design |
| triage-command | GO (after fix) | **blocker:** pointer markdown-link ผิด convention → ✅ เปลี่ยนเป็น **backtick runtime-ref** เหมือน next.md (design §4 + task) |
| playbook-wiring | GO | path `../triage.md#...` ถูก; anchor match = VERIFY manual (lint ไม่ validate anchor) |

**Defer ที่เหลือ (track ที่ VERIFY/SHIP):** anchor resolve ตรวจด้วยตา (gate ไม่ช่วย) · root CLAUDE.md sync = release · rule ใหม่ "judgment router" รอ SHIP

**ไม่มี blocker ค้าง — พร้อมเข้า BUILD**
