# Verify Report — Project memory

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> สรุปผลการ verify ตามจุดประสงค์ของ topic + การแก้ไขที่เกิดขึ้น

| | |
|---|---|
| **Slug** | `project-memory` |
| **วันที่** | `2026-07-27` |
| **Branch** | `build/project-memory` |
| **ผลรวม** | ✅ **ผ่าน** |
| **จำนวนรอบการแก้ไข (fix iterations)** | **1 รอบ** |
| **จำนวนจุดที่แก้** | **1 จุด** (+ เทส regression 2 เคส) |
| **ผู้ verify** | main loop — **อิสระจาก build sub-agent ที่เขียนโค้ด** (`docs/rule.md §5 ข้อ 4`) |

## 1. จุดประสงค์ที่ verify (จาก spec/tasks)

1. กติกาอยู่ที่เดียว (playbook canonical, ที่อื่นเป็น pointer)
2. ผู้ใช้ใหม่ได้ไฟล์ที่มีโครงจริง — พิสูจน์ที่ **ปลายทางจริง** ไม่ใช่แค่ `src/`
3. workflow เขียน/อ่าน memory จริง ครบ 5 stage + fastlane; BUILD เขียนเฉพาะ main loop
4. ทางออกใช้ gate เดิมของ SHIP — ไม่ลดทอน evidence / user-confirm
5. script รายงานสุขภาพ deterministic — read-only, exit 0 เสมอ, ไม่รั่วเนื้อ entry
6. memory เป็น **data ไม่ใช่ instruction** (trust boundary)
7. ของเดิมไม่พัง — regression `global-install` + gate เดิมของ repo

> **วิธี verify:** ไม่รับ self-report ของ builder เป็นหลักฐาน — เขียน verifier ของตัวเอง 2 ตัว (structural + behavioral)
> ตรวจกับ **ไฟล์จริง/รันจริง** และพิสูจน์ falsifiability ทุกจุดที่เป็นแกน

## 2. ผลการเทส

| # | Test case / flow | ชนิด | ผล | หมายเหตุ |
|---|---|---|---|---|
| V1.1 | `npm test` + pass-count gate | functional | ✅ | **197/197** · `pass===tests` · fail 0 · skipped 0 (เดิม 195 + 2 เคส regression ของ fix) |
| V1.2 | `npm run lint:md` | integration | ✅ | 170 ไฟล์ 109 ลิงก์ · 0 dead link |
| V1.3 | pack cleanliness | integration | ✅ | 107 ไฟล์ · `errors=[]` · payload ใหม่ติดครบ · 0 ไฟล์ CRLF |
| V1.4 | `setup:sandbox` | integration | ✅ | ติดตั้งสด 126 ไฟล์ · root dogfood ไม่ถูกแตะ |
| **V2.1–2.20** | Spec delta ADDED 20 scenario (ตรวจไฟล์จริง) | structural | ✅ **51/51 assertion** | heading freeze 9/9 ตรง C1 · single-source 1 ไฟล์ · template 4 section + closed-set + คำเตือน + 0 markdown-link · hook exact-set 6 ไฟล์ · BUILD main-loop-only · trust clause 3 จุด · ordering · gate 12 · command/registry/root-doc ครบ |
| **V3.1–3.6** | regression `global-install` (8 เคส global ใน suite) | regression | ✅ | รันในสวีทเดียวกัน เขียวครบ (HOME/USERPROFILE override → temp) |
| V3.7–3.8 | root doc เดิมไม่ถูก C6 กลืน | regression | ✅ | local-first convention + marker `warnyin/workflow/stages/` + `<!-- warnyin:global-note -->` ยังอยู่ครบ |
| V3.9 | **MODIFIED** — `init.md` seed ก่อน fallback | regression | ✅ | seed recursive · ข้าม `[...]` · ไม่ทับของเดิม · fallback เฉพาะเมื่อ template ไม่มี |
| **V4.1–4.11** | `memory-status.mjs` behavioral (fixture อิสระ) | behavioral | ✅ **22/22** | legend-only→0 · คละสถานะ · unknown ไม่ throw · CRLF=LF · ไฟล์ว่าง/ไม่มี heading→0 (C13) · flags 60/30/90 **+ คู่ตรงข้าม** · ไม่รั่วเนื้อ entry/absolute path · arg แปลก/traversal→exit 0 · read-only จริง (tree ไม่เปลี่ยน) |
| V4.9 | security invariant | security | ✅ | import จริงมีแค่ `fs`/`path`/`url` · ไม่มี write API · LF ล้วน · `export summarize` |
| **V5.1–5.15** | install proof (สิ่งที่ผู้ใช้ได้จริง) | integration | ✅ **15/15** | playbook/script/command/template ครบ · `docs/memory.md` 1136 B · `docs/stages/context.md` 1399 B (4 heading) · registry ใน `CLAUDE.md`+codebuddy · **0 ไฟล์ CRLF** · รัน `memory-status` ใน sandbox exit 0 |
| **V6** | canonical-copy **คำต่อคำ** เทียบ `design.md §4` | consistency | ✅ **17/17 contract** | C2·C2b·C2c·C3a/b/c·C4a/b/c·C5a/b·C8·C9·C11a/b/c·C12b·C13 — diff ว่างทุกบล็อก |
| **V7** | trust boundary / adversarial | security | ✅ | data-ไม่ใช่-instruction · precedence (rule ชนะ memory) · stale→ห้ามใช้ตัดสิน · **ไม่มี bare-consult** ที่จุดอ่านทั้ง 3 · คำเตือน secret/PII อยู่ในไฟล์ที่ agent เขียนจริง |
| V8.1/8.3/8.4 | EOL fix (งานนอกแผน) | functional | ✅ | `normalizeEol` unit · black-box package CRLF→ติดตั้งเป็น LF · tarball 0 ไฟล์ CR |
| **V8.2** | **RED proof** ของ EOL gate | falsifiability | ✅ | แทรก CRLF ใน `.md` ใต้ `src/` → gate **แดงจริง** → restore → เขียว |
| **V9.1** | **RED proof** heading freeze | falsifiability | ✅ | แก้ชื่อ heading §9 → `memory.test.mjs` **แดงจริง** → restore → เขียว |
| **V9.2** | **RED proof** write hook | falsifiability | ✅ | ถอด hook ออกจาก `fastlane.md` → **แดงจริง** → restore → เขียว |
| V9.3 | **RED proof** ของ fix รอบนี้ | falsifiability | ✅ | ถอด guard placeholder → เทสใหม่ **แดงจริง** → restore → เขียว |

