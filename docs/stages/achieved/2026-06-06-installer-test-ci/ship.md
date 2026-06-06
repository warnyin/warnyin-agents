# Ship report — installer-test-ci

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> วันที่ส่งมอบ: 2026-06-06 · roadmap: P0 ข้อ 1+2

## สิ่งที่ส่งมอบ
topic นี้เพิ่ม **automated test ของ installer** (`bin/cli.mjs`) + **GitHub Actions CI** — ปิดความเสี่ยง regression หลังปล่อย 0.6.0 (breaking) ที่เคยทดสอบด้วยมือล้วน

- ประเภท: **chore / test / infra** — **ไม่ใช่ user-facing feature** → ไม่สร้าง `docs/features/` (ตัดพร้อมเหตุผล)
- component: `installer` (สร้าง `docs/techstack/installer/` เป็นครั้งแรกของ repo)

## เอกสารกลางที่อัปเดต/สร้าง
| ไฟล์ | สถานะ | สาระ |
|---|---|---|
| `docs/troubleshooting.md` | สร้างใหม่ | 5 entries: scaffold leak, dotfolder pack, node --test path, verify-pack ENOENT, build-wave args |
| `docs/rule.md` | สร้างใหม่ | global rules: zero-dep, ESM, CHANGELOG-on-bump, CI security baseline, installer-สร้าง-scaffold-เอง, black-box test |
| `docs/techstack/installer/about.md` | สร้างใหม่ | installer คืออะไร + 4 หน้าที่ + legacy migration |
| `docs/techstack/installer/rule.md` | สร้างใหม่ | rule เฉพาะ installer |
| `docs/techstack/installer/standard.md` | สร้างใหม่ | harness `makeTempProject`/`runCli`, pack-verify, โค้ด pattern |
| `docs/techstack/installer/structure.md` | สร้างใหม่ | โครงไฟล์ + flow main + helper signatures (ตรงโค้ดจริง) |
| `docs/techstack/installer/test.md` | สร้างใหม่ | วิธีเทส (9 เคส + pack-verify + CI matrix) merge จาก `test.md` ของ topic |
| `docs/codemap/index.md` + `architecture.md` | สร้างใหม่ | codemap ครั้งแรกของ repo (tool/library: installer + workflow core + adapters) |
| `.reports/codemap-diff.txt` | สร้างใหม่ | codemap diff (สแกนครั้งแรก) |
| `docs/roadmap.md` | อัปเดต | ติ๊ก P0#1+#2 เสร็จ · แก้ comment files (docs/ ไม่ publish) · บันทึก 2 core bug dogfood |

## note "รอ SHIP" — พิจารณาครบ 6 ข้อ (promote ทั้งหมด ไม่มีตัดทิ้ง)
| note | ปลายทาง |
|---|---|
| zero-dependency policy | `docs/rule.md` §2 |
| black-box test ห้าม refactor target | `docs/rule.md` §5 |
| harness `makeTempProject`/`runCli` เป็น pattern กลาง | `docs/rule.md` §5 + `techstack/installer/standard.md` |
| CI security baseline | `docs/rule.md` §3 |
| CHANGELOG ทุก version bump/breaking | `docs/rule.md` §2 |
| pack-verify เป็น CI gate ก่อน publish | `docs/rule.md` §4 + `techstack/installer/{rule,test}.md` |

## โค้ดที่ส่งมอบ (อยู่บน build branch `build/installer-test-ci` — merge นอก workflow)
- `tests/installer.test.mjs` (9 เคส), `package.json` (scripts.test, engines>=20, files ตัด docs/stages)
- `.github/workflows/ci.yml`, `scripts/verify-pack.mjs`, `CHANGELOG.md`
- `bin/cli.mjs` (`ensureScaffold` แทน `copyTree(docs/stages)` — VERIFY finding)
- core fix บน main: `build-wave.mjs` defensive args parse (`0770104`)

## ค้าง (นอก workflow / topic อื่น)
- **merge `build/installer-test-ci` → main** + ดู CI เขียวจริงบน PR (V4 — outward, จัดการนอก workflow)
- roadmap P0#3 (CHANGELOG/migration 0.6.0 เต็มรูป), P0#4 (README) — topic แยก

## Gate ✅
topic ย้าย achieved แล้ว · เอกสารกลาง promote ครบ · note รอ SHIP ครบ · troubleshooting/rule/techstack/codemap อัปเดต · ship.md เขียนแล้ว — **topic ปิดสมบูรณ์**
