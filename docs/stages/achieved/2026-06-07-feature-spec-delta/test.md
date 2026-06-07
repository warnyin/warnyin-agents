# Test Plan — feature-spec-delta

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> แผน/วิธีเทสของ topic นี้ — ตอน **SHIP** จะ merge เข้า `docs/techstack/<component>/test.md`
> อิง guideline `docs/techstack/installer/test.md` §"verify feature ที่เป็น payload `.md` ล้วน" + design §8 (test strategy)

| | |
|---|---|
| **Slug** | `feature-spec-delta` |
| **Component** | installer / workflow payload |
| **Env** | local — build branch `build/feature-spec-delta` (zero-service: payload `.md` + template; ไม่มี runtime ให้รัน) |
| **วันที่** | `2026-06-07` |

## เคสทดสอบ

### T1 — Ship integrity (gate เดิมของ repo)
- `npm test` เขียวทั้ง suite (pass count = tests, ≥9) · `npm run verify:pack` (template ใหม่ติด tarball, docs/ ไม่รั่ว) · `npm run lint:md` (0 dead-link)

### T2 — Executable install proof (sandbox)
- `npm run setup:sandbox` → ใน target ต้องมี `.warnyin/template/docs/features/[feature-name]/spec.md` (template ติดไปกับ CORE)
- **negative (seedDocs skip):** target ต้อง**ไม่มี** `docs/features/[feature-name]/` (seed ข้าม `[...]`) — design §8 optional ยกมาเป็นเคสจริง
- playbook ที่ wire แล้ว (`.warnyin/workflow/stages/{design,verify,ship}.md` ใน target) มี wording Spec delta จริง
- ห้ามรัน `cli.mjs` ที่ cwd=repo root (dogfood leak #6)

### T3 — Canonical consistency (semantic ไม่ใช่แค่ grep)
- grep canonical key (`Spec delta`, `ADDED`/`MODIFIED`/`REMOVED`, `read-modify-verify`, `STOP`, `[เดิมชื่อ:]`, `GIVEN`/`WHEN`/`THEN`) ครบทุกไฟล์ที่ควรมี
- อ่าน diff จริงของ 3 playbook + 2 template + 3 command → เทียบกติกา merge กับ design §4.3 **คำต่อคำ** (5 องค์ประกอบ: read-modify-verify+STOP / rename / feature ใหม่ / organic backfill / docs-match-code+stale re-check)
- unify-in-place invariants: verify §3 ยังมี principle เท่าเดิม (ขยายข้อ 1 ไม่เพิ่มข้อ) · ship §4 step 5 ยังมี sub-step เท่าเดิม (ขยาย 5.1) · ไม่มี renumber
- command mirror ×3 บาง — ชี้ playbook ไม่ duplicate กติกา merge เต็ม

### T4 — Dogfood spec accuracy (rule `docs/rule.md` §5 — เทสอิสระจาก build agent)
- ทุก Requirement/Scenario ใน `docs/features/{context-profiles,utility-skills}/spec.md` เทียบ source จริง — claim ตรง, ไม่ over-claim
- THEN ทุกข้อเป็น observable artifact (grep/อ่านไฟล์ตรวจได้จริง)
- format ตรง template §4.1 (H1 + guidance block + Requirement/Scenario/GIVEN-WHEN-THEN) + ≤100 บรรทัด

### T5 — Merge trace ด้วยมือ (executable proof ของกติกา merge — design §8, ปิด QA-B1)
- sandbox copy ของ dogfood spec ใน temp dir → สร้าง delta สมมติ 1 ชุดครบทุกเคส:
  1. **ADDED** → requirement ใหม่ต่อท้ายไฟล์
  2. **MODIFIED** (ชื่อตรง) → แทนที่เนื้อหา requirement เดิม
  3. **MODIFIED + rename** (`[เดิมชื่อ:]`) → หาด้วยชื่อเก่า แทนที่ด้วยชื่อใหม่+เนื้อหาใหม่ (ของเก่าไม่ค้าง, ไม่เกิด duplicate)
  4. **REMOVED** → requirement หายจากไฟล์
  5. **key ไม่เจอ** (MODIFIED อ้างชื่อที่ไม่มี) → ตามกติกาต้อง **STOP ถาม user** — assert ว่า playbook ระบุพฤติกรรมนี้ชัด + trace ไม่ merge ต่อ
- ทำใน temp dir เท่านั้น — ไม่แตะไฟล์จริง

## เกณฑ์ผ่านรวม
ทุกเคส T1-T5 ผ่าน · ไม่มี regression ใน suite เดิม · นับจำนวนรอบแก้ถ้ามี
