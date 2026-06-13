# Test Plan — UX/UI designer agent + wireframe ใน DESIGN stage

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> แผน/วิธีเทสของ topic นี้ — ตอน **SHIP** จะ merge เข้า `docs/techstack/installer/test.md`

| | |
|---|---|
| **Slug** | `uxui-designer-stage` |
| **Component** | `installer` (payload markdown — playbook/role/agent/template; ไม่มี runtime/FE) |
| **จุดประสงค์ที่ต้อง verify** | UX wireframe capability ถูก invoke ได้จริงใน DESIGN flow (stage-invoked + backward-compatible) — role/agent/template ครบ + playbook wiring ถูก + canonical wording ตรง + ไม่ regression |

## 1. ขอบเขตการเทส (ตามจุดประสงค์ topic)
- **ไม่มี runtime/FE** → ไม่มี e2e/playwright; verify = **structural + behavioral** (เดิน flow ในเอกสาร) + **full-gate regression**
- ★ **ตรวจอิสระจากผู้เขียน** (rule §5 ข้อ 4 + canonical-copy) — build agent self-verify แล้ว, VERIFY ใช้ agent อิสระ + full-gate ที่ main loop รันเอง

## 2. ชนิดการเทส
- [x] Functional (structural — ตาม test-flow ใน `tasks/*/spec.md`)
- [ ] E2E smoke — N/A (ไม่มี FE)
- [x] Behavioral (เดิน 5 scenario ของ Spec delta §9 ในเอกสาร)
- [x] Canonical-consistency (verify-method 2 — wording §10 ใน playbook = คำต่อคำ)
- [x] Regression (feature spec เดิม + full-gate 85/85)

## 3. Local env ที่ต้องรัน (จาก `docs/infra.md`)
| Service | คำสั่งรัน | หมายเหตุ |
|---|---|---|
| — (ไม่มี service) | `node --test` + `node src/scripts/{verify-pack,lint-md,check-test-count}.mjs` | full-gate ของ payload repo |

## 4. Test cases
| # | สถานการณ์ (อิงจุดประสงค์) | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|---|
| T-FUNC-1 | role card `roles/ux.md` ครบ | grep 4 section + Skill + 2 guard + Lens 5 มุม | ครบทุกข้อ |
| T-FUNC-2 | agent `warnyin-ux` read-only generator | grep frontmatter tools + description | `tools: Read, Grep, Glob` (ไม่มี Write/Edit ใน tools line), description มี generator ไม่มี "reviewer" |
| T-FUNC-3 | template `wireframe.md` 4 section ตรง contract | grep ชื่อ section + ASCII fence | 4 section ชื่อเป๊ะ + ≥2 screen + fence ปิดคู่ + status draft/approved |
| T-FUNC-4 | playbook design.md wiring | grep step 4.5 + detect + panel note + gate + role lens | step 4.5 อยู่ระหว่าง step 4–5; detect มี skip; gate §8 conditional; role lens §3 ข้อ 6; panel note §3 ข้อ 7 + §4 step 6 |
| T-FUNC-5 | README enumerate + roles/README ตาราง | grep `ux` | `workflow/README.md` มี ux (generator); `roles/README.md` แถว UX (generator) + note |
| T-BEHAV-1 | มี UI surface → เสนอ wireframe | อ่าน step 4.5 detect | playbook สั่งเสนอ wireframe เมื่อ detect ใช่ |
| T-BEHAV-2 | ไม่มี UI surface → ข้าม + gate N/A | อ่าน detect skip + gate item | "ไม่ใช่ → ข้าม" ชัด; gate item ระบุ N/A |
| T-BEHAV-3 | ก้ำกึ่ง → ถาม user | อ่าน detect | "ไม่แน่ใจจริง → ถาม user + recommended" |
| T-BEHAV-4 | read-only generator → ได้ wireframe | อ่าน step 4.5 | fan-out warnyin-ux คืน text → main loop persist |
| T-BEHAV-5 | approve gate + fallback | อ่าน step 4.5 | approve gate ก่อนแตก task; fallback lens เมื่อ fan-out ไม่ได้ |
| T-CANON | canonical wording §10 = playbook คำต่อคำ | diff wording §10A-F กับ playbook | diff ว่างทุก block |
| T-REGR-1 | feature spec เดิมไม่ break | grep feature อ้าง step numbering | ไม่มี feature อ้าง literal "4.6/4.10"; step 5/9 ที่ feature อ้างยัง valid (4.5 flat insert ไม่ดัน) |
| T-REGR-2 | full-gate เขียว | `node --test \| check-test-count` + verify-pack + lint-md | 85/85 pass, 86 ไฟล์, 114/48 ลิงก์ |
| T-NEG | gate 2 ขั้ว (negative — repo นี้เอง) | detect repo `warnyin-agents` (ไม่มี FE) | detect = ไม่ใช่ → gate N/A → backward compatible (full-gate ยังเขียว) |

## 7. วิธีรันเทส (reproducible)
```
# full-gate (objective)
node --test 2>&1 | node src/scripts/check-test-count.mjs   # pass=85 tests=85
node src/scripts/verify-pack.mjs                            # 86 ไฟล์
node src/scripts/lint-md.mjs                                # 114 ไฟล์ 48 ลิงก์
# structural/behavioral/canonical/regression → fan-out agent อิสระ (qa lens)
```
