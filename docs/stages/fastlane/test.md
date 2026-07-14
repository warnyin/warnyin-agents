# Test Plan — feature fastlane (`/warnyin:fastlane`)

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> topic นี้เป็น **workflow-payload change** (ไม่มี runtime service / UI / API / openapi.yaml) →
> "real env" = พิสูจน์ว่า **installer ส่งมอบ + wire executor จริง** ในโปรเจกต์ที่ติดตั้งจริง (ไม่ใช่แค่ unit test บน src)

## Env
- ไม่มี service ต้องรัน (`docs/infra.md` N/A สำหรับ payload change)
- real env = `node src/scripts/setup-sandbox.mjs` → รัน installer v-next ลง temp dir สะอาด → ตรวจผลลัพธ์ที่ถูกส่งมอบ

## จุดประสงค์ที่ต้อง verify (จาก design.md + tasks)
1. **ส่งมอบได้:** executor 2 ไฟล์ (`fastlane.md` playbook + command adapter) ลงในโปรเจกต์ที่ติดตั้ง
2. **discoverable:** ปรากฏใน registry ที่ user เห็น (CLAUDE.md slash-command list, capability tree) — description ตรง C4
3. **wired เข้า policy:** triage skip-list มี executor pointer (C15) + hard-floor override (C16) โดย **heading `## Fast-track skip-list` ไม่เปลี่ยน** (anchor 5 จุด)
4. **single-source คงไว้:** fastlane.md ไม่ลอกกฎ (5 หมวด hard-floor / config-protection) — ชี้ triage/build แทน
5. **regression:** skip-list 4 row เดิม + link `#fast-track-skip-list` ใน 4 stage ไม่พัง; triage command ยัง read-only

## Test cases

| # | Case | วิธี | ผล |
|---|---|---|---|
| V1 | executor 2 ไฟล์ถูกส่งมอบ | sandbox install → `ls .claude/commands/warnyin/fastlane.md` + `.warnyin/workflow/fastlane.md` | ✅ ทั้งคู่มี |
| V2 | C4 อยู่ใน CLAUDE.md registry ที่ user เห็น | grep C4 ใน sandbox `CLAUDE.md` | ✅ พบ 1 |
| V3 | capability tree มี entry FASTLANE | grep `fastlane.md` ใน `.warnyin/workflow/README.md` | ✅ พบ |
| V4 | C15 executor pointer + heading skip-list เดิม | grep `warnyin:fastlane` + `## Fast-track skip-list` ใน triage.md | ✅ pointer บรรทัด 77, heading บรรทัด 66 เดิม |
| V5 | command frontmatter description = C4 verbatim | grep `description:` ใน command adapter | ✅ ตรงคำต่อคำ |
| V6 | single-source + regression (structural) | `node --test` (fastlane.test.mjs B1-F4 + installer A1/A2) | ✅ 149/149 |
| V7 | payload integrity (dead-link/pack) | `lint:md` + `npm pack --dry-run` | ✅ 138 ไฟล์/89 ลิงก์ · pack 102 ไฟล์ |

## หมายเหตุ
- **regression baseline** `docs/features/change-sizing/spec.md`: scenario เดิม (skip-list 4 row) ยังผ่าน (V6 F1-F4). scenario ใหม่ (one-shot fast lane) = Spec delta `design.md §9` — spec กลางจะ merge ตอน SHIP (ตอนนี้ยัง "no one-shot" ตาม baseline เดิม ถูกต้อง เพราะยังไม่ ship)
- ไม่มี FE → UX/UI verify N/A · ไม่มี `openapi.yaml` → contract validation N/A
