# Infra / Local Environment

> service ที่ต้องรันสำหรับ dev/เทส + วิธีรัน + env vars
> ★ seed (กัน docs collision จาก dogfood install) — เนื้อหาเต็ม promote ตอน SHIP ของ topic `src-bootstrap`

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

## Runbook — transition `src/` restructure (topic src-bootstrap, design §5.3)
ลำดับ one-time ตอนแยก source → `src/` + เปิด dogfood (ทำครั้งเดียว):
1. publish 0.6.0 (main, `.warnyin/` layout) ขึ้น npm = dogfood baseline
2. `git mv` source ทั้งหมด → `src/` (bin/tests/scripts/.warnyin/.claude/AGENTS.md)
3. `git mv CLAUDE.md CONTRIBUTING.md` + rewrite (dev focus)
4. แก้ `package.json` (bin→src/bin/cli.mjs, files allowlist, scripts) + `src/scripts/verify-pack.mjs`
5. เพิ่ม `.gitignore` dogfood layer (root-anchored ทุกบรรทัด)
6. `npm test` เขียว + `npm run verify:pack` ผ่าน
7. `npm run setup:dogfood` → คืน dogfood env ที่ root (gitignored, จาก release)
8. bump version → 0.7.0 + CHANGELOG

## กฎ infra: npm scripts ต้อง cross-platform
- npm scripts ที่เป็น dev tooling (`setup:*`) ต้องเป็น **node script** (`node src/scripts/*.mjs`) ไม่ใช่ shell oneliner ที่ผูก POSIX
- ใช้ `os.tmpdir()` (ห้าม hardcode `/tmp`), `path.join` (ห้าม `/` literal), spawn array args (ห้าม `shell:true` ยกเว้น npx บน Windows ที่เป็น `.cmd`)
- เผื่อ Windows: npx bin-shim อาจ resolve ไม่ได้ → ต้องมี fallback (npm pack + node) หรือ exit ด้วย error ชัดเจน
