# Rule — memory-status-script

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก `docs/rule.md` + `docs/techstack/installer/rule.md`)
- [ ] **zero-dependency** — `devDependencies` ต้องว่าง; ใช้ built-in `node:*` เท่านั้น (`docs/rule.md §2`); gate/script ของ repo เขียนเองแบบ pure fn + main-guard (`zero-dep lint-gate convention`)
- [ ] **ESM** — `import`/`export`, `import.meta.url`; ห้าม `__dirname`/`require`
- [ ] **★ negative properties (design C10) — บังคับ มีเคสคุม:** ห้าม import `node:child_process` / `node:http(s)` / `node:net` · **ห้ามเขียนไฟล์ใด ๆ** · **ห้ามพิมพ์เนื้อ entry** (เฉพาะตัวเลข/วันที่/flag) · ไฟล์ **LF ล้วน**
- [ ] **exit 0 เสมอ** — report ไม่ใช่ gate; ห้าม `process.exit(1)`/throw หลุดออกจาก `main()` แม้ไฟล์หาย/พังรูปแบบ (สถานะนอก closed-set → `unknown` + ⚠ เท่านั้น)
- [ ] **main-guard = argv[1] comparison ไม่ realpath** — กฎ realpath (`docs/techstack/installer/rule.md`) ผูกกับ `bin`/npx symlink; script นี้ไม่เข้าเคส `isEntrypoint`
- [ ] **`export function` ได้เฉพาะที่นี่** — ข้อห้าม top-level `export` ใน `.warnyin/workflow/scripts/` ผูกกับ script ที่รันผ่าน **Workflow tool** (`build-wave.mjs`) เท่านั้น; ห้ามลาก guard นั้นมาบังคับไฟล์นี้ และห้ามไปแก้ `build-wave.mjs`
- [ ] **ห้าม `t.skip()` / conditional-skip** — `check-test-count.mjs` fail เมื่อ `pass !== tests`; เคสที่รันไม่ได้ → `log + return` ภายในเคส
- [ ] **ห้ามใส่ path/glob arg ให้ `node --test`** — bare `node --test` (auto-discover เจอ `src/tests/memory-status.test.mjs` เอง)
- [ ] **ห้ามแตะ `src/scripts/check-test-count.mjs`** — `MIN_PASS` เป็น **floor** ไม่ใช่ยอดจริง; gate ที่ทำงานจริงคือ `pass === tests` + `fail === 0`
- [ ] **★ file-ownership disjoint (`design.md §7`)** — **ห้ามแตะ `src/.warnyin/workflow/next.md` (T2) และ `src/.warnyin/workflow/README.md` (T1)** และห้าม assert เนื้อของ 2 ไฟล์นั้นในเทส (แดงเปล่าใน worktree ของ T5)
- [ ] **ห้ามแตะ root `.warnyin/`, `.claude/`, root `CLAUDE.md`/`AGENTS.md`** — dogfood gitignored (`docs/rule.md §6`); แก้เฉพาะใต้ `src/`
- [ ] **negative-grep/structural check = เคส node ใน suite** — ห้าม shell `grep`/`rg` (Windows พัง + ไม่อยู่ใน `npm test`) (`docs/rule.md §5`)
- [ ] **negative fixture ต้องเลี่ยง trigger phrase** (`docs/rule.md §5`) — fixture "legend-only" ตั้งใจให้มีคำว่า `open`/`promoted`/`dropped` (นั่นคือประเด็นของเคส) แต่ **ห้ามใส่แถวที่คอลัมน์แรกเป็นตัวเลข** โดยไม่ตั้งใจ; กลับกัน fixture ที่คาดว่า `unknown` ห้ามมีคำ `open` ในเซลล์สุดท้าย
- [ ] **anti-false-green** — assertion ต้อง falsifiable: พิสูจน์เคส legend-only แดงจริงถ้าเปลี่ยน detector ให้รับทุกบรรทัด `|` (task.md §3 ข้อ 4) ก่อนปิดงาน
- [ ] **investigate-before-edit / config-protection** — เทสแดง → หา root cause ที่ parse contract; **ห้ามแก้เทส/ลดเกณฑ์เพื่อให้ผ่าน**
- [ ] **minimalism** — ต้องมีเท่าที่ C10 กำหนด: ไม่มี CLI flag เพิ่ม (`--json`, `--verbose`), ไม่มี cache, ไม่มี config file, ไม่แตะ `package.json scripts` (hook เป็นของ T2)
- [ ] **ภาษาไทย** ในคอมเมนต์/ข้อความผู้ใช้

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` / `docs/techstack/**/rule.md` / `docs/features/**` ตอน BUILD — note ไว้ก่อน
- [ ] **rule ที่เสนอ:** "**report-script ≠ gate-script**: script ใน `.warnyin/workflow/scripts/` ที่เป็นรายงาน ต้อง exit 0 เสมอ + ไม่พิมพ์เนื้อ artifact (เฉพาะ metric) + มีเคส negative-property อ่านซอร์สตัวเองยืนยันว่าไม่มี import ต้องห้าม/ไม่เขียนไฟล์" — _เหตุผล:_ standard เดิมมีแต่ pattern ของ gate ที่ exit 1 (`verify-pack`/`lint-md`/`check-test-count`); script รายงานที่ถูกเรียกจาก playbook แบบ conditional ต้องไม่มีทาง block งานผู้ใช้ และเป็น surface ที่ log อาจหลุดข้อมูลอ่อนไหว
- [ ] **rule ที่เสนอ:** "**parser ของ markdown table ต้อง row-based (คอลัมน์แรกเป็นตัวเลข) ห้าม substring-match บนทั้งบรรทัด**" — _เหตุผล:_ legend/prose ที่ระบุ closed-set ในบรรทัดเดียวทำให้ตัวนับพองโดยไม่มีใครรู้ (panel QA-B3); คู่กับข้อห้ามใช้ `\w`/`\b` กับข้อความไทย
- [ ] **note ให้ SHIP:** เกณฑ์ 60/30/90 เป็น **guidance ปรับได้** — ถ้าใช้จริงแล้วเสียงรบกวนเยอะ ให้ปรับที่ const ในไฟล์เดียว + `memory.md §3` (อย่าเพิ่ม knob/config)
