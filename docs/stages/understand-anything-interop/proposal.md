# Proposal — Understand-Anything Interop (companion-tool interop ใน workflow)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `understand-anything-interop` |
| **ประเภท** | `docs` (playbook/payload — เพิ่ม conditional interop behavior) |
| **ขนาด** | `standard` (cross-cutting หลาย touchpoint + shipped artifact ใหม่; ไม่มี hard-floor) |
| **วันที่** | `2026-06-15` |
| **มาจาก Discovery?** | `./discovery.md` (mode ละเอียด) |

## 1. สรุป change (what)
> เพิ่มไฟล์แกน `src/.warnyin/workflow/interop.md` (single-source) นิยาม **"companion tool ภายนอกที่ consult เมื่อ artifact มี"** + **inclusion bar 4 ข้อ** + **Understand-Anything (UA) เป็น entry แรก**; แล้วให้ touchpoint 5 จุด (`init.md`, `codemap.md`, `explore.md`, `stages/discovery.md §2`, `roles/README.md`) **pointer แบบ conditional บรรทัดสั้น** มาที่ไฟล์แกน — มี graph → agent consult เป็น context; ไม่มี → แนะนำ (suggest ไม่ auto-run); ship + dogfood + gate

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** warnyin ทำงาน "เข้าใจ codebase" หลายจุดด้วย LLM อ่านโค้ดตรงๆ ไม่มี knowledge graph deterministic. UA (Tree-sitter + multi-agent, MIT, 16 harness) ผลิต graph ที่ commit แชร์ได้ → warnyin **consult ได้เมื่อมี** โดยไม่ต้องสร้างเอง (ซึ่งจะขัด zero-dep)
- **ผลถ้าไม่ทำ:** ผู้ใช้ที่มี UA graph อยู่แล้วในโปรเจกต์ ไม่ได้ประโยชน์ — warnyin ไม่รู้จัก/ไม่หยิบมาใช้; พลาดโอกาส interoperate ที่ทำได้สะอาด (reference, zero-cost เมื่อไม่มี)

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A (แนะนำ): interop reference — interop.md + conditional pointer (consult-if-present)** | zero-dep, tool-agnostic, MIT-safe, ได้ของจริงเมื่อมี, cost=0 เมื่อไม่มี | ต้องมี UA จึงได้ค่าเต็ม (conditional) | ✅ |
| B: bundle/vendor UA | ได้ครบทันที | ขัด zero-dep (Tree-sitter dep + frontend), ต้อง maintain, แม้ MIT ก็ผิดปรัชญา | ❌ |
| C: โค้ด parse JSON graph | "ใช้ผล" ตรง | warnyin ไม่มี runtime + พังเมื่อ UA เปลี่ยน schema | ❌ |
| D: auto-run `/understand` ใน playbook | สะดวก | ข้าม harness ไม่ได้ (command ต่างกัน) + ฝืน user | ❌ |
| E: doc เฉพาะ UA (ไม่ใช่ interop กลาง) | ตรงไปตรงมา | เสี่ยง catalog เมื่อมี tool อื่น; ไม่มี inclusion bar | ❌ |

- **เหตุผลที่เลือก A:** สอดกฎ repo — zero-dependency (`.md` ล้วน, ไม่ parse), tool-agnostic (อ้าง path artifact เสถียร ไม่ใช่ command เฉพาะ harness), canonical-copy/single-source (interop.md ที่เดียว, pointer), reference-not-vendor (มี pattern ใน roles/README แล้ว), opinionated (inclusion bar กัน catalog)

## 4. Scope
**In scope**
- `src/.warnyin/workflow/interop.md`: companion-tool convention + inclusion bar 4 ข้อ + conditional-consult mechanism (detect file → consult/suggest) + UA entry (artifact path, install reference, ข้อควรระวัง stale/git-lfs, reference-not-vendor + MIT)
- Pointer conditional บรรทัดสั้น 5 จุด: `init.md` (§3 step 1-2), `codemap.md` (§2 step 1), `explore.md` (§3), `stages/discovery.md` (§2 grounding), `roles/README.md` (Skill เสริม section)
- Register ใน `workflow/README.md` + CHANGELOG + mirror dogfood + gate (lint/pack/test/validate-topic) + tool-agnostic check + reference-not-vendor check (ไม่มีโค้ด/เนื้อหา UA ถูก copy)

**Out of scope**
- ❌ bundle/vendor UA · ❌ parse JSON ในโค้ด · ❌ auto-run UA · ❌ ชั้น A (ใช้คู่เฉยๆ ไม่ต้องแก้ product)
- ❌ catalog external tool (bar 4 ข้อกัน) · ❌ ผูก UA version/schema เฉพาะ
- ❌ dashboard/diff-impact/domain features ของ UA (อยู่ฝั่ง UA — เราแค่ consult graph + ชี้ไปใช้ command ของ UA)

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** `init.md`, `codemap.md`, `explore.md`, `stages/discovery.md`, `roles/README.md`, `workflow/README.md` — ทุกจุด **เพิ่ม pointer conditional บรรทัดสั้น** ไม่แก้ logic เดิม (backward-compatible 100%; ไม่มี graph → ทำงานเดิม)
- **ความเสี่ยง + วิธีลด:**
  - *schema/path drift ของ UA* → consult-if-present (agent อ่าน ไม่ parse) + อ้าง path เท่านั้น + แก้ interop.md ที่เดียว
  - *UA availability (3rd-party)* → conditional + suggest = no hard dep
  - *graph stale* → caution "ยืนยันกับโค้ดจริง" (สอด investigate-before-edit)
  - *catalog creep* → inclusion bar 4 ข้อ
  - *tool-agnostic* → trigger = path artifact; command เป็นตัวอย่าง + ชี้ UA docs (ไม่ hardcode เป็น required)
  - *drift src↔root* → verify-pack/dogfood gate

## 6. ลิงก์
- Design: `./design.md` · Tasks: `./tasks/` · Discovery: `./discovery.md` · Research: `./research.md`
- แหล่งต้นทาง: https://github.com/Egonex-AI/Understand-Anything (MIT)
