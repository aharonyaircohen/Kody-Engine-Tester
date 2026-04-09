export interface FtsVocabularyEntry {
  docCount: number
  idf: number
}

export interface FtsVocabulary {
  [term: string]: FtsVocabularyEntry
}

export interface FtsDocument {
  taskId: string
  episodeId: string
  source: string
  content: string
  createdAt: string
  wordCount: number
  positions: number[]
}

export interface FtsDocuments {
  [episodeId: string]: FtsDocument
}

export interface FtsIndex {
  vocabulary: FtsVocabulary
  documents: FtsDocuments
  totalDocs: number
}

export interface Episode {
  id: string
  runId: string
  source: string
  taskId: string
  createdAt: string
  rawContent: string
  extractedNodeIds: string[]
  linkedFiles: string[]
}
