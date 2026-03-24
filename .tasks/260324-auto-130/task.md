# Demo Task: Add Posts Collection with Rich Features

## Overview

Enhance the Kody-Engine-Tester Payload CMS template by adding a fully-featured `posts` collection that demonstrates:

- Rich text editing with Lexical
- Categories relationship
- Author assignment
- Featured image support
- Tags support
- Draft/Published workflow
- Version control

## Task Details

**Priority**: high  
**Complexity**: medium  
**Estimated Time**: 2-3 hours

## Requirements

### 1. Create Posts Collection

Create `src/collections/Posts.ts` with the following fields:

- `title` (text, required, indexed)
- `slug` (text, unique, auto-generated from title)
- `content` (richText using Lexical editor)
- `excerpt` (text, max 200 chars)
- `featuredImage` (upload relationship to Media)
- `author` (relationship to Users, required)
- `category` (relationship to Categories)
- `tags` (array of text)
- `status` (select: draft, published, archived)
- `publishedAt` (date, auto-set on publish)
- `readTime` (number, minutes)

### 2. Create Categories Collection

Create `src/collections/Categories.ts`:

- `name` (text, required)
- `slug` (text, unique)
- `description` (text)

### 3. Update Collections Index

Update `src/collections/index.ts` to export Posts and Categories.

### 4. Add Access Control

- Anyone can read published posts
- Only authenticated users can create posts
- Authors can only update their own posts
- Admins can update any post

### 5. Add Hooks

- Auto-generate slug from title before create
- Set publishedAt when status changes to published
- Create a "New post published" log entry (use context to prevent infinite loops)

### 6. Add Admin Configuration

- Use title as admin useAsTitle
- DefaultColumns: title, author, status, category, createdAt
- Enable preview for posts

### 7. Update Frontend

Update `src/app/(frontend)/page.tsx` to display a list of published posts with:

- Post title linking to full post
- Author name
- Published date
- Category

### 8. Add Integration Tests

Create `tests/int/posts.int.spec.ts`:

- Test creating a post
- Test slug auto-generation
- Test publishedAt auto-set
- Test access control

## Acceptance Criteria

1. Posts collection visible in Payload admin
2. Can create, edit, delete posts
3. Draft/Published workflow works
4. Slug auto-generates from title
5. publishedAt sets automatically on publish
6. Frontend displays published posts
7. All tests pass: `pnpm test`
8. TypeScript compiles: `pnpm tsc --noEmit`
9. Linting passes: `pnpm lint`

## Technical Notes

- Use Payload's built-in `slugField` for auto-slug generation
- Use `beforeValidate` hook for slugify
- Use `beforeChange` hook for publishedAt
- Use context flag in hooks to prevent infinite loops
- Follow existing collection patterns in codebase
- Use TypeScript with proper types from Payload
- Run `pnpm payload generate:types` after changes
