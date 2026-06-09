# Verify — adaptive-api-doc

> สรุปผล VERIFY · playbook: `.warnyin/workflow/stages/verify.md`
> ชนิด topic: payload `.md` ล้วน (capability doc + hook + adapter) → verify เชิงโครงสร้าง + executable proof

## ผลรวม
- **ผ่านทั้ง 12 เคส (T1-T12) — จำนวนรอบแก้: 0** (retrofit: implement + panel verify มาก่อน → ไม่มี finding)
- ไม่มี service ให้ launch (docs/playbook); ไม่ verify runtime contract-validation (เป็น behavior ของโปรเจกต์ปลายทาง ตาม design §8)

## ผลรายเคส

| # | เคส | ผล | หลักฐาน |
|---|---|---|---|
| T1 | `api-doc.md` section ครบ (§2 detect+skip / §3 3-mode / §4 DESIGN·VERIFY·SHIP / §5 secret hygiene / §6 component resolution) | ✅ | grep section + `<component>` resolution + "ไม่ใช่ → ข้าม" พบครบ |
| T2 | tool-agnostic — ไม่มี model-tier ฝัง guidance (ยกเว้น header callout บรรทัด 3) | ✅ | `tail -n+4 | grep Opus\|Sonnet\|GPT-4\|Gemini\|Claude\|Codex` → ไม่พบ |
| T3 | reference ไม่ vendor | ✅ | `roles/README.md` มีแถว `openapi-spec-generation`; `src/.claude/skills/` ไม่มีโฟลเดอร์นั้น |
| T4 | pointer 3 stage + section ที่อ้างมีจริง | ✅ | design=3, verify=2, ship=2 pointers; `§2`/`§4` มีจริงใน api-doc.md |
| T5 | gate conditional (N/A เมื่อไม่ใช่ REST API) | ✅ | design:115, verify:75, ship:87 — มีถ้อยคำ "ถ้าแตะ REST API"/"N/A"/"ถ้ามี openapi.yaml" |
| T6 | unify-in-place — design §6 spec.md ชี้ openapi.yaml | ✅ | พบ "ชี้มาที่ `openapi.yaml`" ใน design.md |
| T7 | adapter — workflow/README ลิสต์ api-doc.md | ✅ | grep พบ |
| T8 | CHANGELOG `[Unreleased]` มี entry | ✅ | พบ "Adaptive API documentation" |
| T9 | dead-link สองทิศ (`npm run lint:md`) | ✅ | `✓ lint-md ผ่าน: 81 ไฟล์ 44 ลิงก์` (0 dead) |
| T10 | regression `npm test` | ✅ | `tests 53 · pass 53 · fail 0` |
| T11 | ship integrity — api-doc.md ติด tarball | ✅ | `npm pack --json` → `src/.warnyin/workflow/api-doc.md` อยู่ใน files |
| T12 | executable install proof — `setup:sandbox` | ✅ | target `wy-sandbox-*/.warnyin/workflow/api-doc.md` ลงจริงผ่าน cli.mjs + README listing; root dogfood ไม่โดนแตะ (git status ว่าง) |

## UX/UI
- N/A (ไม่ใช่ frontend — payload `.md`)

## หมายเหตุส่งต่อ SHIP
- feature ใหม่ `api-doc` → SHIP สร้าง `docs/features/api-doc/` (feature.md + spec.md จาก §9 ADDED)
- **defer จาก Infra panel (S1):** เพิ่มบรรทัดใน `docs/infra.md` ว่าเครื่องมือ API-doc เป็น optional ของโปรเจกต์ปลายทาง (คง zero-dep) — ดู `tasks/stage-integration/rule.md` §2
- learned-rule candidate: "stage-invoked capability convention" (`tasks/capability-core/rule.md` §2)
- CHANGELOG entry อยู่ `[Unreleased]` แล้ว — SHIP ไม่ต้องเพิ่มซ้ำ
