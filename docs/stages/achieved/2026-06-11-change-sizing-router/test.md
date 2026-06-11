# Test Plan — change-sizing-router

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> แผน/วิธีเทสของ topic นี้ — ตอน **SHIP** จะ merge เข้า `docs/techstack/installer/test.md`
> guideline: `docs/techstack/installer/test.md` §"verify feature ที่เป็น payload `.md` ล้วน" + §"verify skill (Claude adapter)"

| | |
|---|---|
| **Slug** | `change-sizing-router` |
| **Component** | `installer` (playbook `.md` + command adapter — ไม่มี runtime service) |
| **จุดประสงค์ที่ต้อง verify** | `/warnyin:triage` ประเมินขนาด change → tier (fast/standard/large) + route ถูกตามเจตนา · hard-floor บังคับ ≥ standard · fast-track wire ครบ 4 stage · read-only · canonical ที่เดียว (ไม่ duplicate rubric) |

## 1. ขอบเขตการเทส (ตามจุดประสงค์ topic)
- triage rubric ประเมิน tier + route ถูกตาม signals (D1) และเคารพ hard-floor 5 หมวด (D2)
- escalation/downgrade เป็น step (D3) · fast-track ลด ceremony จริงโดยคง correctness floor (D-count)
- fast-track hook wire ครบ 4 stage + ชี้ canonical (ไม่ inline rubric) · §7 regression (D5) · anchor resolve (D6)
- read-only เด็ดขาด (D4) · install จริงผ่าน `cli.mjs` ลง target ได้ (ไม่รั่ว root dogfood)

## 2. ชนิดการเทส
- [x] Structural / repo gate (`node --test`, `lint:md`, `validate-topic`, pack inclusion)
- [x] Executable install proof (`setup:sandbox` → ตรวจ target)
- [x] Consistency / canonical-copy (triage.md ↔ topic design §3 · hooks ↔ anchor · register หลายจุดตรงกัน)
- [x] Empirical observable demo (รัน rubric กับเคสตัวอย่าง — gate ตัดสิน = structural/observable, wall-clock = informational)
- [ ] ~~E2E smoke / UX/UI~~ — N/A (ไม่ใช่ FE, ไม่มี service/หน้าจอ)

## 3. Local env ที่ต้องรัน (จาก `docs/infra.md`)
| Service | คำสั่งรัน | port / หมายเหตุ |
|---|---|---|
| (ไม่มี service) | `node --test` · `npm run lint:md` · `npm run setup:sandbox` | payload `.md` — verify เชิงโครงสร้าง + install proof แทนการรัน service |

## 4. Test cases
| # | สถานการณ์ (อิงจุดประสงค์) | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|---|
| G1 | repo regression | `node --test` | 58/58 pass, 0 fail (ไม่มี assertion เดิมพัง) |
| G2 | dead-link 0 (artifact resolve หลัง integrate) | `npm run lint:md` | 0 dead-link (102 ไฟล์/48 ลิงก์) |
| G3 | topic โครงครบ | `node validate-topic.mjs change-sizing-router` | ไม่มี ✖ |
| G4 | pack cleanliness | `npm pack --dry-run --json` | ไฟล์ใหม่ 7 ตัวติด tarball, ไม่มี src/tests·docs·root dogfood รั่ว |
| I1 | install proof | `npm run setup:sandbox` → ตรวจ target | triage.md playbook + command + `/warnyin:triage` ใน CLAUDE.md + README capability ลงครบ · root dogfood ไม่โดนแตะ |
| C1 | canonical-copy | diff topic `design §3A/§3B` ↔ `triage.md §2A/§2B` | คำต่อคำ identical (hard-floor 5 หมวด + tier table) |
| C2 | no-duplicate | grep ตาราง/rubric ใน command + §7 | command 0 table (ไม่ inline rubric) · §7 0 inline skip-list (pointer เท่านั้น) |
| D1 | change เล็กไม่ sensitive → fast | รัน rubric กับ "แก้ typo error msg 1 ไฟล์" | tier `fast` + route fast-track |
| D2 | hard-floor 5 หมวด → ≥ standard | รัน rubric 1 เคส/หมวด | ทุกเคส tier ≥ standard, ไม่มี fast (observable) |
| D3 | escalation กลางคัน | topic fast → พบแตะ hard-floor | เติม artifact ที่ข้าม → flow tier ใหม่ต่อ (topic ไม่พัง) |
| D4 | read-only | ตรวจ command adapter + playbook §4 | 0 write-intent (ไม่มี Write/Edit/สร้างไฟล์) → git status สะอาดเมื่อรัน |
| D5 | regression §7 | ตรวจ §7 reframe + Gate §8 | §7 = 3-tier ชี้ canonical (0 inline table) · Gate §8 ของ standard/large คงเดิม · large บังคับ Discovery (intentional) |
| D6 | anchor resolve | heading slug ↔ link anchor | `## Fast-track skip-list` → slug `fast-track-skip-list` ตรง `../triage.md#fast-track-skip-list` |
| Dc | fast-track ลด ceremony (deterministic) | นับ #artifact standard (N) vs fast (M) | M < N และ fast ข้ามครบ ≥3 จาก {business.md, panel, dry-run, multi-task} |

## 5. E2E smoke (FE)
- N/A — ไม่ใช่ frontend

## 6. UX/UI checklist (FE)
- N/A — ไม่ใช่ frontend (capability เป็น read-only chat report)

## 7. วิธีรันเทส (reproducible)
```bash
# G1-G4 repo gates
node --test
npm run lint:md
node .warnyin/workflow/scripts/validate-topic.mjs change-sizing-router
npm pack --dry-run --json   # เช็คไฟล์ใหม่ติด tarball (Windows: ใช้แทน verify:pack — troubleshooting TS-1)

# I1 install proof
npm run setup:sandbox       # → ตรวจ <sandbox>/.warnyin/workflow/triage.md ฯลฯ; root repo git status ต้องสะอาด

# C1/C2/D-series: รัน rubric ใน triage.md กับเคสใน §4 (observable) + grep canonical-copy/no-inline
```
