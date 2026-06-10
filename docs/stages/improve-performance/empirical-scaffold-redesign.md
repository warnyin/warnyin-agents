# Empirical proof — redesign DAG ของ scaffold-foundation ด้วย toolkit ใหม่

> VERIFY V11 · sandbox (อ่าน example เดิม read-only — **ไม่แก้ไฟล์ใน `example/`**)
> gate ตาม design §8: DAG ใหม่มี **≥1 wave ที่มี task >1** (structural/observable) · wall-clock = informational

## Baseline (DAG เดิมของ example/scaffold-foundation §7)
```
monorepo-skeleton ──▶ api-scaffold-rls ──▶ web-scaffold-refine ──▶ ci-pipeline
```
- **depth = 4 · ทุก wave width = 1** (chain เส้นตรง — 4 agent เรียงกัน 1 ตัว/wave)
- = ปัญหาเดิมที่ user รายงาน ("ทำแค่ agent ตัวเดียว/phase เดียว")

## หลักฐานจริงที่ทำให้ decouple ได้ (จาก task เดิม)
`web-scaffold-refine` depend `api-scaffold-rls` ด้วย **2 เหตุผลที่แยกชนิดกัน**:
| เหตุผล | ชนิด | decouple ได้ไหม |
|---|---|---|
| `Note`/`NoteListResponse` type | **contract** — `monorepo-skeleton` (wave 1) สร้าง **stub ไว้แล้ว** ใน `packages/types` + มี `openapi.yaml` | ✅ ใช้ contract-first decouple (3A ข้อ 1) — web build กับ stub/contract, api เติม type เจ้าของจริงขนานกัน |
| "note endpoint วิ่งจริงที่ 3001" (Playwright smoke web↔api) | **integration runtime** (e2e) | ✅ ย้ายไป full-gate (3D) — per-task self-verify = scope component ตัวเอง (web: build/lint/type/unit) ไม่รัน cross-component e2e ต่อ task |

→ เหตุผลเดียวที่ web เคยขนาน api ไม่ได้คือ e2e ต้องการ api live; **rule 3D ใหม่ย้าย integration ไป full-gate** → ปลดล็อกขนาน

## Redesigned DAG (apply toolkit 3A + 3D)
```
wave 1: monorepo-skeleton                       (freeze config + stub Note/NoteListResponse + openapi contract)
            │
        ┌───┴───────────────┐
        ▼                   ▼
wave 2: api-scaffold-rls   web-scaffold-refine   ◀── WIDTH 2 (contract-first decouple)
            │                   │                     · api: implement endpoint + เติม Note DTO เจ้าของจริง
            └─────────┬─────────┘                     · web: build กับ contract (stub type + openapi); verify = component scope (3D)
                      ▼
wave 3: ci-pipeline                              (e2e smoke web↔api live + gate ครอบโค้ดจริง = integration ที่ full-gate)
```
- **depth = 3** (เดิม 4) · **wave 2 width = 2** (เดิมทุก wave = 1)
- `ci-pipeline` ยอม serialize (3A ข้อ 3 — chain แท้: gate ต้องมีโค้ด api+web จริง)
- **config coupling เดิมยังเคารพ:** monorepo-skeleton freeze config contract, downstream override ใน app ตัวเอง ไม่แก้ base → ไม่มี hidden coupling ใหม่
- **integration risk จัดการแล้ว:** ถ้า api เปลี่ยน contract → web พัง แต่ contract **frozen ที่ wave 1** (stub envelope `NoteListResponse`) + ci-pipeline (wave 3) จับ drift = toolkit 3A ครบ loop

## ✅ ผล empirical (gate §8)
- [x] DAG ใหม่มี **≥1 wave ที่ task >1** → wave 2 = 2 task (api ‖ web) **PASS**
- [x] critical-path depth ลด 4→3 (informational; gate ดูที่ width>1)
- [x] decouple มีหลักฐานจริง (stub type + openapi contract มีอยู่จริงใน example) ไม่ใช่สมมุติ
- [x] ไม่แตะ `example/` (sandbox read-only)

## Data point ที่ 2 (dogfood ของ topic นี้เอง)
BUILD ของ `improve-performance` เอง = **wave 1 width 3** (dag-width-toolkit ‖ build-wave-model-arg ‖ lean-build-verify, file-ownership disjoint) → ยืนยัน toolkit ใช้ได้จริงกับงานจริง 2 เคส (scaffold redesign + งานนี้เอง)
