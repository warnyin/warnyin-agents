# Research — Understand-Anything Interop

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md` · Mode: `ละเอียด` (deep research)

| | |
|---|---|
| **Slug** | `understand-anything-interop` |
| **วันที่** | `2026-06-15` |

---

## 1. คำถามวิจัย (research questions)
- [x] RQ1: UA คืออะไร, output คืออะไร, เก็บที่ไหน
- [x] RQ2: license + วิธีติดตั้ง + harness ที่รองรับ (interoperate ได้ไหม โดยไม่ขัด zero-dep)
- [x] RQ3: warnyin มี touchpoint "เข้าใจ codebase" ตรงไหนบ้าง ที่ UA เสริมได้
- [x] RQ4: detect/consult ยังไงให้ tool-agnostic + ไม่ผูก schema

## 2. วิธี & แหล่งข้อมูล
- [x] อ่าน README ของ UA (WebFetch) — what/features/architecture/commands
- [x] อ่าน install + license + supported tools + artifact path (WebFetch รอบสอง)
- [x] อ่านโค้ด/playbook warnyin: `init.md`, `explore.md`, `codemap.md`, `discovery.md`, `docs/project.md`, `docs/rule.md`
- [x] เทียบ pattern กับ topic `ponytail-minimalism` (achieved) — reference-not-vendor / canonical-copy

## 3. Findings

### RQ1: UA คืออะไร / output
- **พบว่า:** UA = เครื่องมือ "เข้าใจ codebase" — Tree-sitter (structural facts แบบ deterministic) + multi-agent LLM pipeline 6 agent (scanner/file-analyzer/architecture/tour-builder/graph-reviewer/domain) → **knowledge graph + dashboard เว็บ interactive** (force-directed) + guided tours + diff-impact + domain view
- **output เก็บที่:** `.understand-anything/knowledge-graph.json` — commit แชร์ทีมได้ (ข้าม `intermediate/` + `diff-overlay.json`); graph >10MB ใช้ `git lfs track ".understand-anything/*.json"`
- **นัย:** output เป็น **artifact บนดิสก์ path คงที่** → เป็น "contract" ที่ warnyin detect ด้วย file-exists ได้ (tool-agnostic) โดยไม่ต้องรู้จัก runtime ของ UA

### RQ2: license / install / harness
- **พบว่า:** **License = MIT** (© Yuxiang Lin & Infinite Universe, Inc.) — permissive, reference/vendor ได้ตามกฎหมาย
- install: Claude Code plugin (`/plugin marketplace add Egonex-AI/Understand-Anything` + `/plugin install`), one-line script (mac/linux/win), Copilot CLI — **เป็น plugin แยก ไม่ต้อง bundle เข้า warnyin**
- รองรับ harness: Claude Code, Cursor, VS Code+Copilot, Copilot CLI, Codex, OpenCode, OpenClaw, Antigravity, Gemini CLI, Pi, Vibe, Hermes, Cline, KIMI, Trae, Nanobot (**16 — ครอบ harness ที่ warnyin รองรับ**)
- prereq: Git, **Git-LFS** (เฉพาะ graph >10MB), Node/pnpm (dev เท่านั้น)
- **สรุป/นัย:** interoperate สะอาด — warnyin คง zero-dep (ไม่ bundle), tool-agnostic เข้ากันได้ (harness ชุดเดียวกัน), MIT ปลอดภัย → ตรง Decision D2/D3/D4

### RQ3: touchpoint ใน warnyin
- **พบว่า (code inspection):**
  - `init.md §3 step 1-2` — สแกนโครงสร้าง + วิเคราะห์ component (read-only) → **จุดที่ UA graph เป็น input ตรงสุด** (UA ทำงานเดียวกันแต่ deterministic + มี domain/layer)
  - `codemap.md` — สร้าง codemap token-lean → consult graph เป็น source เสริมได้
  - `explore.md §3` — read-only Q&A, "คำถามกว้าง→fan-out" → UA `/understand-chat` เป็น companion
  - `discovery.md §2` — ground บน codebase → repo ใหญ่/ไม่คุ้น แนะรัน UA
  - `roles/README.md` — มี pattern อ้าง external skill แบบ reference-not-vendor อยู่แล้ว (`ui-ux-pro-max`, `@playwright/cli`)
- **หลักฐาน:** อ่านไฟล์ playbook ตรง (ดู §4 code inspection)
- **นัย:** touchpoint ครบ comprehension surfaces; ทั้งหมด pointer มา interop.md เดียว (single-source)

### RQ4: detect/consult tool-agnostic + ไม่ผูก schema
- **พบว่า:** warnyin เป็น playbook **ไม่มี runtime** → "ใช้ผล UA" = ให้ AI agent **อ่านไฟล์ graph เป็น context** (LLM อ่าน ไม่ใช่โค้ด parse); detect = file-exists ของ path คงที่
- **สรุป/นัย:** ไม่มี code coupling กับ schema UA → ทน schema drift; ตรง Decision D2 (consult-if-present) + D3 (file-exists trigger)

## 4. Code inspection
| ไฟล์ | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `src/.warnyin/workflow/init.md` §3.1-2 | สแกนโครงสร้าง+component read-only เพื่อเติม structure/codemap | UA graph = input ตรงสุด (touchpoint แรง) |
| `src/.warnyin/workflow/explore.md` §3.3 | "คำถามกว้าง→fan-out read-only" | UA `/understand-chat` เป็น companion ตอบคำถาม |
| `src/.warnyin/workflow/codemap.md` | สร้าง codemap token-lean | consult graph เป็น source เสริม |
| `src/.warnyin/workflow/stages/discovery.md` §2 | ground บน codebase ก่อนตี scope | repo ใหญ่/ไม่คุ้น → แนะรัน UA |
| `roles/README.md` | อ้าง external skill reference-not-vendor | มี pattern รองรับอยู่แล้ว — pointer ไป interop.md |
| `docs/rule.md` §1-2 | zero-dep + tool-agnostic + canonical-copy + opinionated | บังคับ: reference-not-vendor, generic, single-source, มี bar |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก | ข้อดี | ข้อเสีย | เหมาะ? |
|---|---|---|---|
| interoperate (reference, consult-if-present) — เลือก | zero-dep, tool-agnostic, MIT, ได้ของจริง | ต้องมี UA จึงได้ค่าเต็ม (แต่ conditional) | ✅ |
| bundle/vendor UA | ได้ครบทันที | ขัด zero-dep, Tree-sitter dep, frontend runtime, ต้อง maintain | ❌ |
| hard-parse JSON ในโค้ด | "ใช้ผล" ตรง | ขัด zero-dep + พังเมื่อ schema เปลี่ยน | ❌ |
| auto-run UA ใน playbook | สะดวก | ข้าม harness ไม่ได้ (command ต่างกัน) + ฝืน user | ❌ |

## 6. ความเสี่ยง / unknown ที่เหลือ
- UA อาจเปลี่ยน path/schema ในอนาคต → แก้ที่ interop.md ที่เดียว (single-source ช่วย)
- ไม่ได้ลองรัน UA จริงในรอบ Discovery (ต้องติดตั้ง UA + git-lfs) → success ใช้ scenario จำลอง fake graph (Decision D6); ลองจริงเป็น optional ตอน VERIFY

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำจาก research:** สร้าง `interop.md` (companion-tool convention + inclusion bar 4 ข้อ + UA entry) เป็น single-source; touchpoint 5 จุด pointer แบบ conditional; detect file-exists `.understand-anything/knowledge-graph.json` → consult/suggest; reference-not-vendor + tool-agnostic + zero-dep
- **ป้อนกลับ discovery.md:** Decision D1–D6 (ปิดครบ)
