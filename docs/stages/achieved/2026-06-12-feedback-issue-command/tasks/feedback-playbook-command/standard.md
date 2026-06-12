# Standard — feedback-playbook-command

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน playbook + command adapter ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md`

## 1. Standard กลางที่ยึด (จาก techstack)
- `docs/techstack/installer/standard.md`: payload คือ `.md` ที่ AI อ่านแล้วทำตาม — **ไม่มีโค้ดรัน** → ไม่แตะ test harness/pack-verify ของ CLI (โครงสร้าง packaging รองรับ nested namespace อยู่แล้ว — `design.md §6`)
- canonical single-source (`docs/rule.md §1` + pattern `triage.md`/`discovery.md`): flow/logic อยู่ playbook **เดียว** (`feedback.md`); command adapter ชี้กลับ ไม่ duplicate
- **mirror layout `src/` = target paths** (`docs/techstack/installer/rule.md`): วางไฟล์ที่ `src/.warnyin/workflow/feedback.md` + `src/.claude/commands/warnyin/feedback/issue.md` — สะท้อน path ตอน install เป๊ะ (ไม่มี mapping table)

## 2. Pattern การเขียนโค้ดของ task นี้
- **playbook กลาง = แม่แบบโครงตาม `explore.md`/`triage.md`:**
  - ขึ้นต้นด้วย callout `> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน**` (Claude/Codex/Antigravity) + เป้าหมาย 1 บรรทัด
  - section เลขลำดับ: คืออะไร/ใช้เมื่อไหร่ → input ที่อ่าน → flow (3 ประเภท + body template) → detect ladder → confirm gate + privacy rule
  - ภาษาไทย, tool-agnostic, ไม่มีโค้ดรัน (เป็น guidance ที่ AI ทำตาม)
- **command adapter = บางตาม `src/.claude/commands/warnyin/explore.md`:**
  - frontmatter `description` + `argument-hint` (ตรง `design.md §1.1`)
  - body สั้น: "อ่าน `.warnyin/workflow/feedback.md` ให้ครบก่อน แล้วทำตามทุกหลักการ" + ส่ง `$ARGUMENTS` เป็น seed (ไม่ใส่ → ถามประเภทก่อน)
- **error/degrade handling:** detect ladder เดินตามลำดับ gh→`gh auth status`→fallback URL; label fail (permission) → retry ยิงใหม่ไม่มี `--label` แล้วแจ้ง user — **ไม่ error ตาย** (`design.md §4`)
- **state/data:** ไม่มี persist — body ประกอบจาก field ที่สัมภาษณ์ + seed เท่านั้น

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **playbook precedent (แม่แบบโครง):** `src/.warnyin/workflow/explore.md` + `src/.warnyin/workflow/triage.md` — callout + section เลข + ภาษาไทย
- **command adapter precedent:** `src/.claude/commands/warnyin/explore.md` — frontmatter บาง + ชี้ playbook + `$ARGUMENTS`
- **gh CLI** = external tool ที่ผู้ใช้ติดตั้งเอง (ไม่ใช่ dependency ของ repo) — playbook แค่ detect + fallback ไม่สอน/ติดตั้งให้ (`discovery.md` scope out)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- **nested namespace แรก** `warnyin/feedback/issue.md` — โครง `src/` ต้องสร้างโฟลเดอร์ `feedback/` ใต้ `commands/warnyin/` (copyTree recursive รองรับ — `design.md §6`); ถ้า pattern "command ในโฟลเดอร์ย่อย" จะใช้ซ้ำในอนาคต ให้ note ขึ้น `rule.md §2` รอ SHIP
- repo เป้าหมาย hardcode `warnyin/warnyin-agents` + title prefix/label map ต้องตรง contract `§1.1` เป๊ะ (registration task ชี้ค่าเดียวกัน)
