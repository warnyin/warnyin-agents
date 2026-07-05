# Task — loop-guidance

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `loop-guidance` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | workflow-playbook (`src/.warnyin/workflow/`) |
| **Model tier** | `balanced` _(coherent wording judgment + cross-file pointer web)_ |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
เพิ่ม loop-tuning guidance (credit-horizon + experience-batching) เข้า fix loop ของ BUILD + VERIFY (why C1 + report note C3) และ default-by-tier (C2) เข้า triage — end-to-end: agent ที่เดิน fix loop มี guidance + observable proxy ครบ, default ผูก tier, reference กันไม่ duplicate

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: — (ไม่มี — canonical wording freeze แล้วใน `design.md §2.5`)
- ปลดล็อกให้: — (independent กับ `design-note` — คนละไฟล์)
- ส่ง output อะไรต่อ: — (integration พิสูจน์ที่ full-gate)

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
- [x] 1. **build.md** — copy C1 (★ loop tuning) เข้า §3 item 8 (pointer สั้น) + §4 step 6 (บล็อกเต็ม, จุด delegate-fix); copy C3 report note ท้าย §4 step 6 (**non-blocking, ไม่แตะ §7 gate checklist**) — _ผลลัพธ์:_ build fix loop มี guidance + proxy
- [x] 2. **verify.md** — copy C1 เข้า §3 item 5 + §4 step 5 (บล็อกเต็ม); copy C3 report note ท้าย §4 step 5 (**ไม่แตะ §6 gate checklist**); เติม 1 บรรทัดใน §1 fast-track hook ว่า loop-tuning proxy = non-blocking guidance ใน verify-lite (QA-S4) — _ขึ้นกับ 1 (wording C1 เดียวกัน):_ verify fix loop มี guidance + proxy
- [x] 3. **triage.md** — เพิ่ม sub-section **§2C "Loop-tuning default per tier"** ต่อจาก §2B (C2 table 3 tier) + pointer (markdown link) กลับ build/verify สำหรับ why; อัปเดตบรรทัด "★ canonical ของ rubric" (top) ให้ครอบ loop-tuning default — _ขึ้นกับ 1-2 (pointer ต้อง resolve):_ default canonical เดียว
- [x] 4. **cross-ref check** — ทุก pointer เป็น markdown anchor link จริง + resolve (build/verify ↔ triage); why-block ไม่รั่วเข้า triage, default-table ไม่รั่วเข้า build/verify

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/.warnyin/workflow/stages/build.md` (§3 item 8, §4 step 6)
- `src/.warnyin/workflow/stages/verify.md` (§1 fast-track hook, §3 item 5, §4 step 5)
- `src/.warnyin/workflow/triage.md` (§2C ใหม่ + canonical note)
- **ห้ามแตะ root `.warnyin/`** (dogfood gitignored)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [x] C1 บล็อก "★ loop tuning" ปรากฏใน build.md + verify.md (canonical-copy) พร้อม guard "ไม่ลด correctness/test-floor"
- [x] C3 report note ท้าย fix loop ทั้งสอง (build §4 step6 / verify §4 step5) — **gate checklist build §7 + verify §6 count+เนื้อหาคงเดิม** (ไม่มี `- [ ]` ใหม่)
- [x] C2 default table อยู่ triage §2C เดียว (negative-grep: ไม่โผล่ build/verify); triage ไม่ inline why-block
- [x] pointer ข้าม surface = markdown anchor link จริง resolve ได้ (dead-link gate ผ่าน)
- [x] ผ่าน test ตาม `spec.md` (test-flow §7)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical wording: `../../design.md §2.5` (C1–C3) — **copy ตามนี้ ห้ามแต่งใหม่**
