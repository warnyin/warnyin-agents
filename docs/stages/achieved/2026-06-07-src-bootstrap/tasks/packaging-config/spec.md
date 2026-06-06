# Spec — packaging-config

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะ task — เน้นหัวข้อที่เกี่ยวกับ packaging/CI · ที่มา: `../design.md` §2 slice2, §4.3, §4.4, §9 BL-1/BL-4 · `../proposal.md` §7 R1/R2

## 1. ชนิดของ task
`infra/packaging` — คุม **publish config** (`package.json files`/`bin`/`scripts.verify:pack`) + pack-verify gate (`src/scripts/verify-pack.mjs`) + CI job pack-verify (`.github/workflows/ci.yml`)

---

## 4. Data-flow (= ไฟล์ที่ publish ขึ้น tarball)
> contract ของ task นี้คือ **เซตไฟล์ที่ไหลขึ้น npm package** ต้องตรง 3 ชั้นพร้อมกัน (allowlist `files` → npm pack → verify-pack gate)

```
package.json `files` (allowlist) ──▶ npm pack --dry-run --json ──▶ tarball payload
                                                              └──▶ src/scripts/verify-pack.mjs (gate: allow/deny/assert)
```

**ต้องติด tarball (payload ผู้ใช้):**
- `src/bin/` (cli.mjs)
- `src/.warnyin/` (workflow + template + installer/templates/CLAUDE.md) — **dotfolder nested, ระบุชัด (R1)**
- `src/.claude/commands/` (warnyin/), `src/.claude/agents/` — **dotfolder nested, ระบุชัด (R1)**
- `src/AGENTS.md`
- npm always-include: `package.json`, `README.md`, `CHANGELOG.md`, `LICENSE`

**ห้ามหลุด (denylist):**
- dev tooling: `src/tests/`, `src/scripts/` (R2)
- งานจริง/CI ของ repo: `docs/`, `.github/`
- installed dogfood ที่ root (topic นี้สร้างเอง): `^.warnyin/`, `^.claude/`, root `CLAUDE.md`/`AGENTS.md`
- tripwire: `settings.local.json`, `*.tgz`, `.env*`

**`files` allowlist (granular — §4.3):**
```json
["src/bin","src/.warnyin","src/.claude/commands","src/.claude/agents","src/AGENTS.md","README.md","CHANGELOG.md","LICENSE"]
```
- **ตัด** `src/tests`, `src/scripts` (R2 — dev-only)
- root `CLAUDE.md`/`AGENTS.md` ไม่อยู่ใน list (เป็น dogfood gitignored; payload AGENTS.md = `src/AGENTS.md`)

## 6. Persona
`Infra / Tech Lead` ที่ publish package — ต้องมั่นใจว่า tarball ผู้ใช้ได้ payload ครบ + ไม่มี tooling/งานจริง/dogfood รั่ว ก่อน `npm publish`

## 7. Test-flow (รวม R1/R2/BL-4)
> verify-pack เป็น gate ก่อน publish — ต้องพิสูจน์ทั้ง "ติดครบ" และ "denylist จับจริง"

- [ ] **R1 nested dotfolder ติดครบ:** `npm pack --dry-run --json` → payload มี `src/.warnyin/workflow/` **และ** `src/.claude/commands/warnyin/` (2 ก้อน) → verify-pack `hasWarnyin && hasClaude` ผ่าน
- [ ] payload มี `src/AGENTS.md`, `src/bin/cli.mjs`
- [ ] **R2 leak guard:** ไม่มี `src/tests/`, `src/scripts/`, `docs/`, `.github/` ใน payload
- [ ] tripwire: ไม่มี `settings.local.json`, `*.tgz`, `.env*` ใน payload
- [ ] **BL-4 testable denylist (กัน gate ลวง):** unit ป้อน `files[]` ปลอมที่มี `src/tests/x.test.mjs` → ฟังก์ชันตรวจคืน `errors[]` ไม่ว่าง (denylist จับได้จริง ไม่ใช่เขียวเพราะ allowlist ปิดอยู่แล้ว)
- [ ] BL-4 บวก: ป้อน `files[]` ปลอมที่ขาด `src/.warnyin/workflow/` → คืน error (hasWarnyin assertion ทำงาน)
- [ ] **BL-1 CI:** `.github/workflows/ci.yml` job pack-verify เรียก `npm run verify:pack` (ไม่ hardcode path); `npm test` step ยังถูก
- [ ] `npm run verify:pack` ใน repo จริงผ่าน (exit 0, payload ครบ)
