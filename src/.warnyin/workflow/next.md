# NEXT — เช็คงานค้าง + แนะนำขั้นตอนถัดไป (read-only)

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: ตอบคำถาม "ตอนนี้มีงานอะไรค้าง และควรไปต่อยังไง" จากสถานะจริงในไฟล์ — **ไม่สร้างหรือแก้ไฟล์ใดๆ**

---

## 1. NEXT คืออะไร / ใช้เมื่อไหร่

NEXT คือโหมด **อ่านอย่างเดียว (read-only)** — ไม่ใช่ stage, ไม่มี gate, ไม่มี output ไฟล์
ใช้เมื่อ: กลับมาทำงานต่อแล้วจำไม่ได้ว่าค้างตรงไหน, อยากเห็นภาพรวมทุก topic, หรืออยากรู้ว่า command ถัดไปคืออะไร

---

## 2. วิธีหาสถานะ (สแกนจากไฟล์จริง — ไม่ถาม user ก่อน)

0. **structural pre-scan (ถ้ารัน node ได้):** ถ้ารัน node ได้ → รัน `node .warnyin/workflow/scripts/validate-topic.mjs` (โหมด status) เป็น structural pre-scan ก่อน แล้วค่อยอ่านเชิง semantic เฉพาะจุดที่ต้องตัดสิน — เครื่องที่รันไม่ได้ ใช้ตาราง heuristic ด้านล่างเหมือนเดิม; อ่าน `docs/backlog.md` (global — default-exclude `achieved/`) นับ entry `open` เพื่อรายงานใน §3
1. **หา topic ที่ active:** โฟลเดอร์ใน `docs/stages/<slug>/` ทั้งหมด ยกเว้น `achieved/` และ `context.md`
   - ไม่มี topic เลย → รายงานว่า "ไม่มีงานค้าง" + แนะนำเริ่มงานใหม่ด้วย `/warnyin:discovery` หรือ `/warnyin:design`
2. **อ่าน `docs/stages/context.md`** — บริบทงานที่จดไว้ (ถ้ามี)
3. **ต่อ topic — ระบุ stage ปัจจุบันจาก artifact ที่ "ถูกเติมจริง":**
   ไฟล์ที่ยังเป็นโครง template (มี placeholder `<...>` / ตารางว่าง) = **ยังไม่ทำ** — ดูเนื้อหา ไม่ใช่แค่ว่าไฟล์มีอยู่

   | artifact ที่เติมแล้วล่าสุด | stage ปัจจุบัน | ขั้นถัดไป |
   |---|---|---|
   | ยังไม่มีอะไรเติม | ยังไม่เริ่ม | `/warnyin:discovery <slug>` หรือ `/warnyin:design <slug> <change>` ถ้า scope ชัด |
   | `discovery.md` / `research.md` | Discovery | เช็ค gate ของ `stages/discovery.md` → ผ่านแล้วไป `/warnyin:design` |
   | `proposal.md` / `design.md` / `tasks/` | DESIGN | เช็ค gate ของ `stages/design.md` → ผ่านแล้วไป `/warnyin:build` |
   | `receipt.md` เติมแล้ว (ไม่มี proposal/design filled · ไม่มี tasks/ จริง) | fast-track | receipt §3/§4 ยังไม่เติม → `/warnyin:fastlane <slug>` (resume); เติมครบทุก section → `/warnyin:ship` |
   | `build.md` / task มีสถานะ `กำลังทำ`-`เสร็จ` | BUILD | task ค้าง → `/warnyin:build` ต่อ; ครบแล้ว → `/warnyin:verify` |
   | `test.md` / `verify.md` | VERIFY | เช็ค gate ของ `stages/verify.md` → ผ่านแล้วไป `/warnyin:ship` |
   | `ship.md` เติมแล้วแต่ topic ยังไม่ถูก archive | SHIP ยังไม่จบ | รัน `/warnyin:ship` ให้จบ (promote ขึ้น `docs/` + ย้ายไป `achieved/`) |

4. **งานค้างระดับ task (เฉพาะ topic ที่อยู่ BUILD):** ไล่ `tasks/*/task.md` — ช่อง **สถานะ** (`รอ build` / `กำลังทำ` / `เสร็จ`) + checkbox ของ sub-tasks/acceptance ที่ยังไม่ติ๊ก
5. **เช็ค gate ของ stage ปัจจุบัน:** เปิด playbook ของ stage นั้นใน `.warnyin/workflow/stages/` แล้วไล่ checklist gate ว่าข้อไหนยังไม่ครบ — ข้อที่ขาดคือ "งานค้าง" ที่แท้จริง

---

## 3. รูปแบบรายงาน (ตอบในแชทเท่านั้น)

1. **ตารางภาพรวม:** topic · stage ปัจจุบัน · งานค้าง/gate ที่ขาด · command ถัดไปที่แนะนำ · backlog: N รายการ open (จาก `docs/backlog.md`; ถ้าไม่มีไฟล์ → ระบุ "–")
2. **รายละเอียดต่อ topic** (เฉพาะที่มีงานค้าง): ข้อ gate ที่ยังไม่ผ่าน, task ที่ยัง `รอ build`/`กำลังทำ`, open question
3. **คำแนะนำลำดับงาน:** ถ้ามีหลาย topic ให้เสนอว่าควรทำอันไหนก่อนพร้อมเหตุผลสั้นๆ — ตัดสินใจสุดท้ายเป็นของ user

## 4. หลักการ

1. **Read-only เด็ดขาด** — ห้ามสร้าง/แก้/ลบไฟล์ รวมถึง `context.md`; ถ้าพบว่าสถานะในไฟล์ล้าสมัย ให้รายงานเป็นข้อเสนอ ไม่แก้เอง
2. **สรุปจาก evidence:** ทุกข้อสรุปอ้างไฟล์/บรรทัดจริง ไม่เดา
3. **แนะนำแล้วหยุด:** ไม่รัน stage ถัดไปให้เอง — เสนอ command ให้ user เป็นคนสั่ง
