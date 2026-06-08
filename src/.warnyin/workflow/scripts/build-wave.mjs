// build-wave — fan-out หนึ่ง sub-agent ต่อหนึ่ง task ใน "หนึ่ง wave" (task ที่ independent กัน)
// main loop (BUILD command) เรียก script นี้ทีละ wave ตาม dependency แล้ว integrate ระหว่าง wave
//
// args = {
//   slug: string,            // ชื่อ topic เช่น "billing-redesign"
//   tasks: string[],         // ชื่อ task ใน wave นี้ (โฟลเดอร์ docs/stages/<slug>/tasks/<task>)
//   isolate?: boolean,       // true = worktree ต่อ task (ดีฟอลต์), false = shared tree (sequential)
//   baseRef?: string,        // ชื่อ build branch เช่น "build/my-topic"; ไม่ส่ง = ไม่ sync (backward compat)
// }

export const meta = {
  name: 'build-wave',
  description: 'BUILD: fan-out sub-agent ต่อ task ใน wave เดียว — implement + test/lint + commit แล้วรายงานผล',
  phases: [{ title: 'Build wave', detail: 'parallel agent, หนึ่งตัวต่อหนึ่ง task (worktree isolation)' }],
}

// บาง harness ส่ง args ของ Workflow เป็น string (JSON text) ไม่ใช่ object — รับทั้งสองแบบ
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const slug = A.slug
const tasks = A.tasks || []
const isolate = !(A.isolate === false)
const baseRef = A.baseRef || null   // ชื่อ build branch เช่น "build/my-topic"; ไม่ส่ง = ไม่ sync (backward compat)

if (!slug || tasks.length === 0) {
  log('ไม่มี slug หรือ tasks — ไม่มีอะไรให้ build')
  return { slug: slug || null, results: [], failed: [] }
}

phase('Build wave')
log(`Build ${tasks.length} task ของ "${slug}"${isolate ? ' · worktree isolation' : ' · shared tree'}`)

const RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['task', 'status', 'summary'],
  properties: {
    task: { type: 'string', description: 'ชื่อ task' },
    status: { enum: ['passed', 'failed'], description: 'passed ก็ต่อเมื่อ test/lint เขียวจริง' },
    summary: { type: 'string', description: 'สรุปสั้นๆ ว่าทำอะไร' },
    branch: { type: 'string', description: 'ชื่อ git branch ของ worktree (ถ้า isolate) ให้ main loop merge' },
    filesChanged: { type: 'array', items: { type: 'string' } },
    testResult: { type: 'string', description: 'ผล test-flow + build/lint' },
    notes: { type: 'string', description: 'conflict/ข้อควรระวัง/ rule ใหม่ที่ note ไว้' },
    troubleshooting: {
      type: 'array',
      description: 'ปัญหายาก/เจอซ้ำที่แก้สำเร็จ — main loop จะเขียนรวมลง topic troubleshooting.md',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'rootCause', 'solution'],
        properties: {
          title: { type: 'string' },
          symptom: { type: 'string', description: 'อาการ/error message' },
          rootCause: { type: 'string' },
          solution: { type: 'string' },
          prevention: { type: 'string', description: 'วิธีป้องกันไม่ให้เกิดซ้ำ' },
        },
      },
    },
  },
}

