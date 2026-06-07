# Discovery — repo-lint (zero-dep dead-link gate)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `repo-lint` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-07 |
| **ผู้ร่วมตัดสินใจ** | maintainer |
| **เริ่มจาก** | roadmap P2 #12 + `docs/rule.md` §2 (zero-dependency) |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> ทำ **dead-link gate แบบ zero-dep** (`src/scripts/lint-md.mjs`, node:* ล้วน) เช็ค markdown-link ใน `src/**`+`docs/**` resolve จริง + wire CI — แทน markdownlint/prettier ที่จะทำลาย zero-dep

## 2. Problem & Why now
- **ปัญหา/โอกาส:** dead-link ใน `.md` เป็น need ที่**เกิดซ้ำ** (context-profiles/skill-format/examples/gitignore-dogfood ทำ dead-link check **ด้วยมือทุก VERIFY**) — ยังไม่มี gate อัตโนมัติ; broken link ใน playbook ที่ publish = ผู้ใช้ปลายทางเจอลิงก์เสีย
- **ทำไมตอนนี้:** roadmap P2 #12 (ข้อสุดท้าย); automate need ที่ทำมือซ้ำ ๆ
- **ผูก project.md:** "publish payload ติดครบ" + zero-dep — gate นี้ต้อง**ไม่ทำลาย zero-dep** (ใช้ node script เหมือน verify-pack)

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- `src/scripts/lint-md.mjs` — zero-dep (node:* ล้วน), pure `checkLinks(files)→errors[]` + main-guard (แบบ verify-pack)
- validate **markdown-link `[text](path)` เท่านั้น** ที่เป็น relative → resolve เป็นไฟล์จริง; scan `src/**` + `docs/**`
- unit test (`src/tests/lint-md.test.mjs`) + `npm run lint:md` + CI step
- ข้าม: http(s), backtick code-span (runtime ref), root dogfood (gitignored)

**Out of scope (จะไม่ทำ)**
- markdownlint/prettier / devDependencies (ขัด zero-dep)
- cosmetic rules (trailing space/newline/heading style) — prettier-territory, low-value
- validate anchor `#section` (validate path พอ)
- auto-fix (gate = ตรวจ ไม่แก้ให้)
- validate backtick runtime-ref ของ adapter (เป็น target-root path ไม่ใช่ repo-relative)

## 4. Decision Log
| # | ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| 1 | แก้ tension zero-dep | zero-dep script / YAGNI / devDeps | zero-dep script | **zero-dep script** | คง zero-dep (จุดขาย) + ตรง need (dead-link) + reuse pattern verify-pack |
| 2 | ขอบเขต lint | dead-link แกน / +structural / +cosmetic | dead-link แกน | **dead-link แกน** | opinionated high-signal; เลี่ยง reinvent markdownlint |
| 3 | scan + CI | src+docs+CI / src+CI / no-CI | src+docs+CI | **src+docs+CI** | payload (ship) + docs (need ที่เช็คมือซ้ำ); CI gate enforce |
| 4 | link type (design) | md-link เท่านั้น / +backtick | md-link เท่านั้น | **md-link เท่านั้น** | backtick = runtime path ref (target root) ไม่ใช่ repo-relative (RQ4) |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** dead-link = ปัญหาหลักที่คุ้ม gate (จาก need ที่ทำมือซ้ำ); link ส่วนใหญ่เป็น relative md-link
- **ข้อจำกัด:** zero-dep (node:* ล้วน, ห้าม devDeps); cross-platform (path.join, POSIX จาก git); ห้ามแตะ payload behavior; lint-md เป็น dev tooling (`src/scripts/`, ไม่ publish — เหมือน verify-pack)

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- `node src/scripts/lint-md.mjs` รัน → 0 dead-link บน repo ปัจจุบัน (ถ้าเจอ = แก้ก่อน)
- `checkLinks` เป็น pure function + unit test พิสูจน์จับ dead-link จริง (feed link ปลอม)
- ข้าม http/backtick/anchor ถูกต้อง (ไม่ false-positive)
- CI มี step lint:md (แบบ pack-verify); `npm run lint:md` เขียว
- zero-dep คงอยู่ (devDeps ยังว่าง); `npm test`+`verify:pack` ไม่ regress
- lint-md ไม่ติด tarball (dev-only — verify-pack denylist จับ)

## 7. Feature ideas / วิธีแก้ (ส่งต่อ DESIGN)
- pure `checkLinks(files)→errors[]` (รับ list path + อ่านเนื้อหา) + main-guard `fileURLToPath===argv[1]`
- parse: regex จับ `[text](target)` → filter http/anchor-only → resolve relative กับ dir ของไฟล์ → `existsSync`
- CI: step ใหม่ หรือ job `lint` (needs ไม่จำเป็น — เร็ว); pattern เดียวกับ pack-verify

## 8. Open questions
- (ไม่มี — Q1–Q4 ปิด; design detail = code-answerable)

## 9. ความเสี่ยงหลัก
- **false-positive backtick/anchor** → ลด: parse เฉพาะ `[](...)`, ข้าม `#`-only + http; unit test ครอบ
- **scan โดน root dogfood (stale)** → ลด: scan `src/**`+`docs/**` เจาะจง (ไม่ scan root `.warnyin/`/`.claude/`)

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- precedent: `src/scripts/verify-pack.mjs`, `docs/techstack/installer/{test,rule}.md`
- เอกสาร: `docs/rule.md` §2 (zero-dep) §5 (testing), roadmap P2 #12

---

## ✅ Gate → DESIGN
- [x] Problem/why-now ชัด ผูก rule §2 + roadmap #12 (automate dead-link ที่ทำมือซ้ำ)
- [x] Scope in/out ชัด (zero-dep dead-link, ไม่ devDeps/cosmetic)
- [x] Decision log ปิดครบ (Q1–Q4) ไม่มี open question ที่ block
- [x] success criteria วัดได้ (0 dead-link + pure-fn unit + CI + zero-dep คง)
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน (รอ)
