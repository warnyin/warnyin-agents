# Research — global-install

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> ที่เก็บ "ข้อมูลที่ค้นมา + หลักฐาน" สนับสนุนการตัดสินใจใน `discovery.md`

| | |
|---|---|
| **Slug** | `global-install` |
| **วันที่** | 2026-06-11 |

---

## 1. คำถามวิจัย (research questions)
- [x] RQ1: installer ปัจจุบัน resolve target + วาง payload ยังไง (เพื่อรู้จุดที่ต้องแตกเป็น global branch)
- [x] RQ2: Claude Code อ่าน command/skill ที่ user-level (`~/.claude/`) ไหม → global adapter เป็นไปได้จริงไหม
- [x] RQ3: workspace (`docs/`) ถูกสร้างที่ไหนในปัจจุบัน → ใน global mode ใครรับช่วง
- [x] RQ4: philosophy ปัจจุบันขัดกับ global ตรงไหน

## 2. วิธี & แหล่งข้อมูล
- [x] อ่านโค้ดในโปรเจกต์ (`src/bin/cli.mjs`, `docs/techstack/installer/structure.md`)
- [x] อ่าน rule/philosophy (`docs/rule.md §6`, `docs/project.md`)
- [x] prior art: pattern user-level config ของ Claude Code (`~/.claude/`)

## 3. Findings (ผลการค้นต่อคำถาม)

### RQ1: installer resolve target + วาง payload
- **พบว่า:** `target = process.cwd()` (cli.mjs:16) เสมอ — ไม่มี option global. วาง payload ด้วย `copyTree(CORE, {overwrite:UPDATE})` (CORE = `.warnyin/{workflow,template}`, `.claude/{commands/warnyin,agents,skills}`) → ทุกอย่างลง `target/`
- **หลักฐาน:** cli.mjs:16, 66-72, 178
- **นัย:** global mode = เปลี่ยน `target` ของ adapter+playbook เป็น path ใต้ `os.homedir()` (แต่ workspace ยัง cwd) — เป็น branch ที่จุดเดียว (target resolution) + แยก CORE เป็น 2 กลุ่ม (adapter→`~/.claude`, playbook→`~/.warnyin`)

### RQ2: Claude Code user-level command/skill
- **พบว่า:** Claude Code อ่าน command จาก `~/.claude/commands/` + skill จาก `~/.claude/skills/` ที่ user-level → ใช้ได้ **ทุกโปรเจกต์** อัตโนมัติ (นอกเหนือจาก project-level `<proj>/.claude/`)
- **หลักฐาน:** pattern ของ Claude Code (user vs project scope) — **ต้อง verify ตอน VERIFY ด้วย install จริง** (สมมติฐานใน discovery §5)
- **นัย:** ชั้น adapter เป็น global ได้จริง (D1 Hybrid feasible); แต่ playbook (`~/.warnyin/`) Claude Code ไม่รู้จัก → ต้องให้ adapter ชี้ path เอง (D2 local-first→global)

### RQ3: workspace bootstrap ปัจจุบัน
- **พบว่า:** `ensureScaffold()` สร้าง `docs/stages/{context.md, achieved/.gitkeep}` (เปล่า) + `seedDocs()` copy `.warnyin/template/docs/**` → `docs/**` — รันตอน `npx @warnyin/agents` (cli.mjs:179-180); **สร้างเอง ไม่ copy tree จาก package** (กัน leak — verify installer-test-ci)
- **หลักฐาน:** cli.mjs:111-153
- **นัย:** global mode (ไม่ลง payload ต่อ project) → ไม่มีใครรัน scaffold/seed; **D5: ย้ายความรับผิดชอบไป `/warnyin:init`** (อ่าน template จาก local→global) + stage-command safety net

