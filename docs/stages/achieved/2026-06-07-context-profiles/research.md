# Research — context-profiles

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `context-profiles` |
| **วันที่** | 2026-06-07 |

---

## 1. คำถามวิจัย
- [x] RQ1: context profile ต่างจาก role card อย่างไร (กัน overlap)
- [x] RQ2: `contexts/` ต้องแก้ installer (cli CORE / package.json files / verify-pack) เพื่อ ship ไหม
- [x] RQ3: playbook stages ผูก context เข้าได้ที่จุดไหน

## 2. วิธี & แหล่งข้อมูล
- [x] code/doc inspection — `.warnyin/workflow/roles/README.md`, `.warnyin/workflow/README.md`, `src/bin/cli.mjs` (CORE), `package.json` files, `docs/techstack/installer/structure.md`
- [x] roadmap P1 #5 (ที่มา ECC contexts/)

## 3. Findings

### RQ1: context vs role
- **พบว่า:** role card = **task-level lens** (BA/PO ตอน Discovery, SA/Tech Lead ตอน DESIGN, Developer ตอน BUILD, QA ตอน VERIFY — สวมตอนทำ task เฉพาะ; ดู `roles/README.md` ตาราง role↔stage). context profile = **session-level mode** (โหมดทำงานทั้ง session)
- **หลักฐาน:** `.warnyin/workflow/roles/README.md` L8 "lens = AI หลักใช้มุมมอง/checklist ทำงาน"; roadmap #5 "session-level mode (คนละมิติกับ role card ที่เป็น task-level lens)"
- **นัย:** context = posture layer **เหนือ** role/stage — ต้องบาง ชี้กลับ playbook ไม่ duplicate checklist

### RQ2: installer กระทบไหม (สำคัญ — ลด scope)
- **พบว่า:** `contexts/` วางใต้ `.warnyin/workflow/contexts/` → **ship อัตโนมัติ ไม่ต้องแก้ installer**:
  - `cli.mjs` CORE = `copyTree('.warnyin/workflow')` **ทั้ง dir** → contexts/ ติดไปด้วย
  - `package.json files` มี `src/.warnyin` (ทั้งก้อน) → contexts/ อยู่ใน allowlist
  - `verify-pack.mjs` ALLOWED_PREFIX มี `src/.warnyin/` → ผ่าน gate; denylist ไม่โดน
- **หลักฐาน:** `docs/techstack/installer/structure.md` (CORE = `.warnyin/workflow` + files allowlist `src/.warnyin`); `src/bin/cli.mjs` L65-68 (CORE array)
- **นัย:** feature เป็น `.md` ล้วน — **ไม่แตะ `cli.mjs`/`package.json`/`verify-pack.mjs`**; แค่ `verify:pack` ควรเขียว (ยืนยัน contexts ติด tarball)

### RQ3: จุดผูก context เข้า playbook
- **พบว่า:** playbook stages อยู่ `.warnyin/workflow/stages/*.md` + `discovery.md`; แต่ละไฟล์มี section "Input ที่ต้องอ่าน" / "หลักการ" → เพิ่มบรรทัดอ้าง context ที่เข้าคู่ได้
- **หลักฐาน:** `stages/discovery.md` §2 Input, `stages/build.md` §3 หลักการ (role lens อ้างแบบนี้อยู่แล้ว — context อ้างคู่กันได้)
- **นัย:** mapping (design detail): Discovery→research, DESIGN→research+build, BUILD→build, VERIFY→review, SHIP→review

## 4. Code inspection
| ไฟล์ | พบ | นัย |
|---|---|---|
| `src/bin/cli.mjs` CORE (L65-68) | `copyTree('.warnyin/workflow')` ทั้ง dir | contexts/ ship อัตโนมัติ |
| `package.json` files | `src/.warnyin` ทั้งก้อน | allowlist ครอบ contexts/ |
| `roles/README.md` | role = task-level lens | context = session-level (คนละชั้น) |
| `.warnyin/workflow/README.md` | มีตาราง/โครง workflow | ต้องอัปเดตเพิ่ม contexts/ |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก (โครง context) | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| บาง (mindset + ชี้ stage) | ตรงปรัชญา adapter บาง, ไม่ซ้ำ | ต้องชี้ playbook ชัด | ✅ (D2) |
| ละเอียด (checklist เฉพาะ mode) | standalone | ซ้ำ stage playbook, เสี่ยง drift | — |

## 6. ความเสี่ยง / unknown
- ไม่มี unknown ที่ block — ปิดด้วย code/doc inspection แล้ว

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำ:** สร้าง 3 context card บาง (src + dogfood) + README + ผูกเข้า playbook stages + อัปเดต workflow README; ไม่แตะ installer; verify ด้วย `npm test` + `verify:pack` เขียว
- **ป้อนกลับ discovery.md:** D1 (3 manual), D2 (บาง), D3 (installer ไม่กระทบ) — ยืนยันด้วย evidence
