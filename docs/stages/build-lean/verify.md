# Verify report — build-lean

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> วันที่: 2026-07-07 · branch `build/build-lean` · แผนเทส: `./test.md`

## 1. ผลเทสตามแผน (13 เคส)

| # | เคส | ผล |
|---|---|---|
| T1 | full gate 4 ตัว | ✅ `npm test` 127/127 fail=0 · check-test-count ≥9 · verify:pack 93 ไฟล์ · lint:md 148 ไฟล์ 79 ลิงก์ |
| T2 | executable install proof (`setup:sandbox`) | ✅ target มี `receipt.md` template + `loop-tuning.md` + skip-list/§2D + hook 3 stage + adapter fast path 4 ตัว + CLAUDE.md registry ครอบ fast · ไม่มี topic leak · root dogfood ไม่โดนแตะ |
| T3 | canonical-copy คำต่อคำ | ✅ skip-list ใน `triage.md` = design §4.1 (diff ว่าง) · wording block `build.md §4·6` = `verify.md §4·5` (diff ว่างหลังแก้ F1) · §2C pointer เป็น md link → `loop-tuning.md` |
| T4 | single-source (negative-grep) | ✅ full why-block เจอเฉพาะ `loop-tuning.md` (หลังแก้ F1) · ตาราง default-by-tier เฉพาะ `triage.md` · ไม่มี skip-list inline ใน stage files · enum `per-finding \| batched` + "เหตุผล 1 บรรทัด" อยู่ครบทั้งสอง stage · ★ starting-artifact note ยังอยู่ (`design.md:102`) |
| T5 | gate-count regression | ✅ `build.md §7` = 7 · `verify.md §6` = 7 · `ship.md §6` = 11 — **11 อธิบายได้**: item ที่ 11 คือ backlog gate จาก `release/0.23.0` (merge เข้าใน wave 3 — release branch มี 11 อยู่แล้ว); diff ยืนยัน topic นี้ไม่เพิ่ม/ลด item ของตัวเอง |
| T6 | receipt template contract | ✅ 35 บรรทัด (≤40) · H1 `# Receipt — <ชื่อ change>` placeholder บรรทัดแรก · meta มี Hard-floor row · §1-§5 ครบ · อยู่นอก `[topic]/` |
| T7 | validator behavioral | ✅ unit 39 เคส (fast/mixed/เดิม) ใน T1 + dogfood จริง: status → `build-lean VERIFY ✖0/⚠0` (topic เดิมไม่เปลี่ยนผล) · `validate build-lean` → ✓ exit 0 |
| T8 | fast hooks 3 stage + adapter | ✅ hook 1 อัน/ไฟล์ · build: code-first + floor อ้าง §3 ข้อ 6/11/12 + md link skip-list · verify: เติม receipt §4 + floor test เขียวจริง · ship: hard-floor 5 หมวด + upgrade §2B + archive · adapter 4 ตัวมี fast path ชี้ playbook |
| T9 | worktree 2 mode + prompt lean | ✅ `§3 ข้อ 3` + `§4 ข้อ 5` ครอบ wave ≥2 / wave เดี่ยว (isolate:false + checkout build branch + agent ไม่ commit) · prompt lean พิสูจน์ runtime ด้วยเคส F-K |
| T10 | UX-detect precedence + regression | ✅ exclusion เช็คก่อน signals + "จบทันที ไม่ประเมิน signals" (`design.md:79`) · step 4.5 / approve gate / fallback lens / gate §8 เดิมครบ |
| T11 | caps §2D + route §2A | ✅ §2D แยก anchor (fast ≤40 · proposal ≤60 · design ≤120 · large judgment) · route fast = pre-flight receipt → code-first → verify-lite → ship-lite |
| T12 | release hygiene | ✅ package.json 0.24.0 = หัว CHANGELOG · `[0.23.0]`/`[0.22.0]` ครบไม่ซ้ำ |
| T13 | next.md + stale mentions | ✅ row fast-track ใน stage-inference · ไม่เหลือ "1 task เขียนเอง" (โมเดลเก่า) ในทุกไฟล์ |

## 2. รายการแก้ไข (fix loop)

**จำนวนรอบ: 1 · จำนวนแก้: 1 finding**

- **F1 — `src/.warnyin/workflow/stages/verify.md §4 ข้อ 5` มี theory block เต็มแบบเก่ากลับมา** (จับด้วย T4 negative-grep): root cause = wave 3 merge `origin/release/0.23.0` conflict resolution เก็บเนื้อฝั่ง release ทับ wording block ของ wave 2 → แทนด้วย canonical wording (คำต่อคำจาก `build.md` = design §4.5) → rerun: wording identical ✓ · theory เหลือไฟล์เดียว ✓ · full gate เขียว ✓ · sandbox target ได้เวอร์ชันแก้แล้ว ✓ — บันทึกเป็น TS-4 ใน `troubleshooting.md`
- loop tuning: finding เดียว อิสระ → **per-finding** (แก้ตรงจุด rerun ทันที — ไม่มี delegate จึงไม่มี grouping)

## 3. UX/UI

N/A — topic นี้เป็น workflow playbook + tooling (docs/config/script) ไม่มี UI surface (สอดคล้อง UX-detect exclusion ที่ topic นี้เพิ่มเอง)

## 4. Gate checklist (playbook §6)

- [x] เทสตามจุดประสงค์ของ topic ครบ (T1-T13 ครอบ 6 slice)
- [x] regression ตาม baseline 4 feature spec ผ่าน (ยกเว้นที่ MODIFIED ใน delta — พฤติกรรมใหม่ยืนยันแล้ว) + scenario ใน Spec delta ผ่าน
- [x] Frontend UX/UI — N/A
- [x] API contract — N/A (ไม่มี openapi.yaml)
- [x] ทุก finding ถูกแก้จน verify ผ่านหมด (F1 → แก้ + rerun เขียว)
- [x] `test.md` + `verify.md` เขียนครบ
- [x] ปัญหายาก/ซ้ำบันทึก `troubleshooting.md` (TS-4 ใหม่)

→ พร้อมเข้า SHIP (`/warnyin:ship build-lean`)
