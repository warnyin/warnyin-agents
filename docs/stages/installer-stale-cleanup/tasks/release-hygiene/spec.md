# Spec — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> slice 3 ของ `design.md §2` — release `0.30.1`: surface ของ flag + CHANGELOG + runbook + MIN_PASS + full gate

## 1. ชนิดของ task
`infra` (release engineering + docs) — **ไม่มี logic ใหม่** นอกจากข้อความและตัวเลข gate

## 2. API SPEC
ข้าม — ไม่มี endpoint

## 3. UX/UI SPEC
ข้าม — CLI text เท่านั้น (ดู §4 surface contract)

## 4. Data-flow / surface contract (canonical wording)

### 4.1 canonical ใหม่ (copy คำต่อคำ — จาก `design.md §6`)
```
`--update` เขียนทับเฉพาะ CORE และลบไฟล์ CORE ที่ตกรุ่น (ปิดด้วย `--no-prune`) — ไฟล์ `docs/` ถูก seed จาก template ถ้ายังไม่มี ไม่ทับของเดิม
```

### 4.2 wording เก่าที่ต้องหายไปหมด (needle ของ negative-grep)
```
`--update` เขียนทับเฉพาะ CORE — ไฟล์ `docs/` ถูก seed จาก template ถ้ายังไม่มี ไม่ทับของเดิม
```

### 4.3 จุดที่ต้องแก้ (4 จุด + 1 เทส) — พิกัดจาก `design.md §6`
| # | ไฟล์ | บรรทัดอ้างอิง | รูปแบบที่ใส่ |
|---|---|---|---|
| 1 | `README.md` | 40 | bullet `- ` + canonical **เต็มพร้อม backtick** |
| 2 | `src/.warnyin/workflow/README.md` | 101 | bullet `- ` + canonical **เต็มพร้อม backtick** |
| 3 | `src/.warnyin/installer/templates/CLAUDE.md` | 49 | คงคำนำหน้าเดิม `` `npx @warnyin/agents --update` — `` แล้วต่อด้วยเนื้อ canonical ตั้งแต่ `เขียนทับเฉพาะ CORE` ถึงท้ายประโยค (backtick คงไว้) |
| 4 | `src/bin/cli.mjs` บล็อก `--help` | 50 | บรรทัดในวงเล็บของ `--update` — **ตัด backtick ออกตาม pattern เดิมของ help block** (terminal ไม่ render markdown; precedent = `0.29.1`) เหลือ `(เขียนทับเฉพาะ CORE และลบไฟล์ CORE ที่ตกรุ่น (ปิดด้วย --no-prune) — ไฟล์ docs/ ถูก seed จาก template ถ้ายังไม่มี ไม่ทับของเดิม)` · **ห้ามแตะ logic ใด ๆ ใน `cli.mjs`** |
| 5 | `src/tests/installer.test.mjs` ~720 | เทส `cli --help wording regression` | เพิ่ม positive assert `เขียนทับเฉพาะ CORE และลบไฟล์ CORE ที่ตกรุ่น` + `--no-prune` และ **negative assert** ว่า stdout **ไม่มี** `เขียนทับเฉพาะ CORE — ไฟล์` (รูปประโยคเก่า) · assert เดิม (`ไม่แตะ docs/`) คงไว้ |

> needle ที่ถูก assert คำต่อคำ **ชนะ pattern ประจำไฟล์** (`docs/rule.md §1 canonical-copy`) — จุดที่ 4 เป็นข้อยกเว้นที่ **ประกาศไว้ในสเปกนี้แล้ว** (ไม่ใช่การ paraphrase ตามใจ); ถ้าพบว่าต้องเบี่ยงจากสเปกนี้อีก → **รายงาน ไม่ตัดสินเอง**

## 5. User-flow
ผู้ใช้ปลายทาง: อ่าน `--help` / README / `CLAUDE.md` แล้ว **รู้ว่า `--update` ลบไฟล์ได้** และรู้วิธีปิด → ถ้าเจอไฟล์หาย เปิด `CHANGELOG` `### Migration` หรือ runbook ใน `docs/infra.md` แล้วตรวจ/กู้/ปิดได้เอง

## 6. Persona
maintainer ของ repo (bump + gate) และ **ผู้ใช้ npm ที่จะเจอ destructive change ครั้งแรก**

## 7. Test-flow (คำสั่งที่ต้องรันจริง + expected ต่อ gate)

> รันจาก repo root ทั้งหมด · **ทุก gate ต้องรันหลัง integrate wave 1 ครบแล้วเท่านั้น**

- [ ] **G1 pass-count gate** — `npm test 2>&1 | node src/scripts/check-test-count.mjs`
  - expected: `✓ pass-count gate OK: pass=<N> tests=<N> fail=0 (>= <MIN_PASS>)` · `fail=0` · `pass === tests`
  - **จด `<N>` ที่วัดได้ไว้** → เป็น input ของ G2
