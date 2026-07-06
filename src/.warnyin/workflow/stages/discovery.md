# Stage: DISCOVERY (optional)

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: เปลี่ยนความต้องการที่ยังคลุมเครือ ให้เป็น **ความเข้าใจร่วมกัน (shared understanding)** ที่ชัดพอจะเข้า DESIGN ได้
> **Context profile:** สวมโหมด `research` (`.warnyin/workflow/contexts/research.md`) — session-level posture ของ stage นี้

---

## 1. Discovery คืออะไร / ใช้เมื่อไหร่

Discovery คือขั้นตอน **ค้นหาข้อมูล + deep research + สัมภาษณ์** เพื่อตี scope สิ่งที่ user ต้องการ
จากภาพกว้าง → แคบลงเรื่อยๆ จนทุกฝ่ายเข้าใจตรงกันก่อนลงมือออกแบบ

- **optional** — ข้ามได้ถ้า scope ชัดอยู่แล้ว (งานเล็ก/ชัดเจน) แล้วไป DESIGN ตรงๆ
- ใช้เมื่อ: โจทย์กว้าง/กำกวม, มีหลายทางเลือก, มี trade-off ที่ต้องตัดสินใจ, หรือ user พิมพ์ **"ซักถามฉันหน่อย" / "grill me"** (→ เข้า mode `ละเอียด` ดู §3.5)
- **ความเข้มของ Discovery ปรับได้ด้วย mode** (`ไว` / `สมดุล` / `ละเอียด` / `โต้วาที` / `ไต่สวน`) — ดู section **"Discovery modes (ความเข้มของ Discovery)"** (§3.5) เป็น single source ของพฤติกรรมแต่ละ mode

---

## 2. Input ที่ต้องอ่านก่อนเริ่ม (เรียงลำดับ)

อ่านเพื่อ "ground" ตัวเองในบริบทโปรเจกต์ — **อย่าเพิ่งถาม user สิ่งที่หาเองได้**

1. `docs/project.md` — ★ จุดเริ่มเสมอ: โปรเจกต์นี้คืออะไร เป้าหมาย ลูกค้า ขอบเขต
2. `docs/rule.md`, `docs/infra.md` — กฎและโครงสร้างพื้นฐาน
3. `docs/codemap/index.md` — แผนที่โค้ด (ไปอ่านโค้ดจริงต่อได้)
4. `docs/features/*`, `docs/techstack/*` — ฟีเจอร์เดิม + tech stack ของแต่ละ component
5. `docs/stages/context.md` และ topic ที่ `achieved/` ที่ใกล้เคียง — เคยทำอะไรไปแล้ว
6. `docs/backlog.md` — งาน deferred-out (open) ที่เคยยกออกจาก scope ก่อนหน้า (ถ้ามี; default-exclude `achieved/`) — ดู [`.warnyin/workflow/backlog.md` §Consume](../backlog.md)

---

## 3. หลักการทำงาน (operating principles)

