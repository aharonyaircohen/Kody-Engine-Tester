class TrieNode {
  children: Map<string, TrieNode>
  isEndOfWord: boolean

  constructor() {
    this.children = new Map()
    this.isEndOfWord = false
  }
}

export class Trie {
  private root: TrieNode

  constructor() {
    this.root = new TrieNode()
  }

  insert(word: string): void {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode())
      }
      node = node.children.get(char)!
    }
    node.isEndOfWord = true
  }

  search(word: string): boolean {
    let node = this.searchNode(word)
    return node !== null && node.isEndOfWord
  }

  startsWith(prefix: string): boolean {
    return this.searchNode(prefix) !== null
  }

  private searchNode(prefix: string): TrieNode | null {
    let node = this.root
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return null
      }
      node = node.children.get(char)!
    }
    return node
  }
}