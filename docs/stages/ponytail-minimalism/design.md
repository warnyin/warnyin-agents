# Design (How) — Ponytail Minimalism

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end

## 1. ภาพรวมสถาปัตยกรรม
- **component ที่เกี่ยวข้อง:** `installer` (payload `src/.warnyin/workflow/`) — เป็น playbook/เอกสารล้วน ไม่มี runtime code
- **แนวทางหลัก:** สร้างไฟล์แกน principle เดียว (`minimalism.md`) เป็น single source of truth แบบ top-level doc (วางระดับเดียวกับ `triage.md`/`api-doc.md`) แล้วทุก surface ที่เกี่ยว *ชี้กลับ* ด้วย pointer บรรทัดสั้น (canonical-copy: นิยามที่เดียว, ที่อื่น pointer) — สอด `unify-in-place` (รวม seed minimalism ที่กระจัดกระจายให้มีบ้านเดียว ไม่สร้างกลไกขนาน) และ `กระทัดรัด opinionated` (ไม่เพิ่ม folder/layer ใหม่)
- **ขอบเขตการเขียน:** เขียนที่ `src/` (canonical tracked) → mirror ลง root dogfood ด้วย `setup:dogfood`

### โครงเนื้อหา `minimalism.md` (token-lean — สเกลเทียบ triage.md/api-doc.md)
1. **หัว + เจตนา 2-3 บรรทัด:** "เขียนโค้ดน้อยที่สุดเท่าที่จำเป็น" + ใช้ตอนไหน (generate + review)
2. **Guardrail box "Lazy not negligent" (วางก่อน hierarchy เพื่อเด่น):** validation ที่ trust-boundary, data-loss handling, security, accessibility — **ห้ามตัด**
3. **Decision hierarchy 6 ขั้น** (เขียนเป็น checklist สั้น generic vocab):
   1. ต้องมีจริงไหม? → ไม่ → ข้าม (YAGNI)
   2. stdlib/built-in ทำได้? → ใช้
   3. native platform/framework feature? → ใช้
   4. dependency ที่ลงแล้วทำได้? → ใช้ (ไม่เพิ่ม dep ใหม่ถ้าเลี่ยงได้)
   5. one-liner ได้? → one-liner
   6. ค่อยเขียนเอง — ขั้นต่ำที่ทำงานจริง
4. **ใช้ในแต่ละ stage (pointer-style สั้น):** generate (BUILD) ใช้เป็น default · review/verify ใช้เป็น lens จับ over-engineering ("มี abstraction/โค้ดที่ตัดได้โดยไม่เสีย acceptance ไหม")
5. **ตัวอย่าง before/after 1 ชุด (สั้น):** เคส custom helper ที่ stdlib ทำได้อยู่แล้ว → ลดเหลือ one-liner (เป็นทั้งสื่อสอน + evidence success criteria)
6. **ขอบเขต (กัน over-cut):** ย้ำว่า minimalism ≠ ขี้เกียจ; ไม่ตัด test/spec/acceptance/guardrail

> **tool-agnostic:** ทั้งไฟล์ใช้ vocab generic — ห้ามอ้างชื่อรุ่น/tool/ผลิตภัณฑ์ใด ๆ (ตาม rule payload-guidance) และไม่อ้าง "ponytail" ในตัว payload (อ้างที่มาไว้ใน topic docs เท่านั้น)

## 2. Vertical slices
> หนึ่ง slice = หนึ่งหน่วยคุณค่า end-to-end → จะกลายเป็น 1 task
> **ไม่แบ่งตาม layer แนวนอน** (เช่น ไม่แยก "เขียนไฟล์แกน" กับ "เดิน pointer" เป็นคนละ task — ต้องเขียน coherent โดย single-writer แล้วพิสูจน์ครบใน slice เดียว)

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **minimalism principle live ใน workflow** — มีไฟล์แกน + reachable จากทุก surface (ผลิต+ตรวจ) + registered + shipped + dogfood ตรง + lint/pack/test เขียว | "doc layer" ของ payload: canonical doc (`minimalism.md`) → pointer ฝั่งผลิต (developer/build) → pointer ฝั่งตรวจ (review/verify) → registry (README) → mirror/gate (dogfood + verify-pack + lint-md + test) | `tasks/embed-minimalism-principle/` |

