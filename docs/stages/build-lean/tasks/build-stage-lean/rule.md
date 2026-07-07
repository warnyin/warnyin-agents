# Rule — build-stage-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)

- [ ] **unify-in-place ไม่สร้างกลไกขนาน** (`docs/rule.md §1` บรรทัด ~17) — worktree policy 2 mode = **ขยาย** §3 ข้อ 3 / §4 ข้อ 5 เดิมให้ของเก่าเป็น subset ไม่เพิ่มข้อ/section ใหม่ขนาน; fast hook = blockquote เดียวใต้ §1 ตาม pattern verify.md ไม่ทำ flow แยก
- [ ] **canonical-copy convention** (`docs/rule.md §1` บรรทัด ~18) — wording block ของ §4 ข้อ 6 นิยาม canonical ที่ `design.md §4.5` ที่เดียว → **copy คำต่อคำ** ห้ามแต่งใหม่ต่อไฟล์; บรรทัด "Loop-tuning report" คงคำเดิมของไฟล์ปัจจุบันเป๊ะ (spec `learning-loop-tuning` ผูก enum `per-finding | batched` + "เหตุผล 1 บรรทัด")
- [ ] **config-protection** (`docs/rule.md §1` บรรทัด ~13) — ห้ามแก้ MIN_PASS / แก้-ลบ assertion เคส A-E / ลดจำนวน gate item §7 "เพื่อให้ผ่าน"; test แดง → แก้โค้ด/เทสใหม่ที่ตัวเองเพิ่ม ไม่ลด bar ของเดิม
- [ ] **build-orchestration: commit topic docs ก่อน fan-out + sync-gap** (`docs/rule.md §1` บรรทัด ~19-20) — wording ใหม่ใน playbook/adapter ต้องสอด invariant นี้: baseRef sync (worktree mode) คงเดิมห้ามตัด, shared-tree mode ต้องระบุ orchestrator checkout build branch ก่อน (กัน commit ตกลง main) + main loop เป็นคน commit
- [ ] **source/dogfood แยกชั้นเด็ดขาด** (`docs/rule.md §6` บรรทัด ~79) — แก้เฉพาะ `src/**`; root `.warnyin/`/`.claude/`/`CLAUDE.md` = dogfood gitignored ห้ามแตะ/ห้ามรายงานเป็น filesChanged (KB#18/#22 — registry แก้ที่ `src/.warnyin/installer/templates/CLAUDE.md`)
- [ ] **zero-dependency + ESM + ห้าม `export function` ใน workflow script** (`docs/rule.md §2` + `docs/techstack/installer/rule.md` §โค้ด/§build orchestration)
- [ ] **acceptance = pass count ไม่ใช่แค่ exit 0** (`docs/rule.md §5`) — เพิ่มเทสแล้วยืนยัน `pass===tests` ผ่าน `check-test-count`
- [ ] **ห้ามแตะไฟล์ของ slice อื่นใน wave/topic เดียวกัน** — `triage.md` (slice 1), `loop-tuning.md` (slice 4), `verify.md`/`ship.md` (slice 3) — file-ownership disjoint ของ DAG

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

- [ ] rule ที่เสนอ: **prompt ของ workflow script ต้องมี unit test คุ้ม contract** — `prompt()`/instruction-builder ใน `.warnyin/workflow/scripts/*.mjs` เป็น contract ที่ agent ปลายทาง execute ต่อ ต้องมีเทสทั้ง **เชิงบวก** (สิ่งที่ agent ต้องถูกสั่งให้อ่าน/ทำ) และ **เชิงลบ** (เอกสารที่ตัดออกแล้วต้องไม่โผล่กลับ) ด้วย extractFn + `new Function` (KB#16) — เหตุผล: การแก้ prompt ที่ผ่านมาไม่มี test คุ้มเลย (มีแต่ normalizeTasks/buildOpts) — reading-list bloat regress กลับได้เงียบๆ โดย suite เขียว; target: `docs/techstack/installer/rule.md` §build orchestration
