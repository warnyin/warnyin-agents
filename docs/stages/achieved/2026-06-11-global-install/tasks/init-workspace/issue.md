# Dry-run issue — init-workspace

> ผล dry-run (read-only, 2026-06-11) · **verdict: GO** (0 blocker / 2 defer)

## Blocker
- **ไม่มี** — init.md §3 เป็น ordered process list → แทรก "step 0 workspace bootstrap" ที่หัวได้ (unify-in-place) · §6 มีกลไก seed `docs/` + prose idempotent ("ห้าม cp ทับ", ข้าม `[component]`) เป็น precedent ชัด · T1↔T3 = **design-time contract ไม่ใช่ runtime dep** (T3 เขียน prose "อ่าน template local→global"; การมี `~/.warnyin/template/` จริงเป็นงาน T1 copyTree) → build/verify อิสระได้

## Defer (track)
| # | defer | สถานะ/แก้ |
|---|---|---|
| D1 | step-0 seed อาจดูซ้ำกับกลไก seed ใน §6 เดิม | ✅ **fold แล้ว** → task §3.4: phrase step-0 = "seed ไฟล์ที่ยังไม่มี/placeholder ก่อน" ให้ complementary กับ §6 ไม่ใช่กลไกขนาน |
| D2 | `docs/infra.md` env-var note (HOME/USERPROFILE) | นอก scope T3 — park ไว้ SHIP (design §10) |

## สรุป
ไม่มี blocker — มีจุดแทรกสะอาด, idempotent/skip-`[...]` มี precedent ในไฟล์, T1↔T3 เป็น contract ไม่ใช่ runtime. ระวัง = wording cohesion กับ §6 (fold แล้ว)
