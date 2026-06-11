# Design (How) — discovery-mode-selector

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end
> **tier:** `standard` · lens: `.warnyin/workflow/roles/sa.md`

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` (payload: playbook `.warnyin/workflow/` + command `.claude/commands/warnyin/`) — แก้ที่ `src/` (source); root เป็น dogfood (regenerate ตอน release)
- **แนวทางหลัก:** mode = **dial ปรับพารามิเตอร์ของ Discovery loop เดิม** ไม่ใช่เขียน flow ใหม่ 4 ชุด
  - **canonical** อยู่ที่ playbook `discovery.md` เดียว (เพิ่ม section "Discovery modes") — command adapter ชี้มา ไม่ duplicate (pattern เดียวกับ `triage.md` rubric)
  - debate orchestrate ผ่าน **Agent tool ที่ AI หลักเรียกตาม playbook** (ไม่ใช่ Workflow script) → เลี่ยงข้อห้าม top-level `export` (`installer/rule.md` §build orchestration) ทั้งหมด
  - ทั้ง 4 mode ยังสวม context-profile `research` เดิม (mode = แกนใต้ research ไม่แทนที่)

## 2. Vertical slices
> หนึ่ง slice = หนึ่งหน่วยคุณค่า end-to-end → 1 task · ไม่แบ่งตาม layer แนวนอน

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | Model tier | → task |
|---|---|---|---|---|
| 1 | **playbook modes** — Discovery รองรับครบ 4 mode + auto-suggest + debate orchestration (อ่าน playbook แล้ว AI เดิน Discovery ได้ทุก mode end-to-end) | logic (playbook นิยาม behavior) · test (verify: เดินแต่ละ mode สังเกตพฤติกรรมต่าง) | `deepest` (เขียน behavior 4 mode + debate mechanics + auto-suggest — logic หนัก, ไม่เคยทำ) | `tasks/discovery-playbook-modes/` |
| 2 | **command adapter** — `/warnyin:discovery` รับ/แนะนำ mode แล้วพา agent เข้า flow (entry → playbook) + capability tree | entry/adapter (command) · doc (README) · test (verify: เรียก command เลือก mode ได้) | `balanced` (adapter บาง + keyword map + README pointer) | `tasks/discovery-command-adapter/` |

> **sub-task ใน Task A** (SA-2): แตกย่อย (a) mode taxonomy + behavior **5 mode** (b) auto-suggest §4.4 (c) **debate orchestration §5.2** (d) grill fold (e) **ไต่สวน orchestration §5.3** (Blue/Red iterative + memory artifact) — verify แยก scenario ได้ แต่คงอยู่ task เดียว (ไฟล์เดียว `discovery.md` — แตกเป็นคนละ task = 2 agent แก้ไฟล์เดียว = ชน)
> **debate self-contained (TechLead-S3):** debate = playbook-driven **Agent-tool call (read-only, no worktree)** เขียนจบใน `discovery.md` — **ไม่พึ่ง/ไม่อ้าง** `build.md §6` หรือ `build-wave.mjs` (คนละ pattern; build §6 เป็น Workflow script ล้วน)

> แต่ละ slice end-to-end: Slice 1 = ผู้ใช้ได้พฤติกรรม mode จริงเมื่อ AI ทำตาม playbook; Slice 2 = ผู้ใช้ trigger mode ผ่าน command ได้ — เสริมกันแต่ test แยกได้

## 3. Data model / schema
- **N/A** — เป็น playbook/markdown ไม่มี entity/migration; "mode" เป็น taxonomy เชิงข้อความ (ไม่เก็บ state)

## 4. Interface / contract
> ★ **contract ที่ทั้ง 2 task พึ่ง** (contract-first decouple → parallel) — fix ที่นี่ ห้าม task เปลี่ยนเอง

### 4.1 Mode taxonomy (canonical names + keyword aliases)
| mode | ชื่อ canonical | keyword/alias ที่ command map (ไทย/อังกฤษ) |
|---|---|---|
| ไว | `ไว` | "ไว", "เร็ว", "quick", "fast", "เอาเร็ว" |
| สมดุล | `สมดุล` | "สมดุล", "ปกติ", "balanced", "default" (= ค่า fallback ของ auto-suggest) |
| ละเอียด | `ละเอียด` | "ละเอียด", "ลึก", "deep", "grill", "ซักถามฉันหน่อย", "grill me" |
| โต้วาที | `โต้วาที` | "โต้วาที", "debate", "ถกเถียง", "แย้งกัน" |
| ไต่สวน | `ไต่สวน` | "ไต่สวน", "audit", "red-team", "blue-red", "ตรวจเข้ม" |

- **multi-match / ขัดกัน** (เช่น "เอาเร็วแต่ขอละเอียด" เจอทั้ง ไว+ละเอียด) → **ไม่** first-match เงียบ; **fall through ไป auto-suggest §4.4** (เสนอ + เหตุผล → user ยืนยัน)
- ไม่ match keyword ใดเลย → auto-suggest §4.4
- **`ไต่สวน` = explicit-only** — auto-suggest **ไม่แนะเอง** (หนักสุด: user-in-loop หลายรอบ) เว้นผู้ใช้ขอ "ตรวจให้เข้มสุด/audit" ชัด

### 4.2 Section anchor ใน playbook (Task B ชี้มาด้วยชื่อนี้)
- section ใหม่ในชื่อ **"Discovery modes (ความเข้มของ Discovery)"** ใน `discovery.md` — เป็น single source ของ taxonomy + behavior + auto-suggest + debate

### 4.3 Behavior contract ต่อ mode (Task A เขียนรายละเอียด)
| มิติ | ไว | สมดุล (=ปัจจุบัน) | ละเอียด | โต้วาที | ไต่สวน |
|---|---|---|---|---|---|
| ground input | project.md + ที่จำเป็น | input หลัก (playbook §2) | input ครบ | input ครบ | input ครบ (Blue) |
| การถาม | เฉพาะที่ block จริง | ทีละข้อ ครบกิ่งหลัก | ทุกกิ่ง decision tree + role lens BA/PO เต็ม + **grill** | ขับเคลื่อนด้วยประเด็นจาก debate | **grill ทุก finding** ของ Red ทุกรอบ (user-in-loop) |
| research | minimal | คู่ขนานพอประมาณ | deep | deep | deep (Blue) + adversarial audit (Red) |
| multi-agent | ✗ | ✗ | ✗ | ✓ (debate §5.2, fan-out ครั้งเดียว) | ✓✓ (Blue/Red 2 ทีม **iterative** §5.3) |
| เหมาะกับ | งานชัด/เล็ก | งานทั่วไป | งานเสี่ยง/กำกวม/หลาย trade-off | งานที่ต้อง stress-test สมมติฐานหลายมุม | งาน high-stakes ที่ต้องตรวจความครบ/ถูกต้องเข้มสุด แบบ adversarial มี user ในวง |

> **โต้วาที vs ไต่สวน:** โต้วาที = fan-out persona **ครั้งเดียว** → สังเคราะห์ → ถามตอนจบ (เบากว่า); ไต่สวน = Blue/Red **วนหลายรอบ** + memory persist + grill ทุก finding + user ยืนยันทุกรอบ (หนักสุด)

### 4.4 Auto-suggest signals (Task A — ใช้ตอนผู้ใช้ไม่ระบุ mode)
ประเมินจาก signals: ความกำกวม/ความกว้างของ request · tier ถ้ารู้ (`large`→แนะ `ละเอียด`) · จำนวน trade-off/decision ที่คาด · ความอ่อนไหว (แตะ hard-floor 5 หมวดของ `change-sizing`) · งานชัด+เล็ก. **ผลลัพธ์ = แนะนำ + เหตุผล → user ยืนยัน/เปลี่ยน** (ไม่ auto-run — pattern เดียวกับ "DESIGN sizing gate" ของ `change-sizing/feature.md` องค์ประกอบ #5: assess → recommend + เหตุผล → user ยืนยัน; sizing logic จริงในplaybook อยู่ `design.md §7`+gate `§8`)

#### 4.4.1 Signal-resolution + precedence (★ fixture ให้ verify — แก้ QA-B2)
> ลำดับ precedence (สูง→ต่ำ) — กันเคส signal ขัดกัน วัดผลได้:
1. **hard-floor sensitivity ทับสุด** — แตะ hard-floor 5 หมวด (auth/authz · data-migration/schema · secret/credential · public-API breaking · security-sensitive) → **floor = `สมดุล`** (ห้ามแนะต่ำกว่า แม้งานดูเล็ก)
2. **tier `large`** (ถ้า establish แล้ว) → แนะ `ละเอียด`
3. **ความกำกวม/หลาย trade-off สูง** → `ละเอียด`; ผู้ใช้ขอ stress-test หลายมุมชัด → `โต้วาที`
4. **งานชัด + เล็ก + ไม่แตะ hard-floor** → `ไว`
5. **ก้ำกึ่ง** (ไม่มี signal เด่นไปทางใด) → fallback `สมดุล`

| เคส fixture | signals | mode ที่คาด (verify assert) |
|---|---|---|
| typo fix ใน README | เล็ก+ชัด, ไม่ sensitive | `ไว` |
| เพิ่ม field ใน config ทั่วไป | กลาง, ชัด | `สมดุล` |
| **เล็ก+ชัด แต่แตะ auth** | งานเล็ก ↔ hard-floor | **`สมดุล`** (precedence 1 ทับ 4) |
| refactor ข้าม module หลายทางเลือก | กำกวม+หลาย trade-off | `ละเอียด` |
| เลือก architecture ที่ยังถกเถียง | ผู้ใช้ขอหลายมุม | `โต้วาที` |

## 5. Flow

### 5.1 Mode selection flow (ทุก mode)
```
/warnyin:discovery <slug> [คำอธิบาย/keyword mode]
  → command map keyword → mode? 
      มี explicit → ใช้ mode นั้น
      ไม่มี → ชี้ playbook auto-suggest (§4.4): ground เบื้องต้น → ประเมิน signals
              → เสนอ mode + เหตุผล → user ยืนยัน/เปลี่ยน
  → เดิน Discovery loop เดิม ปรับความเข้มตาม behavior contract (§4.3)
