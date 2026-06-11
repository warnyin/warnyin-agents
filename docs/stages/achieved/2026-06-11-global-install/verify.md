# Verify Report — global-install

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`

| | |
|---|---|
| **Slug** | `global-install` |
| **Component** | `installer` (cli runtime + payload `.md`) |
| **วันที่** | 2026-06-11 |
| **ผลรวม** | ✅ **ผ่าน** — 16/16 empirical + test suite 66/66 |
| **จำนวนรอบการแก้ไข (fix iterations)** | **0** รอบ — ผ่านทุกเคสรอบแรก (BUILD full-gate + panel/dry-run จับไว้ก่อน) |
| **จำนวนจุดที่แก้** | 0 |

## 1. จุดประสงค์ที่ verify
`--global` ติดตั้ง adapter+playbook ลง `~/` ใช้ทุกโปรเจกต์ · per-project = default (backward compat) · ไม่ทำลายไฟล์ user ใน homedir · CI-safe (non-TTY ไม่ค้าง) · resolve playbook local-first→global · homedir guard

## 2. ผลการเทส
| # | Test case | ชนิด | ผล |
|---|---|---|---|
| D1 | global install → homedir | executable | ✅ `~/.warnyin/workflow/` + `~/.claude/commands/warnyin/` + `~/.claude/CLAUDE.md` marker `warnyin:global-note`+note + **skip scaffold** (ไม่มี docs/stages ใน HOME) |
| D2 | non-TTY CI-safe | executable | ✅ spawn pipe no-flag + timeout → exit 0 **ไม่ค้าง** → project (cwd) |
| D3 | ไม่ทำลายไฟล์ user | executable | ✅ `.claude/agents/my.md` คงอยู่ · user `CLAUDE.md` prefs คงอยู่ (note append ต่อท้าย ไม่ทับ) |
| D4 | idempotent (รัน 2 ครั้ง) | executable | ✅ marker เดียว — note ไม่ append ซ้ำ |
| D5 | local override wording | structural | ✅ resolution (local-first→global) ครบ CLAUDE.md + AGENTS.md + CLAUDE.global.md(note-only+marker) |
| D6 | backward compat (project default) | regression | ✅ no-flag/non-TTY → `.warnyin/`+`docs/stages/` ลง cwd (พฤติกรรมเดิม) |
| D7 | homedir guard | executable | ✅ `HOME=/ --global` → exit ≠ 0 (ไม่เขียน filesystem root) |
| D8 | RQ2 Claude Code โหลด `~/.claude` | structural/by-design | ✅ ไฟล์ลง `~/.claude/commands/warnyin/` ถูกที่ + documented user-level loading (ยืนยันต้นเซสชัน: command โผล่หลังลง `.claude/` ผ่าน setup:dogfood) |
| — | full test suite | functional | ✅ `node --test` **66/66** (9+8 installer + อื่นๆ, 0 regression) · `lint:md` 100 ไฟล์ · `validate-topic` ✓ |

## 3. UX/UI verify
- N/A — ไม่ใช่ frontend (capability = CLI install + payload `.md`; verify ด้วย black-box spawn + executable install proof ตาม `docs/techstack/installer/test.md`)

## 4. รายการแก้ไข
| รอบ | ปัญหา | วิธีแก้ | ไฟล์ |
|---|---|---|---|
| — | ไม่มี | — | — |

> 0 รอบ — blocker/edge ถูกจับและปิดที่ DESIGN panel (4 blocker) + dry-run (6 defer) + BUILD full-gate ก่อนถึง VERIFY

## 5. ปัญหายาก/ซ้ำ → troubleshooting
- ไม่มีใหม่ที่ VERIFY. ของ BUILD: `./troubleshooting.md` TS-1 (export-function Workflow loader) · TS-2 (verify:pack Windows = ซ้ำ #4)

## 6. หมายเหตุถึง user
- D8 (Claude Code โหลด `~/.claude/{commands,CLAUDE.md}` global) — โครงสร้างไฟล์ถูก + เป็น documented behavior ของ Claude Code (user-level scope); การยืนยัน "เปิด session จริงในโปรเจกต์อื่นแล้ว `/warnyin:*` โผล่" เป็น manual ที่ user ลองได้หลัง release (เหมือน per-project ที่พิสูจน์แล้วต้นเซสชัน)
- defer-B (homedir falsy `''`) — ใช้เคส root-path เป็นตัวหลัก (deterministic), `''` best-effort — guard ครอบ root-path ผ่าน

## ✅ Gate → SHIP (verify.md ข้อ 6)
- [x] เทสตามจุดประสงค์ครบ (functional + executable D1-D8)
- [x] regression: project mode (default) เขียว · test suite 66/66 · ไม่มี feature-spec baseline (feature `global-install` สร้างตอน SHIP)
- [x] FE UX/UI: N/A
- [x] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่าน (0 รอบ — ไม่มี fail)
- [x] test.md + verify.md เขียนครบ
- [x] ปัญหายากบันทึก troubleshooting.md แล้ว (TS-1/TS-2 จาก BUILD)
