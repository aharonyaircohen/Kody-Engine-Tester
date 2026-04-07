{
  "task_type": "feature",
  "title": "Add User model with password hash field",
  "description": "Create a User domain model in src/models/ with id, email, and passwordHash fields using bcrypt for password hashing. Email must be unique. Includes unit tests for hashing, comparison, and schema validation.",
  "scope": [
    "src/models/user.ts",
    "src/models/user.test.ts"
  ],
  "risk_level": "medium",
  "existing_patterns": [
    "src/models/notification.ts — domain model with TypeScript interface, co-located test file pattern"
  ],
  "questions": []
}
