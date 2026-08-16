# Ship — lean-ceremony

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ: ความรู้ของ topic ถูก promote ขึ้นเอกสารกลางที่ไหนบ้าง

| | |
|---|---|
| **Slug** | `lean-ceremony` |
| **วันที่ ship** | 2026-08-16 |
| **Archive** | `docs/stages/achieved/2026-08-16-lean-ceremony/` |
| **Release** | `0.30.0` (minor — payload เปลี่ยนพฤติกรรมที่ผู้ใช้เห็น แต่ backward-compatible) |

## 1. Feature ที่เปลี่ยน (ปรับปรุง 6 · ไม่มี feature ใหม่)

| feature | delta ที่ merge เข้า `spec.md` |
|---|---|
| `topic-validator` | **ADDED** `Validator บังคับ cap ขนาดเอกสารต่อ tier` (+3 scenario: เกิน → ✖ · tier อ่านไม่ได้ → ⚠ ไม่บังคับ · `large` ไม่มี cap) |
| `change-sizing` | **MODIFIED** `DESIGN establish tier ก่อนเดินต่อ` (+ handoff fast → fastlane ยืนยันครั้งเดียว) · **ADDED** `Optional gate เปิดด้วย signal ไม่ใช่ถามทุกครั้ง` |
| `project-memory` | **MODIFIED** hook 5 stage + fastlane → **BUILD/SHIP/fastlane** (rename requirement ให้ตรงความหมายใหม่) |
| `fastlane` | **MODIFIED** ผู้เรียกได้ 2 ทาง — user สั่งเอง หรือ handoff จาก DESIGN ที่ user ยืนยันในเซสชัน (นับเป็น user-invoked) |
| `uxui-wireframe` | **MODIFIED** detect ผ่าน → วาดเลย (ตัดคำถามก่อนผลิต คง approve gate ของภาพ) |
| `build-orchestration` | **ADDED** `BUILD ต่อ VERIFY ในเซสชันเดียว + artifact เดียว 4 section` |

## 2. เอกสารกลางที่อัปเดต

| ไฟล์ | สาระ |
|---|---|
| `docs/rule.md §1` | **4 convention ใหม่** — `ceremony-cost` (gate by signal · ไม่ถามซ้ำชั้น · hook ที่จุดจบงาน · stage-seam confirm) · `declared-threshold ต้อง enforce + self-dogfood + dual-validator` · `independent-verifier เป็น property ของ stage` · `เกณฑ์ยุบ artifact ข้าม stage + orphan sweep + release-hygiene แก้เฉพาะจุดเชื่อม` |
| `docs/rule.md §2 · §5` | **ขยายในที่เดิม 2 ข้อ** (unify-in-place) — exact-set assertion ที่ "ไม่มี slice เดียวทำให้เขียวได้" ต้องมอบเจ้าของให้ wave สุดท้าย + พิสูจน์ก่อนแก้ · คำสั่ง/ตัวเลขในเอกสารต้องรันจริงและวัดด้วยกติกาเดียวกับ gate |
| `docs/techstack/installer/rule.md` | ยกระดับข้อ parser/fixture เดิม (topic นี้พิสูจน์ว่า "มีแต่ไม่พอแรง") + section ใหม่: ตรึงนิยาม metric · stage inference คง path เก่าเป็น optional · orphan-pointer sweep |
| `docs/techstack/installer/test.md` | merge แผนเทสจาก `build.md §3` เป็น guideline 12 ข้อที่ใช้ซ้ำได้ (fixture = template จริง · boundary `=cap`/`cap+1` · fail-safe ต้องดัง · dual-validator · narrative accuracy ฯลฯ) |
| `docs/techstack/installer/standard.md` | pattern ของ `validate-topic.mjs` — `countLines` (`wc -l` semantics) · `parseTier` backtick-precedence + ambiguous→null · `checkCaps` pure · `hasRealContent` template-aware |
| `docs/techstack/installer/structure.md` | `MIN_PASS 240` · เพิ่ม validator + test · ระบุ `[topic]/build.md` เป็น artifact เดียวของ BUILD+VERIFY |
| `docs/troubleshooting.md` | ขยาย **#31** (assertion กำพร้าข้าม slice) · ขยาย **#32** (กฎที่ถูกละเมิดซ้ำ → ยกระดับให้ครอบ heuristic ทุกตัว) · เพิ่ม **#34** parser อ่านค่าตัวอย่างใน template เป็นค่าจริง · **#35** narrative ผิดโดย gate เขียว |
| `docs/infra.md` | runbook `✖ [C7]` (อาการ + cap ต่อ tier + วิธีแก้ 3 ทาง + คำสั่งตรวจที่รันได้จริง) |
| `docs/codemap/` | refresh — validator มี C7/`CAPS`/export 3 ตัว · memory hook 3 จุด · artifact BUILD+VERIFY เป็นไฟล์เดียว |
| `docs/backlog.md` | +2 entry (rename `memory.md §5` · ตัวเลขเคสค้างใน techstack docs) |
| `docs/memory.md` | entry #1 → `promoted` (เข้า `rule.md §2`) · entry #2 → `dropped` + เหตุผล (implement เป็น C7 แล้ว) |
| `CHANGELOG.md` · `package.json` | `0.30.0` + Migration 2 เคส |

