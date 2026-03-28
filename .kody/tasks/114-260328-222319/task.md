# Add integration tests for enrollment + progress + grading flow

Create an integration test suite that tests the full student journey end-to-end using the service layer (no HTTP, no UI).

**Test file:** `tests/int/student-journey.test.ts`

**Scenarios:**
1. **Happy path:** Create course → enroll student → complete lessons → take quiz → submit assignment → get graded → receive certificate
2. **Enrollment limits:** Course with maxEnrollments=2, try enrolling 3 students — third should fail
3. **Quiz retry:** Student fails quiz, retries (up to maxAttempts), eventually passes
4. **Late submission:** Student submits assignment after due date — should still be accepted but flagged as late
5. **Grade calculation:** Verify weighted grade (40% quiz, 60% assignment) across multiple quizzes and assignments
6. **Progress tracking:** Verify progress percentage updates correctly as lessons are completed
7. **Certificate generation:** Verify certificate is issued only when all modules are complete and passing grade achieved

These tests should use the service layer directly (gradebook, progress, quiz-grader, grading services). Mock the Payload database layer.