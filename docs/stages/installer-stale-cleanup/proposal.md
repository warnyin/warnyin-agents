# Proposal — installer stale-file cleanup (upgrade path)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `installer-stale-cleanup` |
| **ประเภท** | `bugfix` |
| **ขนาด** | `standard` |
| **วันที่** | `2026-08-16` |
| **มาจาก Discovery?** | `ไม่มี` (พบตอนตรวจ dogfood หลัง release `0.30.0`) |

## 1. สรุป change (what)
ให้ installer **ลบไฟล์ payload ที่ตัวเองเคยวางแต่หายไปจาก payload รุ่นใหม่** ตอน `--update` — ด้วย **manifest** ของไฟล์ที่ installer เขียนจริง (ไม่ใช่ "ลบทุกอย่างที่ไม่มีใน payload") + **known-stale list** สำหรับ install เก่าที่ยังไม่มี manifest + `--no-prune` + เทส upgrade path ที่ยังไม่เคยมี → release `0.30.1`

## 2. ทำไม (why)
- **ปัญหา:** `src/bin/cli.mjs` เป็น **copy-only ไม่มี sync-delete** — `0.30.0` ยุบ `template/[topic]/{test,verify}.md` ทิ้ง แต่ผู้ใช้ที่ `--update` จาก ≤`0.29.x` ยังมี 2 ไฟล์นั้นค้าง → topic ใหม่ที่ copy จาก template เห็น artifact ปนกัน 3 ไฟล์ และ agent อาจเขียนตามโครงเก่า (ยืนยันจริงบน dogfood ของ repo นี้เอง: tarball มีแค่ `build.md` แต่ root ยังมีของเก่าลงวันที่เดิม)
- **ผลถ้าไม่ทำ:** ทุก release ที่ลบ/ยุบไฟล์ใน payload จะทิ้งขยะไว้ในเครื่องผู้ใช้ถาวร และปัญหาจะสะสมทุกครั้ง — `verify:pack` จับไม่ได้เพราะมันตรวจ tarball ไม่ได้ตรวจ **ปลายทางหลังติดตั้ง**
- **ทำไมเพิ่งเจอ:** เทสที่มีครอบแค่ install สด (`setup:sandbox` ลง temp เปล่า) — **ไม่มีเทส upgrade จากรุ่นเก่าเลยสักตัว**

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A **manifest-based prune** (+ known-stale transition) | ลบเฉพาะของที่ installer เคยวางจริง — ของผู้ใช้ที่อยู่ dir เดียวกันปลอดภัย | ต้องเขียน/อ่าน manifest + มี transition path | ✅ |
| B path-based prune ทั้ง `CORE` | ง่ายกว่า ไม่ต้องมี state | **ลบงานผู้ใช้** — `.claude/skills/playwright-cli` ที่ผู้ใช้ติดตั้งเองจะหายทันที (`roles/README.md` แนะนำให้ vendor ลงที่นั่น) | |
| C ไม่ลบ แค่เตือน + CHANGELOG note | ไม่มี destructive op | พึ่งผู้ใช้ทำเอง · ปัญหากลับมาทุก release ที่ลบไฟล์ | |

- เหตุผลที่เลือก: A เป็นทางเดียวที่แยก "ของ installer" ออกจาก "ของผู้ใช้" ได้จริงในไดเรกทอรีที่ใช้ร่วมกัน

## 4. Scope
**In scope**
- `computeStale()` **pure fn** + manifest (`.warnyin/.warnyin-manifest`) เขียนทุกครั้งที่ install/update
- **known-stale list** — รายชื่อไฟล์ที่เคยเป็น payload แต่ถูกลบ (ตอนนี้ `template/stages/[topic]/{test,verify}.md`) ใช้เฉพาะกรณีไม่มี manifest; ระบุ **รายชื่อตายตัว ไม่ใช้ glob** + comment เงื่อนไขการเลิกใช้
- prune ทำงานตอน `--update` เท่านั้น · **ลบเลยไม่ถาม** (installer รัน non-interactive เป็นหลัก) · **พิมพ์รายชื่อไฟล์ที่ลบทุกไฟล์** · `--no-prune` ปิดได้ · `--dry-run` ต้องแสดงว่าจะลบอะไรโดยไม่ลบจริง
- **guard ขอบเขต:** ลบได้เฉพาะใต้ `CORE` 5 dir และเฉพาะไฟล์ที่อยู่ใน manifest/known-stale — path นอกขอบเขต, absolute path, `..`, symlink → ปฏิเสธ
- **เทส upgrade path (ใหม่ทั้งชุด):** install payload รุ่นเก่า (มี `test.md`/`verify.md`) + ไฟล์ของผู้ใช้ (skill เอง + `docs/`) → `--update` → assert **ของค้างหาย · ของผู้ใช้อยู่ครบ · payload ใหม่ถูกต้อง**
- release `0.30.1` + CHANGELOG + runbook

**Out of scope**
- prune `docs/` หรือพื้นที่งานจริงของผู้ใช้ — **ห้ามเด็ดขาด** ไม่ว่ากรณีใด
- ย้อนดึง payload รุ่นเก่าจาก npm มาสร้าง manifest (network + ช้า)
- backlog เดิม 2 entry ของ `lean-ceremony`

## 5. ผลกระทบ & ความเสี่ยง
- **กระทบ:** `src/bin/cli.mjs` · `src/tests/` (ชุดเทสใหม่) · `CHANGELOG.md` · `package.json` · `docs/infra.md` · `docs/techstack/installer/*`
- **★ ความเสี่ยงสูงสุด — ลบไฟล์ผิด (data loss ของผู้ใช้):** review panel ชี้ว่า manifest **ไม่ใช่ชั้นป้องกัน** เพราะเป็นไฟล์ในโปรเจกต์ที่ commit ได้ = untrusted input (repo สาธารณะใส่ manifest ปลอมแล้วสั่งลบไฟล์เหยื่อได้โดยไม่ต้องรันโค้ด) ⇒ ชั้นป้องกันจริงคือ **6 ชั้นอิสระตาม `design.md §1`**: path guard · scope allowlist · hash gate · fs containment (realpath) · blast cap · mode scope — แต่ละชั้นตัดสิน "ไม่ลบ" ได้ด้วยตัวเอง
- **ความเสี่ยง 2:** manifest เสีย/ถูกแก้มือ → degrade ปลอดภัย (อ่านไม่ได้ = ไม่ prune ยกเว้น known-stale) ไม่ throw
- **ความเสี่ยง 3:** known-stale list กลายเป็น dead code → ผูกเงื่อนไขกับ `.warnyin-version` stamp (`semverLt(stamp,'0.30.1')`) ให้ปลดระวางตัวเองด้วยเกณฑ์ที่วัดได้
- **ความเสี่ยง 4 (out of scope รอบนี้):** `.codebuddy/plugins/warnyin/commands/warnyin/` ที่ `copyDirToTarget` เขียน มีอาการตกค้างแบบเดียวกัน — เป็น mirror ที่ regenerate ได้ทุก install จึงเลื่อนไป backlog
- **hard-floor:** งานนี้เป็น **destructive filesystem operation** → บังคับ tier ≥ `standard` และต้องผ่าน review panel (`triage.md §2B` หมวด security-sensitive)

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Business: ข้าม — bugfix ของ upgrade path ไม่มีมิติธุรกิจใหม่
