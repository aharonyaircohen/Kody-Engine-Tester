# [run-20260410-0437] T23: Issue attachments and metadata enrichment

## Task
Test that Kody downloads image attachments and enriches task.md with labels and discussion comments.

## Task Description
Add a format-currency utility in src/utils/format-currency.ts.

## Setup
This test requires an issue with an image attachment in the body. Since we can't easily create image attachments, this test will verify:
1. The workflow attempts to download attachments
2. Labels are included in task.md
3. Discussion comments are captured

## Test Steps
1. Create temp issue with image URL in body and a comment
2. Comment @kody
3. Check logs for attachment download attempts
4. Verify task.md contains Labels: and Discussion sections

## Expected
- Attachment URLs processed
- Labels appear in task.md
- Discussion comments captured

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1334-260410-044600` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226817092))

To rerun: `@kody rerun 1334-260410-044600 --from <stage>`

