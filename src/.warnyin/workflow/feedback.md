# FEEDBACK — เปิด GitHub Issue แจ้ง feedback ที่ warnyin/warnyin-agents

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: รับข้อมูลจาก user → สัมภาษณ์สั้น → เรียบเรียง title + body → **preview + confirm** → ยิงด้วย `gh` หรือ fallback URL → คืน link ให้ user

---

## 1. FEEDBACK คืออะไร / ใช้เมื่อไหร่

FEEDBACK ช่วยให้ผู้ใช้ปลายทางของ Warnyin Standard Workflow **เปิด GitHub issue** กลับมาที่ทีมได้โดยไม่ต้องออกจาก flow

- ใช้เมื่อ: อยากแจ้ง **ปัญหา (Bug) / ฟีเจอร์ใหม่ที่อยากได้ (Feature) / จุดที่อยากปรับปรุง (Improvement)**
- ปลายทาง: repo `warnyin/warnyin-agents` เสมอ (hardcode)
- ต่างจากการเขียน issue เอง: AI ช่วยสัมภาษณ์สั้น เรียบเรียงรูปแบบมาตรฐาน และจัดการ title prefix + label ให้อัตโนมัติ

---

## 2. Input ที่รับ

- **seed argument** (`$ARGUMENTS`) — ถ้า user ส่งมา ใช้เป็นจุดเริ่มต้น (อาจเป็นประเภท เช่น "Bug" หรือข้อความ feedback สั้นๆ)
- **คำตอบจาก user** — ข้อมูลที่ถามสัมภาษณ์เท่านั้น (**ห้ามดึง session context อัตโนมัติ** — กัน path/secret leak ขึ้น public issue)
- ถ้า user ไม่ส่ง seed → ถามประเภทก่อน

---

## 3. Flow หลัก (ทำตามลำดับ)

### ขั้นที่ 1 — เลือกประเภท

ถามหรืออ่านจาก seed ว่าเป็น:

| ประเภท | Title prefix | Label (best-effort) |
|---|---|---|
| Bug | `[Bug]` | `bug` |
| Feature | `[Feature]` | `enhancement` |
| Improvement | `[Improvement]` | `enhancement` |

ถ้า seed ชัดเจนพอ (เช่น "Bug" หรือข้อความที่บ่งชี้ประเภท) → ยืนยันกับ user แล้วข้ามไปขั้นที่ 2 ได้เลย

### ขั้นที่ 2 — สัมภาษณ์สั้น (ตามประเภท)

**Bug:**
1. สรุปปัญหา (อะไรผิดปกติ?)
2. ขั้นตอน reproduce (ทำอะไรแล้วเกิดปัญหา?)
3. ผลที่คาด vs ผลที่เกิดจริง
4. เวอร์ชัน/สภาพแวดล้อม (workflow version, OS, node — **ถามเฉพาะถ้า user อยากระบุ** ไม่บังคับ)
5. หมายเหตุเพิ่มเติม (optional)

**Feature:**
1. ปัญหา/ความต้องการ (อยากได้อะไรเพิ่ม?)
2. ข้อเสนอ (อยากได้อะไร ทำงานยังไง?)
3. คุณค่า/ใครได้ประโยชน์
4. ทางเลือกที่เคยลอง (optional)

**Improvement:**
1. จุดที่อยากปรับ (อะไรที่รู้สึกว่าควรดีกว่านี้?)
2. เหตุผล/ปัญหาปัจจุบัน
3. ผลที่คาดหลังปรับ

> **กฎ privacy (D4):** ใช้เฉพาะข้อมูลที่ user ให้ในการสัมภาษณ์ — **ห้ามแปะ error/โค้ด/path จาก session ลง body โดยไม่ได้รับอนุญาต** เว้นแต่ user พิมพ์ให้เองหรือสั่งชัดว่า "ใส่ error นี้ด้วย"

### ขั้นที่ 3 — เรียบเรียง title + body

**Title:** `<prefix> <สรุปสั้นๆ 1 บรรทัด>`
ตัวอย่าง: `[Bug] workflow verify ล้มเหลวเมื่อไม่มี git remote`

**Body:** markdown template ตามประเภท

