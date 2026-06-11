# Ship — global-install

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ — หลังย้าย topic เข้า `docs/stages/achieved/2026-06-11-global-install/`

## 1. สรุป topic
- **ทำอะไร:** เพิ่มโหมดติดตั้ง **global (opt-in)** ให้ `@warnyin/agents` — `npx @warnyin/agents --global` ติดตั้ง adapter (`~/.claude/`) + playbook (`~/.warnyin/`) ครั้งเดียวใช้ทุกโปรเจกต์; resolve playbook **local-first → global** (convention canonical ใน root doc); `/warnyin:init` รับ workspace bootstrap; per-project = default (คง reproducibility + auditability). DESIGN: panel 5 role (4 blocker แก้ครบ) + dry-run (0 blocker). BUILD: wave เดียวขนาน 3 task full-gate เขียว (66/66). VERIFY: 16/16 empirical + 0 รอบแก้
- **ประเภท:** ☑ **feature ใหม่** → `docs/features/global-install/`

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/global-install/feature.md` | **สร้างใหม่** — capability global mode (mode resolution/target branch/installGlobalNote/resolution convention/init bootstrap), flow, ขอบเขต/ข้อจำกัด (per-project default, version-skew, Codex limitation, blast-radius) |
| `docs/features/global-install/business.md` | **สร้างใหม่** — เป้าหมาย/persona/success metric/scope จาก discovery+proposal |
| `docs/features/global-install/spec.md` | **สร้างใหม่** จาก Spec delta §9 (3 Requirement ADDED — global install / resolve local→global / init workspace; ไม่มี MODIFIED/REMOVED → ไม่มีเคส key-not-found) |
| `docs/techstack/installer/rule.md` | **LR1** global-mode safety (opt-in + first-install no-overwrite + note-only append + homedir guard + echo paths) + mirror-layout คง invariant ใน global + resolution-in-rootdoc; **LR2** payload workflow script ห้าม top-level `export` (build orchestration section) |
| `docs/techstack/installer/test.md` | เพิ่ม §"verify installer global mode / homedir write" (HOME+USERPROFILE override→temp + empirical executable + non-TTY timeout + pure-fn unit + pass-count) |
| `docs/techstack/installer/structure.md` | cli flow + mode branch + `resolveMode()`/`installGlobalNote()` helper signatures + `CLAUDE.global.md` ใน SOURCE list |
| `docs/troubleshooting.md` #20 | Workflow loader พัง `Unexpected keyword 'export'` (build-wave.mjs top-level export → temp copy ตัด export) |
| `docs/infra.md` | env var HOME/USERPROFILE (global mode) + วิธี override ตอนเทส |
| `docs/codemap/{architecture.md, index.md}` | installer global mode flow + CLAUDE.global.md + installer component note; update Generated header |
| `docs/project.md` | **ไม่แตะ** — เป้าหมาย/ขอบเขตเดิมครอบ (global = วิธีบรรลุ "ติดตั้งแล้วใช้ได้") |

## 3. Learned rules (planned + emergent)
| rule (generalize) | evidence | scope | promote? |
|---|---|---|---|
| **installer global-mode safety** — เขียน homedir = opt-in + first-install no-overwrite + note-only append (ไม่แตะ personal config) + homedir guard + echo paths | cli.mjs + `verify.md` D1/D3/D7 (executable) | component:installer | ✅ promote (LR1, user ยืนยัน) → `installer/rule.md` |
| **payload workflow script ห้าม top-level `export` นอกจาก `export const meta`** — Workflow loader พัง; pure-fn ให้ test สกัด module-parse/`new Function` (pattern #16) | `troubleshooting.md` TS-1/#20 + `build.md §5` (เจอจริง wave 1) | component:installer | ✅ promote (LR2, user ยืนยัน) → `installer/rule.md` |
| verify:pack ENOENT Windows | `troubleshooting.md` TS-2 | component:installer | ✂️ ตัด — **ซ้ำ `docs/troubleshooting.md #4`** |

## 4. Archive
- ย้ายจาก `docs/stages/global-install/` → `docs/stages/achieved/2026-06-11-global-install/` เมื่อ 2026-06-11 (git mv)

## 5. หมายเหตุ (นอก workflow)
- **โค้ดจริงอยู่ build branch `build/global-install`** — SHIP จัดการเอกสาร+archive; merge → main + release (bump 0.13.0 minor + publish + setup:dogfood) จัดการนอก workflow
- **src→root sync:** ไฟล์ใหม่ (cli global mode, CLAUDE.global.md, init.md) ปรากฏใน root dogfood หลัง release sync; ก่อนหน้าพิสูจน์ผ่าน temp HOME แล้ว (VERIFY D1-D7)
