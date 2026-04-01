
### taskify (2026-04-01T11:18:16)
All 21 tests pass. Here's what was created:

**`src/utils/priority-queue.ts`** - Functional priority queue with:
- `PriorityQueue.empty()` - creates an empty queue
- `PriorityQueue.from([{value, priority}])` - creates from array
- `enqueue(value, priority)` - returns a **new** queue (immutable)
- `dequeue()` - returns tuple of `[item, newQueue]` (immutable)
- `peek()` - returns highest priority item without removing
- `isEmpty()`, `size()`, `toArray()` - query operations

**`src/utils/priority-q
...(truncated)

### build (2026-04-01T11:19:28)
The priority queue tests pass (21 tests). The exit code 1 is from the e2e test stage (no database configured), not from the priority queue tests.

Looking at the implementation, it already follows functional immutable style:
- `enqueue` returns a new queue
- `dequeue` returns a tuple of `[item, newQueue]`
- All internal state is `readonly`
- `toArray()` returns a copy

The implementation is complete and working. Is there a specific aspect of the functional style you'd like me to improve?

