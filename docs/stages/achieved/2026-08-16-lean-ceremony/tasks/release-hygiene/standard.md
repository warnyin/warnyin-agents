# Standard — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack)
> อ้างอิง `docs/techstack/installer/standard.md` + `docs/infra.md` — ข้อไหนเกี่ยวกับ task นี้
- **Keep a Changelog** — `## [version] - YYYY-MM-DD` + กลุ่ม `### Added` / `### Changed` / `### Fixed` / `### Removed` (+ `### Migration` ที่ repo นี้ใช้เป็น convention ท้าย section)
- **SemVer** — repo อยู่ช่วง `0.x`: เพิ่ม/เปลี่ยน **พฤติกรรมของ payload ที่ผู้ใช้เห็น** = **minor**; fix/wording = patch
- **pass-count gate** — `src/scripts/check-test-count.mjs` parse summary ของ `node --test` แล้ว fail เมื่อ `pass < MIN_PASS` หรือ `pass !== tests` (anti-false-green, `docs/rule.md §5`)
- **zero-dependency** — ห้ามเพิ่ม devDeps เพื่อทำ gate; ทุก gate เป็น `node:*` script ของ repo เอง
- **ภาษา** — CHANGELOG / runbook เป็นภาษาไทย ตามสไตล์เดิมของ repo

## 2. Pattern การเขียนโค้ดของ task นี้

### 2.1 รูปแบบ CHANGELOG ของ repo นี้
- ตำแหน่ง: section ใหม่แทรก **ระหว่าง `## Migration guide` (บนสุด ของ legacy layout) กับ `## [0.29.1]`** — เรียงใหม่→เก่าเสมอ
- โครงของ section:
  ```
  ## [0.30.0] - YYYY-MM-DD

  ### Added
  - **<หัวข้อหนา>** — <อธิบายว่าผู้ใช้เห็นอะไรเปลี่ยน + ทำไม>

  ### Changed
  - **<หัวข้อหนา>** — <พฤติกรรมเดิม → ใหม่>

  ### Migration
  - <ผู้ใช้เดิมต้องทำ/ไม่ต้องทำอะไร>
  ```
- **สไตล์ entry ของ repo นี้** (ดู `0.28.0` เป็นแม่แบบ): ขึ้นต้นด้วย **bold หัวข้อสั้น** แล้ว em-dash แล้วอธิบาย; ระบุ **พฤติกรรมเดิมในวงเล็บ** เมื่อเป็นการเปลี่ยน (`_(เดิม: ...)_`); ใส่ `★` นำหน้าเมื่อเป็นข้อที่กระทบผู้ใช้แรงที่สุด
- **path ทุกตัวเป็น inline-code** ไม่ใช่ markdown-link — `CHANGELOG.md` อยู่นอก `SCAN_ROOTS` ของ `lint:md` ก็จริง แต่ยึดสไตล์เดียวกับทั้ง repo และกันลิงก์ตายเมื่อ topic ถูก archive
- **1 entry = 1 พฤติกรรมที่ผู้ใช้เห็น** — ไม่รวบ 5 change ของ topic เป็นบรรทัดเดียว และไม่แตกเป็นรายไฟล์ที่แก้ (ผู้อ่านคือ user ของ npm ไม่ใช่ reviewer ของ diff)
- **Migration เขียนเป็น "ต้องทำ/ไม่ต้องทำ"** — บอกตรง ๆ ว่าเคสไหนไม่ต้องทำอะไร (topic ค้าง) และเคสไหนจะเจอ block (cap เกิน) พร้อมชี้ทางแก้ที่ runbook
- **ownership** — slice นี้เป็น slice สุดท้าย → **เติมวันที่ + `### Migration`**; entries ที่ slice อื่นสร้างไว้ **ห้ามย้าย/แก้/ลบ** (`docs/rule.md §1`)

