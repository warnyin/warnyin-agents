# INIT — วิเคราะห์โปรเจกต์ + เติม docs/ ครั้งแรก

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: ทำให้ `docs/` สะท้อนโปรเจกต์จริง — เพื่อให้ทุก stage (Discovery→SHIP) เริ่มจากความรู้ที่ถูกต้อง ไม่ใช่โครงว่างเปล่า

---

## 1. INIT คืออะไร / ใช้เมื่อไหร่

ใช้ **ครั้งแรกหลังติดตั้ง workflow** ลงโปรเจกต์ (`npx github:warnyin/warnyin-agents`)
หรือเมื่อ `docs/` ยังว่าง/ล้าสมัยจนใช้อ้างอิงไม่ได้ — INIT ไม่ใช่ stage ของงาน แต่เป็นการ **ปูพื้นความรู้** ให้ workflow ทำงานได้เต็มประสิทธิภาพ

---

## 2. หลักการทำงาน (operating principles)

1. **โค้ดตอบได้ → อ่านโค้ดเอง ห้ามเดา** — structure, techstack, convention, วิธี build/test, infra วิเคราะห์จาก **โค้ดจริง + config จริง** เท่านั้น
2. **ข้อมูลธุรกิจโค้ดตอบไม่ได้ → สัมภาษณ์ user** — เป้าหมายโปรเจกต์ ลูกค้า ขอบเขต ความสำคัญ: **ถามทีละข้อ + เสนอคำตอบแนะนำทุกครั้ง** (เดาจาก README/โค้ดเป็น recommended answer ให้ user แค่ยืนยัน/แก้)
3. **เสนอ summary ก่อนเขียน** — สรุปสิ่งที่วิเคราะห์ได้ + รายการไฟล์ docs/ ที่จะเขียน ให้ user ยืนยัน **ครั้งเดียว** แล้วจึงเขียนจริง
4. **ไฟล์ docs/ ที่มีเนื้อหาอยู่แล้ว → เติม/อัปเดต ไม่เขียนทับทิ้ง** — ของเดิมของ user มีค่าเสมอ
5. **วิเคราะห์หลาย component ขนานได้** — fan-out sub-agent (read-only) หนึ่งตัวต่อหนึ่ง component; เครื่องที่ไม่มี sub-agent → วิเคราะห์ทีละ component ด้วยหลักการเดียวกัน
6. **ไม่แน่ใจ → ระบุว่า "ยังว่าง รอเติม" ชัดเจน** — ห้ามแต่งเนื้อหาขึ้นเองเพื่อให้ไฟล์ดูเต็ม

---

## 3. ลำดับขั้นการทำงาน (process)

1. **สแกนภาพรวม:** โครงสร้าง repo, package manifest, ภาษา/framework, แบ่งเป็น **component** อะไรบ้าง (เช่น api-service, admin-console)
2. **วิเคราะห์ลึกต่อ component (ขนานได้, read-only):** โครงสร้างโฟลเดอร์/โมดูล, pattern/convention ที่ใช้จริงในโค้ด, วิธี build/test ที่มีอยู่
3. **วิเคราะห์ infra:** docker/compose, env, service ที่ต้องรันสำหรับ local dev
4. **สัมภาษณ์ user เติมส่วนธุรกิจ:** เป้าหมายโปรเจกต์ ลูกค้า ขอบเขต — ทีละข้อ + recommended answer
5. **เสนอ summary → user ยืนยันครั้งเดียว → เขียน docs/** (ตามตาราง Output ข้อ 4)
6. **รายงานปิดท้าย:** ส่วนไหนยังว่าง/ไม่แน่ใจ ให้ user เติมภายหลัง → พร้อมเริ่มงานแรกด้วย `/warnyin:discovery` หรือ `/warnyin:design`

---

## 4. Output (เขียน/เติมที่ `docs/`)

> โฟลเดอร์ component จริงให้ copy จาก template `warnyin/template/docs/techstack/[component]/` เป็นชื่อจริง (เช่น `api-service/`) — ห้ามทิ้งโฟลเดอร์ `[component]` ว่างไว้เฉยๆ โดยไม่สร้างของจริง

| ไฟล์ | เนื้อหา | แหล่งข้อมูล |
|---|---|---|
| `docs/project.md` | โปรเจกต์คืออะไร เป้าหมาย ลูกค้า ขอบเขต | สัมภาษณ์ user (+ README เดิมเป็น recommended) |
| `docs/techstack/<component>/about.md` | component นี้คืออะไร ทำหน้าที่อะไร | โค้ดจริง |
| `docs/techstack/<component>/structure.md` | โครงสร้างโฟลเดอร์/โมดูล | โค้ดจริง |
| `docs/techstack/<component>/standard.md` | pattern/convention ที่พบจริงในโค้ด (ยืนยันกับ user) | โค้ดจริง + user |
| `docs/techstack/<component>/rule.md` | กฎที่ user ต้องการบังคับ (ถามก่อน ห้ามเดา) | user |
| `docs/techstack/<component>/test.md` | วิธีเทสที่ใช้อยู่ (framework, คำสั่ง, e2e) | โค้ด/config จริง |
| `docs/codemap/` | แผนที่โค้ดทั้งชุด — สร้างตาม playbook `warnyin/workflow/codemap.md` (token-lean) | โค้ดจริง |
| `docs/infra.md` | local env: service ที่ต้องรัน, วิธีรัน, env vars | config จริง |
| `docs/rule.md`, `docs/troubleshooting.md` | วางโครงหัวข้อ รอเติมระหว่างใช้งานจริง | — |

---

## 5. Gate → จบ INIT เมื่อ

- [ ] `docs/project.md` มีเป้าหมาย/ลูกค้า/ขอบเขต ที่ user ยืนยันแล้ว
- [ ] `docs/techstack/` ครบทุก component ที่พบ (about + structure + standard + test)
- [ ] `docs/codemap/index.md` + `docs/infra.md` ตรงกับโค้ด/config จริง
- [ ] ทุกเนื้อหามาจากโค้ดจริงหรือคำยืนยันของ user — **ไม่มีการเดา**; ส่วนที่ไม่แน่ใจระบุ "ยังว่าง รอเติม" ชัดเจน
- [ ] user รับทราบรายการที่ยังว่าง
