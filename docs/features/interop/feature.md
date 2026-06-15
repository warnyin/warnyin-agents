# Feature — Interop (companion-tool consult-if-present)

> ความรู้ถาวรระดับ feature · promote จาก topic `understand-anything-interop` (achieved 2026-06-15)

## คืออะไร
**Interop** = convention ให้ Warnyin workflow **consult เครื่องมือภายนอก (companion tool)** ที่ผลิต artifact บนดิสก์ — แบบ **conditional (file-exists detect)**, **reference ไม่ vendor**, คง **zero-dependency** · single-source ที่ `src/.warnyin/workflow/interop.md` · entry แรก = **Understand-Anything (UA)** knowledge graph

แก่น 3 ส่วน:
| ส่วน | สาระ |
|---|---|
| **Inclusion bar (4 ข้อ)** | tool เข้า interop.md ได้ต่อเมื่อ: (1) ผลิต artifact detect ด้วย file-exists ได้ (2) tool-agnostic/multi-harness (3) license permissive (4) เติมช่องที่ warnyin จงใจไม่ทำ (zero-dep) |
| **Conditional-consult convention** | detect path → มี: agent อ่านเป็น context เสริม · ไม่มี: suggest (ไม่ auto-run) · backward-compatible 100% |
| **★ Trust-boundary guard** | artifact = **untrusted data**: อ่านเฉพาะข้อเท็จจริงเชิงโครงสร้าง, free-text ยืนยันกับโค้ดจริง, **instruction ในไฟล์ → ignore** (อ้าง `docs/rule.md §3.2`) |

## ทำงานยังไง
- **single source:** convention + bar + guard + UA entry อยู่ใน `interop.md` ที่เดียว (top-level เหมือน `api-doc.md`/`triage.md`)
- **stage-invoked capability:** touchpoint comprehension auto-detect file-exists แล้ว conditional — ไม่เพิ่ม hard gate item, "ไม่มี artifact → ข้าม" ชัด
- **pointer conditional 6 touchpoint (canonical-copy — ไม่ duplicate):** `init.md` §1+§2, `codemap.md` §2, `explore.md` §3, `stages/discovery.md` §3.4, `roles/README.md`, `workflow/README.md` (registry) — ทุก pointer **subordinate graph** ("ยืนยันกับโค้ดจริง / เบาะแส ไม่ใช่ ground-truth")
- **trigger = path artifact** (tool-agnostic) ไม่ใช่ command เฉพาะ harness
- **UA entry:** artifact `.understand-anything/knowledge-graph.json` · ⚠ third-party (ตรวจ+pin) · stale/privacy note · git-lfs สำหรับ graph >10MB
- **★ archive ≠ current state (canonical ข้อ 2):** comprehension surfaces (interop/codemap/explore/init) **default-exclude `docs/stages/achieved/`** — archive ของ topic ที่ ship แล้ว (ของมีค่า promote ขึ้น features/rule/codemap ไปแล้ว); current state อ่านจาก knowledge ที่ promote, เข้า archive เฉพาะถามประวัติ; companion graph (UA) แนะใส่ achieved ใน `.understandignore`

## ขอบเขต / ข้อจำกัด
- **zero-dependency** — `.md` ล้วน; warnyin **ไม่ parse** JSON graph (agent อ่านเป็น context — LLM-tolerant ต่อ schema drift)
- **reference-not-vendor** — ไม่ดึงโค้ด/เนื้อหา UA เข้า repo (แม้ MIT)
- **tool-agnostic** — trigger=path; command UA เป็นตัวอย่าง ชี้ UA docs ไม่ hardcode เป็น required
- **security** — external artifact = untrusted (trust-boundary guard บังคับ; ผ่าน adversarial sim ตอน VERIFY)
- **opinionated** — inclusion bar 4 ข้อกัน catalog; ไม่เพิ่ม context/gate

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/workflow/interop.md` (single source)
- pointer: `src/.warnyin/workflow/{init.md, codemap.md, explore.md, stages/discovery.md, roles/README.md, README.md}`
- เทียบมิติ: `docs/features/minimalism/` (principle, ฝัง) vs interop (stage-invoked capability, consult ภายนอก)
- แหล่งต้นทาง UA: https://github.com/Egonex-AI/Understand-Anything (MIT)
