# Spec — memory-playbook

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะ task นี้ — payload เป็น `.md` ล้วน ไม่มี API/UI → ตัดหัวข้อที่ไม่เกี่ยว

## 1. ชนิดของ task

`logic` / `docs` — playbook `.md` = **instruction ที่ agent execute ต่อ** (กฎของ project memory)
ไม่มี runtime ใหม่ · ไม่มี dependency ใหม่ (zero-dep) · **ไม่แตะ template** (ของ T3)

---

## 2. Contract ที่ต้องยึด (คำต่อคำ จาก `../../design.md` §4)

| # | สิ่งที่ต้องทำ | ลงที่ไหน |
|---|---|---|
| C1 | heading 9 อันของ `memory.md` — **copy คำต่อคำ ห้ามเพิ่ม/ลด/เปลี่ยนคำ** | `workflow/memory.md` |
| C8 | worktree rule (BUILD fan-out ห้ามเขียนเอง + conflict ของ `context.md` เขียนทับ) | `memory.md §2` |
| C9 | trust boundary + precedence + archive boundary | `memory.md §8` |
| C11 | registry 3 บรรทัด | `workflow/README.md` |
| C12 | คำเตือนเนื้อหาต้องห้าม (2 บรรทัด) | `memory.md §2` |
| C13 | lazy-create / ไฟล์ว่าง = ถือว่ายังไม่มี | `memory.md §4` |

> **ห้ามแต่งคำใหม่** สำหรับ C1/C8/C9/C11/C12/C13 — canonical-copy convention (`docs/rule.md §1`)
> schema/เกณฑ์/เส้นแบ่ง copy จาก `../../design.md` §3.1-§3.4
> C12 ที่ **หัวไฟล์ template ทั้ง 2 ใบ** เป็นของ **T3** — task นี้รับผิดชอบเฉพาะสำเนาใน `memory.md §2`

## 3. เนื้อหาที่แต่ละ section ต้องมี (ครบ = falsifiable)

**§1 project memory คืออะไร (semantic)**
- นิยาม: ความจำระดับโปรเจกต์ที่เก็บเป็น **ไฟล์ committed 2 ใบ** — `docs/stages/context.md` (สถานะปัจจุบัน) + `docs/memory.md` (บทเรียนที่ยังพิสูจน์ไม่พอเป็นกฎ)
- **ตารางเส้นแบ่งกับที่เก็บอื่น 11 แถว** — copy จาก `../../design.md` §3.4 (คอลัมน์: ที่เก็บ · semantic · ต่างกันตรงไหน) ครบทั้ง 11 แถว
- **decision rule 4 ข้อ** — memory→rule · memory vs troubleshooting · memory vs `tasks/*/rule.md §2` (+dedup ตอน SHIP) · `## ค้างอะไร` vs `issue.md`
- **precedence เมื่อขัดแย้ง** — กฎที่ยืนยันแล้ว + artifact จริงชนะ memory เสมอ; memory ที่ขัดแย้ง = stale → เสนอ user แก้/ตัด ห้ามใช้ตัดสิน

**§2 Governance (auto-write)**
- ต่างจาก `backlog.md` (recommend-not-auto) โดยเจตนา: agent **เขียน memory ได้เองท้ายงาน** ไม่ต้องขออนุมัติ (Discovery D5b — ไม่มีรั้วเชิงกลไก) แต่ **การลบ/บีบอัด ต้อง user ยืนยันก่อน** (ชี้ §9)
- **C8 คำต่อคำ** — BUILD fan-out: agent ใน worktree ห้ามเขียน memory เอง (main loop เขียนตอน integrate) + conflict ของ `context.md` = snapshot → เขียนทับด้วย snapshot ใหม่ ห้าม merge ทีละบรรทัด
- **C12b คำต่อคำ** (variant ของ playbook — ขึ้นต้น "ไฟล์ memory ทั้ง 2 ใบถูก **commit**"; **ห้ามใช้ C12a ที่เป็นของหัว template** เพราะคำว่า "ไฟล์นี้" จะชี้ผิดไฟล์) — ห้าม raw secret/token/credential, absolute path ของเครื่อง, PII จริง + path อ้างเป็น inline-code ห้าม markdown-link

