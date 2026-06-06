# Standard — ci-pipeline

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Standard กลางที่ยึด
> repo ยังไม่มี `docs/techstack/` — ยึดปรัชญา `CLAUDE.md` + GitHub Actions best practice + ผล review panel (Security/Infra)
- **zero-dependency** — CI ไม่ install อะไร (ไม่มี lockfile); pack-verify เป็น node built-in
- **least-privilege CI** — `permissions` ขั้นต่ำ, ไม่มี secret

## 2. Pattern การเขียนโค้ดของ task นี้
- **GitHub Actions security baseline:** top-level `permissions: contents: read`; trigger `pull_request` (ห้าม `pull_request_target`); pin action ด้วย SHA; ไม่มี `secrets.*`
- **matrix:** `strategy.matrix.node: [20, 22, 24]`; `fail-fast: false` (ให้เห็นผลทุก node แม้ตัวหนึ่งแดง)
- **ไม่ตั้ง `cache: npm`** — ต้องการ lockfile ที่ไม่มี + ไม่มี dependency ให้ cache
- **pack-verify = node script** (cross-runner) ไม่ใช่ shell `grep` — parse JSON ด้วย `node`
- **CHANGELOG:** Keep a Changelog (`keepachangelog.com`) — กลุ่ม Added/Changed/Removed/Fixed, version + วันที่

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- pattern parse `npm pack --dry-run --json` — มีตัวอย่างใน `design.md` §5 และ spec นี้ (เคยใช้ verify มือใน session ย้ายโครง 0.6.0)
- `node --test tests/` — script `test` ที่ task `installer-test-suite` สร้างใน `package.json`

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- ถ้า pack-verify script สั้นพอ จะ inline เป็น `run: node -e "..."` ใน workflow ก็ได้ — แต่แยกไฟล์ `scripts/verify-pack.mjs` อ่าน/test ง่ายกว่า (แนะนำแยก)
- pattern ใหม่ที่ควรเป็นมาตรฐานกลาง → note ใน `rule.md` (รอ SHIP)
