# Rule — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)
> ดึงจาก `docs/rule.md` และ `docs/techstack/installer/{rule,standard}.md` — เฉพาะข้อที่เกี่ยวกับ task นี้

- [ ] **★ release-hygiene task เป็น wave สุดท้ายเสมอของ topic multi-slice** (`docs/rule.md §1` DAG-width) — gate ที่ต้องเห็นไฟล์/pointer ครบข้าม slice ต้องรันหลัง integrate ครบ; **ห้ามเริ่ม task นี้ก่อน 4 slice ของ wave 1 integrate ครบ** ไม่งั้น dead-link gate จะ false-negative และ CHANGELOG จะเขียนก่อนรู้ผลจริง
- [ ] **★ CHANGELOG header ownership ระหว่าง multi-slice SHIP** (`docs/rule.md §1`) — slice แรกสร้าง `## [version]` header (ยังไม่มีวันที่) + entries ของตัวเอง; **slice สุดท้าย (= task นี้) เติมวันที่ + `### Migration`**; **ห้ามสร้าง/ย้าย/ลบ entries ของ slice อื่น**
- [ ] **★ config-protection** (`docs/rule.md §1`) — ห้ามแก้ config / threshold (MIN_PASS, cap ใน `triage.md §2D`, allowlist ของ `verify-pack`, exclude ของ `lint-md`) **เพื่อให้ gate ผ่าน**; gate แดง = แก้ต้นเหตุหรือรายงาน; config ผิดจริงแก้ได้แต่ต้องมีเหตุผลชัด + note
- [ ] **CHANGELOG ทุก user-facing change** (`docs/rule.md §2`) — เปลี่ยนพฤติกรรมของ payload/installer ต้องมี entry ให้ผู้ใช้ npm migrate เองได้โดยไม่ต้องเดา
- [ ] **★ runbook section ใน infra docs** (`docs/rule.md §1`) — **gate ใหม่ที่ผู้ใช้อาจเจอ fail ต้องมี runbook** ใน `docs/infra.md` (อาการ + สาเหตุ + วิธีแก้) และอ้าง **prefix ของ error** เป็น identifier (`✖ [C7]`) — C7 คือ gate ใหม่ของ topic นี้ → ไม่มี runbook = gate orphan
- [ ] **★ MIN_PASS bump ต้อง evidence-based + comment ระบุที่มา** (`docs/techstack/installer/rule.md`) — bump จาก pass count จริงหลัง integrate เท่านั้น (สูตร `floor((N − 5) / 10) × 10`)
- [ ] **acceptance = pass count ไม่ใช่แค่ exit 0** (`docs/rule.md §5`) — ต้องเช็ค `pass === tests` + `pass ≥ MIN_PASS` ผ่าน `check-test-count.mjs` เสมอ
- [ ] **★ ข้อยกเว้นเดียวของ "ไม่แตะเทส": exact-set assertion ที่ spec เปลี่ยนโดยเจตนา** — `M2_EXPECTED` ใน `src/tests/memory.test.mjs` นับ exact-set 6 ไฟล์ ซึ่ง wave 1 แต่ละ slice ลบ hook คนละไฟล์จึงมองไม่เห็นกัน (`docs/rule.md §2` — assertion ที่นับ exact-set ต้องมี constraint ผูกที่ task เจ้าของ; ที่นี่คือ wave สุดท้าย) → task นี้เป็น **เจ้าของการอัปเดต expected 6→3** แต่ **ต้องพิสูจน์ด้วย negative-grep ก่อนเสมอ**; เคสอื่นในไฟล์ + เทสไฟล์อื่น = ยังห้ามแตะ (พบ suite ไม่ครอบ → รายงาน)
- [ ] **★ structural single-source check = เคส node ใน suite ไม่ใช่ shell `grep -rl`** (`docs/rule.md §5`) — negative-grep ที่จะอยู่ถาวรต้องเป็นเคสใน `npm test` (เจ้าของ = slice ที่ถือไฟล์เทส); grep ใน task นี้เป็น **integration check ครั้งเดียวตอน release** ไม่ใช่ตัวแทน gate ถาวร — ถ้าพบว่า suite ยังไม่ครอบเคสไหน ให้ **รายงาน** ไม่ย้ายเทสเอง
- [ ] **★ assertion ที่นับ exact-set ของไฟล์ด้วย compound-needle** (`docs/rule.md §2`) — negative-grep `อัปเดต project memory` ต้องแยก **ไฟล์ที่มี hook** ออกจาก **ไฟล์ที่นิยาม hook** (`memory.md`) → จำกัด scope ของ grep ที่ `stages/` + `fastlane.md`
- [ ] **contract-as-copy-source** (`docs/rule.md §2`) — wording ที่ถูก assert (C1 ชื่อ 4 section) ยึด `design.md §4` เป็นแหล่งจริง; ไฟล์ปลายทางที่ไม่ตรง = แก้ไฟล์ให้ตรง contract **ห้าม paraphrase ให้เข้า pattern ของไฟล์**
- [ ] **anchor-immutability** (`docs/rule.md §2`) — `lint-md.mjs` ตัด anchor ทิ้งก่อนเช็ค (จับ dead path ไม่จับ dead anchor) → heading ที่ถูกอ้างข้ามไฟล์ (เช่น section ของ `build.md`, `#fast-track-skip-list`) เปลี่ยนไม่ได้ถ้าไม่แก้ inbound ครบ; ตรวจ anchor ด้วยตาเมื่อ slice อื่นเปลี่ยน heading
- [ ] **agent เขียน path เป็น inline-code ห้าม markdown-link ใน `docs/`** (`docs/rule.md §4`) — โดยเฉพาะ path ที่ชี้ `docs/stages/<slug>/` ที่จะถูก archive ตอน SHIP
- [ ] **zero-dependency** (`docs/rule.md §2`) — ห้ามเพิ่ม devDeps เพื่อทำ gate/lint ใด ๆ
- [ ] **verify เอกสาร narrative = accuracy เทียบ source** (`docs/rule.md §5`) — ทุกข้อความใน CHANGELOG/runbook ต้องตรงกับพฤติกรรมจริงของไฟล์หลัง integrate (เปิดไฟล์เช็ค ไม่เขียนจากความจำของ design)
- [ ] **source/dogfood แยกชั้นเด็ดขาด** (`docs/rule.md §6`) — แก้ที่ `src/` เท่านั้น; root `.warnyin/`, `.claude/`, `CLAUDE.md`, `AGENTS.md` เป็น dogfood gitignored ห้าม commit — ยกเว้น `CHANGELOG.md`, `package.json`, `docs/infra.md` ที่อยู่ root และ **ไม่ใช่ dogfood** (แก้ได้ตามขอบเขต task นี้)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` / `docs/techstack/.../rule.md` ตอนนี้ — แค่ note ไว้ก่อน ถึง SHIP ค่อยพิจารณาย้ายขึ้นไป

- [ ] rule ที่เสนอ: **dual-validator check ตอน release ของ topic ที่แก้ validator เอง** — รันทั้ง dogfood (`.warnyin/...`) และ v-next (`src/.warnyin/...`) — เหตุผล: dogfood = รุ่นที่ผู้ใช้ปัจจุบันถืออยู่ (ต้องไม่พังกับ topic ที่กำลังทำ), v-next = รุ่นที่กำลัง ship (ต้องผ่าน gate ของตัวเอง); รันตัวเดียวจะพลาดฝั่งใดฝั่งหนึ่งเสมอ
- [ ] rule ที่เสนอ: **gate ใหม่ต้องผ่านกับเอกสารของ topic ที่คลอด gate นั้นเองเป็นเคสแรก (self-dogfood)** — เหตุผล: กันการ ship gate ที่ผู้ออกกฎเองยังทำไม่ได้ และบังคับให้ cap/threshold เป็นตัวเลขที่ทำได้จริง ไม่ใช่ตัวเลขในอุดมคติ
- [ ] rule ที่เสนอ: **topic ที่ลบ/ยุบไฟล์ใน template ต้องมี orphan-pointer sweep ใน wave สุดท้าย** — `lint:md` **ไม่สแกน** `src/.warnyin/template/` (`EXCLUDE_PREFIX`) → pointer ที่ชี้ไฟล์ template ที่ถูกลบจะรอดทุก gate; ต้องมี grep sweep ครอบ `src/.warnyin/`, `src/.claude/`, `src/AGENTS.md`, `src/.warnyin/installer/templates/` เป็นรายการบังคับของ release-hygiene
- [ ] rule ที่เสนอ: **release-hygiene แก้ได้เฉพาะจุดเชื่อม (pointer / ชื่อไฟล์ / wording ตาม contract) — นโยบายที่ขัดกันให้รายงานขึ้น VERIFY** — เหตุผล: wave สุดท้ายมองเห็นทุก slice ก็จริงแต่ไม่ได้เป็นเจ้าของกฎของใคร; ปล่อยให้แก้นโยบายได้ = single-writer ของกฎแตก + ผู้เขียน slice ไม่ได้รีวิวการเปลี่ยนแปลงนั้น
- [ ] rule ที่เสนอ: **version bump ต้องบันทึกเหตุผล minor/patch ลง build report ไม่ใช่แค่แก้ตัวเลข** — เหตุผล: เกณฑ์ "พฤติกรรมของ payload ที่ผู้ใช้เห็นเปลี่ยน = minor" ถูกใช้ซ้ำทุก release แต่ยังไม่เคยเขียนเป็นกฎ → ตัดสินไม่เหมือนกันข้าม topic
