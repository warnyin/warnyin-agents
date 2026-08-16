# ตัวอย่างจริง — เดินครบ 5 stage (worked example)

> **Disclaimer:** นี่คือ **snapshot** ของ topic `cli-legacy-warning-fix` ณ **2026-06-07** — เป็นตัวอย่าง "output ที่ทำดีแล้ว" ของ workflow นี้
> - ขั้นตอน/เกณฑ์ของแต่ละ stage อาจเปลี่ยนในอนาคต → **source ปัจจุบันอยู่ที่ playbook กลาง** [`src/.warnyin/workflow/stages/`](../src/.warnyin/workflow/stages/) เสมอ (หน้านี้ไม่ใช่ที่อธิบายขั้นตอน — ดู playbook)
> - artifact ทั้งหมดที่ลิงก์ในหน้านี้เป็น **ไฟล์จริง** ใต้ [`docs/stages/achieved/`](stages/achieved/) — เปิดดูบน GitHub repo ได้ (ผู้ที่ `npx` ติดตั้งจะไม่มี `docs/` ในเครื่อง — ดูบน repo)
> - **โครง artifact ตอนนั้น ≠ ปัจจุบัน:** topic นี้ทำตอน BUILD/VERIFY ยังแยกเป็น 3 ไฟล์ (`build.md` + `test.md` แผนเทส + `verify.md` ผล) — **ปัจจุบันยุบเหลือ `build.md` ไฟล์เดียว 4 section** (§1 ผล build ต่อ task · §2 full build & test gate · §3 แผนเทส (VERIFY) · §4 ผล verify + การแก้). ลิงก์ด้านล่างจึงยังชี้ไฟล์เก่าตามที่เกิดขึ้นจริง ไม่แก้ย้อนหลัง

หน้านี้ไล่ topic จริงหนึ่งตัว (`cli-legacy-warning-fix`) ตั้งแต่ตี scope จนส่งมอบ เพื่อให้เห็นว่า **artifact ที่ workflow ผลิตหน้าตาเป็นยังไง** และ **แต่ละ stage "ตัดสินใจ" อะไร** — ไม่ใช่อ่านขั้นตอน (ขั้นตอนอยู่ที่ playbook)

## topic ที่ยกเป็นตัวอย่าง

**`cli-legacy-warning-fix`** — bugfix เล็ก: แก้ข้อความ legacy warning ใน `src/bin/cli.mjs` ให้คำสั่งที่บอกผู้ใช้รุ่นเก่าตรงกับ Migration guide ที่ผ่านการพิสูจน์แล้ว (เดิม cli บอกคำสั่งที่ทำให้งานจริงซ้อนชั้น `docs/stages/stages/`) — เป็น topic ที่ "เริ่มจากกลาง" (defer มาจาก VERIFY ของ topic ก่อนหน้า `roadmap-sync-p0`) จึง **ไม่ผ่าน Discovery แท้** เป็นตัวอย่างที่ดีว่า stage ที่ optional ข้ามได้เมื่อ scope ชัด

📁 ทุก artifact ของ topic: [`docs/stages/achieved/2026-06-07-cli-legacy-warning-fix/`](stages/achieved/2026-06-07-cli-legacy-warning-fix/)

## ไล่ครบ 5 stage

