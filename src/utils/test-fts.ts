import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { FtsIndex, FtsDocument, Episode } from './test-fts.types'

const GRAPH_DIR = join(process.cwd(), '.kody', 'graph')
const EPISODES_DIR = join(GRAPH_DIR, 'episodes')
const SESSIONS_INDEX_PATH = join(GRAPH_DIR, 'sessions-index.json')
const SEQ_PATH = join(EPISODES_DIR, '.seq')

export interface FtsSearchResult {
  episodeId: string
  score: number
  taskId: string
  source: string
  content: string
}

/**
 * Loads the current FTS index from sessions-index.json
 */
export function loadFtsIndex(): FtsIndex | null {
  if (!existsSync(SESSIONS_INDEX_PATH)) {
    return null
  }
  const raw = readFileSync(SESSIONS_INDEX_PATH, 'utf-8')
  return JSON.parse(raw) as FtsIndex
}

/**
 * Loads all episodes from the episodes directory
 */
export function loadEpisodes(): Episode[] {
  if (!existsSync(EPISODES_DIR)) {
    return []
  }
  const files = readdirSync(EPISODES_DIR).filter(
    (f) => f.endsWith('.json') && f !== '.seq'
  )
  return files.map((file) => {
    const raw = readFileSync(join(EPISODES_DIR, file), 'utf-8')
    return JSON.parse(raw) as Episode
  })
}

/**
 * Loads the sequence tracking file
 */
export function loadSeq(): Record<string, number> {
  if (!existsSync(SEQ_PATH)) {
    return {}
  }
  const raw = readFileSync(SEQ_PATH, 'utf-8')
  return JSON.parse(raw)
}

/**
 * Searches the FTS index for a query term and returns ranked results
 */
