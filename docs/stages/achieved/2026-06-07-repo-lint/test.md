# Test Plan — repo-lint (zero-dep dead-link gate)

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> linter เป็น testing tool เอง → verify เชิง **behavioral/executable** (จับจริง + ไม่ false-positive) ไม่ใช่แค่ unit ผ่าน

## 1. จุดประสงค์ที่ต้อง verify
gate จับ dead-link จริง (positive) + ไม่ flag code-span/meta-doc (negative) + exclusion (template/archived) ทำงาน + zero-dep คง + ไม่กระทบ payload

## 2. วิธีเทส (executable + regression)
รัน `npm run lint:md` จริงบน repo + inject dead-link ชั่วคราว (temp file, ลบหลังเทส) พิสูจน์ pipeline ครบ (walk→read→check→exit); regression npm test/verify:pack

## 3. Test cases
| # | เคส | วิธี | คาดหวัง |
|---|---|---|---|
| V1 | baseline | `npm run lint:md` | 0 dead, exit 0 |
| V2 | **executable positive** | inject `[broken](./nope.md)` ใน `docs/_tmp.md` (scanned) | exit≠0 + error ระบุไฟล์ → ลบ temp |
| V3 | **negative (meta-doc)** | active stage `design.md`/`spec.md` (มี `[](...)`+`` ``` `` ใน code) | ไม่ flag (exit 0) |
| V4 | exclusion | `src/.warnyin/template/` + `docs/stages/achieved/` (มี dead-link จริงจาก pre-scan) | ไม่ถูก scan (lint เขียว) |
| V5 | unit | `npm test` | lint-md 7/7 |
| V6 | regression + payload | `npm test` / `verify:pack` / devDeps / tarball | 26/26 · 75 · `{}` · lint-md ไม่ ship |
| V7 | CI yaml | ตรวจ job lint-md | pinned SHA · no secrets · no npm-ci |

## 4. Env
- local macOS + node 24; ไม่มี service; CI ตรวจ yaml เชิงโครงสร้าง (รันจริงตอนเปิด PR)

## 5. หมายเหตุ (merge เข้า techstack/rule ตอน SHIP)
- เพิ่ม pattern verify **lint gate**: executable positive (inject dead-link → จับ) + negative (meta-doc/code-span ไม่ flag) — ไม่ใช่แค่ unit
- บทเรียน strip-code alternation (troubleshooting #1) — md-tooling ที่ strip nested code construct ต้อง alternation pass เดียว
