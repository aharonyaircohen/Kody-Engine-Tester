# [run-20260417-1832] P3T23: Issue attachments and metadata enrichment

Verify image attachments are downloaded and labels/comments enrich task.md.

Create an issue with an image in the body and at least one label, plus a comment.

## Verification
1. Logs show 'Downloaded attachment:' and task.md has local paths + Labels: + Discussion:
2. If image URL is unreachable (404), verify graceful fallback: original URL preserved, warning logged, pipeline continues
3. PASS: attachments/ downloaded, Labels: and Discussion: sections present in task.md

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-17):
@kody

**@aharonyaircohen** (2026-04-17):
🚀 Kody pipeline started: `2320-260417-185327`

