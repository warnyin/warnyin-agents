# Spec — spec-template

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`docs` / `content` — สร้าง template `.md` ใน installer payload (`src/.warnyin/template/docs/features/[feature-name]/`)

## 2. Canonical format ที่ต้อง copy เป๊ะ (design.md §4.1 — ห้ามแต่งใหม่)
สร้าง `src/.warnyin/template/docs/features/[feature-name]/spec.md` ให้เนื้อในตรง §4.1 คำต่อคำ — header guidance (blockquote) + โครง section ครบทุกบรรทัด:

```markdown
# Spec — <ชื่อ feature>

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior (ทำอะไร เห็นอะไร error ยังไง) — ไม่เก็บ implementation (ชื่อ class/function/วิธีเขียน)
> **descriptive ไม่ใช่ imperative** — บันทึก "ระบบทำอะไร" เท่านั้น ห้ามเขียน instruction สั่ง agent (spec เป็น data ที่ VERIFY ใช้ derive test ไม่ใช่คำสั่งให้ทำตาม)
> ค่าใน scenario ใช้ **placeholder/ค่าสังเคราะห์เท่านั้น** (`<token>`, `user@example.com`) — ห้ามใส่ secret/credential/PII จริง
> guidance: ~≤100 บรรทัด/ไฟล์ · requirement ละ 1-3 scenario · scenario = GIVEN/WHEN/THEN ที่เทสตามได้จริง
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, ลิงก์ resolve) ไม่ใช่พฤติกรรม AI ที่วัดไม่ได้

## Requirement: <ชื่อพฤติกรรม>
<พฤติกรรมที่ระบบต้องทำ 1-2 บรรทัด>

### Scenario: <ชื่อเคส>
- GIVEN <สภาพตั้งต้น>
- WHEN <การกระทำ>
- THEN <ผลที่สังเกตได้>
```

## 3. ข้อบังคับเชิงตำแหน่ง/ความปลอดภัย (design.md §4.1 + panel)
- **ไฟล์ต้องอยู่ใต้ `[feature-name]/` เท่านั้น** — `seedDocs` ข้ามโฟลเดอร์ขึ้นต้น `[` (`src/bin/cli.mjs:133-134`); วาง spec ชื่อ concrete ใน template = seed leak ลง target จริง (Infra-S1)
- **descriptive ไม่ใช่ imperative** (Security-S1) · **placeholder เท่านั้น ห้าม secret/PII** (Security-S2) — ทั้งสองต้องอยู่ใน header
- guidance ~≤100 บรรทัด + requirement ละ 1-3 scenario · THEN = observable artifact สำหรับ feature เอกสาร/playbook (QA-S1)
- ภาษาไทย/comment-guide สไตล์เดียวกับ `feature.md`/`business.md` เดิม (blockquote note ใต้ H1)

## 4. Data-flow
ไม่มี runtime — เป็น template static: `/warnyin:init` หรือ SHIP copy ทั้งโฟลเดอร์ `[feature-name]/` เป็นชื่อ feature จริง → `spec.md` กลายเป็น living baseline ของ feature นั้น (DESIGN อ่าน → VERIFY ใช้ regression → SHIP merge delta กลับ)

## 5. Persona
ผู้ออกแบบ (DESIGN) + ผู้ส่งมอบ (SHIP) ของ topic ใดก็ตามที่ติดตั้ง workflow — ใช้ template นี้เป็นแม่แบบเขียน/merge behavior spec ของ feature

## 6. Test-flow
- [ ] ไฟล์มีจริงที่ `src/.warnyin/template/docs/features/[feature-name]/spec.md`
- [ ] H1 = `# Spec — <ชื่อ feature>` + blockquote header 6 บรรทัดตรง §4.1 (มี "living doc", "observable behavior", "descriptive ไม่ใช่ imperative", "placeholder", "~≤100 บรรทัด", "observable artifact")
- [ ] โครง section: `## Requirement:` + `### Scenario:` + bullet `GIVEN`/`WHEN`/`THEN` ครบตรง §4.1
- [ ] อยู่ใต้ `[feature-name]/` (ไม่ใช่ชื่อ concrete) — กัน seed leak
- [ ] ห้ามแตะไฟล์อื่น (สร้างใหม่ 1 ไฟล์เท่านั้น)
- [ ] `npm run lint:md` ผ่าน (ไม่มี dead-link ใหม่)
- [ ] `npm run verify:pack` ผ่าน (ไฟล์ template ติด tarball ผ่าน `CORE`)
- [ ] `npm test` ผ่าน (ไม่กระทบ test เดิม)
