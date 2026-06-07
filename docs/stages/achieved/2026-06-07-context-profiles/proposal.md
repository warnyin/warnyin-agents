# Proposal — context-profiles (session-level mode สำหรับ workflow)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `context-profiles` |
| **ประเภท** | `docs` (`.md` ล้วน — แก่นกลาง workflow) |
| **ขนาด** | `เล็ก–กลาง` |
| **วันที่** | 2026-06-07 |
| **มาจาก Discovery?** | `./discovery.md` + `./research.md` |

## 1. สรุป change (what)
เพิ่ม **context profiles** = session-level mode 3 ตัว (`research` / `build` / `review`) เป็น `.md` บางๆ ใน `src/.warnyin/workflow/contexts/` ที่ AI อ่านเพื่อปรับ posture/mindset ของทั้ง session — แล้วให้ playbook แต่ละ stage **ชี้ไปยัง context ที่เข้าคู่** เป็น callout บรรทัดเดียวใต้ title

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** workflow มี role card (task-level lens) แต่ไม่มีกลไกกำหนด "โหมดการทำงานทั้ง session" — session ที่เน้นสำรวจ vs ลงมือ vs ตรวจ ต้องการ posture/default behavior ต่างกัน; ตอนนี้ AI ไม่มีตัวชี้นำระดับ session
- **ผลถ้าไม่ทำ:** roadmap P1 #5 ค้าง — workflow ขาด layer ที่จัด "ท่าทีรวมของ session" (ECC contexts/ pattern); AI สลับ posture เองโดยไม่มี anchor กลาง
- **ทำไมตอนนี้:** P0 ปิดครบ; P1 #5 ระบุ "คุ้มสุด — แทบฟรี" (`.md` ล้วน ตรงปรัชญา tool-agnostic) เป็นก้าว risk ต่ำสุดใน P1

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. context card **บาง** (mindset + do/don't + tool pref + ชี้ stage) — manual activate | ตรงปรัชญา adapter บาง, ไม่ duplicate stage playbook, risk ต่ำ | ต้องชี้ playbook ให้ชัด | ✅ |
| B. context card **ละเอียด** (checklist เฉพาะ mode) | standalone | ซ้ำ stage playbook → เสี่ยง drift | — |
| C. **auto-activation** ตาม stage (hook/adapter) | ไม่ต้อง manual | ต้องคิด adapter/hook หลายเครื่อง — งานบาน | — (รอบหน้า) |

- **เหตุผลที่เลือก A:** ตรง Discovery D2 (โครงบาง) + D1 (3 manual) — posture layer เหนือ stage/role ไม่ทับ logic; auto (C) เก็บเป็น future

## 4. Scope
**In scope**
- สร้าง `src/.warnyin/workflow/contexts/{research,build,review,README}.md` — context card บาง 3 ใบ + README อธิบายภาพรวม (context vs role + วิธี activate)
- ผูกเข้า playbook 5 stage (`stages/{discovery,design,build,verify,ship}.md`) — callout บรรทัดเดียวใต้ title ชี้ context ที่เข้าคู่
- เพิ่มบรรทัด `contexts/` ใน structure tree ของ `src/.warnyin/workflow/README.md` (ข้างๆ `roles/`)

**Out of scope**
- auto-activation ตาม stage (D1 = manual — รอบหน้า)
- context เกิน 3 ตัว (plan/debug/ship ฯลฯ)
- แตะ `cli.mjs` / `package.json` / `verify-pack.mjs` (contexts ใต้ `.warnyin/workflow/` → ship อัตโนมัติผ่าน CORE — ดู `research.md` RQ2)
- แก้ outer-layout staleness ของ workflow README (`warnyin/`→`.warnyin/`, `bin/`→`src/bin/`) — คนละเรื่องกับ topic นี้ (defer, ดูข้อ 5)
- copy contexts ลง root dogfood `.warnyin/` แบบถาวร — root = release เสถียร (`setup:dogfood` ดึง `@latest` จาก npm ไม่ใช่ src); copy ทันทีเป็น manual optional หลัง BUILD (gitignored ไม่ commit)

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบเดิมที่กระทบ:** ไม่มี runtime/installer — `.md` ล้วน; playbook 5 ไฟล์เพิ่ม callout 1 บรรทัด (ไม่แตะ logic เดิม)
- **ความเสี่ยง + วิธีลด:**
  - contexts ซ้ำซ้อน role/stage → *ลด:* โครงบาง + ชี้กลับ playbook (ไม่ copy checklist)
  - context ไม่ถูก ship → *ลด:* `npm test` + `verify:pack` เขียว ยืนยัน contexts ติด payload (ไม่ต้องแก้ installer)
- **Defer (บันทึกไว้):** outer-layout staleness ของ `workflow/README.md` (structure tree ยังเป็น layout เก่าก่อน restructure 0.7.0) — pre-existing ไม่เกี่ยว contexts; เสนอเปิด topic แยก/ลง roadmap

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Discovery: `./discovery.md` · Research: `./research.md`
