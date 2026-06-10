# Verify Report — เร่งความเร็ว BUILD stage (improve-performance)

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> guideline: `docs/techstack/installer/test.md` (payload `.md` + payload workflow script)

| | |
|---|---|
| **Slug** | `improve-performance` |
| **วันที่** | `2026-06-10` |
| **ผลรวม** | ✅ **ผ่าน** |
| **จำนวนรอบการแก้ไข (fix iterations)** | 1 รอบ |
| **จำนวนจุดที่แก้** | 1 จุด (adapter model id stale) |

## 1. จุดประสงค์ที่ verify (จาก spec/tasks)
BUILD เร็วขึ้นโดยไม่ regress — 4 กลไก:
- DESIGN แตก DAG กว้าง (DAG-width toolkit 3A + critical-path gate 3B) · model routing per task · lean self-verify (3D) · task/context lean (3E)
- **เจตนาแกน:** แก้ปัญหา "1 agent/wave, chain ยาว" (เคส scaffold-foundation depth 4)

## 2. ผลการเทส
| # | Test case | ชนิด | ผล | หมายเหตุ |
|---|---|---|---|---|
| V1 | `npm test` / `verify:pack` / `validate-topic` / `lint:md` | ship integrity | ✅ | test 58/58 · pack 77 · validate ✓ · lint 100 ไฟล์ |
| V2 | string[] เดิม → opts ไม่มี key model | runtime | ✅ | backward compat |
| V3 | `{name,model}` → opts.model = pass-through ตรงตัว | runtime | ✅ | ไม่ map/hardcode ชื่อรุ่น |
| V4 | `{name}` ไม่มี model → opts ไม่มี key model | runtime | ✅ | |
| V5 | shared-tree → ไม่มี isolation/model key | runtime | ✅ | 7/7 runtime helper pass |
| V6 | T1 toolkit landed (design.md 3A/3B/3E) | structural | ✅ | 6 anchors ตรง canonical |
| V7 | critical-path gate ที่ Gate §8 (judgment, ไม่ใช่ §7) | structural | ✅ | anchor ถูกตาม dry-run fix |
| V8 | T3 verify-scope=component + full-gate blocking | structural | ✅ | build.md §3 ข้อ4/ข้อ8 + §4 ข้อ6 ชัด "ห้ามลด bar" |
| V9 | payload generic + adapter map tier→รุ่น | structural | ✅ | payload ไม่มีชื่อรุ่น · adapter map ครบ |
| V10 | regression context-profiles (balanced+, 4-section) | regression | ✅ | balanced+ review ไม่ถูกแตะ · 3 card × 4 section |
| V11 | **empirical:** redesign scaffold DAG → width >1 | empirical | ✅ | wave 2 = 2 task (api‖web), depth 4→3 — `./empirical-scaffold-redesign.md` |

## 3. UX/UI verify
N/A — ไม่มี frontend/service (payload `.md` + workflow script)

## 4. รายการแก้ไข
| รอบ | ปัญหาที่เจอ (severity) | วิธีแก้ | ไฟล์ |
|---|---|---|---|
| 1 | adapter map `deepest → claude-opus-4-6` **stale** (รุ่นล่าสุด = Opus 4.8) — LOW (adapter-local, vocab generic ถูก) | แก้เป็น `claude-opus-4-8` (cheap/balanced ถูกอยู่แล้ว) — accuracy fix ไม่ลด bar | `src/.claude/commands/warnyin/build.md` |

## 5. ปัญหายาก/ซ้ำ → troubleshooting
- ไม่เจอปัญหายากใหม่ตอน VERIFY (entry BUILD 3 ตัวใน `./troubleshooting.md` ครบแล้ว)
- runtime proof helper ต้อง inject `RESULT_SCHEMA` stub (buildOpts อ้าง module const) — minor, ไม่ขึ้น KB

## 6. Empirical proof เด่น (จุดประสงค์แกน)
**2 data point ยืนยัน toolkit ทำงานจริง** (ดู `./empirical-scaffold-redesign.md`):
1. **scaffold-foundation redesign:** chain depth 4 (ทุก wave 1 task) → depth 3 + **wave 2 width 2** (api‖web) ด้วย 3A contract-first decouple (มี stub type + openapi จริงรองรับ) + 3D ย้าย e2e ไป full-gate
2. **dogfood ของ topic นี้เอง:** BUILD wave 1 = **width 3** (3 task ขนาน file-ownership disjoint)
→ ตอบ success criteria "≥1 wave ขนาน >1" ทั้งสองเคส (gate §8 PASS)

## ✅ Gate → SHIP (ดู `.warnyin/workflow/stages/verify.md` ข้อ 6)
- [x] เทสตามจุดประสงค์ครบ (functional + structural + runtime + empirical)
- [x] FE: UX/UI verify — N/A (ไม่มี frontend)
- [x] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่าน (1 จุด → เขียว)
- [x] test.md + verify.md เขียนครบ (+ empirical-scaffold-redesign.md)
- [x] ปัญหายาก/ซ้ำบันทึก troubleshooting.md แล้ว (จาก BUILD)