**เหตุผลที่เป็น slice เดียว:** เนื้อหาแกน + pointer ทุกจุดต้อง **coherent โดย single-writer** (สอด "serialize judgment/narrative") — แตกเป็นหลาย task จะได้ horizontal layering (เขียนไฟล์ vs เดิน pointer) ที่ integration เสี่ยงโดยไม่ได้ parallelism (แต่ละ edit เล็ก); pointer ต้องชี้ถ้อยคำ/heading จริงในไฟล์แกน → ต้องเขียนแกนก่อนในหัวเดียวกัน

## 3. Data model / schema
- ไม่มี data model / ไม่มี migration — เป็นเอกสาร markdown ล้วน
- "artifact ใหม่": 1 ไฟล์ `src/.warnyin/workflow/minimalism.md` (+ mirror root `.warnyin/workflow/minimalism.md` ผ่าน setup:dogfood)

## 4. Interface / contract
- ไม่ใช่ REST API → ไม่มี `openapi.yaml` (api-doc N/A)
- **"contract" เชิงเอกสาร = pointer convention:** ทุก surface อ้างไฟล์แกนด้วย **relative path ที่ lint-md resolve ได้**:
  - จาก `roles/developer.md` → `../minimalism.md`
  - จาก `contexts/build.md`, `contexts/review.md` → `../minimalism.md`
  - จาก `stages/build.md`, `stages/verify.md` → `../minimalism.md`
  - จาก `workflow/README.md` → `minimalism.md`
- รูปแบบ pointer: บรรทัดสั้นชี้กลับ ไม่ copy hierarchy (เช่น ใน developer checklist: "เขียนน้อยที่สุดตาม decision hierarchy — ดู `../minimalism.md`")

## 5. Flow
- **generate-flow (BUILD):** build sub-agent อ่าน `developer.md` (system prompt) → เห็น pointer → อ่าน `minimalism.md` → เดิน decision hierarchy ตอนเขียนโค้ด (default always-on)
- **review-flow (VERIFY):** session สวม `review.md` posture → เห็น over-engineering lens → อ่าน `minimalism.md` → ตรวจว่ามีโค้ดที่ตัดได้โดยไม่เสีย acceptance ไหม (เป็น lens ไม่ใช่ hard gate)
- **discoverability:** `workflow/README.md` list ไฟล์ → คน/agent หาเจอ

## 6. ผลกระทบต่อระบบเดิม
- ทุกการแก้ไฟล์เดิม = **เพิ่ม pointer บรรทัดสั้น** ไม่ลบ/แก้ logic เดิม → backward compatible 100%
- ไม่กระทบ: command, skill, build-wave.mjs, installer, validate-topic, gate ของ stage ใด (ไม่เพิ่ม gate item)
- `contexts/` ยังคง "3 ตัว" (ไม่เพิ่ม context — minimalism เป็น principle ไม่ใช่ session posture) → ไม่ชน rule "context ⊥ role / 3 พอ"
- payload ใหญ่ขึ้น 1 ไฟล์ (เล็ก) → verify-pack ยัง pass (files คลุม `src/.warnyin` อยู่แล้ว)

## 7. Dependency ระหว่าง slice/task
> slice เดียว = task เดียว

```
embed-minimalism-principle   (single node)
```

- **critical-path depth (longest chain):** 1 (มี task เดียว)
- **max wave width:** 1
- **เหตุผลที่เป็น single node (ไม่ใช่ chain เผลอ):** งานทั้งหมดคือ "เอกสารแกน + pointer ที่อ้างถ้อยคำในแกน" ซึ่งต้องเขียน **coherent โดย single-writer** (rule: "serialize judgment/narrative ที่ต้อง coherent" — `proposal/design`-style); DAG-width toolkit ใช้ไม่ได้เพราะ (1) contract-first decouple ไม่ช่วย — pointer ต้องอ้าง heading จริงในไฟล์แกนที่ยังไม่เขียน, (2) re-slice ต่างแกนแล้วได้ horizontal layering (เขียนไฟล์ vs pointer) ที่แย่กว่า, (3) ปริมาณงานเล็ก (1 ไฟล์ + ~6 pointer สั้น) — overhead การ split > ประโยชน์. ตรงตาม critical-path gate ของ playbook §8

