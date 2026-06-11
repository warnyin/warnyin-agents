# Proposal — discovery-mode-selector

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `discovery-mode-selector` |
| **ประเภท** | `feature` (capability ใหม่ใน Discovery) |
| **ขนาด** | `กลาง` (tier `standard`) |
| **วันที่** | 2026-06-11 |
| **มาจาก Discovery?** | `./discovery.md` (ผ่าน gate แล้ว) |

## 1. สรุป change (what)
> เพิ่ม **mode 4 ค่า** (`ไว / สมดุล / ละเอียด / โต้วาที`) ให้ `/warnyin:discovery` คุมความเข้มของ Discovery — เป็นแกนใหม่ระดับ Discovery (orthogonal กับ tier `change-sizing` และ context-profile) พร้อม **auto-suggest** (ระบบแนะนำ mode จากบริบท user override ได้) และ **โต้วาที = multi-agent** (fan-out persona มาแย้งกันแล้วสังเคราะห์)

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** Discovery มีความเข้มเดียว — งานชัดเสีย overhead, งานเสี่ยงไม่มีกลไก challenge หนักก่อนเข้า DESIGN
- **ผลถ้าไม่ทำ:** ผู้ใช้ทน interview แบบเดียวทุกงาน; งานเสี่ยงสูงผ่าน Discovery ตื้นไป → design ผิดราคาแพง

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A (แนะนำ): mode = แกนใหม่ระดับ Discovery, orthogonal** | clean separation, ไม่แตะ "3 context พอ", reuse loop เดิม | ต้องนิยามจุดแทรกใน playbook | ✅ |
| B: เพิ่มเป็น context-profile ที่ 4 | ใช้ infra เดิม | ขัด philosophy opinionated "3 พอ", profile = session ไม่ใช่ stage | ✗ |
| C: ยุบรวมกับ tier change-sizing | แกนเดียวจำง่าย | coupling ขนาด×ความลึก ผิดความหมาย (decision 3) | ✗ |

- **เหตุผลที่เลือก A:** mode คุม "ความลึกของ Discovery รอบนี้" คนละมิติกับ tier (ขนาด change) และ context-profile (session posture) — ทั้ง 4 mode ยังสวม research profile เดิม (decision 3/4, `discovery.md`)

## 4. Scope
**In scope**
- mode taxonomy 4 ค่า (canonical ที่ playbook `discovery.md` เดียว)
- auto-suggest layer (pattern `establish-tier`) + override
- โต้วาทีเต็ม (fan-out persona → converge → synthesize + fallback)
- grill → alias "ละเอียด"; สะพาน tier:large → แนะ "ละเอียด"
- wire command adapter `/warnyin:discovery`

**Out of scope**
- mode ให้ stage อื่น · แตะ tier/context-profile catalog · auto-execute ข้ามยืนยัน · ผูกชื่อรุ่น model ใน payload

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** `discovery.md` playbook (เพิ่ม section, คงโครงเดิม), command `discovery.md` (adapter), README capability tree, `grill mode` (กลายเป็น alias) — backward-compatible
- **ความเสี่ยง + วิธีลด:**
  - *ความหมายชน 3 แกนเดิม* → orthogonal design + ตารางเทียบแกนชัดใน playbook
  - *catalog creep* → opinionated "4 mode พอ" + ปิดการเพิ่ม mode ใน scope
  - *token โต้วาที แพง* → cap จำนวน persona + รอบ + fallback degrade → "ละเอียด"

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Business: `./business.md`
