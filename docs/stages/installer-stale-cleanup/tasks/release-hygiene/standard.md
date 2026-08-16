# Standard — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนที่ task นี้ต้องยึด · **อิงจาก** `docs/techstack/installer/standard.md` + `docs/rule.md §1/§2`

## 1. Standard กลางที่ยึด (จาก techstack)
- `docs/techstack/installer/standard.md` บรรทัด 64 — **`check-test-count.mjs`**: `MIN_PASS` = ปัดลงหลักสิบของ `(N − 5)` · bump พร้อม topic ที่เพิ่มเคส · คอมเมนต์ระบุ `N` ที่วัดได้
- `docs/techstack/installer/rule.md` §2 — **error string ของ gate script ต้องมี category prefix** ⇒ runbook อ้าง prefix เป็น identifier ได้ (reason code `path:` / `scope:` / `hash:` / `prune:` ของ C15 ใช้กติกาเดียวกัน)
- `docs/rule.md §2` — **ภาษาไทย** ในคอมเมนต์/ข้อความผู้ใช้ · **ESM** · **zero-dependency** (ห้ามเพิ่ม devDeps เพื่อทำ gate)
- `docs/rule.md §2` — **CHANGELOG ทุก user-facing change**: เปลี่ยนพฤติกรรม installer → ต้องมี entry ที่ผู้ใช้ npm migrate เองได้โดยไม่ต้องเดา

## 2. Pattern การเขียนของ task นี้

### 2.1 รูปแบบ CHANGELOG ของ repo (Keep a Changelog)
- header: `## [<version>] - <YYYY-MM-DD>` — **แทรกเหนือ `## [0.30.0]`** และ **ใต้** บล็อก `## Migration guide` ที่อยู่หัวไฟล์ (บล็อกนั้นเป็น global guide ห้ามแตะ)
- section ที่ repo ใช้จริง เรียงตามนี้: `### Added` · `### Changed` · `### Fixed` · `### Migration` — **ใส่เฉพาะที่มีของจริง**
- ต่อ entry: `- **หัวข้อสั้น** — คำอธิบายเชิงผลกระทบต่อผู้ใช้ (ไม่ใช่ diff ของโค้ด)`; entry ที่สำคัญที่สุดของ release นำหน้าด้วย `★` หรือ `- **★ ...**`
- อ้าง path/flag เป็น **inline-code** เสมอ (`` `--no-prune` ``) — **ห้าม markdown-link ชี้ `docs/stages/<slug>/`** (`lint:md` สแกน → ลิงก์พังเมื่อ SHIP archive)
- `### Migration` เขียนเป็น bullet เชิงสั่งการ: อาการที่ผู้ใช้จะเห็น → ต้องทำอะไร → ทางปิด/ทางกู้ (ดูตัวอย่าง `[0.30.0] ### Migration` และ `[0.29.1]` ที่ใช้ blockquote `> **⚠️ ...**` สำหรับคำเตือน destructive)
- **ownership ระหว่าง multi-slice** (`docs/rule.md §1`): slice นี้เป็น **slice สุดท้าย** ⇒ สร้าง header `## [0.30.1]` + วันที่ + `### Migration` · **และเขียน entries ของทั้ง release เอง** (slice 1/2 ถูกห้ามแตะ `CHANGELOG.md` — ดู `rule.md §1`) โดยสรุปจาก `design.md §1/§4` และ build report ของ wave 1 · **ห้ามย้าย/ลบ/แก้ entries ของ release เก่า**

### 2.2 เนื้อที่ `### Migration` ของ `[0.30.1]` ต้องครอบ (4 ข้อ)
1. **`--update` ลบไฟล์ CORE ที่ตกรุ่นได้แล้ว** — ลบเฉพาะไฟล์ที่ installer เคยวางเองและเนื้อหายังไม่ถูกแก้ · ไฟล์ผู้ใช้และ `docs/` ไม่ถูกแตะ
2. **วิธีปิด** — `--no-prune` หรือ env `WARNYIN_NO_PRUNE=1` · และ `--dry-run` ดูก่อนได้
3. **manifest คืออะไร** — `.warnyin/.warnyin-manifest` = รายการไฟล์+hash ที่ installer เขียนเอง · **ห้ามแก้มือ** (แก้แล้ว hash ไม่ตรง → ไฟล์นั้นจะไม่ถูกลบและมีคำเตือน)
4. **โปรเจกต์ที่ track `.warnyin/` ลง git จะเห็น diff ของ manifest ทุก `--update`** — เป็นเรื่องปกติ commit ได้ (แต่ manifest = untrusted input ของ installer ⇒ อย่าแก้เอง)