### 2.2 วิธีเขียน runbook section ใน `docs/infra.md`
- **ตำแหน่ง:** ต่อท้ายไฟล์ ถัดจาก `## Runbook — \`verify:pack\` gate failure` — heading ระดับ `##` รูปแบบ **`## Runbook — <ชื่อ gate/error> `** (ยึด pattern เดิม)
- **โครงที่ต้องมี** (ตาม `docs/rule.md §1` runbook section): **อาการ** (error string จริงที่ผู้ใช้เห็น + exit code) → **สาเหตุ** → **วิธีแก้** → **ขั้นตอน debug เร็ว**
- ใช้ **ตาราง** เมื่อมีหลาย category (แบบ `verify:pack`) หรือ **bullet 3 ทางเลือก** เมื่อ gate เดียวหลายทางออก (เคส C7 นี้เหมาะกับ bullet + ตารางเล็ก cap ต่อ tier)
- **อ้าง error ด้วย prefix เป็น identifier** — `✖ [C7]` / `⚠ [C7]` (prefix convention ของ repo) ให้ผู้ใช้ grep เจอจาก output ตรง ๆ
- **ห้ามเสนอทางแก้ที่เป็นการลด bar** (ปิด gate / แก้ตัวเลข cap) — runbook คือวิธีทำงานให้ผ่าน ไม่ใช่วิธีเลี่ยง (`docs/rule.md §1` config-protection)
- **path เป็น inline-code ห้าม markdown-link** — `docs/infra.md` อยู่ใน `SCAN_ROOTS` ของ `lint-md.mjs` → ลิงก์ที่ชี้ `docs/stages/<slug>/` จะพังถาวรเมื่อ SHIP archive topic

### 2.3 การ bump MIN_PASS
- อ่านค่าปัจจุบันจากไฟล์ก่อนเสมอ → รัน test จริง → ได้ N → `MIN_PASS = floor((N − 5) / 10) × 10`
- **แก้ comment เหนือ const พร้อมกัน** ให้ระบุที่มา (topic + slice ที่เพิ่มเคส + N ที่วัดได้ + วันที่) — comment ที่ค้างของเดิมถือว่า stale
- ห้าม derive N จากตัวเลขที่คาดเดา (นับ test ที่ "น่าจะเพิ่ม") — ต้องมาจาก output จริงหลัง integrate

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `src/scripts/check-test-count.mjs` — pass-count gate + สูตร MIN_PASS (มี comment สูตรอยู่แล้ว)
- `src/scripts/lint-md.mjs` — dead-link gate; `SCAN_ROOTS = ['src','docs']`, `EXCLUDE_PREFIX = ['src/.warnyin/template/', 'docs/stages/achieved/']` → **template ไม่ถูกสแกน** จึงต้องพึ่ง grep ของ §7.6 แทนสำหรับ orphan pointer ในเทมเพลต
- `src/scripts/verify-pack.mjs` — pack gate (allowlist/denylist/EOL/path)
- `src/.warnyin/workflow/scripts/validate-topic.mjs` — structural validator ของ topic (v-next มี C7 จาก slice 3); คู่ dogfood อยู่ที่ `.warnyin/workflow/scripts/validate-topic.mjs`
- `.github/workflows/ci.yml` — รูปแบบคำสั่ง gate ที่ CI ใช้จริง (`set -o pipefail; npm test 2>&1 | node src/scripts/check-test-count.mjs`) — ใช้คำสั่งเดียวกันตอนรัน local เพื่อไม่ให้ผลต่างจาก CI
- `docs/infra.md` — runbook เดิมของ `verify:pack` = แม่แบบรูปแบบ
- `CHANGELOG.md` `0.28.0` — แม่แบบ entry ที่มีทั้ง Added/Changed/Fixed/Migration

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
> pattern ใหม่ที่ task นี้แนะนำ — ถ้าควรเป็นมาตรฐานกลาง ให้ note ใน `rule.md` (รอ SHIP อัปเดต standard กลาง)
- **dual-validator check ตอน release** — topic ที่แก้ตัว validator เอง ต้องรัน **ทั้ง dogfood และ v-next** (`.warnyin/...` และ `src/.warnyin/...`) เพราะ dogfood คือรุ่นที่ผู้ใช้ปัจจุบันถืออยู่ ส่วน v-next คือรุ่นที่กำลังจะ ship — ผ่านทั้งคู่ = ไม่ทิ้งผู้ใช้เก่าและไม่ ship gate ที่ตัวเองยังไม่ผ่าน
- **self-dogfood ของ gate ใหม่** — gate ที่ topic นี้เพิ่ม (C7 cap) ต้องถูกใช้กับ **เอกสารของ topic นี้เอง** เป็นเคสแรก; ไม่ผ่าน → ย่อเอกสาร ไม่ใช่ปรับ cap
- **cross-slice consistency = แก้ได้แค่จุดเชื่อม** — inconsistency ที่เจอตอน integrate แก้ได้เฉพาะ **pointer / ชื่อไฟล์ / wording ที่ต้องตรง contract**; นโยบายที่ขัดกันจริงให้ **รายงานขึ้น VERIFY** ไม่ตัดสินเองใน wave สุดท้าย
