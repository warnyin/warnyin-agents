# Standard — init-workspace

> pattern payload `.md` (playbook) — อิง `docs/techstack/installer/standard.md` + `docs/rule.md §1`

## เขียน playbook init.md
- **unify-in-place** (`docs/rule.md §1`) — แทรก step bootstrap ในโครง init.md เดิม ไม่สร้าง section/playbook ขนาน
- **ไม่ duplicate logic ของ cli** — init เป็น agent-driven (อธิบายให้ agent ทำ: สร้างไฟล์เปล่า + copy template ที่ไม่มี) ไม่ลอกโค้ด `ensureScaffold`/`seedDocs` มาเป็น script; ให้ "ผลลัพธ์เหมือน" (scaffold เปล่า + seed ไม่ทับ + ข้าม `[...]`)
- **tool-agnostic** — เนื้อ playbook generic (ทุก harness ทำตามได้); path อ้างแบบ local-first→global ตาม convention §3C
- **idempotent** — เน้นชัด "มีอยู่แล้ว → ข้าม" (กันทำซ้ำตอน per-project ที่ installer scaffold ให้แล้ว)
- **กระทัดรัด** — step สั้น ตรงประเด็น ไม่บวม playbook

## seedDocs-skip invariant (อ้างอิง)
- template ระดับ feature/หน่วยผู้ใช้อยู่ใต้ `[...]` (เช่น `[feature-name]/`, `[topic]/`) → init **ข้าม** entry ขึ้นต้น `[` ตอน seed (เหมือน `seedDocs` ของ cli) — กัน seed leak
