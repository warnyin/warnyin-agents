# Constitution — @warnyin/agents
<!-- cap:30 · ALWAYS LOADED. Canonical rules live in docs/rule.md — this file only pins the non-negotiables. -->

## Stack (facts only, max 3 lines)
- Zero-dependency Node >= 20 ESM npm package; source of truth in `src/`, dogfood at repo root.
- Full engineering rules: `docs/rule.md` · dev process: `CONTRIBUTING.md` (read before src/ changes).

## Hard rules (SHALL / SHALL NOT only — no advice)
- The agent SHALL NOT add npm dependencies (node:* only).
- The agent SHALL NOT change any `.warnyin/workflow` stage behavior without explicit user confirmation.
- src/ changes SHALL update tests in the same change; `package.json files` is an allowlist (verify:pack).
- User-facing messages and comments in payload SHALL be Thai.
- The agent SHALL NOT edit `sdlc/specs/**` or archive outside `/sdlc:ship`; assumptions go in `## Assumptions`.

## Workflow
- Changes flow: new → [design] → contract → build → verify → [review] → ship.
- Tier by stakes: vibe | standard | deep — triage table lives in `sdlc/harness.md`.
