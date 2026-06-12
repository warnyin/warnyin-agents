# Spec — setup-dogfood-verify

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`logic` (dev-tooling script) — ไม่ใช่ REST API → ข้าม API/UX spec

## 4. Data-flow
```
registry ──resolveExpectedVersion(npm view)──▶ EXPECTED (semver | null=degrade)
EXPECTED ──pin spec──▶ npx --yes @warnyin/agents@<EXPECTED> --update  (env npm_config_prefer_online=true)
                    └─▶ (fallback) npm pack @warnyin/agents@<EXPECTED> → node cli --update
<root>/.warnyin/.warnyin-version ──readStamp()──▶ stamp
verifyInstalled(root, EXPECTED): markers + (stamp vs EXPECTED ตาม truth table §4B) ──▶ bool
```

### Truth table `verifyInstalled(root, expected?)` (canonical = `design.md §4B`)
| เงื่อนไข | คืน |
|---|---|
| CORE markers ไม่ครบ | `false` |
| markers ครบ · expected **falsy** (`undefined`/`null`/`''`) | `true` (degrade + warn loud) |
| markers ครบ · expected set · **stamp ขาด** | `true` (transition + warn) |
| markers ครบ · expected set · stamp = expected (หลัง trim สองฝั่ง) | `true` |
| markers ครบ · expected set · **stamp ≠ expected** | `false` (warn: drift got\<stamp\> want\<expected\>) |

## 5. User-flow
- `npm run setup:dogfood` → เห็น log: query latest, install (pin version), ผล verify; ถ้า drift → warn `⚠ version drift: ติดตั้ง X แต่คาด Y → fallback`; ถ้า degrade → warn `⚠ ข้าม version check (npm view ไม่ได้ผล)`; ทั้งคู่ fail จริง → `exit 1`

## 6. Persona
- **contributor/maintainer** ที่รัน `setup:dogfood` หลัง publish เพื่อ sync root dogfood = registry latest — ต้องการความมั่นใจว่า payload สดจริง (ไม่ stale)

## 7. Test-flow (unit, `src/tests/setup-dogfood.test.mjs` — import ตรง, main-guard กัน side-effect; สร้าง stamp ปลอมตาม contract §4A)
- [ ] **เคสเดิม 1-3 (backward compat):** `verifyInstalled(tmp)` / markers ครบ / partial — ต้องยังผ่านเหมือนเดิม (marker-only เมื่อไม่ส่ง expected)
- [ ] **drift-guard (แก่น):** temp dir มี CORE markers + เขียน stamp `0.1.0\n` → `verifyInstalled(root,'9.9.9')` === **false** (mirror เคส partial→false เดิม — พิสูจน์ drift จับได้)
- [ ] **match:** stamp `0.16.0\n` → `verifyInstalled(root,'0.16.0')` === true
- [ ] **transition (stamp ขาด):** CORE markers ครบ แต่ไม่มีไฟล์ stamp → `verifyInstalled(root,'0.16.0')` === true
- [ ] **degrade:** `verifyInstalled(root, null)` === true · `verifyInstalled(root, '')` === true (markers ครบ) — falsy expected = marker-only
- [ ] **CRLF normalize:** stamp `"0.16.0\r\n"` → `verifyInstalled(root,'0.16.0')` === true (กัน Windows false-drift)
- [ ] **readStamp:** ไฟล์มี whitespace ล้วน → `null` (ตกแถว transition ไม่ใช่ drift)
- [ ] **resolveExpectedVersion parse** (ถ้าแยกเป็น pure helper ได้): input `"npm warn deprecated\n0.16.0\n"` → `0.16.0`; `""` → `null`; `"not-a-version"` → `null` — ★ ถ้า resolveExpectedVersion ผูก spawn ตรง (test ยาก) ให้ refactor parse เป็น pure fn `parseNpmViewVersion(stdout)→string|null` แล้ว unit ตรง (เลี่ยง spawn จริงใน test)
- [ ] **wire-proof (structural):** อ่าน source `setup-dogfood.mjs` → assert ทั้ง `installViaNpx` และ `installViaPack` เรียก `verifyInstalled(repoRoot, expected)` (มี arg ที่ 2) — กัน pack-path เผลอ marker-only (drift ตายเงียบบน Windows). ทำได้ด้วย regex/`includes` บน source string (pattern เดียวกับ structural check ของ topic เดิม)
- [ ] **regression:** `npm test` ทั้ง suite เขียว (pass-count ≥ 9)

> **★ anti-false-green ของ test เอง (panel QA-S3):** drift-guard ต้องใช้ expected ที่ **ต่าง** จาก stamp อย่างชัด (`'9.9.9'` vs `0.1.0`) — ห้าม derive expected จาก stamp เดียวกัน (จะ true เสมอ); และต้องมีคู่ true/false (match→true, drift→false) เพื่อพิสูจน์ว่า compare ทำงานจริงไม่ใช่ return ค่าคงที่
> **★ integration end-to-end (`npm run setup:dogfood` จริง) = defer** — พิสูจน์เต็มได้หลัง publish release ที่มี stamp (ดู `design.md §6/§8`); VERIFY บันทึก snapshot ตามจริงว่ารอบไหนเริ่มจับ drift ได้
