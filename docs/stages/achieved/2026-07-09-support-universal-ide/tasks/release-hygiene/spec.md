# Spec — release-hygiene

## 1. ชนิดของ task

`docs` + `infra` (release)

---

## 7. Test-flow

- [ ] **T3-changelog:** `CHANGELOG.md` มีบรรทัดที่กล่าวถึง Cursor/Windsurf/Copilot/Cline/Gemini
- [ ] **T3-version-bump:** `package.json version` เปลี่ยนจาก version เดิม (semver increment)
- [ ] **T3-claude-template:** `src/.warnyin/installer/templates/CLAUDE.md` มีบรรทัดกล่าวถึง IDE ใหม่ในส่วน "รองรับหลาย AI"
- [ ] **T3-full-test:** `node --test` exit 0
