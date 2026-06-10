# API-DOC — เอกสาร REST API (OpenAPI 3.1) แบบ adaptive

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: ถ้า topic **แตะ backend/REST API จริง** → ผลิต + ยืนยัน + ส่งมอบ **OpenAPI 3.1 contract** ให้อัตโนมัติ ตลอด lifecycle (DESIGN → VERIFY → SHIP)

---

## 1. คืออะไร / ใช้เมื่อไหร่

API-DOC ไม่ใช่ stage แยก และ **ไม่มี slash command** — เป็น **capability เสริมที่ stage เรียกใช้เอง** เมื่อ auto-detect พบว่า topic เกี่ยวกับ REST API

- ทำงานเป็นส่วนหนึ่งของ DESIGN / VERIFY / SHIP — stage playbook ชี้มาที่ไฟล์นี้
- **adaptive:** ตรวจ signal ทุก topic — ถ้า **ไม่ใช่** backend/REST API → **ข้ามทั้งหมดเงียบๆ** (ไม่ยัดเยียด ไม่สร้างไฟล์เปล่า)
- tool-agnostic: เป็นมาตรฐาน OpenAPI 3.1 ล้วน ไม่ผูกกับ AI เจ้าใดหรือเฟรมเวิร์กใด

---

## 2. Auto-detect — topic นี้แตะ REST API ไหม?

ดูสัญญาณต่อไปนี้ (เจอ **อย่างน้อยหนึ่ง** ที่ชัดเจน = ใช่):

1. **techstack** — `docs/techstack/<component>/about.md` ระบุว่าเป็น backend/HTTP service / REST / web API
2. **route ในโค้ด** — มี handler/controller ที่ผูก HTTP route เช่น Express/Fastify/NestJS/Koa/Hapi, FastAPI/Flask/Django REST, Spring/Gin/Echo, ASP.NET ฯลฯ
3. **annotation/decorator** ที่ gen spec ได้อยู่แล้ว — tsoa, springdoc, drf-spectacular, FastAPI (Pydantic)
4. **task ถูกจัดเป็น "API task"** ตอนแตก spec (design.md §6)
5. **change เพิ่ม/แก้ HTTP endpoint** — request/response/error/auth/status code เปลี่ยน

> สัญญาณคลุมเครือ (เช่น มีแค่ internal function ไม่ใช่ HTTP, RPC/gRPC ที่ไม่ใช่ REST, CLI/library ล้วน) → **ไม่ใช่** → ข้าม
> ไม่แน่ใจจริง → ถาม user ทีละข้อ + เสนอคำตอบที่แนะนำ (ตามหลัก "ห้ามเดา" ของทุก stage)

---

## 3. เลือกโหมด (เลือกตาม signal + ระยะของงาน)

| โหมด | เมื่อไหร่ | วิธี |
|---|---|---|
| **Design-first** | endpoint **ใหม่** ยังไม่มีโค้ด | เขียน `openapi.yaml` ก่อน (ตอน DESIGN) = contract ที่ BUILD จะ implement ตาม |
| **Code-first** | API **มีอยู่แล้ว** + เฟรมเวิร์ก gen spec ได้ (FastAPI/tsoa ฯลฯ) | generate spec จากโค้ด แล้วตรวจ/เก็บเป็น artifact |
| **Hybrid** | โค้ดมี annotation/decorator แต่ยังไม่ครบ | gen จาก annotation + เติม schema/example ที่ขาดด้วยมือ |

โปรเจกต์เดียวกันใช้คนละโหมดต่อ topic ได้ — เลือกตามจริง

---

## 4. บทบาทต่อ stage

### DESIGN — ผลิต contract
- detect (ข้อ 2) → ถ้าใช่: ผลิต/อัปเดต `docs/stages/<slug>/openapi.yaml` (OpenAPI 3.1)
  - endpoint ใหม่ → **design-first** เขียน contract ก่อน; API เดิม → **code-first/hybrid** gen จากโค้ดแล้วเติม
- `tasks/<api-task>/spec.md` (API SPEC) **ชี้มาที่ `openapi.yaml`** — ไม่เขียน schema ซ้ำสองที่ (single source)
- ถ้ามีเครื่องมือ lint ในโปรเจกต์ → รัน (ดูข้อ 5); ไม่มีก็ข้าม ไม่บังคับติดตั้ง

