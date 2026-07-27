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
