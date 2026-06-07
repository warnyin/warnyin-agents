# Build — security-checklist

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`

## 1. Execution plan ที่เดิน
- **DAG:** 1 wave / 1 task (`add-security-checklist` — ไม่มี dependency)
- **Isolation:** shared-tree (`isolate:false`) — main loop commit ให้
- **Build branch:** `build/security-checklist` (จาก main)

## 2. ผลต่อ task
| Task | สถานะ | test | ไฟล์ที่แก้ |
|---|---|---|---|
| `add-security-checklist` | ✅ passed | npm test 18/18, verify:pack 72 ไฟล์ | `roles/security.md`, `stages/verify.md`, `install-skill.md` |

**สิ่งที่ทำ (canonical wording จาก design §2):**
- `roles/security.md` — +section "Runtime / operational security" (P1 secret isolation + P2 no unnecessary egress + P3 identity separation + Claude adapter note) ต่อจาก Checklist ก่อน Output; +checklist item S1 (supply-chain/MCP = prompt-injection surface); เสริม Lens "supply chain" เดิมให้ครอบ skill/MCP/payload
- `stages/verify.md` §2 — +reference (point 5) ชี้ runtime security ตอนรันเทส local env ที่มี secret จริง
- `.claude/commands/warnyin/install-skill.md` step 4 — +warning prompt-injection (ไม่ลบ wording เดิม)
- global bullet "agent-runtime security baseline" → note ใน `tasks/add-security-checklist/rule.md` §2 (รอ SHIP → `docs/rule.md` §3)

## 3. Full build & test gate (หลัง integrate)
- ✅ `npm test` = **18/18 pass** (fail 0) — ไม่กระทบ test เดิม
- ✅ `npm run verify:pack` = **ผ่าน 72 ไฟล์** (payload `install-skill.md` ติด tarball ถูกต้อง)
- ✅ structural grep: "Runtime / operational security" / secret isolation / egress / identity separation ใน `security.md`, reference ใน `verify.md` §2, "prompt-injection" ใน `install-skill.md` step 4
- ✅ section placement ถูกต้อง (หลัง Checklist ก่อน Output); Lens "supply chain" เสริมไม่ทับ app-security เดิม

## 4. Integration notes
- shared-tree, แตะเฉพาะ `src/` (3 ไฟล์ payload) — ไม่แตะ `docs/rule.md` central, ไม่แตะ root dogfood (รอ release ตาม design §9)
- ไม่มี conflict · 0 รอบแก้ (gate เขียวรอบแรก)
- commit: `965942b` บน `build/security-checklist`

## 5. Gate → VERIFY
- [x] ทุก task implement + merge เข้า build branch
- [x] ทุก task `passed` — ไม่มี failed ค้าง
- [x] ไม่มี merge conflict
- [x] full build ผ่าน (doc-only — ไม่มี build step; verify:pack = packaging gate)
- [x] test suite เขียวทั้งหมด (18/18)
- [x] `build.md` สรุปครบ
- [x] ไม่แตะ rule/standard กลางใน `docs/` (global bullet note รอ SHIP)

→ พร้อมเข้า VERIFY ด้วย `/warnyin:verify security-checklist`
