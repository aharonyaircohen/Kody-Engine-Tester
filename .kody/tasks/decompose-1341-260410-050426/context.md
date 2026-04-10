
### taskify (2026-04-10T05:10:25)
I see the issue now. Looking at the git history:

- Commit `e0b8341`: "test: temporarily disable decompose for T27 test" - decompose was disabled
- Commit `69b1c6f`: "Revert 'test: temporarily disable decompose for T27 test'" - the config was reverted

So the config has already been **reverted** (cleanup step completed), which means `decompose.enabled: false` is NO LONGER in the config. The current `kody.config.json` I read confirms this - there's no decompose section.

**Current state:**
- Conf
...(truncated)

### build (2026-04-10T05:11:13)
Based on my analysis:

**T27 Test Verification Summary:**

1. **Implementation exists** at `cli.js:8589-8592`:
   ```javascript
   if (config.decompose?.enabled === false) {
     logger.info("  decompose disabled in config — falling back to normal pipeline");
     return fallbackToPipeline(opts);
   }
   ```

2. **Test was already executed and cleaned up** (commits `e0b8341` → `69b1c6f`):
   - `e0b8341`: Added `decompose.enabled: false` to config
   - `69b1c6f`: Reverted the config change

3. **
...(truncated)
