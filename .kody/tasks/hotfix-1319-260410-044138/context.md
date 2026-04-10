
### build (2026-04-10T04:45:01)

The fix is complete. I've added `export default` to the `encode` function in `src/utils/base64.ts`.

**Summary of change:**
- `src/utils/base64.ts:11` - Changed `export function encode` to `export default function encode`

This allows the file to be imported with a default import like:
```typescript
import encode from '@/utils/base64'
// or
import base64 from '@/utils/base64'
```

