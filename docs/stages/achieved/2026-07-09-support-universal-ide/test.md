# Test Plan — support-universal-ide

> Stage: VERIFY · playbook: `.warnyin/workflow/stages/verify.md`
> วันที่: 2026-07-09

## 1. สิ่งที่ต้อง verify

topic นี้เพิ่ม IDE adapter install สำหรับ 5 IDE (Cursor, Windsurf, Copilot Chat, Cline/Roo Code, Gemini CLI) ผ่าน `cli.mjs` ในทั้ง project mode และ global mode

จุดประสงค์หลักที่ต้อง verify:
1. `installAdapterDoc` สร้างไฟล์ adapter ครบ 5 ตัวพร้อม marker ถูกต้อง
2. idempotent: รันซ้ำ → append-once (marker กัน duplicate)
3. backward compat: ไม่ overwrite เนื้อหาเดิมของ user
4. `--update` behavior สำหรับ adapter (ใช้ `installAdapterDoc` → marker-based skip ถ้ามีอยู่แล้ว)
5. global mode: adapter ลงใน homedir
6. `--dry-run`: log path แต่ไม่สร้างไฟล์
7. verify-pack gate: adapter template path ผ่าน allowlist
8. release hygiene: CHANGELOG/version/docs ถูกต้อง

**Spec delta (design.md §9):** ไม่มี feature spec ใน `docs/features/` — regression baseline = behavior เดิมของ installer ทั้งหมด (test เดิม 27 เคส ต้องยังผ่าน)

---

## 2. Environment

- **infra:** ไม่ต้องการ service ภายนอก — รัน node test suite ใน local
- **tools:** `node --test src/tests/installer.test.mjs`, `node --test src/tests/verify-pack.test.mjs`, `node src/scripts/verify-pack.mjs`, `node src/scripts/check-test-count.mjs`
- **ไม่ใช่ frontend** — UX/UI verify ไม่เกี่ยวข้อง

---

## 3. Test cases

### T1 — add-ide-adapters (installer behavior)

| ID | Description | Expected |
|---|---|---|
| T1-project-basic | `--project` → ไฟล์ครบ 5 adapter + มี marker | ✅ pass |
| T1-idempotent | รัน 2 ครั้ง → marker ปรากฏ 1 ครั้ง | ✅ pass |
| T1-existing-clinerules | `.clinerules` มีเนื้อเดิม → append ไม่ overwrite | ✅ pass |
| T1-global | `--global` → adapter ลง homedir ครบ 5 ตัว | ✅ pass |
| T1-dry-run | `--dry-run` → log มี path แต่ไม่สร้างไฟล์ | ✅ pass |
| **T1-update** | `--project` → แก้ `.cursor/rules/warnyin.mdc` → `--project --update` → ไฟล์ต้อง **overwrite กลับ** เป็น template content (เพราะ `installAdapterDoc` ตรวจ marker ไม่ใช่ content — ถ้ามี marker อยู่แล้ว = skip, ไม่ overwrite) | **ต้อง specify behavior** |

> **หมายเหตุ T1-update:** design §4 ระบุ Cursor/Windsurf ใช้ `copyTree` (overwrite ได้เมื่อ `--update`) แต่ implementation BUILD ใช้ `installAdapterDoc` ทั้งหมด — `installAdapterDoc` ตรวจ marker เท่านั้น ถ้ามี marker → skip ไม่ overwrite แม้ `--update=true`; behavior จริงต่างจาก design spec — ต้อง verify และตัดสินใจ

### T2 — update-verify-pack

| ID | Description | Expected |
|---|---|---|
| T2-adapter-templates | path ใหม่ 5 ตัวผ่าน allowlist | ✅ pass |
| T2-negative | denylist ยังจับ docs/ | ✅ pass |
| T2-allowed-existing | path เดิมยังผ่าน | ✅ pass (ครอบโดย baseline test) |
| T2-denylist-tests | `src/tests/` ยังถูกจับ | ✅ pass (ครอบโดย baseline test) |

### T3 — release-hygiene

| ID | Description | Expected |
|---|---|---|
| T3-changelog | CHANGELOG.md มี Cursor/Windsurf/Copilot/Cline/Gemini | ✅ pass |
| T3-version-bump | version เพิ่มจากเดิม | ✅ pass |
| T3-claude-template | CLAUDE.md template มี IDE ใหม่ | ✅ pass |
| T3-full-test | `node --test` exit 0 | ✅ pass |

### Regression — installer behavior เดิม

เคส 1-9, 10-17, (a)-(d), isEntrypoint (27 เคสเดิม) ต้องยังผ่านทั้งหมด

---

## 4. Design-vs-implementation gap: T1-update behavior

spec.md §7 ระบุ T1-update: "รัน `--update` → ไฟล์กลับเป็น content จาก template"
design.md §4 ระบุ Cursor/Windsurf ใช้ `copyTree` (overwrite ได้)

**แต่ implementation ใช้ `installAdapterDoc` ทั้งหมด** — `installAdapterDoc` logic:
```
ถ้า dest ไม่มี → สร้างใหม่
ถ้า dest มีอยู่แล้วและมี marker → skip (ไม่สน --update)
ถ้า dest มีอยู่แล้วและไม่มี marker → append
```

ผลลัพธ์: `--update` ไม่ overwrite adapter ที่มี marker อยู่แล้ว — behavior นี้ต่างจาก spec T1-update

**การตัดสิน (VERIFY QA role):**
- behavior ปัจจุบัน (skip ถ้ามี marker) = **safe** — ไม่ destroy content user
- behavior ตาม spec T1-update (overwrite เมื่อ `--update`) = **desirable** สำหรับ Cursor/Windsurf ที่เป็น IDE-owned folder ที่ user ไม่แตะ
- ยังเป็น finding แต่ไม่ block acceptance ของ feature หลัก (adapter install ทำงานถูก)
- **scope รอบนี้:** implement T1-update test เพื่อ document behavior จริง; ถ้า behavior ไม่ตรง spec → fix หรือ propose backlog

---

## 5. Run strategy

```bash
# full suite
node --test src/tests/installer.test.mjs
node --test src/tests/verify-pack.test.mjs

# gate
node --test | node src/scripts/check-test-count.mjs

# pack
node src/scripts/verify-pack.mjs
```
