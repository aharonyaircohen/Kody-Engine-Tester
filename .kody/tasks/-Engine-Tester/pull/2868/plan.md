

Now I have all the context needed. Let me write the plan.

---

## Implementation Plan: Assignment Submission Endpoint

**Pattern discovered:** The quiz submit endpoint (`src/app/api/quizzes/[id]/submit/route.ts`) is the reference pattern — it uses `getPayload({ config: configPromise })`, `withAuth`, `findByID` to validate the entity, and returns `{ success, data }` or `{ success: false, error }` responses. The enroll route shows the 409 duplicate pattern with `payload.find`.

---

## Step 1: Write the test file

**File:** `src/app/api/assignments/[id]/submit/route.test.ts`
**Change:** Create co-located test covering 404, 400, 409, and 201 cases using `vi.fn()` mocks for Payload SDK.
**Why:** Follows TDD; co-located test pattern from conventions.
**Verify:** `pnpm test:int` passes for the new file.

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Payload before importing the route module
const mockFindByID = vi.fn()
const mockFind = vi.fn()
const mockCreate = vi.fn()
vi.mock('payload', () => ({
  getPayload: vi.fn(() => ({
    findByID: mockFindByID,
    find: mockFind,
    create: mockCreate,
  })),
}))

// Mock the config promise
vi.mock('@payload-config', () => ({
  default: Promise.resolve({}),
}))

describe('POST /api/assignments/[id]/submit', () => {
  const mockUser = { id: 'student-1', role: 'viewer' as const }

  const makeRouteHandler = async () => {
    const { POST } = await import('./route')
    return POST
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const makeRequest = (body: object, user = mockUser) => {
    return new NextRequest('http://localhost/api/assignments/assign-1/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': user ? 'Bearer valid-token' : '',
      },
      body: JSON.stringify(body),
    })
  }

  const mockRouteParams = { params: Promise.resolve({ id: 'assign-1' }) }

  const defaultAssignment = {
    id: 'assign-1',
    title: 'Essay Assignment',
    dueDate: '2099-12-31',
    maxScore: 100,
  }

  // --- 404: Assignment not found ---
  it('returns 404 when assignment does not exist', async () => {
    mockFindByID.mockResolvedValue(null)

    const POST = await makeRouteHandler()
    const response = await POST(makeRequest({ studentId: 'student-1', content: {} }), {}, mockRouteParams)

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Assignment not found' })
  })

  // --- 400: Assignment past due ---
  it('returns 400 when assignment dueDate has passed', async () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-01-01T12:00:00Z'))
    mockFindByID.mockResolvedValue({ ...defaultAssignment, dueDate: '2025-01-01' })

    const POST = await makeRouteHandler()
    const response = await POST(makeRequest({ studentId: 'student-1', content: {} }), {}, mockRouteParams)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Assignment past due' })
  })

  // --- 409: Duplicate submission ---
  it('returns 409 when a submission already exists for the same assignment and student', async () => {
    mockFindByID.mockResolvedValue(defaultAssignment)
    mockFind.mockResolvedValue({ docs: [{ id: 'existing-sub' }], totalDocs: 1 })

    const POST = await makeRouteHandler()
    const response = await POST(makeRequest({ studentId: 'student-1', content: {} }), {}, mockRouteParams)

    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Already submitted' })
  })

  // --- 201: Successful submission ---
  it('returns 201 with the created submission on success', async () => {
    const now = '2026-04-19T12:00:00.000Z'
    vi.useFakeTimers().setSystemTime(new Date(now))
    const createdDoc = {
      id: 'new-sub',
      assignment: 'assign-1',
      student: 'student-1',
      content: { richText: 'my answer' },
      attachments: [],
      submittedAt: now,
      status: 'submitted',
    }

    mockFindByID.mockResolvedValue(defaultAssignment)
    mockFind.mockResolvedValue({ docs: [], totalDocs: 0 })
    mockCreate.mockResolvedValue(createdDoc)

    const POST = await makeRouteHandler()
    const response = await POST(
      makeRequest({ studentId: 'student-1', content: { richText: 'my answer' }, attachmentIds: [] }),
      {},
      mockRouteParams,
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toEqual({ success: true, data: createdDoc })

    expect(mockCreate).toHaveBeenCalledWith({
      collection: 'submissions',
      data: expect.objectContaining({
        assignment: 'assign-1',
        student: 'student-1',
        content: { richText: 'my answer' },
        attachments: [],
        submittedAt: now,
        status: 'submitted',
      }),
    })
  })

  // --- 400: Missing required fields ---
  it('returns 400 when studentId or content is missing', async () => {
    mockFindByID.mockResolvedValue(defaultAssignment)

    const POST = await makeRouteHandler()

    const noStudent = await POST(makeRequest({ content: {} }), {}, mockRouteParams)
    expect(noStudent.status).toBe(400)
    const noContent = await POST(makeRequest({ studentId: 'student-1' }), {}, mockRouteParams)
    expect(noContent.status).toBe(400)
  })

  // --- 400: Invalid JSON body ---
  it('returns 400 when the request body is not valid JSON', async () => {
    const badReq = new NextRequest('http://localhost/api/assignments/assign-1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })

    const POST = await makeRouteHandler()
    const response = await POST(badReq as unknown as NextRequest, {}, mockRouteParams)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ success: false, error: 'Invalid JSON body' })
  })
})
```

---

## Step 2: Write the route handler

**File:** `src/app/api/assignments/[id]/submit/route.ts`
**Change:** Create the POST route following the quiz submit pattern — `withAuth` wrapper, `getPayload({ config: configPromise })`, `payload.findByID` lookup, past-due check, duplicate `payload.find` check, `payload.create` for the Submissions record.
**Why:** Follows existing submit-style pattern; small route handler with no unnecessary abstractions.
**Verify:** `pnpm test:int` passes and `pnpm lint` passes.

```typescript
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'

