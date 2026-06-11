# Test plan — build-wave-export-fix (verify-lite, fast tier)

## วิธีเทส
unit (regression) + executable proof (Workflow launch จริง) — ไม่มี FE/empirical

## Cases
- [x] **T1** `npm test` → 66/66 pass (6 เคส build-wave A/B/C/D/E + isolate — extractFn ยังหา `function ${name}` เจอ, behavior identical)
- [x] **T2** `grep -nE "^export " src/...build-wave.mjs` → 1 บรรทัด (`export const meta`)
- [x] **T3 (executable proof)** sync src→root → `Workflow({ scriptPath: ".warnyin/workflow/scripts/build-wave.mjs", args:{slug:"x",tasks:[]} })` → **launch สำเร็จ** คืน `{"slug":"x","results":[],"failed":[]}` (early-return) **ไม่เจอ `SyntaxError: Unexpected keyword 'export'`**
- [x] **T4** behavior identical — test เคส A-E ยืนยัน normalize/buildOpts output เดิม

## Gate → SHIP
ทุก T ผ่าน · 0 fix
