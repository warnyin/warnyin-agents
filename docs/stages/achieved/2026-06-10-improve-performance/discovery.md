# Discovery — improve-performance (เร่งความเร็ว BUILD stage)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `improve-performance` |
| **สถานะ** | `ผ่าน gate แล้ว` (2026-06-10) |
| **วันที่** | `2026-06-10` |
| **ผู้ร่วมตัดสินใจ** | Rujiroj (maintainer) |
| **เริ่มจาก** | `docs/project.md` — playbook 5 stage (`src/.warnyin/workflow/`) |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> ปรับ **playbook กลาง** (DESIGN + BUILD) ให้ BUILD stage เร็วขึ้นอย่างมีหลักการ — แก้ทั้ง **โครงสร้าง** (DAG กว้างขึ้น เดินขนานได้) และ **กลไก** (เวลาต่อ agent ลดลง) เพื่อให้ทุกโปรเจกต์ปลายทางได้ประโยชน์

## 2. Problem & Why now
- **ปัญหา:** BUILD ช้ามาก — 1 wave ใช้ ~2 ชม., สังเกตได้ **agent ตัวเดียว/wave** (ดูเคส `scaffold-foundation`: 4 task = 4 wave ละ 1 ตัว, ↓479.9k tokens/agent)
- **Root cause 2 ชั้น:**
  - **(ก) โครงสร้าง** — `design.md §7` แตก task เป็น dependency chain เส้นตรง (`monorepo-skeleton → api → web → ci`) → ทุก wave มี task เดียว → `build-wave.mjs parallel()` ไม่มีของให้ขนาน
  - **(ข) กลไก** — task ก้อนใหญ่ + `pnpm install` ซ้ำต่อ worktree + self-verify เต็มทุก task (ซ้ำกับ full-gate ตอนท้าย)
- **ทำไมตอนนี้:** เป็นคอขวด UX หลักของ workflow; ยิ่ง dogfood ยิ่งเจอ — กระทบทุก downstream project
- **ผูกกับ project.md:** เป้าหมาย "ติดตั้งแล้ว `/warnyin:*` ใช้ได้ครบ 5 stage" — BUILD ที่ช้าทำให้ stage นี้ใช้งานจริงไม่ไหว

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- แก้ playbook กลางที่ `src/.warnyin/workflow/` (source จริง) → sync ลง root dogfood
- ครอบทั้งโครงสร้าง (DESIGN: DAG width) + กลไก (BUILD: install/self-verify/model)

**Out of scope (จะไม่ทำในรอบนี้)**
- แก้ runtime/installer (`cli.mjs`) — playbook เป็นเอกสารที่ AI อ่าน
- ผูก techstack เฉพาะ (pnpm/turbo) ใน playbook กลาง — ต้อง generic cross-stack
- rewrite `build-wave.mjs` ทั้งตัว — แค่เพิ่ม support `opts.model` per task
- ปรับ stage อื่น (VERIFY/SHIP) นอกเหนือจุดที่กระทบโดยตรง

## 4. Decision Log (เดินทีละกิ่งของ decision tree)

| # | คำถาม / ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| 1 | นิยาม "สำเร็จ" ยึดอะไร | parallelism / เวลาต่อ agent / ทั้งสอง / cost | ทั้งสอง (โครงสร้าง+กลไก) | **ทั้งสอง** | root cause มี 2 ชั้น แก้ชั้นเดียวไม่พอ |
| 2 | วิธีทำ DAG กว้าง | contract-first / re-slice / toolkit / ยอม serialize | toolkit | **Toolkit — ให้ DESIGN เลือกเอง** | generalize, ไม่ over-prescribe; ต้องคู่กับ gate บังคับวัด critical-path |
| 3 | กลไก BUILD เอาตัวไหน | (เลือกหลายข้อ) | ทั้ง 4 | **ลด self-verify ซ้ำ + model routing + dep cache prime + บีบ task/context lean** | user เลือกครบ 4 |
| 4 | วัดความสำเร็จยังไง | structural / empirical / ทั้งสอง | structural + 1 empirical | **Structural เป็น gate + 1 empirical run** | playbook เป็นเอกสาร วัดเวลา deterministic ไม่ได้; รันจริง 1 เคสยืนยัน |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** เคส `scaffold-foundation` เป็นตัวแทน pattern ที่ DESIGN แตก task แบบ chain โดยทั่วไป
- **ข้อจำกัด:** zero-dependency, cross-platform, 2-layer bootstrap (แก้ที่ `src/` เท่านั้น); ห้าม duplicate logic; playbook เป็นเอกสารที่ AI อ่าน (ไม่ใช่ runtime)

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
**Structural (gate — บนกระดาษ):**
- [ ] DESIGN playbook มี **toolkit ลด serialization** (≥3 เทคนิค) + **gate บังคับวัด critical-path depth** ของ DAG
- [ ] BUILD playbook/script รองรับครบ: task=scope-ตัวเอง, model routing per task, dependency cache prime (generic), task/context lean
- [ ] ทุกเทคนิค **generic cross-stack** (ไม่มีคำสั่งผูก pnpm/techstack เฉพาะ)
- [ ] redesign เคส `scaffold-foundation` → DAG ใหม่มี **≥1 wave ที่มี task ขนาน > 1** (พิสูจน์บนกระดาษว่า toolkit ใช้ได้จริง)

