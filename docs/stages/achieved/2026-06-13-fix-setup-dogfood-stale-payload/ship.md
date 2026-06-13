# Ship Report — fix setup:dogfood stale-payload

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`

| | |
|---|---|
| **Slug** | `fix-setup-dogfood-stale-payload` |
| **วันที่ ship** | `2026-06-13` |
| **Archive** | `docs/stages/achieved/2026-06-13-fix-setup-dogfood-stale-payload/` |
| **ประเภท** | bugfix (ขยาย scope ใน VERIFY → critical entrypoint fix) |

## 1. Feature: ปรับปรุง `installer-version-stamp` (เดิม)
ไม่ใช่ feature ใหม่ — ขยายมิติ **entrypoint resilience** + implement LR2 + cache-bust สมมาตร

**Spec delta merge** (`docs/features/installer-version-stamp/spec.md`):
| ชนิด | requirement / scenario | ผล |
|---|---|---|
| MODIFIED | "setup:dogfood จับ version drift" — scenario "stamp ขาด → transition" | แทนด้วย 2 scenario: stamp ขาด + expected ≥0.17.0 → false (active) · < 0.17.0 → transition true |
| ADDED | "setup:dogfood ดึง payload ใหม่ทน stale-cache + npx bin resolution" | 2 scenario (npx explicit bin · pack version-check ที่ source) |
| ADDED | "installer entrypoint resolve ถูกแม้ถูกเรียกผ่าน symlink" | 2 scenario (รันผ่าน symlink → main() ทำงาน · import → ไม่ trigger main) |

(read-modify-verify: ทุก MODIFIED key match requirement จริงใน spec.md — ไม่มี key หาย ไม่ STOP)

## 2. Learned-rules promoted (4/4 — user ยืนยันครบ)
| # | rule | ปลายทาง | evidence |
|---|---|---|---|
| 1 | LR2 implemented — verifyInstalled active เริ่ม 0.17.0 | `installer/rule.md` §dev tooling (LR2 entry) | verify.md + design §9 |
| 2 | dev-tooling fallback path ต้อง symmetric กับ primary | `installer/rule.md` §dev tooling | proposal §3 ชั้น A |
| 3 | ★ ESM main-guard ต้อง realpath argv[1] (พังเงียบเมื่อผ่าน symlink) | `installer/rule.md` §cli.mjs | TS-2 + verify (npx 0-bytes proof) |
| 4 | ★ black-box test ต้องมีเคสรันผ่าน symlink (real-path spawn = false-green) | `installer/test.md` (verify ESM entrypoint section) | verify RED proof |

ตัดทิ้ง: ไม่มี (ทุกตัวมี evidence ชัด)

## 3. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระ |
|---|---|
| `docs/features/installer-version-stamp/spec.md` | merge spec delta (1 MODIFIED + 2 ADDED requirements) |
| `docs/features/installer-version-stamp/feature.md` | องค์ประกอบ #2 active≥0.17.0, #4 cache-bust สมมาตร+checkTarballVersion, +#5 entrypoint resilience; ขอบเขต + ไฟล์ที่เกี่ยวข้อง |
| `docs/techstack/installer/rule.md` | §cli.mjs +rule #3 (main-guard realpath); §dev tooling +rule #1 (LR2 implemented) +#2 (fallback symmetric) |
| `docs/techstack/installer/test.md` | +section "verify ESM entrypoint / main-guard — รันผ่าน symlink" (rule #4 + self-referential e2e) |
| `docs/techstack/installer/structure.md` | cli.mjs export isEntrypoint + main-guard flow; setup-dogfood exports (semverGte/checkTarballVersion); test counts (installer 27, setup-dogfood 32); verifyInstalled truth table active |
| `docs/troubleshooting.md` | +#13 ESM main-guard symlink (root cause + วิธีแก้ + ป้องกันซ้ำ) |
| `docs/codemap/{index,architecture}.md` | cli.mjs isEntrypoint main-guard + setup-dogfood exports/flow; header rescan 2026-06-13 |

ไม่แตะ: `docs/rule.md` (ไม่มี project-scope rule), `docs/infra.md`/`docs/project.md` (ไม่มีข้อมูลใหม่)

## 4. ★ หมายเหตุ publish (สำคัญ)
fix ชั้น 0 (`cli.mjs` main-guard) เป็น **critical** — release ปัจจุบันบน registry (0.18.0) ยังมี bug → `npx @warnyin/agents` ของผู้ใช้ปลายทาง install เงียบไม่สำเร็จ. **ควร bump + publish รุ่นถัดไป (เช่น v0.18.1)** เพื่อปิด critical + ทำให้ setup:dogfood/npx ใช้งานได้จริง. VERIFY พิสูจน์ logic ด้วย local payload (fixed) แล้ว — e2e ผ่าน registry สมบูรณ์หลัง publish (self-referential)

## 5. โค้ด (merge เข้า main นอก workflow)
- `src/bin/cli.mjs` — `isEntrypoint` + main-guard
- `src/tests/installer.test.mjs` — +6 เคส (truth table + black-box symlink)
- (fix เดิม 3 ชั้นจาก BUILD: `src/scripts/setup-dogfood.mjs` + `src/tests/setup-dogfood.test.mjs`)

## Gate → ปิดสมบูรณ์
- [x] archive แล้ว (ไม่เหลือใน docs/stages/)
- [x] features/ สะท้อน feature ที่ปรับปรุง + spec delta merge (key match)
- [x] learned-rules พิจารณาครบ 4/4 (evidence + user ยืนยัน)
- [x] troubleshooting.md merge #13
- [x] techstack (rule/test/structure) + codemap อัปเดต
- [x] ship.md เขียนครบ
