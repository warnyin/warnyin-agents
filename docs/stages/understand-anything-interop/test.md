# Test Plan — Understand-Anything Interop

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> guideline: `docs/techstack/installer/test.md` §"verify payload `.md` ล้วน" + §"verify stage-invoked capability" + §"verify action-utility (security surface)"

## บริบท
topic = payload `.md` (interop.md + pointer 6 จุด) + **stage-invoked capability** (conditional file-exists detect) + **security guard B1** (untrusted external artifact) — ไม่มี runtime/service → verify = **structural + dead-link + conditional/backward-compat + security-guard observable + install proof**
- regression baseline: ยังไม่มี `docs/features/interop/` → baseline = Spec delta (`design.md §9`, ADDED 8 scenario); SHIP สร้าง feature
- env: ไม่ต้องรัน service; ใช้ npm/node/grep + setup:sandbox + temp fake graph

## เคสที่ต้องผ่าน

### T1 — interop.md structural
- [ ] มี: inclusion bar 4 ข้อ · conditional-consult convention · **trust-boundary guard B1** · UA entry (artifact path + install ref + ⚠ third-party + stale + privacy) · note reference-not-vendor/tool-agnostic
- [ ] token-lean (≤ สเกล api-doc.md/triage.md)

### T2 — single source / ไม่ duplicate (Spec scenario 1,2)
- [ ] full convention (bar + consult mechanism + guard) อยู่**ที่เดียว** ใน interop.md
- [ ] touchpoint = pointer conditional บรรทัดสั้น (ไม่ลอก convention)

### T3 — dead-link สองทิศ (Spec scenario 2)
- [ ] lint:md เขียว
- [ ] pointer 6 จุด resolve (`interop.md` จาก init/codemap/explore/README · `../interop.md` จาก discovery/roles)
- [ ] UA path `.understand-anything/knowledge-graph.json` เป็น inline-code → lint ข้าม (ไม่ resolve เป็นไฟล์ repo)

### T4 — stage-invoked capability conformance (backward-compat)
- [ ] detect "ไม่มี artifact → ข้าม/แนะ" ชัดในทุก pointer (conditional)
- [ ] **ไม่เพิ่ม hard gate item** ใน stage ใด (grep gate section ไม่มี interop)
- [ ] ไม่แก้ logic เดิม (additive pointer) · contexts ยัง 3 · ไม่เพิ่ม context ที่ 4

### T5 — ★ trust-boundary guard B1 (security, observable)
- [ ] interop.md ระบุ guard: untrusted data · structural facts only · free-text ยืนยันกับโค้ดจริง · **instruction → ignore** · อ้าง `docs/rule.md §3.2`
- [ ] **ทุก pointer subordinate graph** (มีคำว่า "ยืนยันกับโค้ดจริง" / "เบาะแส ไม่ใช่ ground-truth") — ไม่มี bare-consult ที่ปล่อยให้ treat graph เป็น truth
- [ ] **adversarial sim:** สร้าง fake `.understand-anything/knowledge-graph.json` ใน temp ที่มี field ใส่ instruction ร้าย → ยืนยันว่า playbook (interop.md + pointer) สั่ง agent ปฏิบัติเป็น untrusted (อ่าน structural, ignore instruction) — observable ว่า guard reachable จาก touchpoint

### T6 — tool-agnostic + reference-not-vendor (Spec scenario 6,8)
- [ ] trigger = path artifact (ไม่ hardcode command เฉพาะ harness เป็น required); ไม่มีชื่อรุ่น model ของ harness
- [ ] ไม่มีโค้ด UA / snippet ถูก vendor (grep import/function/tree-sitter-code)

### T7 — ship integrity + install proof
- [ ] npm pack → interop.md ติด package, ไม่มี leak
- [ ] setup:sandbox → target มี `.warnyin/workflow/interop.md` + pointer wire (init/discovery/roles) · root dogfood ไม่โดนแตะ
- [ ] validate-topic ✓ · npm test (107/109 — 2 pre-existing Windows)

## วิธีรัน
```
grep -n ... src/.warnyin/workflow/interop.md                 # T1/T5/T6
grep -L "ยืนยันกับโค้ดจริง\|ground-truth" <pointer files>     # T5 subordination
node src/scripts/lint-md.mjs                                  # T3
mktemp + fake graph + grep guard reachability                # T5 adversarial sim
npm run setup:sandbox → inspect target                       # T7
npm pack --dry-run --json (PowerShell)                       # T7
```