## 8. Test strategy ระดับ design
- **structural:** `node .warnyin/workflow/scripts/validate-topic.mjs ponytail-minimalism` ไม่มี ✖ (task มี 4 ไฟล์ครบ)
- **payload integrity:** `npm run verify:pack` เขียว (minimalism.md ติด package)
- **dead-link:** `npm run lint:md` เขียว (ทุก pointer resolve ได้ทั้ง src และ root)
- **dogfood mirror:** หลัง `setup:dogfood` ไฟล์ root `.warnyin/workflow/minimalism.md` = src ตรงกัน
- **unit:** `npm test` เขียว (ไม่ควรกระทบ — เป็นเอกสาร; ถ้ามี test เช็คโครง payload ต้องยังผ่าน)
- **behavioral evidence (VERIFY):** ตัวอย่าง before/after ในไฟล์แกน แสดง output กระชับลงจริงอย่างน้อย 1 เคส
- **tool-agnostic check:** ไม่มีชื่อรุ่น/tool/ผลิตภัณฑ์ใน minimalism.md (grep)

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> ยังไม่มี feature `minimalism` (ไม่อยู่ใน `docs/features/`) → เป็น **ADDED** ภายใต้ feature ใหม่ `minimalism` (SHIP จะสร้าง `docs/features/minimalism/spec.md`)

### ADDED
#### Requirement: Minimalism principle เป็น single-source ใน workflow (→ feature: minimalism)
ระบบ workflow มีไฟล์แกน `minimalism.md` ที่ระบุ decision hierarchy "เขียนโค้ดน้อยที่สุด" + guardrail "lazy not negligent" และถูกอ้าง (pointer ไม่ duplicate) จาก surface ฝั่งผลิตและฝั่งตรวจ

- **Scenario: agent ฝั่งผลิตเดิน hierarchy**
  - กำหนดให้ build sub-agent อ่าน `roles/developer.md`
  - เมื่อจะเขียนโค้ดใหม่
  - ดังนั้น ต้องพบ pointer ไป `minimalism.md` และใช้ decision hierarchy (YAGNI → stdlib → native → dep → one-liner → ขั้นต่ำ) เป็น default
- **Scenario: lens ฝั่งตรวจจับ over-engineering**
  - กำหนดให้ session VERIFY สวม `contexts/review.md`
  - เมื่อรีวิว diff
  - ดังนั้น ต้องพบ over-engineering lens ที่ชี้ `minimalism.md` (ไม่ใช่ hard gate — เป็น lens)
- **Scenario: guardrail กัน over-cut**
  - กำหนดให้ agent ใช้ minimalism principle
  - เมื่อพิจารณาตัดโค้ด
  - ดังนั้น ต้องไม่ตัด validation ที่ trust-boundary / data-loss handling / security / accessibility / test / acceptance
- **Scenario: single source — ไม่ duplicate**
  - กำหนดให้มีหลาย surface อ้าง minimalism
  - เมื่อตรวจเนื้อหา
  - ดังนั้น hierarchy เต็มอยู่ใน `minimalism.md` ที่เดียว; surface อื่นเป็น pointer (relative link resolve ได้, lint-md เขียว)
- **Scenario: tool-agnostic**
  - กำหนดให้ `minimalism.md` เป็น payload
  - เมื่อตรวจถ้อยคำ
  - ดังนั้น ต้องไม่มีชื่อรุ่น/tool/ผลิตภัณฑ์ (vocab generic เท่านั้น)

### MODIFIED
ไม่มี

### REMOVED
ไม่มี

---

## Design review
- **Review panel:** ข้าม (user เลือก) — งาน docs-only ขนาดเล็ก, backward-compatible, ไม่มี code logic/security/data
- **Dry-run:** ข้าม (user เลือก) — task เดียว ขอบเขตชัด
- **Gate §8:** ผ่านครบ — proposal/design ครบ · ไม่มีการเดา (ถาม 4 รอบ: รูปแบบ→scope→ชั้น→intensity→artifact→success ใน Discovery + placement/VERIFY-wiring ใน DESIGN) · vertical slice 1 slice end-to-end · Spec delta ครบ (ADDED feature `minimalism`) · API contract N/A · task 4 ไฟล์ครบ (validate-topic ✓) · DAG depth 1/width 1 + เหตุผล explicit · rule ครบ + rule ใหม่ note รอ SHIP