```

### 5.2 Debate flow (mode โต้วาที) — "Parallelize gathering, serialize judgment"
```
1. ground (input ครบ) + ร่างประเด็นตั้งต้น (scope/สมมติฐานหลัก)
2. fan-out persona agents (Agent tool, read-only, ขนาน):
   - เลือก 3–4 persona จาก roles/ ที่เกี่ยวกับ scope (ba/po/sa/security/tech-lead)
     + บังคับมี 1 "skeptic/red-team" (มุมแย้ง: หาจุดอ่อน/สมมติฐานผิด/ทางที่ตัดทิ้ง)
   - **context ที่ส่งเข้า persona = artifact-level เท่านั้น** (scope/สมมติฐาน/ประเด็น) — ไม่ส่ง raw filesystem context; persona read-only บน Discovery artifacts ไม่ scan secret path (Security-P1)
   - แต่ละตัวคืน: จุดยืน + ความเสี่ยง/ข้อโต้แย้ง + คำถามต่อ scope (ไม่แตะไฟล์)
3. main loop รวบ → ถ้ามีข้อขัดแย้งสำคัญ → รอบโต้แย้งเพิ่ม (cap ≤ 2 รอบ)
4. main loop **สังเคราะห์** (judgment ไม่ delegate) → ข้อสรุป + คำถามที่เหลือต่อ user
5. converge เมื่อ: ไม่มีประเด็นใหม่ หรือครบ cap → จดลง discovery.md decision log
   **เป็นข้อสรุป/ประเด็น ไม่ paste raw value/credential/internal path** (Security — กัน secret leak ผ่าน committed artifact)
