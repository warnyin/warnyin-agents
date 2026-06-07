# Verify Report — feature-spec-delta

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> สรุปผลการ verify ตามจุดประสงค์ของ topic + การแก้ไขที่เกิดขึ้น (แผนอยู่ `./test.md`)

| | |
|---|---|
| **Slug** | `feature-spec-delta` |
| **Env** | local — build branch `build/feature-spec-delta` (payload `.md` — zero-service) |
| **วันที่** | `2026-06-07` |
| **จำนวนรอบแก้** | **1** (T4 — แก้ 1 claim แล้วผ่านหมด) |

## ผลต่อเคส

| เคส | ผล | รายละเอียด |
|---|---|---|
| **T1 — Ship integrity** | ✅ | `npm test` 26/26 pass 0 fail · `lint:md` 87 ไฟล์ 44 ลิงก์ 0 dead · `verify:pack` 76 ไฟล์ (template ติด, docs/ ไม่รั่ว) |
| **T2 — Executable install proof** | ✅ | `setup:sandbox` → target มี `.warnyin/template/docs/features/[feature-name]/spec.md` ครบ 3 ไฟล์ (business/feature/spec) · **negative ผ่าน:** `docs/features/` ไม่ถูก seed เลย (seedDocs ข้าม `[...]`) · playbook 3 ไฟล์ใน target มี "Spec delta" + template `[topic]/design.md` มี §9 จริง |
| **T3 — Canonical consistency (semantic)** | ✅ | อ่าน diff ทั้ง 10 ไฟล์เทียบ design §4 คำต่อคำ: template spec.md = §4.1 verbatim · template design §9 = §4.2 verbatim (รวม `[เดิมชื่อ:]`) · กติกา merge 5 องค์ประกอบเต็มอยู่ ship playbook ที่เดียว (step 5.1 ขยายของเดิม — ยัง 6 sub-step) · verify ขยาย principle 1 เดิม (ยัง 11 principle) · command mirror ×3 บาง มี "ไม่ทำซ้ำที่นี่" ชัด · cross-ref เลขข้อหลัง renumber input ถูกต้อง (design command "input ข้อ 6" ชี้ข้อใหม่ตรง) · CHANGELOG entry ครบ + ระบุ backward compatible |
| **T4 — Dogfood spec accuracy** | ✅ (หลังแก้ 1) | ตรวจอิสระ (Explore agent, ไล่ทุก requirement/scenario เทียบ source): utility-skills **ผ่านทุก claim** (11/11) · context-profiles พบ **1 claim ผิด** — บรรทัด 63 เขียน vocab tier `review` แต่ source จริงคือ `balanced+` (`contexts/README.md:47`, `review.md:20`) → **แก้แล้ว** (fix #1) + `lint:md` ยังเขียว · format ทั้ง 2 ไฟล์ตรง template (68/58 บรรทัด ≤100, THEN เป็น observable artifact ทุกข้อ, ไม่มี imperative/secret) |
| **T5 — Merge trace ด้วยมือ** | ✅ 5/5 | sandbox copy ใน temp → เดินกติกา ship §4 step 5.1: (1) ADDED ต่อท้าย ✅ (2) MODIFIED แทนที่ ไม่ duplicate ✅ (3) MODIFIED rename `[เดิมชื่อ:]` — ชื่อเก่าหาย ชื่อใหม่มา ✅ (4) REMOVED หาย ✅ (5) **key ไม่เจอ → STOP** — ไฟล์ไม่ถูกแตะ ไม่กลายเป็น ADDED แฝง ✅ + ยืนยัน playbook/command ระบุ "STOP" จริง (grep เจอ 2+1 จุด) |

## รายการแก้ไข (fix log)
1. **fix #1 (T4):** `docs/features/context-profiles/spec.md:63` — claim vocab model tier `review` → `balanced+` ให้ตรง source (`src/.warnyin/workflow/contexts/README.md:45-47`) — instance ของความเสี่ยง "เอกสาร narrative misrepresent" ตาม `docs/rule.md` §5 ที่ VERIFY อิสระจับได้ (build agent self-check หลุด)

## UX/UI
- n/a — payload `.md` ไม่มี frontend

## ข้อสังเกตส่งต่อ SHIP
- บทเรียน T4: **self-check ของ build agent ไม่พอสำหรับเอกสาร narrative — VERIFY ต้องตรวจอิสระ** (จับ claim ผิดที่ผู้เขียนเองมองข้าม) → candidate learned-rule
- T5 พิสูจน์กติกา merge executable แล้วในรอบนี้ (ปิด QA-B1 ตาม design §8) — end-to-end จริงรอ topic ถัดไปเดินครบ 5 stage

## ✅ Gate → SHIP (ดู `.warnyin/workflow/stages/verify.md` ข้อ 6)
- [x] เทสตามจุดประสงค์ของ topic ครบ (T1-T5 ตาม test-flow ใน spec ทุก task)
- [x] regression: spec ใหม่ 2 ไฟล์ accuracy ตรง source; suite เดิม 26/26 ไม่มี regression
- [x] Frontend UX/UI — n/a
- [x] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่านหมด (1 fix)
- [x] `test.md` (แผน) + `verify.md` (สรุป + จำนวนแก้) เขียนครบ
- [x] ปัญหายาก/ซ้ำ — ไม่มีเพิ่มในรอบ VERIFY (TS-1 จาก BUILD บันทึกแล้ว)
