# Verify — context-working-memory

> สรุปผล VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> guideline: `docs/techstack/installer/test.md` · แผนเทส: `./test.md`

| | |
|---|---|
| **Slug** | `context-working-memory` |
| **วันที่ verify** | 2026-06-08 |
| **ผล** | ✅ ผ่านทุกข้อ — เข้า SHIP ได้ |
| **จำนวนรอบแก้ (code/payload)** | **0** (ไม่มี regression — code ถูกทั้งหมด) |
| **จำนวนแก้ (verifier harness)** | 1 จุด (false-positive ของคำสั่งเทสเอง — ไม่ใช่ change) |
| **Local env** | zero-service — `npm test` + temp dir spawn `src/bin/cli.mjs` (ห้ามรันที่ repo root, troubleshooting #6) |

---

## 1. จุดประสงค์ที่ verify (เจตนาของ topic)
ทำให้ `docs/stages/context.md` เป็น **working-memory ข้าม topic** ที่ใช้งานได้จริง:
1. installer scaffold context.md ด้วย **skeleton 4 section** (canonical `design.md` §3) — **seed-if-absent** ห้ามทับของ user
2. **SHIP เป็น producer** (append ไฮไลต์ตอน archive) + readers (next/discovery/explore) รู้ว่ามันคือ **working-notes** ไม่ใช่ status board
3. ไม่มี regression: installer เดิม + payload cleanliness + lint ยังเขียว

## 2. ผลเทสตามแผน (`test.md` A–D)

### A. Functional
| # | เคส | ผล | หลักฐาน |
|---|---|---|---|
| A1 | `npm test` (node --test bare) | ✅ | tests **58 / pass 58 / fail 0**, exit 0 — pass==tests ≥ MIN_PASS 9 (ผ่าน pass-count gate, anti-false-green) |

### B. Executable install proof (temp dir — spawn จริง, ไม่แตะ repo root)
| # | เคส | ผล | หลักฐาน |
|---|---|---|---|
| B1 | install สด → context.md non-empty + 4 header | ✅ | exit 0; ไฟล์ non-empty; `grep '^## '` = 4 (โฟกัส/ธีม · Decision ข้าม topic · Parking lot · เพิ่ง ship) ตรง canonical |
| B2 | seed-if-absent (install) → byte-equal | ✅ | pre-write context.md user → install → `cmp -s` = byte-equal (ไม่ทับ); log ไม่มี `+ docs\stages\context.md` (skip จริง) |
| B3 | `--update` → ไม่ทับ | ✅ | `cmp -s` หลัง `--update` = byte-equal เดิม |
| B4 | no-leak (scaffold เปล่า) | ✅ | `docs/stages/` มีแค่ `achieved/.gitkeep` + `context.md` — ไม่มี topic ต้นทาง (context-working-memory / memory-identity) รั่ว |

### C. Package cleanliness
| # | เคส | ผล | หลักฐาน |
|---|---|---|---|
| C1 | `npm pack --dry-run --json` → template ติด + ไม่ leak | ✅ | `src/.warnyin/template/stages/context.md` อยู่ใน tarball; path ที่ขึ้นต้น `docs/` / `src/tests/` / `src/scripts/` = **0**; รวม 78 paths สะอาด (ใช้ `npm pack --json` แทน `verify-pack.mjs` — Windows ENOENT, troubleshooting #4) |

### D. Payload consistency
| # | เคส | ผล | หลักฐาน |
|---|---|---|---|
| D1 | `lint:md` dead-link | ✅ | 83 ไฟล์ 44 ลิงก์ เขียว, exit 0 |
| D2 | readers = working-notes ไม่ใช่ status board | ✅ | `explore.md:22`, `discovery.md:27`, `next.md:20` ระบุ "working-notes ข้าม topic … ไม่ใช่ status board / status derive จาก scan" |
| D3 | next.md read-only invariant คงเดิม | ✅ | `next.md:46` "Read-only เด็ดขาด — ห้ามสร้าง/แก้/ลบไฟล์ รวมถึง context.md"; ไม่เพิ่มหน้าที่เขียน |
| D4 | ship.md producer step + gate item | ✅ | `ship.md:50` process §4 "SHIP เป็น producer" + `:55` "อย่าจด status board (unify-in-place)" + `:86` gate "context.md ถูก maintain — append + prune 5 + อัปเดตโฟกัส" |
| D5 | canonical เดียว | ✅ | ทุกจุดชี้ `.warnyin/template/stages/context.md`; producer เต็ม = ship.md เท่านั้น (readers = pointer บาง); `validate-topic.mjs:242` SKIP context.md (ตรง design §6) |

### dogfood (task-2 spec §7)
- **structural proof ✅** — เดินกติกา SHIP §4.4 ด้วยมือ: append 1 แถว "เพิ่ง ship" ลง copy ของ skeleton → sections คงที่ 4=4 (ไม่พัง), แถวใหม่อยู่ใต้ section สุดท้าย "เพิ่ง ship" ถูกที่ → schema รองรับ producer contract จริง
- **dogfood เต็ม** (รัน `/warnyin:ship` จริงแล้ว context.md ได้แถวจริง) = จะเกิดตอน SHIP ของ topic นี้เอง (producer contract robust: "section/ไฟล์ไม่มี → สร้างจาก canonical")

## 3. Regression baseline
feature **ADDED** (ไม่มี `docs/features/context-working-memory/spec.md` เดิม — SHIP จะสร้าง) → baseline = installer.test **9 เคสเดิม** (อยู่ใน 58 ที่ผ่าน) + payload cleanliness + lint-md → **เขียวทั้งหมด ไม่มี behavior เดิมพัง**

## 4. รายการแก้ไข + จำนวนรอบ
- **code / payload:** ไม่มีการแก้ — **0 รอบ** (ทุกเคสผ่านตั้งแต่รอบแรก; BUILD ส่งมาเขียว 58/58 อยู่แล้ว)
- **verifier harness (ไม่ใช่ change):** 1 จุด — C1 รอบแรกรายงาน `LEAK=yes` ลวง เพราะคำสั่งเทสเขียน `grep … | head` ใน `if` → exit code มาจาก `head` (0 เสมอ) บัง exit ของ grep (= **troubleshooting #13** เป๊ะ: pipe บัง exit code). แก้โดยรัน grep ตรงไม่ผ่าน pipe → ยืนยัน path รั่ว = 0 จริง

## 5. ผล UX/UI
- **N/A** — component = `installer` (CLI tooling) ไม่ใช่ frontend; ไม่มีหน้าจอให้ verify

## 6. Troubleshooting (ปัญหายาก/ซ้ำตอนเทส)
- **ไม่มี entry ใหม่ระดับ topic** — false-positive ของ C1 เป็นการ "ตกหลุม" บทเรียนที่มีอยู่แล้ว (`docs/troubleshooting.md` #13) ในฝั่ง verifier เอง ไม่ใช่ปัญหาใหม่ของ change; เป็น reminder ว่าเช็ค exit ต้องไม่อยู่หลัง `|`

## 7. Gate VERIFY (§6) — ครบทุกข้อ
- [x] เทสตามจุดประสงค์ของ topic ครบ (A functional + B install proof + D consistency + dogfood structural)
- [x] regression ตาม baseline ผ่าน (installer 9 เคส + payload + lint เขียว; ไม่มี feature spec เดิมให้ขัด)
- [x] Frontend UX/UI — N/A (installer ไม่ใช่ FE)
- [x] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่าน (มีแค่ false-positive ของ verifier เอง — แก้คำสั่งเทสแล้วผ่าน; code 0 รอบ)
- [x] `test.md` (แผน) + `verify.md` (สรุป + จำนวนรอบ) เขียนครบ
- [x] ปัญหายาก/ซ้ำบันทึก (ไม่มี entry ใหม่ — อ้างอิง #13 เดิม)

→ **ผ่าน Gate — เสนอเข้า SHIP ด้วย `/warnyin:ship context-working-memory`**
