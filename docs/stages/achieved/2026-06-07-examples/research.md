# Research — examples (worked example)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> ที่เก็บ "ข้อมูลที่ค้นมา + หลักฐาน" สนับสนุนการตัดสินใจใน `discovery.md`

| | |
|---|---|
| **Slug** | `examples` |
| **วันที่** | 2026-06-07 |

---

## 1. คำถามวิจัย (research questions)
- [x] RQ1: ตอนนี้ผู้ใช้ใหม่เห็นตัวอย่างจริงตรงไหนได้บ้าง?
- [x] RQ2: achieved topic ไหนเหมาะเป็น canonical example (ครบ 5 stage + ย่อยพอ + สะอาด)?
- [x] RQ3: example ควร ship ไปกับ npm package ไหม?
- [x] RQ4: staleness risk อยู่ตรงไหน + กันยังไง?

## 2. วิธี & แหล่งข้อมูล
- [x] อ่านโค้ด/เอกสารในโปรเจกต์ (code inspection — achieved/, template, README, package.json files)
- [ ] ค้นเว็บ / เอกสารภายนอก (ไม่จำเป็น — โจทย์เป็น internal docs)

## 3. Findings

### RQ1: ผู้ใช้ใหม่เห็นตัวอย่างตรงไหน
- **พบว่า:** README มีแค่โครง stage + คำสั่ง (`grep -niE 'example|ตัวอย่าง'` → ไม่มี worked example); template `[topic]/` เป็นโครงเปล่า (placeholder `<...>`); achieved 9 topic มีของจริงแต่ไม่มีจุด onboard ชี้ไป
- **หลักฐาน:** `README.md` (ไม่มี section example), `find src/.warnyin/template/stages/[topic]` (11 ไฟล์เปล่า), `ls docs/stages/achieved/` (9 topic)
- **นัย:** ต้องมี "จุดชี้ + narrative" ไม่ใช่สร้าง content ใหม่ — surface ของที่มี

### RQ2: canonical example
- **พบว่า:** `cli-legacy-warning-fix` ครบ 13 ไฟล์ (discovery→ship + test/troubleshooting) + **1 task สะอาด** `fix-legacy-warning` (ไม่มี `[task-name]` ตกค้าง) + VERIFY ผ่าน 0 รอบ + เป็น **code fix จริง** (แตะ `cli.mjs` + test) → สอน BUILD/VERIFY ที่มี code ได้ แต่กระทัดรัด
- **หลักฐาน:** `find docs/stages/achieved/2026-06-07-cli-legacy-warning-fix` (ครบ), `grep verify.md` → "ผลรวม ✅ ผ่าน / 0 รอบ"
- **เทียบ:** `skill-format` ครบสุดแต่หนัก (dry-run + L1/L2/L3); `context-profiles` สะอาดแต่ไม่มี code build → cli-legacy สมดุลสุด
- **นัย:** เลือก cli-legacy-warning-fix (Decision #2)

### RQ3: ship ไป npm ไหม
- **พบว่า:** `package.json files` = `src/bin, src/.warnyin, src/.claude/{commands,agents,skills}, src/AGENTS.md, README/CHANGELOG/LICENSE` — **`docs/` ไม่อยู่ใน list** → achieved/walkthrough ไม่ติด tarball อยู่แล้ว
- **หลักฐาน:** `node -e require('./package.json').files`; verify-pack denylist จับ `docs/` เป็น leak (test เคส 4)
- **นัย:** ถ้าจะ ship ต้องเพิ่ม `docs/` เข้า files (ขัด rule §4 + เพิ่มขนาด + staleness) → **เลือกไม่ ship** ผู้ใช้ดูบน GitHub (Decision #1); README (ที่ ship อยู่แล้ว) เป็นจุด pointer พอ

### RQ4: staleness risk
- **พบว่า:** achieved/ เป็น snapshot — SHIP archive แล้วไม่แตะอีก (ไฟล์ freeze) → ลิงก์เสถียรตราบที่ไม่ย้ายโฟลเดอร์; risk จริง = (a) narrative อธิบายโครง stage แล้วโครงเปลี่ยน, (b) ลิงก์พังถ้า achieved rename
- **หลักฐาน:** pattern SHIP (`ship.md` §4 archive ด้วย git mv ครั้งเดียว); เพิ่งเจอ pain stale จริง (roadmap #9, `[task-name]`)
- **นัย:** (a) → disclaimer "snapshot ณ วันที่ + ดู `.warnyin/workflow/stages/` เป็น source" + ไม่ re-describe playbook; (b) → dead-link verify (Decision #4)

## 4. Code inspection
| ไฟล์ / ส่วน | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `README.md` | ไม่มี worked-example section | เพิ่ม section pointer |
| `src/.warnyin/template/stages/[topic]/` | 11 ไฟล์โครงเปล่า | template ≠ ตัวอย่างจริง → ต้อง surface achieved |
| `docs/stages/achieved/.../cli-legacy-warning-fix/` | 13 ไฟล์ครบ + 1 task สะอาด | canonical example |
| `package.json files` | ไม่มี `docs/` | walkthrough ไม่ ship → GitHub-only |
| `src/scripts/verify-pack.mjs` (denylist) | จับ `docs/` เป็น leak | ยืนยันไม่ควร ship docs |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก | ข้อดี | ข้อเสีย | เหมาะ? |
|---|---|---|---|
| surface achieved (narrative+pointer) | ไม่ duplicate, maintenance ต่ำ | ผู้ใช้ต้องเปิด GitHub | ✅ |
| examples/ ship npm | ได้ไฟล์ตอนติดตั้ง | duplicate + ขนาด + staleness | — |
| examples/ repo-only (duplicate) | อยู่ใน repo | duplicate กับ achieved | — |

## 6. ความเสี่ยง / unknown ที่ยังเหลือ
- (ปิดครบ) — narrative drift + ลิงก์พัง มีมาตรการแล้ว (disclaimer + dead-link)

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำจาก research:** docs-only topic เล็ก — `docs/example-walkthrough.md` (narrative 5 stage ของ cli-legacy-warning-fix + ลิงก์ achieved/ + disclaimer) + README pointer; VERIFY = dead-link + verify-pack เขียว (ไม่แตะ payload)
- **ป้อนกลับ discovery:** Decision #1–4 (surface / cli-legacy / docs+README / disclaimer+dead-link)
