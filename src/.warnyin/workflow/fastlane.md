# FASTLANE — เดินงานขนาด fast จบในคำสั่งเดียว (executor)

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน**
> เป้าหมาย: รับ change ขนาดเล็กจาก user → บังคับ `tier=fast` → เดิน [fast-track skip-list](triage.md#fast-track-skip-list) ครบ 4 row จบในคำสั่งเดียว (pre-flight → code-first → gate → receipt → ship-lite)
> ★ **ไฟล์นี้เป็น "ผู้เดิน" ไม่ใช่ "ผู้ตั้งกฎ"** — rubric / hard-floor / caps / skip-list / gate ของ stage อยู่ที่ canonical เดิม ([triage](triage.md) + `stages/*.md`) — ที่นี่**ไม่ตั้งกฎใหม่ ไม่ลอกกฎซ้ำ** มีแต่ลำดับ + gate + escalation

---

## 1. fastlane คืออะไร / ใช้เมื่อไหร่

executor ของ **fast tier** — ข้ามขั้นประเมินขนาด (บังคับ `tier=fast` ตามที่ user สั่ง) แล้วเดิน skip-list ทั้ง 4 row ต่อเนื่องในคำสั่งเดียว
ใช้เมื่อ: งานเล็ก (1-2 ไฟล์ · modify ของเดิม · ไม่ cross-cutting) และ **user รู้อยู่แล้วว่าเล็ก** — ไม่อยากสั่งทีละ stage

- **ต่างจาก `triage`:** triage = read-only ประเมิน tier แล้วแนะนำแล้วหยุด · fastlane = ลงมือจริง (เขียน receipt + แก้ไฟล์จริง + archive)
- **ต่างจาก flow เต็ม:** flow เต็ม = 4 command แยก (`design` → `build` → `verify` → `ship`) artifact ครบชุด · fastlane = คำสั่งเดียว artifact เดียว (`receipt.md`)
- **★ user-invoked เท่านั้น** — stateful + irreversible (เขียนไฟล์/archive) → ห้ามให้ AI auto-invoke เอง
- งานที่ใหญ่กว่า fast หรือแตะ hard-floor → ไม่ใช่งานของ fastlane โดยตั้งต้น (ดู §2 ข้อ 3 + §5 escalate)

---

## 2. Pre-flight (บังคับ — ก่อนแตะโค้ด)

1. **slug** — user ระบุมา → ใช้ตามนั้น; ไม่ระบุ → ตั้งเองเป็น kebab-case จากคำอธิบาย change แล้ว **บอก user ว่าใช้ slug อะไร**
2. **resume** — มี `docs/stages/<slug>/receipt.md` (เติมแล้ว) อยู่ก่อน → **resume จากจุดที่ค้าง** · ★ **ห้ามเขียนทับ meta / §1 / §2 ที่ประกาศไว้** (กัน goalpost moving); ยังไม่มี → สร้างจาก template `.warnyin/template/stages/receipt.md` (ชี้ ไม่ inline โครง receipt)
3. **★ hard-floor gate (2 ชั้น — ไม่มีทางไปต่อโดยไม่ถาม)** — สแกน change เทียบหมวด hard-floor ที่ [triage §2B](triage.md) (ชี้ ไม่ลอกรายชื่อ):
   - **ไม่แตะ** → ไปต่อ
   - **แตะ** → **เตือนชัด ระบุหมวดที่แตะ + หยุดถาม user 2 ทาง:** `upgrade เป็น standard (/warnyin:design)` | `ยืนยันลุย fast ต่อ`
     - เลือก upgrade → **จบที่นี่** ให้ user สั่ง `/warnyin:design` เอง
     - **ยืนยันลุยต่อ** → บันทึก **หมวดที่แตะ + คำว่า `override โดย user`** ลง receipt meta row Hard-floor (audit trail) → ไปต่อ; ship-lite ปลายทางยอม ship เฉพาะ receipt ที่มี override นี้
4. **git posture** — แก้บน working tree / branch ปัจจุบัน: **ไม่ checkout · ไม่สร้าง branch · ไม่ commit เอง**; อ่าน SHA ปัจจุบันเก็บเป็น `base` ใน receipt meta (git = read-only)
5. **★ เขียน receipt: meta (+ `base`) + §1 (≤3 บรรทัด) + §2 acceptance 1-3 ข้อ — ก่อนแตะโค้ดเสมอ**

---

## 3. ลำดับขั้นการทำงาน

> pointer-per-row — เนื้อกฎอยู่ที่เจ้าของกฎ (คอลัมน์ขวา) ไม่เล่าซ้ำที่นี่

| # | step | เจ้าของกฎ (ไปอ่านที่นี่) |
|---|---|---|
| 1 | pre-flight → **เขียน receipt meta + §1 + §2** (§2 ด้านบน) | [fast-track skip-list](triage.md#fast-track-skip-list) row DESIGN |
| 2 | **แก้โค้ด** — code-first: main loop แก้เอง (ไม่ fan-out build-wave · ไม่ worktree · ไม่ commit) | row BUILD + `stages/build.md §3` · เขียนน้อยที่สุด: [`minimalism`](minimalism.md) |
| 3 | gate loop — test + acceptance (เงื่อนไข: §4) | row VERIFY + `stages/verify.md` · วนแก้อย่างไร: [`loop-tuning`](loop-tuning.md) |
| 4 | เติม receipt §3 (ไฟล์ที่แตะ — จาก `git diff <base>`) · §4 (ผล test) · §5 (learned rule) | row VERIFY / SHIP |
| 5 | ship-lite: สแกน diff เทียบ hard-floor → archive → promote rule ที่มีใน §5 (user ยืนยัน) | row SHIP + `stages/ship.md` |
| — | **อัปเดต project memory** (conditional) | เขียน `docs/stages/context.md` ทับ + บทเรียน → `docs/memory.md`; ไม่มีอะไรเปลี่ยน → ข้าม — ดู [`memory.md`](./memory.md) |

★ ระหว่างทาง **ไม่เขียนไฟล์ report** — note อยู่ในแชท; receipt แตะ 2 ครั้งเท่านั้น (pre-flight / ตอนจบ)

---

## 4. Gate → ปิดงานได้เมื่อ

ship-lite ได้ต่อเมื่อครบทุกข้อ (อ้าง gate เดิมของ stage — ไม่ผ่อนเงื่อนไข):

1. **full test เขียว** (gate ของ `stages/build.md`) **และ** acceptance ใน receipt §2 **ผ่านครบทุกข้อ**
2. **cap 3 รอบ** — แดง/ไม่ผ่าน → แก้วนได้สูงสุด **3 รอบ**; ครบ 3 รอบยังไม่เขียว → **หยุด รายงาน user พร้อม log — ไม่ ship**
3. **ไม่มี test suite ในโปรเจกต์** → **ห้ามเคลมว่าเขียว**: บันทึก `ไม่มี test suite` ลง receipt §4 · gate ตกไปที่ acceptance §2 อย่างเดียว · **เสนอ user เพิ่ม test**
4. receipt ครบ §1-§5 และไม่เกิน cap **40 บรรทัด** ([triage §2D](triage.md))
5. hard-floor scan ของ diff ผ่าน **หรือ** receipt meta มี `override โดย user` (จาก §2) — ไม่เข้าทั้งสอง → **ห้าม ship-lite**

---

## 5. หลักการ

1. **ผู้เดิน ไม่ใช่ผู้ตั้งกฎ** — กฎทุกข้ออยู่ที่ canonical เดิม; เจอกฎที่นี่ไม่ตรงกับ canonical → canonical ชนะ
2. **acceptance ก่อนแก้** — receipt §2 ต้องประกาศก่อนแตะโค้ดเสมอ และห้ามแก้ทีหลังให้เข้ากับผลที่ได้ (กัน goalpost moving)
3. **ไม่ลด bar เพื่อให้ผ่าน** — gate ของ stage เดิมบังคับอยู่แล้ว (`stages/build.md §3`) ห้ามผ่อนเพื่อให้จบเร็ว
4. **escalate ได้ทุกเมื่อ** — พบกลางทางว่างานใหญ่กว่าที่คิด/แตะ hard-floor → หยุด เสนอ upgrade: เติม artifact ที่ fast-track ข้ามไป แล้วเดิน flow tier ใหม่ต่อ — **topic ไม่ต้องเริ่มใหม่** ([triage §2B](triage.md))
5. **ไม่แตะ git** — อ่าน SHA/diff ได้ แต่ไม่ checkout ไม่ branch ไม่ commit; ให้ user เป็นคนตัดสินใจ commit เอง
