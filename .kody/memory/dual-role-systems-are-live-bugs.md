---
name: dual-role-systems-are-live-bugs
title: Three different role systems coexist — role checks silently fail depending on which auth path created the user
type: lesson
source: job:task-memory-extractor:from-DF4B6986-DFED-4B32-BE99-06B259E854E3
recorded_at: 2026-05-20T19:52:38Z
---

src/auth/user-store.ts:3 defines UserRole = 'admin'|'user'|'guest'|'student'|'instructor'; src/auth/auth-service.ts:6 defines RbacRole = 'admin'|'editor'|'viewer'; src/collections/Users.ts:78 defines collection roles as ['admin','editor','viewer']. A check like `user.role === 'instructor'` succeeds against UserStore users but always fails against Payload users (RbacRole has no instructor).

**Why:** Role-based access control silently grants or denies access based on which auth layer issued the token — a student can be admin in one system and invisible in another.
**How to apply:** Before writing any `user.role === X` check, identify which auth path produced the user object (UserStore vs Payload/JWT) and use the matching role type.

**Source task:** `DF4B6986-DFED-4B32-BE99-06B259E854E3`
