# Spec — playbook-wiring

> feature ประเภท playbook `.md` → THEN observable artifact

## persona
AI/contributor ที่เดิน DESIGN/VERIFY/SHIP — เห็น fast-track hook ชี้ไป triage skip-list

## data-flow
tier ที่ triage ประเมิน → DESIGN §7 / VERIFY / SHIP อ่าน hook → ทำ lite ตาม skip-list canonical (triage.md)

## test-flow (task-scope — structural)
1. **§7 reframe:** `design.md §7` มี 3 tier (fast/standard/large) + markdown-link ไป `triage.md#fast-track-skip-list` ; **ไม่มีตาราง skip-list inline** (grep)
2. **verify hook:** `verify.md` มี pointer hook (markdown-link) tier fast → verify-lite
3. **ship hook:** `ship.md` มี pointer hook (markdown-link) tier fast → ship-lite
4. **correctness floor:** hook ระบุ "test เขียว/archive คงไว้" (ไม่ลด bar standard/large)
5. **README:** `workflow/README.md` มี `triage.md` ใน capability tree
6. **unify:** ไม่มี section/กลไกขนานใหม่ — แทรกในที่เดิม (§7, ใต้ section เดิมของ verify/ship)
7. **lint:md own-file** ผ่าน; cross-file (link ไป triage.md) = full-gate
8. **regression:** Gate ของ design.md (บรรทัด gate เดิม) + flow standard/large ไม่พัง (consistency)

## observable (realize design §9)
- tier large → §7 บังคับ `/warnyin:discovery` (behavior change ที่ตั้งใจ)
- fast-track ครบ 4 stage (DESIGN §7 + BUILD via tier + VERIFY/SHIP hook)
