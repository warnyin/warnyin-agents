# Test Plan — Ponytail Minimalism

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> แผน/วิธีเทสของ topic นี้ — ตอน **SHIP** จะ merge เข้า `docs/techstack/installer/test.md`
> guideline: `docs/techstack/installer/test.md` §"verify feature ที่เป็น payload `.md` ล้วน" + §"verify stage-invoked capability"

## บริบท
topic เป็น **payload `.md` ล้วน** (เพิ่มไฟล์แกน `minimalism.md` + pointer 6 surface) — ไม่มี runtime/service → verify = **structural + dead-link สองทิศ + install proof + consistency + observable proxy** (ตาม 5 scenario ใน `design.md §9`) ไม่ใช่รัน service
- regression baseline: ยังไม่มี `docs/features/minimalism/` → baseline = Spec delta (`design.md §9`); SHIP จะสร้าง feature
- env: ไม่ต้องรัน local service; ใช้ `npm`/`node`/grep + `setup:sandbox`

## เคสที่ต้องผ่าน

### T1 — ไฟล์แกนถูกต้อง (structural content)
- [ ] `minimalism.md` มี: guardrail "lazy not negligent" **วางก่อน** hierarchy · decision hierarchy 6 ขั้น (YAGNI→stdlib→native→dep→one-liner→ขั้นต่ำ) · before/after ≥1 · over-cut boundary
- [ ] token-lean (ไม่เกินสเกล `triage.md`/`api-doc.md`)
- [ ] tool-agnostic: grep ชื่อรุ่น/tool/ponytail → ว่าง

### T2 — single source / ไม่ duplicate (scenario 4)
- [ ] full hierarchy block (6 ข้อพร้อม decision logic) ปรากฏ**ที่เดียว** ใน `minimalism.md`
- [ ] surface อื่นเป็น pointer + arrow-summary สั้น **wording เหมือนกันทุกไฟล์** (canonical-copy ไม่แต่งใหม่)

### T3 — dead-link สองทิศ (scenario 1, 2)
- [ ] `lint:md` เขียว
- [ ] ทุก pointer (`../minimalism.md` จาก roles/contexts/stages · `minimalism.md` จาก README) resolve เป็นไฟล์จริง
- [ ] reverse: ไฟล์ที่ minimalism.md อ้าง (ถ้ามี) resolve ได้

### T4 — observable proxy ต่อ scenario (design §9)
- [ ] scenario 1 (ผลิต): `roles/developer.md` + `contexts/build.md` + `stages/build.md §3` มี pointer ไป minimalism
- [ ] scenario 2 (ตรวจ): `contexts/review.md` มี over-engineering lens ชี้ minimalism + `stages/verify.md §3` มี pointer
- [ ] scenario 3 (guardrail): minimalism.md ระบุ "ห้ามตัด" validation/data-loss/security/accessibility/test/spec/acceptance ครบ
- [ ] scenario 5 (tool-agnostic): = T1 grep

### T5 — backward-compat / no-logic-change
- [ ] git diff: surface ที่แก้ = **เพิ่มบรรทัด pointer เท่านั้น** ไม่ลบ/แก้ logic เดิม
- [ ] `contexts/` ยัง 3 ไฟล์ (ไม่เพิ่ม context ตัวที่ 4)
- [ ] `stages/verify.md §6` (gate) **ไม่ถูกแตะ** (pointer อยู่ §3 เท่านั้น)

### T6 — ship integrity + install proof
- [ ] `npm pack --dry-run` → `minimalism.md` ติด package
- [ ] `setup:sandbox` → target มี `.warnyin/workflow/minimalism.md` + pointer wire ลงจริง · root dogfood ไม่โดนแตะ
- [ ] `validate-topic ponytail-minimalism` ✓ · `npm test` (107/109 — 2 pre-existing Windows fail ยืนยัน base)

## วิธีรัน
```
grep -n ... src/.warnyin/workflow/minimalism.md          # T1/T2/T4
node src/scripts/lint-md.mjs                              # T3
git diff <base> -- <surface files>                        # T5
npm pack --dry-run --json (PowerShell) → checkFiles       # T6 (Windows: KB#4)
npm run setup:sandbox → inspect target                    # T6
node .warnyin/workflow/scripts/validate-topic.mjs ...     # T6
```
