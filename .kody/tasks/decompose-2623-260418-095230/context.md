
### taskify (2026-04-18T09:56:48)
The plan is ready. The task is straightforward with no product-level ambiguity to clarify — "capitalize" means sentence-case (first character only), which is distinct from the existing `capitalizeWords` title-case utility. Ready for your approval.

### build (2026-04-18T09:57:56)
The plan creates the two files directly from the task specification. Here's what I found in exploration:

- **`src/utils/cap.ts`** already has the correct `capitalize` implementation (sentence-case)
- **`src/utils/capitalize-words.ts`** has `capitalizeWords` (title-case — different function, correctly separated)
- **`src/utils/strings.ts`** does not exist — it needs to be created fresh

The plan is ready for your approval.
