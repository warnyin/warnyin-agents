# Test Plan — gitignore-dogfood-fix

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> ไม่มี `docs/techstack/` สำหรับ git-meta → verify ด้วยคำสั่ง git + fresh-clone simulation

## 1. จุดประสงค์ที่ต้อง verify
git state ตรง rule §6 จริง **และ src ไม่หาย** — พิสูจน์ว่า "clone ใหม่ได้ repo ที่ใช้งานได้ครบ" (จุดเสี่ยงสูงสุด = untrack เผลอทำ src หาย)

## 2. วิธีเทส (git-meta — ไม่มี service)
`git ls-files`/`git check-ignore` ใน working repo + **fresh-clone simulation** (clone build branch → temp → ตรวจ + build + setup:dogfood round-trip)

## 3. Test cases
| # | เคส | วิธี | คาดหวัง |
|---|---|---|---|
| V1 | dogfood untracked | `git ls-files` dogfood paths | 0 |
| V2 | **src ปลอดภัย (critical)** | `git ls-files src/` | 78 (skills 3, .warnyin 52) |
| V3 | anchoring | `git check-ignore` src vs root | src skills ไม่ match · root dogfood match |
| V4 | working tree คงอยู่ | `test -f` dogfood files | ยังบนดิสก์ (--cached ไม่ลบ) |
| V5 | git status สะอาด | `git status --short` | dogfood ไม่โผล่ |
| V6 | **fresh-clone sim** | `git clone . temp` → ตรวจ | src 78 ครบ · ไม่มี root dogfood · build/test เขียวบน clone |
| V7 | **regen round-trip** | `setup:dogfood` ใน clone | dogfood กลับมา + เป็น 0.8.4 (มี contexts/) + git status สะอาด |
| V8 | regression + payload | `npm test`/`verify:pack`/`npm pack` | 19/19 · 75 ไฟล์ · skills ติด tarball |

## 4. Env
- local macOS + node; ไม่มี service; setup:dogfood ดึง @latest จาก npm (network)
- temp ใช้ `mktemp -d` (ห้ามทำใน working tree)

## 5. หมายเหตุ (merge เข้า techstack/troubleshooting ตอน SHIP)
- เพิ่ม verify pattern **git-meta / bootstrap**: fresh-clone simulation เป็นหลักฐานชี้ขาด "untrack ไม่ทำ src หาย" + regen round-trip (setup:dogfood) พิสูจน์ 2-layer ครบวงจร
- บทเรียน anchoring (issue.md D1): mid-slash pattern (`.claude/skills/`) anchored root โดย default; trailing-slash (`.warnyin/`) match ทุก depth — entry ใหม่ต้อง `/`
