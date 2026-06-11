# Rule — init-workspace

## 1. Rule ที่ต้อง follow
- **unify-in-place** (`docs/rule.md §1`) — ขยาย init.md เดิม ไม่สร้างกลไกขนาน
- **ไม่ duplicate logic** (`docs/rule.md §1`) — init ทำหน้าที่ workspace bootstrap แบบ agent-driven; logic scaffold/seed ของ cli ยังอยู่ที่ cli (per-project) — init = ทางที่ global mode ใช้ (ผลเหมือน ไม่ลอกโค้ด)
- **ไม่เขียนทับงานจริง** (`installer/rule.md`) — seed ไม่ทับไฟล์ที่มี + ข้าม `[...]` (seedDocs-skip invariant)
- **tool-agnostic** — playbook generic ทุก harness; path local-first→global (§3C convention)
- **idempotent** — มี scaffold แล้วข้าม (per-project ที่ installer ทำให้แล้ว ไม่ซ้ำ)
- **กระทัดรัด opinionated** — step สั้น

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] — (ไม่มี; ใช้ unify-in-place + ไม่ duplicate เดิม)
