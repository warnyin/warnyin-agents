# Standard — build-verify-seam

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน **playbook / template / adapter** ของ repo นี้ที่ task นี้ต้องยึด
> **อิงจาก** `docs/rule.md §1` (canonical-copy, unify-in-place, adapter บาง) — ไม่มี `docs/techstack/<component>/standard.md` สำหรับ payload markdown จึงยึดกฎกลาง + pattern ที่ไฟล์เดิมใช้อยู่

## 1. Standard กลางที่ยึด

- **แก้ที่ `src/` เท่านั้น** — root `.warnyin/`, `.claude/` เป็น dogfood ที่ gitignored (`docs/rule.md §6`); แก้ root = git ไม่เห็น
- **canonical เดียวต่อกฎ** — wording ชุดเดียวห้ามอยู่ 2 ไฟล์; ที่เหลือเป็น **pointer บาง** (`docs/rule.md §1 canonical-copy`)
- **unify-in-place** — ขยาย/ย้ายในโครงเดิม ห้ามสร้างข้อใหม่/กลไกขนาน (`docs/rule.md §1`)
- **adapter บาง** — `.claude/commands/warnyin/*.md` ชี้ playbook ไม่ duplicate เนื้อกฎ (`docs/rule.md §1 tool-agnostic`)
- **anchor-immutability** — heading ที่มี inbound link = public API ห้าม rename (`docs/rule.md §2`)
- **contract-as-copy-source** — string ที่ถูก assert คำต่อคำ copy จาก `design.md §4` ห้ามแต่งใหม่ให้ "เข้า pattern ของไฟล์" (`docs/rule.md §1/§2`)

## 2. Pattern การเขียน playbook (`src/.warnyin/workflow/stages/*.md`)

**โครงไฟล์ (ห้ามสลับลำดับ/เปลี่ยนชื่อ section):**

```
# Stage: <NAME>
> Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน (…)
> เป้าหมาย: …
> Context profile: สวมโหมด `<profile>` (…)
## 1. <stage> คืออะไร / ใช้เมื่อไหร่     ← ★ fast-track hook อยู่ท้าย section นี้
## 2. Input / ก่อนเริ่ม
## 3. หลักการทำงาน (operating principles)   ← list เลข
## 4. ลำดับขั้นการทำงาน                      ← list เลข (build เริ่มที่ 0)
## 5. Output (ตาราง)
## 6/7. Gate → stage ถัดไป (checkbox)
```

- **เลขข้อใน §3/§4 คือ address ที่ไฟล์อื่นอ้าง** (`loop-tuning.md`, `backlog.md`, `api-doc.md`, `roles/*`, `docs/rule.md`) → **ห้าม renumber**; ถ้าลบเนื้อของข้อไหน ให้เหลือข้อเดิมเป็น **pointer 1 บรรทัด** ในหมายเลขเดิม
- **`★` นำหน้า = ข้อที่ห้ามลด/ห้ามข้าม** (full-gate, config-protection, investigate-before-edit, hook memory) — คงสัญลักษณ์เดิมเมื่อย้าย/ย่อ
- **pointer style:** markdown-link relative จาก **ที่อยู่ของไฟล์ผู้ชี้** — จาก `stages/` ไปไฟล์ระดับบนใช้ `../x.md`, ไปไฟล์ใน `stages/` ด้วยกันใช้ `build.md`; ระบุพิกัดต่อท้ายเป็นข้อความ (`§3 ข้อ 11`) ไม่ใช่ anchor (กัน dead anchor ที่ `lint-md.mjs` จับไม่ได้)
- **pointer + arrow-summary:** จุดที่ชี้กลับ canonical ให้เหลือ **สรุปสั้น 1 บรรทัด + ลิงก์** (pattern เดียวกับ `minimalism.md`) — ห้าม copy ย่อหน้าเต็ม
- ภาษาไทย, ไม่ใส่ emoji ใหม่ (ใช้เฉพาะ `★ ⚠ ✅ ❌` ที่ไฟล์ใช้อยู่แล้ว)

## 3. Pattern การเขียน template (`src/.warnyin/template/stages/[topic]/*.md`)

```
# <ชื่อรายงาน> — <ชื่อ change>
> Output ของ <STAGE> stage · playbook: `.warnyin/workflow/stages/<x>.md`
> <คำอธิบายหนึ่งบรรทัด>

| | |            ← meta table: Slug / branch / วันที่ / ผลรวม
## n. …          ← section เนื้อหา
## ✅ Gate → …   ← checkbox ปิดท้าย (ในงานนี้ย้ายเป็น `###` ใต้ §2/§4)
```

- **placeholder ต้องเป็น `<...>` / ตารางว่าง** — validator ใช้ตรวจว่า artifact "ถูกเติมแล้วหรือยัง" (heuristic ⚠); เขียนตัวอย่างจริงลงไปแทน placeholder จะทำให้ template ดูเหมือนถูกเติมแล้ว
- **ไฟล์ template ที่ agent จะเติมเองแล้ว commit → อ้าง path เป็น inline-code ห้าม markdown-link** (`docs/rule.md §4`) — `build.md` ของ topic ชี้ `./troubleshooting.md` ด้วย backtick เหมือนเดิม
- **ลบไฟล์ template = `git rm`** (ไม่ใช่ทำให้ว่าง) และต้องไล่ผู้อ้างถึงทุกจุดก่อน

## 4. Pattern การเขียน adapter (`src/.claude/commands/warnyin/*.md`)

- frontmatter `description` + `argument-hint` เท่านั้น; รับ slug ผ่าน `$ARGUMENTS`
- step ที่ 1 เสมอ = "อ่าน `.warnyin/workflow/stages/<x>.md` ให้ครบก่อน แล้วทำตามทุกหลักการ"
- adapter เก็บได้เฉพาะ **operational detail ของ harness นี้** (map model tier → ชื่อรุ่น, การเรียก Workflow tool, `git checkout <branch> -- <files>`) — **กฎ/เกณฑ์ต้องไม่ถูก copy มา**
- ถามผู้ใช้ด้วย **AskUserQuestion** (pattern ที่ `build.md` step 5 ใช้อยู่) สำหรับ confirm handoff

## 5. เพิ่มเติมเฉพาะ task นี้

- **ผู้เขียน artifact = main loop เท่านั้น** — `build.md` ตอนนี้ถือผลของสอง stage; ห้ามให้ sub-agent (build agent หรือ verify agent) เขียนไฟล์นี้เอง ให้คืนผลเป็น text แล้ว main loop persist (single-writer, pattern เดียวกับ `warnyin-ux`)
- **verify phase ที่เดินต่อในเซสชันเดียว = fan-out agent อิสระ** ("Parallelize gathering, serialize judgment" — `docs/rule.md §1`): agent ที่ verify ต้องไม่ใช่ agent ที่เขียนโค้ด และต้องมี fallback "เครื่องที่ fan-out ไม่ได้ → main loop สวม lens QA (`roles/qa.md`) แล้วตรวจตามลำดับ" เพื่อคง tool-agnostic
- ถ้าพบว่าต้องเพิ่ม pattern ใหม่เป็นมาตรฐานกลาง → note ที่ `./rule.md §2` (รอ SHIP) **ห้ามแก้ `docs/` เอง**
