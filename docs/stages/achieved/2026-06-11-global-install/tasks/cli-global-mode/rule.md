# Rule — cli-global-mode

## 1. Rule ที่ต้อง follow
- **zero-dependency** (`installer/rule.md` + `docs/rule.md §2`) — เฉพาะ built-in `node:*` (`node:os`, `node:readline/promises`, `node:fs/path/url`); ห้ามเพิ่ม dep
- **ESM** — `import.meta.url`; ห้าม `__dirname`/`require`
- **cross-platform** (`docs/rule.md §2`) — `path.join`, `os.homedir()`, spawn array args **ห้าม `shell:true`**; ตั้ง **ทั้ง HOME+USERPROFILE** ตอน override (POSIX อ่าน HOME, Windows อ่าน USERPROFILE)
- **ไม่เขียนทับงานจริง/ของ user** (`installer/rule.md`) — global first-install `overwrite:false` (skip ของเดิมใน `~/.claude/{agents,skills}`); `installGlobalNote` append-with-marker ไม่ทับ personal `~/.claude/CLAUDE.md`
- **idempotent** — รันซ้ำไม่พัง/ไม่ append ซ้ำ (marker `<!-- warnyin:global-note -->`)
- **mirror layout `src/`=target** (`installer/rule.md`) — global ใช้ rel path เดิม (`copyTree` zero-mapping, แค่ target=homedir) ห้ามทำ mapping table
- **guard self-install = defensive no-op** — ไม่ลงทุน guard ใหม่; `pkgRoot===target` เดิมยังครอบ
- **test black-box** (`installer/standard.md`) — spawn จริง assert side-effect; **เคสเดิม 1-9 ไม่แก้ assertion** (atomic — เพิ่มเคสใหม่เท่านั้น); side-effect ต้องอยู่ temp (กัน leak homedir จริง)
- **config-protection** (`docs/rule.md §1`) — ห้าม skip เคส global เพื่อให้ pass-count gate ผ่าน; เคส global ต้องรันจริงทุก matrix (แก้ root cause ไม่ลด bar)
- **investigate-before-edit** — เข้าใจ `installRootDoc`/`copyTree`/main flow เดิม + ใครเรียก ก่อนแก้เป็น async

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] เสนอ: **"installer global mode — เขียน homedir ต้อง opt-in + first-install no-overwrite + note-only append (ไม่แตะ personal config) + echo blast paths"** — เหตุผล: pattern ความปลอดภัยของการเขียนนอกโปรเจกต์ (blast นอก cwd) ที่ควร generalize — _ถ้า VERIFY ยืนยัน ยกขึ้น `docs/techstack/installer/rule.md` ตอน SHIP_
