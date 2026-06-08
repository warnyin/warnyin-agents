# Feature — Context working memory

> ความรู้ถาวรระดับ feature · promote จาก topic `context-working-memory` (achieved 2026-06-08)

## คืออะไร
`docs/stages/context.md` = **working-memory ข้าม topic** — ความจำใช้งานสั้น ๆ ที่เก็บ **เฉพาะสิ่งที่ derive จากโครง folder ไม่ได้** เพื่อให้ session/agent ที่กลับมาทำงาน orient ได้เร็วโดยไม่ต้องรื้อ folder เอง

อยู่คนละชั้นกับ memory อื่นในระบบ:
| ชนิด memory | ที่อยู่ | เก็บอะไร |
|---|---|---|
| **working** (สั้น, ข้าม topic) | `docs/stages/context.md` | โฟกัสปัจจุบัน, decision ข้าม topic, parking-lot, ไฮไลต์ที่เพิ่ง ship |
| semantic (ถาวร) | `docs/` | feature, rule, techstack, troubleshooting |
| episodic (ราย topic) | `docs/stages/achieved/` | ทุก topic ที่เคยทำเต็ม ๆ |

โครงคงที่ 4 section: **โฟกัส/ธีมปัจจุบัน · Decision ข้าม topic · Parking lot · เพิ่ง ship (ล่าสุด N รายการ)**

## ทำงานยังไง
- **installer seed skeleton (seed-if-absent):** ตอน scaffold ถ้า `docs/stages/context.md` ยังไม่มี → `ensureScaffold()` เขียนเนื้อหาจาก template `.warnyin/template/stages/context.md`; **มีอยู่แล้ว → skip (ไม่ทับ working-notes ของ user)** ทั้ง install และ `--update`
- **SHIP เป็น producer หลัก:** ตอน archive topic (`ship.md` §4) → append 1 แถวใน "เพิ่ง ship" (`วันที่ | slug | ไฮไลต์`) + prune เหลือ **N=5** ล่าสุด + อัปเดต "โฟกัส/ธีมปัจจุบัน" ถ้าธีมขยับ; section/ไฟล์ไม่มี → สร้างจาก canonical (robust)
- **readers อ่านเป็น working-notes:** `next.md`/`discovery.md`/`explore.md` อ่านเพื่อ orient — เป็น pointer บาง ชี้ canonical เดียว ไม่ duplicate กติกา
- **status board ไม่จดที่นี่ — `next.md` derive เอง** จากการ scan folder (honors `unify-in-place`); `next.md` คง **read-only invariant** ต่อ context.md
- **canonical schema** นิยามที่เดียว = `.warnyin/template/stages/context.md` (+ design ของ topic) — ทุกไฟล์ copy ตาม ห้ามแต่งใหม่

## ขอบเขต / ข้อจำกัด
- **working-notes only** — เก็บเฉพาะส่วนที่ folder derive ไม่ได้; topic-stage status เป็นหน้าที่ `next.md` (ไม่ซ้ำ)
- **seed-if-absent เท่านั้น** — context.md ห้ามอยู่ใน `CORE` ที่ `--update` overwrite (กันทับงาน user)
- **N=5 recently-shipped** — เก่ากว่านั้นตัด (รายละเอียดเต็มอยู่ `achieved/`)
- **producer = SHIP เป็นหลัก** — DESIGN/DISCOVERY อัปเดตโฟกัสเมื่อขยับ; user jot parking-lot ได้ทุกเมื่อ; **`next.md` ไม่เขียน** (read-only)
- **staleness risk** — working-memory ที่ไม่มีวินัย update แย่กว่าไม่มี → จึงผูก producer กับ SHIP (จุดที่แตะ docs/ อยู่แล้ว = natural)

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/template/stages/context.md` — canonical skeleton (seed material)
- `src/bin/cli.mjs` — `ensureScaffold()` seed-from-template + `SCAFFOLD_FILES` object form `{dest, tplRel}`
- `src/.warnyin/workflow/stages/ship.md` — producer (§4 archive step + gate)
- readers: `src/.warnyin/workflow/next.md`, `src/.warnyin/workflow/stages/discovery.md`, `src/.warnyin/workflow/explore.md`
- มาจาก discovery umbrella: `docs/stages/memory-identity-observability/` (Gap A)
