# Discovery — Understand-Anything Interop (ชั้น B: ฝัง interoperation เข้า warnyin product)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> **Mode:** `ละเอียด` — เดินครบทุกกิ่ง decision tree + BA/PO lens + grill หลายรอบ + deep research

| | |
|---|---|
| **Slug** | `understand-anything-interop` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | `2026-06-15` |
| **ผู้ร่วมตัดสินใจ** | `rujiroj.ta` |
| **เริ่มจาก** | `docs/project.md` — zero-dependency + tool-agnostic playbook + ways-of-work กลาง |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> ทำให้ Warnyin workflow **ชี้ไปใช้ Understand-Anything (UA)** เป็น **companion tool ภายนอก** ตอนงาน "เข้าใจ codebase / ค้นเอกสาร" — แบบ **reference ไม่ vendor**, **conditional** (มี graph → consult; ไม่มี → แนะนำ), คง **zero-dependency** ของ warnyin; โดยมี `interop.md` เป็น single-source ที่ touchpoint ทุกจุด pointer มา

## 2. Problem & Why now
- **ปัญหา / โอกาส:** warnyin มีงาน "เข้าใจ codebase" หลายจุด (INIT, codemap, explore, Discovery grounding) แต่ทำด้วย LLM อ่านโค้ดตรงๆ — ไม่มีโครงสร้าง knowledge graph แบบ deterministic. UA (Tree-sitter + multi-agent) ผลิต knowledge graph + architecture layers + domain ที่ commit แชร์ได้ → เป็น input ชั้นดีที่ warnyin หยิบมา consult ได้ **เมื่อมี** โดยไม่ต้องสร้างเอง (ซึ่งจะขัด zero-dep)
- **ทำไมตอนนี้:** UA เป็น **MIT** + รองรับ **13+ harness ชุดเดียวกับ warnyin** + เป็น plugin แยก (ไม่ต้อง bundle) → interoperate ได้สะอาดมาก ความเสี่ยงต่ำ
- **ผูกกับเป้าหมายโปรเจกต์:** ยกคุณภาพ "ways of work กลาง" (เข้าใจ codebase แม่นขึ้น) โดยไม่ทำลาย zero-dependency / tool-agnostic — เป็น reference ภายนอก optional

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- ไฟล์แกน `src/.warnyin/workflow/interop.md` (single-source): นิยาม "companion tool ภายนอกที่ consult เมื่อ artifact มี" + **inclusion bar 4 ข้อ** + UA เป็น entry แรก (install reference, artifact path, conditional-consult convention, reference-not-vendor + MIT note)
- **Touchpoint pointer (conditional, บรรทัดสั้น) 5 จุด:** `init.md`, `codemap.md`, `explore.md`, `stages/discovery.md §2`, `roles/README.md`
- กลไก: **file-exists detect** `.understand-anything/knowledge-graph.json` → agent **consult** (อ่านเป็น context); ไม่มี → **แนะนำ** ให้ user รัน UA (suggest ไม่ auto-run)
- ship ใน `src/` (ทุก install ได้) + mirror dogfood + ผ่าน gate (lint/pack/test) + CHANGELOG

**Out of scope (จะไม่ทำในรอบนี้)**
- ❌ bundle/vendor โค้ด UA (ขัด zero-dep; UA เป็น plugin แยก)
- ❌ โค้ด parse JSON graph เจาะ field (warnyin ไม่มี runtime + พังเมื่อ UA เปลี่ยน schema)
- ❌ auto-run `/understand` อัตโนมัติ (ข้าม harness ไม่ได้ + ฝืน user)
- ❌ ชั้น A "ใช้คู่กันเฉยๆ" (ไม่ต้องแก้ product — ทำได้อยู่แล้ว ไม่ใช่ topic นี้)
- ❌ catalog ของ external tool (interop.md มี inclusion bar เข้มกัน)
- ❌ ผูกกับ UA version/schema เฉพาะ (อ้าง path artifact ที่เสถียร tool-agnostic เท่านั้น)

