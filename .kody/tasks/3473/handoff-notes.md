Implemented issue #3473: added summarize utility, /api/stats route, and StatsCard component.

The summarize function computes mean, median, mode, stdDev, and count over a number array. Mode returns the smallest value on ties and is null when no value repeats (single-element arrays are a special case where the single value IS the mode). StdDev uses population formula and is null for arrays shorter than 2.

The /api/stats route uses withAuth({ optional: true }) so unauthenticated callers can read stats. It queries the enrollments collection for each lessonId using `completedLessons: { in: [lessonId] }` — the correct Payload query operator for hasMany relationship array membership should be verified.

The StatsCard component uses a discriminated union type for status (loading/error/success) to avoid cascading renders. The empty lessonIds case is handled via useState lazy initializer for the initial render, avoiding a synchronous setState call in the effect body that would trigger the react-hooks lint rule.
