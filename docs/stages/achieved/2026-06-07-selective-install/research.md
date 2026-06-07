# Research — selective-install (feasibility evaluation)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> Discovery เชิง **evaluation** (Q1 = สำรวจก่อน, ยังไม่มี demand) — ผลคือข้อเสนอ ไม่ใช่ commitment

| | |
|---|---|
| **Slug** | `selective-install` |
| **วันที่** | 2026-06-07 |

---

## 1. คำถามวิจัย
- [x] RQ1: อะไรใน 'CORE' ที่แยกติดตั้งได้จริง (เชิงความหมาย)?
- [x] RQ2: stage แยกติดตั้งได้ไหม (ผูกกันเชิงลำดับ)?
- [x] RQ3: manifest + JSON Schema validate ทำแบบ zero-dep ได้ไหม?
- [x] RQ4: cost (โค้ด/ดูแล) vs benefit (มี demand?) — คุ้มไหม?
- [x] RQ5: มี "narrow version" ที่อยู่ในปรัชญา opinionated ไหม?

## 2. วิธี & แหล่งข้อมูล
- [x] อ่าน `src/bin/cli.mjs` (CORE), `src/.warnyin/workflow/stages/*.md` (cross-ref), `docs/rule.md` §1, roadmap #11
- [x] node capability (JSON Schema built-in?)

## 3. Findings

### RQ1: CORE = 5 ก้อน
`.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`, `.claude/agents`, `.claude/skills` — ติดตั้งทั้งชุดเสมอ (opinionated)

### RQ2: ★ stage แยกไม่ได้เชิงความหมาย
- stage `.md` ไม่อ้างชื่อ stage อื่นตรง ๆ (grep = 0) **แต่** workflow เป็น **ลำดับพึ่งพา**: BUILD ใช้ task ที่ DESIGN สร้าง · VERIFY เทสสิ่งที่ BUILD ทำ · SHIP promote ทุก stage → ติดตั้ง "บาง stage" = workflow ใช้ไม่ได้
- **contexts ผูก 5/5 stage · roles 4/5** (stages อ้างถึง) → drop role/context = stage ที่ชี้ถึงพัง
- **นัย:** stage/role/context = หน่วยเดียวที่ coherent — เลือกบางส่วน = ทำลายความสมบูรณ์

### RQ3: ★ zero-dep JSON Schema = ขัดแย้งกับจุดขาย
- node 24 **ไม่มี JSON Schema validator built-in** → 2 ทางเท่านั้น:
  - hand-roll validator (โค้ด zero-dep เพิ่มเยอะ + ดูแลเอง)
  - `ajv`/lib = **devDependency → ทำลาย zero-dep** (rule §2 จุดขาย)
- **นัย:** manifest+schema ราคาแพง (เขียน validator เอง) หรือผิดหลัก (devDep)

### RQ4: cost vs benefit
- **cost:** manifest parser + hand-roll schema validate + CLI flags (`--only`/`--modules`) + partial-install logic ใน copyTree + tests (count ขึ้นเยอะ) + docs + รักษา manifest ให้ทันโครง
- **benefit:** **ไม่มี demand จริง** (Q1 = สำรวจ); แยกได้จริงแค่ agents(5)+skills(3) ที่เป็น `.md` เล็ก → **ไม่มี install-size/perf benefit**
- **นัย:** cost » benefit ชัดเจน

### RQ5: narrow version ที่อยู่ในปรัชญา?
- แทน manifest อิสระ (catalog creep) → **bounded install profiles** (เช่น `--minimal` = CORE 5-stage + commands, ข้าม agents+skills) = opinionated 2-3 profile ไม่ใช่เลือกอิสระ
- แต่ profiles ก็ยัง **ไม่มี demand** + เพิ่ม surface — ประโยชน์น้อย (agents/skills เล็ก)

## 4. Code inspection
| จุด | พบ | นัย |
|---|---|---|
| `cli.mjs` CORE (5 ก้อน) | install ทั้งชุด | แยก = แก้ copyTree + flag |
| `stages/*.md` cross-ref | ไม่อ้าง stage อื่น (text) แต่ผูกลำดับ workflow | แยก stage = workflow พัง |
| `contexts/roles` ↔ stages | 5/5 + 4/5 อ้างถึง | แยก = dangling ref |
| node JSON Schema | ไม่มี built-in | hand-roll หรือ devDep |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก | cost | benefit | ขัดปรัชญา? | 
|---|---|---|---|
| A. manifest-driven (ECC-style) | สูง (schema zero-dep) | ต่ำ (no demand) | ✗ สวน opinionated + เสี่ยง zero-dep | 
| B. bounded profiles (`--minimal`) | กลาง | ต่ำ (no demand, agents/skills เล็ก) | บางส่วน | 
| C. re-affirm deferral | 0 | — | ✓ ตรงปรัชญา | 

## 6. ความเสี่ยง / unknown
- ถ้าทำ A: ผู้ใช้ติดตั้งไม่ครบ → workflow พังเงียบ (support burden); manifest drift จากโครงจริง
- unknown เดียว: demand อนาคต — แต่ตอนนี้ = 0 (Q1)

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำจาก research:** หลักฐานชี้ **re-affirm deferral (C)** — stage แยกไม่ได้เชิงความหมาย + zero-dep schema ขัดจุดขาย + ไม่มี demand + benefit แทบ 0; ทำตอนนี้ = over-engineer ตรงที่ roadmap เตือนเป๊ะ
- ถ้า demand เกิดจริงในอนาคต → พิจารณา **B (bounded profiles)** ก่อน A (ไม่เอา manifest อิสระ/SQLite ของ ECC)
