# Test Plan — security-checklist

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> ชนิด: payload `.md` ล้วน (`src/.warnyin/workflow/` + `src/.claude/commands/`) — verify เชิงโครงสร้าง + executable install proof + consistency (guideline `docs/techstack/installer/test.md` §"verify feature ที่เป็น payload `.md` ล้วน")

## วิธีเทส
รัน local: `npm test`, `npm run verify:pack`, `npm run setup:sandbox` (install src/ → temp ผ่าน cli.mjs) — **ห้ามรัน cli.mjs ที่ cwd=repo root** (dogfood leak #6)

## เคสเทส
| # | เคส | วิธี | คาดหวัง |
|---|---|---|---|
| T1 | functional regression | `npm test` + `verify:pack` | 18/18 + 72 ไฟล์ (ไม่มี assertion เดิมพัง, payload ติด tarball) |
| T2 | executable install proof | `setup:sandbox` → grep target | runtime section + S1 + verify reference + install-skill warning ลงครบผ่าน cli.mjs; **root dogfood ไม่โดนแตะ** |
| T3 | ครบทุก enforce point | grep 3 ไฟล์ + rule.md §2 | security.md (section+S1+Lens) · verify.md §2 ref · install-skill step 4 · global note |
| T4 | 3-way consistency | grep "prompt-injection surface" 3 จุด | security.md ↔ install-skill ↔ rule.md §2 ตรงกัน (canonical design §2) |
| T5 | portable preserved (D3) | grep Claude note marker | Claude adapter note ระบุชัด "ตัวอย่างเฉพาะ Claude Code — harness อื่นปรับเทียบ" (ไม่ใช่ rule หลัก) |
| T6 | ไม่ duplicate app-security | อ่าน section + Lens | runtime = section แยก (คนละมิติ); Lens "supply chain" เสริมไม่ทับ app-security เดิม |
| T7 | dead-link | resolve path ที่ verify.md อ้าง | `.warnyin/workflow/roles/security.md` → ไฟล์จริงมีอยู่ |
| T8 | global note พร้อม SHIP | อ่าน rule.md §2 | bullet "agent-runtime baseline" รอ promote → docs/rule.md §3 |

## local env
ไม่มี service — doc/payload ล้วน; executable proof ใช้ setup:sandbox (temp dir, ไม่แตะ root)