สำหรับ **Bug:**
```
## สรุปปัญหา
<สรุป>

## ขั้นตอน Reproduce
1. <ขั้นตอน>
2. ...

## ผลที่คาด
<คาดหวัง>

## ผลที่เกิดจริง
<ที่เกิดขึ้นจริง>

## สภาพแวดล้อม
- Workflow version: <ถ้ามี>
- OS: <ถ้ามี>
- Node: <ถ้ามี>

## หมายเหตุ
<เพิ่มเติม ถ้ามี>

---
*สร้างผ่าน `/warnyin:feedback:issue`*
```

สำหรับ **Feature:**
```
## ปัญหา / ความต้องการ
<ปัญหา>

## ข้อเสนอ
<อยากได้อะไร ทำงานยังไง>

## คุณค่า / ใครได้ประโยชน์
<คุณค่า>

## ทางเลือกที่เคยลอง
<ถ้ามี>

---
*สร้างผ่าน `/warnyin:feedback:issue`*
```

สำหรับ **Improvement:**
```
## จุดที่อยากปรับ
<จุดที่อยากปรับ>

## เหตุผล / ปัญหาปัจจุบัน
<ปัญหา>

## ผลที่คาดหลังปรับ
<ผลที่คาด>

---
*สร้างผ่าน `/warnyin:feedback:issue`*
```

---

## 4. Detect Ladder — เลือก path ยิง issue

เดินตามลำดับนี้เสมอ:

```
1. มี gh ใน PATH ไหม?
   └─ ไม่มี → fallback URL (แจ้งเหตุผล: "ไม่พบ gh CLI")

2. gh auth status ผ่านไหม?
   └─ ไม่ผ่าน → fallback URL (แจ้งเหตุผล: "ยังไม่ได้ login gh")

3. พร้อม → ยิง gh issue create (ขั้นที่ 5)
```

**ไม่สอน/ติดตั้ง gh ให้** — แค่ detect แล้ว fallback

---

## 5. Confirm Gate (บังคับ — D5)

**ก่อนยิงทุกกรณี** แสดง preview ให้ user ดูก่อน:

```
📋 Preview issue ที่จะส่ง:

**Title:** [Bug] workflow verify ล้มเหลวเมื่อไม่มี git remote

**Body:**
---
## สรุปปัญหา
...
---

ยืนยันส่ง issue นี้? (ใช่ / แก้ไข / ยกเลิก)
```

- **ใช่ / ยืนยัน** → ยิง
- **แก้ไข** → รับข้อมูลเพิ่ม แล้วแสดง preview ใหม่
- **ยกเลิก** → หยุด ไม่ยิง

**ห้ามยิงก่อน user ยืนยัน** — ไม่มีข้อยกเว้น

---

## 6. ยิง issue

### Path สำเร็จ (มี gh + login แล้ว)

```bash
gh issue create \
  --repo warnyin/warnyin-agents \
  --title "<prefix> <สรุป>" \
  --body "<body>" \
  --label <label>
```

ถ้า `--label` fail เพราะ permission (non-collaborator) → **retry ยิงใหม่โดยไม่มี `--label`** แล้วแจ้ง user ว่า maintainer จะ label ทีหลัง

คืน URL ของ issue ที่สร้าง

### Path Fallback (ไม่มี gh หรือไม่ได้ login)

สร้าง URL พร้อมข้อมูล (urlencode title + body + labels):

```
https://github.com/warnyin/warnyin-agents/issues/new?title=<urlenc>&body=<urlenc>&labels=<urlenc>
```

แจ้ง user ว่า:
- เหตุผลที่ degrade (ไม่มี gh หรือ ยังไม่ได้ login)
- ให้เปิด URL นี้ใน browser เพื่อส่ง issue

---

## 7. กฎที่ต้องเคร่งครัด

1. **ไม่ดึง session context เองโดยไม่ได้รับอนุญาต** — body ประกอบจากข้อมูลที่ user ให้เท่านั้น
2. **Confirm gate บังคับ** — preview ก่อนยิงทุกกรณี ไม่มีข้อยกเว้น
3. **Footer ไม่ใส่ path/secret/ข้อมูลเครื่อง** — มีแค่ `*สร้างผ่าน /warnyin:feedback:issue*`
4. **repo hardcode** `warnyin/warnyin-agents` — ไม่ยิงไป repo อื่น
5. **title prefix บังคับ** — `[Bug]` / `[Feature]` / `[Improvement]` ขึ้นต้น title เสมอ
6. **label best-effort** — fail เงียบได้ retry ไม่มี label แล้วแจ้ง user
