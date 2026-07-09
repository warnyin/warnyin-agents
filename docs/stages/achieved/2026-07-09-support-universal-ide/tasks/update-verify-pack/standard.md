# Standard — update-verify-pack

> อิงจาก `docs/techstack/installer/standard.md` §pack-verify

## 1. Standard กลางที่ยึด

- `checkFiles(files)` = pure function รับ POSIX path[] คืน error[]
- `ALLOWED_PREFIX` = narrow allowlist; path ที่ไม่ match → error
- main-guard: `process.argv[1]` comparison (ไม่ใช่ import.meta.main)
- unit test feed ปลอม (ไม่รัน `npm pack` จริงใน unit test)

## 2. Pattern การเขียนโค้ดของ task นี้

### Option A: เพิ่ม explicit path ต่อ file

```js
const ALLOWED_PREFIX = [
  'src/bin/',
  'src/.warnyin/',
  'src/.claude/commands/',
  'src/.claude/agents/',
  // ★ ใหม่
  'src/.warnyin/installer/templates/',  // ← generalize ครอบทุก template
]
```

### Option B: generalize templates/ เป็น prefix เดียว (แนะนำ)

`'src/.warnyin/installer/templates/'` ครอบทุกไฟล์ใน templates ทั้งเดิมและใหม่ — maintenance น้อยกว่า (ไม่ต้องเพิ่มทุกครั้งที่เพิ่ม template)

**ให้ BUILD agent ตรวจว่า `ALLOWED_PREFIX` เดิมมีรูปแบบไหน แล้วเลือก option ที่สอดกับ pattern เดิม**

## 3. Shared component

- `checkFiles` pure fn ใน `verify-pack.mjs` — import โดย unit test
