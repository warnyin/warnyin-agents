# TRIAGE — ประเมินขนาด change → แนะนำ tier + route (read-only)

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: รับคำอธิบาย change ของ user → ประเมินขนาดเป็น tier `{fast, standard, large}` ตาม rubric (signals + hard-floor) → **แนะนำ route** แล้วหยุด — **ไม่สร้างหรือแก้ไฟล์ใดๆ**
> ★ ไฟล์นี้ **canonical** ของ rubric + loop-tuning default per tier (§2C) — `design.md §7` / `verify.md` / `ship.md` / command adapter ชี้มาที่นี่ (ไม่ inline rubric ซ้ำ)

---

## 1. TRIAGE คืออะไร / ใช้เมื่อไหร่

TRIAGE คือโหมด **อ่านอย่างเดียว (read-only)** — ไม่ใช่ stage ใน workflow, ไม่มี gate, ไม่มี output ไฟล์
ใช้เมื่อ: มี change/request ใหม่แต่ **ยังไม่แน่ใจว่าควรจ่าย ceremony แค่ไหน** — อยากรู้ว่างานนี้ใหญ่แค่ไหน ควรเดิน path ไหน (fast-track / flow เต็ม / ต้อง Discovery ก่อน)

- **ต่างจาก `next`:** triage = ประเมิน **request ใหม่ by size** ; next = route **topic เดิม by stage** — คนละแกน input
- **ต่างจาก `explore`:** explore ตอบคำถาม/สำรวจ ; triage ตัดสิน tier + route ของ change ที่จะลงมือทำ

---

## 2. วิธีประเมิน (rubric — สแกน → ตัดสิน tier เคารพ hard-floor)

### 2A. Tier taxonomy (3 ระดับ 1 มิติ)

| tier | ตัวอย่าง | route ที่แนะนำ |
|---|---|---|
| **fast** | bugfix, typo, config tweak, แก้/เพิ่ม wording-guidance สั้น, 1-2 ไฟล์, modify ของเดิม ไม่ cross-cutting | design fast-track (pre-flight สร้าง receipt) → code-first → verify-lite → ship-lite |
| **standard** | feature ใหม่ขนาดปกติ, modify หลายไฟล์/หลาย component, มี logic ใหม่ | flow เต็มปัจจุบัน (`design` → build → verify → ship) |
| **large** | greenfield/project ใหม่, cross-cutting หลาย component, mega | **บังคับ `/warnyin:discovery` ก่อน** → design → ... (decompose เต็ม = future) |

### 2B. Signals + Hard-floor + Escalation (judgment heuristic ⚠ ไม่ใช่ ✖)

- **signals ประเมิน tier:** #ไฟล์/#component ที่แตะ · new-vs-modify · greenfield · มี logic/algorithm ใหม่ · dep ใหม่ · UI/ผู้ใช้กระทบ
- **★ tie-break ก้ำกึ่ง → ปัดขึ้น (fail-safe):** signals เป็น judgment ไม่มี threshold ตายตัว — เคสก้ำกึ่ง fast/standard → **เลือก standard** (ปรัชญาเดียวกับ hard-floor: ระวังไว้ก่อน) เพื่อให้พฤติกรรมก้ำกึ่ง consistent ไม่สุ่ม
- **★ Hard-floor — บังคับ ≥ standard เสมอ (ไม่ว่าดูเล็กแค่ไหน):** แตะ **(1) auth/authz · (2) data migration/schema · (3) secret/credential · (4) public API/contract (breaking) · (5) security-sensitive (input handling/crypto/permission)** → triage ห้ามแนะนำ fast (**5 หมวด**)
- **★ Escalation/Downgrade เป็น step (symmetric):**
  1. **Upgrade (fast→standard/large):** พบว่าใหญ่กว่า/แตะ hard-floor กลางทาง → **เติม artifact ที่ fast-track ข้ามไป** (business.md/proposal-design เต็ม/panel/dry-run/แตก task เพิ่ม) แล้วเดิน flow tier ใหม่ต่อ — topic ไม่ต้องเริ่มใหม่
  2. **Downgrade (standard→fast):** ถ้าประเมินเกิน (over-size) → ตัด ceremony ที่ยังไม่ทำได้ แต่ **ห้าม downgrade ข้าม hard-floor**
  3. sizing เป็น **default ที่ปรับได้ทุกเมื่อ ไม่ lock**

