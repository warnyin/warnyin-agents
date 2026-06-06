# Standard — packaging-config

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern ที่ task นี้ยึด · อิง `docs/techstack/installer/standard.md` (pack-verify) + `../design.md` §4.4

## 1. Standard กลางที่ยึด (จาก techstack)
> `docs/techstack/installer/standard.md` → หัวข้อ pack-verify + CHANGELOG
- **pack-verify pattern:** parse `npm pack --dry-run --json` ด้วย **node script** (cross-runner — ไม่ใช่ shell `grep`); assert `.warnyin/workflow/` ติด + ไม่มี `docs/` หลุด + ไม่มีไฟล์นอก allowlist
- path ทุกที่ใช้ `path`/string prefix แบบ POSIX (`/`) ตามที่ `npm pack --json` คืนมา (forward slash เสมอ ทุก OS)
- **zero-dep, ESM** (`docs/rule.md` §2): ใช้ `node:child_process` (`execFileSync`) เท่านั้น; spawn array args ห้าม `shell:true`
- ข้อความ log/error เป็นภาษาไทย (`✓`/`✖`) ตามสไตล์เดิม

## 2. Pattern การเขียนโค้ดของ task นี้
- **prefix-based allowlist/denylist** (เดิม): allow = `p.startsWith(prefix)` หรือ `ALLOWED_FILE.includes(p)`; deny = `p.startsWith(denyPrefix)`
- **constant ที่ปรับ (§4.4):**
  - `ALLOWED_PREFIX = ['src/bin/','src/.warnyin/','src/.claude/commands/','src/.claude/agents/']` — narrow `src/.claude/` เหลือ 2 subdir ให้ตรง `files` (กัน `src/.claude/skills`/`settings.local.json` หลุดอนาคต)
  - `ALLOWED_FILE = ['package.json','README.md','CHANGELOG.md','LICENSE','src/AGENTS.md']`
- **assertion 2 ก้อน (R1):** `hasWarnyin = files.some(p => p.startsWith('src/.warnyin/workflow/'))` **และ** `hasClaude = files.some(p => p.startsWith('src/.claude/commands/warnyin/'))` — ต้องติดทั้งคู่
- **denylist FAIL:** `src/tests/`, `src/scripts/`, `docs/`, `.github/`, root dogfood (`.warnyin/`, `.claude/`, root `CLAUDE.md`/`AGENTS.md`), tripwire (`settings.local.json`, `*.tgz`, `.env*`)
- error handling: เจอ violation ใดๆ → `console.error('✖ ...', detail)` + `process.exit(1)`; ผ่านครบ → `console.log('✓ pack-verify ผ่าน:', n)`

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- โค้ดเดิม `scripts/verify-pack.mjs` (จะถูก git mv → `src/scripts/verify-pack.mjs` ใน T1) — **ต่อยอด ไม่เขียนใหม่ทั้งก้อน**
- npm `bin` resolve: `pkgRoot=src/` (T1 ทำแล้ว) — task นี้ไม่แตะ cli

## 4. เพิ่มเติมเฉพาะ task — refactor BL-4 (testable denylist)
> ความรู้ใหม่ที่ task นี้แนะนำ; ถ้าเป็นมาตรฐานกลางให้ note ใน `rule.md` (รอ SHIP)
- **แยกฟังก์ชันตรวจออกจาก I/O:** export ฟังก์ชันบริสุทธิ์ `checkFiles(files: string[]) => errors: string[]` (allow/deny/assert ทั้งหมดอยู่ในนี้, ไม่เรียก `npm pack`) — main เรียก `npm pack --dry-run --json` แล้วป้อน `files[]` เข้า `checkFiles`
- เหตุผล: unit ป้อน list ปลอม (มี `src/tests/`) → assert `errors` ไม่ว่าง → พิสูจน์ denylist ทำงานจริง (กัน "gate ลวง" ที่เขียวเพราะ allowlist ปิดอยู่แล้ว)
- หมายเหตุ: นี่เป็น **dev tooling** (`src/scripts/`) ไม่ใช่ `bin/cli.mjs` → ข้อห้าม "ห้าม refactor target เพื่อ testability" (`docs/rule.md` §5, ใช้กับ installer black-box) **ไม่ครอบ** verify-pack — แยก pure function ได้
