# Rule — fastlane-test-release

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack + `docs/rule.md`)
- [ ] **ห้าม shell `grep`/`rg` ในเทส** — node ล้วน (`node:test` + `node:fs`) cross-platform (Windows ไม่มี `grep` → false-red/พังเงียบ); design §8 + panel suggestion
- [ ] **ห้าม conditional-skip** — `t.skip()` ทำให้ `pass !== tests` → `check-test-count.mjs` แดง; เคสที่รันไม่ได้บาง platform ให้ `log + return` (`docs/techstack/installer/test.md` §verify ESM entrypoint)
- [ ] **MIN_PASS (`src/scripts/check-test-count.mjs:11` = 46) — ไม่ต้อง bump** เป็น **floor** ไม่ใช่ยอดจริง (suite จริง ~135 เคส); gate ที่ทำงานจริงคือ `pass === tests` + `fail === 0` → **ห้ามแก้ไฟล์นี้** (design.md บรรทัดสุดท้าย: suggestion ที่รับทราบแต่ไม่ทำ)
- [ ] **ห้ามแตะ root `.warnyin/`, `.claude/`, root `CLAUDE.md`** (dogfood gitignored — `docs/rule.md:79` / contract C18) — แก้เฉพาะใต้ `src/`, `CHANGELOG.md`, `package.json`
- [ ] **verify ที่ `src/` ที่เพิ่งแก้ ไม่ใช่ root dogfood ที่ stale** (กัน false-green — `test.md` §verify Discovery modes); ห้ามรัน `cli.mjs` ที่ `cwd = repo root` (dogfood leak — troubleshooting #6) → ใช้ `makeTempProject` เสมอ
- [ ] **anti-false-green:** assertion ต้อง falsifiable — เคส negative-grep ต้องพิสูจน์ได้ว่า **แดงจริงถ้ากฎถูกลอกซ้ำ** (ลองแทรก string ชั่วคราวแล้วเห็นแดง ก่อนลบออก)
- [ ] **release-hygiene = wave สุดท้ายเสมอ** (`docs/rule.md:23`) — CHANGELOG/bump/`lint:md` ต้องรันหลัง task 1+2 integrate ครบ
- [ ] **config-protection:** ห้ามลด bar ด้วยการแก้/ลบ assertion เดิม, ลด `MIN_PASS`, หรือ exclude ไฟล์จาก gate — **เพิ่มเคสใหม่เท่านั้น** (atomic; `test.md` §เปิด allowlist entry ใหม่)
- [ ] **investigate-before-edit:** test แดง → หา root cause ที่ payload (task 1/2) ก่อน — ห้ามแก้ test ให้ผ่าน
- [ ] **CHANGELOG = Keep a Changelog** (Added/Changed + version + วันที่); version bump = **minor** (feature ใหม่, backward-compatible)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` / `docs/techstack/**/rule.md` / `docs/features/**` ตอน BUILD — note ไว้ก่อน
- [ ] **rule ที่เสนอ:** "single-source falsifiable check ต้องเขียนเป็น **node negative-grep** ไม่ใช่ `grep -rl` ใน shell" — _เหตุผล:_ `test.md` §build-lean เขียน `grep -rl` ไว้ → รันบน Windows dev ไม่ได้ + ไม่เป็นส่วนหนึ่งของ `npm test` (ไม่มีใครรันจริงตอน CI) → ย้ายมาเป็นเคสใน suite ทำให้ regression ของ canonical ถูกจับอัตโนมัติทุก PR
- [ ] **rule ที่เสนอ:** "anchor link (`#...`) ต้องมีเคส structural ใน suite" — _เหตุผล:_ `lint-md.mjs` ตัด anchor ทิ้ง (`lint-md.test.mjs` #6) → heading ที่ถูก rename ทำให้ 5 ไฟล์ dead-anchor เงียบ
- [ ] **แจ้ง SHIP (นอก scope BUILD — จาก design §9):** ต้องอัปเดต `docs/rule.md:26` (hard-floor "บังคับ ≥ standard เสมอ") + `docs/features/change-sizing/{feature.md:29, business.md:22}` ("ไม่เพิ่ม one-shot/auto-execution") ให้ตรงพฤติกรรมใหม่ (explicit user override)
