# Verify report — setup-dogfood-version-check

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md` · role: QA
> branch: `build/setup-dogfood-version-check`

## สรุป
- **ผลรวม:** ✅ ผ่านทุกข้อ · **จำนวนการแก้ไข = 0 รอบ** (ทุกเทสผ่านรอบแรก — panel + dry-run จับ blocker หมดตั้งแต่ DESIGN, BUILD ทำตาม spec ครบ)
- **วิธีเทส:** behavioral/functional ผ่าน cli + verifyInstalled จริง (มากกว่า unit) ในสภาพแวดล้อม local (zero-service)
- ไม่มี FE/UX · ไม่มี REST API/openapi → ข้อ UX/contract = N/A

## ผลเทสตามแผน (`test.md`)

### A. Test case ใหม่ (Spec delta ADDED) — stamp install ผ่าน cli จริง
| # | ผล | หลักฐาน |
|---|---|---|
| T1 project stamp | ✅ | `npm run setup:sandbox` (spawn `cli.mjs` จริง) → `<sandbox>/.warnyin/.warnyin-version` = `0.16.0` |
| T2 global stamp | ✅ | `cli.mjs --global` (HOME+USERPROFILE=temp) → `<home>/.warnyin/.warnyin-version` = `0.16.0` |
| T3 dry-run | ✅ | `cli.mjs --project --dry-run` → ไม่มีไฟล์ stamp (log เท่านั้น) |

### B. drift-guard behavioral (จุดประสงค์แก่น) — verifyInstalled จริง + ตรวจ warn
| # | ผล | หลักฐาน |
|---|---|---|
| T4 drift→false | ✅ | stamp `0.1.0` + expected `9.9.9` → **false** + warn `⚠ version drift: ติดตั้ง 0.1.0 แต่คาด 9.9.9 (stale cache?)` — **จับ false-green รอบ 2 ได้จริง** |
| T5 match→true | ✅ | stamp=expected → true, ไม่มี warn |
| T6 transition→true | ✅ | stamp ขาด → true + warn `⚠ payload ไม่มี version stamp` |
| T7 degrade→true | ✅ | `verifyInstalled(root,null)` / `(root,'')` → true (marker-only) |
| T8 CRLF | ✅ | stamp `"0.16.0\r\n"` + expected `"0.16.0"` → true (Windows-safe) |
| T9 parse ทน noise | ✅ | `parseNpmViewVersion("npm warn x\n0.16.0\n")`→`0.16.0`; `""`/`"nope"`→`null` |
| T10 resolveExpectedVersion จริง | ✅ | `npm view @warnyin/agents version` (network) → `0.16.0` (คืน semver จริง) |

### C. Regression + packaging
| # | ผล | หลักฐาน |
|---|---|---|
| T11 global-install baseline | ✅ | 6 scenario install mode (project/global/non-TTY/flag-conflict/idempotent/user-file/homedir-guard) ผ่านใน `installer.test` (ส่วนหนึ่งของ npm test) |
| T12 full suite + lint | ✅ | `npm test` **85 pass / 0 fail** (pass===tests) · `lint:md` ผ่าน (107 ไฟล์) |
| T13 packaging | ✅ | `npm pack --dry-run --json` → stamp **ไม่หลุด** + payload ครบ (83 files, ไม่มี leak) |

### D. Defer
| # | สถานะ | หมายเหตุ |
|---|---|---|
| T14 integration end-to-end | ⏳ DEFER | `setup:dogfood` จริงพิสูจน์เต็มได้หลัง publish release ที่มี stamp |

## ★ Snapshot ของ transition window (บันทึกตามจริง — `design.md §6`)
- ขณะ verify (2026-06-12): registry `@latest` = **`0.16.0`** (ยืนยันด้วย `npm view`) ซึ่ง **ยังไม่มี stamp writer** (feature นี้ยังไม่ publish)
- **ผลที่ตามมา:** ถ้ารัน `npm run setup:dogfood` จริงตอนนี้ → install `0.16.0` (ไม่มี stamp) → `verifyInstalled` เข้าแถว **transition (stamp ขาด → true marker-only)** → **ยังจับ drift รอบนี้ไม่ได้** (ตามที่ design คาดไว้ — ตัวกัน stale คือ pin-exact + prefer-online)
- **drift-guard จะ active เต็มตัว** ตั้งแต่ release ที่ **2** ที่มี stamp เป็นต้นไป (stamp present & ค่าเก่า ≠ latest → false) — VERIFY ยืนยัน logic ถูกต้องด้วย behavioral T4 (จำลอง stamp present + drift → false สำเร็จ)
- **ไม่เคลมเกินจริง:** topic นี้ verify ว่า *logic ถูกต้อง* (T4 พิสูจน์) — *การจับ drift จริง end-to-end* เกิดหลัง publish ≥2 release ที่มี stamp

## การแก้ไขระหว่าง verify
ไม่มี — 0 รอบแก้ (ทุกเทสผ่านรอบแรก)

## Troubleshooting
ไม่เจอปัญหาใหม่ตอน verify · `./troubleshooting.md` คงเดิม (TS-1 verify:pack ENOENT Windows = KB#4 ซ้ำ, TS-2 degrade warn = expected)

---
**Gate VERIFY ผ่านครบ** → เสนอเข้า SHIP ด้วย `/warnyin:ship setup-dogfood-version-check`
