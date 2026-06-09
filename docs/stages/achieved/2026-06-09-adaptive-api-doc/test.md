# Test — adaptive-api-doc

> แผน/วิธีเทสระดับ topic · playbook: `.warnyin/workflow/stages/verify.md`
> ชนิด: **payload `.md` ล้วน** (capability doc + hook + adapter, ไม่มี runtime) → verify เชิงโครงสร้าง + executable install proof + consistency (guideline `docs/techstack/installer/test.md` §"verify feature ที่เป็น payload `.md` ล้วน")
> baseline regression: feature `api-doc` ยังไม่มี `docs/features/api-doc/spec.md` (สร้างตอน SHIP) → รอบนี้ verify ที่ `src/.warnyin/...` artifacts; ไม่ verify runtime contract-validation (เป็น behavior ของโปรเจกต์ปลายทาง — design §8)

## วิธีเทส
deterministic string/structure assertion ด้วย grep/read บน `src/` + executable proof (`npm test`, `setup:sandbox`). ไม่มี service ให้ launch

## Test cases (จาก test-flow ใน task spec + guideline payload-.md)

| # | เคส | ที่มา | คาดหวัง |
|---|---|---|---|
| **T1** | `api-doc.md` มีอยู่ + section ครบ (Auto-detect / เลือกโหมด / บทบาทต่อ stage); §2 มีสัญญาณ+"ไม่ใช่→ข้าม"; §3 มี 3 mode; §4 ครบ DESIGN/VERIFY/SHIP; §5 secret hygiene; §6 component resolution | capability-core spec T-flow | ครบทุกข้อ |
| **T2** | tool-agnostic — ไม่มี model-tier (Opus/Sonnet/GPT-4/Gemini-Pro) ฝังเป็น guidance (ยกเว้น header callout บรรทัด 3) | design §9 | ไม่พบ |
| **T3** | reference ไม่ vendor — `roles/README.md` มีแถว `openapi-spec-generation`; `src/.claude/skills/` ไม่มีโฟลเดอร์ `openapi-spec-generation` | design §9 | ตรง |
| **T4** | pointer 3 stage — `stages/{design,verify,ship}.md` มี `.warnyin/workflow/api-doc.md` ในจุดเรียกใช้จริง; เลข section ที่อ้าง (`§2`/`§4`) มีจริงใน api-doc.md | stage-integration spec + Tech Lead panel | ครบ + section มีจริง |
| **T5** | gate conditional — gate 3 stage มีข้อ API contract ระบุ "ถ้าแตะ REST API"/"N/A"/"ถ้ามี openapi.yaml" | stage-integration spec | ครบ 3 |
| **T6** | unify-in-place — `design.md` §6 ข้อ API task มี "ชี้มาที่ openapi.yaml" + ไม่เขียน schema ซ้ำ | design §9 | พบ |
| **T7** | adapter — `workflow/README.md` รายการไฟล์มี `api-doc.md` | stage-integration spec | พบ |
| **T8** | CHANGELOG — `[Unreleased]` มี entry adaptive API documentation | stage-integration spec | พบ |
| **T9** | dead-link สองทิศ — pointer ใน `api-doc.md` + ทุกไฟล์ที่อ้าง `api-doc.md` resolve เป็นไฟล์จริง (รวม `npm run lint:md`) | guideline payload-.md | 0 dead |
| **T10** | regression — `npm test` เขียว (pass = tests, ≥ 53) | guideline | เขียว |
| **T11** | ship integrity — `api-doc.md` ติด tarball (allowlist `src/.warnyin/`) ผ่าน `checkFiles` | guideline | ติด |
| **T12** | executable install proof — `setup:sandbox` → target มี `.warnyin/workflow/api-doc.md` (cli.mjs copy จริง); root dogfood ไม่โดนแตะ | guideline | ลงจริง |

## เกณฑ์ผ่าน
ทุกเคส T1-T12 ผ่าน; ข้อไม่ผ่าน → แก้ root cause (ห้ามลด bar) → rerun → นับจำนวนรอบ
