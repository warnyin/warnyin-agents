# Verify Report — support-universal-ide

> Stage: VERIFY · playbook: `.warnyin/workflow/stages/verify.md`
> วันที่: 2026-07-09

## 1. สรุปผล

| Gate | ผล |
|---|---|
| T1 suite (add-ide-adapters) | ✅ pass 33/33 |
| T2 suite (update-verify-pack) | ✅ pass 13/13 |
| T3 assertions (release-hygiene) | ✅ ผ่านทุกข้อ |
| Full test suite | ✅ pass 135/135, fail 0 |
| check-test-count gate (MIN_PASS=46) | ✅ 135 ≥ 46 |
| verify:pack | ✅ ผ่าน 98 ไฟล์ |
| Regression (เคส 1-17, a-d, isEntrypoint) | ✅ ไม่มีเคสเก่าพัง |

**สรุป: VERIFY ผ่าน — topic ทำงานถูกตามจุดประสงค์ทุกข้อ**

---

## 2. Test cases รัน

### T1 — add-ide-adapters

| ID | ผล | หมายเหตุ |
|---|---|---|
| T1-project-basic | ✅ pass | ไฟล์ครบ 5 adapter + marker ถูก |
| T1-idempotent | ✅ pass | marker ปรากฏ 1 ครั้ง |
| T1-existing-clinerules | ✅ pass | append ไม่ overwrite |
| T1-global | ✅ pass | adapter ลง homedir ครบ |
| T1-update | ✅ pass (หลัง fix) | Cursor/Windsurf overwrite; Cline ไม่ซ้ำ |
| T1-dry-run | ✅ pass | log path แต่ไม่สร้างไฟล์ |

### T2 — update-verify-pack

| ID | ผล | หมายเหตุ |
|---|---|---|
| T2-adapter-templates | ✅ pass | path ใหม่ 5 ตัวผ่าน allowlist |
| T2-negative | ✅ pass | denylist ยังจับ docs/ |
| baseline (T2-allowed-existing, T2-denylist-tests) | ✅ pass | ครอบโดย test เดิม 11 เคส |

### T3 — release-hygiene

| ID | ผล | หมายเหตุ |
|---|---|---|
| T3-changelog | ✅ pass | CHANGELOG มี Cursor/Windsurf/Copilot/Cline/Gemini |
| T3-version-bump | ✅ pass | 0.24.0 → 0.25.0 |
| T3-claude-template | ✅ pass | CLAUDE.md template มี IDE ครบ 5 |
| T3-full-test | ✅ pass | pass 135/135 |

---

## 3. Finding + fix loop

**จำนวนรอบแก้: 1 รอบ**

### F1 — T1-update: installAdapterDoc ไม่ overwrite เมื่อ --update (spec gap)

- **Finding:** spec.md §7 T1-update ระบุ `--update` ควร overwrite adapter Cursor/Windsurf กลับเป็น template; แต่ implementation ใช้ `installAdapterDoc` ทั้งหมด ซึ่งตรวจ marker → skip โดยไม่สน `UPDATE` flag
- **Root cause:** BUILD เลือก `installAdapterDoc` ทั้งหมดแทน `copyTree` (เหตุผล: template ชื่อ ≠ dest) แต่ไม่ส่ง `{ overwrite: UPDATE }` ทำให้ `--update` behavior สำหรับ Cursor/Windsurf ขาดไป
- **Fix:** เพิ่ม `opts.overwrite` branch ใน `installAdapterDoc` — ถ้า `opts.overwrite=true` → writeFileSync แทน append; ส่ง `{ overwrite: UPDATE }` เฉพาะ Cursor/Windsurf call; Copilot/Cline/Gemini ยังคง append-only
- **ไฟล์ที่แก้:** `src/bin/cli.mjs`, `src/tests/installer.test.mjs` (เพิ่ม T1-update test), `src/scripts/check-test-count.mjs` (bump MIN_PASS 45→46)
- **หลัง fix:** pass 135/135

---

## 4. Gate checklist

- [x] เทสตาม **จุดประสงค์ของ topic** ครบ (functional ตาม test-flow ใน spec ทั้ง T1/T2/T3)
- [x] **regression** — scenario เดิม (เคส 1-17, a-d, isEntrypoint) ยังผ่าน
- [x] ไม่มี UX/UI (installer — ไม่ใช่ frontend)
- [x] ไม่มี openapi.yaml
- [x] ทุกข้อที่ไม่ผ่าน (F1) แก้จนผ่าน
- [x] `test.md` + `verify.md` เขียนครบ
- [x] ไม่มีปัญหายาก/ซ้ำที่ต้องบันทึก troubleshooting

---

## 5. ขั้นถัดไป

→ `/warnyin:ship support-universal-ide`
