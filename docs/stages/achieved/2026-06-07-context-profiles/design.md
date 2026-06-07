# Design (How) — context-profiles

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end
> Lens: SA (`.warnyin/workflow/roles/sa.md`) · แตก task ด้วย Tech Lead lens

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` (แก่นกลาง workflow เป็น payload ที่ installer ส่ง) — แต่ change นี้เป็น `.md` ล้วนใน `src/.warnyin/workflow/` ไม่แตะ runtime ของ installer
- **แนวทางหลัก:** เพิ่ม layer ใหม่ `contexts/` คู่ขนานกับ `roles/` — `roles/` = task-level lens, `contexts/` = session-level posture; playbook stage เป็นจุดเชื่อม (ชี้ทั้ง role และ context)
- **2-layer:** source-of-truth = `src/.warnyin/workflow/contexts/` (publish ผ่าน CORE copyTree อัตโนมัติ); root dogfood `.warnyin/` = release เสถียร (ดึง `@latest`) — ไม่ใช่ deliverable ที่ commit

## 2. Vertical slices
> หนึ่ง slice = หนึ่งหน่วยคุณค่า end-to-end → จะกลายเป็น 1 task

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **context vocabulary ใช้ได้จริง** — มี 3 context card + README อธิบาย context-vs-role + วิธี activate → AI/ user เปิดอ่านแล้วสวมโหมดได้ทันที (manual) | content (`.md`) · self-doc (README) · verify (`verify:pack` เห็น contexts ติด payload) | `tasks/author-contexts/` |
| 2 | **playbook นำทางสู่ posture ที่ถูก** — 5 stage playbook + workflow README ชี้ไป context ที่เข้าคู่ → เปิด playbook stage ไหนก็รู้ว่าต้องสวมโหมดอะไร | integration (callout ใน 5 playbook) · structure doc (README tree) · verify (`npm test` เขียว — ไม่มี string เก่าพัง) | `tasks/wire-playbooks/` |

## 3. Data model / schema
ไม่มี data/schema (`.md` ล้วน) — แต่กำหนด **โครง context card** (ทุกใบเหมือนกัน, บางตาม D2):

```
# Context — <name> (<หนึ่งบรรทัดว่าโหมดนี้คืออะไร>)
> session-level posture · playbook: .warnyin/workflow/stages/*
## Mindset            — วิธีคิดรวมของ session โหมดนี้ (2–4 บรรทัด)
## Do / Don't         — ตาราง/bullet สั้น: ทำ vs ห้าม
## Tool preference    — เครื่องมือที่ควรใช้/เลี่ยง (read-only vs edit vs run)
## ใช้คู่ stage ไหน    — ชี้ playbook stage ที่เข้าคู่ (→ ลิงก์)
```

**contexts/README.md** โครง: อธิบาย context (session-level) ต่างจาก role (task-level) · ตาราง 3 context ↔ stage · วิธี activate (manual: user สั่ง หรือ AI อ่านตอนเริ่ม stage) · ชี้ว่า playbook stage มี callout ชี้กลับมา

## 4. Interface / contract
- **context ↔ stage mapping** (สัญญาหลักของ feature):

  | Stage playbook | Context ที่ชี้ | เหตุผล |
  |---|---|---|
  | `discovery.md` | `research` | สำรวจ/เข้าใจก่อนตัดสิน |
  | `design.md` | `research` + `build` | ต้น = research (proposal), ปลาย = build (แตก task) |
  | `build.md` | `build` | ลงมือสร้าง vertical slice |
  | `verify.md` | `review` | ตรวจ/ยืนยันด้วยการรันจริง |
  | `ship.md` | `review` | ตรวจความครบก่อนส่งมอบ/promote |

- **callout pattern** (เหมือนกันทุก playbook — ใต้ blockquote title):
  ```
  > **Context profile:** สวมโหมด `<name>` (`.warnyin/workflow/contexts/<name>.md`) — session-level posture ของ stage นี้
  ```
  (design.md ชี้ 2 ตัว: `research` ช่วงต้น, `build` ช่วงแตก task)

## 5. Flow
- **data-flow:** ไม่มี runtime flow — เป็น doc reference graph: `stages/*.md` ─callout─▶ `contexts/*.md` ─pointer─▶ `stages/*.md` (วนกลับ, ไม่ duplicate)
- **user-flow:** เริ่ม session → (manual) อ่าน context ที่ตรงกับงาน หรือเปิด playbook stage แล้วเห็น callout → สวม posture → ทำงานตาม stage playbook เดิม

## 6. ผลกระทบต่อระบบเดิม
- **backward compat:** เพิ่มไฟล์ใหม่ + เพิ่ม 1 บรรทัดต่อ playbook — ไม่ลบ/แก้ logic เดิม; ผู้ใช้รุ่นเก่าไม่ต้องทำอะไร (รับ contexts/ ตอน `--update` รอบถัดไป)
- **จุดต้องระวัง:** installer test เคส 5/6 assert string warning ของ cli.mjs — feature นี้ไม่แตะ cli.mjs จึงไม่กระทบ; แต่ task ต้องไม่เผลอแก้ string ใน playbook ที่ test อื่นอ้าง (ไม่มี test อ้าง playbook stage content โดยตรง — ยืนยันใน BUILD ด้วย `npm test`)
- **README tree:** เพิ่ม `contexts/` ข้าง `roles/` (inner dir name ถูกอยู่แล้ว — locally correct); outer-layout staleness = defer (proposal §5)

## 7. Dependency ระหว่าง slice/task
```
author-contexts ──▶ wire-playbooks
```
- `wire-playbooks` ชี้ไปไฟล์ที่ `author-contexts` สร้าง → ต้องทำหลัง (ลำดับชัด, ไม่ใช่ file conflict — คนละไฟล์)
- ทั้งคู่แตะใต้ `src/.warnyin/workflow/` แต่คนละไฟล์ (task1 = `contexts/*` ใหม่, task2 = `stages/*` + `README.md` เดิม) → ไม่ชนกัน

## 8. Test strategy ระดับ design
- **author-contexts:** `npm run verify:pack` เขียว → ยืนยัน `contexts/*.md` ติด tarball (ship ได้โดยไม่แตะ installer); ตรวจ 4 ไฟล์ครบ + โครงตรง D2
- **wire-playbooks:** `npm test` (18 เคส) เขียว → ยืนยันไม่มี assertion ใดพังจากการแก้ playbook; ตรวจ 5 playbook มี callout + mapping ตรง §4; README tree มี `contexts/`
- **integration (BUILD gate):** `npm test` + `verify:pack` เขียวทั้งคู่หลัง merge 2 task
- **VERIFY (ภายหลัง):** เปิดแต่ละ context card + playbook อ่านจริง ยืนยัน reference graph วนกลับถูก (ไม่มีลิงก์ตาย), โครงบางตาม D2 ไม่ duplicate stage checklist

## 9. หมายเหตุการตัดสินใจ (ไม่ block — recommended default)
1. **root dogfood copy:** หลัง BUILD เสนอ copy `src/.warnyin/workflow/contexts/` + playbook ที่แก้ → root `.warnyin/` เพื่อ dogfood ทันที (gitignored ไม่ commit) — *default: เสนอตอนปิด BUILD/VERIFY*
2. **README outer-layout staleness:** defer เป็น topic แยก — *default: ไม่แก้ในรอบนี้* (note ใน proposal §5 + เสนอ SHIP ลง roadmap)
