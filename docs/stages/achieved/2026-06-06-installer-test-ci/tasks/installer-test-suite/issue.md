# Issue (dry-run) — installer-test-suite

> ผล dry-run 2026-06-06 (agent รัน verify จริงในโฟลเดอร์ temp — read-only ต่อ repo)

## Blocker (แก้แล้วใน `spec.md` ก่อนเข้า BUILD)

| # | blocker | อ้างอิง | การแก้ | สถานะ |
|---|---|---|---|---|
| B1 | harness `cliPath.pathname ?? fileURLToPath(...)` พังบน Windows — `.pathname` คืน `/D:/...` (ไม่เคย null → `??` ไม่ fallback) → spawn MODULE_NOT_FOUND, ทุกเคส false-negative บน dev | `spec.md` harness | ใช้ `fileURLToPath(new URL(...))` ตรง ๆ + `import { fileURLToPath }` | ✅ แก้ใน spec |
| B2 | เคส 5/6 ถ้าพิมพ์ `(0.3-0.5.x)` (hyphen) / `<=0.2.x` จะ `includes()` ไม่เจอ — cli.mjs ใช้ en-dash U+2013 + ≤ U+2264 | `cli.mjs:55,43` | สั่งให้ copy string จาก cli.mjs ตรง ๆ (note ใน spec test-flow) | ✅ แก้ใน spec |

## Defer (ไม่บล็อก BUILD — ตัดสินตอนเขียน)

- **เลือกไฟล์ byte-equal (เคส 2):** ใช้ไฟล์ core ที่ deterministic เช่น `.warnyin/workflow/README.md`
- **เคส 1 อย่า assert เนื้อหาใน `docs/stages/`:** SCAFFOLD copy `docs/stages` จาก repo จริง → temp จะมี topic นี้ติดมาด้วย; assert แค่ `existsSync(docs/stages)` พอ ห้ามนับ entry
- **`engines.node >=18→>=20`:** แก้ `package.json` 1 บรรทัด ทำพร้อม `scripts.test`

## Verify แล้วว่า "ไม่ใช่ blocker" (พฤติกรรม cli.mjs ตรง contract §4)
เคส 1,2,3,4,7,8 — agent รันจริงครบ: byte-equal ทำได้ (`copyFileSync`), marker `installRootDoc` (`cli.mjs:142`) substring ตรง, `seedDocs` ข้าม `[...]` (`cli.mjs:110`) จริง, สอง legacy branch แยกสะอาด

**สรุป: 2 blocker แก้ครบใน spec — task พร้อม BUILD**
