# Code Map — Index

> สารบัญ codemap ทั้งชุด — สร้าง/อัปเดตด้วย `/warnyin:update-codemaps` (playbook: `.warnyin/workflow/codemap.md`)
> ทุกไฟล์ต้อง token-lean (< 1000 tokens) + freshness header + ตรงโค้ดจริงเสมอ

## Codemap files
<!-- ลิงก์เฉพาะไฟล์ที่ relevant กับโปรเจกต์ -->
- [architecture.md](architecture.md) — system diagram, service boundary, data flow
- [backend.md](backend.md) — routes, middleware, service → repo mapping
- [frontend.md](frontend.md) — page tree, component hierarchy, state
- [data.md](data.md) — ตาราง DB, relationship, migrations
- [dependencies.md](dependencies.md) — external service, third-party, shared lib

## Component ทั้งหมด
<!-- ชื่อ + หน้าที่ + path — รายละเอียดต่อ component ดู docs/techstack/<component>/structure.md -->

## จุดเข้า (entry points)
<!-- main/server/cli/cron — ไฟล์ไหนคือประตูเข้าแต่ละทาง -->
