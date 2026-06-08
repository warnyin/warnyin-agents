# Ship — build-wave-branch-fix

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ — เขียนหลังย้าย topic เข้า `docs/stages/achieved/2026-06-08-build-wave-branch-fix/` แล้ว

## 1. สรุป topic
- **ทำอะไร:** แก้ root cause ของ KB#14/TS-2 — harness fork worktree จาก main ทำให้ build sub-agent ไม่เห็น topic docs + output ของ wave ก่อน. ให้ `build-wave.mjs` รับ arg `baseRef` + prompt step 0 สั่ง agent `git merge <baseRef>` ก่อนอ่าน task (abort-on-conflict + hard-stop + retry + notes) · orchestrator ส่ง baseRef + integrate scoped checkout · playbook อธิบายกลไก — unify-in-place 4 ไฟล์
- **ประเภท:** ☐ ไม่ใช่ feature ใหม่/ปรับปรุง — **reliability fix ของ internal orchestration mechanics** (§9 ไม่มี delta; ไม่มี feature `build-orchestration` ใน `docs/features/`, fix ไม่ถึงเกณฑ์สร้าง feature spec)

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/rule.md` §1 | อัปเดต E1 build-orchestration rule ให้ตรง code (docs-match-code) — เพิ่ม "กลไก sync (implemented): build-wave รับ baseRef + agent git merge step แรก + abort/hard-stop/retry; orchestrator integrate scoped checkout" |
| `docs/techstack/installer/test.md` | section ใหม่ "verify payload workflow script (agent-driven, harness-wrapped)" — runtime proof แทน node --check + git sandbox สำหรับ git-mechanics (learned-rule TS-1) |
| `docs/troubleshooting.md` | #16 — node --check ใช้ไม่ได้กับ payload workflow script + runtime proof workaround |
| `docs/codemap/` | index.md build-wave.mjs +baseRef sync note + freshness header |
| `docs/features/` | **ไม่แตะ** — §9 ไม่มี delta |
| `docs/infra.md` / `docs/project.md` | ไม่แตะ — internal mechanics |

## 3. Learned rules (planned + emergent)
| rule (generalize) | evidence | scope | promote? |
|---|---|---|---|
| TS-1: payload workflow script (harness wrap + top-level return + export + injected globals) อย่าใช้ `node --check` standalone เป็น gate — ใช้ runtime proof (`new Function`) + npm test/verify:pack; git-mechanics พิสูจน์ใน git sandbox จริง | `troubleshooting.md` #16 + `verify.md` T3/T4 | `component:installer` (testing) | ✅ → `docs/techstack/installer/test.md` |
| (E1 build-orchestration) | ไม่ใช่ rule ใหม่ — **อัปเดต** rule เดิมให้ตรง code (กลไก sync ที่ topic นี้ implement) | `project` | ✅ (docs-match-code, ไม่ใช่ promote ใหม่) |
| (planned worktree-baseref) | ไม่มี rule ใหม่ — reliability fix ตาม convention เดิม (unify-in-place + canonical-copy + E1) | — | — |

## 4. หมายเหตุ §9 ไม่มี delta
- topic นี้ใช้ template v-next ที่มี §9 → ระบุชัด "ไม่มี delta" (พฤติกรรม user ไม่เปลี่ยน) — validator (KB#15 heuristic) match `/ไม่มี delta/` เป็น intended skip ถูกต้อง
- **ยืนยันวงจร Spec delta backward-compat:** topic ที่ไม่มี behavior change → SHIP ไม่แตะ feature spec (กลไกทำงานตามออกแบบ)

## 5. Archive
- ย้ายจาก `docs/stages/build-wave-branch-fix/` → `docs/stages/achieved/2026-06-08-build-wave-branch-fix/` เมื่อ 2026-06-08 (git mv ก่อน promote)
- **executable real-proof ค้าง:** fix พิสูจน์เต็มเมื่อ topic ถัดไป BUILD แบบ multi-wave (agent wave 2 เห็น dependency โดยไม่ improvise) — รอบนี้ proof = runtime test + FF git sandbox + self-confirming irony (agent ของ task เจอปัญหาที่ตัวเองแก้)
