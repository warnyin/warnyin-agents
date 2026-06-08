# Test Plan — build-wave-branch-fix

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> อิง guideline `docs/techstack/installer/test.md` §"verify structural validator / zero-dep CLI tool" + design §8 + TS-1 (runtime proof แทน node --check)

| | |
|---|---|
| **Slug** | `build-wave-branch-fix` |
| **Component** | workflow build-wave (payload agent-driven script) |
| **Env** | local — build branch `build/build-wave-branch-fix` (รัน node + git sandbox) |
| **วันที่** | `2026-06-08` |

## เคสทดสอบ

### T1 — Ship integrity (gate เดิม)
- `npm test` (53) เขียว · `lint:md` 0 dead-link · `verify:pack` (build-wave.mjs ยังติด tarball)

### T2 — Static guards (grep ใน source)
- `baseRef` arg parse + `isolate && baseRef` guard + abort-on-conflict (`git merge --abort`) + hard-stop (`task.md ไม่ปรากฏ`) + retry transient lock + command ส่ง baseRef + playbook อธิบายกลไก

### T3 — Runtime proof (รัน prompt() จริง — TS-1: แข็งกว่า grep เพราะ splice ทำลำดับ runtime ต่างจาก source)
- สกัด `prompt()` จาก source → รันใน sandbox (`new Function` inject isolate/baseRef/slug) 3 เคส:
  - **Case A** (isolate && baseRef): step 0 มี + อยู่**ก่อน** step 1 (idx จริง) · `git merge <baseRef>` expand ถูก · abort-on-conflict · hard-stop full-path `docs/stages/<slug>/tasks/<task>/task.md` · บันทึก notes
  - **Case B** (!baseRef): ไม่แทรก step 0 = backward compat · ยังมี step 9 commit
  - **Case C** (!isolate): ไม่แทรก step 0 · shared-tree note

### T4 — Fast-forward assumption (git sandbox จริง)
- สร้าง repo จำลอง: main(base) → build/demo(topic docs + wave1) → worktree fork จาก main → `git merge build/demo` → ต้องเป็น **Fast-forward** + topic docs/wave output มาครบ (พิสูจน์กลไก step 0 ทำงานตามออกแบบ)

### T5 — §9 ไม่มี delta (no regression baseline)
- topic นี้ §9 = "ไม่มี delta" — ไม่มี feature spec ให้เทียบ; observable behavior ของ user (`/warnyin:build`) ไม่เปลี่ยน → regression = suite เดิม 53/53 ไม่พัง (ครอบใน T1)

## เกณฑ์ผ่านรวม
T1-T5 ผ่าน · ไม่มี regression · executable real-proof (multi-wave dogfood) = topic ถัดไป (ระบุใน verify)
