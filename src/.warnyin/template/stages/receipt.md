# Receipt — <ชื่อ change>

> fast-track receipt · lifecycle: pre-flight (meta+§1+§2) → BUILD+VERIFY (§3+§4) → SHIP-lite (§5+archive)

| | |
|---|---|
| **Slug** | `<kebab-case>` |
| **Tier** | `fast` |
| **ประเภท** | `bugfix` / `docs` / `config` / `refactor` |
| **วันที่** | `YYYY-MM-DD` |
| **Base** | `<git SHA ตอน pre-flight>` |
| **Hard-floor** | ผ่าน (ไม่แตะ auth/migration/secret/public-API/security) · แตะหมวด X → upgrade **หรือ** `override โดย user` (fastlane §2 — user ยืนยันเอง) |

## §1 ทำอะไร + ทำไม

> สรุปใน ≤3 บรรทัด

## §2 Acceptance (1-3 ข้อ)

- [ ]

## §3 ไฟล์ที่แตะ + สรุป diff

| ไฟล์ | สิ่งที่เปลี่ยน |
|---|---|
| | |

## §4 ผล test

- รัน: `<คำสั่ง>`
- ผล: ผ่าน / แดง
- หมายเหตุ (ถ้าแตะ config/test-threshold + เหตุผล):

## §5 Learned rule / Troubleshooting (ถ้ามี)

-