1. **กว้าง → แคบ:** เริ่มจากภาพรวม แล้วค่อยๆ ตี scope ให้แคบลงทีละชั้น (problem → goal → ขอบเขต → ทางเลือก → รายละเอียด)
2. **ถามทีละข้อ (one question at a time):** ห้ามถามรัวหลายข้อพร้อมกัน รอคำตอบก่อนค่อยถามข้อถัดไป
3. **เสนอคำตอบที่แนะนำทุกครั้ง:** ทุกคำถามต้องแนบ *recommended answer* + เหตุผลสั้นๆ ให้ user แค่ยืนยัน/แก้ ไม่ใช่คิดเองทั้งหมด
4. **โค้ดตอบได้ → ไปอ่านโค้ด ไม่ต้องถาม:** ถ้าคำถามไหนตอบได้ด้วยการ inspect โค้ด/เอกสาร ให้ไปหาคำตอบเองแล้วรายงานสิ่งที่พบ แทนการถาม user — ถ้ามี `.understand-anything/knowledge-graph.json` → อ่าน**ข้อเท็จจริงเชิงโครงสร้าง**เป็นเบาะแสเสริม (ยืนยันกับโค้ดจริงเสมอ เป็นเบาะแส ไม่ใช่ ground-truth); ไม่มี + repo ใหญ่/ไม่คุ้น → แนะนำรัน companion tool — ดู [`../interop`](../interop.md)
5. **เดินทีละกิ่งของ decision tree:** ไล่ทุกแขนงของการตัดสินใจ แก้ความสัมพันธ์ระหว่างการตัดสินใจทีละจุด ไม่ข้าม
6. **บันทึกทันทีที่ตกลงได้:** พอได้ข้อสรุปที่ชัดเจนในประเด็นไหน ให้จดลง `discovery.md` (decision log) เลย ไม่รอจบ
7. **ทุกข้อสรุปต้องสอดคล้องกับโปรเจกต์:** อ้างอิงกลับไปที่ `docs/project.md` และข้อจำกัดจริงเสมอ
8. **ใช้ role lens ตอนตั้งคำถาม:** มอง scope ผ่าน checklist ของ **BA** (`.warnyin/workflow/roles/ba.md` — business process, ข้อยกเว้น, ข้อมูล, ข้อจำกัด) และ **PO** (`.warnyin/workflow/roles/po.md` — คุณค่า, priority, MVP, scope out, success metric) เพื่อให้คำถามครบมุมไม่หลุดประเด็น
9. **mode = dial ปรับความเข้ม ไม่ใช่ flow ใหม่:** หลักการทั้ง 8 ข้อข้างบนคือ loop กลางของ Discovery; **mode** (§3.5) เป็นแค่ตัวปรับ "ความเข้ม" ของ loop นี้ (ถามมาก/น้อย, research ลึก/ตื้น, เดินกี่กิ่งของ decision tree, single vs multi-agent) — ไม่ใช่ flow แยกคนละชุด

> **"ซักถามฉันหน่อย" (grill) = alias ของ mode `ละเอียด`** — พฤติกรรม grill (ซักทุกแง่มุม: สมมติฐาน, edge case, ทางเลือกที่ตัดทิ้ง, ผลกระทบ, ต้นทุน, ความเสี่ยง, เกณฑ์สำเร็จ) เป็น behavior ของ mode `ละเอียด` ดู §3.5 — ไม่มี behavior grill เป็นแกนแยกอีกต่อไป

---

## 3.5 Discovery modes (ความเข้มของ Discovery)

> **★ Single source ของ mode** — taxonomy + behavior + auto-suggest + debate อยู่ที่ section นี้ที่เดียว command/README/ที่อื่นชี้มา ไม่ duplicate
> mode = **dial ปรับความเข้มของ loop §3** ไม่ใช่ flow ใหม่ 5 ชุด; ทั้ง 5 mode ยังสวม context-profile `research` (`.warnyin/workflow/contexts/research.md`) เหมือนกัน

### 3.5.1 Taxonomy (5 ค่า canonical)

| mode | ชื่อ canonical | เหมาะกับ |
|---|---|---|
| `ไว` | `ไว` | งานชัด/เล็ก — รีบตี scope |
| `สมดุล` | `สมดุล` | งานทั่วไป (= พฤติกรรม Discovery ปัจจุบัน, เป็น baseline + ค่า fallback) |
| `ละเอียด` | `ละเอียด` | งานเสี่ยง/กำกวม/หลาย trade-off (รวม grill) |
| `โต้วาที` | `โต้วาที` | งานที่ต้อง stress-test สมมติฐานหลายมุม |
| `ไต่สวน` | `ไต่สวน` | งาน high-stakes ที่ต้องตรวจความครบ/ถูกต้องเข้มสุด แบบ adversarial มี user ในวง (**explicit-only** — auto-suggest ไม่แนะเอง) |

### 3.5.2 3 แกนที่ต้องไม่สับสน (mode ≠ tier ≠ context-profile)

> ★ ปิดความเสี่ยง "ไว vs fast" — 3 แกนนี้ **orthogonal** กัน เชื่อมกันแค่ผ่าน auto-suggest signal (§3.5.4)

| แกน | คุมอะไร | scope | ค่า |
|---|---|---|---|
| **mode** (อันนี้) | **ความเข้มของ Discovery** | stage Discovery stage เดียว | `ไว`/`สมดุล`/`ละเอียด`/`โต้วาที`/`ไต่สวน` |
| **tier** (`change-sizing`/`triage.md`) | **ขนาดของ change** | ข้าม stage (route ทั้ง workflow) | `fast`/`standard`/`large` |
| **context-profile** (`.warnyin/workflow/contexts/`) | **session posture** ของ stage | session-level | `research`/`build`/`review` |

