# Business — Installer version stamp + drift-aware dogfood verify

> ความรู้ถาวรระดับ feature · promote จาก topic `setup-dogfood-version-check` (จาก GitHub issue #3, achieved 2026-06-12)

## 1. เป้าหมายเชิงธุรกิจ (what & why)
- **what:** ทำให้ `npm run setup:dogfood` จับได้จริงว่า payload ที่ติดตั้งเป็น **เวอร์ชันเก่า** (drift) — ไม่รายงาน "เสร็จ" ลวง; ฐานคือ installer เขียน version stamp ให้ payload มี identity
- **why:** false-green รอบ 2 (issue #3) — `verifyInstalled` ตรวจแค่ marker-existence → npx cache ส่ง payload เก่าก็ผ่าน → contributor ทำงาน/ทดสอบ workflow บน payload ผิดเวอร์ชันโดยไม่รู้ตัว; root cause = payload ไม่มี version identity เลย (ตรวจ drift ไม่ได้เชิงโครงสร้าง)
- **ผูก `docs/project.md`:** ตรงเป้าหมาย "publish แล้ว payload ติดครบ" + bootstrap 2-layer (dogfood = release เสถียรล่าสุดจริง) — setup:dogfood เป็น regen gate ที่เชื่อถือได้

## 2. Persona / ใครได้ประโยชน์
- **contributor / maintainer** — รัน `setup:dogfood` หลัง publish เพื่อ sync root dogfood; ได้ความมั่นใจว่า payload สดจริง (ไม่ stale เงียบ)
- **end-user (`npx @warnyin/agents`)** — ได้ version identity ของ payload ที่ติดตั้ง (`.warnyin/.warnyin-version`) ไว้ตรวจสอบ/เห็น diff bump ตอน `--update`
- **คุณค่า:** ปิดช่อง false-green ที่ marker-existence จับไม่ได้; trust ของ setup:dogfood ในฐานะ regen gate

## 3. Success metric (วัดผลได้)
- install/`--update` → `.warnyin/.warnyin-version` = เวอร์ชันที่ติดตั้งจริง (project + global)
- `verifyInstalled(root, expected)`: stamp ≠ expected → **false** (drift จับได้); stamp = expected → true; stamp ขาด → true (transition); `npm view` fail → degrade + warn loud
- `npm test` เขียวทั้ง suite (backward compat — เคสเดิมไม่พัง); stamp ไม่หลุดขึ้น tarball

## 4. ขอบเขตเชิงธุรกิจ / ข้อจำกัด
- **in:** version stamp writer (cli, project+global) · version-aware verify (setup-dogfood) · pin-exact + prefer-online กัน stale cache · transition-safe rollout
- **out:** auto-migrate payload เก่าที่ไม่มี stamp · multi-version tracking · เปลี่ยน install mode/contract เดิม
- **ข้อจำกัด:** zero-dep + cross-platform; drift-guard active เต็มหลัง ≥2 release ที่มี stamp (transition window); degrade เมื่อ offline (network เป็น dependency ของ setup:dogfood อยู่แล้ว)

## 5. ความเสี่ยง & การคุม
- **transition/bootstrapping** (registry latest ยังไม่มี stamp ตอน release แรก) → stamp ขาด = degrade marker-only (ไม่ false-fail) + pin-exact/prefer-online กัน stale ใน window นั้น
- **network dependency** (`npm view`) → degrade graceful + warn loud (offline = install fail เองอยู่แล้ว)
- **stamp parse เพี้ยน** (CRLF/stdout noise) → normalize สองฝั่ง + parse semver ผ่าน pure fn (กัน false-drift)
