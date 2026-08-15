# Infra / Local Environment

> service ที่ต้องรันสำหรับ dev/เทส + วิธีรัน + env vars (zero-service · bootstrap 2-layer)

## Service ที่ต้องรัน (local dev)
- ไม่มี service/DB/queue — repo เป็น zero-dependency node tooling (installer + playbook docs)
- ต้องมี **Node.js ≥20** (CI matrix: node 20/22/24) และ `npm`; fallback ของ `setup:dogfood` ต้องมี `tar` ในระบบ (Windows 10+/mac/linux มีอยู่แล้ว)
- **`setup:dogfood` ต้องมี network ถึง npm registry** — query latest ด้วย `npm view @warnyin/agents version` (resolveExpectedVersion) เพื่อ pin exact + verify drift; offline → degrade (verify แบบ marker-only + warn loud, ไม่จับ drift) แต่ install เองก็ fail อยู่แล้ว

## วิธีรัน local
```bash
npm run setup:dogfood    # ติดตั้ง release เสถียรลง root (gitignored) — คืน dogfood env หลัง clone
npm test                 # black-box test installer (node --test, discover src/tests/*.test.mjs)
npm run verify:pack      # ตรวจ tarball ก่อน publish (payload ครบ + tooling/docs ไม่หลุด)
npm run setup:sandbox    # ติดตั้ง v-next จาก src/ ลง temp dir (ทดสอบ version skew)
```

## Env vars สำคัญ
- **runtime (per-project default):** ไม่มี env var ที่จำเป็น (zero-config)
- **global install mode** (`--global`) พึ่ง **`HOME`** (POSIX) / **`USERPROFILE`** (Windows) ผ่าน `os.homedir()` — resolve target `~/.warnyin/`+`~/.claude/`; ถ้าหาไม่ได้/เป็น filesystem root → installer error (guard) แนะนำ `--project`
- **เทส global mode:** ต้อง override **ทั้ง `HOME` และ `USERPROFILE`** → temp dir ตอน spawn (`runCli(cwd, args, env)` ส่ง `{...process.env, HOME: tmp, USERPROFILE: tmp}`) — กัน side-effect เขียน homedir จริงของ dev/CI; assert side-effect อยู่ใน temp (กัน false-pass ถ้า override ไม่ติด)
- **`npm_config_prefer_online`** (`setup:dogfood`) — ตั้ง `'true'` ตอน spawn npx เพื่อ revalidate registry metadata (เสริม pin-exact ที่เป็นตัวหลักกัน stale npx cache); ส่งผ่าน `env: {...process.env, npm_config_prefer_online:'true'}` (cross-platform — เป็น npm config env ไม่ใช่ shell var)
- **version stamp artifact** — installer เขียน `.warnyin/.warnyin-version` (= เวอร์ชันที่ติดตั้ง) ลง target ทุก install/`--update`; **repo เอง** root `/.warnyin/` gitignored → stamp ไม่ track (dogfood); **end-user** `.warnyin/` track ได้ (เห็น diff bump); install-time artifact → ไม่ขึ้น tarball (allowlist granular)

## Environment อื่น (staging/prod)
- **publish:** npm registry (`@warnyin/agents`) — CI gate `.github/workflows/ci.yml` (test matrix + pack-verify) ก่อน publish
- **เครื่องมือ API-doc = optional ของโปรเจกต์ปลายทาง ไม่ใช่ dependency ของ repo นี้** — capability `.warnyin/workflow/api-doc.md` อ้างถึง Spectral/Redocly/openapi-generator/FastAPI/tsoa แบบ "ติดตั้งเองเมื่ออยากใช้" (reference ไม่ vendor); repo นี้ยัง **zero-dep** ไม่ต้องลง tool เหล่านี้

