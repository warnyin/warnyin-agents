# INIT — วิเคราะห์โปรเจกต์ + เติม docs/ ครั้งแรก

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: ทำให้ `docs/` สะท้อนโปรเจกต์จริง — เพื่อให้ทุก stage (Discovery→SHIP) เริ่มจากความรู้ที่ถูกต้อง ไม่ใช่โครงว่างเปล่า

> ⚠️ **Deliverable ของ INIT = ไฟล์จริงที่ถูกเขียนลงดิสก์ใน `docs/`**
> การวิเคราะห์แล้วสรุปในแชทอย่างเดียว **ถือว่ายังไม่จบงาน** — INIT จะจบได้ก็ต่อเมื่อทุกไฟล์ในตาราง §4 ถูก write ลง `docs/` จริงและผ่าน gate §5

---

## 1. INIT คืออะไร / ใช้เมื่อไหร่

ใช้ **ครั้งแรกหลังติดตั้ง workflow** ลงโปรเจกต์ (`npx github:warnyin/warnyin-agents`)
หรือเมื่อ `docs/` ยังว่าง/ล้าสมัยจนใช้อ้างอิงไม่ได้ — INIT ไม่ใช่ stage ของงาน แต่เป็นการ **ปูพื้นความรู้** ให้ workflow ทำงานได้เต็มประสิทธิภาพ

---

## 2. หลักการทำงาน (operating principles)

1. **โค้ดตอบได้ → อ่านโค้ดเอง ห้ามเดา** — structure, techstack, convention, วิธี build/test, infra วิเคราะห์จาก **โค้ดจริง + config จริง** เท่านั้น
2. **ข้อมูลธุรกิจโค้ดตอบไม่ได้ → สัมภาษณ์ user ผ่าน role lens เฉพาะทาง** — เป้าหมายโปรเจกต์ ลูกค้า ขอบเขต ความสำคัญ: AI หลัก **สวม lens ของ BA** (`warnyin/workflow/roles/ba.md`) และ **PO** (`warnyin/workflow/roles/po.md`) ใช้ checklist ของทั้งสองเป็นชุดคำถาม — **ถามทีละข้อ + เสนอคำตอบแนะนำทุกครั้ง** (เดาจาก README/โค้ดเป็น recommended answer ให้ user แค่ยืนยัน/แก้)
   - role ที่ต้องคุยกับ user เป็น **lens เสมอ ไม่ใช่ sub-agent** (sub-agent คุยกับ user ไม่ได้) — fan-out sub-agent ใช้ได้เฉพาะงานวิเคราะห์โค้ด read-only (ข้อ 5)
   - ถ้าติดตั้ง skill `product-management` ไว้ (ดู `/warnyin:install-skill po`) → หยิบมาเสริมมุมตอนตั้งคำถาม scope/priority ได้
3. **เสนอ summary ก่อนเขียน** — สรุปสิ่งที่วิเคราะห์ได้ + รายการไฟล์ docs/ ที่จะเขียน ให้ user ยืนยัน **ครั้งเดียว** แล้วจึงเขียนจริง
4. **ไฟล์ docs/ ที่มีเนื้อหาอยู่แล้ว → เติม/อัปเดต ไม่เขียนทับทิ้ง** — ของเดิมของ user มีค่าเสมอ
5. **วิเคราะห์หลาย component ขนานได้** — fan-out sub-agent (read-only) หนึ่งตัวต่อหนึ่ง component; เครื่องที่ไม่มี sub-agent → วิเคราะห์ทีละ component ด้วยหลักการเดียวกัน
6. **ไม่แน่ใจ → ระบุว่า "ยังว่าง รอเติม" ชัดเจน** — ห้ามแต่งเนื้อหาขึ้นเองเพื่อให้ไฟล์ดูเต็ม
7. **เขียนไฟล์จริงเสมอ ห้ามจบแค่สรุปในแชท** — หลัง user ยืนยัน summary ต้อง write ทุกไฟล์ในตาราง §4 ลง `docs/` ด้วย (copy template → เติมเนื้อหา); วิเคราะห์เสร็จแล้วไม่เขียนไฟล์ = งานล้มเหลว

---

## 3. ลำดับขั้นการทำงาน (process)

1. **สแกนภาพรวม:** โครงสร้าง repo, package manifest, ภาษา/framework, แบ่งเป็น **component** อะไรบ้าง (เช่น api-service, admin-console)
2. **วิเคราะห์ลึกต่อ component (ขนานได้, read-only):** โครงสร้างโฟลเดอร์/โมดูล, pattern/convention ที่ใช้จริงในโค้ด, วิธี build/test ที่มีอยู่
3. **วิเคราะห์ infra:** docker/compose, env, service ที่ต้องรันสำหรับ local dev
4. **สัมภาษณ์ user เติมส่วนที่โค้ดตอบไม่ได้ (สวม BA + PO lens):**
   - **ก่อนถาม → สแกนสิ่งที่มีอยู่ก่อนเสมอ:** README, `docs/project.md` เดิม, comment/config ในโค้ด — เอามาเป็น recommended answer; **ถามเฉพาะช่องที่ยัง "ขาดหาย" จริง** ไม่ถามซ้ำสิ่งที่หาคำตอบได้เอง
   - **สวม BA lens** (`warnyin/workflow/roles/ba.md`) ไล่ checklist: ปัญหาจริง/ใครเจ็บ, as-is→to-be, edge case ของ process, ข้อมูล/เจ้าของ, ข้อจำกัด (กฎหมาย/ระบบเดิม), acceptance วัดได้ไหม
   - **สวม PO lens** (`warnyin/workflow/roles/po.md`) ไล่ checklist: persona หลัก, success metric ที่วัดได้, MVP เล็กสุด, priority (must/should/could), why-now, scope-out
   - ถาม **ทีละข้อ + เสนอคำตอบแนะนำทุกครั้ง** (AskUserQuestion) — เป็น lens ของ AI หลัก **ห้าม fan-out sub-agent มาสัมภาษณ์** (คุยกับ user ไม่ได้)
   - ถ้าติดตั้ง `product-management` skill ไว้ → ใช้เสริมมุม scope/priority
   - คำตอบที่ได้ → ใช้เติม `docs/project.md` (เป้าหมาย/ลูกค้า/ขอบเขต) และ `rule.md` ของแต่ละ component (กฎที่ user สั่ง)
