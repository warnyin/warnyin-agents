# Spec — fix-legacy-warning

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`logic` (string fix ใน CLI) + `test`

---

## 4. Data-flow
> warning string ใน `cli.mjs` = source ที่ผู้ใช้รุ่นเก่าทำตาม → ต้อง = Migration guide robust ใน `CHANGELOG.md`

**คำสั่งเป้าหมาย (verify แล้วใน topic `roadmap-sync-p0`):**
```
≤0.2.x:    mkdir -p docs/stages && git mv warnyin-stages/* docs/stages/   →  rm -rf workflow warnyin-stages
0.3–0.5.x: mkdir -p docs/stages && git mv warnyin/stages/* docs/stages/   →  rm -rf warnyin
```

## 5. User-flow
> ผู้ใช้รุ่นเก่า `npx` → installer warn (string ใหม่) → ทำตาม → งานจริงอยู่ `docs/stages/<topic>/` (ไม่ซ้อน), รัน installer ซ้ำไม่ warn อีก

## 6. Persona
> ผู้ใช้ npm รุ่นเก่า (≤0.2.x / 0.3–0.5.x) ที่อ่าน warning จาก installer โดยไม่เปิด CHANGELOG

## 7. Test-flow
- [ ] `src/bin/cli.mjs` `legacyV2` block: คำสั่งเป็น `mkdir -p docs/stages && git mv warnyin-stages/* docs/stages/` + `rm -rf workflow warnyin-stages`
- [ ] `src/bin/cli.mjs` `legacyV5` block: คำสั่งเป็น `mkdir -p docs/stages && git mv warnyin/stages/* docs/stages/` + `rm -rf warnyin`
- [ ] string คง codepoint รุ่น `(≤0.2.x)` U+2264, `(0.3–0.5.x)` en-dash U+2013
- [ ] `src/tests/installer.test.mjs` เคส 5 assert `includes('git mv warnyin/stages/* docs/stages/')`; เคส 6 assert `includes('git mv warnyin-stages/* docs/stages/')`
- [ ] `npm test` 18/18 เขียว
- [ ] **executable migration proof:** จำลอง legacy → ทำตามคำสั่งใน warning ใหม่ (อ่านจาก stderr จริง) → งานจริงไม่ซ้อน + ไม่ warn ซ้ำ ทั้ง 2 รุ่น
- [ ] `git diff` แตะเฉพาะ `src/bin/cli.mjs` + `src/tests/installer.test.mjs`
