# BACKLOG — ที่เก็บกลางของงาน deferred-out (ยกออกจาก scope ปัจจุบัน, ยังไม่ทำ)

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: capture งานที่ "ยกออกจาก scope ปัจจุบัน" จากทุก stage แบบ **recommend → user ตัดสิน** → persist per-topic → SHIP promote → global `docs/backlog.md`
> **canonical-copy:** นิยามเต็มอยู่ไฟล์นี้เดียว; stage/role/consume = **pointer บาง** ชี้กลับมาที่ **ชื่อ section** ด้านล่าง (heading freeze — wave 2 อ้างด้วยชื่อ ไม่ใช่เลขลอย)

---

## 1. backlog คืออะไร (semantic)

backlog = **deferred-out** — งานที่ตัดสินใจ **ยกออกจาก scope ปัจจุบัน** (ยังไม่ทำตอนนี้) แต่ยังอยากเก็บ trace ไว้ทำต่อ/พิจารณาภายหลัง

ต่างจากที่เก็บอื่น (อย่าสับสน):

| ที่เก็บ | semantic | ต่างกันตรงไหน |
|---|---|---|
| **`backlog.md` (นี้)** | **deferred-out** (future-todo, ยกออกจาก scope) | งานที่ยังไม่ทำ — รอทำทีหลัง/อาจไม่ทำ |
| `issue.md` | **deferred-within** | ปัญหา/งานที่ยัง track เพื่อทำต่อ **ใน topic นี้** |
| `troubleshooting.md` | **past-solved** | ปัญหาที่ **แก้แล้ว** — บันทึกวิธีแก้ |
| `roadmap.md` | ทิศทางของ **repo เอง** | แผนระดับ repo ไม่ใช่ deferred-out ต่อ topic |

**decision rule (issue.md → backlog):** entry ใน `issue.md` ที่ตัดสินใจ *ไม่ทำใน topic นี้แล้ว* → กลายเป็น **deferred-out** → **เสนอย้าย** เข้า backlog; entry ที่ยัง track เพื่อทำต่อใน topic → **คงไว้ใน `issue.md`**

---

## 2. Governance (recommend-not-auto)

ทุกการ **เพิ่ม** entry (capture) และ **หยิบใช้** entry (consume): ระบบ **เสนอ candidate + เหตุผล → user ยืนยัน** ก่อนเขียน/หยิบเข้า scope เสมอ

- **ห้าม auto-append** เข้า backlog โดยไม่ถาม user
- **ห้าม auto-pull** entry จาก backlog เข้า scope ใหม่โดยไม่ถาม user
- เหตุผล: backlog เป็นการตัดสินใจ (จะทำทีหลัง? อาจไม่ทำ?) ที่ user เป็นเจ้าของ ไม่ใช่ระบบ

---

## 3. Schema (5-field)

**per-topic `docs/stages/<slug>/backlog.md` — ตาราง markdown 5 คอลัมน์:**

| # | รายการ (what) | ที่มา (stage + ไฟล์/อ้างอิง) | ประเภท + เหตุผล | สถานะ |
|---|---|---|---|---|
| 1 | ข้อความสั้นว่าจะทำอะไร | `Design · proposal §4 Out-of-scope` | `ทำทีหลัง` + เหตุผล 1 บรรทัด | `open` |

- **ประเภท (closed set 3):** `ทำทีหลัง` · `อาจไม่ทำ` (nice-to-have / blocker เลือกไม่แก้) · `รอเงื่อนไข`
- **สถานะ (closed set 3):** `open` · `promoted` (ยกขึ้น global แล้ว) · `dropped` (+เหตุผล)
- **global `docs/backlog.md` = 5-field + 1 คอลัมน์ provenance `มาจาก topic`** (slug) — เพิ่มตอน promote (mirror entry "มาจาก topic" ของ troubleshooting)
- **malformed / นอก closed-set:** parse ไม่ได้ หรือค่านอก enum → **ถาม user (best-effort) ไม่ silent-drop** (สอดหลัก "ห้ามเดา")
- **non-goal (กัน issue-tracker):** priority engine, assignee, due date, estimate, label taxonomy — ไม่อยู่ใน schema นี้

---

## 4. File layout + lifecycle

```
docs/stages/<slug>/backlog.md   # per-topic working (lazy — ไม่มี deferred-out ไม่ต้องมีไฟล์/เนื้อ)
        │  SHIP promote (หลัง archive — ดู §7)
        ▼
docs/backlog.md                 # global (current state; +คอลัมน์ "มาจาก topic")
```

