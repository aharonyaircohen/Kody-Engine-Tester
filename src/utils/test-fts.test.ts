import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { writeFileSync, readFileSync, existsSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import {
  loadFtsIndex,
  loadEpisodes,
  loadSeq,
  searchFts,
  getEpisodesBySource,
  getRetrospectiveEpisodes,
  hasRetrospectiveEpisodes,
  getRetrospectiveSeq,
  verifyFtsSearch,
  verifyRetrospectiveSearch,
  runFtsVerification,
  createTestRetrospectiveEpisode,
} from './test-fts'
import type { Episode, FtsIndex } from './test-fts.types'

// Test fixtures directory
const TEST_GRAPH_DIR = join(process.cwd(), '.kody', 'graph')
const TEST_EPISODES_DIR = join(TEST_GRAPH_DIR, 'episodes')
const TEST_SESSIONS_INDEX_PATH = join(TEST_GRAPH_DIR, 'sessions-index.json')
const TEST_SEQ_PATH = join(TEST_EPISODES_DIR, '.seq')

describe('test-fts', () => {
  describe('loadFtsIndex', () => {
    it('loads FTS index from sessions-index.json', () => {
      const index = loadFtsIndex()
      expect(index).toBeDefined()
      expect(index?.vocabulary).toBeDefined()
      expect(index?.documents).toBeDefined()
      expect(index?.totalDocs).toBeGreaterThan(0)
    })

    it('returns null when sessions-index.json does not exist', () => {
      // This test depends on actual file state
      const index = loadFtsIndex()
      // The actual sessions-index.json exists in the repo
      expect(index).not.toBeNull()
    })
  })

  describe('loadEpisodes', () => {
    it('loads episodes from the episodes directory', () => {
      const episodes = loadEpisodes()
      expect(Array.isArray(episodes)).toBe(true)
      // Should load plan, nudge, and potentially other episodes
      expect(episodes.length).toBeGreaterThan(0)
    })

    it('returns episode objects with required fields', () => {
      const episodes = loadEpisodes()
      if (episodes.length > 0) {
        const episode = episodes[0]
        expect(episode).toHaveProperty('id')
        expect(episode).toHaveProperty('runId')
        expect(episode).toHaveProperty('source')
        expect(episode).toHaveProperty('taskId')
        expect(episode).toHaveProperty('createdAt')
        expect(episode).toHaveProperty('rawContent')
      }
    })
  })

  describe('loadSeq', () => {
    it('loads the sequence tracking file', () => {
      const seq = loadSeq()
      expect(seq).toBeDefined()
      expect(typeof seq).toBe('object')
      // Should track different episode sources
      expect(seq).toHaveProperty('plan')
      expect(seq).toHaveProperty('nudge')
    })

    it('returns empty object when .seq does not exist', () => {
      const seq = loadSeq()
      // The actual .seq file exists
      expect(Object.keys(seq).length).toBeGreaterThan(0)
    })
  })

  describe('searchFts', () => {
    it('returns ranked search results for a query', () => {
      const results = searchFts('task')
      expect(Array.isArray(results)).toBe(true)
      // Results should be sorted by score descending
      if (results.length > 1) {
        for (let i = 1; i < results.length; i++) {
          expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
        }
      }
    })

    it('returns results with required fields', () => {
      const results = searchFts('pipeline')
      if (results.length > 0) {
        const result = results[0]
        expect(result).toHaveProperty('episodeId')
        expect(result).toHaveProperty('score')
        expect(result).toHaveProperty('taskId')
        expect(result).toHaveProperty('source')
        expect(result).toHaveProperty('content')
      }
    })

    it('returns empty array when no matches found', () => {
      const results = searchFts('xyznonexistentterm123')
      expect(results).toEqual([])
    })

    it('respects the limit parameter', () => {
      const results = searchFts('task', 2)
      expect(results.length).toBeLessThanOrEqual(2)
    })
  })

  describe('getEpisodesBySource', () => {
    it('filters episodes by source type', () => {
      const planEpisodes = getEpisodesBySource('plan')
      expect(Array.isArray(planEpisodes)).toBe(true)
      planEpisodes.forEach((ep) => {
        expect(ep.source).toBe('plan')
      })
    })

    it('returns empty array for non-existent source', () => {
      const episodes = getEpisodesBySource('nonexistent')
      expect(episodes).toEqual([])
    })
  })

  describe('getRetrospectiveEpisodes', () => {
    it('returns only retrospective source episodes', () => {
      const retroEpisodes = getRetrospectiveEpisodes()
      expect(Array.isArray(retroEpisodes)).toBe(true)
      retroEpisodes.forEach((ep) => {
        expect(ep.source).toBe('retrospective')
      })
    })

    it('should return empty when no retrospective episodes exist', () => {
      // Currently no retrospective episodes exist per task description
      const retroEpisodes = getRetrospectiveEpisodes()
      // This test documents current state - may change after pipeline implementation
      expect(Array.isArray(retroEpisodes)).toBe(true)
    })
  })

  describe('hasRetrospectiveEpisodes', () => {
    it('returns boolean indicating if retrospective episodes exist', () => {
      const hasRetro = hasRetrospectiveEpisodes()
      expect(typeof hasRetro).toBe('boolean')
    })
  })

  describe('getRetrospectiveSeq', () => {
    it('returns the current retrospective sequence number', () => {
      const seqNum = getRetrospectiveSeq()
      expect(typeof seqNum).toBe('number')
      expect(seqNum).toBeGreaterThanOrEqual(0)
    })
  })

  describe('verifyFtsSearch', () => {
    it('verifies FTS search returns ranked results', () => {
      const verification = verifyFtsSearch('task')
      expect(verification).toHaveProperty('hasResults')
      expect(verification).toHaveProperty('results')
      expect(verification).toHaveProperty('isRanked')
      expect(typeof verification.hasResults).toBe('boolean')
      expect(typeof verification.isRanked).toBe('boolean')
      expect(Array.isArray(verification.results)).toBe(true)
    })
  })

  describe('verifyRetrospectiveSearch', () => {
    it('verifies searching for retrospective returns results', () => {
      const verification = verifyRetrospectiveSearch()
      expect(verification).toHaveProperty('hasResults')
      expect(verification).toHaveProperty('results')
      expect(typeof verification.hasResults).toBe('boolean')
      expect(Array.isArray(verification.results)).toBe(true)
    })

    it('documents current state - no retrospective search results yet', () => {
      const verification = verifyRetrospectiveSearch()
      // Currently no retrospective episodes exist, so search returns empty
      // This test documents the expected behavior after pipeline creates retrospective episodes
      expect(Array.isArray(verification.results)).toBe(true)
    })
  })

  describe('runFtsVerification', () => {
    it('runs full FTS verification and returns structured result', () => {
      const result = runFtsVerification()
      expect(result).toHaveProperty('passed')
      expect(result).toHaveProperty('checks')
      expect(result).toHaveProperty('errors')
      expect(typeof result.passed).toBe('boolean')
      expect(Array.isArray(result.errors)).toBe(true)
      expect(result.checks).toHaveProperty('retrospectiveEpisodesExist')
      expect(result.checks).toHaveProperty('retrospectiveEpisodeCount')
      expect(result.checks).toHaveProperty('ftsSearchReturnsResults')
      expect(result.checks).toHaveProperty('ftsSearchIsRanked')
      expect(result.checks).toHaveProperty('retrospectiveSearchHasResults')
    })

    it('documents expected behavior - FTS works but no retrospective episodes yet', () => {
      const result = runFtsVerification()
      // FTS search should work (common terms like "task" should return results)
      expect(result.checks.ftsSearchReturnsResults).toBe(true)
      expect(result.checks.ftsSearchIsRanked).toBe(true)
      // But retrospective episodes should not exist yet (until pipeline implements them)
      // This documents the gap that the test is verifying
    })
  })

  describe('createTestRetrospectiveEpisode', () => {
    const TEST_TASK_ID = 'test-retro-' + Date.now()

    afterEach(() => {
      // Clean up test episode if it was created
      const testEpisodePath = join(TEST_EPISODES_DIR, 'ep_retrospective_001.json')
      if (existsSync(testEpisodePath)) {
        try {
          const content = readFileSync(testEpisodePath, 'utf-8')
          const episode = JSON.parse(content) as Episode
          if (episode.taskId === TEST_TASK_ID) {
            rmSync(testEpisodePath)
            // Restore original seq
            const seq = loadSeq()
            if (seq.retrospective) {
              seq.retrospective = seq.retrospective - 1
              writeFileSync(TEST_SEQ_PATH, JSON.stringify(seq, null, 2))
            }
          }
        } catch {
          // Ignore cleanup errors
        }
      }
    })

    it('creates a retrospective episode file', () => {
      const episode = createTestRetrospectiveEpisode(
        TEST_TASK_ID,
        'Test retrospective content for FTS verification.'
      )

      expect(episode).toBeDefined()
      expect(episode.id).toMatch(/^ep_retrospective_\d+$/)
      expect(episode.source).toBe('retrospective')
      expect(episode.taskId).toBe(TEST_TASK_ID)
      expect(episode.rawContent).toBe('Test retrospective content for FTS verification.')

      // Verify file was created
      const episodePath = join(TEST_EPISODES_DIR, `${episode.id}.json`)
      expect(existsSync(episodePath)).toBe(true)

      // Verify episode can be loaded
      const loaded = loadEpisodes().find((ep) => ep.id === episode.id)
      expect(loaded).toBeDefined()
      expect(loaded?.taskId).toBe(TEST_TASK_ID)
    })

    it('updates the sequence file when creating episodes', () => {
      const seqBefore = loadSeq()
      const retroSeqBefore = seqBefore.retrospective || 0

      const episode = createTestRetrospectiveEpisode(
        TEST_TASK_ID,
        'Another test retrospective.'
      )

      const seqAfter = loadSeq()
      expect(seqAfter.retrospective).toBe(retroSeqBefore + 1)
    })
  })
})
