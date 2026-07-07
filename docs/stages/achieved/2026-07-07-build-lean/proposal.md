# Proposal — build-lean: ลด ceremony ของ workflow ตาม tier

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `build-lean` |
| **ประเภท** | `refactor` (workflow playbook + tooling) |
| **ขนาด** | `standard` (ประเมินใน DESIGN step 1.5 — หลายไฟล์ + logic ใหม่ใน validator, ไม่โดน hard-floor) |
| **วันที่** | `2026-07-06` |
| **มาจาก Discovery?** | ไม่มี — grounding จากการวิเคราะห์ evidence ใน session (สรุปใน §2) |

## 1. สรุป change (what)

ทำให้ ceremony ของ workflow **สเกลตามขนาดงานจริง** ใน 6 จุด:
1. **fast tier → code-first + receipt เดียว** — pre-flight สร้าง `receipt.md` skeleton **ก่อนแตะโค้ด** (meta + hard-floor + acceptance 1-3 ข้อ) → main loop แก้โค้ดเอง (ไม่เรียก build-wave/worktree) → เติมผล diff/test ลง receipt ตอนจบ (ไฟล์เดียวแทน proposal/design/tasks/build/verify ทั้งชุด)
2. **worktree เฉพาะ wave ที่ขนานจริง** — wave มี ≥2 task → worktree ต่อ task (เดิม); wave เดี่ยว → ทำตรงบน build branch (ตัด fork/merge-dance)
3. **ตัด reading list ใน prompt ของ build agent** — เหลือ role card + ไฟล์ task + อ่านเพิ่มเฉพาะที่ task อ้างถึง (ตัดการอ่าน playbook เต็ม/design/proposal/techstack แบบเหมา)
4. **เพดานความยาวตาม tier** — fast: receipt ≤ 40 บรรทัด · standard: proposal ≤ 60 / design ≤ 120 บรรทัด (canonical ที่ `triage.md §2D` — วัดเป็นบรรทัด deterministic กับภาษาไทย)
5. **แก้ UX detect** — docs-only / config-only / tooling ล้วน → exclusion เช็คก่อน signals ห้าม trigger wireframe เด็ดขาด
6. **ย้าย loop-tuning theory ออกจาก playbook ฝั่ง agent** — ★ block ใน `build.md`/`verify.md` ย้ายไปไฟล์ orchestrator-only `loop-tuning.md` เหลือ pointer + report requirement

## 2. ทำไม (why)

- **ปัญหา:** ceremony คงที่ไม่สเกลตามขนาดงาน — topic `learning-loop-tuning` (ship 2026-07-06) ส่งมอบโค้ดจริง **44 บรรทัด** แต่จ่าย artifact **8,348 คำ** (~19 ไฟล์ ratio ~25:1) รวม wireframe ทั้งที่เป็น docs-only; build agent แต่ละตัวถูกบังคับอ่าน ~7-8k คำก่อนเขียนโค้ด; wave เดี่ยวก็ยังจ่าย worktree fork + merge-dance (ที่มาของ KB#11/KB#14)
- **ผลถ้าไม่ทำ:** ทุก change เล็กจ่ายราคา standard → user เลี่ยง workflow หรือรอนาน; troubleshooting KB โตจากปัญหาที่กลไกสร้างเอง

## 3. ทางเลือกที่พิจารณา

| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. tier-driven lean (6 จุดข้างบน) | แก้ตรง root cause (ceremony ไม่สเกล), โครง 5 stage + 3 tier คงเดิม, blast radius คุมได้ | แตะหลายไฟล์ canonical + validator | ✅ |
| B. รื้อโครง (ลด stage / ยุบ 4→1 ทุก tier) | lean สุด | ทำลาย invariant (5 stage, canonical-copy), กระทบ topic ค้าง + spec เดิมวงกว้าง | |
| C. แก้เฉพาะ prompt build agent | เล็ก ปลอดภัย | ไม่แก้ต้นเหตุ — fast tier ยังจ่าย ceremony เต็ม | |

- เหตุผลที่เลือก A: สอดปรัชญา "กระทัดรัด opinionated" (`docs/rule.md`) — ปรับ ceremony ของ tier ที่มีอยู่ ไม่เพิ่ม tier/knob ใหม่ ไม่รื้อโครง

## 4. Scope

**In scope**
- `src/.warnyin/workflow/triage.md` (skip-list + caps — canonical), `stages/{design,build,verify,ship}.md`, `scripts/{build-wave.mjs,validate-topic.mjs}`, template `receipt.md` ใหม่, ไฟล์ใหม่ `workflow/loop-tuning.md`, command adapter `.claude/commands/warnyin/*`, tests ที่ผูกอยู่, CHANGELOG + version bump

**Out of scope**
- ยุบ task 4 ไฟล์สำหรับ standard/large (คง 4 ไฟล์ — ตามที่ user เลือก)
- รื้อโครง 5 stage / เพิ่ม tier ใหม่ / runtime engine
- แก้ root dogfood ตรง (sync หลัง release ตามกลไกเดิม)

## 5. ผลกระทบ & ความเสี่ยง

- **ระบบเดิมที่กระทบ:** feature `change-sizing` (skip-list/route), `build-orchestration` (worktree/fan-out/prompt), `learning-loop-tuning` (ตำแหน่ง theory + §2C pointer), `topic-validator` (fast mode + mixed-state), `uxui-wireframe` (detect precedence) — เขียน Spec delta ครบใน `design.md §9`
- **ความเสี่ยง + วิธีลด:**
  - spec regression ของ learning-loop-tuning (gate-count / negative-grep) → delta ระบุ MODIFIED ชัด + task มี regression check ใน acceptance
  - validator ต้องรู้จัก fast topic โดยไม่พึ่ง tier detection → ใช้ existence ของ `receipt.md` (structural ล้วน ตามกฎ `docs/rule.md` structural-validator)
  - topic เก่าที่ค้างกลางทาง → โครงเดิม (4 ไฟล์/task) ยัง valid เสมอ — receipt เป็น **ทางเลือกเพิ่ม** ไม่ใช่ breaking
  - "docs ตามหลัง" กลายเป็น "ไม่เขียนเลย" → receipt เป็นเงื่อนไข gate ของ ship-lite (existence check)

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Business: ข้าม — internal tooling, คุณค่าเชิงธุรกิจสรุปใน §2 ครบแล้ว
