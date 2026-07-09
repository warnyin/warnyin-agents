# Feature — universal-ide

> ส่วนหนึ่งของ component `installer` — ขยาย feature `global-install`
> achieved: topic `support-universal-ide` (2026-07-09)

## จุดประสงค์

installer ติดตั้ง adapter สำหรับทุก IDE พร้อมกันโดย**ไม่ detect** ว่า user ใช้ IDE ใด (zero-config, unconditional)
ลบเหตุผลที่ user ต้องรัน installer ซ้ำเมื่อเปลี่ยน IDE หรือใช้หลาย IDE พร้อมกัน

## IDE ที่รองรับ

| IDE | ไฟล์ที่ install | install strategy |
|---|---|---|
| Cursor | `.cursor/rules/warnyin.mdc` | overwrite (`--update` ได้) |
| Windsurf | `.windsurf/rules/warnyin.md` | overwrite (`--update` ได้) |
| GitHub Copilot | `.github/copilot-instructions.md` | append-with-marker |
| Cline | `.clinerules` | append-with-marker |
| Gemini | `GEMINI.md` | append-with-marker |

## Install strategy แยกตามประเภทไฟล์

**overwrite (Cursor / Windsurf):** ไฟล์อยู่ใน directory เฉพาะของ IDE ที่ user ไม่น่ามีเนื้อหาก่อน
→ `copyTree` / `installAdapterDoc({overwrite:UPDATE})` — `--update` สามารถ refresh template ได้

**append-with-marker (Copilot / Cline / Gemini):** ไฟล์อยู่ top-level หรือ path ทั่วไปที่ user อาจมีเนื้อหาเดิม
→ `installAdapterDoc` append section พร้อม marker idempotent — **ห้าม overwrite แม้ `--update`**

## พฤติกรรม

- **idempotent** — รัน installer ซ้ำ: ไฟล์ overwrite-strategy byte-equal ไม่นับ write; ไฟล์ append-strategy marker ปรากฏ 1 ครั้ง
- **--dry-run** — log path ทั้งหมดแต่ไม่เขียนไฟล์จริง
- **global mode** — adapter ลงที่ `os.homedir()` เช่นเดียวกับ project mode (path เดียวกัน)
- **unconditional** — ไม่ detect IDE; ติดตั้งทุกตัวเสมอ

## เอกสารอ้างอิง

- `docs/features/global-install/feature.md` — global install mode (parent feature)
- `docs/techstack/installer/rule.md` — rule R1: adapter-install-strategy, R2: unconditional multi-IDE
- `docs/techstack/installer/structure.md` — helper `installAdapterDoc` + template paths
- `docs/stages/achieved/2026-07-09-support-universal-ide/` — archived topic