## Runbook — transition `src/` restructure (topic src-bootstrap, design §5.3)
ลำดับ one-time ตอนแยก source → `src/` + เปิด dogfood (ทำครั้งเดียว):
1. publish 0.6.0 (main, `.warnyin/` layout) ขึ้น npm = dogfood baseline
2. `git mv` source ทั้งหมด → `src/` (bin/tests/scripts/.warnyin/.claude/AGENTS.md)
3. `git mv CLAUDE.md CONTRIBUTING.md` + rewrite (dev focus)
4. แก้ `package.json` (bin→src/bin/cli.mjs, files allowlist, scripts) + `src/scripts/verify-pack.mjs`
5. เพิ่ม `.gitignore` dogfood layer (root-anchored ทุกบรรทัด) + **`git rm -r --cached` root dogfood เก่าที่ track อยู่** ⚠️ — step นี้ **ตกหล่นจริงตอน src-bootstrap** (`.gitignore` ไม่ได้เพิ่ม dogfood + ไม่ได้ untrack → root dogfood ค้าง tracked 64 ไฟล์) แก้ภายหลังโดย topic `gitignore-dogfood-fix` (2026-06-07); ดู `troubleshooting.md` #11 — **บทเรียน:** verify ด้วย `git ls-files .warnyin/ .claude/` = 0 ไม่ใช่แค่ทำตาม runbook
6. `npm test` เขียว + `npm run verify:pack` ผ่าน
7. `npm run setup:dogfood` → คืน dogfood env ที่ root (gitignored, จาก release)
8. bump version → 0.7.0 + CHANGELOG

## กฎ infra: npm scripts ต้อง cross-platform
- npm scripts ที่เป็น dev tooling (`setup:*`) ต้องเป็น **node script** (`node src/scripts/*.mjs`) ไม่ใช่ shell oneliner ที่ผูก POSIX
- ใช้ `os.tmpdir()` (ห้าม hardcode `/tmp`), `path.join` (ห้าม `/` literal), spawn array args (ห้าม `shell:true` ยกเว้น npx บน Windows ที่เป็น `.cmd`)
- เผื่อ Windows: npx bin-shim อาจ resolve ไม่ได้ → ต้องมี fallback (npm pack + node) หรือ exit ด้วย error ชัดเจน

