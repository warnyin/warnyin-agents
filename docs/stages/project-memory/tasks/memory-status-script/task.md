# Task — memory-status-script

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `memory-status-script` |
| **Slice อ้างอิง** | `design.md` slice #5 (T5) |
| **Component** | `workflow core` (script) + `installer` (test suite) |
| **Model tier** | `balanced` |
| **สถานะ** | `build เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
ให้ผู้ใช้/agent **เห็นสุขภาพ project memory แบบ deterministic** — ขนาด `context.md`, จำนวน entry แยกตามสถานะใน `docs/memory.md`, วันที่อัปเดตล่าสุด และ ⚠ เมื่อเกินเกณฑ์ `design.md §3.3` — ผ่าน script zero-dep ที่ **read-only, exit 0 เสมอ, ไม่พิมพ์เนื้อ entry** พร้อม unit ที่ล็อก parse contract ทุกชั้น

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** ไม่มี — **wave 1 อิสระเต็มตัว** (สเปกทั้งหมดอยู่ `design.md §4 C10` แล้ว ไม่ต้องอ่านไฟล์ปลายทางของ task อื่น; fixture ในเทสเป็น string ในไฟล์เทสเอง ไม่อ่าน template ของ T1)
- **ปลดล็อกให้:** T6 (`release-hygiene`) — full gate (`npm test` / `verify:pack`) เห็นไฟล์นี้ครบตอน integrate
- **ส่งต่อ:** ไฟล์ `memory-status.mjs` ที่ T2 (hook C5a/C5b ใน `next.md`) และ T1 (registry C11 ใน `README.md`) อ้างถึง

### ★ ห้ามแตะไฟล์ของ task อื่น (cross-task note — `design.md §7`)
- **ห้ามแตะ `src/.warnyin/workflow/next.md`** — hook C5a/C5b เป็นของ **T2** (T2 เป็นคน copy เอง)
- **ห้ามแตะ `src/.warnyin/workflow/README.md`** — registry entry ของ `scripts/memory-status.mjs` (C11) เป็นของ **T1**
- ไม่ต้องรอ 2 ไฟล์นั้น และ **ห้ามเขียนเทสที่ assert เนื้อของ 2 ไฟล์นั้น** (จะแดงเปล่าใน worktree ของ T5)

## 3. Sub-tasks
- [x] 1. **เขียน pure fn `summarize()`** ใน `src/.warnyin/workflow/scripts/memory-status.mjs` ตาม parse contract `spec.md §4` คำต่อคำ (normalize CRLF → row-based entry → status closed-set → `lastUpdated` → `flags`) — _ผลลัพธ์:_ `export function summarize({ contextText, memoryText, now })`
- [x] 2. **เขียน main + main-guard** — อ่าน 2 ไฟล์จาก `rootDir` (ENOENT → `null` ไม่ throw ไม่ leak absolute path), render รายงาน (ตัวเลข/วันที่/flag เท่านั้น), `process.exitCode` คง 0 — _ขึ้นกับ 1_
- [x] 3. **เขียน `src/tests/memory-status.test.mjs`** — เคส U1–U12 + S1–S3 + N1 ตาม `spec.md §7` (fixture ค่าไทยจริงตาม schema 6 คอลัมน์) — _ขึ้นกับ 1+2_
- [x] 4. **falsifiability check** — ชั่วคราวเปลี่ยน entry-detector ให้ยอมรับบรรทัด `|` ทุกบรรทัด → เคส legend-only (U3) ต้อง **แดง** → คืนโค้ดเดิม → เขียว (พิสูจน์ว่าเทสจับ legend จริง ไม่ผ่านเงียบ) — ยืนยันแล้ว: mutate แล้ว U3/U4/U5 แดง (unknown=3 แทน 0), revert แล้วเขียวครบ 16/16
- [x] 5. **รัน gate ของ scope ตัวเอง** — `npm test` เขียว (`pass === tests`) + ไฟล์ `.mjs` เป็น **LF ล้วน** (`eol.test.mjs` EOL1/EOL2 ต้องยังเขียว) — `npm test` = 167/167 pass, `check-test-count.mjs` ผ่าน

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/.warnyin/workflow/scripts/memory-status.mjs` — **ใหม่**
- `src/tests/memory-status.test.mjs` — **ใหม่**
- **ไม่แตะอย่างอื่นทั้งสิ้น** โดยเฉพาะ: `src/.warnyin/workflow/next.md` (T2) · `src/.warnyin/workflow/README.md` (T1) · `src/scripts/check-test-count.mjs` (`MIN_PASS` เป็น floor ไม่ใช่ยอดจริง — gate ที่ทำงานจริงคือ `pass === tests`) · `src/bin/cli.mjs` · `package.json` · `CHANGELOG.md` (release hygiene = T6) · root `.warnyin/`, `.claude/`, root `CLAUDE.md` (dogfood gitignored)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
> อ้าง Scenario ครบ 4 ข้อของ Requirement **"มี script รายงานสุขภาพ memory แบบ read-only"** (`design.md §9`)

- [x] **S-A "ไม่มีไฟล์ memory ก็ไม่ error"** — รัน `node .warnyin/workflow/scripts/memory-status.mjs <dir ที่ไม่มี docs/memory.md และ docs/stages/context.md>` → **exit 0** และรายงานแสดง `–` สำหรับไฟล์ที่ไม่มี (เคส S2)
- [x] **S-B "นับเฉพาะแถวข้อมูลจริง ไม่นับ legend"** — `summarize()` กับเนื้อ `memory.md` ที่บรรทัด legend มีครบทั้ง `open`/`promoted`/`dropped` แต่ตารางไม่มีแถวข้อมูล → **`counts` ทุกช่องเป็น 0** (เคส U3 + falsifiability §3 ข้อ 4)
- [x] **S-C "นับ entry แยกตามสถานะ"** — เนื้อที่มีแถวข้อมูล `open` 2 แถว + `promoted` 1 แถว → `counts.open === 2` และ `counts.promoted === 1` (เคส U4)
- [x] **S-D "ไม่พิมพ์เนื้อ entry ออกทาง stdout"** — เขียน `docs/memory.md` ที่มีข้อความบทเรียนเฉพาะตัว → spawn script → stdout **ไม่มี** ข้อความนั้น มีเพียงตัวเลข/วันที่/flag (เคส S3)
- [x] เคสใน `spec.md §7` ครบและเขียวทั้งหมด (U1–U12 · S1–S3 · N1) — **ห้าม `t.skip()`**
- [x] negative properties ครบ (`spec.md §8`): ไม่ import `node:child_process`/`node:http(s)`/`node:net` · ไม่เขียนไฟล์ · ไม่พิมพ์เนื้อ entry · ไฟล์ **LF ล้วน**
- [x] `npm test` เขียว (bare `node --test` — ห้ามใส่ path arg) และ summary `pass === tests`, `fail === 0`
- [x] `git status` ไม่มีไฟล์นอก §4 ถูกแตะ (โดยเฉพาะ `next.md` / `README.md`)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
