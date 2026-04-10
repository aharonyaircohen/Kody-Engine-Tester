### Additional Observations

- **Validation Schema-Driven Middleware** (`src/middleware/validation.ts`): Schema-based body/query/params validation with type coercion — a declarative validation Strategy.
- **Generic Dependency Interfaces** (`src/services/gradebook.ts`, `src/services/grading.ts`): Both services declare typed `Deps` interfaces (e.g., `GradebookServiceDeps<T...>`, `GradingServiceDeps<A,S,C>`) decoupling from Payload — enables testability and DI.
- **Rubric-Based Grading Model** (`src/services/grading.ts`): `RubricCriterion` + `RubricScore` types encode a structured scoring domain — an implicit Value Object pattern.
- **Password Hashing Divergence**: `AuthService` uses PBKDF2 (25000 iter, sha256) matching Payload's `generatePasswordSaltHash`; `UserStore` uses SHA-256 directly — confirmed anti-pattern.
