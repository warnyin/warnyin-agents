# Troubleshooting — roadmap-sync-p0

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`
> เจอปัญหาใหม่ → อ่าน `docs/troubleshooting.md` ก่อนเสมอ เผื่อเคยแก้แล้ว

---

## วิธีบันทึก
บันทึกเฉพาะปัญหาที่ **ยากจะแก้** หรือ **เจอซ้ำ** (ไม่ใช่ทุก error เล็กน้อย) — หนึ่งปัญหา = หนึ่ง entry

---

### TS-1: migration guide command ทำงานจริงซ้อน `docs/stages/stages/` เมื่อ installer สร้าง `docs/stages/` ไปก่อน
| | |
|---|---|
| **วันที่** | 2026-06-07 |
| **Component / Task** | `installer` / `tasks/sync-p0-docs` (พบตอน VERIFY) |
| **ความถี่** | เจอครั้งเดียว (executable migration proof จับได้) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ:** ทำตาม migration guide เป๊ะ (`git mv warnyin/stages docs/stages`) แต่งานจริงไปโผล่ที่ `docs/stages/stages/mywork/note.md` (ซ้อนชั้น) แทน `docs/stages/mywork/note.md`
- **บริบทที่ทำให้เกิด (trigger):** ผู้ใช้รุ่นเก่ารัน `npx @warnyin/agents` รอบแรก → เห็น legacy warning → installer **ไม่ block** แต่ install ต่อ (สร้าง `docs/stages/{context.md,achieved}` เปล่า) → ผู้ใช้ทำตาม warning `git mv warnyin/stages docs/stages` → เพราะ `docs/stages/` มีอยู่แล้ว `git mv <dir> <dir-ที่มีอยู่>` จึงย้าย source **เข้าไปข้างใน** กลายเป็น `docs/stages/stages/`
- **สาเหตุที่แท้จริง (root cause):** legacy warning ใน `src/bin/cli.mjs` (L43–58) แนะนำ `git mv warnyin/stages docs/stages` ซึ่งใช้ได้เฉพาะตอน `docs/stages/` ยังไม่มี — แต่ flow จริงผู้ใช้เห็น warning *หลัง* installer สร้าง `docs/stages/` ไปแล้ว (warn-but-not-block) + คำสั่งไม่ได้ลบ `warnyin/installer` ที่เหลือ → ยัง warn ซ้ำ
- **วิธีแก้ที่ได้ผล (solution):** ปรับ Migration guide ใน `CHANGELOG.md` ให้ย้าย **เนื้อหา** แทนทั้งโฟลเดอร์ + ลบ core เก่าทั้ง tree (ทนทั้งกรณี `docs/stages/` มี/ไม่มี):
  - `≤0.2.x`: `mkdir -p docs/stages && git mv warnyin-stages/* docs/stages/` แล้ว `rm -rf workflow warnyin-stages`
  - `0.3–0.5.x`: `mkdir -p docs/stages && git mv warnyin/stages/* docs/stages/` แล้ว `rm -rf warnyin`
  - verify จริงด้วย git repo จำลอง: ผ่านทั้งกรณี **migrate-ก่อน-install** และ **install-ก่อน-migrate** ทั้ง 2 รุ่น (งานจริงไม่หาย, ไม่ซ้อน, ไม่ warn ซ้ำ)
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:**
  - เอกสาร migration ที่ย้ายของเข้าโฟลเดอร์ที่ installer อาจสร้างไว้ → ใช้ `git mv <src>/* <dest>/` (ย้าย contents) ไม่ใช่ `git mv <src> <dest>` (ย้ายทั้ง dir → ซ้อน)
  - **defer:** ควรแก้ legacy warning ใน `src/bin/cli.mjs` ให้ตรง guide ใหม่ (บันทึกใน `docs/roadmap.md` P0 #3) — ตอนนี้เอกสาร robust กว่า cli
  - บทเรียนวิธีเทส: **executable migration proof** (จำลอง legacy layout → ทำตามคำสั่งในเอกสารจริง → assert) จับ bug ที่อ่านเอกสารเฉยๆ มองไม่เห็น
