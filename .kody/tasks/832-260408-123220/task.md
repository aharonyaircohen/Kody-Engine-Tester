# Vulnerability: drizzle-orm (HIGH)

## Vulnerability Findings

### `drizzle-orm` - SQL injection via improperly escaped SQL identifiers
- **Advisory**: https://github.com/advisories/GHSA-gpj5-g38j-94v9
- **CVE**: CVE-2026-39356
- **Severity**: HIGH
- **CVSS**: 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)
- **Package**: drizzle-orm
- **Current version**: 0.44.7
- **Vulnerable versions**: <0.45.2
- **Patched versions**: >=0.45.2
- **Suggested fix**: `pnpm update drizzle-orm@>=0.45.2`

---

**Evidence**: `pnpm audit` via pnpm-lock.yaml