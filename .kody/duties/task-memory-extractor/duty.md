# Task Memory Extractor

Scan `.kody/tasks/*/memory-recs.json` files and promote only high-confidence recommendations into `.kody/memory/`. Leave medium-confidence recommendations attached to the task and ignore low-confidence recommendations.

The implementation reference is `.kody/scripts/task-memory-extractor-tick.py`. Do not edit the task recommendation files; use `.kody/tasks/<id>/.extracted` as the per-task processed marker.