- mode `ไว` ≠ tier `fast`: `ไว` คุม "ถามน้อย/research ตื้น" ใน Discovery; `fast` คุม "งานเล็ก route สั้น" ข้าม stage — เลือก mode ใดก็ตาม **ไม่เปลี่ยน tier** ของ topic และ **ไม่ข้าม hard-floor** ของ `change-sizing`

### 3.5.3 Behavior contract ต่อ mode (falsifiable)

> baseline = `สมดุล` (= loop §3 ปัจจุบัน, ถาม N คำถามครบกิ่งหลัก); mode อื่นวัดเทียบ baseline นี้

| มิติ | `ไว` | `สมดุล` (=ปัจจุบัน, baseline) | `ละเอียด` | `โต้วาที` | `ไต่สวน` |
|---|---|---|---|---|---|
| ground input | `project.md` + เท่าที่จำเป็น | input หลัก (§2) | input ครบ (§2) | input ครบ (§2) | input ครบ (§2, Blue) |
| การถาม | เฉพาะจุดที่ block จริง (ถาม ≤ K, K<N) | ทีละข้อ ครบกิ่งหลัก (N คำถาม) | ทุกกิ่ง decision tree + role lens BA/PO เต็ม + **grill turn ≥1** | ขับเคลื่อนด้วยประเด็นจาก debate | **grill ทุก finding** ของ Red ทุกรอบ (user-in-loop) |
| research | minimal (ไม่มี deep research) | คู่ขนานพอประมาณ | deep | deep | deep (Blue) + adversarial audit (Red) |
| decision tree | skip branch ที่ไม่ block ≥1 กิ่ง | เดินกิ่งหลัก | เดินครบทุกกิ่ง | เดินครบ + แย้งทุกกิ่ง | เดินครบ + Red audit ครบ 5 มุมทุกรอบ |
| multi-agent | ✗ | ✗ | ✗ | ✓ (debate §3.5.5, fan-out ครั้งเดียว) | ✓✓ (Blue/Red 2 ทีม **iterative** §3.5.7) |

> **`โต้วาที` vs `ไต่สวน`:** `โต้วาที` = fan-out persona **ครั้งเดียว** → สังเคราะห์ → ถามตอนจบ (เบากว่า); `ไต่สวน` = Blue/Red **วนหลายรอบ** + memory persist + grill ทุก finding + user ยืนยันทุกรอบ (หนักสุด)

**Observable proxy (verify นับได้ deterministic เทียบ baseline `สมดุล`):**

| mode | observable proxy (falsifiable) |
|---|---|
| `สมดุล` | **baseline** — เดินกิ่งหลัก decision tree, ถาม N คำถาม |
| `ไว` | ถาม **≤ K** (K < N) + branch ของ decision tree ที่ skip **≥1** + ไม่มี deep research |
| `ละเอียด` | เดิน**ครบทุกกิ่ง** decision tree + grill turn **≥1** + role lens BA/PO ปรากฏ |
| `โต้วาที` | Agent-tool call (persona) **≥3** + decision-log มี entry **"สังเคราะห์จาก debate"** + ไม่ทะลุ cap ≤4 persona/≤2 รอบ |
| `ไต่สวน` | มี `debate/{blue-memory,red-memory,debate-round-NN}.md` **≥1 รอบ** + Red fan-out role (audit ครบ 5 มุม) + grill user ทุก finding ใน round + **ถาม user ก่อน audit รอบใหม่** + converge เมื่อ 0 finding ใหม่/user หยุด + **explicit-only** (auto-suggest ไม่แนะ) |

### 3.5.4 Auto-suggest (ใช้เมื่อ user ไม่ระบุ mode)

ground เบื้องต้นก่อน → ประเมิน signals → **เสนอ mode + เหตุผล → รอ user ยืนยัน/เปลี่ยน** (ไม่ auto-run — pattern เดียวกับ DESIGN sizing gate ของ `change-sizing`: assess → recommend + เหตุผล → user ยืนยัน)

**Signals:** ความกำกวม/ความกว้างของ request · tier ถ้ารู้ (`large` → แนะ `ละเอียด`) · จำนวน trade-off/decision ที่คาด · ความอ่อนไหว (แตะ hard-floor 5 หมวดของ `change-sizing`) · งานชัด+เล็ก

