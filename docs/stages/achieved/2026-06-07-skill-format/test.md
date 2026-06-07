# Test Plan — skill-format (add 3 safe utility skills)

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> guideline: `docs/techstack/installer/test.md` (verify feature ที่เป็น payload `.md` + installer code)

## 1. จุดประสงค์ที่ต้อง verify
3 safe utility skill (`update-codemaps`/`explore`/`next`) ship ครบสาย **auto-invocable** + ชี้ playbook กลาง (ไม่ duplicate) + ไม่ทำลาย installer/packaging เดิม + build/ship คงเป็น command user-only. Skill เป็น **config ที่ Claude consume ตอน runtime** (ไม่มี service ให้รัน) → verify เชิงโครงสร้าง + executable install proof + dead-link + consistency (รูปแบบเดียวกับ payload `.md`)

## 2. วิธีเทส (ไม่มี service — ใช้รูปแบบ payload .md)
รัน local ด้วย `npm` scripts + grep/parse เชิงโครงสร้าง; install proof ผ่าน `setup:sandbox` (temp dir — **ห้ามรัน cli.mjs ที่ cwd=root**, dogfood leak #6)

## 3. Test cases

| # | เคส | วิธี | คาดหวัง |
|---|---|---|---|
| T1 | ship integrity — functional | `npm test` | tests 19 / pass 19 / fail 0 (pass==tests ≥ MIN_PASS 9) |
| T2 | package cleanliness | `npm run verify:pack` + `npm pack --dry-run` | เขียว 75 ไฟล์; skills ติด tarball ครบ 3 |
| T3 | executable install proof | `npm run setup:sandbox` → ตรวจ target | sandbox มี `.claude/skills/{update-codemaps,explore,next}/SKILL.md` ครบ |
| T4 | dogfood ไม่ leak | ตรวจ root `.claude/skills` + git porcelain | root ไม่มี `.claude/skills`; ไม่มี dogfood untracked |
| T5 | **D1** skill body ไม่พึ่ง `$ARGUMENTS` | `grep -rn '$ARGUMENTS' skills/` | ไม่พบ (skill รับ context จาก request) |
| T6 | auto-invocable | `grep disable-model-invocation` | ไม่พบ (ไม่ปิด auto-invoke) |
| T7 | **D3** `allowed-tools` frontmatter parse + read-only | parse YAML frontmatter | 4 key ครบ; allowed-tools ไม่มี Write/Edit |
| T8 | dead-link skill → playbook | resolve path ใน body | `.warnyin/workflow/{codemap,explore,next}.md` มีจริง 3/3 |
| T9 | 3-way consistency skill↔command↔playbook | เทียบ path ที่ skill กับ command ชี้ | ชี้ playbook เดียวกัน 3/3 |
| T10 | build/ship คงเป็น command (เจตนา) | ตรวจ note ใน command + diff | มี note "คงเป็น command user-only"; ไม่แปลงเป็น skill |
| T11 | ไม่แตะของกลาง | `git diff main` AGENTS.md + playbook | ไม่เปลี่ยน |

## 4. Env
- local: macOS + node ปัจจุบัน (CI matrix 20/22/24 ยืนยันตอนเปิด PR)
- ไม่มี service ภายนอก

## 5. หมายเหตุ (merge เข้า `docs/techstack/installer/test.md` ตอน SHIP)
- เพิ่ม pattern verify **skill (Claude adapter)**: install proof ใน sandbox + frontmatter parse (auto-invocable/read-only) + dead-link skill→playbook + consistency skill↔command (ชี้ playbook เดียวกัน) — ขยายจากแถว "verify feature ที่เป็น payload `.md`"
- เคส unit ใหม่ใน suite: verify-pack +2 (case 9 leak=`src/.vscode/`, R1 hasSkills) → suite 18→19
