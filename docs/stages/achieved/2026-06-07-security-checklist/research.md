# Research — security-checklist

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `security-checklist` |
| **วันที่** | 2026-06-07 |

---

## 1. คำถามวิจัย
- [x] RQ1: security.md เดิมครอบอะไร — runtime security ซ้ำไหม
- [x] RQ2: install-skill มี supply-chain warning อยู่แล้วแค่ไหน
- [x] RQ3: docs/rule.md §3 security baseline ครอบ agent-runtime ไหม
- [x] RQ4: permission-deny/sandbox syntax ผูก tool แค่ไหน (tool-agnostic)

## 2. วิธี & แหล่งข้อมูล
- [x] code/doc inspection — `roles/security.md`, `.claude/commands/warnyin/install-skill.md`, `docs/rule.md` §3, `src/scripts/setup-dogfood.mjs`
- [x] roadmap P1 #7 (ที่มา ECC `the-security-guide.md`)

## 3. Findings

### RQ1: security.md เดิม (ไม่ซ้ำ — คนละมิติ)
- **พบว่า:** security.md = **DESIGN-panel reviewer**; checklist เน้น **app security** (input validate, authn/authz, PII, injection, secret ใน code, dependency ใหม่)
- **นัย:** **agent-runtime security** (permission deny อ่าน secret/.env, no-egress, แยก identity) เป็น **มิติใหม่** — ไม่ซ้ำ; เพิ่มเป็น section แยก "Runtime / operational security"

### RQ2: install-skill warning (มีพื้นฐาน — เสริม prompt-injection)
- **พบว่า:** `install-skill.md` step 4 มี "คำเตือนว่าเป็น third-party (ไม่ใช่ official, ตรวจเนื้อหาได้ที่ skills.sh)" + step 5 ติด global (reference ไม่ vendor)
- **นัย:** มี supply-chain awareness แล้ว — #7 **เสริมให้คม:** ระบุ **prompt-injection risk** ชัด (third-party skill = โค้ด/instruction ที่ AI execute ต่อ)

### RQ3: docs/rule.md §3 (CI เท่านั้น — ไม่ครอบ agent runtime)
- **พบว่า:** §3 "CI security baseline" = least-privilege ของ `.github/workflows/` (permissions contents:read, ห้าม pull_request_target, ไม่มี secrets, pin SHA) — เป็น **CI/pipeline** security
- **นัย:** **agent-runtime security** (การรัน AI agent ในเครื่อง) ยังไม่มี → เพิ่ม global bullet ใน §3 (หรือ sub-section) รอ SHIP

### RQ4: tool-agnostic (permission-deny = Claude เฉพาะ)
- **พบว่า:** `Read(**/.env*)`, `permissions.deny` = Claude Code `settings.json` syntax; "sandbox no-egress"/"แยก identity" เป็น concept ทั่วไป (มีในหลาย harness รูปแบบต่างกัน)
- **หลักฐาน:** `setup-dogfood.mjs` comment เตือน "payload ถูก agent execute ต่อ = supply-chain surface" — เป็น concern ระดับ concept อยู่แล้ว
- **นัย:** เขียน **principle กลาง** (deny secret read / no-egress / แยก identity) + **Claude example เป็น adapter note** (D3) — คงปรัชญา tool-agnostic + adapter บาง

## 4. Code inspection
| ไฟล์ | พบ | นัย |
|---|---|---|
| `roles/security.md` | reviewer DESIGN panel, app-security checklist | +section "Runtime/operational" (มิติใหม่) + item supply-chain |
| `install-skill.md` | warning third-party + skills.sh + global install | +prompt-injection ชัดใน step 4 |
| `docs/rule.md` §3 | CI security baseline | +agent-runtime baseline (รอ SHIP) |
| `stages/verify.md` | ไม่มี security reference | +reference runtime checklist (ตอนรันเทส local) |
| `setup-dogfood.mjs` | comment "payload agent execute = supply-chain" | concept มีแล้ว — ยกระดับเป็น checklist |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| principle portable + Claude adapter note | tool-agnostic, actionable | ต้องเขียน 2 ชั้น | ✅ (D3) |
| Claude-specific config เป็น rule หลัก | actionable ทันที | ผูก Claude ขัดปรัชญา | — |

## 6. ความเสี่ยง / unknown
- ไม่มี unknown ที่ block — ปิดด้วย code/doc inspection

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำ:** A → security.md section runtime (principle+Claude note) + verify reference + global rule note; B → install-skill prompt-injection + security.md supply-chain item; verify ด้วย npm test + verify:pack
- **ป้อนกลับ discovery.md:** D1-D4 ยืนยัน — runtime ไม่ซ้ำ app-security เดิม, install-skill มีพื้นฐาน, rule.md §3 ไม่ครอบ runtime, tool-agnostic via adapter note
