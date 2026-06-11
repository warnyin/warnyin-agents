# Feature — Discovery modes

> ความรู้ถาวรระดับ feature · promote จาก topic `discovery-mode-selector` (achieved 2026-06-11)
> mode ปรับ "ความเข้มของ Discovery" — ผู้ใช้คุมเองว่ารอบนี้อยากให้ Discovery ลึก/challenge แค่ไหน

## คืออะไร
capability ที่ให้ `/warnyin:discovery` เลือก **mode 5 ค่า** คุมความเข้มของ Discovery stage — เป็น **แกนใหม่ระดับ stage** orthogonal กับ `tier` (`change-sizing`, ขนาด change) และ `context-profile` (session posture); ทั้ง 5 mode ยังสวม profile `research` เดิม. canonical อยู่ที่ playbook `discovery.md §3.5` เดียว — command/README ชี้มา ไม่ duplicate (pattern เดียวกับ `triage.md`)

- **mode = dial ปรับพารามิเตอร์ของ Discovery loop เดิม** ไม่ใช่เขียน flow ใหม่ 5 ชุด
- multi-agent (โต้วาที/ไต่สวน) = **Agent-tool call ใน playbook** (ไม่ใช่ Workflow script — เลี่ยงข้อห้าม top-level `export`)

## องค์ประกอบ
| # | กลไก | layer | ทำอะไร |
|---|---|---|---|
| 1 | **mode taxonomy (canonical)** | `discovery.md §3.5` | 5 mode `{ไว, สมดุล, ละเอียด, โต้วาที, ไต่สวน}` + behavior contract + 3-axis table (mode≠tier≠profile) — single source |
| 2 | **auto-suggest** | `§3.5.4` | ไม่ระบุ mode → ground เบื้องต้น → ประเมิน signals + **precedence** (hard-floor floor=สมดุล ทับสุด) → เสนอ mode+เหตุผล → user ยืนยัน (pattern establish-tier; ไม่ auto-run) |
| 3 | **observable proxy** | `§3.5.3` | นิยามพฤติกรรมแต่ละ mode แบบนับได้ (ไว=ถาม≤K, ละเอียด=grill turn≥1, โต้วาที=Agent-call≥3) เทียบ baseline `สมดุล` |
| 4 | **โต้วาที (debate)** | `§3.5.5` | fan-out persona ครั้งเดียว (3–4 + skeptic, read-only) → main loop สังเคราะห์ ("Parallelize gathering, serialize judgment") + cap ≤4/≤2 + fallback degrade→ละเอียด |
| 5 | **ไต่สวน (Blue/Red iterative)** | `§3.5.7` | Blue discovery+research→`blue-memory`; Red fan-out role audit ครบ 5 มุม→`debate-round-NN`+`red-memory`; grill user ทุก finding; Blue แก้; ถาม user ก่อนรอบใหม่; วนจน converge — memory ใน `docs/stages/<slug>/debate/` |
| 6 | **command adapter** | `.claude/commands/warnyin/discovery.md` | keyword map (5 mode, ไทย/อังกฤษ) → mode; multi-match/ไม่ระบุ → ชี้ playbook auto-suggest; ไม่ inline behavior |

## ทำงานยังไง (flow)
- **เลือก mode:** `/warnyin:discovery <slug> [keyword]` → command map keyword → mode (explicit) | ไม่ระบุ/ขัดกัน → playbook auto-suggest → user ยืนยัน → เดิน loop เดิมปรับความเข้มตาม behavior contract
- **grill = alias ของ `ละเอียด`:** "ซักถามฉันหน่อย"/"grill me" → เข้า `ละเอียด` (ไม่มี behavior grill เป็นแกนแยก)
- **โต้วาที vs ไต่สวน:** โต้วาที = fan-out ครั้งเดียว→สังเคราะห์→ถามตอนจบ (เบา); ไต่สวน = Blue/Red วนหลายรอบ + memory + grill ทุก finding + user-in-loop ทุกรอบ (หนักสุด, explicit-only)
- **fallback (multi-agent):** spawn ไม่ได้/เครื่องไม่มี Agent tool → degrade `ละเอียด` + แจ้ง user (ไม่เงียบ)

## ขอบเขต / ข้อจำกัด (การตัดสินใจเชิงสถาปัตยกรรม)
- **mode = แกนใต้ Discovery, ไม่ใช่ context-profile ที่ 4** — คง opinionated "3 context พอ"
- **orthogonal กับ tier** — เลือก mode ใดไม่เปลี่ยน tier และไม่ข้าม hard-floor ของ `change-sizing`; เชื่อมแค่ผ่าน auto-suggest signal (tier:large→แนะ ละเอียด)
- **ไต่สวน = explicit-only** — auto-suggest ไม่แนะเอง (หนักสุด user-in-loop)
- **multi-agent ผ่าน Agent tool ใน playbook** ไม่ใช่ Workflow script (tool-agnostic + fallback ทุกจุด)
- **canonical ที่ playbook เดียว** — command/README ชี้มา (no-duplicate)
- ทั้งหมด additive/backward-compat — Discovery flow เดิม + grill keyword ยังทำงาน

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/workflow/stages/discovery.md §3.5` (canonical: taxonomy/3-axis/behavior/auto-suggest/debate/security/ไต่สวน)
- `src/.claude/commands/warnyin/discovery.md` (keyword map adapter) · `src/.warnyin/workflow/README.md` (capability tree)
- reuse: `roles/{ba,po,sa,security,tech-lead,qa,infra}.md` (persona/audit) · `contexts/research.md` (posture)
- เทียบมิติ: feature `change-sizing` (tier — ขนาด), `context-profiles` (posture — session), `build-orchestration` ("Parallelize gathering, serialize judgment")
- rule กลาง: `docs/rule.md §1` (stage-intensity mode orthogonal)
