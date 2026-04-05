
### taskify (2026-04-05T21:38:33)
{"task_type":"feature","title":"Add temperature converter utility","description":"Create a temperature converter utility in src/utils/temperature.ts that converts between Celsius, Fahrenheit, and Kelvin. Add co-located tests in temperature.test.ts following the existing utility patterns (e.g., clamp.ts).","scope":["src/utils/temperature.ts","src/utils/temperature.test.ts"],"risk_level":"low","existing_patterns":[{"path":"src/utils/clamp.ts","pattern":"Single-function utility module with typed in
...(truncated)

### build (2026-04-05T21:39:16)
The type error is in an existing test file (`tests/helpers/seedUser.ts`), not in the new temperature utility. The temperature converter implementation is complete with all tests passing.