```
- **fallback (เต็ม):** spawn ไม่ได้เลย / เครื่องไม่มี Agent tool (เช่น Codex/Antigravity) → degrade เป็น mode `ละเอียด` (grill เดี่ยว) + **แจ้ง user เหตุผลชัด** (ไม่เงียบ)
- **fallback (partial):** บาง persona fail/timeout → main loop สังเคราะห์จากที่ได้ + แจ้ง coverage ที่ขาด; **ถ้า skeptic หาย → degrade `ละเอียด`** (เสีย red-team guarantee)
- **token guard (hard cap):** สูงสุด **4 persona + 2 รอบ** — เกินให้ converge ด้วย main-loop judgment ทันที (กัน unbounded spawn)
- **sensitivity override warning:** ถ้า user เลือก mode ต่ำกว่าที่ auto-suggest ตั้งเพราะ hard-floor signal (§4.4.1 precedence 1) → แสดง warning สั้น ("งานแตะหมวดอ่อนไหว X — mode นี้ scrutiny อาจไม่พอ") แบบ warn-not-block ก่อนเดินต่อ

### 5.3 ไต่สวน flow (mode `ไต่สวน`) — Blue/Red adversarial iterative + user-in-loop
> หลัก: Blue สร้าง → Red audit (adversarial) → grill user ทุก finding → Blue แก้ → วนจน converge
> reuse: debate fan-out (§5.2 หลักการ) + grill (mode `ละเอียด`) + role cards; memory persist ข้ามรอบ

**Memory artifact (เกิดใน `docs/stages/<slug>/debate/` ของ topic ที่ใช้ mode นี้):**
| ไฟล์ | เจ้าของ | เนื้อหา |
|---|---|---|
| `blue-memory.md` | 🔵 Blue | ความเข้าใจ/scope/findings ที่ Blue สะสม (อัปเดตทุกรอบที่ user ยอมรับ) |
| `red-memory.md` | 🔴 Red | audit findings ข้ามรอบ + สถานะ (open/resolved) — กัน Red ซ้ำประเด็นเดิม |
| `debate-round-NN.md` | 🔴 Red | finding ของรอบ NN (5 มุม × role) — 1 ไฟล์/รอบ |

**Flow (วน ROUND NN):**
```
1. 🔵 Blue Team → discovery + research (รอบแรก = ground เต็ม; รอบถัดไป = update ตาม finding ที่ user ยอมรับ)
   → สรุป "มีอะไรบ้าง" → เขียน/อัปเดต blue-memory.md
