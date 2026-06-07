# Design (How) — cli-legacy-warning-fix

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` (`src/bin/cli.mjs` legacy warning + `src/tests/installer.test.mjs`)
- **แนวทาง:** แก้ string warning 2 block ให้ตรง Migration guide robust + sync test assertion — 1 slice (cli + test ไปด้วยกัน เพราะ black-box test assert string ตรง `troubleshooting.md` #10, standard "legacy string copy codepoint ตรง")

## 2. Vertical slices
| # | Slice | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | cli legacy warning ตรง guide + test ตาม (warn → assert ตรง robust command) | cli (warning string) · test (assert) · verify (migration proof) | `tasks/fix-legacy-warning/` |

## 3. Data model / schema
- ไม่มี — แก้ string literal
- **คำสั่งใหม่ (ตรง `CHANGELOG.md` Migration guide robust ที่ verify แล้ว):**
  - `legacyV2` (≤0.2.x): `mkdir -p docs/stages && git mv warnyin-stages/* docs/stages/` → `rm -rf workflow warnyin-stages`
  - `legacyV5` (0.3–0.5.x): `mkdir -p docs/stages && git mv warnyin/stages/* docs/stages/` → `rm -rf warnyin`

## 4. Interface / contract
- **string contract:** warning ใน cli ต้อง **= คำสั่งใน `CHANGELOG.md` Migration guide เป๊ะ** (เอกสาร↔cli sync — กลับทิศของ rule เดิม: เดิม "เอกสาร mirror cli", ตอนนี้ "cli ตาม guide ที่ robust แล้ว")
- **test contract:** `installer.test.mjs` เคส 5/6 `assert.includes(<คำสั่งใหม่>)` — copy codepoint ตรง (en-dash U+2013, ≤ U+2264 คงเดิม)

## 5. Flow
- ผู้ใช้รุ่นเก่า `npx` → installer warn (string ใหม่ robust) → ทำตามได้ผลถูก (ไม่ซ้อน) — ตรงกับที่ executable migration proof verify แล้ว

## 6. ผลกระทบต่อระบบเดิม
- **backward compat:** ไม่กระทบ install behavior (แก้แค่ข้อความ stderr); ไม่กระทบ payload/CI
- **ระวัง:** test เคส 5/6 assert string เดิม (L128/L140) → **ต้องอัปเดตพร้อมกัน** ไม่งั้น test แดง; codepoint en-dash/≤ ใน assertion คงเดิม

## 7. Dependency ระหว่าง slice/task
```
fix-legacy-warning  (task เดียว — sub: A แก้ cli string → B แก้ test assert → C re-verify migration proof)
```

## 8. Test strategy ระดับ design
- `npm test` 18/18 เขียว (เคส 5/6 ใช้ string ใหม่)
- **executable migration proof** (จาก `docs/techstack/installer/test.md`): จำลอง legacy → ทำตาม**คำสั่งใน warning ใหม่** → assert ไม่ซ้อน/ไม่ warn ซ้ำ (ยืนยัน cli warning = guide ที่ verify แล้ว)
- `git diff` แตะเฉพาะ `src/bin/cli.mjs` + `src/tests/installer.test.mjs`

---

## Design review
- **Review panel:** ข้าม — change เล็ก, scope ชัดจาก VERIFY ก่อนหน้า, ความเสี่ยงต่ำ (user ตัดสินตอนปิด gate)
