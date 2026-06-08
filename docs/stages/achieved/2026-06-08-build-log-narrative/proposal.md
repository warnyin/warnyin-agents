# Proposal — build-log narrative (Gap B)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `build-log-narrative` |
| **ประเภท** | `feature` (เสริม BUILD observability) |
| **ขนาด** | `กลาง` |
| **วันที่** | 2026-06-08 |
| **มาจาก Discovery?** | `../memory-identity-observability/discovery.md` (Gap B) |

## 1. สรุป change (what)
เพิ่ม **`docs/stages/<slug>/build-log.md`** — narrative timeline ของการ BUILD fan-out: หลังจบแต่ละ wave main loop **กลั่นเหตุการณ์สำคัญ** (start / decision / error / done) ของแต่ละ sub-agent ออกมาเป็นเรื่องเล่าเรียงตามเวลา. กลไก 2 ส่วน: (1) `build-wave.mjs` RESULT_SCHEMA เพิ่ม field `events[]` ให้ agent คืน narrative ของตัวเอง, (2) main loop เขียน/append `build-log.md` หลังแต่ละ wave (pattern เดียวกับที่เขียน `troubleshooting.md` อยู่แล้ว)

## 2. ทำไม (why)
- **ปัญหา:** ตอน BUILD fan-out parallel ใน worktree (`build.md` §4) user เห็นแค่ **structured report ตอนจบ wave** — ช่วงกลางเป็น blackbox: agent ไหนติดอะไร ตัดสินใจอะไร มองไม่เห็น (discovery RQ2)
- **ผลถ้าไม่ทำ:** เมื่อ build ล่ม/ผลแปลก ต้องเดาย้อนจาก diff + report สุดท้าย ไม่มี trace ว่าเกิดอะไรระหว่างทาง → trust ต่ำ + debug ช้า
- **ผูกกับเป้าหมาย:** observability เป็น 1 ใน 2 wedge ของ product thesis; ในบริบท repo = **stage artifact ที่เล่าเรื่อง** (อ่านย้อนหลังได้) — build-log.md เติม trace ช่วงที่ artifact เดิมไม่ครอบ (กลาง wave)

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A — post-wave narrative artifact** | ทำได้จริงใน constraint (agent คืน events ผ่าน schema → main loop เขียน); persist + cross-tool (ทุก harness สร้างเองได้); narrative กลั่นโดย AI | ไม่ real-time (เห็นหลังจบ wave ไม่ใช่ระหว่าง) | ✅ |
| B — real-time stream | เห็นสด | **ขัด constraint:** `parallel()` คืนทีเดียวตอนจบ ไม่ stream; agent ใน worktree เขียน topic dir ไม่ได้ (troubleshooting #14); **ซ้ำ `/workflows` ของ Claude Code** (tool-specific ไม่ portable) | |
| C — raw event dump | ครบทุก event | noise — log เยอะไม่มีใครอ่าน (discovery risk); ขัด "narrative ไม่ใช่ dump" | |

- **เหตุผลที่เลือก A:** ตรงข้อจำกัด Workflow/worktree + เป็น artifact-native (สอด product identity markdown ไม่ใช่ runtime); gap จริงที่ discovery ชี้ = "สรุปเป็นเรื่อง + cross-tool" ไม่ใช่ stream (Claude Code มี live view แล้ว แต่ Codex/Antigravity ไม่มี + ไม่ persist)

## 4. Scope
**In scope**
- `build-wave.mjs` RESULT_SCHEMA เพิ่ม `events[]` (optional, backward-compat) + ปรับ prompt ให้ agent บันทึกเหตุการณ์สำคัญ
- main loop wiring: เขียน `build-log.md` (narrative timeline) หลังแต่ละ wave + ปิดท้าย — wire ลง `.claude/commands/warnyin/build.md` + playbook `build.md` (principle + Output + Gate)
- template `build-log.md` (โครง narrative) + behavior spec ของ feature ใหม่

**Out of scope**
- real-time stream / dashboard (ทางเลือก B) — ขัด constraint
- raw event dump (ทางเลือก C)
- เปลี่ยน fan-out/worktree mechanism เดิม — build-log เป็น layer สังเกตการณ์ ไม่แตะ orchestration logic
- cross-tool live aggregation (Claude Code `/workflows` คงเป็นของ harness)

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบเดิมที่กระทบ:** `build-wave.mjs` (RESULT_SCHEMA + prompt — เพิ่ม field optional ไม่ทำลาย caller เดิม); `.claude/commands/warnyin/build.md` (ขั้น orchestration); `build.md` playbook (principle/output/gate); template
- **ความเสี่ยง + การลด:**
  - *noise (log เยอะ)* → schema บังคับ events เป็น **เหตุการณ์สำคัญ** (start/decision/error/done) ไม่ใช่ทุก step + main loop กลั่นเป็น narrative (AI judgment) ไม่ dump ดิบ
  - *agent worktree เขียน topic dir ไม่ได้* (#14) → agent **คืน events ผ่าน schema** เท่านั้น, main loop เป็นคนเขียนไฟล์ (pattern เดียวกับ troubleshooting.md)
  - *tool-agnostic* → build-log.md เป็น artifact `.md`; harness ที่ไม่มี Workflow (Codex/Antigravity) ทำ fan-out เอง → เขียน build-log.md เองตาม playbook (generic instruction ไม่ผูก tool)
  - *backward-compat* → `events` optional ใน schema; agent เก่า/ไม่คืน events → build-log.md ยังเขียนจาก field ที่มี (summary/status) ได้

## 6. ลิงก์
- Design (how): `./design.md`
- Discovery (umbrella): `../memory-identity-observability/discovery.md` (Gap B §7)
