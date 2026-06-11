# Spec — discovery-playbook-modes

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้

## 1. ชนิดของ task
`logic` (playbook behavior — markdown ที่ AI follow) · ไม่ใช่ REST API → ไม่มี `openapi.yaml`

## 4. Data-flow
- ไม่มี state/data persist — mode เป็น taxonomy เชิงข้อความ; flow = AI อ่าน section → ปรับความเข้ม loop เดิม (ดู `design.md §5.1`)

## 5. User-flow
- ผู้ใช้/AI เข้า Discovery → เลือก/ถูกแนะนำ mode → playbook นิยามว่าแต่ละ mode ทำพฤติกรรมอะไร (`design.md §4.3`)

## 6. Persona
- AI agent ที่ทำตาม playbook (Claude/Codex/Antigravity) + maintainer ที่อ่าน playbook

## 7. Test-flow
> ยืนยันด้วย observable proxy ที่นับได้ (`design.md §8.1`) เทียบ baseline `สมดุล` — ไม่ใช่ AI-judgment ลอย

**behavior ต่อ mode (falsifiable):**
- [ ] `สมดุล` = baseline (เดินกิ่งหลัก decision tree, ถาม N คำถาม) = พฤติกรรม Discovery ปัจจุบัน
- [ ] `ไว` = ถาม ≤ K (K<N) + skip branch decision tree ≥1 + research minimal
- [ ] `ละเอียด` = เดินครบทุกกิ่ง + grill turn ≥1 + role lens BA/PO ปรากฏ
- [ ] `โต้วาที` = Agent-tool call ≥3 (persona) + decision-log มี entry "สังเคราะห์จาก debate" + ไม่ทะลุ cap ≤4/≤2
- [ ] `ไต่สวน` = มี `debate/{blue-memory,red-memory,debate-round-NN}.md` ≥1 รอบ + Red fan-out role audit ครบ 5 มุม + grill user ทุก finding + ถาม user ก่อน audit รอบใหม่ + converge (0 finding/user หยุด) + explicit-only (auto-suggest ไม่แนะ)

**auto-suggest (fixture `design.md §4.4.1`):**
- [ ] เดิน 5 เคส fixture → mode ที่ได้ตรงตาราง
- [ ] เคส precedence ขัดกัน "เล็ก+ชัด แต่แตะ auth" → ผล = `สมดุล` (hard-floor ทับ)
- [ ] ก้ำกึ่ง (ไม่มี signal เด่น) → `สมดุล`
- [ ] multi-match keyword ขัดกัน → fall through auto-suggest (ไม่ first-match เงียบ)

**backward-compat / grill regression:**
- [ ] "ซักถามฉันหน่อย" / "grill me" → เข้า `ละเอียด`
- [ ] section grill เดิม (playbook §3) ถูก fold เข้า ละเอียด — grep ไม่เหลือ behavior grill ซ้ำแยก
- [ ] flow Discovery เดิมไม่ระบุ mode → auto-suggest ทำงาน (ไม่พังของเดิม)

**debate fallback (structural — `design.md §8.2`):**
- [ ] playbook มี fallback instruction + เงื่อนไข trigger ชัด 3 แบบ: spawn ไม่ได้ / เครื่องไม่มี Agent tool / skeptic หาย → degrade `ละเอียด`
- [ ] degrade มี observable signal (แจ้ง user เหตุผล ไม่เงียบ)
- [ ] (optional/defer) full spawn-real proof ถ้า token budget พอ

**security (structural — `design.md §5.2`):**
- [ ] debate context = artifact-level (ไม่ส่ง raw filesystem) + decision-log scrub (ไม่ paste secret) + sensitivity override warning
