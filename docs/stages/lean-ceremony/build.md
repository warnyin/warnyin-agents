# Build + Verify — lean-ceremony

> Output ของ BUILD + VERIFY stage · playbook: `.warnyin/workflow/stages/build.md`
> รายงานผลการ implement + verify ต่อ topic — artifact เดียว 4 section

| | |
|---|---|
| **Slug** | `lean-ceremony` |
| **Build branch** | `build/lean-ceremony` |
| **Wave** | wave 1 = 4 task ขนาน (worktree) · wave 2 = 1 task (shared-tree) |
| **วันที่** | 2026-08-14 |

## 1. ผล build ต่อ task

| task | สถานะ | ไฟล์ที่แก้ | หมายเหตุ |
|---|---|---|---|
| `design-stage-lean` | ✅ passed | `stages/design.md` · `commands/warnyin/design.md` | 7 จุดแก้ (A1-A7): handoff confirm-once · C5 needle single-source + pointer 3 จุด · signal check ที่ step 6/10 · ตัดคำถามก่อนวาด wireframe · ลบ memory hook — T1-T15 ผ่าน |
| `build-verify-seam` | ✅ passed | `stages/{build,verify}.md` · `template/[topic]/build.md` · ลบ `template/[topic]/{test,verify}.md` · `commands/warnyin/{build,verify}.md` | ยุบ artifact 3→1 (4 section ตาม C1) · W1 ผู้ตรวจอิสระ · W2 confirm handoff · unify 4 duplicate block เหลือ pointer |
| `validator-cap-gate` | ✅ passed | `scripts/validate-topic.mjs` · `tests/validate-topic.test.mjs` | C7 cap gate (pure fn `checkCaps` + const `CAPS`) · section-based VERIFY inference · **+26 เคส** (213 → 239) |
| `memory-hook-lean` | ✅ passed | `workflow/memory.md` · `stages/discovery.md` · `workflow/fastlane.md` | hook 6→3 จุด (ตาราง §5 เหลือ 3 แถว) · C6 คำต่อคำใน `fastlane.md §1` · `ship.md` ไม่ต้องแตะ |
| `release-hygiene` | ✅ passed | `CHANGELOG.md` · `package.json` · `check-test-count.mjs` · `tests/memory.test.mjs` · `workflow/README.md` · `docs/infra.md` | version `0.30.0` · runbook `✖ [C7]` · M2 expected 6→3 · MIN_PASS 200→230 · cross-slice sweep |

**Integration**
- wave 1 integrate ด้วย `git diff > patch` + `git apply` (ไม่ใช้ `git checkout <branch> -- <files>` ตาม KB#11) — 4 patch apply สะอาด ไม่มี conflict (ไม่มีไฟล์ซ้ำระหว่าง slice)
- wave 2 ทำบน shared-tree ของ build branch โดยตรง

**rule/standard ใหม่ที่เสนอ (รอ SHIP)**
> รวบรวมจาก `tasks/<task>/rule.md §2` — 19 ข้อจาก 5 task; ที่เด่น: stage-seam confirm convention · independent-verifier เป็น property ของ stage · เกณฑ์ยุบ artifact ข้าม stage · pointer ต้องระบุพิกัด · hook ที่จุดจบงาน · heading freeze ทนต่อการเปลี่ยนความหมาย

**ปัญหาที่เจอ**
> ดู `./troubleshooting.md`

## 2. Full build & test gate

| gate | ผล |
|---|---|
| `npm test` + pass-count | ✅ **239 tests / 239 pass / 0 fail** (MIN_PASS 230) |
| `npm run lint:md` | ✅ 154 ไฟล์ 111 ลิงก์ |
| `npm run verify:pack` | ✅ 105 ไฟล์ |
| `validate-topic lean-ceremony` (dogfood 0.29.1) | ✅ โครงครบ |
| `validate-topic lean-ceremony` (v-next มี C7) | ✅ โครงครบ — cap ผ่าน (proposal 53/60 · design narrative 66/120) |
| negative-grep memory hook | ✅ พบเฉพาะ `stages/build.md` · `stages/ship.md` · `fastlane.md` |
| template artifact | ✅ มี `build.md` · ไม่มี `test.md`/`verify.md` |

**M2 expected failure ระหว่าง wave 1 (ตามออกแบบ)**
เคส `M2` assert เซตไฟล์ที่มี hook เป๊ะ 6 ไฟล์ — wave 1 ลบ hook คนละไฟล์จึงมองไม่เห็นกัน ผลหลัง integrate wave 1: actual = 3 ไฟล์ตรง contract C7 พอดี ⇒ ใช้เป็นหลักฐาน negative-grep แล้ว `release-hygiene` จึงแก้ expected 6→3 (ไม่ใช่แก้เพราะเทสแดง) · `git diff` ยืนยันว่าแตะเฉพาะ `M2_EXPECTED` + คอมเมนต์/ชื่อเคส

**การแก้ของ main loop หลัง wave 2 (integration review)**
- `CHANGELOG.md §[0.30.0]` — **เขียนใหม่ทั้ง section**: เนื้อหาเดิมที่ agent เขียนคลาดจากงานจริงหลายจุด (ระบุว่า auto-route ไปที่ VERIFY ทั้งที่จริงคือ fastlane · อ้าง signal `gate=optional` บน C7 ที่ไม่มีอยู่ · เขียนว่า "ไม่ต้องเดิน VERIFY loop เพิ่มเติม" ซึ่งขัดกับ W1 · หลายประโยคอ่านไม่เป็นภาษา) — ทุก gate เขียวหมดแต่จับไม่ได้ ตรงกับ `docs/rule.md §5` (เอกสาร narrative ต้อง verify accuracy เทียบ source)
- `docs/infra.md` runbook — แก้ถ้อยคำที่เพี้ยน 3 บล็อก (ตาราง cap · วิธีแก้ข้อ 3 · ข้อระวัง) โครงเดิมถูกต้องแล้ว
- `src/tests/memory.test.mjs` — ชื่อเคส `M2b` ยังเขียน "ต่างจาก 5 ไฟล์ที่เหลือ" → แก้เป็น 2

## 3. แผนเทส (VERIFY)

> ยังไม่เขียน — เป็นของ VERIFY phase

## 4. ผล verify + การแก้

> ยังไม่เขียน — เป็นของ VERIFY phase
