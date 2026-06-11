# Task — init-workspace

> ชี้ canonical `design.md` §3D/§4 (ไม่ลอก)

| | |
|---|---|
| **Task** | `init-workspace` |
| **Slice อ้างอิง** | `design.md` slice #3 |
| **Component** | `installer` (playbook init) |
| **Model tier** | `balanced` (เพิ่ม step ใน playbook prose — ระวัง idempotent + อย่าทับของเดิม) |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
ให้ `/warnyin:init` **รับผิดชอบ workspace bootstrap** (D5): เพิ่ม step สร้าง scaffold (`docs/stages/context.md` + `docs/stages/achieved/.gitkeep` เปล่า) + seed `docs/` จาก template **ก่อน** วิเคราะห์โปรเจกต์ — ทำให้ global mode (installer ข้าม scaffold) มี workspace; อ่าน template แบบ **local-first → global** (§3C)

## 2. Dependency
- **ต้องทำหลัง:** — (wave 1; อ่าน `design.md` §3D เป็น input)
- **ปลดล็อกให้:** — (contract: global mode T1 ข้าม scaffold → init รับช่วง; T1 copy `.warnyin/template` ไป `~/.warnyin/template/` ให้ init อ่าน global ได้ — §4)
- **ส่ง output:** init.md ที่สร้าง workspace ได้

## 3. Sub-tasks
- [ ] 1. `src/.warnyin/workflow/init.md` — เพิ่ม **step "0. Workspace bootstrap"** (ก่อนวิเคราะห์โปรเจกต์): ถ้ายังไม่มี → สร้าง `docs/stages/context.md` (เปล่า) + `docs/stages/achieved/.gitkeep` (เปล่า) + seed `docs/` จาก `.warnyin/template/docs/**` (ข้าม `[...]`, **ไม่ทับไฟล์ที่มีอยู่**)
- [ ] 2. ระบุ **อ่าน template แบบ local-first → global** (`./.warnyin/template/` ก่อน, ไม่มี → `~/.warnyin/template/`) ตาม convention §3C — รองรับ global mode ที่ไม่มี `./.warnyin/` local
- [ ] 3. ระบุ **idempotent** — มี scaffold/ไฟล์อยู่แล้ว → ข้าม (per-project install ที่ installer scaffold ให้แล้ว ไม่ทำซ้ำ)
- [ ] 4. **★ phrase step-0 ให้ complementary กับ §6 เดิม** (dry-run T3 defer) — init.md §6 มีกลไก seed `docs/` (project/infra/rule...) อยู่แล้ว; step-0 = "seed *ไฟล์ที่ยังไม่มี*/placeholder ก่อน" ให้อ่านเป็นส่วนเสริม ไม่ใช่กลไก seed ขนานที่ขัดกัน (unify-in-place)

## 4. ขอบเขตไฟล์ที่จะแตะ (★ disjoint)
- `src/.warnyin/workflow/init.md`
- ❌ **ห้ามแตะ** `cli.mjs`/test (T1), templates (T2), stage playbook อื่น (init รับ workspace; safety-net guard อยู่ใน CLAUDE.md/AGENTS.md = T2 แล้ว — ไม่แก้ stage แต่ละใบ)

## 5. Acceptance criteria
- [ ] init.md มี step สร้าง scaffold (`docs/stages/context.md` + `achieved/.gitkeep`) + seed `docs/` ก่อนวิเคราะห์โปรเจกต์
- [ ] ระบุอ่าน template local-first → global (§3C) — ทำงานได้ทั้ง project (มี local) + global (ไม่มี local)
- [ ] idempotent — ไม่ทับไฟล์ที่มีอยู่ (เคารพ seedDocs-skip `[...]`)
- [ ] **unify-in-place** — แทรกในโครง init.md เดิม ไม่สร้าง playbook ขนาน; ไม่ duplicate logic ของ cli
- [ ] `lint:md` own-file ผ่าน · ทำตาม `rule.md`+`standard.md`

## 6. อ้างอิง
- Canonical: `../../design.md` §3D (init responsibility), §3C (resolution), §4 (contract T1↔T3)
- ของเดิม: `src/.warnyin/workflow/init.md`, cli `ensureScaffold`/`seedDocs` (พฤติกรรมอ้างอิง — ไม่ลอกโค้ด แต่ทำให้ผลเหมือน)
