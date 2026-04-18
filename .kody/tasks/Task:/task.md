# [run-20260418] P3T23: Issue attachments and metadata enrichment

Verify image attachments are downloaded and labels/comments enrich task.md.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

Task: Add a footer component.

## Design
![mockup](https://github.com/user-attachments/assets/test-uuid/footer-design.png)

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `Task:`

---

## Verification Results (build stage — 2026-04-18)

| Check | Status |
|---|---|
| Discussion comments enriched in task.md | ✅ Pass |
| Labels/metadata extracted to task.json | ✅ Pass |
| Image attachment (footer-design.png) downloaded locally | ❌ Fail |

### Details

- **Discussion enrichment**: `task.md` contains both discussion comments from @aharonyaircohen, including the task description ("Add a footer component") and the design mockup reference. The `## Discussion (2 comments)` section is present.
- **Metadata extraction**: `task.json` correctly captures `task_type: chore`, `title`, `description`, `scope`, `risk_level`, `existing_patterns`, and `questions`.
- **Attachment download**: `task.md` contains the image URL `https://github.com/user-attachments/assets/test-uuid/footer-design.png`, but no local file matching `footer-design.png` exists in the task directory. The image was **not** downloaded.

### Recommendation

The image attachment referenced in the issue discussion (`footer-design.png`) should be downloaded and saved to `.kody/tasks/Task:/attachments/footer-design.png` (or similar). The `task.md` image reference should be updated to point to the local path. This gap should be addressed by the attachment-download step in the pipeline.