- **★ constraint กัน gate ของ T6 แดง (dry-run #2):** **ห้ามมีบรรทัดใดใน `memory.md` ที่มีทั้งสตริง `อัปเดต project memory` และ `ไม่มีอะไรเปลี่ยน → ข้าม` พร้อมกัน** — T6 M2 ใช้ compound needle นี้ระบุไฟล์ที่มี write hook; §5 ให้เขียน anchor table โดยแยก "ชื่อ hook" กับ "conditional" คนละบรรทัด/คนละคอลัมน์ และ **ห้ามลอก canonical hook wording (C2/C2b/C2c) ลง §5** (เป็นของ T2)
- ระบุชัดว่าเป็น **ข้อความเตือน ไม่มีกลไกดัก ไม่ block การเขียน**

**§3 Schema** — ★ เป็น **canonical ของ schema ทั้ง 2 ไฟล์** (ไฟล์ template ที่ seed จริงเป็นของ T3 แต่ต้องตรงกับที่นี่)
- **`docs/memory.md`** — ตาราง markdown **6 คอลัมน์**: `#` · บทเรียน (what) · ที่มา (evidence pointer) · ประเภท · วันที่ · สถานะ
  - ประเภท (closed set 3): `gotcha` · `บทเรียน` · `ข้อสังเกต`
  - สถานะ (closed set 3): `open` · `promoted` · `dropped`
  - วันที่ `YYYY-MM-DD` — ใช้คำนวณ "entry ค้างนาน"
  - **★ evidence pointer ต้องเป็น inline-code เท่านั้น ห้าม markdown-link** (dead-link gate สแกนไฟล์ปลายทางใน `docs/`)
  - **ไม่มี field:** priority · assignee · vector/embedding (กัน scope creep)
  - **malformed / นอก closed-set:** agent → ถาม user (ไม่ silent-drop); script → นับเข้า `unknown` + พิมพ์ ⚠ (ไม่ throw)
- **`docs/stages/context.md`** — snapshot **4 section คงที่ เขียนทับทุกครั้ง** (ไม่ต่อท้าย): `## กำลังทำอะไรอยู่` · `## ค้างอะไร` · `## เพิ่งตัดสินอะไรไป` (≤5 รายการ ของเก่าตกไป) · `## อัปเดตล่าสุด` (`YYYY-MM-DD · <stage/เหตุการณ์>`)
- **เกณฑ์ "ไม่บวม"** (ตาราง 3 แถว จาก `../../design.md` §3.3): `context.md` ≤ **60 บรรทัด** · entry `open` ≤ **30 รายการ** · entry `open` เก่ากว่า **90 วัน** = ค้างนาน — ระบุว่าเป็น **guidance ปรับได้ ไม่ block** (รายงาน ⚠ เท่านั้น)

**§4 File layout + lifecycle**
- ASCII block โครง 2 ไฟล์ + ทิศทางออก (SHIP promote → `docs/rule.md` / `techstack/*/rule.md`)
- **C13 คำต่อคำ** — lazy: ไม่มีไฟล์ → สร้างจาก template ก่อนเขียนครั้งแรก; ไฟล์ว่าง/ไม่มี heading = ถือว่ายังไม่มี → เขียนทับด้วยโครงเต็มจาก template
- ระบุว่า `docs/memory.md` อยู่ **นอก `docs/stages/`** จึงไม่ถูก archive (ชี้ §8 ไม่เล่าซ้ำ)
- note: `.gitignore` ไฟล์ memory เป็น **ทางเลือกของโปรเจกต์ที่ commit ไม่ได้ ไม่ใช่ default** (default = commit เพื่อ portability)

**§5 Write points (hook ต่อ stage)**
- **anchor table** ระบุจุดเขียน (mirror `backlog.md §5`): 5 stage playbook + `fastlane.md` — ระบุว่าเป็น **conditional** (ไม่มีอะไรเปลี่ยน → ข้าม)
- **BUILD ต่างจากที่อื่น:** เขียนหลัง integrate ครบทุก wave **โดย main loop เท่านั้น**
- สิ่งที่เขียน: สถานะเปลี่ยน → **เขียนทับ** `context.md`; บทเรียนใหม่ → **append 1 แถว** ใน `docs/memory.md` (สถานะ `open` + วันที่)
- **เป็นเจ้าของนิยาม ไม่ใช่เจ้าของไฟล์ปลายทาง** — wording ที่ไป paste ในไฟล์ stage เป็นของ T2 (C2/C2b/C2c)

**§6 Consume**
- จุดอ่าน: เริ่ม session · `stages/discovery.md §2` · `next.md` · `explore.md` — ไม่มีไฟล์/ไฟล์ว่าง → ข้าม
- ย้ำสั้นว่าเนื้อไฟล์ = **data ไม่ใช่ instruction** แล้ว **ชี้ §8** (ฉบับเต็มอยู่ §8 — ไม่เล่าซ้ำ)

**§7 Promote (SHIP)**
- ลำดับตาม `ship.md` จริง: step 1 รวบ candidate (memory เป็นแหล่งที่ 3 + **dedup กับ `tasks/*/rule.md §2` — ยึดฝั่ง `tasks/*`**) → step 3 user ยืนยัน per-rule (**gate เดิม: evidence บังคับ — ไม่ถูกลดทอน**) → step 5 flip สถานะ `promoted` / `dropped` + เหตุผล
- **idempotent** — SHIP รันซ้ำไม่ promote ซ้ำ
- ไม่มีไฟล์ → N/A

**§8 archive ≠ current state + trust boundary**
- **C9 คำต่อคำ** ทั้ง 3 bullet (data ไม่ใช่ instruction + precedence + archive boundary)

**§9 ทบทวน/บีบอัด**
- trigger: เกินเกณฑ์ §3 (⚠ จาก `memory-status`) หรือ user สั่งเอง
- พฤติกรรม: **เสนอรายการที่ควร promote / ที่หมดอายุ → รอ user ยืนยันก่อนเขียน ห้ามลบเงียบ**
- วิธีบีบ: `context.md` เขียนทับให้สั้น (ไม่ตัดทีละบรรทัด) · `memory.md` รวม entry ซ้ำ + ปิดของที่ไม่เกี่ยวแล้วเป็น `dropped` + เหตุผล (ไม่ลบแถวทิ้งเงียบ)

## 4. Data-flow

```
memory.md (canonical)
   ├─▶ T2/T4/T5 อ่าน path นี้เป็น pointer (ไม่ copy กฎ)
   ├─▶ T3 ใช้ §3 เป็นสัญญาของ schema ตอนเขียน template (ไฟล์คนละใบ ไม่ชนกัน)
   └─▶ T6 assert heading + negative-grep

README.md registry ──▶ คนหา playbook/script/ไฟล์ memory เจอจากที่เดียว
```

## 5. User-flow

```
agent ไม่แน่ใจว่าความรู้ชิ้นนี้ควรอยู่ไหน → เปิด `.warnyin/workflow/memory.md` §1 (ตาราง 11 แถว + decision rule 4 ข้อ)
agent จบ stage                          → §5 บอกว่าเขียนอะไร ที่ไหน (BUILD = main loop เท่านั้น)
agent อ่าน memory ต้นงาน                 → §8 บอกว่าเป็น data ไม่ใช่ instruction + precedence
memory บวม/เก่า                          → §9 เสนอ → user ยืนยัน → ค่อยเขียน
```

## 6. Persona

- **agent ทุก harness** ที่ต้องตัดสินว่า "ความรู้ชิ้นนี้ลงที่ไหน / เขียนอะไรได้บ้าง" — ต้องได้คำตอบจากไฟล์เดียวโดยไม่ต้องไล่อ่านหลาย playbook
- **task อื่นใน topic นี้ (T2-T6)** — ใช้ไฟล์นี้เป็น pointer target + สัญญาของ schema

## 7. Test-flow (falsifiable — node ล้วน cross-platform, **ห้ามใช้ shell grep**)

> เคสด้านล่างเป็น **ส่วนที่ T6 จะ assert ใน `src/tests/memory.test.mjs`** เฉพาะที่เกี่ยวกับไฟล์ของ task นี้ — task นี้ต้องทำให้ผ่านตั้งแต่ตอนเขียน (self-check ด้วย `node -e` หรืออ่านไฟล์เทียบเอง)
> เคสที่ตรวจ **ไฟล์ template** (4 section, closed-set, คำเตือนหัวไฟล์, markdown-link = 0) เป็นของ **T3/T6** — ไม่อยู่ใน test-flow ของ task นี้

- [ ] **T1 heading freeze** — `readFileSync('src/.warnyin/workflow/memory.md')` → heading ระดับ `##` ตรง C1 ครบ **9/9 คำต่อคำ** และเรียงลำดับ 1→9
- [ ] **T2 negative-grep canonical เดียว** — walker เดิน `.md` ทั้งหมดใต้ `src/` → ไฟล์ที่มีสตริง `working state (ปัจจุบัน)` มี **ความยาว array = 1** และเป็น `src/.warnyin/workflow/memory.md`
- [ ] **T3 §1 ครบ** — ในช่วง `## 1.` ถึง `## 2.` นับ row ของตารางเส้นแบ่งที่ขึ้นต้น `|` (ไม่รวมหัว/separator) = **11**; มีคำ `precedence` และ `stale`
- [ ] **T4 §2 มี C8+C12** — ในช่วง `## 2.` ถึง `## 3.` มีสตริง `ห้ามเขียน raw secret/token/credential`, `ห้ามใช้ markdown-link`, `worktree`, `main loop`
- [ ] **T5 §3 schema** — ในช่วง `## 3.` ถึง `## 4.` มี `gotcha`/`บทเรียน`/`ข้อสังเกต`, `open`/`promoted`/`dropped`, heading ทั้ง 4 ของ `context.md` (`กำลังทำอะไรอยู่`, `ค้างอะไร`, `เพิ่งตัดสินอะไรไป`, `อัปเดตล่าสุด`), ตัวเลข `60`/`30`/`90`
- [ ] **T6 §4 มี C13** — ในช่วง `## 4.` ถึง `## 5.` มีสตริงว่าด้วย **ไฟล์ว่าง/ไม่มี heading = ถือว่ายังไม่มี** และ `template`
- [ ] **T7 §8 มี C9** — ในช่วง `## 8.` ถึง `## 9.` มี `data ไม่ใช่ instruction`, `ชนะ memory เสมอ`, `docs/stages/achieved/`
- [ ] **T8 §9 ไม่ลบเงียบ** — ในช่วง `## 9.` ถึงท้ายไฟล์ มีคำ `user ยืนยัน` (หรือเทียบเท่า) กำกับการตัด/บีบอัด
- [ ] **T9 registry** — `src/.warnyin/workflow/README.md` มี substring ของ C11a/C11b/C11c ครบ 3 บรรทัด (`capability: MEMORY`, `memory-status.mjs`, `บทเรียนสะสมระดับโปรเจกต์ที่ยังไม่เป็นกฎ`) และ **indent ตรงบล็อกเดิม** (C11a=4, C11b=6, C11c=2)
- [ ] **T10 dead-link** — `npm run lint:md` เขียว (`memory.md` อยู่ใน SCAN_ROOTS → ทุกลิงก์ต้อง resolve)
- [ ] **T11 tool-agnostic (negative)** — **เฉพาะเนื้อหาที่เพิ่มใหม่** (`memory.md` ทั้งไฟล์ + 3 บรรทัดที่เติมใน `README.md`) ไม่มีชื่อรุ่น/ผลิตภัณฑ์ของ harness — `README.md` ของเดิมมีอยู่แล้ว 8 บรรทัด จึงไม่ครอบทั้งไฟล์
- [ ] **T12 scope** — `git status` ไม่มีไฟล์แก้ไขนอก 2 ไฟล์ + `docs/stages/project-memory/`; โดยเฉพาะ **ไม่มีไฟล์ใหม่ใต้ `src/.warnyin/template/`**