**Precedence (สูง→ต่ำ — กันเคส signal ขัดกัน, วัดผลได้):**
1. **hard-floor sensitivity ทับสุด** — แตะ hard-floor 5 หมวด (auth/authz · data-migration/schema · secret/credential · public-API breaking · security-sensitive) → **floor = `สมดุล`** (ห้ามแนะต่ำกว่า แม้งานดูเล็ก)
2. **tier `large`** (ถ้า establish แล้ว) → แนะ `ละเอียด`
3. **ความกำกวม/หลาย trade-off สูง** → `ละเอียด`; user ขอ stress-test หลายมุมชัด → `โต้วาที`
4. **งานชัด + เล็ก + ไม่แตะ hard-floor** → `ไว`
5. **ก้ำกึ่ง** (ไม่มี signal เด่นไปทางใด) → fallback `สมดุล`

**Keyword/alias (เมื่อ user พิมพ์ตรงๆ — command map มาให้ หรือ playbook อ่านเอง):**

| mode | keyword/alias (ไทย/อังกฤษ) |
|---|---|
| `ไว` | "ไว", "เร็ว", "quick", "fast", "เอาเร็ว" |
| `สมดุล` | "สมดุล", "ปกติ", "balanced", "default" |
| `ละเอียด` | "ละเอียด", "ลึก", "deep", "grill", "ซักถามฉันหน่อย", "grill me" |
| `โต้วาที` | "โต้วาที", "debate", "ถกเถียง", "แย้งกัน" |
| `ไต่สวน` | "ไต่สวน", "audit", "red-team", "blue-red", "ตรวจเข้ม" |

- **multi-match / keyword ขัดกัน** (เช่น "เอาเร็วแต่ขอละเอียด" เจอทั้ง `ไว`+`ละเอียด`) → **ห้าม** first-match เงียบ; **fall through ไป auto-suggest precedence ข้างบน** (เสนอ + เหตุผล → user ยืนยัน)
- ไม่ match keyword ใดเลย → auto-suggest precedence
- **`ไต่สวน` = explicit-only:** auto-suggest **ไม่แนะ `ไต่สวน` เอง** (หนักสุด: user-in-loop หลายรอบ) — เข้าได้ก็ต่อเมื่อ user พิมพ์ keyword `ไต่สวน` ตรงๆ หรือขอ "ตรวจให้เข้มสุด/audit/red-team" ชัด

**Fixture (verify assert mode ที่ได้ตรงตาราง):**

| เคส | signals | mode ที่คาด |
|---|---|---|
| typo fix ใน README | เล็ก+ชัด, ไม่ sensitive | `ไว` |
| เพิ่ม field ใน config ทั่วไป | กลาง, ชัด | `สมดุล` |
| **เล็ก+ชัด แต่แตะ auth** | งานเล็ก ↔ hard-floor | **`สมดุล`** (precedence 1 ทับ 4) |
| refactor ข้าม module หลายทางเลือก | กำกวม+หลาย trade-off | `ละเอียด` |
| เลือก architecture ที่ยังถกเถียง | user ขอหลายมุม | `โต้วาที` |

**Sensitivity override warning:** ถ้า user เลือก mode ต่ำกว่าที่ auto-suggest ตั้งเพราะ hard-floor signal (precedence 1) → แสดง warning สั้น ("งานแตะหมวดอ่อนไหว X — mode นี้ scrutiny อาจไม่พอ") แบบ **warn-not-block** ก่อนเดินต่อ

### 3.5.5 Debate orchestration (mode `โต้วาที`) — "Parallelize gathering, serialize judgment"

> หลัก: **fan-out เก็บมุมแบบขนาน → main loop สังเคราะห์/ตัดสินเอง** (judgment ไม่ delegate); ทุก fan-out มี fallback
> debate = Agent-tool call (read-only sub-agent) ที่ AI หลักเรียกตาม playbook นี้ — **ไม่ใช่ Workflow script** (เลี่ยงข้อห้าม top-level `export` ของ payload script); เครื่องที่ไม่มี Agent tool → fallback (ดูล่าง)

