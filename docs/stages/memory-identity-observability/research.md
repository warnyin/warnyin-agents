# Research — Memory/Identity + Observability (@warnyin/agents)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `memory-identity-observability` |
| **วันที่** | 2026-06-08 |

---

## 1. คำถามวิจัย (research questions)
- [x] RQ1: ตอนนี้ @warnyin/agents มีกลไก "memory" อยู่ระดับไหน?
- [x] RQ2: ตอนนี้มีกลไก "observability" (เห็นว่า agent ทำ/คิดอะไร) อยู่ระดับไหน?
- [ ] RQ3: 2 wedge จาก thesis (agent identity, real-time narrative) แปลงมาเป็น gap จริงของ repo นี้ตรงไหน?

## 2. วิธี & แหล่งข้อมูล
- [x] อ่านโค้ด/เอกสารในโปรเจกต์: project.md, build.md, ship.md, โครง docs/, .reports/

## 3. Findings

### RQ1: memory ปัจจุบัน — @warnyin/agents มี "project-memory" ที่แข็งแรงอยู่แล้ว
- พบว่า มีกลไกความจำหลายชั้น แต่เป็น **memory ระดับโปรเจกต์ ไม่ใช่ระดับ agent**:
  - `docs/` = ความรู้ถาวร (features, rule, techstack, troubleshooting, codemap)
  - **SHIP stage = memory consolidation** — promote ความรู้ระดับ topic ขึ้น docs/ (ship.md §3-5)
  - `docs/stages/achieved/` = **episodic memory** (เก็บทุก topic ที่เคยทำ, 16 topics)
  - `docs/troubleshooting.md` = KB ปัญหา-วิธีแก้ (learned)
  - **learned-rule promotion** (planned + emergent, ต้องมี evidence) = workflow เรียนรู้กฎจากประสบการณ์จริง
- หลักฐาน: `ship.md` §3 ข้อ 7 (learned-rule), §4 ข้อ 5; `build.md` §3 ข้อ 10 (troubleshooting KB)
- นัยต่อการออกแบบ: **ไม่ต้องสร้าง memory ใหม่จากศูนย์** — repo นี้คือ "memory engine" อยู่แล้ว gap อยู่ที่ "ชนิด" ของ memory ที่ยังขาด

### RQ2: observability ปัจจุบัน — เป็น "static artifact" ไม่ใช่ real-time
- พบว่า:
  - stage artifacts (`discovery.md` decision log, `design.md`, `build.md` report, `verify.md`) = **narrative ของการตัดสินใจ** — นี่คือ observability แบบ "อ่านย้อนหลัง" ที่ดีมากอยู่แล้ว
  - แต่ตอน **BUILD fan-out sub-agent แบบ parallel ใน worktree** (build.md §4) → ระหว่างทาง user **มองไม่เห็น real-time** ว่าแต่ละ agent คิด/ติด/ตัดสินใจอะไร เห็นแค่ structured report ตอนจบ wave
  - `.reports/` มีแค่ `codemap-diff.txt` — ยังไม่มี run-log/timeline ของ multi-agent
- หลักฐาน: `build.md` §4 ข้อ 5 (fan-out ผ่าน build-wave.mjs คืนผล structured ตอนจบ), `.reports/` ปัจจุบัน
- นัยต่อการออกแบบ: gap คือ **real-time narrative ตอน multi-agent ทำงาน** (ตรงกับ wedge observability เป๊ะ)

## 4. Code inspection
| ไฟล์ / ส่วน | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `docs/project.md` | product = workflow installer, zero-dep, tool-agnostic markdown | constraint: solution ต้องเป็น playbook/markdown ไม่ใช่ runtime หนัก ๆ |
| `build.md` §4 | fan-out parallel worktree, report ตอนจบ wave | observability gap = ช่วงกลาง wave |
| `ship.md` §3-5 | promote knowledge → docs/ | memory consolidation มีอยู่แล้ว |
| `docs/stages/context.md` | **ว่างเปล่า (0 บรรทัด)** | gap: cross-topic working memory ที่ออกแบบไว้แต่ไม่ถูกใช้ |
| role cards (`roles/*.md`) | มี role (developer/ba/po) ไม่ใช่ identity | "role" ≠ "identity ที่สะสมประสบการณ์" |

## 5. ทางเลือก & เปรียบเทียบ
> (จะเติมหลังเลือก angle ใน discovery.md)

## 6. ความเสี่ยง / unknown ที่ยังเหลือ
- ข้อจำกัด zero-dep + tool-agnostic ทำให้ solution แบบ "real-time dashboard" อาจเกิน scope ของ product (ต้องระวังไม่ทำให้ installer กลายเป็น runtime)

## 7. ข้อสรุป → ส่งต่อ
- คำแนะนำจาก research: repo นี้มี **memory แข็ง + observability แบบ static** อยู่แล้ว → discovery ควรโฟกัสที่ **gap จริง 3 จุด**: (1) real-time observability ตอน BUILD fan-out, (2) context.md working-memory ที่ตายแล้ว, (3) role→identity ที่สะสมได้
