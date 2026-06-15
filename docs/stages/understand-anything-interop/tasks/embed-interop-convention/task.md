# Task — embed-interop-convention

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `embed-interop-convention` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (payload `src/.warnyin/workflow/`) |
| **Model tier** | `balanced` |
| **สถานะ** | `build เสร็จ — รอ VERIFY` |

## 1. เป้าหมายของ task (vertical slice)
> ส่งมอบ: interop convention "live" — ไฟล์แกน `interop.md` (companion-tool consult-if-present + inclusion bar + trust-boundary guard + UA entry) + reachable จาก 5 touchpoint (conditional) + registered + shipped + dogfood + gate เขียว จบ end-to-end

## 2. Dependency
- ต้องทำหลัง: — (task เดียวของ topic)
- ปลดล็อกให้: — (single node, depth 1 / width 1)
- เหตุผล single node: เนื้อหาแกน + pointer ต้อง coherent โดย single-writer (pointer อ้าง convention/heading ในไฟล์แกน) — ดู `design.md §7`

## 3. Sub-tasks (ลำดับ — เขียนแกนก่อน แล้ว pointer แล้ว gate)
- [x] 1. เขียน `src/.warnyin/workflow/interop.md` — เจตนา + inclusion bar 4 ข้อ + conditional-consult convention + **★ trust-boundary guard (B1)** + UA entry (artifact path + install ref + ⚠ third-party + stale/privacy + reference-not-vendor/MIT) · token-lean · tool-agnostic
- [x] 2. pointer ฝั่ง comprehension — `init.md` §3 step 1-2 (subordinate ใต้ "ยืนยันกับโค้ดจริง") + `codemap.md` §2 step 1 + `explore.md` §3 → `interop.md`
- [x] 3. pointer Discovery + roles — `stages/discovery.md` **§3 operating-principle ข้อ 4** + `roles/README.md` ท้าย "Skill เสริม" → `../interop.md`
- [x] 4. register ใน `workflow/README.md` (ตารางโครงสร้าง + 1 บรรทัด)
- [x] 5. CHANGELOG entry
- [x] 6. mirror + gate — `setup:dogfood` แล้ว `lint:md` / `verify:pack` / `npm test` / `validate-topic understand-anything-interop` / tool-agnostic grep / reference-not-vendor grep / trust-guard grep → เขียวครบ

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **สร้างใหม่:** `src/.warnyin/workflow/interop.md`
- **แก้ (เติม pointer conditional เท่านั้น):** `src/.warnyin/workflow/{init.md, codemap.md, explore.md, stages/discovery.md, roles/README.md, README.md}`
- **แก้:** `CHANGELOG.md`
- **mirror (auto จาก setup:dogfood):** `.warnyin/workflow/...` ที่ root
- **ห้ามแตะ:** `docs/rule.md`, `docs/features/*` (รอ SHIP), command/skill/script logic, `contexts/`

## 5. Acceptance criteria
- [x] ครบทุกข้อใน `spec.md §7` (ไฟล์แกน incl. trust-guard + pointer 5 จุด + register + gate + edge + security scenario)
- [x] interop.md token-lean + tool-agnostic + reference-not-vendor (grep ผ่าน)
- [x] **trust-boundary guard (B1) มีจริง** ใน interop.md + ครอบ scenario `design.md §9`
- [x] ทุก pointer conditional + relative link resolve → `lint:md` เขียว (120 ไฟล์ 58 ลิงก์)
- [x] `verify:pack` (npm pack --dry-run — interop.md ติด package) + `npm test` (107/109 pass — 2 fail pre-existing isEntrypoint Windows) + `validate-topic` เขียว/ไม่มี ✖
- [x] CHANGELOG มี entry · dogfood sync รัน (root mirror จาก released package — จะ complete หลัง ship)
- [x] ไม่แก้ logic เดิม + ไม่เพิ่ม context/gate item · ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
