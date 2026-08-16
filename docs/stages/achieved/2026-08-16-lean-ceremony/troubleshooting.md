# Troubleshooting — lean-ceremony

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้นไปรวมที่ KB กลาง `docs/troubleshooting.md`
> เจอปัญหาใหม่ → อ่าน `docs/troubleshooting.md` ก่อนเสมอ เผื่อเคยแก้แล้ว

---

## วิธีบันทึก
บันทึกเฉพาะปัญหาที่ **ยากจะแก้** หรือ **เจอซ้ำ** (ไม่ใช่ทุก error เล็กน้อย) — หนึ่งปัญหา = หนึ่ง entry

---

### TS-1: gate เขียวลวงเพราะ parser อ่าน "ค่าตัวอย่างใน template" เป็นค่าจริง
| | |
|---|---|
| **วันที่** | `2026-08-15` |
| **Component / Task** | `installer` / `tasks/validator-cap-gate` |
| **ความถี่** | เจอครั้งเดียว (จับได้ตอน adversarial review — gate ทุกตัวเขียวสนิท) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ / error message:**
  ```
  ไม่มี error — validator รายงาน "✓ โครงครบ (structural)" exit 0
  ทั้งที่ design.md ยาวเกิน cap และ tier ยังไม่ถูกเติมในเอกสาร
  ```
- **บริบทที่ทำให้เกิด (trigger):** เพิ่มเช็ค C7 ที่อ่าน tier จากแถวตาราง `| **ขนาด** | ... |` ใน `proposal.md` ด้วย regex `\b(fast|standard|large)\b` แบบเอา match แรก — แถวของ **template** คือ `` | **ขนาด** | `fast` / `standard` / `large` (…) | `` จึงคืน `fast` เสมอเมื่อผู้ใช้ยังไม่เติม
- **สาเหตุที่แท้จริง (root cause):** `CAPS.fast` มีแต่ `receipt.md` ⇒ topic ที่มี `proposal.md`/`design.md` ไม่มีไฟล์ไหนถูก cap เลย และเพราะ `tier !== null` จึงไม่เข้า branch fail-safe ด้วย ⇒ **ไม่มีทั้ง ✖ และ ⚠** — "default state ของ template" กลายเป็นค่าที่ถูกต้องโดยบังเอิญ
- **วิธีแก้ที่ได้ผล (solution):** parse เฉพาะ **cell ค่า** (หลัง pipe ตัวที่ 2) · ให้ค่าที่อยู่ใน backtick มาก่อน (proposal จริงใส่ backtick ตัวเดียว, template ใส่ครบสามตัว) · เจอ keyword ต่างชนิด >1 ตัว = **ambiguous → คืน `null`** เข้าเส้น fail-safe ⚠ ตามที่เอกสารประกาศไว้
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** เมื่อเขียน parser ที่อ่านค่าจาก artifact ให้ **ทดสอบด้วยไฟล์ template ที่ยังไม่เติมเสมอ** — ถ้า parser คืนค่าที่ "ดูใช้ได้" จากโครงเปล่า แปลว่า gate จะเงียบทั้งโปรเจกต์; และตรวจ regression กับ artifact จริงทุกใบก่อนสรุป (ที่นี่ใช้ proposal จริง 38 ใบ พบว่ากฎ "ambiguous ทั้งบรรทัด" ดิบ ๆ จะพัง proposal ที่เขียนอธิบายก้ำกึ่ง)

---

### TS-2: heuristic ผ่านเทสแต่ไม่บรรลุเจตนา เพราะ fixture เขียนเองไม่ตรง template จริง
| | |
|---|---|
| **วันที่** | `2026-08-15` |
| **Component / Task** | `installer` / `tasks/validator-cap-gate` |
| **ความถี่** | เจอครั้งเดียว (แก้รอบแรกยังไม่หาย จับได้ตอน adversarial review) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ / error message:**
  ```
  validate-topic.mjs รายงาน stage = VERIFY ทั้งที่ยังไม่ได้ verify
  (เทส D6/D7 ที่เขียนคุมเคสนี้ผ่านทั้งคู่)
  ```
- **บริบทที่ทำให้เกิด (trigger):** เปลี่ยน stage inference ของ VERIFY จาก "มีไฟล์ `verify.md`" เป็น "มี section `## 4. ผล verify` ใน `build.md`" — แต่ template ของ `build.md` มี heading §4 ติดมาตั้งแต่ต้น ⇒ ทุก topic กระโดดเป็น VERIFY ทันทีที่เริ่มเขียน `build.md`
- **สาเหตุที่แท้จริง (root cause):** รอบแรกแก้เป็น "ต้องมีบรรทัดที่ไม่ใช่ blockquote" แล้วเขียน fixture เองเป็น §4 ที่มีแต่ blockquote — แต่ §4 ของ template **จริง** มี table meta, `### ผลการเทส`, checkbox, data row placeholder รวม 28 บรรทัดที่ผ่านเงื่อนไขนั้น ⇒ เทสเขียวแต่ของจริงยังหลุด 100%
- **วิธีแก้ที่ได้ผล (solution):** นับ "เนื้อจริง" แบบ **template-aware** (ตัด blockquote · heading ย่อย · HTML comment · เส้นคั่น · table separator/header · row ที่ทุก cell เป็น placeholder · checkbox ที่ยังไม่ติ๊ก · `<...>`) และเพิ่มเคสที่ **อ่านไฟล์ template จริงมาเป็น fixture** ทั้งสองขั้ว (ยังไม่เติม → BUILD, เติมเนื้อ §4 → VERIFY)
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** heuristic ที่ตัดสินว่า "artifact เริ่มเติมหรือยัง" ต้องมีอย่างน้อยหนึ่งเคสที่ fixture = **ไฟล์ template ที่ shipped จริง** ไม่ใช่ string ที่ผู้เขียนเทสแต่งขึ้น — ไม่งั้นเทสจะพิสูจน์แค่ว่า "โค้ดตรงกับจินตนาการของผู้เขียน"

