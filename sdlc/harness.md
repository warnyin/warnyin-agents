# Harness — @warnyin/agents
<!-- cap:60 · CONFIGURE-phase output; reviewed like code. Registry + tables only — doctrine lives in sdlc/.playbook/. -->

## Tools & MCP (what the agent may call)
| Tool/MCP | Scope | Notes |
|---|---|---|
| npm test | src/tests black-box | node 20/22/24 matrix in CI |
| npm run verify:pack | files allowlist gate | before any release |

## Sandbox & execution
- test command: `npm test`
- sandbox notes: tests run black-box in temp dirs; never write outside them or touch the dogfood root.

## Guardrails (mirror of installed hooks — deterministic, the agent cannot skip them)
- `sdlc/specs/**` and archive are write-locked outside ship.
- Artifact line caps validated on every write.
- Session token/cost journaled per change.

## Model routing (generic tiers — the harness adapter maps them to real models)
| Task kind | Tier |
|---|---|
| requirements, architecture, deep design | deepest |
| standard implementation | balanced |
| test generation, review passes, mechanical/scaffold, eval judging, learning | cheap |

## Tier triage (stakes → tier)
- vibe: docs/backlog fixes, ≤2 files, no behavior change.
- deep: installer copy/prune/manifest logic, anything under .warnyin/workflow (stage behavior), release/publish steps.
- otherwise: standard.

## Autonomy policy
- auto-ship: vibe, standard.
- escalate to human: hard-floor (security, payments, data-loss, irreversible), verify failed > 3 rounds,
  token budget exceeded, information the agent cannot obtain or safely assume.
