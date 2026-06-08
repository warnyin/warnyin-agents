# Business — Build-log narrative

> what & why เชิงคุณค่า · promote จาก topic `build-log-narrative`

## คุณค่า (why)
ตอน BUILD fan-out sub-agent แบบ parallel ใน worktree ผู้ใช้เห็นแค่ **structured report ตอนจบ wave** — ช่วงกลางเป็น **blackbox**: agent ไหนติดอะไร ตัดสินใจอะไร มองไม่เห็น (discovery RQ2). เมื่อ build ล่ม/ผลแปลก ต้องเดาย้อนจาก diff + report สุดท้าย → trust ต่ำ + debug ช้า

feature นี้เติม **trace ช่วงที่ artifact เดิมไม่ครอบ**: sub-agent คืนเหตุการณ์สำคัญผ่าน schema → main loop กลั่นเป็น `build-log.md` (narrative timeline) หลังแต่ละ wave → เปิดอ่านย้อนหลังได้ว่าระหว่างทางเกิดอะไร

## persona
- **AI main loop (orchestrator)** ที่เขียน build-log.md เองหลังแต่ละ wave (pattern เดียวกับ troubleshooting.md)
- **user ที่ debug BUILD** — เปิด build-log.md อ่าน timeline แทนเดาจาก diff + report สุดท้าย
- **harness อื่น (Codex/Antigravity)** ที่ fan-out เอง → เขียน build-log.md เองตาม playbook generic (ไม่ผูก Workflow tool)

## ทำไมคุ้ม
- **observability เป็น 1 ใน 2 wedge** ของ product thesis; ในบริบท repo = stage artifact ที่เล่าเรื่อง (อ่านย้อนหลังได้) ไม่ใช่ runtime dashboard
- **in-constraint:** ทำได้จริงใน Workflow/worktree constraint (agent คืน events ผ่าน schema → main loop เขียน) — markdown ล้วน, zero-dep, tool-agnostic
- **เลือก post-wave narrative (ทางเลือก A)** แทน real-time stream (B, ขัด constraint + ซ้ำ `/workflows` ของ Claude Code) และ raw dump (C, noise) → "สรุปเป็นเรื่อง + cross-tool" คือ gap จริงที่ discovery ชี้
- **value/effort:** Gap B ของ umbrella — ต่อยอด pattern ที่มีอยู่ (main loop เขียน troubleshooting.md) → surface เพิ่มน้อย

## success metric (ที่ verify แล้ว)
- schema: `events[]` array (`maxItems:10`, kind enum 4 + note required, **ไม่อยู่ root required**) — backward-compat result เดิมไม่พัง — A1 (10/10)
- compose: build-log.md มี `## Wave N` + bullet kind ∈ 4 + ไอคอนตรง mapping; task ไม่มี events → graceful; ไม่มี status table; events/task ≤ 10 — executable trace **5/5 proxy** (verify §2)
- template == canonical §3.2 คำต่อคำ; validator no-op (build-log.md นอก STAGE_FILES); regression `npm test` 58/58 — A2/C/D

## ที่มา
discovery umbrella `memory-identity-observability` (Gap B) — wedge "Observability" ของ product thesis ปรับใช้กับ @warnyin/agents: เติม trace ช่วงกลาง wave ของ BUILD fan-out ที่ structured report ไม่ครอบ
