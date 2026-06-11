# Test Plan — global-install

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> guideline: `docs/techstack/installer/test.md` (black-box spawn + executable install proof)

| | |
|---|---|
| **Slug** | `global-install` |
| **Component** | `installer` (cli runtime + payload `.md`) |
| **จุดประสงค์ที่ต้อง verify** | `--global` ติดตั้ง adapter+playbook ลง `~/` ใช้ทุกโปรเจกต์ · per-project = default · ไม่ทำลายไฟล์ user · CI-safe (non-TTY) · resolve local-first→global |

## 1. ขอบเขตการเทส
- global install executable (ไฟล์ลง homedir ถูก + note+marker + skip scaffold) · ไม่ทำลายไฟล์ user · idempotent · backward compat (project default) · non-TTY ไม่ค้าง · homedir guard · resolution wording (local-first)

## 2. ชนิดการเทส
- [x] Functional / executable (black-box spawn `cli.mjs` ใน temp HOME)
- [x] Regression (project mode เดิม + test suite 66/66)
- [x] Structural (resolution wording 3 ไฟล์)
- [ ] ~~E2E/UXUI~~ — N/A (ไม่ใช่ FE)

## 3. Local env
| Service | คำสั่ง | หมายเหตุ |
|---|---|---|
| (ไม่มี service) | `node --test` · `node src/bin/cli.mjs --global` (override HOME+USERPROFILE→temp) | installer CLI — เทส black-box spawn ใน temp |

## 4. Test cases (empirical observable)
| # | สถานการณ์ | วิธี | ผลที่คาดหวัง |
|---|---|---|---|
| D1 | global install → homedir | `HOME=tmp --global` | `~/.warnyin/workflow/` + `~/.claude/commands/warnyin/` + `~/.claude/CLAUDE.md` marker+note + skip scaffold |
| D2 | non-TTY CI-safe | spawn pipe no-flag `{timeout}` | exit 0 ไม่ค้าง → project (cwd) |
| D3 | ไม่ทำลายไฟล์ user | temp HOME มี `.claude/agents/my.md`+`CLAUDE.md` → `--global` | ไฟล์ user คงอยู่, CLAUDE.md append ไม่ทับ |
| D4 | idempotent | `--global` 2 ครั้ง | marker เดียว (note ไม่ซ้ำ) |
| D5 | local override wording | grep resolution 3 ไฟล์ | local-first→global ครบ; CLAUDE.global.md note-only+marker |
| D6 | backward compat | project mode (no flag, non-TTY) | `.warnyin/`+`docs/stages/` ลง cwd (เดิม) |
| D7 | homedir guard | `HOME=/ --global` | exit ≠ 0 (ไม่เขียน root) |
| D8 | RQ2 Claude Code โหลด `~/.claude` | ไฟล์ลง `~/.claude/commands/` + documented user-level loading | command global ใช้ได้ทุกโปรเจกต์ |

## 5-6. E2E / UXUI
- N/A (ไม่ใช่ frontend; capability = CLI install + payload `.md`)

## 7. วิธีรันเทส (reproducible)
```bash
node --test                                    # 66/66 (regression + 8 global cases)
T=$(mktemp -d); HOME=$T USERPROFILE=$T node src/bin/cli.mjs --global   # → ตรวจ $T/.warnyin, $T/.claude
HOME=/ USERPROFILE=/ node src/bin/cli.mjs --global                     # → exit ≠ 0 (guard)
```