## 4. Decision Log (เดินครบทุกกิ่ง — ละเอียด mode)
| # | คำถาม / ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| D1 | touchpoint ที่เชื่อม | INIT/codemap/explore/Discovery/roles-README | ครอบ comprehension surfaces | **INIT + codemap + explore + Discovery grounding + roles/README** | ทุกจุดที่ "ค้นเอกสาร/เข้าใจ codebase" (user ขอกว้าง); INIT แรงสุด |
| D2 | ความลึกการเชื่อม | consult-if-present / reference-only / hard-parse | consult-if-present | **consult-if-present** (agent อ่าน graph เป็น context) | warnyin ไม่มี runtime parse; LLM อ่านไฟล์ = ไม่ผูก schema ในโค้ด; ได้ "ใช้ผล UA" จริง |
| D3 | detect / trigger | file-exists→consult/แนะ · suggest-only · auto-run | file-exists→consult/แนะ | **file-exists `.understand-anything/knowledge-graph.json`** → consult; ไม่มี → suggest (ไม่ auto-run) | path เสถียร tool-agnostic; backward-compatible (ไม่มี→ทำงานปกติ); auto-run ข้าม harness ไม่ได้ |
| D4 | บ้าน canonical | interop.md กลาง / doc เฉพาะ UA / roles-README | interop.md กลาง | **`interop.md` (UA = entry แรก)** | reference-not-vendor + extensible แบบมี bar; UA เป็น tool ภายนอก ไม่ใช่ capability ที่ warnyin เป็นเจ้าของ |
| D5 | inclusion bar | เข้ม 4 ข้อ / หลวม / ไว้ DESIGN | เข้ม 4 ข้อ | **เข้ม 4 ข้อ** | กัน catalog: (1) artifact บนดิสก์ detect ได้ (2) tool-agnostic/multi-harness (3) license permissive (4) เติมช่องที่ warnyin จงใจไม่ทำ (zero-dep) |
| D6 | เกณฑ์ความสำเร็จ | dogfood+scenario / +ลองจริง UA / structural พอ | dogfood+scenario | **dogfood gate + 1 scenario** (จำลอง INIT consult graph) | repo เป็น playbook; ลองจริง UA หนัก (ต้องพึ่ง UA+git-lfs); scenario จำลอง fake graph พิสูจน์ conditional ได้ |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** artifact path `.understand-anything/knowledge-graph.json` เสถียรข้าม UA version (เป็น contract ที่ UA ประกาศ) — ถ้าเปลี่ยน เราแก้ที่ `interop.md` ที่เดียว
- **ข้อจำกัด:**
  - zero-dependency — interop.md + pointer เป็น `.md` ล้วน; ห้าม parse graph ในโค้ด
  - tool-agnostic — ห้าม hardcode ชื่อ slash command เฉพาะ harness เป็น "สิ่งที่ต้องรัน"; อ้าง UA แบบ generic + path artifact
  - reference-not-vendor — ห้าม copy โค้ด/เนื้อหา UA เข้า repo (แม้ MIT จะอนุญาต — รักษา zero-dep + ไม่ต้อง maintain)
  - conditional/backward-compat — ไม่มี graph → ทุก touchpoint ทำงานเดิม 100%
  - กระทัดรัด opinionated — interop.md token-lean + inclusion bar กัน catalog; pointer บรรทัดเดียว conditional (cost=0 เมื่อไม่มี UA)

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- [ ] `src/.warnyin/workflow/interop.md` เป็น single-source: companion-tool convention + inclusion bar 4 ข้อ + UA entry (path + install ref + conditional-consult + reference-not-vendor/MIT)
- [ ] touchpoint 5 จุด pointer มาที่ interop.md (conditional, บรรทัดสั้น) — resolve ครบ (lint:md เขียว)
- [ ] conditional documented ชัด: มี graph → consult / ไม่มี → suggest (ไม่ auto-run) — backward-compatible
- [ ] tool-agnostic: ไม่ hardcode command เฉพาะ harness เป็น required; reference-not-vendor: ไม่มีโค้ด/เนื้อหา UA ถูก copy
- [ ] gate เขียว: lint:md / verify:pack / npm test / validate-topic / setup:dogfood mirror
- [ ] 1 scenario พิสูจน์ INIT consult graph (จำลอง fake `.understand-anything/knowledge-graph.json` → playbook instruction trigger)

## 7. Feature ideas / ทางเลือกของวิธีแก้ (ส่งต่อ DESIGN)
- `interop.md` โครง: หัว+เจตนา → inclusion bar 4 ข้อ → conditional-consult convention (detect path → consult/suggest) → UA entry (คืออะไร, install ref, artifact path, ข้อควรระวัง stale/git-lfs) → reference-not-vendor + tool-agnostic note
- pointer pattern (conditional บรรทัดสั้น): "ถ้ามี `.understand-anything/knowledge-graph.json` → อ่านเป็น context เสริม; ไม่มี + repo ใหญ่/ไม่คุ้น → แนะนำรัน UA — ดู `interop.md`"
- INIT: เสริม §3 step 1 (สแกนภาพรวม) ให้ consult graph เป็น input ของ structure/codemap
- caution: graph เป็น **snapshot อาจ stale** → ยืนยันกับโค้ดจริงเสมอ (สอด investigate-before-edit); graph >10MB ใช้ git-lfs

## 8. Open questions (ปิดครบ — ละเอียด mode)
- [x] D1 touchpoints · [x] D2 ความลึก · [x] D3 detect · [x] D4 บ้าน · [x] D5 bar · [x] D6 success
- [ ] (ฝาก DESIGN) wording bar/pointer ตรงไหนใน INIT §3 ให้พอดี + ชื่อไฟล์ `interop.md` vs `companion-tools.md` (direction = interop กลาง UA entry แรก)

## 9. ความเสี่ยงหลัก
- **UA schema drift** → บรรเทาด้วย consult-if-present (agent อ่าน ไม่ parse โค้ด) + อ้าง path เท่านั้น
- **UA project availability** (3rd-party) → conditional + suggest = ไม่มี UA ก็ทำงานปกติ (no hard dep)
- **graph stale** → caution "ยืนยันกับโค้ดจริง" (graph เป็น snapshot)
- **catalog creep** → inclusion bar 4 ข้อ + opinionated
- **noise ใน playbook** → pointer conditional บรรทัดเดียว cost=0 เมื่อไม่มี UA
- **drift src↔root** → verify-pack/dogfood gate

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- เอกสารโปรเจกต์: `docs/project.md`, `docs/rule.md`, `docs/features/minimalism/` (pattern reference เทียบ ponytail)
- โค้ด/ไฟล์ที่ตรวจ: `src/.warnyin/workflow/{init.md, explore.md, codemap.md}`, `roles/README.md`
- แหล่งต้นทาง: https://github.com/Egonex-AI/Understand-Anything (MIT)

---

## ✅ Gate → DESIGN
- [x] Problem / why-now ชัด ผูกกับ project.md
- [x] Scope in/out ชัด
- [x] Decision log ปิดทุกประเด็น (ละเอียด: เดินครบ 6 กิ่ง) ไม่มี open question ที่ block
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [ ] user ยืนยัน "เข้าใจตรงกันแล้ว" ← รอยืนยันปิด gate
