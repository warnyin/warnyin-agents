# Spec — build-log-narrative

> spec เฉพาะของ task นี้ — ใส่เฉพาะหัวข้อที่เกี่ยวข้อง

## 1. ชนิดของ task
`infra/tooling` (workflow script `build-wave.mjs`) + `docs/playbook` (build.md + command, tool-agnostic) + `data` (รูปแบบ build-log.md)

## 4. Data-flow
- sub-agent (build-wave) implement → คืน `events[]` ใน `RESULT_SCHEMA` (optional, จุดเปลี่ยน start/decision/error/done)
- Workflow `parallel()` → `return { slug, results: clean, ... }` (events ติดมากับแต่ละ result object)
- main loop (นอก worktree) ดึง `result.results[].events` (+ `status`/`summary`) → **append `## Wave N`** ลง `docs/stages/<slug>/build-log.md` หลังแต่ละ wave; หลัง full gate → `## Full gate`
- ไฟล์ไม่มี → main loop สร้างจาก canonical (`design.md §3.2`) — เขียนเอง กันไฟล์ชนใน worktree (troubleshooting #14)

## 5. User-flow
- ผู้ใช้รัน `/warnyin:build <slug>` → จบแต่ละ wave เห็น build-log.md เติม section เล่าเหตุการณ์ → เมื่อ build ล่ม/ผลแปลก เปิด build-log.md อ่าน timeline ว่าระหว่างทาง agent คิด/ติด/ตัดสินใจอะไร (ไม่ต้องเดาจาก diff + report สุดท้าย)

## 6. Persona
- AI main loop (orchestrator) + user ที่ debug BUILD; harness อื่น (Codex/Antigravity) ที่ fan-out เอง → เขียน build-log.md เองตาม playbook generic

## 7. Test-flow
> component = workflow script + playbook → structural + executable proof (build-wave.mjs import ตรงไม่ได้: top-level `await parallel()` + global runtime — design §8)
- [ ] **A. structural** — `RESULT_SCHEMA.events` array (`maxItems:10`, kind enum 4 + note required, ไม่อยู่ root required); `node --check` build-wave.mjs ผ่าน; command/playbook มีขั้นเขียน build-log.md + Gate item; template `[topic]/build-log.md` โครงตรง canonical §3.2 คำต่อคำ
- [ ] **B. executable trace** — feed synthetic `results[]` (2 task: A มี events ครบ 4 kind, B ไม่มี events) → เดินกติกา compose ด้วยมือ → assert **5 proxy** (Wave ครบ / kind ∈ 4 ค่า + ไอคอนตรง / B graceful จาก summary+status / ไม่มี markdown table สถานะ / events ≤ 10)
- [ ] **C. self-dogfood (secondary)** — รัน BUILD topic นี้เอง → main loop เขียน build-log.md ของ topic ตาม canonical (logic auto active หลัง `--update`/release ถัดไป)
- [ ] **D. regression** — `npm test` pass==tests==58 (ไม่มี skip, check-test-count); `lint-md` เขียว
- [ ] qualitative "เล่าเป็นเรื่อง" = manual review note ใน verify.md (subjective, ไม่ใช่ gate)
