# Test Plan — roadmap-sync-p0

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> แผน/วิธีเทสของ topic นี้ — ตอน **SHIP** พิจารณา merge แนวทางเข้า `docs/techstack/installer/test.md`
> guideline เดิม (`docs/techstack/installer/test.md`) เป็นเทส installer behavior — **ไม่มี guideline เทสเอกสาร migration** → เสนอวิธีใหม่ที่นี่

| | |
|---|---|
| **Slug** | `roadmap-sync-p0` |
| **Component** | `installer` (repo meta docs) |
| **จุดประสงค์ที่ต้อง verify** | (1) migration guide **ทำตามแล้ว migrate สำเร็จจริง** (executable proof) (2) anchor link คลิกได้ (3) roadmap สะท้อนสถานะถูก (4) regression-free |

## 1. ขอบเขตการเทส (ตามจุดประสงค์ topic)
- migration steps ในตาราง CHANGELOG **execute ได้จริง** → ผู้ใช้รุ่นเก่าทำตามแล้วได้โครง `.warnyin/` + `docs/stages/` ถูกต้อง (ไม่ใช่แค่มีข้อความ)
- README anchor `#migration-guide` resolve ไป heading จริง (slug unique — GitHub ไม่เติม `-1`)
- roadmap P0 checkbox ตรงงานจริง (#3/#4 ✅, #1/#2 เดิมคงอยู่, #12 ยังไม่ติ๊ก)
- ไม่ regress: `npm test` เขียว, ไม่แตะ `src/`

## 2. ชนิดการเทส
- [x] Functional (ตาม test-flow ใน `tasks/sync-p0-docs/spec.md` §7)
- [ ] E2E smoke (ไม่ใช่ FE)
- [x] **Behavioral: executable migration proof** (simulate legacy layout → ทำตามตาราง → installer → assert โครง)
- [ ] UX/UI (ไม่ใช่ FE)
- [x] Regression (npm test + git diff)

## 3. Local env ที่ต้องรัน (จาก `docs/infra.md`)
| Service | คำสั่งรัน | port / หมายเหตุ |
|---|---|---|
| ไม่มี service | — | zero-dependency; เทสใน temp dir (`mktemp -d`) — **ห้ามรัน cli.mjs ที่ cwd=repo root** (troubleshooting #6 leak dogfood) |

## 4. Test cases
| # | สถานการณ์ (อิงจุดประสงค์) | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|---|
| V1 | migration 0.3–0.5.x executable | temp + `warnyin/{workflow,template,installer,stages}` → รัน cli (เห็น warn) → ทำตามตาราง (`mv warnyin/stages docs/stages`, `rm -r warnyin/workflow warnyin/template`) → รัน cli ซ้ำ | ได้ `.warnyin/workflow` + `docs/stages` ถูก; งานจริงใน stages ไม่หาย |
| V2 | migration ≤0.2.x executable | temp + `workflow/` + `warnyin-stages/` → รัน cli (เห็น warn) → ทำตามตาราง (`mv warnyin-stages docs/stages`, `rm -r workflow`) → รัน cli ซ้ำ | ได้ `.warnyin/` + `docs/stages` ถูก; งานจริงไม่หาย |
| V3 | anchor link integrity | grep heading `## Migration guide` (unique?) + README link slug | heading ปรากฏครั้งเดียว → slug `#migration-guide` ตรง link |
| V4 | roadmap accuracy | อ่าน P0 #1–4 + #12 | #1/#2/#3/#4 = ✅, #12 ยัง `[ ]` (ไม่ติ๊กลวง) |
| V5 | regression | `npm test` + `git diff main --stat` | 18/18 pass; แตะเฉพาะ docs (CHANGELOG/README/roadmap) + artifact — ไม่มี `src/` |

## 5. E2E smoke (FE)
- N/A (ไม่ใช่ FE)

## 6. UX/UI checklist (FE)
- N/A (ไม่ใช่ FE)

## 7. วิธีรันเทส (reproducible)
```bash
ROOT=$(pwd)   # repo root (build/roadmap-sync-p0 branch)
# V1: simulate 0.3–0.5.x migration
TMP=$(mktemp -d); cd "$TMP"
mkdir -p warnyin/workflow warnyin/template warnyin/installer warnyin/stages/mywork
echo "งานจริง" > warnyin/stages/mywork/note.md
node "$ROOT/src/bin/cli.mjs" 2>&1 | grep -q '0.3–0.5.x' && echo "V1a: เห็น legacy warn ✓"
# ทำตามตาราง migration guide
mkdir -p docs && mv warnyin/stages docs/stages && rm -r warnyin/workflow warnyin/template
node "$ROOT/src/bin/cli.mjs" >/dev/null 2>&1
test -d .warnyin/workflow && test -f docs/stages/mywork/note.md && echo "V1b: โครงใหม่ถูก + งานจริงไม่หาย ✓"
cd "$ROOT" && rm -rf "$TMP"
```
