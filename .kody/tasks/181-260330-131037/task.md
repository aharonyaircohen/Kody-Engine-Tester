# Add Announcements collection for course-wide announcements

### Category
feature - Feature functionality

### Scenario
As an instructor, I want to post announcements to all students enrolled in a course, so they receive important updates about schedule changes, assignment deadlines, or course materials.

### Acceptance Criteria
- Create an `Announcements` collection with fields: title, body (textarea), course (relationship to Courses), priority (select: low/medium/high), publishedAt (date)
- Add appropriate access control (instructors can create/edit, students can read)
- Include a test file following existing test patterns