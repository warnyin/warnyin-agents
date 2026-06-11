# Design (How) — design-tier-gate

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md` · lens `sa.md`
> **fast-track** (tier `fast`) — design สั้น, 1 task, ไม่ panel/dry-run; correctness floor (spec/acceptance) ครบ

## 1. ภาพรวม
- **component:** `installer` (playbook + template payload) — แก้ที่ `src/` แล้ว release sync
- **แนวทาง:** เพิ่ม **establish-tier step** เป็น behavior ของ DESIGN (wording ใน playbook) — ไม่ใช่โค้ด/validator (tier = judgment ⚠ ตาม `docs/rule.md §1` change-sizing); reuse ช่อง `ขนาด` ใน proposal ที่มีอยู่แล้ว

## 2. Vertical slice (1 task — fast-track)
| # | Task | ส่งมอบ | ไฟล์ | Model tier |
|---|---|---|---|---|
| 1 | **establish-tier-step** | DESIGN ประเมิน tier ต้นทาง + บันทึก proposal; ก้ำกึ่ง→ถาม options | `src/.warnyin/workflow/stages/design.md`, `src/.warnyin/template/stages/[topic]/proposal.md` | `cheap` (wording-guidance, mechanical) |

## 3. พฤติกรรมที่ออกแบบ (canonical → ใส่ design.md §4)
**Establish-tier step (แทรกใน §4 เป็น step `1.5` ก่อน business.md/proposal):**
1. DESIGN **ประเมิน tier เบื้องต้นเอง** จาก request ตาม rubric (signals + hard-floor) ของ `triage.md` (ชี้ pointer ไม่ลอก rubric)
2. **มั่นใจ** → กำหนด tier เลย + บันทึกใน `proposal.md` ช่อง `ขนาด` (พร้อมเหตุผลสั้น/ที่มา)
3. **ไม่มั่นใจ / ก้ำกึ่ง** → **ถาม user ด้วย AskUserQuestion** เป็น options:
   - (ก) ให้ประเมินด้วย `/warnyin:triage` ก่อน (เป็นทางการ) แล้วกลับมา DESIGN
   - (ข) user **กำหนด tier เอง** (`fast`/`standard`/`large`) ถ้ารู้แล้ว
   - *(ปัดขึ้น standard เมื่อก้ำกึ่ง = ปรัชญา fail-safe ของ triage §2B — เป็น default ที่ตั้งได้ถ้า user ไม่เลือก)*
4. tier ที่ได้ → drive ceremony ตาม **§7** (fast-track skip-list / standard / large)
- **ผูกกับ §7:** §7 เพิ่มประโยคนำ "tier ถูก established ที่ step 1.5 (ดูด้านบน)" — §7 = *what ceremony per tier*, step 1.5 = *how tier established* (ไม่ duplicate)
- **hard-floor ยังบังคับ:** ถ้าประเมินเจอ hard-floor (auth/migration/secret/public-API/security-sensitive) → ≥ standard เสมอ (แม้ user จะกำหนด fast เอง — เตือน + ปัดขึ้น)

## 4. proposal template (ช่อง ขนาด)
- เปลี่ยน `| **ขนาด** | \`เล็ก\` / \`กลาง\` / \`ใหญ่\` |` → `| **ขนาด** | \`fast\` / \`standard\` / \`large\` |` + comment สั้น "(จาก triage หรือ ประเมินใน DESIGN step 1.5)"
- vocab ตรง triage/§7 (เลิก เล็ก/กลาง/ใหญ่ ที่ไม่ map ตรง tier)

## 5. ผลกระทบ
- backward compatible — เพิ่ม step + เปลี่ยน label field; flow เดิมไม่ลบ. topic เก่าที่ใช้ เล็ก/กลาง/ใหญ่ ใน achieved ไม่กระทบ (template เปลี่ยนเฉพาะของใหม่)

## 6. Dependency
- 1 task เดียว — ไม่มี DAG (fast-track DAG width 1; เหตุผล serialize = งานชิ้นเดียว wording 2 ไฟล์ component เดียว ไม่มีอะไรให้ขนาน)

## 7. Test strategy (fast-track — correctness floor)
- **task-scope:** grep design.md §4 มี step establish-tier (ประเมิน/มั่นใจกำหนด/ไม่มั่นใจถาม options/hard-floor) + §7 tie ; proposal template `ขนาด` = `fast/standard/large` ; `lint:md` own-file ผ่าน
- **full-gate:** `node --test` เขียว (ไม่มี regression — payload `.md` ไม่กระทบ test) · `lint:md` 0 · `validate-topic` ไม่มี ✖ · `verify:pack` intent (ไฟล์อยู่ใต้ allowlist เดิม)

## 8. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> change นี้ = **enforcement ของ `change-sizing`** → ADDED 1 requirement เข้า `docs/features/change-sizing/spec.md` (feature เดิม มี spec แล้ว)

### ADDED → feature: `change-sizing`
#### Requirement: DESIGN establish tier ก่อนเดินต่อ (sizing gate)
- **พฤติกรรม:** DESIGN ประเมิน tier เบื้องต้นเอง → มั่นใจ = กำหนด + บันทึก proposal; ไม่มั่นใจ = ถาม user (ประเมินด้วย triage / user กำหนดเอง); hard-floor ยังบังคับ ≥ standard
- **Scenario: design.md มี establish-tier step**
  - GIVEN ไฟล์ `src/.warnyin/workflow/stages/design.md`
  - WHEN อ่าน §4 (process)
  - THEN มี step ประเมิน tier ก่อน business/proposal + ระบุ "มั่นใจ→กำหนด, ไม่มั่นใจ→ถาม user (options: triage / user ระบุเอง)"
- **Scenario: proposal บันทึก tier ด้วย vocab ตรง triage**
  - GIVEN template `src/.warnyin/template/stages/[topic]/proposal.md`
  - WHEN อ่านช่อง `ขนาด`
  - THEN ค่าเป็น `fast`/`standard`/`large` (ไม่ใช่ เล็ก/กลาง/ใหญ่)

> ไม่มี MODIFIED/REMOVED — pure ADDED (ไม่มีเคส key-not-found/STOP ตอน SHIP)
