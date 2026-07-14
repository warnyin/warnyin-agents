# Feature — Fastlane (`/warnyin:fastlane` executor)

> ความรู้ถาวรระดับ feature · promote จาก topic `fastlane` (achieved 2026-07-14)
> executor ของ fast tier — เดิน skip-list ครบ 4 row จบในคำสั่งเดียว (บังคับ `tier=fast`)

## คืออะไร
command `/warnyin:fastlane [slug] [คำอธิบาย change]` (user-invoked เท่านั้น ไม่ auto-invoke) ที่ **รันงานขนาด fast จบใน 1 คำสั่ง** แทนการพิมพ์ `design → build → verify → ship` ทีละอัน — บังคับ `tier=fast` (ข้าม triage) แล้วเดิน pre-flight → code-first → gate → receipt → ship-lite + archive
fastlane เป็น **"ผู้เดิน" ไม่ใช่ "ผู้ตั้งกฎ"** — กฎทั้งหมด reuse [fast-track skip-list](../change-sizing/feature.md) canonical ของ `triage.md` (executor เป็น orchestration ล้วน + pointer-per-row ไม่ inline เนื้อกฎ — ดู `docs/rule.md` R "executor-playbook convention")

- **ต่างจาก `/warnyin:triage`:** triage = ประเมินขนาดแล้ว **แนะนำ+หยุด** (read-only) · fastlane = **ลงมือเดินจริงจนจบ** (บังคับ fast, stateful)
- **ต่างจากสั่ง 4 command แยก:** ได้ one-shot โดย skip-list ระบุ "ผู้เดิน" ได้ 2 ทาง (user สั่งทีละ stage · หรือ fastlane เดินครบ) — ผลลัพธ์/floor เท่ากัน

## องค์ประกอบ
| # | กลไก | layer | ทำอะไร |
|---|---|---|---|
| 1 | **fastlane playbook (executor)** | `.warnyin/workflow/fastlane.md` | orchestration 5 section: slug/resume · pre-flight hard-floor gate + receipt meta+§1+§2 · code-first loop · gate ปิดงาน · ship-lite — pointer-per-row ไป triage/build เจ้าของกฎ ไม่ลอก |
| 2 | **`/warnyin:fastlane` command** | `.claude/commands/warnyin/fastlane.md` | adapter บาง (user-invoked) frontmatter `description`+`argument-hint` · ใช้ `$ARGUMENTS` · ชี้ playbook ด้วย inline-code (ไม่ใช่ markdown-link — กัน dead link) |
| 3 | **hard-floor override policy** | `triage.md` row SHIP + ใต้ skip-list · `stages/ship.md` · template `receipt.md` | ข้อยกเว้นเดียวของ hard-floor: user สั่ง fastlane + ยืนยันซ้ำ → บันทึก `override โดย user` ลง receipt meta → ship-lite ยอม ship เฉพาะ receipt ที่มี marker นี้ |
| 4 | **stage/router wiring** | `stages/{build,verify,ship,design}.md` · `next.md` | hook ยอมรับ tier fast จาก `/warnyin:triage` **หรือ** `/warnyin:fastlane` · next route resume `/warnyin:fastlane <slug>` |
| 5 | **base SHA (audit)** | template `receipt.md` meta | เก็บ git SHA ตอน pre-flight (อ่านอย่างเดียว) — ใช้เทียบ `git diff <base>` ตอนเติม §3 โดยไม่ปน diff ของงานอื่น |

## ทำงานยังไง (flow)
1. **pre-flight (ก่อนแตะโค้ด):** derive slug (มี receipt เดิม → resume ห้ามทับ §1/§2) → สแกน hard-floor 5 หมวด → เจอ → **หยุดถาม user** (upgrade / ยืนยันลุยต่อ); ยืนยัน → บันทึก `override โดย user` + หมวด → เขียน receipt meta + §1 + §2 (acceptance ประกาศ**ก่อน**แก้ กัน goalpost moving)
2. **code-first loop:** main loop แก้เอง (ไม่เรียก build-wave/worktree) → รัน full test → ยังแดง → แก้ → rerun; **cap 3 รอบ** ครบยังแดง → หยุด รายงาน user (ไม่ ship); ไม่มี test suite → ห้ามเคลม "เขียว" ต้องบันทึก `ไม่มี test suite` + เสนอเพิ่ม test
3. **gate ปิดงาน:** full test เขียว **และ** acceptance §2 ผ่านครบ → เติม receipt §3/§4 → เข้า ship-lite
4. **ship-lite:** เติม §5 → hard-floor scan diff เทียบ base → archive ทั้งโฟลเดอร์; correctness floor คงไว้ (receipt ครบ §1-§5 + archive + ไม่แตะ rule กลางมั่ว)

## ขอบเขต / ข้อจำกัด (การตัดสินใจเชิงสถาปัตยกรรม)
- **executor บาง ไม่ตั้งกฎใหม่** — เลือกทางเลือก A (command ใหม่ชี้ skip-list เดิม) แทน B (triage auto-execute — ทำลาย read-only contract) และ C (playbook fast แยกกฎเอง — ละเมิด unify-in-place, กฎ drift 2 ที่)
- **command-only ไม่ auto-invoke** — fastlane stateful + irreversible (จบด้วย archive) → user สั่งเองเท่านั้น (`docs/rule.md` command-only convention)
- **ไม่แตะ git** — แก้บน working tree ปัจจุบัน; branch/commit/PR อยู่นอก workflow ตามเดิม (เก็บแค่ base SHA อ่านอย่างเดียว)
- **hard-floor ผ่อน 1 ระดับแบบมี guard** — override เป็น explicit 2 ชั้น + audit trail ใน receipt; `/warnyin:triage` ยังห้ามแนะนำ fast เมื่อแตะ hard-floor (ไม่เปลี่ยน) — override เกิดได้เฉพาะเมื่อ user สั่ง fastlane เอง
- **cap รอบแก้ = 3** — งานที่แก้เกิน 3 รอบ = สัญญาณ mis-size → หยุด escalate ดีกว่าวนเงียบ

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/workflow/fastlane.md` (executor playbook) · `src/.claude/commands/warnyin/fastlane.md` (command adapter)
- `src/.warnyin/workflow/triage.md` (hard-floor override + executor pointer ใต้ skip-list) · `stages/{build,verify,ship,design}.md` + `next.md` (wiring)
- `src/.warnyin/template/stages/receipt.md` (base SHA + hard-floor override row) · `workflow/README.md` (capability tree)
- `src/.warnyin/installer/templates/{CLAUDE.md,codebuddy-rules.md}` (slash-command list)
- **cross-feature:** feature [`change-sizing`](../change-sizing/feature.md) — fastlane = executor ของ fast tier ที่ change-sizing นิยาม (skip-list executor 2 ทาง + hard-floor override เป็น Spec delta ที่ topic นี้ merge เข้า)
- test: `src/tests/fastlane.test.mjs` (B1-F4) + `src/tests/installer.test.mjs` (A1/A2 install-proof)
