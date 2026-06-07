# Research — roadmap-sync-p0

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> ที่เก็บ "ข้อมูลที่ค้นมา + หลักฐาน" สนับสนุนการตัดสินใจใน `discovery.md`

| | |
|---|---|
| **Slug** | `roadmap-sync-p0` |
| **วันที่** | 2026-06-07 |

---

## 1. คำถามวิจัย (research questions)
> สิ่งที่ "ยังไม่รู้" และต้องค้นให้ได้คำตอบก่อนออกแบบ
- [x] RQ1: P0 แต่ละข้อใน
 `roadmap.md` สถานะจริงคืออะไร (เทียบไฟล์จริง ไม่ใช่ checkbox)
- [x] RQ2: legacy warning ใน `cli.mjs` ครอบ migration path อะไรบ้าง (เพื่อให้ Migration guide สอดคล้อง)
- [x] RQ3: breaking change 0.6.0→0.7.0 กระทบผู้ใช้ปลายทาง (npx) หรือเฉพาะ contributor

## 2. วิธี & แหล่งข้อมูล
- [x] อ่านโค้ด/เอกสารในโปรเจกต์ (code inspection) — `cli.mjs`, `CHANGELOG.md`, `README.md`, `ci.yml`, `roadmap.md`
- [ ] ค้นเว็บ / เอกสารภายนอก — ไม่จำเป็น (งานภายใน repo ล้วน)
- [ ] prior art — Keep a Changelog format ใช้อยู่แล้วใน `CHANGELOG.md`

## 3. Findings (ผลการค้นต่อคำถาม)

### RQ1: สถานะ P0 จริง
- **พบว่า:**
  - P0 #1 (test installer) = ✅ เสร็จ — `docs/stages/achieved/2026-06-06-installer-test-ci`, 9+9 เคส
  - P0 #2 (CI test+pack) = ✅ เสร็จ — `.github/workflows/ci.yml` มี test matrix [20,22,24] + job `pack-verify`; lint/format ย่อยโยงไป #12 (P2)
  - P0 #3 (CHANGELOG + migration 0.6.0) = ⚠️ **บางส่วน** — `CHANGELOG.md` มีแค่ `[0.7.0]` + `[Unreleased]`; **ไม่มี entry 0.6.0 และไม่มี migration note** ของ breaking `warnyin/`→`.warnyin/`
  - P0 #4 (README) = ⚠️ **เกือบครบ** — quickstart (`npx` → `/warnyin:init` → stage) + section "โครงสร้างที่ติดตั้งลงโปรเจกต์" ตรง 0.7.0 (commit `653a6b7`) แล้ว; **ขาดแค่ลิงก์ไป migration/CHANGELOG**
- **หลักฐาน:** `CHANGELOG.md` L8–34 (เริ่ม [Unreleased] → [0.7.0] ตรงๆ ไม่มี 0.6.0); `README.md` grep ไม่เจอ `migration`/`changelog`; `roadmap.md` L32–42 ยัง `[ ]`
- **นัยต่อการออกแบบ:** gap จริงเหลือ 3 จุด — CHANGELOG migration, README link, sync roadmap checkbox

### RQ2: legacy warning ใน cli.mjs
- **พบว่า:** `cli.mjs` ตรวจ + เตือน 2 ช่วง (ให้ user `git mv` เอง ไม่แตะงานจริง):
  - **≤0.2.x** (L43–48): พบ `workflow/` + `warnyin-stages/` ที่ root → `git mv warnyin-stages docs/stages` + ย้าย core เข้า `.warnyin/`
  - **0.3–0.5.x** (L53–58): พบ `warnyin/{workflow,template,installer,stages}` → แยกเป็น `.warnyin/` (core) + `docs/stages` (งานจริง)
