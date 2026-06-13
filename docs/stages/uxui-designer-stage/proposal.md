# Proposal — UX/UI designer agent + wireframe ใน DESIGN stage

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `uxui-designer-stage` |
| **ประเภท** | `feature` |
| **ขนาด** | `standard` (capability ใหม่ + หลายไฟล์ playbook/role/template; ไม่โดน hard-floor) |
| **วันที่** | `2026-06-13` |
| **มาจาก Discovery?** | `ไม่มี` |

## 1. สรุป change (what)
เพิ่ม **UX/UI capability** เข้า DESIGN stage: role ใหม่ (UX/UI Designer) + reviewer agent ที่ "วาด wireframe" (read-only generator) + artifact `wireframe.md` (ASCII low-fidelity) — แทรกเป็น **step ก่อนเขียน technical design** เพื่อให้ user **เห็นภาพหน้าจอ + ยืนยันก่อนแตก task** เฉพาะ change ที่มี UI surface

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** DESIGN ปัจจุบันออกแบบ UI เป็น "คำบรรยายเชิงเทคนิค" ใน `design.md §5` เท่านั้น — ไม่มีการวาดให้เห็นภาพ; review panel 5 role ทุกตัวเป็น reviewer read-only ไม่มี role ที่ผลิตภาพหน้าจอ → user ไม่เห็นภาพก่อนแตก task → assume layout/flow กันตอน BUILD → rework
- **ผลถ้าไม่ทำ:** งานที่มี UI ยังเดินต่อแบบ "เขียนโค้ดแล้วค่อยเห็นภาพ" — ค่าผิดพลาดเรื่อง flow/information hierarchy ถูกค้นพบช้า (ตอน VERIFY/หลัง build) ซึ่งแก้แพงกว่าตอน design

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A — ASCII wireframe in-repo + read-only generator agent** (แนะนำ) | tool-agnostic (ทุก harness วาดได้), token-lean, commit ลง repo + เห็นใน terminal/PR, สอด pattern panel เดิม (read-only fan-out) | ความละเอียดต่ำกว่าภาพจริง (low-fidelity by design) | ✅ |
| B — Figma MCP generate design | ภาพสวย/hi-fi | ผูก tool เฉพาะ → เครื่องที่ไม่มี Figma MCP ทำตามไม่ได้ = ขัดหลัก tool-agnostic | |
| C — HTML mockup | เห็นภาพใกล้จริง | หนัก, token เยอะ, ไม่ token-lean ตามปรัชญา workflow | |

- **เหตุผลที่เลือก A:** ตรงหลัก tool-agnostic + token-lean + single source of truth ของ workflow; Figma/HTML วางเป็น **"Skill เสริม optional"** ใน role card (reference ไม่ vendor — เหมือน role อื่น) ให้โปรเจกต์ที่อยากใช้ค่อยติดตั้งเอง

## 4. Scope
**In scope**
- role card `roles/ux.md` (Mission/Lens/Checklist/Output) + Skill เสริม section
- agent adapter `.claude/agents/warnyin-ux.md` (read-only generator: Read/Grep/Glob — คืน wireframe เป็น text ไม่มีสิทธิ์ Write)
- template artifact `template/stages/[topic]/wireframe.md` (user flow → ASCII wireframe ต่อ screen → states → note ให้ design.md honor)
- แทรกใน `design.md` playbook: **step ใหม่ (UX wireframe — optional, ถาม user ก่อน, เฉพาะ UI surface)** + detect/skip section + conditional gate item §8 + role lens §3 + panel list §4.6/§7
- update pointer: `roles/README.md` ตาราง role + `workflow/README.md` (mention capability)

**Out of scope**
- Figma/HTML rendering จริง (เป็น optional skill เสริม — reference ไม่ implement)
- hi-fi design / design system / component library
- packaging/test เปลี่ยน — **ไม่มี** (`package.json files` ครอบ `src/.claude/agents` แล้ว, verify-pack ALLOWED_PREFIX ครอบ, test ไม่ assert รายชื่อ agent)

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** DESIGN playbook (เพิ่ม step + gate item conditional → backward compatible: change ที่ไม่มี UI = N/A ข้าม), review panel (เพิ่ม role ที่ 6 แต่เป็น generator แยกบทบาท), roles registry
- **ความเสี่ยง + วิธีลด:**
  - *capability ยัดเยียด topic ที่ไม่เกี่ยว* → ลดด้วย **detect+skip ชัด** (backend/API/CLI/lib/docs ล้วน → ข้าม) + gate item เป็น conditional/N-A (ตาม stage-invoked capability convention, `docs/rule.md`)
  - *duplicate logic* → ลดด้วย **canonical-copy**: wording ของ step/detect/gate นิยาม canonical ใน `design.md` ของ topic นี้ แล้ว copy ลง playbook; role/template ชี้กลับด้วย pointer
  - *agent ต้องสิทธิ์ write* → เลี่ยงด้วย **read-only generator** (main loop persist artifact ที่ user ต้องยืนยัน — single-writer)

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Business: `./business.md`
