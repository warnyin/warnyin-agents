# Stage: VERIFY

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: เป็น **strategy tester** — ยืนยันว่า change ที่ build แล้ว "ทำงานถูกตามจุดประสงค์ของ topic" จริง (functional + UX/UI ถ้าเป็น FE) แก้จนผ่าน

---

## 1. VERIFY คืออะไร / ใช้เมื่อไหร่

ใช้หลัง BUILD ผ่าน Gate (full build/test เขียว) — VERIFY ทดสอบ **เชิงพฤติกรรม/จุดประสงค์** ในสภาพแวดล้อมจริง (local env)
ไม่ใช่แค่ unit test ผ่าน แต่ "ของจริงทำงานตามที่ topic ตั้งใจไหม"

---

## 2. ก่อนเทส — อ่านให้เข้าใจก่อนเสมอ

1. **spec + tasks ทั้งหมด** — `warnyin/stages/<slug>/tasks/*/spec.md` + `task.md`, `design.md`, `proposal.md`
   → เข้าใจ **จุดประสงค์ของ topic** และสิ่งที่ต้องยืนยัน (อย่าเทสผ่านๆ โดยไม่เข้าใจ)
2. **`docs/techstack/<component>/test.md`** — guideline ว่าเทสยังไง (เช่น frontend: e2e smoke ผ่าน **playwright-cli**)
   → ถ้า **ไม่มี** guideline → แนะนำว่าควรเทสแบบไหน/วิธีใดได้บ้าง แล้วเขียนแผนลง `test.md`
3. **`docs/infra.md`** — local env / service ที่ต้องรันเพื่อเทส
4. **`docs/troubleshooting.md`** — เผื่อปัญหาที่จะเจอเคยถูกแก้แล้ว

---

## 3. หลักการทำงาน (operating principles)

1. **เข้าใจจุดประสงค์ก่อนเทส** — เทสตามเจตนาของ topic ไม่ใช่แค่ให้เขียว
2. **เทสในสภาพแวดล้อมจริง (local env)** — รัน service ที่เกี่ยวข้องใน local แล้วเทสตามแผน
3. **ใช้ guideline จาก `test.md`** ของ techstack; ถ้าไม่มีให้เสนอวิธีเทสที่เหมาะแล้วเขียนแผนเอง
4. **Frontend → verify UX/UI ด้วย** (ไม่ใช่แค่ functional — ดู layout, state, flow, ความถูกต้องของหน้าจอ)
5. **ข้อไหน verify ไม่ผ่าน → แก้จนผ่าน (loop)** และ **นับจำนวนการแก้ไข/จำนวนรอบ**
6. **ปัญหายาก/ซ้ำในขั้นนี้ → บันทึก `warnyin/stages/<slug>/troubleshooting.md`** (เหมือน BUILD); เจอปัญหา → อ่าน `docs/troubleshooting.md` ก่อน
7. **นาน/หลายรอบเกินไป → พิจารณาถาม user ทีละข้อ + เสนอคำตอบที่แนะนำ** (อย่าวนแก้เงียบๆ ไม่จบ)
8. **ห้ามแตะไฟล์กลางใน `docs/`** — แผนเทสเขียนระดับ topic ที่ `test.md` ก่อน รอ SHIP merge เข้า `docs/techstack/<component>/test.md`
9. **สวม role QA** — ทำตาม role card `warnyin/workflow/roles/qa.md` (lens: คิดแบบผู้ใช้จริง + คนหาเรื่อง, edge case, regression; checklist ครบทุกข้อ)

---

## 4. ลำดับขั้นการทำงาน (process)

0. **★ เช็ค context window ก่อนเริ่ม:** ประเมินว่า context ของ session ปัจจุบันถูกใช้ไปมากน้อยแค่ไหน — ถ้าใช้ไปเยอะหรือ **เกินครึ่ง** → **เสนอ user ให้ `/compact` หรือ `/clear` ก่อนเสมอ** แล้วค่อยเริ่ม VERIFY ใน context ที่โล่ง (สถานะงานอยู่ในไฟล์ `warnyin/stages/<slug>/` ครบ ไม่หายไปกับ context) — VERIFY เป็นลูปเทส-แก้ที่อาจยาว ต้องมี context เหลือมากพอ; เครื่องอื่นที่ไม่มีคำสั่งนี้ → แนะนำเริ่ม session ใหม่
1. **เข้าใจจุดประสงค์:** อ่าน spec/tasks/design → สรุปสิ่งที่ต้อง verify (functional + UX/UI)
2. **วางแผนเทส → เขียน `test.md`:** ตาม guideline `docs/techstack/<component>/test.md`; ไม่มีก็เสนอวิธี (e2e smoke / integration / manual ฯลฯ) แล้วเขียนแผน
3. **เตรียม local env:** รัน service ที่เกี่ยวข้องตาม `infra.md`
4. **รันเทสตามแผน:** functional ตาม test-flow ใน spec; FE → e2e smoke (playwright-cli) + ตรวจ UX/UI
5. **ไม่ผ่าน → แก้ → rerun:** วนจนผ่าน **นับจำนวนรอบ/จำนวนแก้**; ปัญหายาก→`troubleshooting.md`; ถ้านานเกิน→ถาม user (ทีละข้อ + recommended)
6. **เขียนสรุป `verify.md`:** ผลเทส + รายการแก้ไข + **จำนวนการแก้ไข** + ผล UX/UI
7. **ปิดงาน:** เสนอเข้า SHIP ด้วย `/warnyin:ship`

---

## 5. Output (สร้างที่ `warnyin/stages/<slug>/`)

| ไฟล์ | เนื้อหา | ปลายทางตอน SHIP |
|---|---|---|
| `test.md` | แผน/วิธีเทสของ topic (cases, env, e2e smoke, UXUI checklist) | merge เข้า `docs/techstack/<component>/test.md` |
| `verify.md` | สรุปผล verify + รายการแก้ไข + จำนวนรอบที่แก้ | (เก็บใน archive) |
| `troubleshooting.md` (อัปเดต) | ปัญหายาก/ซ้ำที่เจอตอนเทส | merge เข้า `docs/troubleshooting.md` |

---

## 6. Gate → เข้า SHIP ได้เมื่อ

- [ ] เทสตาม **จุดประสงค์ของ topic** ครบ (functional ตาม test-flow ใน spec)
- [ ] Frontend: **UX/UI verify ผ่าน**
- [ ] ทุกข้อที่ไม่ผ่านถูกแก้จน **verify ผ่านหมด**
- [ ] `test.md` (แผน) + `verify.md` (สรุป + จำนวนการแก้ไข) เขียนครบ
- [ ] ปัญหายาก/ซ้ำถูกบันทึก `troubleshooting.md`

ยังไม่ครบ → อยู่ VERIFY ต่อ ห้ามข้ามไป SHIP
