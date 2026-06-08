# Stage: SHIP

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: **ส่งมอบ** — promote ความรู้ระดับ topic ขึ้นเอกสารกลางใน `docs/` + archive topic เข้า `docs/stages/achieved/`
> **Context profile:** สวมโหมด `review` (`.warnyin/workflow/contexts/review.md`) — session-level posture ของ stage นี้

---

## 1. SHIP คืออะไร / ใช้เมื่อไหร่

ใช้หลัง VERIFY ผ่าน Gate แล้ว — SHIP ปิดวงจรของ topic โดยยกความรู้ที่เกิดขึ้นระหว่างงาน
(feature, rule/standard ใหม่, วิธีเทส, troubleshooting, โครงสร้างโค้ดที่เปลี่ยน) ขึ้น **เอกสารกลางถาวร** ใน `docs/`
แล้ว archive ทั้ง topic — เพื่อให้งานถัดไปเริ่มจากความรู้ล่าสุดเสมอ

> SHIP เป็นเรื่อง **เอกสาร + archive เท่านั้น** — การ merge โค้ด (build branch → main / PR) จัดการเองนอก workflow

---

## 2. Input ที่ต้องอ่านก่อนเริ่ม

1. `docs/stages/<slug>/` **ทุกไฟล์** — discovery, business, proposal, design, build, test, verify, troubleshooting, tasks/*
   → เข้าใจว่า topic นี้ **ทำอะไร ทำอย่างไร** และเกิดความรู้อะไรใหม่บ้าง
2. `tasks/<task>/rule.md` section "เสนอเพิ่ม rule ใหม่ (รอ SHIP)" + `standard.md` — rule/standard ใหม่ที่ note ค้างไว้
3. เอกสารกลางปลายทางที่จะอัปเดต — `docs/features/`, `docs/techstack/<component>/*`, `docs/rule.md`,
   `docs/troubleshooting.md`, `docs/infra.md`, `docs/project.md`, `docs/codemap/`
4. โค้ดจริงที่ change กระทบ — สำหรับอัปเดต structure + code map ให้ตรงความเป็นจริง

---

## 3. หลักการทำงาน (operating principles)

1. **เข้าใจก่อน promote** — อ่าน topic ทั้งหมดให้เข้าใจว่าทำอะไร/ทำอย่างไร แล้วค่อยตัดสินใจว่าความรู้ชิ้นไหนควรขึ้นไฟล์กลางไหน
2. **ขอ user ยืนยัน "ครั้งเดียวก่อนลงมือ"** — สรุป promotion plan (feature ใหม่หรือปรับปรุง, ไฟล์กลางที่จะอัปเดต + สาระที่จะใส่, ชื่อโฟลเดอร์ archive) ให้ user อนุมัติ แล้วจึง execute ไม่ถามซ้ำระหว่างทาง
3. **★ Archive ก่อนอัปเดตเอกสาร** — ย้ายทั้งโฟลเดอร์ `docs/stages/<slug>/` → `docs/stages/achieved/<YYYY-MM-DD>-<slug>/` (วันที่ของวันที่ SHIP) **ก่อน** เริ่มแก้ `docs/` แล้วอ่านเนื้อหาจาก path ใหม่ระหว่าง promote
4. **กลั่น ไม่ใช่ copy ดิบ** — merge สาระเข้าโครงสร้างของไฟล์กลางเดิม ระวัง duplicate/ขัดแย้งกับเนื้อหาที่มีอยู่; เขียนแบบ "ความรู้ถาวร" ไม่ใช่บันทึกรายงาน
5. **เอกสารต้องตรงโค้ดจริง** — structure/codemap อัปเดตจากการดูโค้ดจริง ไม่ใช่จากความจำหรือ design เดิม; **ครอบ Spec delta ด้วย** — ถ้าพฤติกรรมจริง (หลัง BUILD/VERIFY) ต่างจาก delta ที่ approve ไว้ → **อัปเดต delta ใน design.md ก่อน แล้วค่อย merge**; และ re-check delta เทียบ `spec.md` ปัจจุบัน ณ เวลา ship (ไม่ใช่ ณ เวลา design)
6. **อย่าเดา** — เนื้อหาที่ไม่แน่ใจว่าควร promote หรือควรวางไว้ไฟล์ไหน → ถามทีละข้อ + เสนอคำตอบที่แนะนำ
7. **เก็บ learned-rule ให้หมด — planned + emergent** — รวบรวม rule ที่จะ promote ทุกตัว: ทั้ง **planned** (note "รอ SHIP" ใน `tasks/*/rule.md` §2) และ **emergent** (บทเรียนที่โผล่ตอนลงมือ — สแกน `build.md`/`verify.md`/`troubleshooting.md`/diff); ทุกตัวต้องมี **evidence (บังคับ)** + **scope** + **user ยืนยัน** ก่อน promote — ไม่มี evidence ไม่ promote (สอด "ห้ามเดา"); **learned-rule = กฎ generalize ไม่ใช่ incident** (troubleshooting = incident ที่ *อ้าง* เป็น evidence ได้). พิจารณาครบทุกข้อ (promote หรือตัดทิ้งพร้อมเหตุผล) ห้ามปล่อยค้าง

---

## 4. ลำดับขั้นการทำงาน (process)

1. **อ่านทำความเข้าใจ topic + รวบรวม learned-rule candidate:** อ่าน `docs/stages/<slug>/` ทุกไฟล์ — topic นี้ทำอะไร ทำอย่างไร เกิดความรู้ใหม่อะไรบ้าง (เช็คก่อนว่า VERIFY ผ่าน Gate แล้ว — มี `verify.md` สรุปผลผ่าน; ถ้ารัน node ได้ → รัน `node .warnyin/workflow/scripts/validate-topic.mjs <slug>` — มี ✖ ควรแก้ก่อน promote (script เช็คโครง; ความถูกของเนื้อหายังเป็นหน้าที่ผู้ ship)) — พร้อมกันนั้น **รวบรวม learned-rule candidate** เป็นตาราง (ทุกตัว = `rule + evidence + scope + promote?`):
   - **planned:** จาก `tasks/*/rule.md` §2 "เสนอเพิ่ม rule ใหม่ (รอ SHIP)"
   - **emergent:** สแกนบทเรียนที่โผล่ตอนลงมือ — `build.md` (pattern แก้ซ้ำ/integration), `verify.md` (รายการแก้+จำนวนรอบ), `troubleshooting.md` (ปัญหายาก→"กันซ้ำ" = candidate ชัดสุด), diff/commit
   - **entry แต่ละตัว:** `rule` = ข้อความ **generalize** (ถ้าเป็น incident "X พังเพราะ Y" ยกเป็นกฎ "ก่อนแก้ Z เช็ค Y เสมอ") · `evidence` = **บังคับ** concrete pointer 1 บรรทัด + ลิงก์ artifact (`build.md`/`verify.md`/`troubleshooting.md`/diff/commit) — **ไม่มี evidence = ไม่ promote** · `scope` = `component:<c>`→`docs/techstack/<c>/rule.md` หรือ `project`→`docs/rule.md`
2. **จำแนก feature:** สิ่งที่ทำเป็น **feature ใหม่** หรือ **ปรับปรุง feature เดิม** (เทียบกับ `docs/features/` ที่มีอยู่)
3. **สรุป promotion plan + ขออนุมัติ (ครั้งเดียว):** feature ใหม่/ปรับปรุง, รายการไฟล์กลางที่จะอัปเดต + สาระ, ชื่อโฟลเดอร์ archive — **fold ตาราง learned-rule (rule + evidence + scope) เข้า approval เดียวกันนี้ ให้ user ยืนยัน per-rule** (✅ promote / ✂️ ตัด + เหตุผล) → รอ user ไฟเขียว
4. **★ Archive + maintain working-notes:** ย้ายทั้งโฟลเดอร์ → `docs/stages/achieved/<YYYY-MM-DD>-<slug>/` (ใช้ `git mv` ถ้าเป็น git repo) — จากนั้น **SHIP เป็น producer ของ `docs/stages/context.md`** (working-notes ข้าม topic; canonical schema = `.warnyin/template/stages/context.md` / design ของ topic context-working-memory):
   - append 1 แถวใน section **"เพิ่ง ship"**: `| <YYYY-MM-DD> | <slug> | <ไฮไลต์ 1 บรรทัด ชี้ achieved/> |`
   - **prune** ให้เหลือ **5 แถวล่าสุด** (เก่าเกินตัดออก — รายละเอียดเต็มอยู่ใน `achieved/` แล้ว)
   - ถ้าโฟกัส/ธีมงานของโปรเจกต์ขยับ → อัปเดต section **"โฟกัส/ธีมปัจจุบัน"**
   - section/ไฟล์ไม่มี → สร้างจาก canonical skeleton (robust) ก่อน append
   - **อย่าจด status board (topic อยู่ stage ไหน) ลง context.md** — สถานะ derive ด้วย `/warnyin:next` เท่านั้น (honors `unify-in-place`)
5. **อัปเดตเอกสารกลาง** (อ่านเนื้อหาจาก path ใน achieved):
   1. **`docs/features/<feature-name>/`** — feature ใหม่ → สร้างโฟลเดอร์ใหม่ (`feature.md` + `business.md`); ปรับปรุง feature เดิม → อัปเดตโฟลเดอร์เดิม โดยใช้เนื้อหาจาก `business.md` / `proposal.md` / `design.md` ของ topic — **และ merge `spec.md`** ตาม Spec delta ใน `design.md` §9: **ADDED** → ต่อท้าย `spec.md` · **MODIFIED** → แทนที่ requirement ชื่อตรงกัน (rename → หาด้วย `[เดิมชื่อ:]`) · **REMOVED** → ลบ requirement; **read-modify-verify — key ไม่เจอ → STOP:** MODIFIED/REMOVED ที่หา key ไม่เจอใน `spec.md` ของ feature ที่ `(→ feature:)` ระบุ → **หยุด ถาม user ห้าม merge เงียบ** (ห้ามตีความเป็น ADDED เอง); **feature ใหม่** → สร้าง `spec.md` จาก ADDED ทั้งก้อน (template `[feature-name]/spec.md`); **feature เดิมยังไม่มี `spec.md`** → สร้างใหม่จาก delta + พฤติกรรมจริง
   2. **`docs/techstack/<component>/`** — `rule.md` / `standard.md` (learned-rule ที่ยืนยันแล้ว scope `component:<c>` + note "รอ SHIP" ใน tasks), `structure.md` (โครงสร้างที่เปลี่ยน), `test.md` (merge แผนเทสจาก `test.md` ของ topic)
   3. **`docs/rule.md`** — global rule ใหม่/ที่เปลี่ยน (learned-rule ที่ยืนยันแล้ว scope `project` — กฎระดับโปรเจกต์ ไม่ผูกกับ component เดียว)
   > promote learned-rule **เฉพาะตัวที่ user ยืนยัน (step 3)** ตาม scope: `component:<c>` → `docs/techstack/<c>/rule.md` · `project` → `docs/rule.md`
   4. **`docs/troubleshooting.md`** — merge entry จาก `troubleshooting.md` ของ topic (ปัญหา/อาการ/root cause/วิธีแก้/ป้องกันซ้ำ)
   5. **`docs/infra.md` + `docs/project.md`** — เฉพาะถ้ามีข้อมูลที่เกี่ยวข้อง (env/service ใหม่, scope/เป้าหมายโปรเจกต์ที่ขยับ)
   6. **`docs/codemap/` ทั้งหมด** — อัปเดต code map ให้ตรงกับโค้ดจริงปัจจุบัน ทำตาม playbook `.warnyin/workflow/codemap.md` (Claude Code: `/warnyin:update-codemaps`)
6. **เขียนสรุปส่งมอบ:** `achieved/<YYYY-MM-DD>-<slug>/ship.md` — feature ใหม่/ปรับปรุง, เอกสารกลางที่อัปเดต (ไฟล์ → สาระ), note ที่ตัดทิ้งพร้อมเหตุผล
7. **ปิดงาน:** รายงาน user ว่าส่งมอบครบ — topic ปิดสมบูรณ์

---

## 5. Output

| ที่ | เนื้อหา |
|---|---|
| `docs/features/<feature-name>/` | feature.md + business.md + spec.md (สร้างใหม่หรืออัปเดต — spec.md merge ตาม Spec delta) |
| `docs/techstack/<component>/{rule,standard,structure,test}.md` | rule/standard ใหม่, โครงสร้าง, วิธีเทสที่ promote ขึ้น |
| `docs/rule.md` | global rule ที่เพิ่ม/เปลี่ยน |
| `docs/troubleshooting.md` | KB ปัญหา-วิธีแก้ที่ merge เข้า |
| `docs/infra.md`, `docs/project.md` | อัปเดตเฉพาะถ้ามีข้อมูลเกี่ยวข้อง |
| `docs/codemap/` | code map ตรงกับโค้ดจริงปัจจุบัน |
| `docs/stages/achieved/<YYYY-MM-DD>-<slug>/` | ทั้ง topic ที่ archive แล้ว + `ship.md` (สรุปการส่งมอบ) |

---

## 6. Gate → topic ปิดสมบูรณ์เมื่อ

- [ ] topic ถูกย้ายไป `docs/stages/achieved/<YYYY-MM-DD>-<slug>/` แล้ว (ไม่เหลือใน `docs/stages/`)
- [ ] **`docs/stages/context.md` ถูก maintain** — append แถว "เพิ่ง ship" (วันที่|slug|ไฮไลต์) + prune เหลือ 5 ล่าสุด + อัปเดต "โฟกัส/ธีมปัจจุบัน" ถ้าขยับ (ไม่จด status board)
- [ ] `docs/features/` สะท้อน feature ใหม่/ที่ปรับปรุงแล้ว
- [ ] **Spec delta merge แล้ว** — `spec.md` ของ feature ที่แตะถูก merge ตาม delta; ทุก MODIFIED/REMOVED match requirement จริง (read-modify-verify — key ไม่เจอ → STOP ถาม user แล้ว ไม่ merge เงียบ)
- [ ] learned-rules (planned + emergent) พิจารณาครบทุกตัว — note "รอ SHIP" ใน `tasks/*/rule.md` + `standard.md` + บทเรียน emergent จาก build/verify/troubleshooting; ทุก promote มี **evidence + user ยืนยัน**, ตัดทิ้งมีเหตุผล
- [ ] `docs/troubleshooting.md` รวม entry จาก topic แล้ว
- [ ] `docs/techstack/`, `docs/rule.md`, `docs/infra.md`, `docs/project.md` อัปเดตตามที่เกี่ยวข้อง
- [ ] `docs/codemap/` ตรงกับโค้ดจริงปัจจุบัน
- [ ] `ship.md` สรุปการส่งมอบเขียนครบใน achieved
- [ ] user รับทราบผลการส่งมอบ

ยังไม่ครบ → อยู่ SHIP ต่อ topic ยังไม่ปิด