```
1. ground (input ครบ) + ร่างประเด็นตั้งต้น (scope / สมมติฐานหลัก)
2. fan-out persona agents (read-only sub-agent, ขนาน):
   - เลือก 3–4 persona จาก roles/ ที่เกี่ยวกับ scope (ba/po/sa/security/tech-lead)
     + บังคับมี 1 "skeptic/red-team" (มุมแย้ง: หาจุดอ่อน / สมมติฐานผิด / ทางที่ตัดทิ้ง)
   - context ที่ส่งเข้า persona = artifact-level เท่านั้น (scope / สมมติฐาน / ประเด็น)
     ไม่ส่ง raw filesystem context; persona read-only บน Discovery artifacts ไม่ scan secret path
   - แต่ละตัวคืน: จุดยืน + ความเสี่ยง/ข้อโต้แย้ง + คำถามต่อ scope (ไม่แตะไฟล์)
3. main loop รวบ → ถ้ามีข้อขัดแย้งสำคัญ → รอบโต้แย้งเพิ่ม (cap ≤ 2 รอบ)
4. main loop สังเคราะห์ (judgment ไม่ delegate) → ข้อสรุป + คำถามที่เหลือต่อ user
5. converge เมื่อ: ไม่มีประเด็นใหม่ หรือครบ cap → จดลง discovery.md decision log
   entry เป็น "สังเคราะห์จาก debate": ข้อสรุป/ประเด็น เท่านั้น
   ไม่ paste raw value / credential / internal path (กัน secret leak ผ่าน committed artifact)
```

**Hard cap (token guard):** สูงสุด **4 persona + 2 รอบ** — เกินให้ converge ด้วย main-loop judgment ทันที (กัน unbounded spawn)

**Fallback (3 เงื่อนไข trigger — degrade ต้องมี observable signal แจ้ง user ไม่เงียบ):**

| เงื่อนไข trigger | พฤติกรรม fallback |
|---|---|
| **spawn ไม่ได้เลย** (Agent tool fail) | degrade เป็น mode `ละเอียด` (grill เดี่ยว) + **แจ้ง user เหตุผลชัด** |
| **เครื่องไม่มี Agent tool** (เช่น Codex/Antigravity ที่ไม่มี sub-agent) | degrade เป็น mode `ละเอียด` + **แจ้ง user** ว่า debate ไม่รองรับบนเครื่องนี้ |
| **skeptic หาย** (บาง persona fail/timeout และตัวที่หาย = skeptic) | degrade เป็น mode `ละเอียด` (เสีย red-team guarantee) + **แจ้ง user** |
| (partial — persona อื่นหาย แต่ skeptic ยังอยู่) | main loop สังเคราะห์จากที่ได้ + **แจ้ง coverage ที่ขาด** (ไม่ degrade เต็ม) |

### 3.5.6 Security (debate)

- **context isolation:** ส่งเข้า persona = artifact-level (scope/สมมติฐาน/ประเด็น) เท่านั้น — ไม่ส่ง raw filesystem; persona read-only ไม่ scan secret path
- **decision-log scrub:** entry ที่จดลง `discovery.md` = ข้อสรุป/ประเด็น ไม่ paste raw value/credential/internal path
- **generic persona/tier:** ระบุ persona + tier แบบ generic (ba/po/sa/security/tech-lead · deepest/balanced) ไม่ผูกชื่อรุ่น model จริง — playbook กลางใช้ได้ทุกเครื่อง (Claude/Codex/Antigravity)

### 3.5.7 ไต่สวน orchestration (mode `ไต่สวน`) — Blue/Red adversarial iterative + user-in-loop

> **หลัก:** Blue สร้าง → Red audit (adversarial) → grill user ทุก finding → Blue แก้ → วนจน converge
> **reuse (ไม่เขียนซ้ำ):** หลักการ fan-out จาก debate (§3.5.5) + grill จาก mode `ละเอียด` (§3.5.3) + role cards (`.warnyin/workflow/roles/`); ต่างที่ memory **persist ข้ามรอบ** + วน iterative + user ยืนยันทุกรอบ
> **explicit-only:** เข้าได้เฉพาะ user ขอชัด (keyword `ไต่สวน`/audit/red-team) — auto-suggest ไม่แนะเอง (§3.5.4)
> เหมือน debate: เป็น **Agent-tool call (read-only sub-agent)** ที่ AI หลักเรียกตาม playbook นี้ — ไม่ใช่ Workflow script; เครื่องที่ไม่มี Agent tool → fallback (ดูล่าง)