### VERIFY — ยืนยันว่าโค้ดจริงตรง contract
- topic มี `openapi.yaml` → **contract validation**: ยืนยันว่า implementation จริง = contract
  - code-first: regen spec จากโค้ด → diff กับ `openapi.yaml` (ต้องไม่ต่าง)
  - หรือยิง request จริงใน local env → ตรวจ response ตรง schema/status/error ที่ระบุ
  - **★ runtime security:** การ regen (boot app จริง — FastAPI/tsoa) หรือยิง request จริง อยู่ใต้ runtime-security ของ `verify.md` §2 (local-only, scoped credential, no prod, no unnecessary egress) — ทบทวนก่อนปล่อย agent แตะของจริง
- mismatch = **ไม่ผ่าน** → แก้ (โค้ด หรือ contract ตามต้นเหตุจริง) วนจนตรง — นับเป็นส่วนหนึ่งของ fix loop ใน verify.md §4

### SHIP — promote contract ขึ้นเอกสารกลาง
- ยก `openapi.yaml` → **`docs/techstack/<component>/openapi.yaml`** = living API contract ถาวร (เทียบเท่า `spec.md` ที่เป็น living behavior spec)
- มี contract เดิมอยู่แล้ว → **merge ตาม delta** (เพิ่ม/แก้/ลบ path·schema ที่ topic แตะ) ไม่ทับทั้งไฟล์
- อ้างถึงจาก `docs/features/<name>/spec.md` ของ feature ที่ใช้ endpoint นั้น

---

## 5. มาตรฐาน + เครื่องมือ (reference ไม่ vendor)

- **มาตรฐาน:** OpenAPI **3.1.0** — `info`/`servers`/`paths`/`components.schemas`/`components.securitySchemes`; ใช้ `$ref` reuse, ใส่ `examples`, ระบุ error + status code + auth scheme ครบ, อย่า hardcode URL (ใช้ server variable)
- **★ secret hygiene (บังคับ — `openapi.yaml` ถูก commit ถาวร):** ก่อน commit/promote ต้อง **scrub** — `servers.url` ใช้ placeholder/variable (ไม่ใช่ internal/staging host จริง), `examples`/`example`/default ใช้ค่า dummy (`user@example.com`, `<token>`) **ห้าม secret/credential/PII จริง**, `securitySchemes` ระบุแค่รูปแบบ ไม่ใส่ค่า token จริง — โดยเฉพาะตอน code-first gen จากโค้ด ที่ค่าจริงมักหลุดติดมา (สอด `docs/rule.md` §3.2 + spec convention "ค่าสังเคราะห์เท่านั้น")
- **เครื่องมือ (ติดตั้งเองเมื่ออยากใช้ — ไม่ผูกใน workflow):**

  | งาน | เครื่องมือ | คำสั่งตัวอย่าง |
  |---|---|---|
  | lint spec | Spectral | `spectral lint openapi.yaml` |
  | lint/bundle/preview | Redocly CLI | `redocly lint openapi.yaml` |
  | gen client SDK | OpenAPI Generator | `openapi-generator-cli generate -i openapi.yaml -g typescript-fetch -o ./gen/ts` |
  | gen จากโค้ด | FastAPI (auto), tsoa (`@Route`/`@Get`) | ตามเฟรมเวิร์ก |

- **Skill อ้างอิง (optional):** `openapi-spec-generation` — template library เต็ม (full API spec, FastAPI, tsoa, Spectral ruleset, SDK gen)
  ที่มา: `wshobson/agents` → `plugins/documentation-generation/skills/openapi-spec-generation/`
  (`SKILL.md` + `references/details.md` + `references/code-first-and-tooling.md`) — โปรเจกต์ไหนอยากได้ template สำเร็จรูปค่อยติดตั้ง

---

## 6. ที่อยู่ของ artifact

| ระยะ | ที่ | หมายเหตุ |
|---|---|---|
| ระหว่างงาน | `docs/stages/<slug>/openapi.yaml` | optional — เฉพาะ topic ที่แตะ REST API |
| ถาวร (หลัง SHIP) | `docs/techstack/<component>/openapi.yaml` | living API contract — SHIP merge ตาม delta |

> **`<component>` resolution (ห้ามเดา):** topic แตะ **หลาย component** หรือ component ที่ **ยังไม่มีใน `docs/techstack/`** → ถาม user ว่าจะวาง contract ที่ component ไหน / สร้าง techstack entry ก่อนไหม — ไม่เดาเอง
