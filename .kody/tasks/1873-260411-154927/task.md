# [] T01: Simple utility function

## Task
Create a new string formatting utility in src/utils/formatters/ that provides:
1. A `formatPhoneNumber` function that formats a 10-digit number as `(XXX) XXX-XXXX`
2. A `formatCreditCard` function that formats a 16-digit number as `XXXX XXXX XXXX XXXX`

Both should be in src/utils/formatters/index.ts with full test coverage in src/utils/formatters/index.test.ts.

## Complexity
This is a LOW complexity task — single file, simple pure functions, no API calls.

## Acceptance Criteria
- Both functions exported from index.ts
- formatPhoneNumber handles edge cases (short numbers, long numbers)
- formatCreditCard masks all but last 4 digits in the output
- 100% test coverage

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1873-260411-154927` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285975021))

To rerun: `@kody rerun 1873-260411-154927 --from <stage>`

