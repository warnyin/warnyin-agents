# Design (How) — security-checklist

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> Lens: SA (`.warnyin/workflow/roles/sa.md`) · แตก task ด้วย Tech Lead lens

## 1. ภาพรวมสถาปัตยกรรม
- **component:** workflow core (payload `.md` ใต้ `src/.warnyin/workflow/`) + adapter command (`src/.claude/commands/warnyin/install-skill.md`) — ไม่แตะ installer/runtime
- **แนวทางหลัก:** เสริม security **2 มิติใหม่** ที่ security.md เดิมยังไม่ครอบ (app-security เดิม = DESIGN panel; runtime/supply-chain = ใหม่) เป็น guidance portable — เกาะ 4 จุด: design-panel (`security.md` runtime section + checklist item) + verify-time (`verify.md` reference) + install-point (`install-skill.md` warning) + global (`docs/rule.md` §3 note, รอ SHIP)
- **หลักการกัน drift:** wording ของ runtime principle + supply-chain item เป็น **canonical ใน design §2** — ทุกจุดที่เกาะอ้าง wording เดียวกัน (1 task เขียนทุกจุดในรอบเดียว — เหมือน precedent `defensive-rules`)

## 2. Canonical wording (สัญญาหลัก — ทุกจุดใช้ตรงนี้)

### A. Runtime / operational security (3 portable principle)
> **P1 · secret isolation:** กัน agent อ่าน/เข้าถึง secret ที่ไม่เกี่ยวกับงาน — `.env`, `~/.ssh`, credential/token, keychain; ให้สิทธิ์อ่านเฉพาะ scope ของงาน (least-privilege ระดับ filesystem)

> **P2 · no unnecessary egress:** payload/skill ที่ agent execute ต่อ ไม่ควรส่งข้อมูลออกได้อิสระ — รันใน sandbox/network ที่จำกัด egress เท่าที่งานต้องใช้

> **P3 · identity separation:** แยก identity ของ session agent ออกจาก credential ส่วนตัว/prod — ไม่ใช้ token ส่วนตัว/สิทธิ์ prod ใน session ที่รัน automation/agent (ใช้ scoped credential แยก)

- **Claude adapter note** (ตัวอย่าง — syntax เฉพาะ Claude Code, harness อื่นปรับเทียบ): `settings.json` → `permissions.deny`: `Read(**/.env*)`, `Read(~/.ssh/**)`; รัน sandbox no-egress เมื่อไม่ต้องการเครือข่าย

### B. Supply-chain (1 checklist item)
> **S1 · third-party = prompt-injection surface:** third-party skill / MCP / payload `.md` = โค้ด+instruction ที่ AI **execute ต่อ** → ตรวจเนื้อหาก่อนติดตั้ง (อ่าน source / skills.sh), ติด **global ไม่ vendor เข้า repo**, จำกัดสิทธิ์ที่มันเข้าถึง

- เวอร์ชันสั้น (สำหรับ install-skill warning): "third-party skill = instruction ที่ AI execute ต่อ (prompt-injection surface) — ตรวจเนื้อหาก่อนติดตั้ง"

## 3. Vertical slices
> change เล็ก + 2 thrust แตะ `security.md` ไฟล์เดียวกัน → **1 task เดียว** (แยก task = เขียน security.md ชนกัน + เสี่ยง wording drift; vertical slice = "security 2 มิติใหม่ปรากฏครบทุก enforce point อย่างสม่ำเสมอ") — ตาม precedent `defensive-rules`

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **agent-runtime + supply-chain security ปรากฏครบทุก enforce point** — security.md (runtime section + supply-chain item) + verify.md reference + install-skill warning + global noted | role card · playbook (verify) · adapter command · (global note) · verify (npm test/pack) | `tasks/add-security-checklist/` |