**Memory artifact (เกิดใน `docs/stages/<slug>/debate/` ของ topic ที่ใช้ mode นี้ — archive พร้อม topic):**

| ไฟล์ | เจ้าของ | เนื้อหา |
|---|---|---|
| `blue-memory.md` | 🔵 Blue | ความเข้าใจ/scope/findings ที่ Blue สะสม (อัปเดตทุกรอบที่ user ยอมรับ) |
| `red-memory.md` | 🔴 Red | audit findings ข้ามรอบ + สถานะ (open/resolved) — กัน Red ซ้ำประเด็นเดิม |
| `debate-round-NN.md` | 🔴 Red | finding ของรอบ NN (5 มุม × role) — 1 ไฟล์/รอบ |

**Flow (วน ROUND NN):**

```
1. 🔵 Blue Team → discovery + research
   (รอบแรก = ground เต็มตาม §2; รอบถัดไป = update ตาม finding ที่ user ยอมรับ)
   → สรุป "มีอะไรบ้าง" → เขียน/อัปเดต blue-memory.md
2. 🔴 Red Team → fan-out role ที่เกี่ยวกับ scope (sa/security/qa/tech-lead/infra, read-only)
   แต่ละ role audit ครบ 5 มุม "ตามลำดับ" ในมุมมอง role ตัวเอง — complain ละเอียด ไม่เสนอวิธีแก้:
     ① จุดผิด/บกพร่อง  ② จุดขาดหาย (Must Have)  ③ จุดเสี่ยงที่กลไกพลาด
     ④ จุดไม่สอดคล้อง/ขัดแย้ง  ⑤ จุดขาดแล้วกระทบ (Should Have)
   → main loop รวบ (judgment ไม่ delegate) → เขียน debate-round-NN.md + อัปเดต red-memory.md
3. 📋 สรุป finding → 🎤 grill user ทีละ item (สัมภาษณ์ทุกรายการใน debate-round-NN — reuse mode `ละเอียด`/grill)
4. user ยอมรับ/เข้าใจตรงกัน:
   → 🔵 Blue update discovery.md + research.md + blue-memory.md ตาม finding ที่ตกลง
   → ❓ ถาม user "audit รอบต่อไหม?" (เผื่อ user พอแล้ว — ไม่วนเงียบ)
   → ต่อ: กลับข้อ 2 (Red audit) → debate-round-(NN+1)
5. converge เมื่อ: Red audit แล้ว **0 finding ใหม่** (ไม่สร้าง round) หรือ user บอกพอ → ปิด ไต่สวน
```

**Cap / guard:**

- ก่อน audit รอบใหม่ทุกครั้ง **ถาม user ก่อน** (ไม่วนเงียบ) — soft cap, user คุมจำนวนรอบ
- Red fan-out cap **≤ 5 role/รอบ**; แต่ละ role audit ครบ 5 มุม

**Fallback (degrade ต้องมี observable signal แจ้ง user ไม่เงียบ — เหมือน §3.5.5):**

| เงื่อนไข trigger | พฤติกรรม fallback |
|---|---|
| **spawn ไม่ได้เลย** (Agent tool fail) | degrade เป็น mode `ละเอียด` (grill เดี่ยว) + **แจ้ง user เหตุผลชัด** |
| **เครื่องไม่มี Agent tool** (เช่น Codex/Antigravity ที่ไม่มี sub-agent) | degrade เป็น mode `ละเอียด` + **แจ้ง user** ว่า ไต่สวน ไม่รองรับบนเครื่องนี้ |

**Security (reuse §3.5.6 หลัก):** Red รับ artifact-level context (blue-memory/discovery) ไม่ใช่ raw filesystem; memory files (`blue-memory`/`red-memory`/`debate-round-NN`) = ข้อสรุป/ประเด็น ไม่ paste raw value/credential/internal path

---

## 4. ลำดับขั้นการทำงาน (process loop)

