# Troubleshooting — Understand-Anything Interop

> Log ปัญหา **ยาก/ซ้ำ** ที่เจอระหว่างทำงาน topic นี้ แล้วแก้สำเร็จ
> ตอน **SHIP** จะยกรายการที่มีค่าขึ้น KB กลาง `docs/troubleshooting.md`

---

### TS-1: lint-md false-positive — markdown-link ใน double-backtick code
| | |
|---|---|
| **วันที่** | `2026-06-15` |
| **Component / Task** | `installer` (dev tooling `lint-md.mjs`) / `tasks/embed-interop-convention` |
| **ความถี่** | เจอครั้งเดียว (ยาก — เข้าใจ regex ของ CODE_RE) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ candidate (limitation จริงของ gate) |

- **อาการ / error message:**
  ```
  npm run lint:md → docs/stages/.../standard.md: ลิงก์เสีย → interop.md
  ```
- **บริบทที่ทำให้เกิด (trigger):** เขียนตัวอย่าง markdown-link `[interop](interop.md)` ครอบด้วย **double-backtick** `` `` ... `` `` ในเอกสาร (เพื่อแสดง inline-code ที่มี backtick ข้างใน)
- **สาเหตุที่แท้จริง (root cause):** `CODE_RE` ใน `lint-md.mjs` strip เฉพาะ **single-backtick** และ **triple-backtick** — **ไม่ strip double-backtick** → markdown-link ตัวอย่างที่อยู่ใน double-backtick ถูก `LINK_RE` จับแล้วตรวจ path จริง → false dead-link. รูปแบบ regex + ตัวอย่างที่ทำให้พัง (เขียนใน fenced block เพื่อให้ lint strip ได้ — ดูข้อ "ป้องกัน"):

  ```
  CODE_RE = /```[\s\S]*?```|`[^`\n]*`/g     # strip ไม่ครอบ double-backtick
  ตัวอย่างที่หลุด: double-backtick ครอบ link [text](path) → ตรวจ path จริง
  ```
- **วิธีแก้ที่ได้ผล (solution):** เปลี่ยนตัวอย่างจาก double-backtick เป็น **fenced code block** (triple-backtick) ซึ่ง CODE_RE strip ได้ → lint ผ่าน
- **วิธีสังเกต/ป้องกันไม่ให้เกิดซ้ำ:** เขียนตัวอย่าง markdown-link ในเอกสารด้วย **fenced code block** แทน double-backtick; หรือ escape วงเล็บ. (ถ้าจะแก้ที่ root: เพิ่ม double-backtick ใน CODE_RE ของ `lint-md.mjs` — แต่เป็น dev-tooling change คนละ topic)

---

### หมายเหตุ (ไม่ใช่ปัญหาของ change นี้)
- `npm test` มี 2 fail `isEntrypoint` (`installer.test.mjs`) — Windows realpath/symlink, **pre-existing** (ยืนยัน base) ไม่เกี่ยวกับ topic นี้ → ไม่บันทึกเป็น TS
- `verify:pack` (node) ENOENT บน Windows = KB กลาง #4 (ใช้ `npm pack --dry-run` แทน) — ไม่ duplicate
