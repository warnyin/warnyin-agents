# Ship — validator-status

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ — เขียนหลังย้าย topic เข้า `docs/stages/achieved/2026-06-08-validator-status/` แล้ว

## 1. สรุป topic
- **ทำอะไร:** เพิ่ม `validate-topic.mjs` (zero-dep `node:*`, 2 โหมด status/validate) เช็ค **โครง** ของ topic/feature spec แบบ deterministic + wire เข้า workflow 3 จุด (next/DESIGN gate/SHIP step 1 — node-guard) — ยืมข้อ 3 จากวิเคราะห์ OpenSpec; เช็ค ✖ (C2/C3/C5 = existence/structure) แยกจาก ⚠ (C1/C4 = filled-heuristic best-effort)
- **ประเภท:** ☑ feature ใหม่ → `docs/features/topic-validator/`
- **★ end-to-end proof แรกของวงจร Spec delta** — topic มี §9 Spec delta จริง (4 ADDED requirement) → SHIP **merge สร้าง `docs/features/topic-validator/spec.md` จาก ADDED ทั้งก้อน** (feature ใหม่ตามกติกา ship §4 step 5.1) → validator เช็ค spec ของตัวเองผ่าน C5 (วงจรปิด)

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/topic-validator/` | ใหม่ — feature.md + business.md + **spec.md** (merge จาก §9 ADDED — normalize H4/H5 → H2/H3 ให้ตรง canonical format ที่ validator C5 เช็ค) |
| `docs/rule.md` | P1: "structural validator ✖ ไม่พึ่ง filled-detection; heuristic = ⚠ best-effort" (§1) · E1: "negative fixture ของ keyword-heuristic เลี่ยง trigger phrase" (§5) |
| `docs/techstack/installer/test.md` | section ใหม่ "verify structural validator / zero-dep CLI tool" (behavior + temp fixture + dogfood self-validate + security grep + zsh caveat) |
| `docs/troubleshooting.md` | #15 — negative fixture match keyword ตัวเอง · #14 อัปเดต (validator-status เจอซ้ำ wave 2) |
| `docs/roadmap.md` | ข้อ 14 ✅ DONE |
| `docs/codemap/` | index.md +validate-topic.mjs ใน entry points + freshness header |
| `docs/infra.md` / `docs/project.md` | ไม่แตะ — ไม่มี env/scope เปลี่ยน |

## 3. Learned rules (planned + emergent)
| rule (generalize) | evidence (pointer + artifact) | scope | promote? |
|---|---|---|---|
| P1: structural validator ✖ ต้องเป็น existence/structure (deterministic); heuristic เดา "เติมแล้ว" = ⚠ best-effort ไม่ block | design review B1 (FILLED_MARKERS เปราะ → H1-heuristic + demote C1/C4) + `validate-topic.mjs` §4.2 | `project` | ✅ → `docs/rule.md` §1 |
| E1: negative fixture ของ keyword-heuristic เลี่ยง trigger phrase ใน filler | `troubleshooting.md` TS-1 (C4 false-skip จาก "ไม่มี delta" ใน filler) | `component:installer` (testing) | ✅ → `docs/rule.md` §5 |
| (playbook-wiring) | ไม่มี rule ใหม่ — wiring ตาม convention เดิม (canonical-copy promote แล้วจาก feature-spec-delta) | — | — |

## 4. Spec delta merge (กลไกที่เพิ่ง build ของ feature-spec-delta ใช้จริงรอบแรก)
- feature ใหม่ → สร้าง spec.md จาก ADDED ทั้งก้อน (ตาม ship playbook §4 step 5.1) — ไม่มี MODIFIED/REMOVED รอบนี้
- key ปลายทาง = `topic-validator` (feature ใหม่ — ไม่มี key เดิมให้ STOP); ทุก Requirement annotate `(→ feature: topic-validator)` ใน §9 ตรงกับโฟลเดอร์ที่สร้าง
- validator (ที่ topic นี้ build เอง) เช็ค spec ที่ merge แล้วผ่าน C5 = self-consistent proof

## 5. Archive
- ย้ายจาก `docs/stages/validator-status/` → `docs/stages/achieved/2026-06-08-validator-status/` เมื่อ 2026-06-08 (git mv ก่อน promote)
- defer ที่ยัง track (จาก build): build-wave.mjs ควรให้ worktree branch จาก build branch (TS-2/#14 — improvement ค้าง) · CHANGELOG compare link v0.7.0 (หนี้เดิม)
