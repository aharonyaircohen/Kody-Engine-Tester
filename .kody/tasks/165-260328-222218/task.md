# Add unit tests for notification service event dispatching

## Test Coverage

The notification service (\`src/services/notification-service.ts\`) handles LMS event dispatching but lacks dedicated unit tests.

**Test file:** \`src/services/notification-service.test.ts\`

**Test cases needed:**
1. Dispatching an enrollment event creates a notification for the student
2. Dispatching a grade-posted event creates a notification for the student
3. Dispatching a certificate-issued event creates a notification
4. Unknown event types are silently ignored (no error thrown)
5. Multiple subscribers receive the same event
6. Event payload is passed through correctly to notification body

Mock the data layer. Focus on the dispatch logic and subscriber notification.

**Complexity:** low