interface SubmitBody {
  studentId: string
  content: object
  attachmentIds?: string[]
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const POST = withAuth(
  async (
    request: NextRequest,
    _context: { user?: { id: string; role: string } },
    routeParams?: { params: Promise<{ id: string }> },
  ) => {
    const params = await routeParams?.params
    const id = params?.id

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
        status: 400,
        headers: JSON_HEADERS,
      })
    }

    let body: SubmitBody
    try {
      body = await request.json()
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: JSON_HEADERS },
      )
    }

    const { studentId, content, attachmentIds = [] } = body

    if (!studentId || !content) {
      return new Response(
        JSON.stringify({ success: false, error: 'studentId and content are required' }),
        { status: 400, headers: JSON_HEADERS },
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Fetch the assignment
    const assignment = await payload.findByID({
      collection: 'assignments' as never,
      id,
      depth: 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any

    if (!assignment) {
      return new Response(
        JSON.stringify({ success: false, error: 'Assignment not found' }),
        { status: 404, headers: JSON_HEADERS },
      )
    }

    // Check if past due
    if (assignment.dueDate) {
      const dueDate = new Date(assignment.dueDate)
      if (dueDate < new Date()) {
        return new Response(
          JSON.stringify({ success: false, error: 'Assignment past due' }),
          { status: 400, headers: JSON_HEADERS },
        )
      }
    }

    // Check for existing submission
    const existing = await payload.find({
      collection: 'submissions' as never,
      where: {
        assignment: { equals: id },
        student: { equals: studentId },
      },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Already submitted' }),
        { status: 409, headers: JSON_HEADERS },
      )
    }

    // Create the submission
    const submission = await payload.create({
      collection: 'submissions' as never,
      data: {
        assignment: id,
        student: studentId,
        content,
        attachments: attachmentIds.map((attachmentId) => ({ file: attachmentId })),
        submittedAt: new Date().toISOString(),
        status: 'submitted',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })

    return new Response(
      JSON.stringify({ success: true, data: submission }),
      { status: 201, headers: JSON_HEADERS },
    )
  },
)
```

---

## Step 3: Verify quality gates

**Change:** Run typecheck, lint, and tests to confirm the new files pass all gates.
**Verify:**
```bash
pnpm typecheck
pnpm lint
pnpm test:int
```

---

## Existing Patterns Found

- **`getPayload({ config: configPromise })`** from `quizzes/[id]/submit/route.ts` — used instead of `getPayloadInstance()` for consistency with the reference pattern.
- **`withAuth` HOC** — wraps the route handler; `withAuth(handler, { roles: [...] })` pattern from enroll route for RBAC.
- **Duplicate check (409)** — `payload.find({ where: { assignment: { equals: id }, student: { equals: studentId } } })` pattern from `enroll/route.ts` which checks for existing enrollment.
- **Past due check** — `dueDate < new Date()` comparison, matching natural date arithmetic.
- **`vi.fn()` + `.mockResolvedValue()`** — for Payload SDK stubbing in test files.
- **`vi.useFakeTimers()`** — for time-dependent test cases (past due date).

## Questions

*(None — the task description fully specifies the behavior, error codes, and data model.)*