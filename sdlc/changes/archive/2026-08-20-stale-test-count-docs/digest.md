# Digest — stale-test-count-docs (2026-08-20)
Shipped (vibe, auto per policy): fixed 5 stale test-count sites in
docs/techstack/installer/{structure,test}.md — installer.test 33/35→40 (breakdown
re-derived from actual test names), verify-pack 13→28, setup-dogfood 14→32,
fastlane 14→12. Backlog row 2 scope; found 2 extra stale sites beyond the row.
Verified: every count re-measured with node --test · full suite 321/321 · lint:md green.
No delta (docs-only, no behavior contract). First-pass, 1 verify round.

For the human: docs/backlog.md row 2 (`lean-ceremony`) is now done — mark it via
your /warnyin workflow (backlog is recommend-not-auto, so I did not edit it).
