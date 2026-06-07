# Test Plan — model-tier-guidance

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> payload `.md` (context profile) → verify เชิงโครงสร้าง + tool-agnostic + install proof + consistency

## 1. จุดประสงค์ที่ต้อง verify
model-tier guidance ครบ 3 context (generic vocab) + README legend สอดคล้อง + **tool-agnostic** (ไม่ผูกชื่อรุ่น) + ไม่ทำลายโครง card/installer

## 2. วิธีเทส
grep/structural บน payload + `setup:sandbox` install proof + regression (lint:md/test/pack)

## 3. Test cases
| # | เคส | คาดหวัง |
|---|---|---|
| V1 | 3 context มี Model tier (generic) | research=deepest · build=balanced · review=balanced+ |
| V2 | tool-agnostic | grep `opus\|sonnet\|haiku\|claude-\|gpt-\|gemini` ใน contexts = 0 |
| V3 | README legend | section `## Model tier` + ตาราง 3 tier + tool-agnostic note |
| V4 | โครง card 4-section | Model tier = บรรทัดใน Tool preference (ไม่เพิ่ม section) — ทุก context 4 `##` |
| V5 | consistency | tier ใน context ตรงกับ legend table |
| V6 | install proof | `setup:sandbox` → target `.warnyin/workflow/contexts/{research,build,review}.md` มี Model tier; root dogfood ไม่ dirty |
| V7 | regression | `lint:md` 0 dead · `npm test` 26/26 · `verify:pack` 75 |

## 4. Env
- local macOS + node; ไม่มี service; `setup:sandbox` → temp (ไม่แตะ root)

## 5. หมายเหตุ (merge ตอน SHIP)
- เพิ่ม verify pattern: payload guidance ที่อ้าง harness model/tool → **tool-agnostic grep** (ไม่ผูกชื่อรุ่น) เป็น acceptance; แม้ประโยคปฏิเสธก็เลี่ยง enumerate ชื่อรุ่น (กัน literal-grep false-positive)
