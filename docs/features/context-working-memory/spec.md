# Spec — Context working memory

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior (ทำอะไร เห็นอะไร) — ไม่เก็บ implementation (ชื่อ function/วิธีเขียน)
> **descriptive ไม่ใช่ imperative** — บันทึก "ระบบทำอะไร" เท่านั้น ห้ามเขียน instruction สั่ง agent
> ค่าใน scenario ใช้ **placeholder/ค่าสังเคราะห์เท่านั้น** — ห้ามใส่ secret/PII จริง
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, byte-equal) ไม่ใช่พฤติกรรม AI ที่วัดไม่ได้

## Requirement: context.md scaffolded ด้วย skeleton

installer scaffold `docs/stages/context.md` ด้วยโครง working-notes (4 section) เมื่อไฟล์ยังไม่มี — **ห้ามทับ** ถ้ามีอยู่แล้ว ทั้ง install และ `--update`

### Scenario: target ไม่มี context.md → ได้ skeleton 4 section
- GIVEN temp project ที่ยังไม่มี `docs/stages/context.md`
- WHEN รัน installer (`src/bin/cli.mjs`) จนจบ (exit 0)
- THEN `docs/stages/context.md` มีอยู่ + non-empty + มี heading `## โฟกัส/ธีมปัจจุบัน`, `## Decision ข้าม topic`, `## Parking lot`, `## เพิ่ง ship` ครบทั้งสี่

### Scenario: target มี context.md เดิม → ไม่ถูกทับ (install + --update)
- GIVEN `docs/stages/context.md` มีเนื้อหาของ user อยู่ก่อน
- WHEN รัน installer ทั้งแบบปกติ และแบบ `--update`
- THEN เนื้อหาเดิมคงอยู่ byte-equal ทั้งสองรอบ (นับเป็น skipped ไม่ใช่ overwrite)

### Scenario: seed ไม่ลากงานจริงจาก repo ต้นทาง
- GIVEN installer ติดตั้งลง temp project ว่าง
- WHEN ดู `docs/stages/` ใน target
- THEN มีเพียง `context.md` (skeleton) + `achieved/.gitkeep` — ไม่มีโฟลเดอร์ topic ของ repo ต้นทาง (seed อ่านจาก `.warnyin/template/` ไม่ใช่ `docs/stages/`)

## Requirement: SHIP เป็น producer ของ context.md

ตอน SHIP archive topic → ปรับ "เพิ่ง ship" ใน context.md: append 1 แถว (`วันที่ | slug | ไฮไลต์`) + prune เหลือ N=5 ล่าสุด; อัปเดต "โฟกัส/ธีมปัจจุบัน" ถ้าธีมขยับ

### Scenario: playbook ship.md ระบุขั้น producer + gate
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/ship.md`
- WHEN อ่าน process §4 (ขั้น archive) และ gate §6
- THEN พบข้อความว่า SHIP เป็น producer ของ `docs/stages/context.md` (append "เพิ่ง ship" + prune เหลือ 5 + อัปเดตโฟกัส) และมี gate item ตรวจว่า context.md ถูก maintain

### Scenario: skeleton รองรับการ append แถว ship โดยไม่พังโครง
- GIVEN copy ของ canonical skeleton `.warnyin/template/stages/context.md`
- WHEN append 1 แถวรูปแบบ `| <YYYY-MM-DD> | <slug> | <ไฮไลต์> |` ใต้ section "เพิ่ง ship"
- THEN จำนวน section ระดับ `##` ยังคง 4 (ไม่พัง section อื่น) และแถวใหม่อยู่ใต้ section "เพิ่ง ship"

## Requirement: context.md = working-notes ไม่ใช่ status board

context.md เก็บเฉพาะสิ่งที่ derive จาก folder ไม่ได้; สถานะ topic-stage ยัง derive โดย `next.md`; `next.md` คง read-only ต่อ context.md

### Scenario: readers ระบุว่าเป็น working-notes ไม่ใช่ status board
- GIVEN ไฟล์ `next.md`, `stages/discovery.md`, `explore.md` ใน `src/.warnyin/workflow/`
- WHEN อ่านบรรทัดที่อ้างถึง `context.md`
- THEN แต่ละไฟล์ระบุว่า context.md = working-notes ข้าม topic และ **ไม่ใช่ status board** (status derive จากการ scan folder)

### Scenario: next.md คง read-only invariant
- GIVEN ส่วนหลักการของ `src/.warnyin/workflow/next.md`
- WHEN อ่านข้อ "Read-only เด็ดขาด"
- THEN ระบุว่าห้ามสร้าง/แก้/ลบไฟล์ **รวมถึง context.md** (สถานะล้าสมัย → รายงานเป็นข้อเสนอ ไม่แก้เอง)

### Scenario: ทุกไฟล์ชี้ canonical schema เดียว
- GIVEN ไฟล์ทั้งหมดใน workflow ที่อ้าง context.md
- WHEN ตรวจ schema/กติกาเต็มของ context.md
- THEN กติกาเต็มอยู่ที่ canonical เดียว (`.warnyin/template/stages/context.md` / design ของ topic) — ไฟล์อื่นเป็น pointer บาง ไม่มีนิยามขัดกัน
