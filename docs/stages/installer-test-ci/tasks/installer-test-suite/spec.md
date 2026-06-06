# Spec — installer-test-suite

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`infra / test` (black-box integration test ของ CLI)

## 4. Data-flow
`node:test` → `runCli` spawn `process.execPath bin/cli.mjs` (cwd=temp) → `cli.mjs` อ่าน source จาก repo (`pkgRoot` จาก `import.meta.url`) เขียนลง temp → test อ่าน temp กลับมา assert → `t.after` ลบ temp

## 6. Persona
ผู้พัฒนา/maintainer ของ Warnyin — รัน `npm test` ก่อน push และให้ CI รันบน PR

## 7. Test-flow

### Harness (contract `design.md` §3)
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'   // sync = อ่านง่าย, เคสไม่เยอะ
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'         // ★ B1: ต้อง import

// ★ B1 (dry-run verify): ใช้ fileURLToPath ตรง ๆ — ห้ามใช้ `.pathname`
// บน Windows `.pathname` คืน `/D:/...` (ไม่เคย null → `??` ไม่ fallback) → spawn MODULE_NOT_FOUND
const cliPath = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))
function makeTempProject(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))  // cleanup แม้ fail
  return dir
}
function runCli(cwd, args = []) {
  const r = spawnSync(process.execPath, [cliPath, ...args],
                      { cwd, encoding: 'utf8' })   // array args — ห้าม shell:true
  return { code: r.status, stdout: r.stdout, stderr: r.stderr }
}
```
> **★ B2 (dry-run verify):** เคส 5/6 — copy string จาก `bin/cli.mjs` **ตรง ๆ** (`cli.mjs:55` และ `:43`) ห้ามพิมพ์ใหม่: `–` ใน `(0.3–0.5.x)` เป็น **en-dash U+2013** (ไม่ใช่ hyphen `-`), `≤` ใน `(≤0.2.x)` เป็น **U+2264** — พิมพ์ผิด codepoint → `includes()` ไม่เจอ → test แดง

### เคสที่ต้องผ่าน (ครบ 8 — อ้าง `design.md` §4; assert `code===0` ก่อนเสมอ + surface `stderr` เมื่อ fail)
- [ ] **1. ติดตั้งสด** — `runCli(tmp)` → `code===0`; มี `.warnyin/workflow/`, `.warnyin/template/`, `.claude/commands/warnyin/`, `docs/stages/`, `docs/project.md`, `CLAUDE.md`, `AGENTS.md`
- [ ] **2. idempotent** — รัน 2 ครั้ง → ครั้ง 2 `code===0`; `stdout` มี "ข้าม"; ไฟล์ตัวอย่าง byte-equal กับรอบแรก; `CLAUDE.md`/`AGENTS.md` ขนาดไม่โต (ไม่ append ซ้ำ) — **ห้าม assert mtime**
- [ ] **3. `--update` ไม่ทับงานจริง** — ติดตั้ง → แก้ `docs/project.md` + สร้าง `docs/stages/demo/x.md` → `runCli(tmp,['--update'])` → `docs/project.md` ยังเป็นค่าที่แก้; `docs/stages/demo/x.md` ยังอยู่; `CLAUDE.md` ไม่ถูก append section ซ้ำ
- [ ] **4. `installRootDoc` append** — สร้าง `CLAUDE.md` เดิม (`# My Project\n...` ไม่มี marker) → `runCli` → `code===0`; `CLAUDE.md` มี `## Warnyin Standard Workflow`; รันซ้ำ → ไม่ append อีก
- [ ] **5. legacy 0.3–0.5.x** — temp มี `warnyin/workflow/` → `runCli(tmp,['--dry-run'])` → **`stderr`** มี `พบโครงเลย์เอาต์เก่า (0.3–0.5.x)` และ `git mv warnyin/stages docs/stages`
- [ ] **6. legacy ≤0.2.x** — temp มี `workflow/` + `warnyin-stages/` ที่ root → `runCli(tmp,['--dry-run'])` → **`stderr`** มี `พบโครงเลย์เอาต์เก่า (≤0.2.x)` และ `git mv warnyin-stages docs/stages`
- [ ] **7. `seedDocs` ข้าม `[...]`** — หลังติดตั้งสด → **ไม่มี** entry ใต้ `docs/` ที่ชื่อขึ้นต้น `[`
- [ ] **8. `--dry-run` ไม่เขียนไฟล์** — `runCli(tmp,['--dry-run'])` ใน temp เปล่า → `code===0`; `stdout` มี `+ `; temp ยังว่าง (ไม่มี `.warnyin`/`docs`/`CLAUDE.md`)

### Edge case ที่ต้องระวัง
- cross-platform path (Windows `\` ↔ Linux `/`) — assert ด้วย `path.join`/`existsSync` ไม่ใช่ string ดิบ
- cleanup เมื่อ fail (`t.after` ลงทะเบียนก่อน assert)
- spawn ด้วย `process.execPath` ไม่ใช่ `'node'`
- **จงใจไม่ครอบ:** guard `pkgRoot===target` (`cli.mjs:35-38`) — dead branch ในมุม black-box