function prompt(task) {
  const dir = `docs/stages/${slug}/tasks/${task}`
  const lines = [
    `คุณคือ build sub-agent ของ task "${task}" (vertical slice) ทำตาม playbook .warnyin/workflow/stages/build.md`,
    ``,
    `1. อ่านให้ครบก่อนเขียนโค้ด:`,
    `   - .warnyin/workflow/roles/developer.md (role card: lens + checklist ก่อนส่งงาน — ทำตามทุกข้อ)`,
    `   - ${dir}/task.md (เป้าหมาย + sub-tasks + dependency + acceptance)`,
    `   - ${dir}/spec.md (API/UXUI/data-flow/user-flow/persona/test-flow)`,
    `   - ${dir}/standard.md (pattern โค้ด, shared component — reuse ห้ามเขียนซ้ำ)`,
    `   - ${dir}/rule.md (กฎที่ต้อง follow)`,
    `   - ภาพรวม: docs/stages/${slug}/design.md, proposal.md`,
    `   - rule/standard กลางที่อ้างถึงใน docs/techstack/<component>/`,
    `2. Implement ให้ครบทุก sub-task แบบ vertical slice (end-to-end) ทำตาม standard.md + rule.md เคร่งครัด`,
    `3. รัน test-flow ใน spec.md + build/lint ของ component นั้น`,
    `4. ถ้าเจอ error/ติดปัญหา → อ่าน docs/troubleshooting.md ก่อน เผื่อเคยแก้แล้ว`,
    `5. รายงาน status=passed เฉพาะเมื่อ test/build เขียวจริง; ถ้าแก้ไม่ได้ → status=failed พร้อมเหตุผล`,
    `   ห้ามรายงานผ่านทั้งที่ยังแดง`,
    `6. ห้ามแก้ไฟล์ rule/standard กลางใน docs/ (rule ใหม่ note ไว้ใน ${dir}/rule.md อยู่แล้ว รอ SHIP)`,
    `7. อัปเดตสถานะ + acceptance ที่ผ่านใน ${dir}/task.md`,
    `8. ปัญหาที่ "ยาก/เจอซ้ำ" และแก้สำเร็จ → ใส่ในฟิลด์ troubleshooting (main loop จะรวมลง topic troubleshooting.md)`,
  ]
  // worktree fork จาก main (คุมไม่ได้) → ให้ agent sync build branch เข้า worktree เองก่อนทำงาน
  // แทรกเป็น step "0." ก่อน "1. อ่านให้ครบ" — เฉพาะ isolate && baseRef (ไม่ renumber step 1-9; !baseRef = พฤติกรรมเดิม)
  if (isolate && baseRef) {
    lines.splice(2, 0,
      `0. **★ Sync build branch เข้า worktree ก่อน (ทำก่อน Read ไฟล์ใดๆ):** รัน`,
      `   \`git merge ${baseRef} --no-edit || (git merge --abort; <รายงาน failed>)\``,
      `   (worktree fork จาก main — ต้อง merge build branch เพื่อให้เห็น docs/stages/${slug}/ + output ของ wave ก่อนหน้า)`,
      `   - ปกติเป็น fast-forward (main มักเป็น ancestor ของ build branch); ถ้าเป็น 3-way แล้ว conflict → **abort + รายงาน failed** (ห้ามทิ้ง worktree ค้าง MERGE state — step commit ท้ายจะพัง)`,
      `   - ถ้าล้มด้วย lock error ชั่วคราว (transient \`index.lock\`/\`packed-refs\`) → **retry 1 ครั้ง** ก่อนรายงาน failed`,
      `   - **★ hard-stop กัน improvise (panel B2):** หลัง merge ถ้าไฟล์ \`${dir}/task.md\` **ยังไม่ปรากฏ** → **STOP รายงาน failed ทันที ห้าม improvise/git reset เอง** (กันวนรอย KB#14)`,
      `   - บันทึกผล merge ลงฟิลด์ \`notes\` (เช่น "merged ${baseRef}: fast-forward to <sha>") เพื่อ main loop verify ว่า sync เกิดจริง (Infra-S5)`,
      ``,
    )
  }
  if (isolate) {
    lines.push(
      `9. คุณอยู่ใน git worktree แยก: เมื่อเสร็จและเขียวแล้ว ให้ commit งาน (git add -A && git commit -m "build(${task}): ...")`,
      `   แล้วรายงานชื่อ branch (git rev-parse --abbrev-ref HEAD) ในฟิลด์ branch เพื่อให้ main loop merge`,
    )
  } else {
    lines.push(`9. (shared tree) อย่า commit เอง — main loop จะ commit ให้หลังตรวจ`)
  }
  lines.push(``, `คืนผลตาม schema.`)
  return lines.join('\n')
}

const results = await parallel(
  tasks.map((task) => () =>
    agent(prompt(task), isolate
      ? { label: `build:${task}`, schema: RESULT_SCHEMA, isolation: 'worktree' }
      : { label: `build:${task}`, schema: RESULT_SCHEMA })
  )
)

const clean = results.filter(Boolean)
const failed = clean.filter((r) => r.status === 'failed').map((r) => r.task)
const skipped = tasks.filter((t) => !clean.some((r) => r.task === t))

log(`เสร็จ ${clean.length}/${tasks.length} · ผ่าน ${clean.length - failed.length} · ล้ม ${failed.length}${skipped.length ? ` · ข้าม ${skipped.length}` : ''}`)

return { slug, results: clean, failed, skipped }