| Stage | ตัดสิน/ทำอะไร (decision) | Gate ที่ผ่าน | Artifact (ลิงก์จริง) |
|---|---|---|---|
| **Discovery** *(ข้าม)* | scope ชัดมาจาก VERIFY ของ topic ก่อน → ไม่ต้องสัมภาษณ์ตี scope ใหม่; ไฟล์ discovery/research เป็น template เปล่า (ไม่แต่งให้ดูครบ) | — (ข้ามได้เมื่อ scope ชัด) | [discovery.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/discovery.md) · [research.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/research.md) · [business.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/business.md) |
| **DESIGN** | เลือก **A** (แก้ string ให้ตรง guide) **ปัด B** (แก้ behavior installer) — เหตุผล: guide robust ครอบปัญหาแล้ว, low-risk; แตกเป็น 1 vertical slice (cli+test ไปด้วยกัน); ข้าม review panel เพราะ change เล็ก | DESIGN → BUILD | [proposal.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/proposal.md) · [design.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/design.md) · [tasks/fix-legacy-warning/](stages/achieved/2026-06-07-cli-legacy-warning-fix/tasks/fix-legacy-warning/) |
| **BUILD** | จัด 1 wave (task เดียว) แบบ `shared-tree` (ไม่ต้อง worktree); sub A (แก้ cli) → B (แก้ test assert) → C (re-verify) — ผ่านรอบแรก 18/18, ไม่มี fix loop | BUILD → VERIFY | [build.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/build.md) |
| **VERIFY** | เทสตาม **จุดประสงค์จริง** ไม่ใช่แค่ unit เขียว: executable migration proof 2 รุ่น + **3-way consistency** (cli ↔ CHANGELOG ↔ test เป็นชุดเดียว) + regression — ผ่านครบ 0 รอบแก้ | VERIFY → SHIP | *(โครงเก่า)* [verify.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/verify.md) · [test.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/test.md) — ปัจจุบันคือ `build.md §3` (แผนเทส) + `§4` (ผล verify) |
| **SHIP** | promote ความรู้: ปิด **defer item P0 #3** ในroadmap, ยืนยัน **ไม่มี rule ใหม่** (task แค่ทำ cli compliant กับ rule ที่ promote ไปแล้ว), archive topic | ส่งมอบ | [ship.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/ship.md) · [troubleshooting.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/troubleshooting.md) |

## รายละเอียดต่อ stage (เน้นเหตุผลการตัดสินใจ)

### 1. Discovery — *ข้าม (scope ชัดจาก stage ก่อน)*

topic นี้ไม่ได้เริ่มจากโจทย์กว้าง — มันถูก **defer** มาจาก VERIFY ของ topic `roadmap-sync-p0` ที่พิสูจน์แล้วว่าคำสั่งใน warning ของ cli ทำงานจริงผิด (ซ้อนชั้น) ขณะที่เอกสาร CHANGELOG แก้ robust ไปแล้ว เมื่อ scope ชัดขนาดนี้ **Discovery (optional) จึงข้ามได้** — ไฟล์ [discovery.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/discovery.md)/[research.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/research.md) คงเป็น template เปล่า โดยไม่แต่งให้ดูเหมือนทำครบ — ความซื่อตรงต่อสิ่งที่เกิดจริงสำคัญกว่าความสมบูรณ์ปลอม
*(เกณฑ์การข้าม Discovery อยู่ที่ playbook [`stages/discovery.md`](../src/.warnyin/workflow/stages/discovery.md))*

### 2. DESIGN — เลือก fix แบบ low-risk แทนแก้ราก

decision หลักอยู่ใน [proposal.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/proposal.md) §3: มี 2 ทางเลือก — **A** แก้ string ใน warning ให้ตรง Migration guide ที่ robust แล้ว vs **B** แก้ behavior ของ installer (skip `ensureScaffold` เมื่อเจอ legacy). เลือก **A** เพราะ guide robust ครอบปัญหาไปแล้ว การแก้ behavior เสี่ยง regress + เปลี่ยน UX โดยไม่จำเป็น. [design.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/design.md) แตกเป็น **1 vertical slice** (cli + test ต้องไปด้วยกัน เพราะ black-box test assert string ที่ cli ปล่อยออกมา) แล้วผลิต [task `fix-legacy-warning`](stages/achieved/2026-06-07-cli-legacy-warning-fix/tasks/fix-legacy-warning/) ที่ self-contained พร้อมโยนให้ build sub-agent
*(ขั้นตอน DESIGN เต็ม + เกณฑ์ review panel อยู่ที่ playbook [`stages/design.md`](../src/.warnyin/workflow/stages/design.md))*

