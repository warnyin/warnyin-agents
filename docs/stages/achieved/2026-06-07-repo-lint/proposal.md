# Proposal — repo-lint (zero-dep dead-link gate)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Slug** | `repo-lint` |
| **ประเภท** | `feature` (dev tooling / CI gate) |
| **ขนาด** | `เล็ก-กลาง` |
| **วันที่** | 2026-06-07 |
| **มาจาก Discovery?** | `./discovery.md` (Q1–Q4 + D ปิด) |

## 1. สรุป change (what)
เพิ่ม **`src/scripts/lint-md.mjs`** — dead-link gate **zero-dep** (node:* ล้วน) เช็ค markdown-link `[](path)` ใน `src/**`+`docs/**` resolve เป็นไฟล์จริง (ข้าม http/anchor/inline-code; **exclude** `src/.warnyin/template/**` + `docs/stages/achieved/**`) + unit test + `npm run lint:md` + CI job `lint-md` — แทน markdownlint/prettier ที่จะทำลาย zero-dep

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** dead-link เป็น need ที่**ทำมือซ้ำทุก VERIFY** (context-profiles/skill-format/examples/gitignore-dogfood) — automate เป็น gate; broken link ใน playbook ที่ publish = ผู้ใช้เจอลิงก์เสีย
- **ผลถ้าไม่ทำ:** roadmap P2 #12 (ข้อสุดท้าย) ค้าง; dead-link หลุดได้เงียบ ๆ

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. zero-dep node script (dead-link) | คง zero-dep, ตรง need, reuse pattern verify-pack | เขียน/ดูแลเอง (เล็ก) | ✅ (Q1/Q2) |
| B. markdownlint/prettier (devDeps) | tool มาตรฐาน, rule เยอะ | **ทำลาย zero-dep** (จุดขาย), cosmetic ไม่คุ้ม | — |
| C. ข้าม (YAGNI) | ไม่เพิ่มงาน | ไม่ได้ gate need ที่เกิดซ้ำ | — |

- **เหตุผล A:** zero-dep คือ selling point (rule §2); precedent `verify-pack.mjs`/`check-test-count.mjs` = gate zero-dep เขียนเอง — extend pattern เดียวกัน

## 4. Scope
**In scope**
- `src/scripts/lint-md.mjs` — pure `checkLinks(docs, exists)` + main-guard (mirror verify-pack)
- `src/tests/lint-md.test.mjs` — unit (dead-link จับ + code-span/http/anchor ข้าม)
- `package.json` script `lint:md` + `.github/workflows/ci.yml` job `lint-md`

**Out of scope**
- devDeps / markdownlint / prettier
- cosmetic (trailing space/newline/heading) · auto-fix · anchor validation
- lint template (`src/.warnyin/template/**` — placeholder links โดยตั้งใจ) + archived (`docs/stages/achieved/**` — frozen, D)
- validate backtick runtime-ref ของ adapter (target-root path ไม่ใช่ repo-relative)
- แตะ payload behavior / playbook กลาง

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบเดิมที่กระทบ:** เพิ่ม dev tooling (`src/scripts/`) + CI job + 1 npm script — **ไม่แตะ payload/src behavior**; `lint-md.mjs`+test อยู่ใน denylist ของ verify-pack แล้ว (ไม่ ship)
- **ความเสี่ยง + ลด:**
  - **false-positive (code-span/template/archived)** → *ลด:* strip inline+fenced code, exclude template+archived (พิสูจน์ pre-scan: หลัง exclusion = 0 dead จาก 44 link) + unit test ครอบ
  - **zero-dep หลุด** → *ลด:* node:* ล้วน; devDeps ต้องยังว่าง (acceptance)
  - **test count gate** → คง pass==tests ≥ MIN_PASS (เพิ่มเคส count ขึ้น ไม่ลด)

## 6. ลิงก์
- Design: `./design.md` · Tasks: `./tasks/` · Discovery/Research: `./discovery.md` `./research.md`
- precedent: `src/scripts/verify-pack.mjs`, `.github/workflows/ci.yml`
