# Rule — installer-test-suite

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow
> repo ยังไม่มี `docs/rule.md`/`docs/techstack/*/rule.md` — ดึงจากปรัชญา `CLAUDE.md` + ผล review panel
- [ ] **zero-dependency** — ห้ามเพิ่ม devDependency ใด ๆ (ใช้ `node:test` built-in)
- [ ] **ห้ามแตะ `bin/cli.mjs`** — black-box; ถ้าพบว่า cli.mjs มีบั๊กระหว่างเขียน test → รายงาน ไม่แก้เองใน task นี้ (เป็น scope แยก)
- [ ] **ทุกเคส assert `code===0` ก่อน** (กัน false-positive) + surface `stderr` ใน assertion message
- [ ] **assert stream ให้ตรง** — legacy warning อยู่ `stderr` (`console.warn`) ไม่ใช่ `stdout`
- [ ] spawn array args — **ห้าม `shell: true`** (security)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ไฟล์กลางตอนนี้ — note ไว้ก่อน ถึง SHIP ค่อยพิจารณา promote ขึ้น `docs/rule.md` / `docs/techstack/installer/`
- [ ] rule ที่เสนอ: **"repo zero-dependency policy"** — `devDependencies` ต้องว่างเสมอ ทุกเครื่องมือใช้ built-in — เหตุผล: กระทัดรัด + ไม่มี supply-chain risk (จุดขายของ tool นี้)
- [ ] rule ที่เสนอ: **"test installer = black-box spawn ห้าม refactor target เพื่อ testability"** — เหตุผล: ทดสอบพฤติกรรมจริง + ไม่เพิ่มความเสี่ยงในตัวที่ทดสอบ
- [ ] standard ที่เสนอ: **harness `makeTempProject`/`runCli`** เป็น test pattern กลางของ repo — เหตุผล: ใช้ซ้ำทุก test ของ CLI ในอนาคต
