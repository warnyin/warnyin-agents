# Business — Interop (companion-tool consult-if-present)

> คุณค่าเชิงธุรกิจ · promote จาก topic `understand-anything-interop` (achieved 2026-06-15)

## Goal
ให้ Warnyin workflow หยิบประโยชน์จากเครื่องมือภายนอกที่ผู้ใช้มีอยู่แล้ว (เช่น knowledge graph ของ Understand-Anything) ตอนงาน "เข้าใจ codebase" — โดยไม่ทำลาย zero-dependency / tool-agnostic และไม่บังคับให้ผู้ใช้ต้องมี tool นั้น

## คุณค่า
- **เข้าใจ codebase แม่นขึ้น** เมื่อมี companion artifact (graph deterministic จาก static analysis) — โดยเฉพาะ repo ใหญ่/ไม่คุ้น
- **zero-cost เมื่อไม่มี** — conditional + suggest = ผู้ใช้ที่ไม่มี tool ทำงานเดิม 100% (no hard dep)
- **ปลอดภัย** — external artifact ถือเป็น untrusted (trust-boundary guard) กัน prompt-injection
- **ขยายได้แบบมีวินัย** — inclusion bar 4 ข้อ ทำให้เพิ่ม companion tool อื่นได้โดยไม่กลายเป็น catalog

## Persona
- AI agent ตอน comprehension (INIT/codemap/explore/Discovery) — ได้ knowledge graph ช่วยเมื่อมี
- ทีมที่ commit `.understand-anything/` ไว้แล้ว — warnyin หยิบมาใช้อัตโนมัติ (file-exists)
- ทุก downstream install — ได้ interop convention ติด payload (conditional)

## Success metric
- `interop.md` เป็น single source + reachable จาก 6 touchpoint (pointer resolve ครบ)
- trust-boundary guard ผ่าน adversarial sim (fake malicious artifact → agent ignore instruction)
- backward-compatible 100% · ship integrity (ติด package + install ลง target จริง)
- tool-agnostic (trigger=path) + reference-not-vendor (ไม่มีโค้ด UA ใน repo)

## ที่มา
- Understand-Anything (https://github.com/Egonex-AI/Understand-Anything, MIT) — interoperate (ชี้ไปใช้) ไม่ใช่ bundle; ต่างจาก ponytail/minimalism ที่ฝังปรัชญาได้ (UA เป็น runtime tool จึงต้อง consult artifact)