- **หลักฐาน:** `src/bin/cli.mjs` L43–58 (`legacyV2`, `legacyV5`); string มี en-dash `0.3–0.5.x` (U+2013), `≤0.2.x` (U+2264)
- **นัยต่อการออกแบบ:** Migration guide ต้อง mirror 2 ช่วงนี้ + copy คำสั่ง `git mv` ให้ตรงที่ installer เตือน (ผู้ใช้เทียบได้); ระวัง codepoint ตรง

### RQ3: 0.6.0→0.7.0 กระทบใคร
- **พบว่า:** 0.7.0 changes (`CHANGELOG.md` [0.7.0] Changed) = bin path `bin/`→`src/bin/`, files allowlist, dogfood layer — **ทั้งหมดเป็นเรื่องภายใน repo/contributor**; payload ที่ติดตั้งให้ผู้ใช้ปลายทาง **คงเดิม** (`.warnyin/`, `.claude/` โครงเท่ากัน)
- **หลักฐาน:** `CHANGELOG.md` L23 "payload คงเดิม"; `docs/codemap/architecture.md` (installer copy `src/<rel>`→`target/<rel>` mirror layout)
- **นัยต่อการออกแบบ:** Migration guide ระบุชัด — ผู้ใช้ `npx @warnyin/agents` จาก 0.6.0→0.7.0 **ไม่ต้องทำอะไร**; เฉพาะ contributor ที่ clone repo ต้องรู้เรื่อง `src/` + dogfood (มีใน `CONTRIBUTING.md` แล้ว)

## 4. Code inspection (สิ่งที่ตอบได้จากโค้ดเอง โดยไม่ต้องถาม user)
| ไฟล์ / ส่วนของโค้ด | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `CHANGELOG.md` L8–34 | มีแค่ `[Unreleased]` + `[0.7.0]`; ไม่มี 0.6.0/migration | ต้องเพิ่ม Migration guide section |
| `src/bin/cli.mjs` L43–58 | legacy warn 2 ช่วง (≤0.2.x, 0.3–0.5.x) + คำสั่ง `git mv` | source-of-truth ของ migration content |
| `README.md` (headings) | quickstart + โครงตรง 0.7.0 แล้ว ไม่มี migration link | เพิ่มแค่ลิงก์ 1 บรรทัด |
| `.github/workflows/ci.yml` | test matrix + pack-verify; **ไม่มี** lint/format | ยืนยัน #12 ยังไม่ทำ (out of scope รอบนี้) |
| `docs/roadmap.md` L16–42 | P0 #3/#4 ยัง `[ ]`; อัปเดต 2026-06-06 | sync checkbox + วันที่ |

## 5. ทางเลือก & เปรียบเทียบ (ถ้ามี)
| ทางเลือก (CHANGELOG) | ข้อดี | ข้อเสีย | เหมาะกับเคสนี้? |
|---|---|---|---|
| entry `[0.6.0]` ย้อนหลังแยก version | ตรง Keep-a-Changelog | ต้องไล่ย้อน, migration กระจายหลาย version | ไม่ — D2 ปัด |
| **Migration guide section รวม** | migration ทุก breaking อ่านที่เดียว, mirror cli.mjs ตรง | ไม่ canonical แบบ per-version | ✅ เลือก (D2) |

## 6. ความเสี่ยง / unknown ที่ยังเหลือ
- ไม่มี unknown ที่ block — ทุกคำถามปิดด้วย code inspection แล้ว

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำจาก research:** เขียน Migration guide section ใน CHANGELOG mirror legacy warning `cli.mjs` 2 ช่วง (copy codepoint ตรง) + ระบุ 0.6.0→0.7.0 ไม่กระทบผู้ใช้ปลายทาง; README เพิ่มลิงก์ 1 บรรทัด; sync roadmap checkbox
- **การตัดสินใจที่ป้อนกลับเข้า `discovery.md`:** D2 (section รวม), D3 (CHANGELOG single source + README link), D4 (0.6.0→0.7.0 ไม่กระทบปลายทาง) — ยืนยันด้วย evidence แล้ว
