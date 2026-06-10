# Infra / Local Environment

> service ที่ต้องรันสำหรับ dev/เทส + วิธีรัน + env vars (zero-service · bootstrap 2-layer)

## Service ที่ต้องรัน (local dev)
- ไม่มี service/DB/queue — repo เป็น zero-dependency node tooling (installer + playbook docs)
- ต้องมี **Node.js ≥20** (CI matrix: node 20/22/24) และ `npm`; fallback ของ `setup:dogfood` ต้องมี `tar` ในระบบ (Windows 10+/mac/linux มีอยู่แล้ว)

## วิธีรัน local
```bash
npm run setup:dogfood    # ติดตั้ง release เสถียรลง root (gitignored) — คืน dogfood env หลัง clone
npm test                 # black-box test installer (node --test, discover src/tests/*.test.mjs)
npm run verify:pack      # ตรวจ tarball ก่อน publish (payload ครบ + tooling/docs ไม่หลุด)
npm run setup:sandbox    # ติดตั้ง v-next จาก src/ ลง temp dir (ทดสอบ version skew)
```

## Env vars สำคัญ
- ไม่มี env var ที่จำเป็น (zero-config)

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
