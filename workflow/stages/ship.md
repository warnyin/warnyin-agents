# Stage: SHIP

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: **ส่งมอบ** — promote ความรู้ระดับ topic ขึ้นเอกสารกลางใน `docs/` + archive topic เข้า `warnyin-stages/achieved/`

---

## 1. SHIP คืออะไร / ใช้เมื่อไหร่

ใช้หลัง VERIFY ผ่าน Gate แล้ว — SHIP ปิดวงจรของ topic โดยยกความรู้ที่เกิดขึ้นระหว่างงาน
(feature, rule/standard ใหม่, วิธีเทส, troubleshooting, โครงสร้างโค้ดที่เปลี่ยน) ขึ้น **เอกสารกลางถาวร** ใน `docs/`
แล้ว archive ทั้ง topic — เพื่อให้งานถัดไปเริ่มจากความรู้ล่าสุดเสมอ

> SHIP เป็นเรื่อง **เอกสาร + archive เท่านั้น** — การ merge โค้ด (build branch → main / PR) จัดการเองนอก workflow

---

## 2. Input ที่ต้องอ่านก่อนเริ่ม

1. `warnyin-stages/<slug>/` **ทุกไฟล์** — discovery, business, proposal, design, build, test, verify, troubleshooting, tasks/*
   → เข้าใจว่า topic นี้ **ทำอะไร ทำอย่างไร** และเกิดความรู้อะไรใหม่บ้าง
2. `tasks/<task>/rule.md` section "เสนอเพิ่ม rule ใหม่ (รอ SHIP)" + `standard.md` — rule/standard ใหม่ที่ note ค้างไว้
3. เอกสารกลางปลายทางที่จะอัปเดต — `docs/features/`, `docs/techstack/<component>/*`, `docs/rule.md`,
   `docs/troubleshooting.md`, `docs/infra.md`, `docs/project.md`, `docs/codemap/`
4. โค้ดจริงที่ change กระทบ — สำหรับอัปเดต structure + code map ให้ตรงความเป็นจริง

---

## 3. หลักการทำงาน (operating principles)

1. **เข้าใจก่อน promote** — อ่าน topic ทั้งหมดให้เข้าใจว่าทำอะไร/ทำอย่างไร แล้วค่อยตัดสินใจว่าความรู้ชิ้นไหนควรขึ้นไฟล์กลางไหน
2. **ขอ user ยืนยัน "ครั้งเดียวก่อนลงมือ"** — สรุป promotion plan (feature ใหม่หรือปรับปรุง, ไฟล์กลางที่จะอัปเดต + สาระที่จะใส่, ชื่อโฟลเดอร์ archive) ให้ user อนุมัติ แล้วจึง execute ไม่ถามซ้ำระหว่างทาง
3. **★ Archive ก่อนอัปเดตเอกสาร** — ย้ายทั้งโฟลเดอร์ `warnyin-stages/<slug>/` → `warnyin-stages/achieved/<YYYY-MM-DD>-<slug>/` (วันที่ของวันที่ SHIP) **ก่อน** เริ่มแก้ `docs/` แล้วอ่านเนื้อหาจาก path ใหม่ระหว่าง promote
4. **กลั่น ไม่ใช่ copy ดิบ** — merge สาระเข้าโครงสร้างของไฟล์กลางเดิม ระวัง duplicate/ขัดแย้งกับเนื้อหาที่มีอยู่; เขียนแบบ "ความรู้ถาวร" ไม่ใช่บันทึกรายงาน
5. **เอกสารต้องตรงโค้ดจริง** — structure/codemap อัปเดตจากการดูโค้ดจริง ไม่ใช่จากความจำหรือ design เดิม
6. **อย่าเดา** — เนื้อหาที่ไม่แน่ใจว่าควร promote หรือควรวางไว้ไฟล์ไหน → ถามทีละข้อ + เสนอคำตอบที่แนะนำ
7. **เก็บ "รอ SHIP" ให้หมด** — rule/standard ที่ note ค้างไว้ใน tasks ต้องถูกพิจารณาครบทุกข้อ (promote หรือตัดทิ้งพร้อมเหตุผล) ห้ามปล่อยค้าง

---

## 4. ลำดับขั้นการทำงาน (process)

1. **อ่านทำความเข้าใจ topic:** อ่าน `warnyin-stages/<slug>/` ทุกไฟล์ — topic นี้ทำอะไร ทำอย่างไร เกิดความรู้ใหม่อะไรบ้าง (เช็คก่อนว่า VERIFY ผ่าน Gate แล้ว — มี `verify.md` สรุปผลผ่าน)
2. **จำแนก feature:** สิ่งที่ทำเป็น **feature ใหม่** หรือ **ปรับปรุง feature เดิม** (เทียบกับ `docs/features/` ที่มีอยู่)
3. **สรุป promotion plan + ขออนุมัติ (ครั้งเดียว):** feature ใหม่/ปรับปรุง, รายการไฟล์กลางที่จะอัปเดต + สาระ, ชื่อโฟลเดอร์ archive → รอ user ไฟเขียว
4. **★ Archive:** ย้ายทั้งโฟลเดอร์ → `warnyin-stages/achieved/<YYYY-MM-DD>-<slug>/` (ใช้ `git mv` ถ้าเป็น git repo)
5. **อัปเดตเอกสารกลาง** (อ่านเนื้อหาจาก path ใน achieved):
   1. **`docs/features/<feature-name>/`** — feature ใหม่ → สร้างโฟลเดอร์ใหม่ (`feature.md` + `business.md`); ปรับปรุง feature เดิม → อัปเดตโฟลเดอร์เดิม โดยใช้เนื้อหาจาก `business.md` / `proposal.md` / `design.md` ของ topic
   2. **`docs/techstack/<component>/`** — `rule.md` / `standard.md` (จาก note "รอ SHIP" ใน tasks), `structure.md` (โครงสร้างที่เปลี่ยน), `test.md` (merge แผนเทสจาก `test.md` ของ topic)
   3. **`docs/rule.md`** — global rule ใหม่/ที่เปลี่ยน (เฉพาะข้อที่เป็นกฎระดับโปรเจกต์ ไม่ผูกกับ component เดียว)
   4. **`docs/troubleshooting.md`** — merge entry จาก `troubleshooting.md` ของ topic (ปัญหา/อาการ/root cause/วิธีแก้/ป้องกันซ้ำ)
   5. **`docs/infra.md` + `docs/project.md`** — เฉพาะถ้ามีข้อมูลที่เกี่ยวข้อง (env/service ใหม่, scope/เป้าหมายโปรเจกต์ที่ขยับ)
   6. **`docs/codemap/` ทั้งหมด** — อัปเดต code map ให้ตรงกับโค้ดจริงปัจจุบัน (ตรวจจากโค้ดจริง อย่างน้อยทุกส่วนที่ change กระทบ)
6. **เขียนสรุปส่งมอบ:** `achieved/<YYYY-MM-DD>-<slug>/ship.md` — feature ใหม่/ปรับปรุง, เอกสารกลางที่อัปเดต (ไฟล์ → สาระ), note ที่ตัดทิ้งพร้อมเหตุผล
7. **ปิดงาน:** รายงาน user ว่าส่งมอบครบ — topic ปิดสมบูรณ์

---

## 5. Output

| ที่ | เนื้อหา |
|---|---|
| `docs/features/<feature-name>/` | feature.md + business.md (สร้างใหม่หรืออัปเดต) |
| `docs/techstack/<component>/{rule,standard,structure,test}.md` | rule/standard ใหม่, โครงสร้าง, วิธีเทสที่ promote ขึ้น |
| `docs/rule.md` | global rule ที่เพิ่ม/เปลี่ยน |
| `docs/troubleshooting.md` | KB ปัญหา-วิธีแก้ที่ merge เข้า |
| `docs/infra.md`, `docs/project.md` | อัปเดตเฉพาะถ้ามีข้อมูลเกี่ยวข้อง |
| `docs/codemap/` | code map ตรงกับโค้ดจริงปัจจุบัน |
| `warnyin-stages/achieved/<YYYY-MM-DD>-<slug>/` | ทั้ง topic ที่ archive แล้ว + `ship.md` (สรุปการส่งมอบ) |

---

## 6. Gate → topic ปิดสมบูรณ์เมื่อ

- [ ] topic ถูกย้ายไป `warnyin-stages/achieved/<YYYY-MM-DD>-<slug>/` แล้ว (ไม่เหลือใน `warnyin-stages/`)
- [ ] `docs/features/` สะท้อน feature ใหม่/ที่ปรับปรุงแล้ว
- [ ] note "รอ SHIP" ทุกข้อใน `tasks/*/rule.md` + `standard.md` ถูกพิจารณาครบ — promote หรือตัดทิ้งพร้อมเหตุผล
- [ ] `docs/troubleshooting.md` รวม entry จาก topic แล้ว
- [ ] `docs/techstack/`, `docs/rule.md`, `docs/infra.md`, `docs/project.md` อัปเดตตามที่เกี่ยวข้อง
- [ ] `docs/codemap/` ตรงกับโค้ดจริงปัจจุบัน
- [ ] `ship.md` สรุปการส่งมอบเขียนครบใน achieved
- [ ] user รับทราบผลการส่งมอบ

ยังไม่ครบ → อยู่ SHIP ต่อ topic ยังไม่ปิด