1. **เตรียมพื้นที่:** ถ้ายังไม่มีโฟลเดอร์ topic → copy `.warnyin/template/stages/[topic]/` เป็น `docs/stages/<slug>/` (slug = kebab-case ของหัวข้องาน)
2. **เลือก mode (§3.5):** user ระบุ mode/keyword → ใช้ตามนั้น; ไม่ระบุ → ground เบื้องต้นแล้ว **auto-suggest** (§3.5.4) เสนอ mode + เหตุผล → user ยืนยัน/เปลี่ยน — แล้วปรับความเข้มของ loop ข้อ 3-5 ตาม behavior contract (§3.5.3)
3. **Ground:** อ่าน Input ในข้อ 2 ให้ครบ สรุปความเข้าใจเริ่มต้น 3-5 บรรทัด ให้ user ยืนยัน — พบ entry ใน `docs/backlog.md` ที่เกี่ยวกับ scope นี้ → **เสนอ** item ที่เกี่ยวข้องให้ user พิจารณาหยิบเข้า scope (user ตัดสิน — ดู [`.warnyin/workflow/backlog.md` §Consume](../backlog.md)); ไม่มี backlog หรือไม่มี item เกี่ยวข้อง → ข้าม
4. **ตี scope กว้าง→แคบ ผ่านการสัมภาษณ์:** วนลูป — ถาม 1 ข้อ (พร้อม recommended answer) → user ตอบ → จดผลลง decision log → ถ้าตอบได้ด้วยโค้ดให้ไปอ่านเอง _(mode `โต้วาที`: ขับเคลื่อนด้วยประเด็นจาก debate §3.5.5 แทน/เสริมการถามทีละข้อ · mode `ไต่สวน`: เดิน Blue/Red iterative §3.5.7 — grill user ทุก finding ของ Red ทุกรอบ)_ — พบ item ที่ "out-of-scope / ทำทีหลัง" ระหว่างตี scope → **เสนอ user** เพิ่มเข้า `docs/stages/<slug>/backlog.md` (5-field; user ยืนยันก่อนเขียน); ไม่มี → ข้าม — ดู [`.warnyin/workflow/backlog.md` §Capture](../backlog.md)
5. **research คู่ขนาน:** สิ่งที่ต้องค้นจริง (prior art, ทางเลือก technical, ข้อจำกัด) → จดลง `research.md` พร้อม evidence/links _(ความลึก research ปรับตาม mode: `ไว` minimal · `ละเอียด`/`โต้วาที` deep · `ไต่สวน` deep + adversarial audit)_
6. **เช็ค gate (ข้อ 6):** เมื่อครบเกณฑ์ → สรุปและเสนอ "พร้อมเข้า DESIGN"

---

## 5. Output (สร้างที่ `docs/stages/<slug>/`)

| ไฟล์ | เนื้อหา | template |
|---|---|---|
| `discovery.md` | decision log + shared understanding + scope + PRD ย่อ + feature ideas | `.warnyin/template/stages/[topic]/discovery.md` |
| `research.md` | คำถามวิจัย + วิธี/แหล่ง + findings + code inspection + implication | `.warnyin/template/stages/[topic]/research.md` |

> เริ่มจาก template (ไฟล์ใน `.warnyin/template/stages/[topic]/`) เป็นโครง แล้วเติมเนื้อหาจริง อัปเดตทุกครั้งที่ได้ข้อสรุปใหม่

**Out-of-scope capture:** item ใดที่ "out-of-scope / ทำทีหลัง" บันทึกใน `discovery.md` section Out-of-scope → **เสนอ user** เพิ่มเข้า `docs/stages/<slug>/backlog.md` (5-field; user ยืนยันก่อนเขียน); ไม่มี → ข้าม. global `docs/backlog.md` แตะเฉพาะ SHIP — ดู [`.warnyin/workflow/backlog.md` §Capture](../backlog.md)

---

## 6. Gate → เข้า DESIGN ได้เมื่อ

- [ ] Problem / why-now ชัด และผูกกับ `docs/project.md`
- [ ] Scope in / out ระบุชัด (สิ่งที่จะทำ และจะไม่ทำ)
- [ ] Decision log ปิดทุกประเด็นสำคัญ — ไม่มี open question ที่ block การออกแบบ
- [ ] เกณฑ์ความสำเร็จ (success criteria) วัดผลได้
- [ ] สมมติฐาน/ข้อจำกัด/ความเสี่ยงหลัก ถูกบันทึก
- [ ] user ยืนยันว่า "เข้าใจตรงกันแล้ว"

ยังไม่ครบ → อยู่ Discovery ต่อ ห้ามข้ามไป DESIGN
