# [test-suite] Simple utility function

Create a simple utility function `slugify(text: string): string` that converts a string to a URL-friendly slug. It should:
- Convert to lowercase
- Replace spaces with hyphens  
- Remove non-alphanumeric characters (except hyphens)
- Collapse multiple hyphens into one
- Trim leading/trailing hyphens

Add it to `src/utils/slugify.ts` with unit tests in `src/utils/slugify.test.ts`.