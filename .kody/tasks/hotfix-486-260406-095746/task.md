# [test-suite] Hotfix: null guard in slugify v2

The slugify utility in src/utils/slugify.ts crashes when passed null. Add a null guard. Urgent fix.