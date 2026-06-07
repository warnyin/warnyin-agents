# Ship — security-checklist (security รูปธรรม: agent-runtime + supply-chain)

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`

## 1. สรุป topic
- **ทำอะไร:** เสริม security รูปธรรม 2 thrust เป็น guidance `.md` tool-agnostic — (A) **agent-runtime security** (section "Runtime / operational security" ใน `roles/security.md`: secret isolation / no-egress / identity separation + Claude adapter note; reference ใน `verify.md` §2) + (B) **supply-chain** (warning prompt-injection ใน `install-skill.md` step 4 + checklist item S1 ใน security.md)
- **ประเภท:** ☑ rule/guidance enhancement (ไม่ใช่ feature ใหม่ — ไม่สร้าง `docs/features/`)
- **ปิด:** roadmap **P1 #7**
- **ผล VERIFY:** T1–T8 ผ่านครบ **0 รอบแก้** (executable install proof + 3-way consistency + portable preserved)

## 2. เอกสารกลางที่อัปเดต (promote)
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/rule.md` §3 | **reframe → "Security baseline" 2 มิติ:** 3.1 CI (เดิม) + 3.2 **agent-runtime** (secret isolation · no-egress · identity separation · supply-chain) — ไม่ renumber §4-6 (ไม่พัง reference) |
| `docs/roadmap.md` P1 #7 | ติ๊ก `[x]` DONE + ระบุจุดที่ลง (role card + VERIFY + install-skill + global §3.2) |
| `CHANGELOG.md` `[Unreleased]` | Added: security checklist (agent-runtime + supply-chain) — รอ assign version ตอน release step |

## 3. note "รอ SHIP" — พิจารณาครบ (ไม่เหลือค้าง)
| note | จาก | ผล |
|---|---|---|
| global bullet "agent-runtime security baseline" คู่ CI baseline | `tasks/add-security-checklist/rule.md` §2 | ✅ promote → `docs/rule.md` §3.2 (reframe §3) |

## 4. ที่ไม่ทำ (พร้อมเหตุผล)
| รายการ | เหตุผล |
|---|---|
| `docs/features/` | ไม่สร้าง — เป็น rule/guidance ไม่ใช่ product feature (อยู่ `security.md`/`rule.md` ถูกที่) |
| `docs/codemap/` | ไม่เปลี่ยน — เพิ่ม section ในไฟล์เดิม ไม่มีไฟล์/โครงใหม่ |
| `docs/techstack/installer/test.md` | ไม่เปลี่ยน — reuse pattern "verify feature payload `.md`" เดิม (จาก context-profiles) ไม่มีวิธีเทสใหม่ |
| `docs/troubleshooting.md` | ไม่มี entry (0 รอบแก้ — payload `.md` ล้วน) |
| `docs/{project,infra}.md` | ไม่กระทบ scope/env |

## 5. Archive
- `docs/stages/security-checklist/` → `docs/stages/achieved/2026-06-07-security-checklist/` (`git mv`, 2026-06-07)

## 6. นอก SHIP (release step — รอ user สั่ง)
- version bump (rule enhancement = patch → `0.8.2`) + assign CHANGELOG `[Unreleased]` → `[0.8.2]` + merge `build/security-checklist` → main
- **ค้างสะสม:** main ยังไม่ push + npm ยังไม่ publish (v0.8.0, v0.8.1, +0.8.2) — ตาม batch ที่ user เลื่อนไว้
