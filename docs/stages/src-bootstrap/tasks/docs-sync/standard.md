# Standard — docs-sync

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> task นี้เป็นงานเอกสาร — "pattern" ที่ยึด = วิธีเขียน codemap + โครง techstack docs ของ repo

## 1. Standard กลางที่ยึด
- **codemap method** `.warnyin/workflow/codemap.md` — โครงและกฎการเขียน codemap:
  - token-lean **< 1000 tokens/ไฟล์**; โฟกัสโครงสร้างระดับสูง ไม่ใช่ implementation detail
  - ใช้ file path + function signature + ASCII diagram แทน code block เต็ม
  - **ทุกอย่างมาจากโค้ดจริง ณ วันสแกน — ห้ามเดา/ห้ามเขียนจากความจำ**
  - freshness header บนสุด: `<!-- Generated: YYYY-MM-DD | Files scanned: N | Token estimate: ~X -->`
  - `index.md` ต้องลิงก์ครบทุกไฟล์ codemap ที่มี
  - diff > 30% ต้องขอ user อนุมัติก่อนเขียนทับ; ≤ 30% อัปเดต in place
- **โครง techstack docs** (`docs/techstack/installer/`) — รักษาชุดไฟล์เดิม: `about.md` (คืออะไร/หน้าที่), `structure.md` (โครงไฟล์ + flow + helper + ค่าคงที่), `test.md` (วิธีเทส), `standard.md` (pattern โค้ด/harness), `rule.md` (กฎ component)
- รูปแบบเดิมของแต่ละไฟล์ (ตาราง/code fence/หัวข้อ) — **คงสไตล์เดิม เปลี่ยนแค่เนื้อหาให้ตรงโครงใหม่** ไม่ rewrite โครงเอกสาร

## 2. Pattern การเขียนของ task นี้
- **เขียนจาก ground truth:** อ่าน `src/bin/cli.mjs`, `package.json`, `src/tests/`, `src/scripts/*`, `.github/workflows/ci.yml`, `.gitignore` ที่ build ลงจริง แล้วค่อยเขียน doc — ไม่ลอกจาก design.md ตรงๆ (design = แผน, อาจต่างจาก build จริงเล็กน้อย)
- **2-layer ต้องชัดในทุก doc ที่เกี่ยว:** SOURCE (`src/**`) vs DOGFOOD (root gitignored) — ใช้คำเดียวกันทั้งชุด
- ภาษาไทย กระชับ ตามสไตล์ docs เดิมของ repo
- ลบ path เก่าให้หมด (`bin/cli.mjs`, `tests/`, `scripts/` ที่ไม่มี `src/` นำหน้า) — กัน doc ค้างชี้ที่อยู่เดิม

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- doc ที่มีอยู่แล้ว = **แก้ของเดิม ไม่สร้างใหม่:** structure/test/about/standard ใน `docs/techstack/installer/`, `docs/codemap/{index,architecture}.md`
- `docs/project.md` + `docs/infra.md` สร้างใน T4 แล้ว → **อ้างอิง/เช็คเท่านั้น ไม่เขียนซ้ำ**
- `.reports/codemap-diff.txt` — ถ้าทำ codemap diff ตาม method ให้ออกรายงานที่นี่ (Step 5)

## 4. เพิ่มเติมเฉพาะ task
- rule/standard กลางที่ "ควรเปลี่ยน" จากโครงใหม่ → **ห้ามแก้รอบนี้** ให้ note ใน `./rule.md` §2 รอ SHIP (build playbook: ห้ามแก้ rule/standard กลางใน docs/ ตอน BUILD):
  - `docs/rule.md` §4–5 (path `bin/cli.mjs`/`tests/`)
  - `docs/techstack/installer/rule.md` (path เก่า + guard "ต้อง error" → no-op)
  - `docs/techstack/installer/standard.md` (harness `cliPath` relative `src/tests/`→`src/bin/cli.mjs`, verify-pack pattern ใหม่)