export function searchFts(query: string, limit = 10): FtsSearchResult[] {
  const index = loadFtsIndex()
  if (!index) {
    return []
  }

  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const results: FtsSearchResult[] = []

  for (const [episodeId, doc] of Object.entries(index.documents)) {
    let score = 0
    for (const term of queryTerms) {
      if (index.vocabulary[term]) {
        // IDF-weighted term frequency
        const vocabEntry = index.vocabulary[term]
        const termFreq = doc.content.toLowerCase().split(term).length - 1
        score += vocabEntry.idf * termFreq
      }
    }
    if (score > 0) {
      results.push({
        episodeId,
        score,
        taskId: doc.taskId,
        source: doc.source,
        content: doc.content,
      })
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

/**
 * Gets episodes by source type
 */
export function getEpisodesBySource(source: string): Episode[] {
  return loadEpisodes().filter((ep) => ep.source === source)
}

/**
 * Gets retrospective episodes specifically
 */
export function getRetrospectiveEpisodes(): Episode[] {
  return getEpisodesBySource('retrospective')
}

/**
 * Checks if retrospective episodes exist
 */
export function hasRetrospectiveEpisodes(): boolean {
  return getRetrospectiveEpisodes().length > 0
}

/**
 * Gets the current retrospective sequence number
 */
export function getRetrospectiveSeq(): number {
  const seq = loadSeq()
  return seq.retrospective || 0
}

/**
 * Verifies FTS search returns ranked results
 */
export function verifyFtsSearch(query: string): {
  hasResults: boolean
  results: FtsSearchResult[]
  isRanked: boolean
} {
  const results = searchFts(query)

  // Check if results are sorted by score descending
  const isRanked =
    results.length <= 1 ||
    results.every((r, i) => i === 0 || results[i - 1].score >= r.score)

  return {
    hasResults: results.length > 0,
    results,
    isRanked,
  }
}

/**
 * Verifies that searching for 'retrospective' returns results
 */
export function verifyRetrospectiveSearch(): {
  hasResults: boolean
  results: FtsSearchResult[]
} {
  const results = searchFts('retrospective')
  return {
    hasResults: results.length > 0,
    results,
  }
}

/**
 * Full FTS verification test - runs all checks
 */
export interface FtsVerificationResult {
  passed: boolean
  checks: {
    retrospectiveEpisodesExist: boolean
    retrospectiveEpisodeCount: number
    retrospectiveSeqNumber: number
    ftsSearchReturnsResults: boolean
    ftsSearchIsRanked: boolean
    retrospectiveSearchHasResults: boolean
    retrospectiveSearchResultCount: number
  }
  errors: string[]
}

export function runFtsVerification(): FtsVerificationResult {
  const errors: string[] = []
  const checks = {
    retrospectiveEpisodesExist: false,
    retrospectiveEpisodeCount: 0,
    retrospectiveSeqNumber: 0,
    ftsSearchReturnsResults: false,
    ftsSearchIsRanked: false,
    retrospectiveSearchHasResults: false,
    retrospectiveSearchResultCount: 0,
  }

  // Check 1: Retrospective episodes should exist
  const retrospectiveEpisodes = getRetrospectiveEpisodes()
  checks.retrospectiveEpisodesExist = retrospectiveEpisodes.length > 0
  checks.retrospectiveEpisodeCount = retrospectiveEpisodes.length

  if (!checks.retrospectiveEpisodesExist) {
    errors.push(
      'No retrospective episodes found in .kody/graph/episodes/. ' +
        'Expected retrospective episodes to be created after pipeline completion.'
    )
  }

  // Check 2: Retrospective sequence should be tracked
  const seq = loadSeq()
  checks.retrospectiveSeqNumber = seq.retrospective || 0

  if (checks.retrospectiveSeqNumber === 0 && checks.retrospectiveEpisodesExist) {
    errors.push(
      'Retrospective episodes exist but .seq file does not track retrospective count.'
    )
  }

  // Check 3: FTS search should return ranked results (using a common term)
  const generalSearch = verifyFtsSearch('task')
  checks.ftsSearchReturnsResults = generalSearch.hasResults
  checks.ftsSearchIsRanked = generalSearch.isRanked

  if (!checks.ftsSearchReturnsResults) {
    errors.push(
      'FTS search for common term "task" returned no results. ' +
        'Expected FTS index to contain searchable documents.'
    )
  }

  if (!checks.ftsSearchIsRanked) {
    errors.push('FTS search results are not properly ranked by score.')
  }

  // Check 4: Searching for 'retrospective' should return results
  const retroSearch = verifyRetrospectiveSearch()
  checks.retrospectiveSearchHasResults = retroSearch.hasResults
  checks.retrospectiveSearchResultCount = retroSearch.results.length

  if (!checks.retrospectiveSearchHasResults) {
    errors.push(
      'Searching for "retrospective" returned no results. ' +
        'Expected FTS index to contain retrospective-related content.'
    )
  }

  return {
    passed: errors.length === 0,
    checks,
    errors,
  }
}

/**
 * Creates a test retrospective episode for testing purposes
 * This is used to populate the FTS index with test data
 */
export function createTestRetrospectiveEpisode(
  taskId: string,
  content: string
): Episode {
  const seq = loadSeq()
  const retroSeq = (seq.retrospective || 0) + 1
  const episodeId = `ep_retrospective_${String(retroSeq).padStart(3, '0')}`

  const episode: Episode = {
    id: episodeId,
    runId: taskId,
    source: 'retrospective',
    taskId,
    createdAt: new Date().toISOString(),
    rawContent: content,
    extractedNodeIds: [],
    linkedFiles: [],
  }

  // Ensure episodes directory exists
  if (!existsSync(EPISODES_DIR)) {
    mkdirSync(EPISODES_DIR, { recursive: true })
  }

  // Write episode file
  writeFileSync(
    join(EPISODES_DIR, `${episodeId}.json`),
    JSON.stringify(episode, null, 2)
  )

  // Update sequence file
  const updatedSeq = { ...seq, retrospective: retroSeq }
  writeFileSync(SEQ_PATH, JSON.stringify(updatedSeq, null, 2))

  return episode
}
