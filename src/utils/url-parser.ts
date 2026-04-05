/**
 * URL Parser Utility
 * Extracts protocol, host, path, query parameters, and fragment from a URL string.
 */

export interface ParsedUrl {
  /** The protocol scheme (e.g., 'https', 'http', 'ftp') */
  protocol: string
  /** The hostname and port number (e.g., 'example.com', 'localhost:3000') */
  host: string
  /** The path portion after the host (e.g., '/users/123') */
  path: string
  /** Query string parameters as key-value pairs */
  queryParams: Record<string, string>
  /** The fragment identifier including the # (e.g., 'section-1') */
  fragment: string
  /** The original URL that was parsed */
  originalUrl: string
}

export interface UrlParserOptions {
  /** If true, decode URL-encoded characters in the result (default: true) */
  decode?: boolean
  /** If true, include the port number even for standard ports (default: false) */
  showPort?: boolean
}

/**
 * Parses a URL string into its component parts.
 *
 * @param url - The URL string to parse
 * @param options - Configuration options (decode, showPort)
 * @returns A ParsedUrl object containing all URL components
 *
 * @example
 * const result = parseUrl('https://example.com/users/123?lang=en&page=1#intro')
 * // result.protocol => 'https'
 * // result.host => 'example.com'
 * // result.path => '/users/123'
 * // result.queryParams => { lang: 'en', page: '1' }
 * // result.fragment => 'intro'
 * // result.originalUrl => 'https://example.com/users/123?lang=en&page=1#intro'
 *
 * @example
 * // With decoding disabled
 * const result = parseUrl('https://example.com/%2F%3F', { decode: false })
 * // result.path => '%2F%3F'
 */
export function parseUrl(url: string, options: UrlParserOptions = {}): ParsedUrl {
  const decode = options.decode ?? true

  if (!url || typeof url !== 'string') {
    return {
      protocol: '',
      host: '',
      path: '',
      queryParams: {},
      fragment: '',
      originalUrl: url ?? '',
    }
  }

  let protocol = ''
  let host = ''
  let path = ''
  let fragment = ''
  let queryString = ''

  // Extract fragment
  const fragmentIndex = url.indexOf('#')
  if (fragmentIndex !== -1) {
    fragment = url.slice(fragmentIndex + 1)
  }

  // Work with URL without fragment for parsing
  let urlToParse = fragmentIndex !== -1 ? url.slice(0, fragmentIndex) : url

  // Extract protocol
  const protocolMatch = urlToParse.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\//)
  if (protocolMatch) {
    protocol = protocolMatch[1]
  }

  // Handle non-standard protocols (e.g., view-source:https://...)
  // These have format: protocol:url where url itself is a standard URL
  if (!protocol) {
    const firstColon = urlToParse.indexOf(':')
    if (firstColon !== -1) {
      const potentialProtocol = urlToParse.slice(0, firstColon)
      const afterColon = urlToParse.slice(firstColon + 1)
      // If after colon is a standard URL (has ://), it's a non-standard protocol
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(afterColon)) {
        protocol = potentialProtocol
        urlToParse = afterColon
      }
    }
  }

  // Find the host/path portion
  let hostPathPart = urlToParse
  if (protocol) {
    const protocolSeparator = urlToParse.indexOf('://')
    if (protocolSeparator !== -1) {
      hostPathPart = urlToParse.slice(protocolSeparator + 3) // Remove protocol://
    }
  }

  // Split host and path
  const pathIndex = hostPathPart.indexOf('/')
  if (pathIndex !== -1) {
    host = hostPathPart.slice(0, pathIndex)
    path = hostPathPart.slice(pathIndex)
  } else {
    host = hostPathPart
    path = ''
  }

  // Check if port is in host and handle it
  const portMatch = host.match(/:(\d+)$/)
  const showPort = options.showPort ?? false
  if (portMatch && !showPort) {
    const standardPorts: Record<string, string> = {
      'http': '80',
      'https': '443',
      'ftp': '21',
      'ssh': '22',
    }
    if (standardPorts[protocol.toLowerCase()] === portMatch[1]) {
      host = host.replace(/:\d+$/, '')
    }
  }

  // Extract query string from path
  const queryIndex = path.indexOf('?')
  if (queryIndex !== -1) {
    queryString = path.slice(queryIndex + 1)
    path = path.slice(0, queryIndex)
  }

  // Parse query parameters
  const queryParams: Record<string, string> = {}
  if (queryString) {
    const pairs = queryString.split('&')
    for (const pair of pairs) {
      const [key, value] = pair.split('=')
      if (key) {
        const decodedKey = decode ? decodeURIComponent(key) : key
        const decodedValue = decode ? decodeURIComponent(value ?? '') : (value ?? '')
        queryParams[decodedKey] = decodedValue
      }
    }
  }

  // Decode path and fragment if enabled
  const finalPath = decode ? decodeURIComponent(path) : path
  const finalFragment = decode ? decodeURIComponent(fragment) : fragment

  return {
    protocol,
    host,
    path: finalPath,
    queryParams,
    fragment: finalFragment,
    originalUrl: url,
  }
}

/**
 * Checks if a string is a valid URL format.
 *
 * @param url - The string to validate
 * @returns true if the string appears to be a valid URL, false otherwise
 *
 * @example
 * isValidUrl('https://example.com') // true
 * isValidUrl('http://localhost:3000/users') // true
 * isValidUrl('not-a-url') // false
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  // Must have a protocol and host
  const urlPattern = /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\/[^\/\s]+(\/|$)/
  return urlPattern.test(url)
}

/**
 * Builds a URL string from a ParsedUrl object.
 *
 * @param parsed - A ParsedUrl object
 * @returns The reconstructed URL string
 *
 * @example
 * const parsed = parseUrl('https://example.com/users?lang=en#section')
 * const url = buildUrl(parsed)
 * // url => 'https://example.com/users?lang=en#section'
 */
export function buildUrl(parsed: ParsedUrl): string {
  let url = ''

  if (parsed.protocol) {
    url += `${parsed.protocol}://`
  }

  if (parsed.host) {
    url += parsed.host
  }

  if (parsed.path) {
    const pathToAdd = parsed.path.startsWith('/') ? parsed.path : `/${parsed.path}`
    url += encodeURIComponent(pathToAdd).replace(/%2F/g, '/')
  }

  const queryKeys = Object.keys(parsed.queryParams)
  if (queryKeys.length > 0) {
    url += '?'
    url += queryKeys
      .map((key) => {
        const value = parsed.queryParams[key]
        return value ? `${encodeURIComponent(key)}=${encodeURIComponent(value)}` : encodeURIComponent(key)
      })
      .join('&')
  }

  if (parsed.fragment) {
    url += `#${encodeURIComponent(parsed.fragment)}`
  }

  return url
}
