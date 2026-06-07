# Spec — dogfood-specs

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — backfill living behavior spec จริง 2 ไฟล์ ตาม format design §4.1

## 1. ชนิดของ task
`data` (docs/content) — เขียน living behavior spec จากพฤติกรรมจริงในไฟล์ source (ไม่ใช่ runtime code)

---

## 2. ผลลัพธ์ที่ต้องสร้าง (2 ไฟล์ เท่านั้น)
- `docs/features/context-profiles/spec.md`
- `docs/features/utility-skills/spec.md`

ทั้งคู่ตาม **canonical format design §4.1** เป๊ะ (copy header guidance block จาก §4.1 — ห้ามแต่งใหม่):
- header: `# Spec — <ชื่อ feature>` + blockquote guidance 5 บรรทัด (living/observable-only/descriptive/placeholder/≤100บรรทัด+observable-artifact)
- `## Requirement: <ชื่อ>` → 1-2 บรรทัดพฤติกรรม → `### Scenario:` (GIVEN/WHEN/THEN)
- **descriptive ไม่ใช่ imperative** — บันทึก "ระบบทำอะไร" ห้าม instruction สั่ง agent
- **THEN = observable artifact** (ไฟล์/section/callout/key string มีจริง) — feature ทั้งสองเป็น `.md` ไม่มี runtime
- ค่า scenario = placeholder/synthetic เท่านั้น
- ~≤100 บรรทัด/ไฟล์ · requirement ละ 1-3 scenario · **3-5 requirement/ไฟล์** (กระทัดรัด)

## 3. Source of truth ต่อ feature (สกัด requirement/scenario จากตรงนี้ — ห้ามเดา/เขียนจากความจำ)

### context-profiles → source
- `src/.warnyin/workflow/contexts/{research,build,review}.md` — แต่ละใบมี 4 section คงที่: `## Mindset` · `## Do / Don't` · `## Tool preference` (มี `Model tier:`) · `## ใช้คู่ stage ไหน`
- `src/.warnyin/workflow/contexts/README.md` — ตาราง `context ↔ stage` + ตาราง `Model tier` (generic vocab `deepest reasoning`/`balanced`/`review`→`balanced+`) + หลักการ context⊥role
- callout `Context profile` ใต้ title ใน `src/.warnyin/workflow/stages/{discovery,design,build,verify,ship}.md` (grep ได้ 5 จุด — mapping: discovery→research · design→research+build · build→build · verify→review · ship→review)

### utility-skills → source
- `src/.claude/skills/{update-codemaps,explore,next}/SKILL.md` — frontmatter YAML key: `name` (=ชื่อ folder) · `description` · `when_to_use` · `allowed-tools` (read-only set)
- body แต่ละ skill: "ทำหน้าที่เป็น <role> ... อ่าน `.warnyin/workflow/<x>.md` ... ชี้ playbook ไม่ duplicate"
- **ไม่มี key `disable-model-invocation`** ใน frontmatter (= auto-invocable)
- `docs/rule.md` §1 — skill-adapter convention (adapter บางชี้ playbook · auto-invoke เฉพาะ read-only safe · ไม่แปลง package เป็น plugin)

## 4. Data-flow
source `.md` จริง (ตาราง §3) → สกัด observable behavior → เขียนเป็น Requirement/Scenario ใน 2 spec ปลายทาง → เป็นตัวอย่างจริงพิสูจน์ format §4.1

## 5. ขอบเขตไฟล์ — **สร้างใหม่ 2 ไฟล์เท่านั้น**
- **ห้ามแตะ** `src/` ใดๆ · `feature.md`/`business.md` เดิม · docs กลางอื่น (`docs/rule.md`, `docs/features/<อื่น>`)

## 6. Persona
maintainer ของ repo + VERIFY ของ topic ถัดไปที่จะใช้ spec 2 ตัวนี้เป็น regression baseline จริง

## 7. Test-flow
> accuracy check ตาม `docs/rule.md` §5 — ทุก scenario เทียบ source แล้วตรง (ระบุ source pointer ต่อ requirement)
- [ ] 2 ไฟล์มีจริง + ตรง format §4.1 (header guidance block + `Requirement:`/`Scenario:` + GIVEN/WHEN/THEN)
- [ ] **context-profiles**: ทุก requirement ชี้ artifact ที่ตรวจได้ — เช่น 3 context card มีจริง / 4 section คงที่ / README mapping table / 5 callout ใน stages (grep `Context profile`) / model-tier generic ไม่มีชื่อรุ่น
- [ ] **utility-skills**: ทุก requirement ชี้ artifact ที่ตรวจได้ — เช่น 3 SKILL.md มีจริง / frontmatter 4 key / `allowed-tools` read-only / body ชี้ playbook / ไม่มี `disable-model-invocation`
- [ ] ทุก THEN เป็น observable artifact (ไฟล์/section/callout/key string) ไม่ใช่พฤติกรรม AI ที่วัดไม่ได้
- [ ] descriptive (ไม่มี imperative สั่ง agent) · placeholder เท่านั้น · ~≤100 บรรทัด/ไฟล์ · 3-5 requirement/ไฟล์
- [ ] `npm run lint:md` ผ่าน (ทุกลิงก์ resolve)
- [ ] `npm run verify:pack` ผ่าน — 2 ไฟล์ไม่หลุดขึ้น tarball (`docs/` อยู่ใน denylist อยู่แล้ว — `src/scripts/verify-pack.mjs:14`)