> **fast-track skip-list** = ดู section [**Fast-track skip-list**](#fast-track-skip-list) ด้านล่าง

### 2C. Loop-tuning default per tier

> starting point ปรับได้ ไม่ lock (escalate/downgrade ตาม §2B)

| tier | credit horizon | batching |
|---|---|---|
| fast | สั้น — แก้ทีละ finding | 1 agent จัดการ failure น้อยๆ ตรงๆ |
| standard | group by root-cause แล้วแก้ทีละกลุ่ม | delegate ต่อ root-cause group |
| large | รวมชุด วิเคราะห์ cross-cutting root cause ก่อนแก้ | กลุ่มใหญ่ขึ้นแต่ยังแบ่ง — ระวัง "ใหญ่≠ดีกว่า" |

why/วิธีตัดสิน: ดู [loop-tuning](loop-tuning.md) — ไม่ inline ซ้ำที่นี่

### 2D. Caps (ขนาดสูงสุด per artifact per tier)

| tier | artifact | cap |
|---|---|---|
| fast | receipt.md | ≤ 40 บรรทัด |
| standard | proposal.md | ≤ 60 บรรทัด |
| standard | design.md | ≤ 120 บรรทัด |
| large | ทุก artifact | judgment — ไม่ตายตัว |

cap วัดด้วยจำนวนบรรทัด (`wc -l`) — deterministic กับภาษาไทย

---

## Fast-track skip-list

> fast tier = **ข้าม ceremony ที่ไม่จำเป็น ไม่ใช่ข้าม correctness** (`design.md §7` / `verify.md` / `ship.md` ชี้ section นี้)

| stage | fast-track ทำ | คงไว้ (correctness floor) |
|---|---|---|
| DESIGN | pre-flight: สร้าง `receipt.md` จาก template เติม meta + §1 + §2 **ก่อนแตะโค้ด** — ไม่สร้าง business/proposal/design/tasks, ไม่ panel ไม่ dry-run, model tier `cheap` | hard-floor เช็ค + acceptance ประกาศก่อนแก้ (มี artifact ใน receipt) |
| BUILD | code-first — main loop แก้โค้ดเอง ไม่เรียก build-wave/ไม่ fork worktree | full-gate (test เขียว) blocking · config-protection · investigate-before-edit · ห้ามแตะ rule/standard กลาง (note ลง receipt §5 รอ SHIP) |
| VERIFY | lite — functional ตาม acceptance ใน receipt §2 + test เขียว → เติมผลลง receipt §4 | test เขียวจริง |
| SHIP | lite — เติม receipt §3/§5 → สแกน diff เทียบ hard-floor 5 หมวด → archive; promote learned rule เฉพาะที่มีใน §5 | receipt ครบทุก section + archive ครบ + hard-floor scan ผ่าน (เจอ → upgrade ตาม §2B ห้าม ship-lite) |

---

## 3. รูปแบบรายงาน (ตอบในแชทเท่านั้น)

triage **อ่าน input = คำอธิบาย change ของ user** (+ inspect โค้ดที่อ้างถึงได้) → ประเมิน tier ตาม §2A/§2B → **รายงาน: tier + เหตุผล (signals ที่เจอ) + route ที่แนะนำ + คำเตือน hard-floor (ถ้ามี)** → **หยุด ให้ user สั่ง command เอง** (ไม่รัน stage ต่อ — เหมือน `next`)

รูปแบบที่แนะนำ:
1. **tier ที่ประเมิน** (`fast` / `standard` / `large`)
2. **เหตุผล** — signals ที่เจอ (#ไฟล์/component, new-vs-modify, logic ใหม่, ฯลฯ) + ถ้าก้ำกึ่งระบุว่าปัดขึ้น standard
3. **คำเตือน hard-floor (ถ้ามี)** — ระบุหมวดที่ตรง → บังคับ ≥ standard
4. **route ที่แนะนำ** — command ถัดไป (fast-track / flow เต็ม / Discovery ก่อน)
5. **หยุด** — เสนอ command ให้ user เป็นคนสั่ง

---

## 4. หลักการ (read-only เด็ดขาด)

1. **Read-only เด็ดขาด** — ห้ามสร้าง/แก้/ลบไฟล์ใดๆ; triage แค่ประเมินแล้วรายงาน
2. **สรุปจาก evidence:** ประเมินจากคำอธิบาย change + โค้ดที่อ้างถึงจริง ไม่เดา; ก้ำกึ่ง → ปัดขึ้น standard (fail-safe)
3. **เคารพ hard-floor:** แตะหมวดใน §2B → ห้ามแนะนำ fast ไม่ว่าดูเล็กแค่ไหน
4. **แนะนำแล้วหยุด:** ไม่รัน stage ถัดไปให้เอง — เสนอ command ให้ user เป็นคนสั่ง; sizing เป็น default ที่ escalate/downgrade ได้ทุกเมื่อ (ไม่ lock)
