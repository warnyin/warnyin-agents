# Standard — memory-playbook

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **อิงจาก** `docs/techstack/installer/standard.md` — task นี้เป็น payload `.md` (ไม่มีโค้ด) → ยึด pattern ของ playbook กลาง

## 1. Standard กลางที่ยึด (จาก techstack)

- **mirror layout `src/` = target paths** — `src/.warnyin/workflow/memory.md` → install เป็น `.warnyin/workflow/memory.md` (ไม่มี mapping table — วางผิดที่ = ไม่ถูกติดตั้ง)
- **packaging ไม่ต้องแก้** — `src/.warnyin` อยู่ใน `package.json files` + `ALLOWED_PREFIX` แล้ว
- **ภาษา:** เอกสาร/ข้อความผู้ใช้เป็น **ภาษาไทย** ตามสไตล์ payload เดิม
- **zero-dep / ESM** — ไม่แตะโค้ด ไม่เพิ่ม dependency

## 2. Pattern การเขียนของ task นี้

### 2.1 Playbook กลาง (`src/.warnyin/workflow/memory.md`) — **clone โครงของ `src/.warnyin/workflow/backlog.md`**

`backlog.md` เป็น capability playbook พี่น้องที่พิสูจน์แล้ว (per-scope → promote → global) — **ลอกโครง ไม่ประดิษฐ์ใหม่**:

| องค์ประกอบของ `backlog.md` | ทำเหมือนกันใน `memory.md` |
|---|---|
| `# BACKLOG — <นิยามสั้น>` + blockquote 3 บรรทัด (playbook กลาง / เป้าหมาย / **canonical-copy + heading freeze**) | `# MEMORY — ความจำระดับโปรเจกต์ (project memory)` + blockquote แบบเดียวกัน |
| แบ่ง section ด้วย `---` คั่นทุกหัวข้อ | เหมือนกัน |
| §1 semantic + **ตารางเทียบที่เก็บอื่น** + decision rule | §1 (ตาราง **11 แถว** + decision rule **4 ข้อ** + precedence) |
| §2 Governance | §2 Governance (auto-write) + C8 + C12 |
| §3 Schema (ตารางตัวอย่าง + closed set + non-goal + malformed) | §3 (schema 2 ไฟล์ + เกณฑ์ไม่บวม) |
| §4 File layout + lifecycle (ASCII block) | §4 + C13 |
| §5 Capture — **canonical hook wording + anchor table** | §5 Write points (anchor table 5 stage + fastlane) |
| §6 Consume · §7 Promote (SHIP) · §8 archive ≠ current state | §6 · §7 · §8 (+trust boundary) |
| — | §9 ทบทวน/บีบอัด (ของใหม่ของ memory) |

- **★ heading ระดับ `##` ตาม C1 เป๊ะ 9 อัน** — ห้ามเพิ่ม/ลด/เปลี่ยนคำ (T6 assert คำต่อคำ)
- ใช้ `**★ ...**` นำหน้าข้อที่เป็น hard constraint (สไตล์เดิมของ payload)
- **pointer style:** markdown-link relative จาก `.warnyin/workflow/` — dir เดียวกัน → ไม่มี `../` นำหน้า (เช่น `interop.md` ตาม C9); ชี้ stage ด้วย `stages/<name>.md §<n>`
- **ห้าม inline กฎของ playbook อื่น** — `ship.md` gate, `triage.md` rubric, `interop.md` archive-exclude → **ชี้ ไม่ลอก**
- **schema ใน §3 = ข้อความอธิบายโครง** (ตารางตัวอย่าง + legend) — **ไม่ใช่การสร้างไฟล์ template**; ไฟล์ template จริงเป็นของ T3 และต้องตรงกับ §3 นี้
- ความยาวเทียบ `backlog.md` (~115 บรรทัด) — ยาวกว่าได้เพราะมี 9 section แต่ต้องไม่กลายเป็น catalog

### 2.2 `src/.warnyin/workflow/README.md`

- **เติมอย่างเดียว 3 บรรทัด** ในบล็อก ``` โครงสร้าง repo ``` — จัดคอลัมน์คอมเมนต์ให้ตรงแนวเดิมของแต่ละบล็อก (บรรทัดรอบข้างใช้ช่องว่างจัดคอลัมน์ `#`)
- ตำแหน่ง: `memory.md` ต่อกลุ่ม capability (`interop.md`/`backlog.md`/`feedback.md`) · `scripts/memory-status.mjs` ใต้ `build-wave.mjs` · `docs/memory.md` ในบล็อกโครง `docs/` (ใกล้ `troubleshooting.md`)
- **ห้ามแก้บรรทัดอื่น** (diff ต้องเป็น pure addition)
- registry ชี้ถึงของที่ task อื่นเป็นคนสร้าง (`scripts/memory-status.mjs` ของ T5 · `docs/memory.md` ที่ seed จาก template ของ T3) — เป็นข้อความในบล็อกโครงสร้าง **ไม่ใช่ markdown-link** จึงไม่ทำให้ `lint:md` แดงตอน wave 1

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)

- **โครง playbook:** `src/.warnyin/workflow/backlog.md` (แม่แบบ 8 heading → clone เป็น 9)
- **กฎที่ต้อง "ชี้ ไม่ลอก":** `interop.md` (archive ≠ current state · trust boundary) · `stages/ship.md` (gate promote) · `triage.md` (tier) · `minimalism.md`
- **schema ปลายทาง:** ไฟล์ template ของ T3 (`template/docs/memory.md`, `template/docs/stages/context.md`) — task นี้ **นิยาม** โครง ไม่ **สร้าง** ไฟล์
> ทั้งหมดนี้ **ชี้ ไม่ copy** — มีเนื้อซ้ำเมื่อไหร่ = negative-grep ของ T6 แดง

## 4. เพิ่มเติมเฉพาะ task

- **knowledge-store pattern** — playbook ที่นิยาม "ที่เก็บความรู้ชนิดใหม่" ต้องมาพร้อม (1) **ตารางเส้นแบ่งกับที่เก็บเดิมทุกตัว** + decision rule ที่ตัดสินได้จริง, (2) **precedence เมื่อขัดแย้ง**, (3) **ทางออก** (promote) ไม่ใช่แค่ทางเข้า — ไม่งั้นของกองผิดที่/บวมถาวร
  → ถ้าใช้ซ้ำได้ ควรเป็นมาตรฐานกลาง — note ไว้ใน `./rule.md §2` (รอ SHIP)
