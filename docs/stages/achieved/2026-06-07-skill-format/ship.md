# Ship Report — skill-format (3 safe utility skills, auto-invocable)

> ส่งมอบ 2026-06-07 · archive ของ topic `skill-format` (P1 #9 — ข้อสุดท้ายของ P1)

## 1. feature: ใหม่
**`docs/features/utility-skills/`** — Claude adapter skill (`/<name>`) auto-invocable, body ชี้ playbook กลาง ไม่ duplicate (มิติคู่ command `/warnyin:*` แต่ skill = auto-invoke เฉพาะ read-only safe)
- 3 skill: `update-codemaps`→`codemap.md` · `explore`→`explore.md` · `next`→`next.md`
- แยกจาก feature `context-profiles` (คนละมิติ: skill = Claude adapter; context = session posture)

## 2. เอกสารกลางที่อัปเดต

| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/utility-skills/{feature,business}.md` | **สร้างใหม่** — skill format canonical (frontmatter 4 key + body ชี้ playbook), auto-invocable เฉพาะ read-only, irreversible คงเป็น command, ไม่ plugin (namespace ผสม), pipeline installer→packaging→test |
| `docs/rule.md` §1 | **L1 (planned)** skill-adapter convention — ขยาย bullet "tool-agnostic adapter บาง" ในที่เดิม (unify-in-place): skill ชี้ playbook ไม่ duplicate · auto-invoke เฉพาะ read-only safe · irreversible คงเป็น command · ไม่ plugin (รักษา `/warnyin:*`) · description-driven ไม่มี event |
| `docs/techstack/installer/test.md` | **L2** verify-skill pattern (install proof sandbox + frontmatter parse read-only/auto-invocable + dead-link skill→playbook + consistency skill↔command↔playbook) · **L3** เปิด allowlist entry ใหม่ (เปลี่ยน leak-example case คง config-protection + R1 required-assert + ลำดับ atomic GOOD-ก่อน-assertion) · case list 18→19 (verify-pack 9→10) |
| `docs/techstack/installer/structure.md` | CORE +`.claude/skills` · `files` allowlist +`src/.claude/skills` · ไฟล์ลิสต์ +skills · verify-pack 9→10 เคส |
| `docs/techstack/installer/about.md` | copy CORE รวม skills |
| `docs/codemap/{architecture,index}.md` | skills ใน 2-layer flow + installer copyTree + tool-agnostic adapter section + entry points + file count ~64→~67 |
| `docs/project.md` | in-scope +utility skill (auto-invocable) |

## 3. note "รอ SHIP" — พิจารณาครบ
- **skill-adapter convention** (`tasks/add-utility-skills/rule.md` §2) → **promote** เป็น L1 ใน `docs/rule.md` §1 (project scope) ✅
- ไม่มี note อื่นค้าง

## 4. Learned-rule (dogfood กลไก #8 — planned + emergent, user ยืนยันต่อ rule)
| # | rule | evidence | scope | ปลายทาง |
|---|---|---|---|---|
| L1 | skill-adapter convention | topic นี้: 3 skill บาง ชี้ playbook, read-only auto-invoke, irreversible=command, ไม่ plugin | project | `docs/rule.md` §1 |
| L2 | verify-skill test pattern | VERIFY T3/T7/T8/T9 ผ่าน | component | `installer/test.md` |
| L3 | allowlist-open atomic lesson | dry-run B1/B2/B3 (case 9 flip + GOOD ก่อน assert) | component | `installer/test.md` |

## 5. troubleshooting
- ไม่มี entry ใหม่ (BUILD 0 รอบแก้ · VERIFY 0 รอบแก้ — atomic ordering จาก dry-run กันไว้หมด)

## 6. โค้ด (merge นอก workflow)
- branch `build/skill-format` (commit `fae481b` build + `d15065c` verify) → merge `main` + bump version จัดการนอก SHIP (batch release P1)
- `npm test` 19/19 · `verify:pack` เขียว · skills ติด tarball ครบ 3

## 7. สถานะ
✅ topic ปิดสมบูรณ์ — **P1 roadmap ครบทุกข้อ** (#7 security-checklist, #8 learned-rule, #9 skill-format)
