# Research — repo-lint

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `repo-lint` |
| **วันที่** | 2026-06-07 |

---

## 1. คำถามวิจัย
- [x] RQ1: zero-dep ปัจจุบันเป็นจริงไหม (devDeps ว่าง)?
- [x] RQ2: เป้า lint มีกี่ไฟล์ + กี่ link?
- [x] RQ3: markdownlint/prettier ขัด zero-dep ยังไง + ทางออก?
- [x] RQ4: link ใน adapter เป็น md-link หรือ runtime-ref (ต้องแยก)?
- [x] RQ5: CI ปัจจุบันมี lint ไหม + wire ยังไง?

## 2. วิธี & แหล่งข้อมูล
- [x] อ่าน `package.json` (devDeps), `.github/workflows/ci.yml`, `docs/rule.md` §2/§5
- [x] grep .md links ใน src/ + docs/; inspect adapter (skill/command) vs walkthrough

## 3. Findings

### RQ1: zero-dep จริง
- `devDependencies = {}`, `dependencies = {}` — ใช้ `node:*` ล้วน (rule §2 จุดขาย)
- **นัย:** เพิ่ม markdownlint/prettier = ทำลาย selling point → ต้องเลี่ยง devDeps

### RQ2: เป้า lint
- `.md` ใน `src/` = **70 ไฟล์**; md-link `[](...)` (ข้าม http): **src ~21 + docs ~31**
- **นัย:** ปริมาณ link พอเหมาะ — zero-dep dead-link checker ทำได้สบาย

### RQ3: ทางออก zero-dep
- precedent: `src/scripts/{verify-pack,check-test-count}.mjs` = **gate zero-dep เขียนเอง** (pure function + main-guard, wire CI) — pattern เดียวกัน reuse ได้
- **นัย:** `src/scripts/lint-md.mjs` (node:* ล้วน) = ทางออกที่อยู่ในปรัชญา (Q1 เลือก)

### RQ4: ★ link type — ต้องแยก (design-critical)
- **adapter (skill/command)** อ้าง playbook เป็น **backtick/inline `` `.warnyin/workflow/explore.md` ``** = **runtime path ref** (ที่ playbook อยู่ที่ **target root** หลังติดตั้ง) — `grep '](...'` ใน `src/.claude/skills/explore/SKILL.md` = **ไม่มี md-link** → **ห้าม validate เป็น repo-relative**
- **docs/ walkthrough** ใช้ **md-link จริง** `[](stages/achieved/...)` → resolve ได้ → validate
- **หลักฐาน:** grep md-link syntax `\]\([^)]+\)` — skill=0, walkthrough=หลายอัน
- **นัย:** linter validate **เฉพาะ markdown-link `[text](path)`** — ข้าม backtick code-span (runtime ref) + ข้าม http(s); `path#anchor` → validate path (anchor = out of scope)

### RQ5: CI
- `.github/workflows/ci.yml` ไม่มี lint step (มีแค่ test matrix + pack-verify)
- **นัย:** เพิ่ม step `node src/scripts/lint-md.mjs` แบบ `pack-verify` (job/step ใหม่ หรือ needs:test)

## 4. Code inspection
| ไฟล์ / คำสั่ง | สิ่งที่พบ | นัย |
|---|---|---|
| `package.json` | devDeps ว่าง | ห้ามเพิ่ม → zero-dep script |
| `src/scripts/verify-pack.mjs` | pure `checkFiles`+main-guard, export ได้ | pattern reuse (testable) |
| `src/.claude/skills/*/SKILL.md` | playbook ref = backtick ไม่ใช่ md-link | ข้าม backtick |
| `docs/example-walkthrough.md` | md-link → achieved/ resolve | validate md-link |
| `.github/workflows/ci.yml` | ไม่มี lint | +step |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก |
|---|---|---|---|
| zero-dep node script | คง zero-dep, ตรง need (dead-link), reuse pattern | เขียน/ดูแลเอง (เล็ก) | ✅ Q1 |
| devDeps markdownlint/prettier | ได้ tool มาตรฐาน | ทำลาย zero-dep (จุดขาย) | — |
| ข้าม (YAGNI) | ไม่เพิ่มงาน | ไม่ได้ gate dead-link ที่เกิดซ้ำ | — |

## 6. ความเสี่ยง / unknown
- **false positive จาก backtick ref** → ลด: parse เฉพาะ `[](...)` syntax, ข้าม inline code
- **anchor `#section` validate ยาก** → out of scope (validate path พอ)
- linter เอง testable ไหม → ทำ pure `checkLinks(files)→errors[]` + unit (แบบ verify-pack) — ยืนยันตอน DESIGN

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำ:** 1 task — `src/scripts/lint-md.mjs` (pure `checkLinks` + main-guard, node:* ล้วน) validate md-link relative resolve ใน `src/**`+`docs/**` (ข้าม http/backtick/root-dogfood) + unit test + CI step + `npm run lint:md`
- **ป้อนกลับ discovery:** Q1 zero-dep script · Q2 dead-link เป็นแกน · Q3 src+docs+CI
