# Rule — move-source-to-src

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง focus/follow

## 1. Rule ที่ต้อง follow (จาก techstack + repo)
> ดึงจาก `docs/techstack/installer/rule.md` และ `docs/rule.md` — เฉพาะข้อที่เกี่ยวกับ task นี้
- [ ] **zero-dependency** — `src/bin/cli.mjs` ใช้เฉพาะ built-in (`node:fs`/`node:path`/`node:url`); ห้ามเพิ่ม dependency (`docs/rule.md §2`, installer rule)
- [ ] **ESM** — หา `pkgRoot` ด้วย `import.meta.url`/`fileURLToPath`; ห้าม `__dirname`/`require` (คงของเดิม)
- [ ] **ห้าม copy พื้นที่ทำงานของผู้ใช้จาก repo ต้นทาง** — `docs/stages/` ยังต้อง generate scaffold เปล่าใน target (`ensureScaffold`) ไม่ใช่ `copyTree` จาก pkgRoot → หลังย้ายเป็น `src/` logic นี้ห้ามเปลี่ยน (กัน scaffold leak — `troubleshooting.md #1`)
- [ ] **idempotent** — รันซ้ำต้องไม่พัง/ไม่ append ซ้ำ (marker `warnyin/workflow/stages/` ใน CLAUDE.md/AGENTS.md คงเดิม)
- [ ] **guard self-install** — เก็บ guard `pkgRoot===target` ไว้ (defensive zero-cost); หลังย้าย pkgRoot=`src/` → guard เป็น no-op โดยตั้งใจ → **แก้แค่ comment** ให้ตรงพฤติกรรม **ห้ามลงทุน guard ใหม่** (design §4.1/§7)
- [ ] **`package.json files` เป็น allowlist** — task นี้ **ไม่แตะ** `files` (เป็นของ T2) แต่ต้องรู้ว่า dotfolder nested (`src/.warnyin`/`src/.claude`) จะต้องระบุชัดใน T2 — อย่าทำให้โครงย้ายแล้วผิด assumption นั้น
- [ ] **ภาษา** — comment/ข้อความผู้ใช้เป็นภาษาไทย ตามสไตล์ `cli.mjs`
- [ ] **test = black-box spawn, ห้าม refactor target เพื่อ testability** — ห้ามแก้ test/harness เพื่อรองรับโครงใหม่ (mirror layout ออกแบบให้ไม่ต้องแก้อยู่แล้ว)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/.../rule.md` ตอนนี้ — แค่ note
- [ ] rule ที่เสนอ: **mirror layout `src/` = target paths** (installer copy `src/<rel> → target/<rel>` ไม่มี mapping table) — เหตุผล: เป็น invariant ที่ทำให้ cli/test แก้น้อย; ถ้าฝืน (แยกโครง src จาก target) จะต้องเพิ่ม mapping → ขัดปรัชญากระทัดรัด · ค่อยพิจารณาย้ายขึ้น standard/rule กลางตอน SHIP (T5 จะ document โครงใหม่อยู่แล้ว)
