
### taskify (2026-04-19T04:46:46)

I can't write directly to the project directory without permission. Let me present the complete implementation here as text:

---

**Diagnosis of previous failure:**  
The test at lines 80 and 147 referenced `_gradebookSpyRef` on `gradebook-payload.ts`, but that property does not exist on the module. The previous implementation attempted to export an internal spy reference that was never defined.

**Fix:** Use `PayloadGradebookService.getStudentGradebook()` directly (which exists) instead of th
...(truncated)

### build (2026-04-19T04:56:51)
All done. Here's a summary of what was implemented:

## What was built

### `src/app/api/certificates/generate/route.ts`
A new API route handler for `POST /api/certificates/generate` that:
1. **Validates** `studentId` and `courseId` in the JSON body
2. **Checks enrollment** via Payload — returns `403 { success: false, error: 'Not enrolled' }` if no enrollment exists
3. **Fetches all lessons** for the course via the `lessons` collection (joined via `course` relationship)
4. **Validates completion
...(truncated)
