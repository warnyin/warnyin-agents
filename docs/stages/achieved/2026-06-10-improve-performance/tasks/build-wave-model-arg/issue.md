# Issue — dry-run: build-wave-model-arg

> ผล dry-run · 2026-06-10 · verdict: **GO (with mandatory refactor)**

## Blocker
- ไม่มี hard blocker — แต่มี **implementation constraint บังคับ** (ถ้าไม่ทำตามจะ build ไม่ผ่าน):

| # | constraint | สถานะ |
|---|---|---|
| B2 | **test ห้าม import build-wave.mjs ตรง** (top-level return/await + injected globals → `import`/`node --check` พัง; troubleshooting KB #16) → ใช้ runtime-extract (`fs.readFileSync` + `new Function` inject globals ปลอม) | ✅ **เพิ่มใน standard.md §2** |
| B3 | **สกัด `normalizeTasks` + `buildOpts` เป็น pure helper** เพื่อ test ได้ (opts ปัจจุบันประกอบ inline ใน `parallel(tasks.map)`) | ✅ **เพิ่มใน standard.md §2** |
| B1 | test ทุกเคส unconditional ห้าม skip (กัน `pass!==tests` ของ check-test-count) | ✅ **เพิ่มใน standard.md §2** |

## Defer
| # | ประเด็น | เหตุผล |
|---|---|---|
| D1 | **executable e2e proof** (harness อ่าน `model` แล้ว route จริง) | unit test พิสูจน์แค่ "ส่ง key model ถูก" (mechanism); harness บริโภคจริง → defer ไป dogfood topic ถัดไป (precedent branch-fix) — by design §8 (QA-S1) |
| B4 | `agent().model` รองรับ — ยืนยันจาก research ไม่มี local proof | design รับ scope แล้ว (acceptance = ส่ง key ถูก) |

## สรุป
ไม่มี blocker ค้าง — constraint B1/B2/B3 ใส่ standard.md แล้ว, D1/B4 by-design
