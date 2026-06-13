# Troubleshooting — fix setup:dogfood stale-payload

> Log ปัญหายาก/ซ้ำตอนทำ topic นี้

---

### TS-1: pure fn ที่ test ด้วย temp dir — รับ path ไม่รับ parsed object
| | |
|---|---|
| **วันที่** | `2026-06-13` |
| **Component / Task** | `installer` / `tasks/fix-dogfood-stale-detection` |
| **ความถี่** | เจอครั้งเดียว (design ambiguity) |
| **ยกขึ้น KB กลางตอน SHIP?** | ✅ (generalizable — pattern ของ testable pure fn) |

- **อาการ:** `checkTarballVersion` design อนุญาต 2 แบบ — รับ `pj` object (reuse parse เดิม L190) หรือรับ `extractDir` (อ่านเอง). standard.md เน้น "reuse parse เดียว ไม่อ่านซ้ำ" → ชวนเลือกรับ pj object
- **Trigger:** ต้องการ pure fn ที่ **testable ด้วย temp dir + fake package.json** (pattern เดียวกับ `verifyInstalled` รับ `root`)
- **Root cause:** ถ้ารับ `pj` object → unit test ต้อง mock object ส่งเข้า → **ไม่ทดสอบ file-read path จริง** (mock leak); ขัดเจตนา "executable test ไม่ source-grep" (panel QA B2)
- **วิธีแก้:** เลือก `checkTarballVersion(extractDir, expected)` รับ path → อ่าน `package.json` เอง (ทดสอบ read path จริงด้วย temp dir); ยอมอ่านไฟล์ซ้ำ 1 ครั้ง (testability > micro dedup) — `installViaPack` เรียก `checkTarballVersion(extractDir, expected)` แทนส่ง version
- **ป้องกันซ้ำ:** **pure fn ที่ต้อง testable ด้วย temp-dir pattern → รับ path เสมอ ไม่รับ parsed object** (กัน mock leak + ทดสอบ read path จริง) — trade dedup เล็กน้อยเพื่อ executable test ที่จับ behavior จริง (สำคัญกับ feature ที่เคย false-success)
