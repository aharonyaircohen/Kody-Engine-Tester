# [test-suite] Hotfix: add missing null check in slugify

The slugify utility in src/utils/slugify.ts crashes when passed null or undefined. Add a null/undefined guard at the top of the function that returns an empty string. This is an urgent production fix.