# Research — model-tier-guidance

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> ต่อยอดจาก feasibility eval (ECC #1 token optimization) — ดู `docs/stages/achieved/2026-06-07-selective-install/` แนวทางประเมิน

| | |
|---|---|
| **Slug** | `model-tier-guidance` |
| **วันที่** | 2026-06-07 |

---

## 1. คำถามวิจัย
- [x] RQ1: model tier วางที่ไหนไม่ duplicate?
- [x] RQ2: contexts มี section รองรับอยู่แล้วไหม?
- [x] RQ3: vocab tier ควรเป็นอะไร (tool-agnostic)?
- [x] RQ4: build orchestrator vs worker ต่าง tier จริงไหม?

## 2. วิธี & แหล่ง
- [x] อ่าน `contexts/{research,build,review}.md`, stage callout, `build-wave.mjs`, rule §1 (tool-agnostic/opinionated)

## 3. Findings

### RQ1/RQ2: contexts/ "Tool preference" = ที่ลงตัว
- ทุก context (research/build/review) มี section **"Tool preference"** (ควรใช้/เลี่ยง) อยู่แล้ว → model-tier = posture attribute ลงตรงนี้ได้ (unify-in-place)
- stage callout ชี้ context อยู่แล้ว (Discovery/DESIGN→research · BUILD→build · VERIFY/SHIP→review) → **ไม่ต้องแตะ 5 stage** (กัน duplicate: research ใช้ 2 stage)
- **หลักฐาน:** `grep 'Context profile'` ทุก stage · `sed Tool preference` ทุก context

### RQ3: vocab = generic tier (tool-agnostic)
- ห้ามผูกชื่อรุ่น (Claude/Opus/Sonnet/Haiku) — payload tool-agnostic ใช้ได้ทุก harness
- ใช้ **`deepest reasoning` / `balanced` / `cheap (worker)`** + วงเล็บตัวอย่าง mapping ปล่อยให้ harness ตี (เหมือน `~/.claude/rules/performance.md` แต่ generic)

### RQ4: orchestrator vs worker ต่างจริง (build)
- `build-wave.mjs` fan-out **worker subagent ต่อ task** (ทำ implement เชิงกลไกตาม spec) — main loop = orchestrator (ตัดสินใจ integrate)
- worker ที่ทำ task ชัดเจน/กลไก → **ลด tier ได้ (cost-saving จริง)**; orchestrator = balanced (ตัดสินใจ)
- **นัย:** build context = balanced + note worker ลดได้ (Q2)

## 4. ทางเลือก & เปรียบเทียบ (placement)
| | unify-in-place? | duplicate? | เลือก |
|---|---|---|---|
| contexts/ Tool preference | ✅ | ไม่ (stage ชี้ context) | ✅ Q1 |
| per-stage callout | — | duplicate (research×2 stage) | — |
| ไฟล์ tiers แยก | — | กลไกขนาน (มี Tool preference แล้ว) | — |

## 5. ความเสี่ยง
- **model name drift** → ใช้ generic tier ไม่ผูกรุ่น
- **กลายเป็น prescriptive** → เป็น "guidance" (ควร/ลดได้) ไม่ enforce

## 6. ข้อสรุป → ส่งต่อ
- เพิ่ม 1 บรรทัด model-tier ใน "Tool preference" ของ 3 context: research=deepest · build=balanced (+worker note=cheap) · review=balanced+ ; generic vocab; อัปเดต `contexts/README.md` ถ้าอธิบายโครง section
- ป้อนกลับ: Q1 contexts/ · Q2 per-context + worker note