## 3. Learned rules

| rule | evidence | scope | promote? |
|---|---|---|---|
| optional gate = trigger-by-signal + capability ที่มี approve gate ไม่ต้องถามก่อนผลิต | 39 topic: fast tier ถูกใช้ 1/39 · `proposal.md §2` | project | ✅ |
| stage-seam convention — confirm 1 ครั้งหลัง gate เขียว + มีทางออกเสมอ; ยืนยันในเซสชัน = user-invoked | `build-verify-seam/rule.md §2` · dogfood BUILD→VERIFY ในเซสชันนี้ | project | ✅ |
| ceremony hook วางที่จุดจบงาน ไม่ใช่ท้ายทุก stage | hook 6→3 จุด · `memory-hook-lean/rule.md §2` | project | ✅ |
| cap/threshold ที่ประกาศต้องมี validator บังคับ + boundary test | cap ใน `triage.md §2D` ถูกละเมิดจริงก่อนมี C7 | project | ✅ |
| gate ใหม่ต้อง self-dogfood + topic ที่แก้ validator ต้องรัน dual-validator | `release-hygiene/rule.md §2` · topic เองผ่าน cap 53/60 · 68/120 | project | ✅ |
| independent-verifier เป็น property ของ stage (ยกจาก §5 → §1) | panel อิสระจับ 6 blocker ที่ gate เขียวสนิท | project | ✅ |
| เกณฑ์ยุบ artifact ข้าม stage 3 ข้อ + orphan sweep + release-hygiene แก้เฉพาะจุดเชื่อม | ยุบ 3→1 แล้วเหลือ orphan 14 จุด | project | ✅ |
| exact-set assertion ที่ไม่มี slice เดียวทำให้เขียวได้ ต้องมีเจ้าของ + พิสูจน์ก่อนแก้ expected | KB TS-3 · เคส `M2` | project | ✅ (ขยาย §2) |
| คำสั่ง/ตัวเลขในเอกสารต้องรันจริง + evidence วัดด้วยกติกาเดียวกับ gate | KB TS-4 · verify รอบ 2 จับเพิ่ม 3 จุด | project | ✅ (ขยาย §5) |
| parser ต้องเทสด้วย template ที่ยังไม่เติม · fixture ของ heuristic = ไฟล์ที่ shipped จริง | KB TS-1 + TS-2 | component:installer | ✅ (ยกระดับข้อเดิม) |
| metric ที่ตัดสิน ✖ ต้องตรึงนิยามการวัดในคอมเมนต์ | `wc -l` semantics · runbook เคยคลาด +1 | component:installer | ✅ |
| stage inference file→section ต้องคง path เก่าเป็น optional | `STAGES` VERIFY + เคส D3 | component:installer | ✅ |
| orphan-pointer sweep เมื่อลบ/ยุบไฟล์ template (`lint:md` ไม่สแกน template) | 14 จุดที่ค้าง | component:installer | ✅ |
| pointer ข้ามไฟล์ต้องระบุพิกัด · heading freeze → ปรับประโยคนำไม่ปรับ heading · ลบ hook ต้องลบทั้ง blockquote + negative-grep สองทิศ | 4 block ที่ unify · `memory.md §5` | project | ✅ (รวมใน convention) |
| rename `memory.md §5` ให้ตรงนิยามใหม่ | ต้องแก้ inbound pointer + เทส `M1` พร้อมกัน | — | ✂️ → backlog #1 |
| cap ควรนับเฉพาะ narrative | implement เป็น C7 + requirement ใน `topic-validator` แล้ว | — | ✂️ dropped (memory #2) |

## 4. Archive
`docs/stages/lean-ceremony/` → **`docs/stages/achieved/2026-08-16-lean-ceremony/`** (`git mv`) — 5 ไฟล์ระดับ topic + `tasks/` 5 ใบ × 4 ไฟล์

## 5. Gate ตอนส่งมอบ
`npm test` **248/248 pass** (MIN_PASS 240) · `npm run lint:md` 132 ไฟล์ 116 ลิงก์ · `npm run verify:pack` 105 ไฟล์ · `validate-topic` = "ไม่มีงานค้าง" (C5 ของ feature spec ทั้งหมดผ่าน)

## 6. หมายเหตุ
- **ยังไม่ merge เข้า main และยังไม่ publish** — SHIP จัดการเอกสาร/archive เท่านั้น (`ship.md §1`); การ merge branch `build/lean-ceremony` + `npm publish 0.30.0` เป็นการตัดสินใจของ user
- dogfood ที่ root (`.warnyin/`, `.claude/`) ยังเป็น `0.29.1` — จะได้ payload ใหม่หลัง release + `npm run setup:dogfood`
