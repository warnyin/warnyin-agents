# Verify Report — Ponytail Minimalism

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> สรุปผลการ verify ตามจุดประสงค์ของ topic + การแก้ไขที่เกิดขึ้น

| | |
|---|---|
| **Slug** | `ponytail-minimalism` |
| **วันที่** | `2026-06-15` |
| **ผลรวม** | ✅ ผ่าน |
| **จำนวนรอบการแก้ไข (fix iterations)** | 0 รอบ |
| **จำนวนจุดที่แก้** | 0 จุด (ผ่านทุกเคสรอบแรก) |

## 1. จุดประสงค์ที่ verify (จาก spec/tasks)
- minimalism principle "live" ใน workflow: มีไฟล์แกน + reachable จากทุก surface (ผลิต+ตรวจ) + single-source ไม่ duplicate + shipped + backward-compatible
- ยืนยัน 5 scenario ใน Spec delta (`design.md §9`) แบบ observable proxy (payload `.md` ล้วน ไม่มี runtime — ตาม guideline `docs/techstack/installer/test.md` §"verify feature payload `.md` ล้วน")

## 2. ผลการเทส
| # | Test case / flow | ชนิด | ผล | หมายเหตุ |
|---|---|---|---|---|
| T1 | ไฟล์แกนถูกต้อง: guardrail วางก่อน hierarchy + 6 ขั้น + before/after + boundary · token-lean · generic | structural | ✅ | minimalism.md 64 บรรทัด (สเกลเดียว triage.md) |
| T2 | single source: full hierarchy ปรากฏที่เดียว + arrow-summary wording เหมือนกันทุกไฟล์ | consistency | ✅ | full block เฉพาะ `minimalism.md`; arrow-summary identical 3 ไฟล์ |
| T3 | dead-link สองทิศ: lint:md เขียว + pointer 6 จุด resolve | dead-link | ✅ | lint:md 120 ไฟล์ 53 ลิงก์; `../minimalism.md`×5 + `minimalism.md`×1 resolve ครบ |
| T4 | observable proxy 5 scenario (ผลิต/ตรวจ/guardrail/single-source/tool-agnostic) | behavioral | ✅ | guardrail ครบ 7 รายการ (validation/data-loss/security/accessibility/test/spec/acceptance) |
| T5 | backward-compat: เพิ่ม pointer เท่านั้น · contexts ยัง 3 · verify §6 ไม่ถูกแตะ | regression | ✅ | git diff = additive; context 3 ไฟล์; §6 gate 0 change |
| T6 | ship integrity + install proof: pack ติด + setup:sandbox wire ลง target จริง | integration | ✅ | minimalism.md + pointer 4 จุด ลง sandbox target ผ่าน cli.mjs; root dogfood ไม่โดนแตะ |
| T6b | regression gate: validate-topic / npm test | regression | ✅ (⚠ 2 pre-existing) | validate ✓; npm test 107/109 — 2 fail = Windows `isEntrypoint` ยืนยัน fail บน clean base, ไม่เกี่ยวกับ change |

## 3. UX/UI verify (ถ้าเป็น FE)
- N/A — ไม่ใช่ frontend (payload `.md` ล้วน)

## 4. รายการแก้ไข (สรุปการแก้ระหว่าง verify)
- ไม่มี — ผ่านทุกเคสรอบแรก (0 fix iterations)

## 5. ปัญหายาก/ซ้ำ → troubleshooting
- บันทึกไว้ที่ `./troubleshooting.md`: มี (TS-1 verify:pack ENOENT บน Windows — อ้าง KB กลาง #4; ไม่ใช่ของใหม่ ไม่ยกขึ้น KB)
- 2 test แดง (`isEntrypoint` Windows) เป็น pre-existing — ไม่บันทึกเป็น TS (ไม่ได้แก้ + ไม่ใช่ของใหม่)

## 6. หมายเหตุถึง user
- ไม่มีการวนแก้/ไม่ได้ถาม user ระหว่างทาง (ทุกเคสผ่านรอบแรก)
- **expected (ตาม design):** root dogfood ยังไม่มี `minimalism.md` จนกว่า publish release ถัดไป — install proof ผ่าน `setup:sandbox` (ติดตั้งจาก `src/` v-next) พิสูจน์ว่า payload ใหม่ ship ถูกต้องแล้ว

## ✅ Gate → SHIP (ดู `.warnyin/workflow/stages/verify.md` ข้อ 6)
- [x] เทสตามจุดประสงค์ครบ (T1–T6 functional/structural/behavioral)
- [x] regression baseline (Spec delta 5 scenario) ผ่านครบ
- [x] FE: UX/UI — N/A
- [x] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่าน (ไม่มีข้อไม่ผ่าน; 2 Windows fail pre-existing นอก scope ตาม config-protection)
- [x] test.md + verify.md เขียนครบ
- [x] ปัญหายากบันทึก troubleshooting.md แล้ว
