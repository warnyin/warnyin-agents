# Issue — build-log-narrative (dry-run ก่อน BUILD)

> ผล dry-run (fan-out agent อ่าน task+design+โค้ดจริง เดิน implement ในหัว) · 2026-06-08
> **0 blocker · 3 defer**

## Blockers
**ไม่มี** — เดิน implement ทั้ง 4 sub-task (a schema → b compose → c template → d test) ตาม spec/design ได้ตรง; 4 จุดเสี่ยงพิสูจน์กับโค้ดจริงแล้ว:
- (i) เพิ่ม `events` ใน `properties` ไม่ละเมิด `additionalProperties:false` (root + items) + ไม่อยู่ใน `required` → backward-compat; `kind:{enum}` ไม่มี `type` = ตรง pattern `status` เดิม (`build-wave.mjs:36`); ไม่แตะ parallel flow (`:95-109`)
- (ii) main loop ดึง `result.results[].events` ได้จริง — `:109` คืน `results: clean` (array result object); ลอก pattern `troubleshooting` ที่ command `build.md:18` ทำอยู่ 1:1
- (iii) executable trace มีข้อมูลพอ assert 5 proxy (`kind`/`note` + `status`/`summary` required เสมอ + โครง §3.2) — เป็น manual VERIFY proof (ตรง pattern context-working-memory `verify.md`)
- (iv) template `[topic]/build-log.md` ปลอดภัย — `lint-md.mjs:9` EXCLUDE template (ไม่ scan dead-link); `validate-topic.mjs` ไม่แตะ (นอก STAGE_FILES + อยู่ใต้ template/); `installer.test.mjs:48` เช็คแค่ dir ไม่ enumerate ไฟล์

## Defers (track)
| # | defer | สถานะ | การจัดการ |
|---|---|---|---|
| **D1** | sub-task (d) ห้ามเขียน automated `.test.mjs` — build-wave.mjs import ไม่ได้ (top-level `await parallel()` + global runtime, ไม่มี main-guard) + จะทำ test count เกิน 58 ที่ acceptance ตรึงไว้; executable trace ต้องเป็น **manual proof ใน verify.md** ตอน VERIFY | ✅ **closed** | เสริม `task.md` sub-task d + acceptance regression ให้ชัด (clarify ไม่ใช่ design change) |
| **D2** | renumber `prompt()` ตอนเพิ่มข้อ events — วางคู่ข้อ 8 (troubleshooting `:81`) อย่าให้ลำดับ/conditional worktree (`:84-89`) เพี้ยน | track | BUILD จัดการตอน implement (cosmetic, ไม่กระทบ contract) |
| **D3** | rule ใหม่ scope `component:workflow-core` แต่ folder `docs/techstack/workflow-core/` ยังไม่มี | track → SHIP | note ใน `rule.md §2` + `standard.md §4` รอ SHIP; evidence (schema diff + trace + build-log.md จริง) ส่ง SHIP |

## Verdict
**พร้อม BUILD** — 0 blocker; D1 ปิดด้วยการ clarify task (manual trace ไม่ใช่ test file), D2/D3 track (user รับทราบ — D2 cosmetic ระหว่าง implement, D3 รอ SHIP)
