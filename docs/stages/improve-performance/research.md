# Research — improve-performance (เร่งความเร็ว BUILD)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> ที่เก็บ "ข้อมูลที่ค้นมา + หลักฐาน" สนับสนุนการตัดสินใจใน `discovery.md`

| | |
|---|---|
| **Slug** | `improve-performance` |
| **วันที่** | `2026-06-10` |

---

## 1. คำถามวิจัย (research questions)
- [x] RQ1: ทำไม BUILD ได้ agent ตัวเดียว/wave (ไม่ขนาน)?
- [x] RQ2: คอขวดเวลาต่อ agent อยู่ตรงไหน?
- [x] RQ3: `build-wave.mjs` รองรับ parallel + model routing แค่ไหน?
- [x] RQ4: ข้อจำกัดของ playbook กลางที่ทำให้แก้ได้/ไม่ได้แบบไหน?

## 2. วิธี & แหล่งข้อมูล
- [x] อ่านโค้ด/เอกสารในโปรเจกต์ (code inspection) — playbook + script + เคสตัวอย่าง
- [ ] ค้นเว็บ / เอกสารภายนอก — ไม่จำเป็น (root cause อยู่ในโค้ดเอง)

## 3. Findings (ผลการค้นต่อคำถาม)

### RQ1: ทำไมได้ agent ตัวเดียว/wave
- **พบว่า:** `example/.../scaffold-foundation/design.md §7` แตก dependency เป็น **chain เส้นตรง**: `monorepo-skeleton → api-scaffold-rls → web-scaffold-refine → ci-pipeline` → topological sort ได้ 4 wave **ละ 1 task**
- **หลักฐาน:** design.md §7 ระบุ wave 1–4 แต่ละ wave มี task เดียว; `web` depend ทั้ง 1+2 (ต้องการ "note endpoint วิ่งจริง 3001 + Note DTO")
- **นัย:** ไม่ใช่ bug ของ script — เป็นผลของ **การแตก task ที่ over-serialized** ที่ DESIGN

### RQ2: คอขวดเวลาต่อ agent
- **พบว่า:** แต่ละ task เป็น slice ก้อนใหญ่ + self-verify เต็ม (`pnpm install` ต่อ worktree → prisma generate → docker postgres → build → test → lint → วนแก้); ↓479.9k tokens/agent
- **หลักฐาน:** `build.md` ข้อ 4 (self-verify เต็มทุก task) + ข้อ 8 (full build+test gate ตอนท้าย) = ทำ build/test ซ้ำ; worktree isolation = node_modules ไม่ share
- **นัย:** ลดได้ด้วย task=scope-ตัวเอง + dependency cache + task เล็กลง + context lean

### RQ3: build-wave.mjs รองรับอะไร
- **พบว่า:** ใช้ `parallel(tasks.map(...))` fan-out ถูกต้องแล้ว; แต่ละ agent รับ `opts.isolation:'worktree'`; **schema ไม่มี field model** แต่ `agent()` รองรับ `opts.model` ได้ (ตาม Workflow API)
- **หลักฐาน:** `scripts/build-wave.mjs` บรรทัด 95–101
- **นัย:** เพิ่ม model routing = แค่ส่ง `model` per task เข้า script (เปลี่ยนเล็ก) — ไม่ต้อง rewrite

### RQ4: ข้อจำกัด playbook กลาง
- **พบว่า:** source จริงอยู่ `src/.warnyin/workflow/` (stages + scripts), root เป็น dogfood (gitignored); playbook ต้อง **zero-dep + cross-stack** (ห้ามผูก pnpm)
- **หลักฐาน:** `docs/project.md` ข้อจำกัด; `ls src/.warnyin/workflow/` มีทั้ง stages + scripts
- **นัย:** เขียนเทคนิคแบบ generic; แก้ที่ `src/` แล้ว sync root; install-cache ต้องเป็นหลักการ ไม่ใช่คำสั่ง pnpm

## 4. Code inspection
| ไฟล์ / ส่วนของโค้ด | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `design.md §7` (example) | dependency chain เส้นตรง 4 wave × 1 task | เป้าแก้หลัก: DAG width toolkit + gate |
| `build-wave.mjs:95-101` | `parallel()` ถูกต้อง; ไม่มี model field | เพิ่ม `opts.model` per task ได้เลย |
| `build.md` ข้อ 4 + 8 | self-verify เต็มทุก task + full-gate ซ้ำ | ลด self-verify → scope ตัวเอง |
| `commands/warnyin/build.md` | orchestrator อ่าน dependency → จัด wave | จุดใส่ critical-path gate + model routing |
| `src/` vs root | 2-layer; scripts อยู่ src ด้วย | แก้ที่ src/ เท่านั้น |

## 5. ทางเลือก & เปรียบเทียบ (วิธีทำ DAG กว้าง)
| ทางเลือก | ข้อดี | ข้อเสีย | เหมาะกับเคสนี้? |
|---|---|---|---|
| Contract-first decouple | ตีตรง root cause (openapi มีแล้ว) | integration risk ↑ | ✅ (เป็น 1 ใน toolkit) |
| Re-slice ต่างแกน | independent แต่แรก | เปลี่ยน mental model เยอะ | ✅ (เป็น 1 ใน toolkit) |
| ยอม serialize + ลด node | ไม่ฝืน dependency | ไม่แก้ root cause | △ (fallback chain แท้) |
| **Toolkit (เลือกได้)** | generalize, ไม่ over-prescribe | ต้องมี gate บังคับวัด | ✅✅ **เลือกแล้ว** |

## 6. ความเสี่ยง / unknown ที่ยังเหลือ
- Contract-first ขัด philosophy "vertical slice end-to-end" — DESIGN playbook ต้อง reconcile ให้ชัด
- empirical run (scaffold-foundation) ใช้เวลานาน — เป็นต้นทุนการพิสูจน์

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำจาก research:** root cause = DESIGN over-serialize (ไม่ใช่ script); แก้ 2 ชั้น — DESIGN (toolkit DAG width + gate + บีบ task) + BUILD (ลด self-verify, model routing, dep cache prime, context lean) ทั้งหมด generic + ลงที่ `src/`
- **ป้อนกลับเข้า discovery.md:** decision #1 (ทั้งสองชั้น), #2 (toolkit), #3 (กลไก 4 ตัว), #4 (structural gate + 1 empirical run)