- [ ] **G2 MIN_PASS bump** — คำนวณ `MIN_PASS = floor((N − 5) / 10) × 10` จาก `N` ของ G1 แล้วแก้ค่าใน `src/scripts/check-test-count.mjs` + คอมเมนต์ที่มา (topic `installer-stale-cleanup` · slice 3 · `N = <N>` · `2026-08-16`)
  - expected: รัน G1 ซ้ำแล้วยังเขียว · `MIN_PASS ≤ N − 5` และ `MIN_PASS > N − 15` (ไม่หลวมเกิน 1 หลักสิบ)
  - negative proof: ตั้ง `MIN_PASS = N + 1` ชั่วคราว → gate ต้องแดงด้วยข้อความ `pass count ต่ำกว่าขั้นต่ำ` แล้ว **คืนค่าที่ถูกต้อง**
- [ ] **G3 dead-link / markdown gate** — `npm run lint:md` → expected: exit 0 (ครอบ `docs/infra.md` ที่เพิ่ง sweep + `README.md`)
- [ ] **G4 pack gate** — `npm run verify:pack` → expected: `✓ pack-verify ผ่าน: <n> ไฟล์` · **ห้ามมี** `.warnyin/.warnyin-manifest` หลุดขึ้น tarball
- [ ] **G5 unit เคสคู่ขนานของ verify-pack** — เพิ่มเคสใน `src/tests/verify-pack.test.mjs` แนวเดียวกับเคส `stamp deny: .warnyin/.warnyin-version`:
  ```
  checkFiles([...GOOD, '.warnyin/.warnyin-manifest'])
  ```
  - expected: คืน error ที่ **อ้าง path `.warnyin/.warnyin-manifest`** (มาจาก `DENY_PREFIX '.warnyin/'`) · **ห้ามแก้ `src/scripts/verify-pack.mjs`**
- [ ] **G6 dual validate-topic** — ต้องผ่านทั้งสองรุ่น
  - dogfood: `node .warnyin/workflow/scripts/validate-topic.mjs installer-stale-cleanup`
  - v-next: `node src/.warnyin/workflow/scripts/validate-topic.mjs installer-stale-cleanup`
  - expected: ไม่มี `✖` ทั้งสองรุ่น (`⚠` ยอมรับได้) · exit 0
- [ ] **G7 negative-grep wording เก่า** — ต้องคืน **0 hit** ทุกคำสั่ง
  ```bash
  grep -rn "เขียนทับเฉพาะ CORE — ไฟล์" README.md src/ docs/ ; echo "exit=$?"   # ต้องได้ exit=1 (ไม่เจอ)
  grep -rn "เขียนทับเฉพาะ CORE" README.md src/.warnyin src/bin | grep -v "ลบไฟล์ CORE ที่ตกรุ่น"
  ```
  - expected: คำสั่งที่สองไม่คืนบรรทัดใดเลย (ทุกที่ที่พูดถึง `เขียนทับเฉพาะ CORE` ต้องมีวรรค `ลบไฟล์ CORE ที่ตกรุ่น` ต่อท้าย)
- [ ] **G8 positive-grep canonical ครบ 4 จุด**
  ```bash
  grep -rn "ลบไฟล์ CORE ที่ตกรุ่น" README.md src/.warnyin/workflow/README.md src/.warnyin/installer/templates/CLAUDE.md src/bin/cli.mjs
  ```
  - expected: **4 hit พอดี** (ไฟล์ละ 1)
- [ ] **G9 reason string ตรงเซตปิด C15** — grep reason ที่ implement จริงใน `src/bin/cli.mjs` แล้วเทียบกับ 13 ค่าใน `design.md §4 C15`
  ```bash
  grep -o "\[\(path\|scope\|hash\|prune\):[a-z-]*\]" src/bin/cli.mjs | sort -u
  ```
  - expected: เซตที่ได้ **⊆** 13 ค่าของ C15 และตาราง reason ใน `docs/infra.md` runbook ครอบ **ครบทั้ง 13 ค่า**
  - ต่างจาก C15 → **รายงานขึ้น build report ไม่แก้ `cli.mjs`**
- [ ] **G10 CHANGELOG / version consistency**
  ```bash
  grep -n '"version"' package.json                  # ต้องเป็น 0.30.1
  grep -n '^## \[0.30.1\] - 2026-08-16' CHANGELOG.md # ต้องเจอ 1 บรรทัด
  grep -n '^### Migration' CHANGELOG.md | head -3
  ```
  - expected: version ใน `package.json` = `0.30.1` · header `## [0.30.1] - 2026-08-16` มีจริงและอยู่**เหนือ** `## [0.30.0]` · มี `### Migration` ใต้ `[0.30.1]`
- [ ] **G11 runbook ครบ 5 องค์ประกอบ** — `docs/infra.md` section `## Runbook — prune ลบไฟล์ไป — ตรวจ/กู้/ปิด` ต้องมีครบตาม `standard.md §2.3` (ตรวจด้วยสายตา + grep หัวข้อย่อย) และ `## Env vars สำคัญ` มีบรรทัด `.warnyin-manifest`

### เคส regression ที่ห้ามพัง
- [ ] เทสใน `src/tests/installer-prune.test.mjs` และ `src/tests/installer-upgrade.test.mjs` **ยังเขียวเหมือนก่อนแก้** — แดงเพราะ contract ไม่ตรง → **รายงาน ห้ามแก้ไฟล์เทสสองใบนั้น**
- [ ] เทส `cli --help wording regression` เดิมยัง assert `!includes('ไม่แตะ docs/')` ได้อยู่
