# Rule — setup-dogfood-reliable

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack)
- [ ] **zero-dep / ESM / cross-platform** (`docs/techstack/installer/rule.md` §dev tooling): ใช้เฉพาะ `node:*`; `path.join`/`os.tmpdir()` ห้าม hardcode path; spawn array args ห้าม `shell:true` ยกเว้น npx win32 (เดิมมีแล้ว)
- [ ] **ห้าม false-green** (`docs/techstack/installer/rule.md` §dev tooling: "fallback ... หรือ exit ด้วย error ชัดเจน — ห้าม false-green"): success ต้อง verify side-effect ไม่ใช่แค่ exit 0
- [ ] **anti-false-green test** (`docs/rule.md §5` + `installer/test.md` pass-count gate): unit ต้องพิสูจน์ guard ทำงาน (เคส partial→false) ไม่ใช่แค่ happy-path; `pass===tests`/`pass≥9`
- [ ] **testable via export + main-guard** (`installer/standard.md` BL-4): pure-ish fn export, main-guard กัน import trigger side-effect
- [ ] **idempotent** (`installer/rule.md`): `appendContributingPointer` marker เดิมคงไว้; `--update` เขียนทับ CORE เท่านั้น (ไม่แตะ docs/scaffold)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
- [ ] rule ที่เสนอ: **"dev-tooling ที่ spawn external install (npx/npm) ต้อง verify side-effect ไม่เชื่อ exit 0 + ส่ง flag ให้ตรงเจตนา (เช่น --update)"** — เหตุผล: setup-dogfood เชื่อ exit 0 → false-green (npx exit 0 แต่ไม่ install) + ลืม --update → ข้าม CORE; เป็น generalize ของ "ห้าม false-green" ที่ใช้ได้กับ tooling อื่น (scope `component:installer` → `docs/techstack/installer/rule.md`)
