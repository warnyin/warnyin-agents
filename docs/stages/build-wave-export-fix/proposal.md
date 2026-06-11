# Proposal — แก้ build-wave.mjs ให้ Workflow tool launch ได้ (ลบ top-level export)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md` · **fast-track**

| | |
|---|---|
| **Slug** | `build-wave-export-fix` |
| **ประเภท** | `bugfix` |
| **ขนาด** | `fast` (1 ไฟล์, ลบ keyword 2 จุด, test ไม่ต้องแก้, root cause documented; ไม่แตะ hard-floor) |
| **วันที่** | `2026-06-11` |
| **มาจาก Discovery?** | ไม่มี (ต่อยอดจาก topic `parallel-design-docs` TS-1 — เจอบั๊กซ้ำครั้งที่ 3) |

## 1. สรุป change (what)
ลบ keyword `export` ออกจาก `function normalizeTasks` + `function buildOpts` ใน `src/.warnyin/workflow/scripts/build-wave.mjs` (คง `export const meta`) — ให้ Workflow tool wrap body เป็น async function ได้โดยไม่เจอ `SyntaxError: Unexpected keyword 'export'`

## 2. ทำไม (why)
- **ปัญหา:** Workflow runtime wrap script body เป็น async function + ยอมรับเฉพาะ `export const meta` → `export function` ที่ module level ทำให้ `Workflow({ scriptPath: "...build-wave.mjs" })` ล้มด้วย SyntaxError → BUILD ต้องใช้ fallback ทุกครั้ง
- **เจอซ้ำ 3 ครั้ง:** documented เป็น rule (`installer/rule.md:26`) + troubleshooting (`#16`/`#20`) ตั้งแต่ topic `build-wave-branch-fix`/`global-install` แต่ **fix ถาวรยังไม่เคยลงมือ** → topic นี้ปิดหนี้
- **ผลถ้าไม่ทำ:** BUILD worktree fan-out ใช้ Workflow script ไม่ได้ตลอดไป ต้อง workaround ทุก topic

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A (แนะนำ) — ลบ `export` คง function inline | minimal, test ไม่ต้องแก้ (extractFn หา `function ${name}` ตัด export อยู่แล้ว), Workflow runtime parse ผ่าน | — | ✅ |
| B — ย้าย pure-fn ไป `build-wave.lib.mjs` แล้ว import | แยก test ชัด | Workflow runtime ไม่รองรับ `import` ข้ามไฟล์ (no fs/module access) → build-wave จะ import ไม่ได้ตอน launch | |

- **เหตุผลที่เลือก A:** test `build-wave.test.mjs` ใช้ `extractFn` (brace-count, ค้น `function ${name}`) + `new Function` อยู่แล้ว — ไม่ import ตรง → ลบ `export` แล้วtest **ผ่านเหมือนเดิมไม่ต้องแตะ**; ทางเลือก B ติดข้อจำกัด runtime (import ไม่ได้)

## 4. Scope
**In scope**
- `src/.warnyin/workflow/scripts/build-wave.mjs` — ลบ `export` จาก 2 function (คง `export const meta`)
- `CHANGELOG.md` — entry bugfix (user-facing: BUILD fan-out script launch ได้)

**Out of scope**
- แก้ test (ไม่ต้อง — extraction-based อยู่แล้ว)
- script อื่นใน `scripts/` (validate-topic.mjs รันผ่าน node CLI ไม่ใช่ Workflow tool → `export` ปลอดภัย, ไม่แตะ)
- เปลี่ยน logic/behavior ของ build-wave (แค่เอา export ออก — พฤติกรรม identical)

## 5. ผลกระทบ & ความเสี่ยง
- **กระทบ:** BUILD ทุก topic ที่ fan-out wave ผ่าน Workflow tool (จะ launch ได้ ไม่ต้อง fallback)
- **ความเสี่ยง + วิธีลด:**
  - *test แตกเพราะหา function ไม่เจอ* → ต่ำมาก (extractFn ค้น `function ${name}` ที่ยังอยู่); ยืนยันด้วย `npm test`
  - *root dogfood stale (gitignored) → Workflow ยังรัน copy เก่า* → VERIFY ต้อง sync src→root ก่อนทดสอบ launch จริง (executable proof ด้วย empty-tasks early-return)

## 6. ลิงก์
- Design: `./design.md` · Tasks: `./tasks/`
- ที่มา: `docs/stages/achieved/2026-06-11-parallel-design-docs/troubleshooting.md` TS-1 · `docs/troubleshooting.md` #16/#20 · `docs/techstack/installer/rule.md` §build orchestration
