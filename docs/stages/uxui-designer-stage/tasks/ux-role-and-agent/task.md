# Task — UX role + agent (T1)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `ux-role-and-agent` |
| **Slice อ้างอิง** | `design.md` slice #1 (§2) |
| **Component** | `installer` (payload markdown — ไม่มี runtime) |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
> task นี้ส่งมอบคุณค่า end-to-end อะไร

สร้าง **role UX/UI Designer** ให้ AI หลักสวมเป็น lens ได้ + **agent adapter (Claude)** ที่ fan-out เป็น **generator วาด wireframe** (read-only) + ลงทะเบียนใน roles registry — ตัดผ่าน layer: role-card · agent-adapter · pointer-registry ครบในตัว

ผลลัพธ์ = มี role/agent ที่ "วาด wireframe" พร้อมใช้ (T3 เอาไปต่อ pointer เข้า playbook)

> ⚠️ **ขอบเขต T1 = DESIGN เท่านั้น** — ไฟล์ source 3 ตัวด้านล่าง **สร้างจริงตอน BUILD** ไม่ใช่ตอนนี้

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: — (ไม่มี — wave 1, ขนานกับ T2)
- ปลดล็อกให้: `tasks/design-stage-integration` (T3) — T3 ต้องเห็นไฟล์จริง `roles/ux.md` + `warnyin-ux.md` เพื่อเขียน pointer/cross-reference ให้ชื่อตรง (ดู design §7)
- ส่ง output อะไรต่อให้ task ถัดไป: ชื่อไฟล์ + ชื่อ role `ux` (registry) ที่ T3 จะ enumerate/ชี้ pointer มาที่ playbook `design.md` step 4.5 + §3 ข้อ 6/§4 step 6

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
> sub-task ต้องเชื่อมต่อกัน — ระบุลำดับ/สิ่งที่ส่งต่อกัน

- [ ] 1. สร้าง `src/.warnyin/workflow/roles/ux.md` — role card 4 section (Mission/Lens/Checklist/Output) + Skill เสริม + 2 guard (prompt-injection + privacy) — _ผลลัพธ์:_ canonical lens ที่ fallback path ใช้ร่วมได้
- [ ] 2. สร้าง `src/.claude/agents/warnyin-ux.md` — agent adapter, frontmatter `tools: Read, Grep, Glob`, body = generator อ่าน role card §1 ก่อน — _ขึ้นกับ 1:_ body ชี้กลับ `roles/ux.md`
- [ ] 3. แก้ `src/.warnyin/workflow/roles/README.md` — เพิ่มแถว UX ในตาราง role ↔ stage (รูปแบบ = `generator` ค่าใหม่) + note อธิบาย generator≠reviewer ใต้ตาราง — _ขึ้นกับ 1:_ ชี้ไฟล์ `ux.md` ที่สร้างแล้ว

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/.warnyin/workflow/roles/ux.md` (สร้างใหม่)
- `src/.claude/agents/warnyin-ux.md` (สร้างใหม่)
- `src/.warnyin/workflow/roles/README.md` (แก้: เพิ่มแถว + note)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] `roles/ux.md` มี 4 section ครบ (Mission/Lens/Checklist/Output) + Skill เสริม section (Figma MCP / HTML mockup = optional reference ไม่ vendor)
- [ ] `roles/ux.md` มี **2 guard** ใน Checklist หรือ Output: prompt-injection guard + privacy guard (wording ตาม design §10F)
- [ ] Lens ของ UX ครอบ: user flow · information hierarchy · screen states (empty/loading/error/success) · accessibility · responsive
- [ ] `warnyin-ux.md` frontmatter `tools: Read, Grep, Glob` — **ไม่มี `Write`/`Edit`/`NotebookEdit`** (grep assert)
- [ ] `warnyin-ux.md` `description` สื่อชัดว่าเป็น **generator วาด wireframe** (ไม่ใช่ "reviewer")
- [ ] `warnyin-ux.md` body = generator (อ่าน `roles/ux.md` ก่อน → คืน ASCII wireframe + user flow + screen states เป็น text ให้ main loop persist) — ต่างจาก `warnyin-sa.md` ที่ body เป็น reviewer (blocker/suggestion)
- [ ] `roles/README.md` ตารางมีแถว UX (รูปแบบ = `generator`) + note ใต้ตารางอธิบาย generator = ผลิต artifact ต่างจาก reviewer
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
