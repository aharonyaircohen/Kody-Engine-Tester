# [run-20260410-1148] T01: Simple utility function

## Task
Add a `formatPhoneNumber` utility function in src/utils/ that formats a phone number string.

## Requirements
- Takes a string input (e.g., "1234567890" or "123-456-7890")
- Returns formatted string like "(123) 456-7890"
- Handles international numbers with country code
- Include unit tests in src/utils/formatPhoneNumber.test.ts
- Use TypeScript with proper types

## Context
The codebase needs phone number formatting utilities for user profile validation and contact display.


---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1586-260410-114951` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24241457117))

To rerun: `@kody rerun 1586-260410-114951 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. What is the expected output format for international numbers with country code? For example, should +1-555-123-4567 format as "+1 (555) 123-4567", "+1-555-123-4567", or something else?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
@kody approve

For international numbers with country code (e.g., +1-555-123-4567), format as +1 (555) 123-4567. The country code should be preserved with a space after it.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1586-260410-115437` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24241580163))

To rerun: `@kody rerun 1586-260410-115437 --from <stage>`

