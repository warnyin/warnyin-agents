# Build log — build-log-narrative

> narrative timeline ของ BUILD fan-out — main loop เขียนหลังแต่ละ wave (เหตุการณ์สำคัญ ไม่ใช่ raw dump)
> สถานะ/ผลสรุปต่อ task → ดู build.md; ไฟล์นี้เล่า "ระหว่างทาง" (กลาง wave ที่ report ไม่ครอบ)

## Wave 1
### build-log-narrative — ✅ passed
- 🟢 start: รับ vertical slice (schema→compose→template→test); investigate ก่อนแก้ — RESULT_SCHEMA + `parallel()` flow ใน `build-wave.mjs` + วิธี main loop ดึง field (command `build.md:18` ดึง troubleshooting) เพื่อลอก pattern ให้ `events`
- 🤔 decision: เติม prompt เป็นข้อ **8.1** แทน renumber 9→10 — กัน conditional worktree block (`if(isolate)` ข้อ 9) เพี้ยน (ปิดความเสี่ยง D2 จาก dry-run)
- 🔴 error: `node --check build-wave.mjs` → Illegal return statement → ยืนยัน pre-existing ด้วย `git stash` (error เดียวกันบน HEAD) → เปลี่ยนไป validate schema ด้วย parse object literal (`new Function`) แทน → assert 8/8 ผ่าน
- ✅ done: `npm test` 58/58 (0 fail/skip), `lint:md` เขียว, template == design §3.2 exact-match, executable trace 5/5 proxy

## Full gate
- main loop รัน full gate ซ้ำบน build branch `build/build-log-narrative`: `npm test` → tests 58 / pass 58 / fail 0 / skip 0 (check-test-count ผ่าน pass==tests==58); `lint:md` → เขียว (81 ไฟล์ / 44 ลิงก์ resolve) — **0 รอบแก้** (เขียวรอบแรก)

---
> _หมายเหตุ self-dogfood (design §8 C):_ root dogfood (live `build-wave.mjs`) ยังเป็น release เก่าที่ schema ไม่มี `events` → sub-agent คืน events ผ่าน schema ไม่ได้ในรอบนี้ → main loop **กลั่น narrative เองด้วยมือ** จาก `summary`/`testResult`/`troubleshooting` ที่ agent คืน (= artifact จริงของ topic นี้ + พิสูจน์ canonical §3.2 ใช้งานได้); พฤติกรรม auto จะ active ใน repo นี้หลัง `--update`/release ถัดไป