2. 🔴 Red Team → fan-out role ที่เกี่ยวกับ scope (sa/security/qa/tech-lead/infra, read-only)
   แต่ละ role audit ครบ 5 มุม "ตามลำดับ" ในมุมมอง role ตัวเอง — complain ละเอียด ไม่เสนอวิธีแก้:
     ① จุดผิด/บกพร่อง  ② จุดขาดหาย (Must Have)  ③ จุดเสี่ยงที่กลไกพลาด
     ④ จุดไม่สอดคล้อง/ขัดแย้ง  ⑤ จุดขาดแล้วกระทบ (Should Have)
   → main loop รวบ (judgment ไม่ delegate) → เขียน debate-round-NN.md + อัปเดต red-memory.md
3. 📋 สรุป finding → 🎤 grill user ทีละ item (สัมภาษณ์ทุกรายการใน debate-round-NN — reuse mode ละเอียด/grill)
4. user ยอมรับ/เข้าใจตรงกัน:
   → 🔵 Blue update discovery.md + research.md + blue-memory.md ตาม finding ที่ตกลง
   → ❓ ถาม user "audit รอบต่อไหม?" (เผื่อ user พอแล้ว)
   → ต่อ: กลับ 2 (Red audit) → debate-round-(NN+1)
5. converge เมื่อ: Red audit แล้ว **0 finding ใหม่** (ไม่สร้าง round) หรือ user บอกพอ → ปิด ไต่สวน
```

**Cap / guard:**
- ก่อน audit รอบใหม่ทุกครั้ง **ถาม user ก่อน** (ไม่วนเงียบ) — soft cap, user คุมจำนวนรอบ
- Red fan-out cap ≤ 5 role/รอบ; แต่ละ role audit ครบ 5 มุม
- **fallback:** spawn ไม่ได้/เครื่องไม่มี Agent tool → degrade เป็น `ละเอียด` (grill เดี่ยว) + แจ้ง user (เหมือน §5.2)

**Security (reuse §5.2 หลัก):** Red รับ artifact-level context (blue-memory/discovery) ไม่ใช่ raw filesystem; memory files = ข้อสรุป/ประเด็น ไม่ paste secret

## 6. ผลกระทบต่อระบบเดิม
- `discovery.md` playbook: **เพิ่ม section + แทรกจุด mode** (operating principles/process loop อ้าง mode) — คงโครงเดิมทั้งหมด → backward-compatible
- `grill mode` เดิม (§3): เปลี่ยนเป็น **alias ของ `ละเอียด`** — "ซักถามฉันหน่อย/grill me" ยังทำงาน (map → ละเอียด)
- command `discovery.md`: เพิ่มขั้น mode select — ผู้ใช้เดิมที่ไม่สนใจ mode ยังใช้ได้ (auto-suggest → สมดุล โดยปริยายถ้างานทั่วไป)
- **ไม่แตะ:** tier `change-sizing`, context-profile, stage อื่น, installer code (`cli.mjs`), AGENTS.md (Codex อ่าน playbook กลางเดียวกัน — ได้ mode ฟรี)
- backward compatibility: ✅ ทุกจุดเป็น additive
- **★ Task A ต้องใส่ตารางเทียบ 3 แกนใน section "Discovery modes" ของ playbook** (ปิดความเสี่ยง "ไว vs fast" สับสน ที่ proposal §5 สัญญา): `mode` (ความเข้ม Discovery, stage axis) ≠ `tier change-sizing` (ขนาด change, ข้าม stage) ≠ `context-profile` (session posture) — orthogonal กัน เชื่อมแค่ผ่าน auto-suggest signal

## 7. Dependency ระหว่าง slice/task
```
contract §4 (mode taxonomy + anchor)
   ├──▶ task A (discovery-playbook-modes)   [owns: src/.warnyin/workflow/stages/discovery.md]
   └──▶ task B (discovery-command-adapter)  [owns: src/.claude/commands/warnyin/discovery.md + src/.warnyin/workflow/README.md]