### 2.3 วิธีเขียน runbook section ใน `docs/infra.md`
ยึด pattern ของ `## Runbook — verify:pack gate failure` และ `## Runbook — ✖ [C7] cap เอกสารเกิน`:
- หัวข้อระดับ `##` ขึ้นต้นด้วย `Runbook — ` แล้วตามด้วยชื่ออาการที่ผู้ใช้ grep เจอ
- โครงในสุด: **อาการ** (fenced block ของ output จริง) → **สาเหตุ** → **ตาราง category ↔ วิธีแก้** → **วิธีแก้เป็นขั้นตอน** → **ข้อระวัง** → **ตรวจสถานะ** (fenced `bash` ที่ copy ไปรันได้)
- section ใหม่ **`## Runbook — prune ลบไฟล์ไป — ตรวจ/กู้/ปิด`** ต้องมีครบ 5 องค์ประกอบ:
  1. **วิธีตรวจว่าอะไรถูกลบ** — `npx @warnyin/agents --update --dry-run` (หัวข้อ `จะลบ:` + บรรทัด `  − <path>`) · อ่าน `.warnyin/.warnyin-manifest` · `git status` / `git diff --stat`
  2. **วิธีกู้** แยก 3 กรณี — (ก) **payload ของ warnyin**: รัน `npx @warnyin/agents --update` ซ้ำ ได้คืนครบ · (ข) **ไฟล์ของผู้ใช้**: กู้ได้จาก **git เท่านั้น** (installer ไม่มี backup/trash) · (ค) **repo นี้เอง (dogfood)**: root `.warnyin/`+`.claude/` **ถูก gitignore ทั้งก้อน ⇒ กู้จาก git ไม่ได้** → `npm run setup:dogfood` แล้ว **re-vendor skill ที่ติดตั้งเองใหม่** (`/warnyin:install-skill`)
  3. **วิธีปิด** — `--no-prune` (flag) หรือ `WARNYIN_NO_PRUNE=1` (env) · ระบุว่าปิดแล้ว **ข้อมูลไม่หาย** เพราะ manifest คง entry เดิมไว้ (C13) รอบหน้ายังลบได้
  4. **ตาราง reason code 13 ค่าตาม C15 ↔ วิธีแก้** — คอลัมน์ `reason` / `อาการ` / `วิธีแก้` ครบทั้ง `path:backslash` `path:dot-segment` `path:absolute` `path:control-char` `scope:outside-root` `scope:not-allowlisted` `hash:missing` `hash:mismatch` `prune:too-large` `prune:symlink` `prune:not-contained` `prune:io` `prune:blast-cap` (`prune:blast-cap` → escape `--prune-force` + วิธีตรวจด้วย `--dry-run`)
  5. **หมายเหตุ exit code** — prune **exit 0 เสมอ** แม้ข้าม/ปฏิเสธทุก entry ⇒ **automation ต้องอ่าน stdout (บรรทัด `−` / `⚠` / บรรทัดสรุป) ไม่ใช่ exit code**
- **path ในเอกสารเป็น inline-code ห้าม markdown-link** (กติกาเดียวกับ project memory, `docs/infra.md` บรรทัด 47)

### 2.4 sweep `## Env vars สำคัญ`
เพิ่มบรรทัดสไตล์เดียวกับ **version stamp artifact** (บรรทัด 23) สำหรับ `.warnyin/.warnyin-manifest`: เป็น **install-time artifact** ที่เกิดที่ target เท่านั้น · repo นี้ root `.warnyin/` gitignored → ไม่ track · end-user track ได้ (เห็น diff) · **ไม่ขึ้น tarball** (`DENY_PREFIX '.warnyin/'`) · เพิ่ม `WARNYIN_NO_PRUNE` เป็น env var ที่รองรับ · **คำเตือน:** `npm run setup:dogfood` รัน `--update` ⇒ **prune ทำงานกับ root dogfood ที่ gitignored** (กู้ด้วย git ไม่ได้ ดู runbook)

### 2.5 สูตร MIN_PASS + รูปคอมเมนต์
```
MIN_PASS = floor((N − 5) / 10) × 10       // N = ยอด pass จริงหลัง integrate ครบ
```
คอมเมนต์ต่อท้ายบล็อกเดิมใน `src/scripts/check-test-count.mjs` (อย่าลบที่มาของรุ่นก่อน — ต่อประวัติ):
```
// topic installer-stale-cleanup (<วันที่ที่ BUILD รันจริง>): slice 1 prune + slice 2 upgrade-path-test + slice 3 verify-pack
// → N = <ยอดจริง>; headroom 5; snap ลงหลักสิบ → MIN_PASS = <ค่าใหม่>
```
- ห้ามตั้งค่าจากการเดา — ต้องมาจากผล `npm test` ที่รันจริงในรอบนี้
- **ห้ามลด `MIN_PASS` เพื่อให้ gate ผ่าน** (config-protection) — ยอดตกแปลว่าเทสหาย → รายงาน

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `src/scripts/check-test-count.mjs` — gate มีอยู่แล้ว **แก้แค่ค่า `MIN_PASS` + คอมเมนต์**
- `src/scripts/verify-pack.mjs` `checkFiles()` — pure fn export อยู่แล้ว, `DENY_PREFIX '.warnyin/'` ครอบ manifest แล้ว ⇒ **เขียนเฉพาะเทส**
- `src/tests/verify-pack.test.mjs` — reuse ค่าคงที่ `GOOD` และ pattern ของเคส `stamp deny: .warnyin/.warnyin-version`
- `src/tests/installer.test.mjs` — reuse `makeTempProject(t)` / `runCli(tmp, args)` / `ok(r, ...)` ที่มีอยู่

## 4. เพิ่มเติมเฉพาะ task
- **release-hygiene แก้ได้เฉพาะ "จุดเชื่อม"** (pointer / ชื่อไฟล์ / wording ตาม contract / ตัวเลข gate) — เจอ **นโยบาย** ที่ขัดกัน (เช่น reason string จริงไม่ตรงเซตปิด C15, contract ของ prune ต่างจาก design) → **รายงานขึ้น build report ให้ VERIFY ตัดสิน ห้ามแก้เอง** (`docs/rule.md §1` — กัน single-writer ของกฎแตก)
- ถ้า pattern ตาราง reason code + "exit 0 เสมอ ⇒ อ่าน stdout" พิสูจน์ว่าใช้ได้ดี → เสนอขึ้น standard กลางใน `rule.md §2` (รอ SHIP)