## project memory ใน working tree ของ repo นี้ (dogfood)
- ตั้งแต่ **0.28.0** installer seed `docs/memory.md` + `docs/stages/context.md` ให้ทุกโปรเจกต์ → **`npm run setup:dogfood` หลัง release จะ seed `docs/memory.md` เข้า working tree ของ repo นี้ด้วย** (path อยู่นอก `.gitignore` ของ dogfood layer จึงเป็นไฟล์ **tracked** ที่ต้อง review ก่อน commit)
- ไฟล์ทั้งสองอยู่ใต้ข้อบังคับเดียวกับ artifact ที่ agent เขียนแล้ว commit: **ห้าม raw secret/token/credential, absolute path ของเครื่อง, PII จริง** และอ้าง path เป็น **inline-code ห้าม markdown-link** (อยู่ใน `SCAN_ROOTS` ของ `lint:md` → ลิงก์ที่ชี้ `docs/stages/<slug>/` จะพังถาวรเมื่อ SHIP archive topic) — กติกาเต็ม `.warnyin/workflow/memory.md`
- ตรวจสุขภาพ: `node .warnyin/workflow/scripts/memory-status.mjs` (read-only, exit 0 เสมอ — ไม่ใช่ gate)
- **EOL:** payload ที่ติดตั้งลง root dogfood ต้องเป็น **LF** — installer normalize ให้ตั้งแต่ 0.28.0 แล้ว; dogfood ที่ติดตั้งจากรุ่นก่อนหน้าอาจยังเป็น CRLF ทำให้ Workflow ปัดตก `build-wave.mjs` (`docs/troubleshooting.md` #30) → แก้ด้วย `npx @warnyin/agents --update`

## Runbook — `verify:pack` gate failure

`npm run verify:pack` มี error category หลายแบบ — แยกตาม prefix ของ error string เพื่อให้รู้วิธีแก้เร็ว:

| Prefix / category | อาการ | วิธีแก้ |
|---|---|---|
| `denylist รั่ว:` (prefix) | dev tooling (`src/tests/`, `src/scripts/`) หรืองานจริงของ repo (`docs/`, `.github/`) หลุดขึ้น tarball | ตรวจ `package.json` `files` field — ต้องไม่มี prefix เหล่านี้; dev tooling ห้าม publish |
| `denylist รั่ว (root dogfood):` | root `CLAUDE.md` / `AGENTS.md` (dogfood install) หลุดขึ้น tarball | canonical อยู่ `src/.warnyin/installer/templates/`; root copy เป็น dogfood gitignored — เช็ค `git check-ignore CLAUDE.md` |
| `tripwire รั่ว:` | `settings.local.json`, `*.tgz`, `.env*` หลุดขึ้น tarball | ลบไฟล์ออกจาก working tree + เพิ่ม `.gitignore` (ถ้ายังไม่มี); `.tgz` มาจาก `npm pack` ค้างใน dir |
| `ไฟล์นอก allowlist:` | ไฟล์นอก `ALLOWED_PREFIX` + `ALLOWED_FILE` หลุดเข้า tarball | ดู `src/scripts/verify-pack.mjs` `ALLOWED_PREFIX` — เพิ่ม prefix ใหม่ถ้าจำเป็น (เช่น nested dotfolder ใหม่) |
| `(R1) ... ไม่ติดใน package` | nested dotfolder (`src/.warnyin/workflow/`, `src/.claude/commands/warnyin/`, `src/.claude/skills/`, `src/.warnyin/template/docs/`) หายจาก tarball | เพิ่ม path ใน `package.json` `files` (nested dotfolder ต้องระบุชัด — npm ไม่รวมอัตโนมัติ) |
| `eol: ไฟล์ text มี CR N ครั้ง (...)` | text file ใน payload มี CR (`0x0D`) — checkout ก่อน 2026-07-14 (ก่อน `.gitattributes`) | renormalize: `git rm --cached -r . && git reset --hard` (commit/stash ก่อน; ลบงานค้างถาวร); dev หลัง 2026-07-14: ไม่ควรเจอ |
| `path: absolute path` | ไฟล์ใน payload เป็น absolute path | ตรวจ `npm pack --json` ว่ามี absolute path ไหม — ปกติไม่มี (npm pack ใช้ POSIX relative เสมอ); ถ้าเจอ → bug ของ upstream tooling |
| `path: มี segment ..` | path traversal — ไฟล์มี `..` ใน path | ตรวจ `npm pack --json` ว่ามี path ที่มี `..` ไหม (ปกติ npm pack ป้องกัน); ถ้าเจอ → bug ของ upstream |
| `path: symlink` | symlink หลุดเข้า payload | ตรวจ working tree ว่ามี symlink ใน `src/` ไหม — ลบ symlink + แทนด้วย file จริง |
| `stamp` (related — setup-dogfood) | `verifyInstalled` จับ stamp ไม่ตรง expected version | `npx @warnyin/agents --update` (refresh payload); หรือตรวจ `.warnyin/.warnyin-version` ใน target |

**ขั้นตอน debug เร็ว:**
1. ดู prefix ของ error แรก → หา category จากตาราง
2. `npm pack --dry-run --json --ignore-scripts` → ดู file list จริงที่ติด tarball
3. เทียบกับ `package.json` `files` field + `src/scripts/verify-pack.mjs` `ALLOWED_*` + `DENY_*`
4. แก้ → รัน `npm run verify:pack` อีกครั้ง

**Windows dev:** ถ้าเจอ `verify:pack: ต้องรันผ่าน npm run verify:pack` → ใช้ `npm run verify:pack` เท่านั้น (script ตรงไม่ตั้ง `npm_execpath` env var); ถ้าไม่มี Windows dev ในทีม → trigger `windows-latest` GitHub Actions workflow ad-hoc

## Runbook — `✖ [C7]` cap เอกสารเกิน

ผู้ใช้ที่รัน topic validator (`validate-topic.mjs`) แล้วเจอ error ที่ขึ้นต้นด้วย `✖ [C7]`:

**อาการ**
```
✖ [C7] design.md มี 131 บรรทัด เกิน cap 120 บรรทัด (tier: standard)
```
- exit code 1 (ปิดกั้นการ ship)
- prefix `✖ [C7]` ใช้เป็น identifier เพื่อให้ผู้ใช้ grep ได้

**สาเหตุ**

ตัดสิน error C7 ตามขนาด (tier) และเอกสารที่ส่ง:

| Tier | Document | Cap | หมายเหตุ |
|---|---|---|---|
| `fast` | `receipt.md` | ≤ 40 บรรทัด | งานเล็กที่จบในคำสั่งเดียว |
| `standard` | `proposal.md` | ≤ 60 บรรทัด | what & why ของ change |
| `standard` | `design.md` (ก่อน §9) | ≤ 120 บรรทัด | นับเฉพาะ **narrative** — บรรทัดก่อน section `## 9. Spec delta` เท่านั้น (delta เป็นเนื้อ spec ที่ถูก merge ออกตอน SHIP) |
| `large` | (ไม่มี cap) | — | ขนาดเป็น judgment ตาม `triage.md §2D` |

**วิธีแก้** — เลือก 1 ใน 3 ทาง:

1. **ย่อเอกสาร** — ตัด redundant / compress ให้อยู่ใน cap (แนะนำที่สุด)
   - เช่น proposal ยาว 65 บรรทัด → ลด 5 บรรทัด ให้เหลือ 60 ↓ ลบ spec ที่ไม่จำเป็น หรือ consolidate list

2. **ระบุ tier ให้ถูก** — ตรวจ `proposal.md` field `ขนาด` ว่าอ่านได้ไหม
   - กรณี `ขนาด=standard` แต่เอกสารใหญ่จริง ๆ → ย่อเสีย (ทำตามวิธี 1)
   - กรณี `ขนาด` ไม่ระบุหรืออ่านไม่ได้ → validator รายงาน `⚠ [C7]` (warn ไม่ block) — เติม field นั้นให้ครบเพื่อให้ cap ทำงาน

3. **ประกาศ tier `large`** — เมื่อ change ใหญ่จริงจนต้องเขียนเกิน cap
   - ใช้เมื่อ change เป็น greenfield / cross-cutting หลาย component ตามนิยาม `triage.md §2A`
   - กำหนด `ขนาด=large` ในช่อง `ขนาด` ของ `proposal.md` (tier นี้ไม่มี cap)
   - เป็นทางเลือกสุดท้าย — ประกาศ `large` เพื่อเลี่ยง cap ทั้งที่งานไม่ใหญ่จริง คือการหลบ gate

**ข้อระวัง**

- ⚠ `[C7]` (warn) = อ่าน tier ไม่ได้ → ข้ามเช็ค cap ไม่ block (fail-safe — บังคับ cap ผิด tier อันตรายกว่าไม่บังคับ)
- ✖ `[C7]` (error) = รู้ tier แล้วและเอกสารเกิน cap → **ต้องแก้** ก่อน ship
- **ห้ามแก้ตัวเลข cap ใน `triage.md §2D` หรือปิด gate เพื่อให้ผ่าน** (config-protection, `docs/rule.md §1`) — cap เป็นเกณฑ์ที่ตั้งใจไว้ ไม่ใช่ตัวเลขที่ปรับตามเอกสาร

**ตรวจสถานะ**

```bash
# อ่าน tier ที่ proposal ระบุ
grep -n '^| \*\*ขนาด\*\*' docs/stages/<slug>/proposal.md   # tier อยู่ใน cell ที่ 2 (ต้องมี backtick ค่าเดียว)

# นับบรรทัด proposal / design ก่อน §9
wc -l docs/stages/<slug>/proposal.md   # ต้อง ≤ cap ตาม tier
awk '/^## 9\. Spec delta/{exit} {n++} END{print n}' docs/stages/<slug>/design.md  # ≤ 120 สำหรับ standard (นับแบบเดียวกับ validator — sed|wc -l จะเกินจริง 2)
```
