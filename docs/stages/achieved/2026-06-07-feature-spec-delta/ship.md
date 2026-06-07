# Ship — feature-spec-delta

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ — เขียนหลังย้าย topic เข้า `docs/stages/achieved/2026-06-07-feature-spec-delta/` แล้ว

## 1. สรุป topic
- **ทำอะไร:** ยืม 2 เทคนิคจาก OpenSpec (Fission-AI) เข้า workflow — (1) living behavior spec ต่อ feature (`docs/features/<name>/spec.md`, format lean Requirement+Scenario) (2) delta discipline (DESIGN เขียน "Spec delta" §9 → VERIFY ใช้ spec เป็น regression baseline → SHIP merge กึ่ง mechanical แบบ read-modify-verify, key ไม่เจอ → STOP) — แก้ที่ `src/` 11 ไฟล์ (1 template ใหม่ + 10 wiring) + dogfood spec จริง 2 ไฟล์; ตัดทิ้ง OPSX engine/เลิก gate/workspaces โดยตั้งใจ
- **ประเภท:** ☑ feature ใหม่ → `docs/features/spec-delta/`

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/spec-delta/` | ใหม่ — feature.md (กลไก+วงจร+ขอบเขต) + business.md (why/persona/metric) + **spec.md** (5 requirement — dogfood กติกา "feature ใหม่สร้าง spec จากพฤติกรรมจริง") |
| `docs/features/{context-profiles,utility-skills}/spec.md` | สร้างโดย BUILD (task `dogfood-specs`) — note: เป็น output ของ task โดยตรง ไม่ใช่ merge ของ SHIP |
| `docs/techstack/installer/rule.md` | learned-rule P1: template ระดับ feature ต้องอยู่ใต้ `[...]` เสมอ (seedDocs-skip invariant) |
| `docs/techstack/installer/test.md` | section ใหม่ "verify spec/delta payload" — merge trace 5 เคส + sandbox negative + accuracy โดย agent อิสระ + semantic consistency |
| `docs/rule.md` | learned-rule P2 (canonical-copy convention) + E1 (build-orchestration: commit topic docs ก่อน fan-out) ใน §1 · E2 ขยาย §5 "verify เอกสาร narrative" ข้อ 4 (ตรวจโดย agent อิสระ) |
| `docs/troubleshooting.md` | #14 — build agent ใน worktree แก้ไฟล์ topic dir ไม่ได้ (Edit tool block) + prevention |
| `docs/roadmap.md` | ข้อ 13 ✅ DONE (topic นี้) + ข้อ 14 ใหม่: structural validator/status script (topic แยกที่ตกลงไว้ตอน discovery) |
| `docs/codemap/` | architecture.md เพิ่มวงจร spec ใน 5-stage flow · index.md อัปเดต templates row + freshness header |
| `docs/infra.md` / `docs/project.md` | ไม่แตะ — ไม่มี env/scope เปลี่ยน |

## 3. Learned rules (planned + emergent)
> กฎ generalize ที่จับจาก topic นี้ — ทุกตัวมี evidence + user ยืนยัน per-rule (2026-06-07)

| rule (generalize) | evidence (pointer + artifact) | scope | promote? |
|---|---|---|---|
| P1: template ระดับ feature/หน่วยผู้ใช้ ต้องอยู่ใต้ `[...]` เสมอ (seedDocs-skip invariant) | `cli.mjs` seedDocs + `verify.md` T2 negative + design review Infra-S1 | `component:installer` | ✅ → `docs/techstack/installer/rule.md` |
| P2: ความรู้ canonical กระจายหลายไฟล์ ต้อง copy จาก design ของ topic — ห้ามแต่งใหม่ต่อไฟล์ | `design.md` §4 + Design review B2 + `verify.md` T3 | `project` | ✅ → `docs/rule.md` §1 |
| E1: commit topic docs ลง build branch ก่อน fan-out + worktree branch จาก build branch; สถานะ topic dir ให้ main loop อัปเดต | `troubleshooting.md` TS-1 (ซ้ำ 2/2 task) + `build.md` §3 | `project` | ✅ → `docs/rule.md` §1 |
| E2: เอกสาร narrative ต้องตรวจ accuracy โดย agent อิสระจากผู้เขียน — self-check ไม่พอ | `verify.md` fix #1 (T4 จับ claim ที่ self-check หลุด) | `project` | ✅ → `docs/rule.md` §5 ข้อ 4 (unify เข้า rule เดิม) |
| P3: "THEN ควรอ้าง path:line ของ source เป็น evidence inline" | dry-run note เท่านั้น | — | ✂️ ตัด — เป็น style ไม่ใช่กฎ; format spec จงใจ lean กัน ceremony |

## 4. หมายเหตุ Spec delta ของ topic นี้
- topic นี้ design ก่อน template §9 มีจริง → ไม่มี section Spec delta (backward-compat path "SHIP ทำแบบเดิม") — แต่ dogfood กติกา "feature ใหม่" ด้วยการสร้าง `docs/features/spec-delta/spec.md` จากพฤติกรรมจริง
- end-to-end proof ของวงจรเต็ม (delta ใน design.md จริง → merge จริง) = topic ถัดไปที่เดินครบ 5 stage

## 5. Archive
- ย้ายจาก `docs/stages/feature-spec-delta/` → `docs/stages/achieved/2026-06-07-feature-spec-delta/` เมื่อ 2026-06-07 (git mv ก่อน promote)
- defer ที่ยัง track: CHANGELOG compare link `[Unreleased]` ยัง pin v0.7.0 (หนี้เดิม — แก้ตอน release/publish รอบหน้า, ดู `tasks/stage-wiring/issue.md` #1)
