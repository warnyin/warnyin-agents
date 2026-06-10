# Test Plan — เร่งความเร็ว BUILD stage (improve-performance)

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> guideline: `docs/techstack/installer/test.md` §"verify feature payload `.md`" + §"verify payload workflow script" + §"verify spec/delta payload"

| | |
|---|---|
| **Slug** | `improve-performance` |
| **Component** | `installer` (playbook `.md` + `build-wave.mjs`) |
| **จุดประสงค์ที่ต้อง verify** | BUILD เร็วขึ้น: DESIGN แตก DAG กว้าง (toolkit + critical-path gate) · model routing per task · lean self-verify · task/context lean — **โดยไม่ regress ของเดิม** |

## 1. ขอบเขตการเทส (ตามจุดประสงค์ topic)
ยืนยัน 4 task ทำงานตามเจตนา + ไม่ regress:
- **T1 dag-width-toolkit:** DESIGN playbook มี toolkit 3A (decouple/re-slice/serialize) + critical-path gate (3B) + task-lean (3E) ครบ ตรง canonical, unify-in-place (ไม่มีกลไกขนาน)
- **T2 build-wave-model-arg:** `build-wave.mjs` รับ+ส่ง `model` per task แบบ pass-through + backward compat (string[] เดิม) — **executable runtime proof**
- **T3 lean-build-verify:** BUILD playbook ระบุ self-verify = scope component ตัวเอง + full-gate ยัง blocking
- **T4 model-routing-docs:** per-task tier guidance (subset generic) + adapter map tier→รุ่นจริง (payload ไม่มีชื่อรุ่น)
- **Empirical (gate ตัดสิน):** redesign DAG ของ scaffold-foundation ด้วย toolkit → ≥1 wave width >1 (เทียบ baseline chain depth 4)
- **Regression:** context-profiles scenarios + full test suite + validators

## 2. ชนิดการเทส
- [x] Structural/consistency (payload `.md` — toolkit/gate wording ตรง canonical, 3-way consistency)
- [x] Executable runtime proof (`build-wave.mjs` model routing — สกัด helper + run body ด้วย AsyncFunction)
- [x] Ship integrity (`npm test` + `verify:pack` + `validate-topic` + `lint:md`)
- [x] Empirical DAG redesign (sandbox — ไม่ทับ example เดิม)
- [x] Regression (context-profiles)
- [ ] E2E/UX-UI — ❌ N/A (ไม่มี frontend/service)

## 3. Local env
| Service | คำสั่งรัน | หมายเหตุ |
|---|---|---|
| — | — | ไม่มี service ให้รัน — verify เชิงโครงสร้าง+runtime ตาม installer/test.md |

## 4. Test cases
| # | สถานการณ์ (อิงจุดประสงค์) | วิธี | ผลที่คาดหวัง |
|---|---|---|---|
| V1 | full suite + pack + validate + lint เขียว (ship integrity) | `npm test`, `verify:pack`, `validate-topic`, `lint:md` | test ≥9 pass / 0 fail · pack ✓ · validate ✓ · lint ✓ |
| V2 | T2 model routing runtime: string[] เดิม → opts ไม่มี key model | สกัด `normalizeTasks`+`buildOpts` รันจริง | opts ไม่มี key `model` (backward compat) |
| V3 | T2: `{name,model}` → opts มี key model = pass-through (ไม่ map/hardcode) | รัน buildOpts | `opts.model === <ค่าที่ส่ง>` ตรงตัว |
| V4 | T2: `{name}` ไม่มี model → opts ไม่มี key model | รัน buildOpts | ไม่มี key `model` |
| V5 | T2 e2e: รันทั้ง body ด้วย AsyncFunction + mixed tasks | inject globals ปลอม | results ครบ · model key ถูกต้องต่อ task |
| V6 | T1 toolkit landed: design.md มี 3A/3B/3E + critical-path gate | grep canonical anchors | พบครบ + ตรง canonical §3 |
| V7 | T1 critical-path gate อยู่ที่ Gate §8 + §4 step 7 (ไม่ใช่ §7) | grep playbook design.md | gate item อยู่ถูก anchor |
| V8 | T3 verify-scope ชัด + full-gate blocking | grep build.md §3 ข้อ 4/ข้อ 8 | scope=component ตัวเอง + full-gate คง blocking |
| V9 | T4 per-task tier generic + adapter map (payload ไม่มีชื่อรุ่น) | grep contexts/ vs src/.claude/commands/ | payload generic · ชื่อรุ่นเฉพาะ adapter |
| V10 | Regression: balanced+ review ไม่ถูกแตะ + 4-section cards | grep contexts/ | balanced+ คงเดิม · 4 section ครบ |
| V11 | **Empirical:** redesign scaffold DAG ด้วย toolkit → width >1 | apply 3A contract-first decouple | wave ใหม่มี ≥1 wave 2 task (depth 3 < 4) |

## 5–6. E2E / UX-UI
N/A — ไม่มี frontend

## 7. วิธีรันเทส (reproducible)
```bash
npm test                                              # V1 full suite
npm run verify:pack                                   # V1 pack
node src/.warnyin/workflow/scripts/validate-topic.mjs improve-performance   # V1 validate
npm run lint:md                                       # V1 lint
node <runtime-proof สกัด helper จาก build-wave.mjs>   # V2-V5
# V6-V10 = grep canonical anchors (ดู verify.md)
# V11 = redesign DAG sandbox (ดู §empirical ใน verify.md)
```
