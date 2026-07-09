# Spec — update-verify-pack

## 1. ชนิดของ task

`logic` (gate/validator update)

---

## 4. Data-flow

```
npm pack --json (list files in tarball)
    ↓
checkFiles(files: string[]) → errors: string[]
    ↓
exit 0 (no errors) | exit 1 (errors)
```

## 7. Test-flow

- [ ] **T2-allowed-new:** `checkFiles(['src/.warnyin/installer/templates/cursor-rules.mdc', ...adapter paths])` → `errors.length === 0`
- [ ] **T2-allowed-existing:** path เดิมที่ pass อยู่แล้ว ยังผ่าน
- [ ] **T2-denylist-still-works:** `checkFiles(['docs/stages/something.md'])` → `errors.length > 0`
- [ ] **T2-denylist-tests:** `checkFiles(['src/tests/installer.test.mjs'])` → `errors.length > 0`
