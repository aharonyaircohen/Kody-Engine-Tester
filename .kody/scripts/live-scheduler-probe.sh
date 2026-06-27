#!/usr/bin/env bash
set -euo pipefail
cat <<'STATE'
```kody-job-next-state
{"cursor":"live-scheduler-probe","data":{"lastProbe":"ok"},"done":false}
```
STATE