### 3. BUILD — task เดียว, shared-tree, ผ่านรอบแรก

[build.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/build.md) จัดเป็น 1 wave task เดียว เลยใช้ `shared-tree` (ไม่ต้องแยก git worktree เหมือนกรณี fan-out หลาย task ขนาน). sub-task เดินตามลำดับ dependency ภายใน: **A** แก้ string ใน `cli.mjs` 2 block → **B** อัปเดต assertion ใน test เคส 5/6 ให้ตรง → **C** re-verify. ปิดด้วย full test gate — `npm test` 18/18 เขียว ผ่านรอบแรก ไม่มี fix loop
*(การจัด wave/worktree/full-gate อยู่ที่ playbook [`stages/build.md`](../src/.warnyin/workflow/stages/build.md))*

### 4. VERIFY — เทสตามจุดประสงค์ ไม่ใช่แค่ unit เขียว

จุดเด่นของ stage นี้: ไม่หยุดที่ "unit test เขียว" แต่เทสตามจุดประสงค์จริงของ topic. [verify.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/verify.md) รัน **executable migration proof** — จำลอง project รุ่นเก่า 2 รุ่น (≤0.2.x, 0.3–0.5.x) แล้วทำตามคำสั่งที่อ่านจาก stderr ของ cli จริง เพื่อยืนยันว่างานไม่หาย/ไม่ซ้อน/ไม่ warn ซ้ำ — บวก **3-way consistency** ว่าคำสั่งใน cli, `CHANGELOG.md`, และ test assertion เป็นชุดเดียวกัน. ผ่านครบ **0 รอบแก้** ([test.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/test.md) มี test plan V1–V4)
*(วิธีตั้ง local env + fix loop "แก้จนผ่าน" อยู่ที่ playbook [`stages/verify.md`](../src/.warnyin/workflow/stages/verify.md))*
> ⚠ **โครงไฟล์:** สองไฟล์ข้างบน (`test.md`/`verify.md`) เป็นโครงเก่า ณ 2026-06-07 — **ปัจจุบัน VERIFY เขียนแผนเทสลง `build.md §3` และผล verify + จำนวนรอบแก้ลง `build.md §4`** ไม่สร้างไฟล์แยกอีกแล้ว (playbook `stages/verify.md` §5)

### 5. SHIP — กลั่นความรู้กลับ docs/ แล้ว archive

[ship.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/ship.md) ตัดสินว่าจะ promote อะไรขึ้น `docs/` กลาง: ปิด **defer item P0 #3** ใน roadmap (cli sync กับ guide แล้ว) และยืนยันชัดว่า **ไม่มี rule ใหม่** — task นี้แค่ทำให้ cli compliant กับ rule ที่ topic ก่อน (`roadmap-sync-p0`) promote ไปแล้ว จึงไม่ promote ซ้ำ. ไม่มี finding troubleshooting ใหม่ ([troubleshooting.md](stages/achieved/2026-06-07-cli-legacy-warning-fix/troubleshooting.md) ของ topic นี้ว่าง — ต้นเรื่องบันทึกไว้แล้วที่ KB กลาง). ปิดท้ายด้วย archive ไป `docs/stages/achieved/2026-06-07-cli-legacy-warning-fix/`
*(การจำแนก feature/promote rule/archive อยู่ที่ playbook [`stages/ship.md`](../src/.warnyin/workflow/stages/ship.md))*

---

## อยากเริ่ม topic ของตัวเอง?

```
/warnyin:discovery <topic>   # โจทย์กว้าง/กำกวม → ตี scope ก่อน
/warnyin:design <slug> <change>  # scope ชัดแล้ว → ออกแบบ + แตก task เลย (ข้าม Discovery ได้ เหมือนตัวอย่างนี้)
```

ดู topic ที่ทำเสร็จแล้วตัวอื่นเป็นตัวอย่างเพิ่มเติมได้ที่ [`docs/stages/achieved/`](stages/achieved/)
