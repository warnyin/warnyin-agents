# EXPLORE — สำรวจ/ตอบคำถามแบบ read-only (ไม่สร้าง artifact)

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: ตอบคำถาม/สำรวจข้อมูล โค้ด และเอกสารของโปรเจกต์แบบ **grounded** โดย **ไม่สร้างหรือแก้ไฟล์ใดๆ** — จบที่คำตอบในแชท

---

## 1. EXPLORE คืออะไร / ใช้เมื่อไหร่

EXPLORE คือโหมด **อ่านอย่างเดียว (read-only)** — ไม่ใช่ stage ใน workflow, ไม่มี gate, ไม่มี output ไฟล์

- ใช้เมื่อ: อยากเข้าใจข้อมูล/โค้ด/พฤติกรรมระบบ, ถามเช็คความเข้าใจ, หาว่าอะไรอยู่ตรงไหน, เปรียบเทียบทางเลือกแบบเร็วๆ — **ยังไม่แน่ใจว่าจะกลายเป็นงานจริงหรือไม่**
- ต่างจาก Discovery: Discovery เป็น stage ที่ผลิต `discovery.md` + `research.md` เพื่อเข้า DESIGN — EXPLORE แค่ตอบ ไม่จดอะไรลงไฟล์

---

## 2. Input ที่อ่านเพื่อ ground ตัวเอง (เท่าที่เกี่ยวกับคำถาม — ไม่ต้องครบทุกไฟล์)

1. `docs/project.md` — โปรเจกต์นี้คืออะไร เป้าหมาย ขอบเขต
2. `docs/codemap/index.md` — แผนที่โค้ด (ไปอ่านโค้ดจริงต่อได้)
3. `docs/rule.md`, `docs/infra.md`, `docs/features/*`, `docs/techstack/*` — ตามที่คำถามแตะ
4. `docs/stages/context.md` + topic ที่ **active** ใน `docs/stages/` — งานที่กำลังทำ
   - **`docs/stages/achieved/` = archive (default-exclude):** snapshot ของ topic ที่ ship แล้ว — **current state อ่านจาก 1-3** (project/codemap/rule/features ที่ promote แล้ว); เข้า achieved เฉพาะเมื่อถาม "ประวัติ/ทำไมถึงเป็นแบบนี้" (ดู [`interop`](interop.md) ข้อ 2 "archive ≠ current state")

---

## 3. หลักการทำงาน

1. **Read-only เด็ดขาด:** ใช้เฉพาะการอ่าน/ค้น (read, grep, glob, sub-agent แบบ read-only) — **ห้ามสร้าง แก้ หรือลบไฟล์ใดๆ** รวมถึงไฟล์ใน `docs/stages/` และ `docs/`
2. **โค้ดตอบได้ → ไปอ่านโค้ด:** อ้างอิงคำตอบด้วย `path:line` หรือชื่อไฟล์จริงเสมอ ไม่ตอบจากการเดา
3. **คำถามกว้าง → fan-out:** ถ้าต้องกวาดหลายพื้นที่ ให้กระจาย sub-agent แบบ read-only (เช่น Explore) ขนานกัน แล้วสังเคราะห์คำตอบเดียว — ถ้ามี `.understand-anything/knowledge-graph.json` → อ่าน**ข้อเท็จจริงเชิงโครงสร้าง**เป็นเบาะแสเสริม (ยืนยันกับโค้ดจริงเสมอ); ไม่มี + repo ใหญ่/ไม่คุ้น → แนะนำรัน companion tool — ดู [`interop`](interop.md)
4. **ตอบในแชทเท่านั้น:** สรุปกระชับ ชี้ไฟล์/บรรทัดให้ user ไปต่อเองได้
5. **เจอประเด็นที่ควรเก็บเป็นงาน → เสนอ ไม่ทำเอง:** ถ้าการสำรวจชี้ว่าควรเปิด topic จริง ให้เสนอ `/warnyin:discovery <topic>` (scope ยังกว้าง) หรือ `/warnyin:design <slug> <change>` (scope ชัดแล้ว) — ให้ user เป็นคนตัดสินใจ