```
- **critical-path depth:** 1 (ทั้ง 2 task อยู่ wave เดียว)
- **max wave width:** 2 (ขนานได้)
- **เหตุผล decouple:** contract-first (§3 ข้อ 1 ของ design playbook) — Task B พึ่ง **mode taxonomy contract §4** (ชื่อ mode + keyword + section anchor) ไม่ใช่ runtime ของ Task A; file-ownership **disjoint** (playbook vs command+README) → ไม่ชน → parallel; integration พิสูจน์ที่ full-gate (verify เดิน end-to-end)

## 8. Test strategy ระดับ design
> bar เดียวกับ `change-sizing` observable demo (`installer/test.md`: deterministic count, ไม่ใช่ AI-judgment ลอย)

### 8.1 Observable metric ต่อ mode (★ แก้ QA-B1 — นับได้ deterministic เทียบ baseline `สมดุล`)
| mode | observable proxy (falsifiable) |
|---|---|
| สมดุล | **baseline** — เดินกิ่งหลักของ decision tree, ถาม N คำถาม |
| ไว | ถาม **≤ K** คำถาม (K < N) + นับ branch ของ decision tree ที่ skip ≥1 + ไม่มี deep research |
| ละเอียด | เดิน**ครบทุกกิ่ง** decision tree + มี grill turn ≥1 + role lens BA/PO ปรากฏ |
| โต้วาที | เห็น **Agent-tool call ≥3** (persona) + decision-log มี entry "สังเคราะห์จาก debate" + cap ≤4/≤2 ไม่ทะลุ |
| ไต่สวน | มี `debate/{blue-memory,red-memory,debate-round-NN}.md` ≥1 รอบ + Red fan-out role (audit ครบ 5 มุม) + grill user ทุก finding ใน round + **ถาม user ก่อน audit รอบใหม่** + converge เมื่อ 0 finding ใหม่/user หยุด |

### 8.2 เคส verify อื่น
- **auto-suggest fixture (§4.4.1):** เดิน 5 เคส fixture → assert mode ที่ได้ตรงตาราง (รวมเคส precedence ขัดกัน "เล็ก+auth→สมดุล")
- **backward-compat / grill regression (QA-S2):** "ซักถามฉันหน่อย"→เข้า ละเอียด **และ** ยืนยัน section grill เดิมถูก fold เข้า ละเอียด (ไม่เหลือ behavior grill ซ้ำแยก — grep section เดิมไม่มี)
- **no-duplicate (QA-S1):** command **มี** keyword-alias map ได้ (ชอบ) แต่ **ห้ามมี** behavior contract (§4.3) / auto-suggest signal (§4.4) ซ้ำ; ยืนยัน command ชี้ section anchor §4.2 จริง (anchor-resolve)
- **fallback (QA-S3, structural):** verify = อ่าน playbook เห็น fallback instruction + เงื่อนไข trigger ชัด (spawn ไม่ได้ / เครื่องไม่มี Agent tool / skeptic หาย) + observable signal เมื่อ degrade (แจ้ง user) — **ไม่ต้อง spawn จริง**; full spawn-real proof = optional/defer ถ้า token จำกัด (แนว build-orchestration defer e2e)
- **structural:** `validate-topic.mjs` ไม่มี ✖; payload เดิม (additive) → ไม่ต้องแตะ verify-pack allowlist/R1 (Infra ยืนยัน)
- **★ dogfood note (Infra-1):** VERIFY ที่เดิน Discovery จริงต้องชี้ playbook **`src/` ที่เพิ่งแก้** (หรือ `setup:sandbox`/`setup:dogfood` ก่อน) — ไม่ใช่ root dogfood ที่ install จาก `@latest` (stale) → กัน false-green

## 9. Spec delta (เทียบ docs/features/discovery-modes/spec.md ปัจจุบัน)
> feature `discovery-modes` **ยังไม่มี** spec เดิม → ทุก Requirement เป็น **ADDED** (baseline ใหม่ตอน SHIP); ไม่มี MODIFIED/REMOVED

### ADDED

#### Requirement: Discovery mode taxonomy (→ feature: discovery-modes)
Discovery รองรับ mode 5 ค่า `{ไว, สมดุล, ละเอียด, โต้วาที, ไต่สวน}` ที่คุมความเข้มของ stage โดยทั้งหมดยังสวม context-profile `research`
- **Scenario:** WHEN ผู้ใช้เลือก mode `ไว` THEN Discovery ถามเฉพาะจุดที่ block + research minimal + รีบสรุป scope
- **Scenario:** WHEN ผู้ใช้เลือก mode `ละเอียด` THEN Discovery เดินทุกกิ่ง decision tree + role lens BA/PO เต็ม + grill
- **Scenario:** WHEN ผู้ใช้เลือก mode `สมดุล` THEN พฤติกรรม = Discovery ปัจจุบัน (สัมภาษณ์ทีละข้อ + research พอประมาณ)

#### Requirement: Auto-suggest mode (→ feature: discovery-modes)
เมื่อผู้ใช้ไม่ระบุ mode Discovery ประเมินบริบทแล้วแนะนำ mode พร้อมเหตุผล โดยผู้ใช้ override ได้เสมอ (ไม่ auto-run)
- **Scenario:** WHEN เรียก `/warnyin:discovery` โดยไม่ระบุ mode THEN ระบบ ground เบื้องต้น → เสนอ mode + เหตุผล → รอผู้ใช้ยืนยัน/เปลี่ยน
- **Scenario:** WHEN งานก้ำกึ่ง THEN ค่าที่แนะนำ fallback = `สมดุล`
- **Scenario:** WHEN topic ถูก establish เป็น tier `large` THEN auto-suggest แนะ `ละเอียด` (signal ไม่บังคับ)

#### Requirement: Debate mode orchestration (→ feature: discovery-modes)
mode `โต้วาที` fan-out persona agents มาเสนอ/แย้งหลายมุมแบบขนาน (read-only) แล้ว main loop สังเคราะห์เป็นข้อสรุปเดียว (judgment ไม่ delegate)
- **Scenario:** WHEN เข้า mode โต้วาที THEN spawn 3–4 persona (รวม skeptic ≥1) เสนอจุดยืน+ข้อโต้แย้ง → main loop สังเคราะห์ → จด decision log
- **Scenario:** WHEN spawn agent ไม่ได้ THEN degrade เป็น mode `ละเอียด` + แจ้งผู้ใช้ (fallback)
- **Scenario:** WHEN debate ดำเนิน THEN จำกัด persona ≤ 4 และรอบ ≤ 2 (token guard)

#### Requirement: grill เป็น alias ของ ละเอียด (→ feature: discovery-modes)
คำสั่ง grill เดิมยังทำงาน โดย map เข้า mode `ละเอียด` (ไม่มี grill เป็นแกนแยก)
- **Scenario:** WHEN ผู้ใช้พิมพ์ "ซักถามฉันหน่อย" หรือ "grill me" THEN เข้า mode `ละเอียด`

#### Requirement: mode orthogonal กับ tier change-sizing (→ feature: discovery-modes)
mode (ความเข้ม Discovery) เป็นแกนแยกจาก tier (ขนาด change) — เชื่อมกันแค่ผ่าน auto-suggest signal
- **Scenario:** WHEN เลือก mode ใดก็ตาม THEN ไม่เปลี่ยน tier ของ topic และไม่ข้าม hard-floor ของ `change-sizing`

#### Requirement: ไต่สวน mode — Blue/Red adversarial iterative (→ feature: discovery-modes)
mode `ไต่สวน` เดิน Blue/Red 2 ทีมวนหลายรอบ มี user-in-loop: Blue ทำ discovery+research → Red audit (fan-out role, ครบ 5 มุม) → grill user ทุก finding → Blue แก้ → วนจน converge; memory persist ใน `docs/stages/<slug>/debate/`
- **Scenario:** WHEN เข้า mode ไต่สวน THEN Blue เขียน `blue-memory.md`, Red fan-out role audit ครบ 5 มุม (จุดผิด/Must-Have/จุดเสี่ยง/ขัดแย้ง/Should-Have) เขียน `debate-round-NN.md` + `red-memory.md`
- **Scenario:** WHEN Red audit จบรอบ THEN grill user ทุก finding ใน `debate-round-NN.md` → user ยอมรับ → Blue update discovery/research/blue-memory
- **Scenario:** WHEN จบ Blue update THEN ถาม user ก่อน audit รอบต่อ; converge เมื่อ Red 0 finding ใหม่ หรือ user หยุด
- **Scenario:** WHEN spawn ไม่ได้/เครื่องไม่มี Agent tool THEN degrade เป็น `ละเอียด` + แจ้ง user
- **Scenario:** WHEN auto-suggest ทำงาน THEN ไม่แนะ `ไต่สวน` เอง (explicit-only — หนักสุด user-in-loop)

---

## 10. Design review (panel 5 role — 2026-06-11)

fan-out reviewer ขนาน (read-only): `warnyin-{sa,tech-lead,qa,security,infra}` รีวิว proposal+design

### ผลรวม
| role | blocker | สถานะ |
|---|---|---|
| SA | ไม่มี | ✅ ผ่าน (orthogonality/contract/single-source/debate ผ่าน) |
| Tech Lead | ไม่มี | ✅ ผ่าน (file-disjoint→parallel จริง, contract-first sound) |
| QA | **2 (B1, B2)** | ✅ **แก้ครบแล้ว** |
| Security | ไม่มี | ✅ ผ่าน (debate read-only, ไม่ bypass hard-floor) |
| Infra | ไม่มี | ✅ ผ่าน (payload ship ครบ, zero-dep, ไม่แตะ verify-pack) |

### Blocker ที่แก้ (QA)
- **B1 — ไม่มี observable metric นับได้** → เพิ่ม §8.1 observable proxy ต่อ mode (≤K คำถาม / branch skip / grill turn / Agent-call ≥3) เทียบ baseline สมดุล — deterministic, falsifiable
- **B2 — auto-suggest ไม่มี fixture + signal precedence** → เพิ่ม §4.4.1 precedence (hard-floor floor=สมดุล ทับสุด) + ตาราง 5 เคส fixture (รวมเคสขัดกัน) ให้ verify รัน

### Suggestion ที่รับมาแก้ใน design
- SA-1 anchor "§4 step 1.5" ผิด → แก้ชี้ "DESIGN sizing gate" component #5 + §7/§8 (design §4.4, discovery decision 6)
- SA-3 fallback partial-failure → §5.2 (บาง persona/skeptic fail → degrade)
- SA-4 ตารางเทียบ 3 แกน → §6 note ให้ Task A ใส่ใน playbook
- TechLead-S1 Model tier ต่อ task → §2 (A=deepest, B=balanced)
- TechLead-S3 อย่าพึ่ง build.md §6 → §2 note (debate self-contained)
- QA-S1 no-duplicate แยก alias/behavior · QA-S2 grill regression · QA-S3 fallback structural · QA-S4 multi-match → §8.2 + §4.1
- Security 1-4 (secret isolation / sensitivity warning / hard cap / decision-log scrub) → §5.2
- Infra-1 dogfood regen note → §8.2

### Defer / ฝากให้ task author (ไม่ block)
- SA-2 debate เป็น sub-task ใน Task A (ไฟล์เดียว — คง 2-task, แตก sub-task ภายใน) → §2 note
- QA-S5 / full spawn-real proof = optional/defer ถ้า token จำกัด → §8.2

---

## 11. Amend log — mode 5 `ไต่สวน` (2026-06-11)

> หลัง topic ผ่าน VERIFY (4 mode) — user ขอเพิ่ม mode ที่ 5 `ไต่สวน` (Blue/Red adversarial iterative) → กลับ DESIGN amend

**การตัดสินใจ (user ยืนยัน):**
- `ไต่สวน` = **mode ที่ 5 ใหม่** (โต้วาทีเดิมคงไว้ — quick fan-out; ไต่สวน = หนักสุด iterative)
- amend topic เดิม (ยังไม่ ship) — re-design → re-build เฉพาะ debate/mode slice
- memory ใน `docs/stages/<slug>/debate/` (archive พร้อม topic)
- ชื่อ canonical `ไต่สวน`; Red = **fan-out role × audit ครบ 5 มุม** (role=ความสามารถ, 5 มุม=lens)

**สิ่งที่แก้ใน design:** §4.1 taxonomy (+ไต่สวน, explicit-only) · §4.3 behavior (+คอลัมน์) · §5.3 flow ใหม่ (Blue/Red + memory) · §8.1 observable proxy · §9 spec delta (R1 4→5, +R6 ไต่สวน 5 scenario)

**ผลต่อ task:** Task A เพิ่ม sub-task (e) ไต่สวน §5.3; Task B เพิ่ม keyword `ไต่สวน` — file-ownership/DAG เดิม (width 2)

**re-build scope:** wave เดียว (เหมือนเดิม) — Task A rewrite §3.5 (+ §3.5.7 ไต่สวน), Task B + keyword; full-gate เดิม