**Empirical (ยืนยัน 1 เคส):**
- [ ] รัน BUILD เคส `scaffold-foundation` ด้วย playbook ใหม่ → wall-clock + จำนวน wave ลดลงเทียบ baseline (~2 ชม./wave × 4 wave)

## 7. Feature ideas / ทางเลือกของวิธีแก้
> รายการเต็มจากการวิเคราะห์ (ยังไม่ลงรายละเอียด DESIGN — priority จัดที่ DESIGN)

**โครงสร้าง (DESIGN):**
1. **design.md** — toolkit ลด serialization (contract-first decouple / re-slice ต่างแกน / ยอม serialize chain แท้) ให้ DESIGN เลือกตามเคส
2. **design.md + Gate** — บังคับวาด DAG + คำนวณ critical-path depth + เหตุผลถ้า task ใดถูก serialize (กัน chain โดยไม่รู้ตัว)
3. **design.md §7** — บีบขนาด task + แตก sub-task ที่ขนานได้เป็นคนละ task + task brief กระชับ (context lean)

**กลไก (BUILD):**
4. **build.md ข้อ 4,8** — ลด self-verify ซ้ำ (task = scope ตัวเอง, cross-component build/e2e ไป full-gate)
5. **build-wave.mjs + command** — model routing per task (เบา→haiku, หนัก→opus) ผ่าน `opts.model`
6. **build.md + command** — หลักการ dependency cache prime ก่อน fan-out (generic cross-stack, ไม่ผูก pnpm)

## 8. Open questions (ที่ยังค้าง)
- [x] วิธีหลักทำให้ DAG กว้าง → toolkit (decision #2)
- [x] ขอบเขต out-of-scope → ระบุแล้ว (§3)
- [x] เกณฑ์ความสำเร็จที่วัดได้ → structural gate + 1 empirical (§6)
- [ ] _(ส่งต่อ DESIGN)_ priority/ลำดับ implement ของ 6 feature ideas + reconcile contract-first vs vertical-slice philosophy — เป็นงานออกแบบ ไม่ block gate

## 9. ความเสี่ยงหลัก
- **Contract-first ขัดกับ "vertical slice end-to-end"** — ต้อง reconcile philosophy ไม่ให้ playbook ขัดแย้งตัวเอง
- ขนานมากขึ้น → integration risk สูงขึ้น → full-gate ต้องแข็งแรงพอรับ
- แก้ playbook กระทบทุก project ปลายทาง — regression ต้องระวัง

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- เอกสารโปรเจกต์: `docs/project.md`
- โค้ด/ไฟล์ที่ตรวจสอบ: `src/.warnyin/workflow/stages/{design,build}.md`, `src/.warnyin/workflow/scripts/build-wave.mjs`, `.claude/commands/warnyin/build.md`, `example/docs/stages/scaffold-foundation/`

---

## ✅ Gate → DESIGN (ดู `.warnyin/workflow/stages/discovery.md` ข้อ 6)
- [x] Problem / why-now ชัด ผูกกับ project.md
- [x] Scope in/out ชัด
- [x] Decision log ปิดทุกประเด็นสำคัญ ไม่มี open question ที่ block
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] **user ยืนยัน "เข้าใจตรงกันแล้ว"** (2026-06-10)