---

### TS-3: assertion ที่นับ exact-set ข้าม slice ไม่มีเจ้าของ → gate แดงถาวร
| | |
|---|---|
| **วันที่** | `2026-08-14` |
| **Component / Task** | `installer` / ข้าม slice (`memory-hook-lean` · `design-stage-lean` · `build-verify-seam` · `release-hygiene`) |
| **ความถี่** | เจอครั้งเดียว (จับได้ตอน coherence review ของ DESIGN ก่อนเข้า BUILD) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ / error message:**
  ```
  M2. write-hook compound needle พบครบเป๊ะ 6 ไฟล์ ... AssertionError
  actual: [build.md, ship.md, fastlane.md]   expected: [6 ไฟล์]
  ```
- **บริบทที่ทำให้เกิด (trigger):** เทส `M2` assert **เซตไฟล์ที่มี hook เป๊ะ ๆ** แต่ทั้ง 4 slice ของ wave 1 ลบ hook คนละไฟล์ ⇒ ไม่มี slice ไหน "เห็น" สถานะสุดท้าย และแต่ละ task file ชี้เจ้าของการอัปเดต expected ไปคนละทาง (3 task ระบุไม่ตรงกัน) ส่วน task ที่ถูกชี้กลับมี rule ห้ามแตะไฟล์เทส
- **สาเหตุที่แท้จริง (root cause):** assertion แบบ exact-set เป็น **สมบัติของทั้ง topic ไม่ใช่ของ slice ใด** — ถ้าไม่มอบ ownership ให้ wave สุดท้ายตั้งแต่ตอนออกแบบ มันจะกลายเป็นงานกำพร้าที่ทุกคนคิดว่าเป็นของคนอื่น
- **วิธีแก้ที่ได้ผล (solution):** มอบ ownership ให้ `release-hygiene` (wave 2) พร้อม **เงื่อนไขบังคับ**: ต้องพิสูจน์ด้วย negative-grep ก่อนว่า hook หายจริงครบตาม contract แล้วจึงแก้ expected — ไม่ใช่แก้เพราะเทสแดง; และประกาศไว้ใน `design.md §7` + task file ของทุก slice ว่าเทสนี้จะแดงตลอด wave 1 เป็นเรื่องปกติ
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** ตอน coherence review หลังแตก task ให้ไล่ **ownership ของเทสที่ assert สถานะข้าม slice** ด้วย ไม่ใช่แค่ contract/dependency — คำถามคัดกรอง: "เทสตัวไหนที่ไม่มี slice เดียวทำให้เขียวได้?"

---

### TS-4: เอกสาร narrative ผิดจากงานจริงโดยที่ gate ทุกตัวเขียว
| | |
|---|---|
| **วันที่** | `2026-08-14` |
| **Component / Task** | `installer` / `tasks/release-hygiene` |
| **ความถี่** | เจอ 2 ครั้งใน topic เดียว (CHANGELOG รอบแรก + runbook/evidence รอบสอง) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ |

- **อาการ / error message:**
  ```
  npm test / lint:md / verify:pack / validate-topic เขียวหมด
  แต่ CHANGELOG บรรยายพฤติกรรมที่ไม่มีอยู่จริง (อ้าง signal `gate=optional` ที่ไม่มีในโค้ด,
  บอกว่า auto-route ไป VERIFY ทั้งที่จริงคือ fastlane) และ runbook ยกตัวอย่าง error string
  ที่ไม่เคยถูกพิมพ์ออกมา + คำสั่ง grep/sed ที่รันแล้วได้ผลผิด
  ```
- **บริบทที่ทำให้เกิด (trigger):** ให้ sub-agent เขียนเอกสารสรุปการเปลี่ยนแปลงของงานที่ตัวเองไม่ได้ลงมือทำทุกส่วน — เอกสารประเภทนี้ไม่มี gate เชิงกลไกคุม (dead-link จับได้แค่ลิงก์เสีย ไม่จับ claim ผิด)
- **สาเหตุที่แท้จริง (root cause):** ทุก gate ของ repo ตรวจ **โครงสร้าง** (ไฟล์/ลิงก์/เทส) ไม่มีตัวไหนตรวจ **ความตรงของเนื้อความเทียบ source** — ตรงกับที่ `docs/rule.md §5` เคยบันทึกไว้แล้วว่าเอกสาร narrative ต้อง verify accuracy แยก
- **วิธีแก้ที่ได้ผล (solution):** main loop เขียน section narrative เองใหม่ทั้งก้อน (single-writer) + ให้ผู้ตรวจอิสระไล่ทุก claim เทียบไฟล์จริง **และรันคำสั่งทุกคำสั่งที่เขียนในเอกสาร** — จับเพิ่มได้อีก 3 จุด (ตัวเลข evidence วัดคนละกติกากับ gate, `awk` คลาด +1, error string ไม่ตรง)
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** ทุกคำสั่งที่เขียนลง runbook/เอกสารต้อง **copy ไปรันจริงก่อน commit** และตัวเลขที่ยกเป็น evidence ต้องวัดด้วย **กติกาเดียวกับ gate ที่ ship จริง** (ที่นี่: นับ narrative ก่อน `## 9. Spec delta` ไม่ใช่ทั้งไฟล์ และไม่นับ topic tier `large` ที่ไม่มี cap)
