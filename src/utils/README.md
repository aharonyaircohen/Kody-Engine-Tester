# Utils

Utility functions organized by category. All utilities have co-located tests (`.test.ts`).

## Array

| Function | Description |
|----------|-------------|
| `chunk(arr, size)` | Split array into chunks of given size |
| `compact(arr)` | Remove falsy values from array |
| `flatten(arr)` | Flatten nested array one level |
| `groupBy(arr, keyFn)` | Group array elements by key |
| `unique(arr)` | Remove duplicates from array |
| `reverse(arr)` | Reverse array (immutable) |
| `zip(...arrays)` | Zip multiple arrays into one |
| `sortedArray` | Sorted array data structure with O(log n) insertion |
| `stack` | Stack (LIFO) data structure |
| `queue` | Queue (FIFO) data structure |
| `omit(obj, keys)` | Create object with specified keys omitted |
| `pick(obj, keys)` | Create object with only specified keys |
| `range(start, end, step)` | Generate array of numbers in range |

## String

| Function | Description |
|----------|-------------|
| `capitalizeWords(str)` | Capitalize first letter of each word |
| `slugify(str)` | Convert string to URL-friendly slug |
| `truncate(str, maxLength)` | Truncate string to max length |
| `truncateWords(str, maxWords)` | Truncate string to max word count |
| `padStart(str, length, char)` | Pad string from start |
| `toKebabCase(str)` | Convert string to kebab-case |
| `base64` | Base64 encode/decode utilities |

## Number

| Function | Description |
|----------|-------------|
| `clamp(value, min, max)` | Clamp value between min and max |
| `formatNumber(num, options)` | Format number with locale |
| `formatCurrency(amount, currency)` | Format number as currency |
| `formatDate(date, format)` | Format date string |
| `cap(value, max)` | Cap value at maximum |
| `repeat(str, count)` | Repeat string N times |
| `math` | Math utilities (e.g., `isEven`) |

## Formatting

| Function | Description |
|----------|-------------|
| `color` | Color conversion utilities (hex, rgb, hsl) |
| `urlParser` | URL parsing and manipulation |
| `urlShortener` | URL shortening utilities |

## Functional

| Function | Description |
|----------|-------------|
| `debounce(fn, delay, options)` | Debounce function with leading/trailing options |
| `throttle(fn, limit)` | Throttle function calls |
| `memoize(fn)` | Memoize function results |
| `pipe(...fns)` | Compose functions left-to-right |
| `memoize(fn)` | Cache function results |

## Async

| Function | Description |
|----------|-------------|
| `retry(fn, options)` | Retry function on failure |
| `retryQueue` | Queue with retry logic |
| `promisePool(tasks, concurrency)` | Run promises with concurrency limit |
| `sleep(ms)` | Promise-based delay |
| `retry` | Retry with configurable attempts/delay |

## Event / Messaging

| Function | Description |
|----------|-------------|
| `eventBus` | Publish/subscribe event system |
| `eventEmitter` | Event emitter with methods |
| `messageBus` | Message bus implementation |

## State

| Function | Description |
|----------|-------------|
| `stateMachine` | State machine implementation |
| `undoRedo` | Undo/redo stack |

## Object

| Function | Description |
|----------|-------------|
| `deepClone(obj)` | Deep clone an object |
| `diff(a, b)` | Compute difference between objects |
| `depGraph` | Dependency graph |

## Validation

| Function | Description |
|----------|-------------|
| `isbnValidator(isbn)` | Validate ISBN-10 or ISBN-13 |
| `schema` | Schema validation utilities |
| `notificationHelpers` | Notification-related helpers |

## Infrastructure

| Function | Description |
|----------|-------------|
| `cache` | Caching utilities |
| `errorReporter` | Error reporting/aggregation |
| `middleware` | Middleware chain utilities |
| `result` | `Result<T, E>` discriminated union type |
| `diContainer` | Dependency injection container |
| `logger` | Logging utilities (subdirectory) |

## Testing

| File | Description |
|------|-------------|
| `test-fts.ts` | Full-text search test utilities |
| `test-fts.types.ts` | Types for test utilities |
