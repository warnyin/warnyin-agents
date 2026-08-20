---
id: stale-test-count-docs
tier: vibe
status: shipped
---
# Change: Fix stale test-count numbers in installer docs
<!-- cap:40 · vibe tier = one file, no contract. Reversible, no behavior-contract change, ≤2 files. -->

## Why (≤3 lines)
docs/backlog.md row 2 (queued from topic lean-ceremony): per-file test counts in
docs/techstack/installer/{structure,test}.md are stale. Measured today per file
with `node --test`; 5 sites are wrong.

## Assumptions
- Only numbers (and the installer.test breakdown, re-derived from actual test names)
  change — descriptive prose stays untouched to keep the diff within backlog scope.

## Tasks
- [x] T1 structure.md: installer.test 33→40 · verify-pack 13→28
- [x] T2 test.md: installer.test 35→40 (+ correct breakdown) · setup-dogfood 14→32 · fastlane 14→12
- [x] T3 re-measure all counts == docs; npm test green

## Receipt (filled at ship)
- files touched: docs/techstack/installer/{structure,test}.md · test result: 321/321 + lint:md green · cost: (see journal)