### RQ4: philosophy ที่ต้องระวัง
- **พบว่า:** `docs/rule.md §6` — source/dogfood แยกชั้น + playbook **vendored per-project committed to git** (ทีม share เวอร์ชันเป๊ะผ่าน git); `docs/project.md` — zero-dep + cross-platform
- **หลักฐาน:** rule.md §6, project.md §ข้อจำกัด
- **นัย:** global **ต้องเป็น opt-in ไม่ใช่ default** — per-project (vendored, committed) คงเป็นค่าเริ่มต้น; global เป็นทางเลือกสำหรับคนทำหลาย repo. local-first (D2) รักษา reproducibility ของทีมที่ vendor ไว้

## 4. Code inspection (สิ่งที่ตอบได้จากโค้ดเอง โดยไม่ต้องถาม user)
| ไฟล์ / ส่วนของโค้ด | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `cli.mjs:16` | `target = process.cwd()` | จุด branch เดียวสำหรับ global target |
| `cli.mjs:66-72` | `CORE` = adapter + playbook รวมกัน | global ต้องแยก CORE → adapter(`~/.claude`) + playbook(`~/.warnyin`) |
| `cli.mjs:111-153` | `ensureScaffold`+`seedDocs` สร้าง workspace ต่อ project | global ไม่รัน → ย้ายไป `/warnyin:init` (D5) |
| `cli.mjs:156-174` | `installRootDoc` CLAUDE.md/AGENTS.md (append marker, idempotent) | global mode: pointer ต่อ project เขียนตอน init (ส่งต่อ DESIGN) |
| `cli.mjs:21-33` | flag parsing (`--update`/`--dry-run`/`--help`) เป็น `Set` | เพิ่ม `--global`/`--project` ตรงนี้ได้ตรงๆ |
| `cli.mjs:35-41` | guard `pkgRoot===target` | global target ใต้ `~/` ไม่ชน pkgRoot — guard ยังปลอดภัย |

## 5. ทางเลือก & เปรียบเทียบ (สรุปจาก decision log)
| ประเด็น | เลือก | เหตุผลสั้น |
|---|---|---|
| ระดับ global (D1) | Hybrid | install ครั้งเดียวใช้ทุก repo + คง local override (reproducibility) |
| resolve playbook (D2) | local-first → global | override อัตโนมัติ + tool-agnostic (wording ไม่ใช่ code) |
| UX (D3) | flag + TTY-prompt, non-TTY=project | ถามตอนติดตั้ง + CI-safe |
| workspace (D5) | `/warnyin:init` + safety net | ไม่เพิ่ม CLI surface |
| version-skew (D6) | local override พอ | กระทัดรัด; pin = vendor local |

## 6. ความเสี่ยง / unknown ที่ยังเหลือ (→ DESIGN/VERIFY)
- **[VERIFY]** Claude Code อ่าน `~/.claude/{commands,skills}/` จริง + `/warnyin:*` global ใช้ได้ทุก project (RQ2 ยังเป็นสมมติฐาน — พิสูจน์ด้วย install จริง)
- **[DESIGN]** global path tool-agnostic: `~/.warnyin/` ให้ Codex/Antigravity เข้าใจ (adapter wording ต้องสื่อข้าม harness)
- **[DESIGN]** `installRootDoc` (CLAUDE.md pointer) ใน global mode เขียน per-project ตอน init ยังไง
- **[VERIFY]** cross-platform `os.homedir()` บน Windows (`%USERPROFILE%`) + path.join

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำจาก research:** global เป็นไปได้จริงเชิงสถาปัตยกรรม (adapter global ผ่าน `~/.claude/`, playbook global ผ่าน adapter-wording local-first→global) — **opt-in, per-project ยังเป็น default** เพื่อคง reproducibility/philosophy
- **decision ที่ป้อนกลับ discovery.md:** D1-D6 ครบ (Hybrid · local-first · flag+TTY-prompt · init owns workspace · local-override version-skew) — ไม่มี open question ที่ block → **พร้อมเข้า DESIGN**
