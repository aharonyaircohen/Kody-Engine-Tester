
### build (2026-04-01T11:54:35)
## Summary

All **1745 integration tests pass** (1 skipped). The test failures were caused by tests using non-existent roles (`instructor`, `student`, `user`) and non-existent users (`user@example.com`, `instructor@example.com`) that don't exist in the UserStore's seed data.

### Root Cause
The tests were written expecting different roles (`instructor`, `student`, `user`) but the actual implementation uses `admin`, `editor`, `viewer` roles. The UserStore only seeds `admin@example.com`, `editor@e
...(truncated)