5. **เสนอ summary → user ยืนยันครั้งเดียว**
6. **เขียนไฟล์จริงลง `docs/` ให้ครบตาราง §4 (ขั้นบังคับ ห้ามข้าม)** — ทำตามกลไก 6.1–6.4 นี้:

   **6.1 ไฟล์ root** — copy template แล้วเติม:
   ```
   mkdir -p docs
   cp warnyin/template/docs/project.md         docs/project.md
   cp warnyin/template/docs/infra.md           docs/infra.md
   cp warnyin/template/docs/rule.md            docs/rule.md
   cp warnyin/template/docs/troubleshooting.md docs/troubleshooting.md
   ```
   - ไฟล์ไหนมีอยู่แล้วใน `docs/` → **ห้าม `cp` ทับ** ให้เปิดอ่านแล้ว Edit เติมแทน
   - `project.md` → เติมจากผลสัมภาษณ์ user (ข้อ 4) · `infra.md` → เติมจาก config จริง (ข้อ 3) · `rule.md`/`troubleshooting.md` → วางโครงหัวข้อ ใส่ `<!-- ยังว่าง รอเติม -->` ในส่วนที่ยังไม่มีข้อมูล

   **6.2 โฟลเดอร์ component** — วนทำ **ทุก component** ที่ได้จากข้อ 1 (สมมติชื่อจริง `<name>`):
   ```
   cp -R "warnyin/template/docs/techstack/[component]" "docs/techstack/<name>"
   ```
   - ทำซ้ำคำสั่งนี้หนึ่งครั้งต่อหนึ่ง component (เช่น `api-service`, `admin-console`) — **rename เป็นชื่อจริงเสมอ**
   - หลัง copy ครบ → ต้อง **ไม่มี** โฟลเดอร์ `docs/techstack/[component]` (ที่มีวงเล็บ) หลงเหลือ; ถ้ามีให้ลบทิ้ง

   **6.3 เติมเนื้อหา 5 ไฟล์ในแต่ละ component** ด้วย Write/Edit (อิงผลวิเคราะห์ข้อ 2):
   - `about.md` (component คืออะไร/ภาษา/framework) · `structure.md` (โครงโฟลเดอร์) · `standard.md` (convention ที่พบจริง + ยืนยัน user) · `rule.md` (กฎที่ user สั่ง — ถามก่อน ห้ามเดา) · `test.md` (framework/คำสั่งเทส)
   - ส่วนที่ข้อมูลไม่พอ → ใส่ `<!-- ยังว่าง รอเติม -->` ห้ามแต่ง

   **6.4 codemap** — สร้าง `docs/codemap/` ตาม playbook `warnyin/workflow/codemap.md` (token-lean) อย่างน้อยต้องมี `index.md`

7. **Verify ว่าเขียนจริง:** รัน `find docs -type f` เทียบกับตาราง §4 — ทุกแถวต้องมีไฟล์จริง, ทุก component มีครบ 5 ไฟล์, ไม่มีโฟลเดอร์/ไฟล์ที่ยังมี `[component]` (วงเล็บ) หลงเหลือ
8. **รายงานปิดท้าย:** ส่วนไหนยังว่าง/ไม่แน่ใจ ให้ user เติมภายหลัง → พร้อมเริ่มงานแรกด้วย `/warnyin:discovery` หรือ `/warnyin:design`

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

- [ ] **ไฟล์ทุกแถวในตาราง §4 ถูกเขียนลง `docs/` จริง** (ยืนยันด้วย `find docs -type f`) — ไม่มีแถวไหนเหลือแค่ในแชท
- [ ] ไม่มีโฟลเดอร์ชื่อ `[component]` (มีวงเล็บ) หลงเหลือ — ถูก copy เป็นชื่อ component จริงครบทุกตัว
- [ ] `docs/project.md` มีเป้าหมาย/ลูกค้า/ขอบเขต ที่ user ยืนยันแล้ว
- [ ] `docs/techstack/` ครบทุก component ที่พบ (about + structure + standard + test)
- [ ] `docs/codemap/index.md` + `docs/infra.md` ตรงกับโค้ด/config จริง
- [ ] ทุกเนื้อหามาจากโค้ดจริงหรือคำยืนยันของ user — **ไม่มีการเดา**; ส่วนที่ไม่แน่ใจระบุ "ยังว่าง รอเติม" ชัดเจน
- [ ] user รับทราบรายการที่ยังว่าง