**รวม assertion ที่รันตรงกับไฟล์/พฤติกรรมจริง: 93 (structural) + 22 (behavioral) + 15 (install proof) + 197 (suite)**

## 3. UX/UI verify
**N/A** — topic ไม่มี UI surface (`design.md §1`: playbook/CLI/docs ล้วน · wireframe N/A)
UX ที่ใกล้เคียงที่สุดคือ **output ที่ผู้ใช้เห็นจาก `memory-status`** → verify แล้ว และ**พบข้อบกพร่อง 1 จุด** (ดู §4)

## 4. รายการแก้ไข (สรุปการแก้ระหว่าง verify)

| รอบ | ปัญหาที่เจอ | วิธีแก้ | ไฟล์ที่แก้ |
|---|---|---|---|
| 1 | **fresh install รายงาน HTML comment ดิบ** — `memory-status` พิมพ์ `อัปเดตล่าสุด <!-- YYYY-MM-DD · stage/เหตุการณ์ -->` เพราะ `findLastUpdated()` อ่าน placeholder ของ template เป็นค่าจริง · **inconsistent กับ parser ของอีกไฟล์**: แถวตัวอย่างใน `memory.md` ถูกครอบ `<!-- -->` แล้ว `parseRow()` มองข้ามถูกต้อง (`design.md §3.1` ตั้งใจใช้ convention นี้) แต่ `## อัปเดตล่าสุด` ไม่ได้ใช้กติกาเดียวกัน | เพิ่ม guard: บรรทัดที่เป็น **HTML comment ล้วน = ยังไม่มีค่า** → คืน `null` → แสดง `–` (สอดคล้อง C13 "ไฟล์ว่าง/ยังไม่มี = ถือว่ายังไม่มี") + เทส regression **2 เคส (positive + คู่ตรงข้ามกัน over-fix)** + RED proof | `src/.warnyin/workflow/scripts/memory-status.mjs` · `src/tests/memory-status.test.mjs` |

> **ยืนยันหลังแก้:** ติดตั้งสดใหม่ → `context.md : 18 บรรทัด · อัปเดตล่าสุด –` · suite 197/197 · lint/pack เขียว
> **ไม่มีการลด bar:** ไม่แตะ config/threshold/assertion เดิม — แก้ที่ root cause ของ parser (`config-protection` ข้อ 11 ของ playbook)

## 5. ปัญหายาก/ซ้ำ → troubleshooting
- บันทึกไว้ที่ `./troubleshooting.md`: **มี** — เพิ่ม **TS-5** (placeholder convention ต้องถูกบังคับใช้ให้ตรงกันทุก parser ที่อ่านไฟล์ template ชุดเดียวกัน)
- entry เดิมจาก BUILD ยังอยู่ครบ: TS-1 (CRLF/Workflow) · TS-2 (heading-freeze regex) · TS-3 (compound-needle) · TS-4 (falsifiability manual)

## 6. หมายเหตุถึง user
- **ไม่ได้ถามระหว่างทาง** — ไม่มีจุดที่วนแก้นานหรือกำกวมจนต้องหยุดถาม (fix loop จบใน 1 รอบ)
- **ข้อจำกัดที่ยังคงอยู่ (ไม่ block, มี backlog แล้ว):** `npm run verify:pack` รันตรงบน Windows dev ไม่ได้ (`docs/troubleshooting.md #4`) → ใช้ workaround ที่ KB แนะนำ + unit gate; **ควรให้ CI ubuntu ยืนยันอีกครั้งตอนเปิด PR/SHIP**
- **ยังไม่ได้ dogfood ฟีเจอร์กับ repo นี้เอง** — repo ยังไม่มี `docs/memory.md` / `docs/stages/context.md` จริง (design §6 วางให้เกิดตอน `--update` หลัง release) — พิสูจน์ด้วย sandbox แทนแล้ว

## ✅ Gate → SHIP (ดู `.warnyin/workflow/stages/verify.md` ข้อ 6)
- [x] เทสตามจุดประสงค์ครบ (functional ตาม test-flow + Spec delta 20 scenario)
- [x] regression ตาม baseline — scenario เดิมของ `global-install` ผ่าน + MODIFIED ผ่าน
- [x] FE: UX/UI verify — **N/A** (ไม่มี UI); output ที่ผู้ใช้เห็นถูก verify และแก้แล้ว
- [x] API contract — **N/A** (ไม่มี `openapi.yaml`, ไม่แตะ REST API)
- [x] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่าน (1 จุด · 1 รอบ · มี RED proof)
- [x] `test.md` (แผน) + `verify.md` (สรุป + จำนวนการแก้ไข) เขียนครบ
- [x] ปัญหายาก/ซ้ำบันทึก `troubleshooting.md` แล้ว