- **per-topic = lazy:** สร้าง/เติมเฉพาะเมื่อพบ deferred-out รายการแรก
- **global = current state:** อ่านตอน comprehension (ดู §6, §8)
- mirror สถาปัตยกรรม `troubleshooting` (per-topic → SHIP promote → global)

---

## 5. Capture (hook ต่อ stage)

**Canonical hook wording** (stage copy/ชี้ pointer มาที่ section นี้ — **per-topic only**):

> "พบงานที่ **ยกออกจาก scope ปัจจุบัน** (deferred-out) → **เสนอ user** เพิ่มเข้า **`docs/stages/<slug>/backlog.md`** (5-field; user ยืนยันก่อนเขียน); ไม่มี → ข้าม. global `docs/backlog.md` แตะเฉพาะ SHIP — ดู `.warnyin/workflow/backlog.md`"

- **conditional:** ไม่มี deferred-out → ข้าม (backward-compatible 100%)
- **recommend token (บังคับ):** ทุก hook block ต้องมี token ∈ {`เสนอ`, `user ยืนยัน`, `recommend`, `แนะนำ`} ในประโยคเดียวกับ action เขียน backlog
- **per-topic only (invariant):** capture เขียน `docs/stages/<slug>/backlog.md` เท่านั้น — global `docs/backlog.md` ห้ามแตะนอก SHIP

**Anchor table (5 จุด — pin เป๊ะ):**

| Stage | ไฟล์ + anchor | insert |
|---|---|---|
| Discovery | `stages/discovery.md` §4 ตี scope + §5 output (Out-of-scope) | pointer: item out-of-scope ที่ "ทำทีหลัง" → เสนอเข้า per-topic backlog |
| Design | `stages/design.md` §4 (proposal Out-of-scope, deterministic) + dry-run (สะพาน issue.md, optional) | pointer 2 จุด; สะพาน = "เฉพาะเมื่อทำ dry-run" |
| Build | `roles/developer.md` (ขยายบรรทัด "note ไว้" — unify-in-place) + `stages/build.md` §4 ปิดงาน | developer → "note ไว้ + ถ้าควรทำทีหลัง เสนอเข้า backlog (user ยืนยัน)"; build รวบ |
| Verify | `stages/verify.md` §3 + §4 fix loop (issue เลือกไม่แก้รอบนี้) | pointer: issue ที่ไม่แก้รอบนี้ → เสนอเข้า backlog |
| Ship | `stages/ship.md` §4 (promote — ดู §7) + ระหว่าง promote เจองานต่อยอด | hook งานต่อยอด → เสนอเพิ่ม |

---

## 6. Consume

หยิบ backlog มาใช้ตอนเริ่มงานใหม่ + รายงานสถานะ — **recommend → user ตัดสิน** เสมอ (§2):

- **Discovery (2 จุด):** §2 Input list อ่าน `docs/backlog.md` **และ** §4 ground behavior — **เสนอ** item ที่เกี่ยวข้อง (user ตัดสินหยิบเข้า scope)
- **NEXT:** report `backlog: N รายการ open` ใน overview (additive line)
- **default-exclude `docs/stages/achieved/`** — อ่าน current state จาก global เท่านั้น (ดู §8)

---

## 7. Promote (SHIP)

**หลัง archive** (mirror troubleshooting — อ่านจาก achieved path):

1. SHIP archive ทั้ง topic → `docs/stages/achieved/<date>-<slug>/` **ก่อน**
2. อ่าน `docs/stages/achieved/<date>-<slug>/backlog.md` → รวบ entry `open` → **merge เข้า `docs/backlog.md`** (พร้อมคอลัมน์ `มาจาก topic`)
3. **กลั่น ไม่ copy ดิบ:** รวม entry ซ้ำข้าม topic; **skip entry ที่ `promoted` แล้ว** (idempotent — SHIP รันซ้ำไม่เพิ่มซ้ำ)
4. **global ยังไม่มี:** `docs/backlog.md` ไม่มี (install เก่า / `--update` ไม่ seed) → **สร้างจาก template structure ก่อน merge**
5. **gate conditional:** topic ไม่มี `backlog.md` → N/A (ข้าม)

---

## 8. archive ≠ current state

global `docs/backlog.md` = **current state**; `docs/stages/achieved/` = archive (default-exclude ตอน comprehension) — อ้างหลักเดียวกับ [`interop.md` ข้อ 2](./interop.md) (ไม่ copy นิยาม)
