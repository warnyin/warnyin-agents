# Rule — setup-dogfood-verify

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack + docs/rule.md)
- [ ] **zero-dependency** (`docs/rule.md §2`) — `npm view`/`npx`/`npm pack` เป็น external process ไม่ใช่ devDeps; ห้ามเพิ่ม dep
- [ ] **ESM** + **ภาษาไทย** (คอมเมนต์/ข้อความ)
- [ ] **npm scripts (dev tooling) cross-platform** (`docs/rule.md §2`) — `os.tmpdir()`/`path.join`; spawn array args ห้าม `shell:true` ยกเว้น npx win32 (`.cmd`); เผื่อ Windows npx bin-shim resolve ไม่ได้ → มี fallback (คงไว้)
- [ ] **CHANGELOG ทุก user-facing change** (`docs/rule.md §2`) — setup:dogfood เป็น dev-tooling แต่พฤติกรรม fail/degrade เปลี่ยน → Fixed entry (อ้าง issue #3)
- [ ] **config-protection / "แก้จนผ่าน = แก้ root cause"** (`docs/rule.md §1`) — drift-guard ต้อง fail จริงเมื่อ drift จริง; ห้ามลด bar เพื่อให้ผ่าน (เช่น ทำ verify เป็น marker-only ถาวรเพราะ test ยาก)
- [ ] **test = black-box/unit + pass-count anti-false-green** (`docs/rule.md §5`) — `verifyInstalled` import ตรง (main-guard กัน side-effect); acceptance = pass count ไม่ใช่แค่ exit 0; drift-guard ต้องมีคู่ true/false (กัน return ค่าคงที่)
- [ ] **structural validator: ✖ existence/structure ล้วน** (`docs/rule.md §1`) — wire-proof check (npx+pack ส่ง expected) เป็น structural assert บน source (deterministic) ไม่ใช่ heuristic
- [ ] **investigate-before-edit** (`docs/rule.md §1`) — เข้าใจ flow `installViaNpx || installViaPack` + success-detection เดิม (`status===0 && !shimMissing && verifyInstalled`) ก่อนแทรก expected — ห้ามทำลาย shim-missing fallback
- [ ] **bootstrap 2-layer** (`docs/rule.md §6`) — setup:dogfood install registry @latest ลง root (gitignored); ห้ามแก้พฤติกรรมให้ install จาก `src/` (นั่นคือ `setup:sandbox`)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md`/`docs/techstack/.../rule.md` ตอนนี้ — แค่ note ไว้ก่อน
- [ ] **rule ที่เสนอ:** "external-version query (`npm view`) ที่ป้อน verify ต้อง (1) parse แบบทน noise (stdout อาจปน warning) ผ่าน **pure fn แยก** เพื่อ unit ตรงไม่ต้อง spawn, (2) **degrade graceful + warn loud** เมื่อ fail (ไม่เงียบ ไม่ block ถ้า offline = งานหลักก็ fail เอง), (3) verify เทียบ **ค่า version** ไม่ใช่ existence" — **เหตุผล:** เป็น pattern install-verification ที่ generalize จาก issue #3 (false-green รอบ 2); คู่กับ learned-rule ของ `installer-version-stamp` (version identity) — SHIP รวมเป็นกฎเดียวของ component installer
