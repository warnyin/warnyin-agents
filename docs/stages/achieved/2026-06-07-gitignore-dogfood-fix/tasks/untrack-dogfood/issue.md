# Issue — untrack-dogfood (จาก dry-run 2026-06-07)

> ผล dry-run (read-only) ก่อน BUILD · **ไม่มี hard blocker** — implement ตาม spec ได้ปลอดภัย
> พิสูจน์จริง: `git rm --cached --dry-run` = 64 ไฟล์ **src/ = 0**; src baseline = 78 (รวม `src/.claude/skills/` 3, `src/.warnyin/` 52); anchoring `/​.warnyin/`+`/.claude/` กัน src ได้ 100% (isolated repo test: `git add -A` แล้ว src survive ครบ); fresh-clone sim ทำได้จริง

## D1 (ต้องแก้เอกสาร — ไม่ใช่ implementation blocker): เคลม "latent skills-leak" ผิด
| | |
|---|---|
| **อาการ** | proposal §2 + design §6 + discovery + research เคลมว่า `.gitignore:20 .claude/skills/` ไม่ anchored → match `src/.claude/skills/` → skill ใหม่หลุดเงียบ ("ระเบิดเวลา") |
| **หลักฐานว่าผิด** | `git check-ignore src/.claude/skills/explore/SKILL.md` → **exit 1 (ไม่ match)**. git spec: pattern ที่มี separator **กลาง** (`.claude/skills/`) = anchored to repo root โดย default → ไม่ recurse เข้า `src/` |
| **ผลกระทบ** | การเปลี่ยน `.claude/skills/` → `/.claude/` **ไม่ได้ "ปิด bug"** (ไม่ leak อยู่แล้ว) — แต่ยัง correct (รวบ root `.claude/` เป็นก้อนเดียว) |
| **แก้** | reframe เหตุผลทุกที่: latent-skills-leak **ไม่มีจริง**; justification ที่แท้คือ (a) **dogfood tracked ทั้งที่ rule §6 ห้าม** + (b) **`.gitignore` ไม่มี dogfood entries เลย** + (c) **drift** |
| **สถานะ** | [x] แก้ proposal/design/discovery/research แล้ว |

## หมายเหตุ anchoring (ความจริงที่ถูกต้อง — ป้อนเข้า design)
- **`.warnyin/` / `.claude/` (trailing-slash, ไม่มี separator กลาง)** → match ที่ **ทุก depth** รวม `src/.warnyin/`, `src/.claude/` → **ต้อง anchor `/`** จริง (entry ใหม่เราถูกต้อง)
- **`.claude/skills/` (มี separator กลาง)** → anchored root อยู่แล้ว → ไม่ leak (เคสนี้ที่ผมเคลมผิด)
- rule §6 example (`.claude/agents/` "ถ้าไม่ anchor จะ match src") เองก็ **คลาดนิด** (mid-slash anchored แล้ว) — แต่หลัก "anchor ให้ explicit" ยังดี; พิจารณา note ตอน SHIP

## Defer
- **D2 (note, นอก scope):** root `.warnyin/` working tree ไม่มี version marker → พิสูจน์ "0.7.0→0.8.4 หลัง setup:dogfood" ตรง ๆ ไม่ได้; VERIFY รัน `setup:dogfood` แล้ว assert usable แทน (design §5)
- **D3 (emergent, รอ SHIP):** CI guard กัน dogfood leak ซ้ำ (`git ls-files .warnyin/ .claude/{commands/warnyin,agents}`=0) — task rule.md §2 ระบุแล้ว "พิจารณา SHIP"

## สถานะ
- [x] แก้ docs ตาม D1 (เคลม latent-leak → justification จริง)
- ไม่มี blocker ค้าง → พร้อม BUILD
