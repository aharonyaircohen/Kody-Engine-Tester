const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Creates a JSON error response.
 */
export function createErrorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: JSON_HEADERS,
  })
}

/**
 * Creates a JSON response with optional custom status code and extra headers.
 * Defaults to status 200 and no extra headers.
 */
export function createJsonResponse(
  data: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: extraHeaders ? { ...JSON_HEADERS, ...extraHeaders } : JSON_HEADERS,
  })
}
