# Dry-run issue — cli-global-mode

> ผล dry-run (read-only, 2026-06-11) · **verdict: GO** (0 blocker / 3 defer)

## Blocker
- **ไม่มี** — async-wrap ปลอด regression (process แยก, เคส 1-9 เห็นแค่ exit/stdout/side-effect) · harness env-override ทำได้ผ่าน `spawnSync({env})` (ไม่ต้อง mock import — black-box) · pass-count gate ไม่กระทบ (เพิ่มเคสใหม่, ห้าม skip) · homedir override ผ่าน env (POSIX HOME / Windows USERPROFILE)

## Defer (track)
| # | defer | สถานะ/แก้ |
|---|---|---|
| A | `installGlobalNote()` อ่าน `CLAUDE.global.md` (T2) — worktree เดี่ยวยังไม่มี | ✅ **fold แล้ว** → design §3E + task §3.5: **defensive skip** `if(!fs.existsSync(src)) return` (pattern copyTree/seedDocs); เคส note-marker พิสูจน์ที่ **full-gate** หลัง merge T2 |
| B | test เคส homedir falsy `''` ไม่ deterministic ทุก platform (OS fallback) | ใช้เคส **root-path** เป็นตัวหลัก trigger guard (deterministic); `''` = best-effort → track VERIFY (§8 empirical 7) |
| C | `--global --update` byte-equal assert พึ่ง note จาก T2 (ผูก defer A) | พิสูจน์ที่ full-gate หลัง merge T2 |

## สรุป
ไม่มี blocker — implement ตาม spec ได้บนโค้ดจริง ไม่ขัด task อื่น (file disjoint). BUILD agent ใส่ defensive skip (defer A) ให้ worktree เดี่ยวเทสเขียว
