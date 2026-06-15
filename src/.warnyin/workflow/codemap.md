# CODEMAP — สแกนโครงสร้างโปรเจกต์ + สร้าง architecture codemap แบบ token-lean

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: `docs/codemap/` ที่ **ประหยัด token** สำหรับให้ AI โหลดเข้า context — โครงสร้างระดับสูง ไม่ใช่ implementation detail

---

## 1. ใช้เมื่อไหร่

- หลังเพิ่ม feature ใหญ่ / refactor ครั้งสำคัญ
- `/warnyin:init` ใช้ playbook นี้ตอนสร้าง codemap ครั้งแรก
- **SHIP** ใช้ตอนขั้น "อัปเดต code map ทั้งหมด"

---

## 2. ขั้นตอน

### Step 1: สแกนโครงสร้างโปรเจกต์
- ระบุชนิดโปรเจกต์: monorepo / single app / library / microservice
- หา source directory ทั้งหมด (`src/`, `lib/`, `app/`, `packages/`, ...)
- map entry points (`main.ts`, `index.ts`, `app.py`, `main.go`, ...)
- สแกนขนานได้: fan-out sub-agent (read-only) ต่อ component/พื้นที่ — เครื่องที่ไม่มี sub-agent → ไล่ทีละส่วน
- **default-exclude archive:** ข้าม `docs/stages/achieved/` (snapshot ของ topic ที่ ship แล้ว = archive ไม่ใช่ current state; codemap สะท้อนโครงปัจจุบัน) — ความรู้ที่ promote อยู่ใน `docs/features/`/`docs/rule.md` แล้ว (ดู [`interop`](interop.md) ข้อ 2 "archive ≠ current state")
- ถ้ามี `.understand-anything/knowledge-graph.json` → อ่าน**ข้อเท็จจริงเชิงโครงสร้าง** (file/function/layer/dependency) เป็นเบาะแสเสริมระดับสูง (ยืนยันกับโค้ดจริงเสมอ); ไม่มี + repo ใหญ่/ไม่คุ้น → แนะนำรัน companion tool — ดู [`interop`](interop.md)

### Step 2: สร้าง/อัปเดต codemap ใน `docs/codemap/`

| ไฟล์ | เนื้อหา |
|---|---|
| `index.md` | สารบัญทั้งชุด + ภาพรวม component + จุดเข้า |
| `architecture.md` | system diagram ระดับสูง, service boundary, data flow |
| `backend.md` | API routes, middleware chain, service → repository mapping |
| `frontend.md` | page tree, component hierarchy, state management flow |
| `data.md` | ตาราง DB, relationship, migration history |
| `dependencies.md` | external service, third-party integration, shared library |

**สร้างเฉพาะไฟล์ที่ relevant** — โปรเจกต์ไม่มี frontend → ไม่ต้องมี `frontend.md`

#### รูปแบบ codemap (token-lean)

```markdown
# Backend Architecture

## Routes
POST /api/users → UserController.create → UserService.create → UserRepo.insert
GET  /api/users/:id → UserController.get → UserService.findById → UserRepo.findById

## Key Files
src/services/user.ts (business logic, 120 lines)
src/repos/user.ts (database access, 80 lines)

## Dependencies
- PostgreSQL (primary data store)
- Redis (session cache, rate limiting)
- Stripe (payment processing)
```

### Step 3: Diff detection
- มี codemap เดิมอยู่ → คำนวณ % การเปลี่ยนแปลง
- เปลี่ยน **> 30%** → แสดง diff + **ขอ user อนุมัติก่อนเขียนทับ**
- เปลี่ยน **≤ 30%** → อัปเดต in place ได้เลย

### Step 4: Metadata
ใส่ freshness header บนสุดของทุกไฟล์:
```html
<!-- Generated: YYYY-MM-DD | Files scanned: N | Token estimate: ~X -->
```

### Step 5: Analysis report → `.reports/codemap-diff.txt`
- ไฟล์ added / removed / modified ตั้งแต่สแกนครั้งล่าสุด
- dependency ใหม่ที่ตรวจพบ
- architecture changes (route ใหม่, service ใหม่ ฯลฯ)
- คำเตือน staleness: doc ที่ไม่ถูกอัปเดต 90+ วัน

---

## 3. หลักการ (tips)

- โฟกัสโครงสร้างระดับสูง — **ไม่ใช่** implementation detail
- ใช้ file path + function signature แทน code block เต็ม
- แต่ละ codemap **< 1000 tokens** เพื่อโหลดเข้า context ได้ถูก
- ใช้ ASCII diagram แทนคำบรรยาย data flow ยืดยาว
- **ทุกอย่างต้องมาจากโค้ดจริง ณ วันสแกน — ห้ามเดา/ห้ามเขียนจากความจำ**

---

## 4. Gate — จบเมื่อ

- [ ] codemap ทุกไฟล์ตรงโค้ดจริง + มี freshness header
- [ ] `index.md` ลิงก์ครบทุกไฟล์ codemap ที่มี
- [ ] ทุกไฟล์ token-lean (< 1000 tokens)
- [ ] diff > 30% ผ่านการอนุมัติจาก user แล้ว
- [ ] `.reports/codemap-diff.txt` เขียนแล้ว
