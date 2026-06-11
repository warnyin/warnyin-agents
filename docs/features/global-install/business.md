# Business — Global install

> ความรู้ถาวรระดับ feature · promote จาก topic `global-install` (Discovery 2026-06-11, ผ่าน gate)

## 1. เป้าหมายเชิงธุรกิจ (what & why)
- **what:** ติดตั้ง warnyin ครั้งเดียวแบบ global → ใช้ `/warnyin:*` ได้ทุกโปรเจกต์ โดยไม่ต้องรัน installer ซ้ำต่อ repo
- **why:** ผู้ใช้ที่ทำหลาย repo เจอ friction การติดตั้งซ้ำทุกโปรเจกต์ (vendored per-project); หลัง 0.12.0 ที่ workflow โตขึ้น คนใช้หลายโปรเจกต์มากขึ้น
- **ผูก `docs/project.md`:** ตรงเป้าหมาย "ติดตั้งแล้ว `/warnyin:*` ใช้ได้โดยไม่ต้องตั้งค่าเพิ่ม" — global = ตั้งค่าครั้งเดียวใช้ทุก repo

## 2. Persona / ใครได้ประโยชน์
- **นักพัฒนา/ทีมที่ทำหลายโปรเจกต์** — ติดตั้ง global ครั้งเดียว, ทุก repo ใหม่ใช้ `/warnyin:*` ได้ทันที (แค่ `/warnyin:init` สร้าง workspace)
- **คุณค่า:** ลด overhead การติดตั้งซ้ำ; ยังคง reproducibility (โปรเจกต์ที่ต้องการ pin เวอร์ชัน vendor local ได้)

## 3. Success metric (วัดผลได้)
- `npx @warnyin/agents --global` ติดตั้ง adapter+playbook ลง `~/.claude`+`~/.warnyin`; `/warnyin:*` ใช้ได้ในโปรเจกต์ที่ไม่มี `./.warnyin/`
- โปรเจกต์ที่มี `./.warnyin/` local → ใช้ local (override)
- non-TTY (CI/pipe) → ไม่ค้าง, default project; per-project install เดิมไม่พัง (backward compat); ไม่ทำลายไฟล์ user ใน homedir

## 4. ขอบเขตเชิงธุรกิจ / ข้อจำกัด
- **in:** mode global/project (flag + TTY-prompt) · global target homedir · resolution local-first→global · init workspace bootstrap
- **out:** multi-version global · auto-migrate per-project→global · Codex/Antigravity global root doc (per-project ยังใช้ได้) · เปลี่ยน namespace/plugin
- **ข้อจำกัด:** zero-dep + cross-platform (`os.homedir()`); per-project = default (คง reproducibility + auditability)

## 5. ความเสี่ยง & การคุม
- **blast-radius เขียน `~/`** → opt-in + echo paths + first-install no-overwrite + idempotent
- **version skew** → local override (vendor local pin)
- **security: payload global นอก git** → per-project = default (auditable); global = ผู้ใช้เลือกรับ trade-off
