# Stage: VERIFY

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: เป็น **strategy tester** — ยืนยันว่า change ที่ build แล้ว "ทำงานถูกตามจุดประสงค์ของ topic" จริง (functional + UX/UI ถ้าเป็น FE) แก้จนผ่าน
> **Context profile:** สวมโหมด `review` (`.warnyin/workflow/contexts/review.md`) — session-level posture ของ stage นี้

---

## 1. VERIFY คืออะไร / ใช้เมื่อไหร่

ใช้หลัง BUILD ผ่าน Gate (full build/test เขียว) — เข้าได้ทั้งจาก `/warnyin:verify <slug>` และจากการยืนยันใน BUILD session (handoff หลัง full-gate)
VERIFY ทดสอบ **เชิงพฤติกรรม/จุดประสงค์** ในสภาพแวดล้อมจริง (local env)
ไม่ใช่แค่ unit test ผ่าน แต่ "ของจริงทำงานตามที่ topic ตั้งใจไหม"

> **★ fast-track hook:** ถ้า topic เป็น tier `fast` (จาก `/warnyin:triage` หรือ `/warnyin:fastlane`) → **verify-lite** ตาม [fast-track skip-list](../triage.md#fast-track-skip-list) — functional ตาม acceptance ใน receipt §2 + test เขียว → เติมผลลง receipt §4 (ผลอยู่ใน receipt แทน `build.md`); **correctness floor คงไว้ — test ต้องเขียวจริง**. tier `standard`/`large` → flow เต็มด้านล่าง (hook นี้ N/A ไม่ลด bar)
> loop-tuning proxy (★ loop tuning report ใน §4 ข้อ 5) = non-blocking guidance ใน verify-lite — ระบุในรายงานเท่านั้น ไม่ block gate

---

## 2. ก่อนเทส — อ่านให้เข้าใจก่อนเสมอ

1. **spec + tasks ทั้งหมด** — `docs/stages/<slug>/tasks/*/spec.md` + `task.md`, `design.md`, `proposal.md`
   → เข้าใจ **จุดประสงค์ของ topic** และสิ่งที่ต้องยืนยัน (อย่าเทสผ่านๆ โดยไม่เข้าใจ)
2. **`docs/features/<name>/spec.md` = regression baseline** — อ่าน behavior spec ของ feature ที่ topic แตะ (ดูจาก Spec delta ใน `design.md`); topic แตะหลาย feature → baseline = union ของ spec ทุก feature ที่ delta อ้างถึง; feature ยังไม่มี spec → ข้ามได้ (วิธีเดิม)
   - **`docs/stages/<slug>/openapi.yaml` (ถ้ามี)** = API contract ที่ต้องยืนยัน — topic ที่แตะ REST API ต้อง verify ว่าโค้ดจริง **ตรง contract** (ดูข้อ 4)
3. **`docs/techstack/<component>/test.md`** — guideline ว่าเทสยังไง (เช่น frontend: e2e smoke ผ่าน **playwright-cli**)
   → ถ้า **ไม่มี** guideline → แนะนำว่าควรเทสแบบไหน/วิธีใดได้บ้าง แล้วเขียนแผนลง `build.md §3`
4. **`docs/infra.md`** — local env / service ที่ต้องรันเพื่อเทส
5. **`docs/troubleshooting.md`** — เผื่อปัญหาที่จะเจอเคยถูกแก้แล้ว
6. **runtime security** (`.warnyin/workflow/roles/security.md` → "Runtime / operational security") — ตอนรันเทส local env ที่มี secret จริง ทบทวน secret isolation / no-egress / identity separation ก่อนปล่อย agent แตะของจริง

---

## 3. หลักการทำงาน (operating principles)

> **★ VERIFY ต้องทำโดย agent/บทบาทที่ **อิสระจากผู้เขียนโค้ด** — self-check ของ build agent ไม่นับ**; fallback เครื่องที่ fan-out ไม่ได้ → main loop สวม lens `roles/qa.md` แล้วตรวจตามลำดับ

1. **เข้าใจจุดประสงค์ก่อนเทส** — เทสตามเจตนาของ topic ไม่ใช่แค่ให้เขียว **และพฤติกรรมเดิมจาก feature spec** — scenario เดิมใน `docs/features/<name>/spec.md` = regression case (ต้องไม่พัง ยกเว้นที่ MODIFIED/REMOVED ระบุ), scenario ใน Spec delta = test case ใหม่; ใช้ over-engineering lens ตรวจว่ามีโค้ดที่ตัดได้โดยไม่เสีย acceptance ไหม — ดู [`minimalism`](../minimalism.md)
2. **เทสในสภาพแวดล้อมจริง (local env)** — รัน service ที่เกี่ยวข้องใน local แล้วเทสตามแผน
3. **ใช้ guideline จาก `test.md`** ของ techstack; ถ้าไม่มีให้เสนอวิธีเทสที่เหมาะแล้วเขียนแผนเอง
4. **Frontend → verify UX/UI ด้วย** (ไม่ใช่แค่ functional — ดู layout, state, flow, ความถูกต้องของหน้าจอ)
5. **ข้อไหน verify ไม่ผ่าน → แก้จนผ่าน (loop)** และ **นับจำนวนการแก้ไข/จำนวนรอบ**; fix loop มี finding >1 → ดู ★ loop tuning ข้อ 5 ด้านล่าง; issue ที่เลือก**ไม่แก้รอบนี้** (ยกออกจาก scope) → **เสนอ user** เพิ่มเข้า `docs/stages/<slug>/backlog.md` (user ยืนยันก่อนเขียน); ไม่มี → ข้าม — ดู `.warnyin/workflow/backlog.md §5`
6. **ปัญหายาก/ซ้ำในขั้นนี้ → บันทึก `docs/stages/<slug>/troubleshooting.md`** (เหมือน BUILD); เจอปัญหา → อ่าน `docs/troubleshooting.md` ก่อน
7. **นาน/หลายรอบเกินไป → พิจารณาถาม user ทีละข้อ + เสนอคำตอบที่แนะนำ** (อย่าวนแก้เงียบๆ ไม่จบ)
8. **ห้ามแตะไฟล์กลางใน `docs/`** — แผนเทสเขียนระดับ topic ที่ `build.md §3` ก่อน รอ SHIP merge เข้า `docs/techstack/<component>/test.md`
9. **สวม role QA** — ทำตาม role card `.warnyin/workflow/roles/qa.md` (lens: คิดแบบผู้ใช้จริง + คนหาเรื่อง, edge case, regression; checklist ครบทุกข้อ)
10. **★ investigate-before-edit** — กฎเดียวกับ [build.md](build.md) §3 ข้อ 11 (ทำความเข้าใจก่อนแก้ไฟล์ที่มีอยู่ทุกครั้ง)
11. **★ config-protection** — กฎเดียวกับ [build.md](build.md) §3 ข้อ 12; ห้ามแก้ config เพื่อให้ผ่าน; **"แก้จนผ่าน"** ต้องเป็นการแก้ root cause ไม่ใช่ลด bar (ข้อกำหนดเฉพาะ VERIFY: ถ้า config ผิดจริง แก้ได้แต่ต้องมีเหตุผลชัด + note)

---

## 4. ลำดับขั้นการทำงาน (process)

0. **★ เช็ค context window ก่อนเริ่ม** — กฎเดียวกับ [build.md](build.md) §4 ข้อ 0; ถ้า context เกินครึ่ง → เสนอ `/compact` หรือ `/clear` ก่อน
1. **เข้าใจจุดประสงค์ + อ่าน baseline:** อ่าน spec/tasks/design + `docs/features/<name>/spec.md` ของ feature ที่ topic แตะ (union ถ้าหลาย feature) → สรุปสิ่งที่ต้อง verify (functional + UX/UI)
2. **วางแผนเทส → เขียนแผนลง `build.md §3`:** ตาม guideline `docs/techstack/<component>/test.md`; ไม่มีก็เสนอวิธี (e2e smoke / integration / manual ฯลฯ) แล้วเขียนแผน — **ครอบทั้ง regression (scenario เดิมใน baseline) + test case ใหม่ (scenario ใน Spec delta)**
3. **เตรียม local env:** รัน service ที่เกี่ยวข้องตาม `infra.md`
4. **รันเทสตามแผน:** functional ตาม test-flow ใน spec; FE → e2e smoke (playwright-cli) + ตรวจ UX/UI
   - **★ contract validation (ถ้ามี `openapi.yaml`):** ยืนยัน implementation จริง = contract ตาม `.warnyin/workflow/api-doc.md` §4 (code-first regen → diff, หรือยิง request จริง → ตรวจ response/status/error ตรง schema); mismatch = ไม่ผ่าน → เข้า fix loop ข้อ 5
5. **ไม่ผ่าน → แก้ → rerun:** วนจนผ่าน **นับจำนวนรอบ/จำนวนแก้**; ปัญหายาก→`troubleshooting.md`; ถ้านานเกิน→ถาม user (ทีละข้อ + recommended); issue ที่เลือก**ไม่แก้รอบนี้** (ยกออกจาก scope) → **เสนอ user** เพิ่มเข้า `docs/stages/<slug>/backlog.md` (user ยืนยันก่อนเขียน); ไม่มี → ข้าม — ดู `.warnyin/workflow/backlog.md §5`
   - **★ loop tuning (fix loop มี finding >1)** — กฎเดียวกับ [build.md](build.md) §4 ข้อ 6 · Loop-tuning report; ⚠ รายละเอียดดู [`loop-tuning`](../loop-tuning.md)
6. **เขียนสรุปลง `build.md §4`:** ผลเทส + รายการแก้ไข + **จำนวนการแก้ไข** + ผล UX/UI
7. **ปิดงาน:** เสนอเข้า SHIP ด้วย `/warnyin:ship`

---

## 5. Output (สร้างที่ `docs/stages/<slug>/`)

| ไฟล์ | เนื้อหา | ปลายทางตอน SHIP |
|---|---|---|
| `build.md §3` | แผน/วิธีเทสของ topic (cases, env, e2e smoke, UXUI checklist) | merge เข้า `docs/techstack/<component>/test.md` |
| `build.md §4` | สรุปผล verify + รายการแก้ไข + จำนวนรอบที่แก้ | (เก็บใน archive) |
| `troubleshooting.md` (อัปเดต) | ปัญหายาก/ซ้ำที่เจอตอนเทส | merge เข้า `docs/troubleshooting.md` |

---

## 6. Gate → เข้า SHIP ได้เมื่อ

- [ ] เทสตาม **จุดประสงค์ของ topic** ครบ (functional ตาม test-flow ใน spec)
- [ ] **regression ตาม baseline** — scenario เดิมใน `docs/features/<name>/spec.md` ของ feature ที่แตะ ยังผ่าน (ยกเว้นที่ MODIFIED/REMOVED) + scenario ใน Spec delta ผ่าน
- [ ] Frontend: **UX/UI verify ผ่าน**
- [ ] **API contract (ถ้ามี `openapi.yaml`)** — implementation จริงตรง contract (path/schema/status/error/auth); mismatch ถูกแก้จนตรง (ตาม `.warnyin/workflow/api-doc.md`)
- [ ] ทุกข้อที่ไม่ผ่านถูกแก้จน **verify ผ่านหมด** (แก้จนผ่าน = แก้ root cause ไม่ลด bar)
- [ ] `build.md §3` (แผน) + `build.md §4` (สรุป + จำนวนการแก้ไข) เขียนครบ
- [ ] ปัญหายาก/ซ้ำถูกบันทึก `troubleshooting.md`

ยังไม่ครบ → อยู่ VERIFY ต่อ ห้ามข้ามไป SHIP