## 4. Interface / contract — จุดเกาะ (mapping)
| จุดเกาะ | ไฟล์ | ใส่อะไร |
|---|---|---|
| design-panel reviewer | `roles/security.md` | +section "## Runtime / operational security" (P1+P2+P3 + Claude note) ต่อจาก Checklist ก่อน Output |
| design-panel checklist | `roles/security.md` Checklist | +1 item S1 (supply-chain/MCP = prompt-injection surface) + เสริม Lens bullet "supply chain" เดิมให้ครอบ skill/MCP |
| verify-time | `stages/verify.md` §2 (input) | +reference สั้น: ตอนรันเทส local env ที่มี secret จริง → ทบทวน runtime security (`roles/security.md`) |
| install-point | `.claude/commands/warnyin/install-skill.md` step 4 | เสริม warning เดิมด้วย prompt-injection wording (S1 เวอร์ชันสั้น) |
| global (รอ SHIP) | note `tasks/add-security-checklist/rule.md` §2 → `docs/rule.md` §3 | 1 bullet "agent-runtime security baseline" คู่ CI baseline เดิม |

## 5. Flow
- ไม่มี runtime — doc reference: (1) DESIGN panel security reviewer อ่าน `security.md` → ไล่ทั้ง app-security + runtime + supply-chain; (2) VERIFY tester เห็น reference → ทบทวน runtime ตอนรัน local env; (3) ตอนติดตั้ง skill → warning prompt-injection ชัด; (4) global baseline ใน rule.md §3 (รอ SHIP)

## 6. ผลกระทบต่อระบบเดิม
- backward compat: เพิ่ม section/บรรทัด ไม่ลบ/แก้ logic เดิม; `install-skill.md` แก้ wording warning เดิม (พฤติกรรม command ไม่เปลี่ยน — ยังเป็น AskUserQuestion + npx skills add); ผู้ใช้รุ่นเก่ารับตอน `--update`
- **regression check:** ไม่มี test assert เนื้อหา `.md` (installer test = black-box cli behavior) → `npm test` 18/18 ควรเขียวไม่กระทบ; `install-skill.md` เป็น command markdown (ไม่ใช่โค้ดที่ test spawn) — verify_pack allowlist ครอบ `src/.claude/commands` อยู่แล้ว; ยืนยันใน BUILD
- ไม่ duplicate: runtime section = มิติใหม่ (research RQ1 — security.md เดิม = app security); S1 เสริม Lens "supply chain" เดิม (= "dependency ใหม่") ให้ครอบ skill/MCP/payload (research RQ2)

## 7. Dependency ระหว่าง slice/task
```
add-security-checklist   (task เดียว — ไม่มี dependency)
```

## 8. Test strategy ระดับ design
- **structural:** P1+P2+P3 + Claude note ปรากฏใน `security.md` section ใหม่; S1 ใน security.md checklist + install-skill.md step 4; reference ใน verify.md §2 (grep keyword "runtime"/"secret"/"egress"/"prompt-injection")
- **consistency:** wording จุดต่างๆ มาจาก canonical §2 เดียวกัน (3-way: security.md ↔ install-skill warning ↔ global note)
- **regression:** `npm test` 18/18 + `verify:pack` เขียว (ไม่กระทบ test เดิม + payload `install-skill.md` ติด tarball ถูกต้อง)
- **VERIFY (ภายหลัง):** อ่าน behavioral — principle ชัด actionable + portable (ไม่ผูก Claude เกินไป), runtime ไม่ขัด app-security เดิม, global bullet พร้อม promote

## 9. หมายเหตุการตัดสินใจ (ไม่ block)
- **1 task (ไม่ใช่ 2 ตาม thrust A/B)** — เพราะทั้ง A และ B แตะ `security.md` ไฟล์เดียวกัน; แยก task = เขียนชน + เสี่ยง wording drift; 1 agent เขียนรอบเดียวสม่ำเสมอกว่า (precedent `defensive-rules` §9)
- **placement verify.md = §2 input (ไม่ใช่ §3 principle)** — runtime security เป็น "สิ่งที่ต้องตระหนักตอนเตรียม env" มากกว่า "หลักการทำงานของ stage"; วางใน §2 (ก่อนเทส — อ่านให้เข้าใจ) เกาะธรรมชาติกว่า
- root dogfood copy: ข้าม (รอ release — เหมือน #5/#6)
- global rule placement = `docs/rule.md` §3 (CI security baseline) — agent-runtime เป็น security baseline เหมือนกัน วางคู่กัน เหมาะกว่าตั้ง section ใหม่ (ยืนยันตอน SHIP)
