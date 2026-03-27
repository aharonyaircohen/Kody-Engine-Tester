export class DependencyGraph<T = unknown> {
  private nodes = new Map<string, T | undefined>()
  private edges = new Map<string, Set<string>>() // from -> set of to (dependencies)

  addNode(id: string, data?: T): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, data)
      this.edges.set(id, new Set())
    } else if (data !== undefined) {
      this.nodes.set(id, data)
    }
  }

  addDependency(from: string, to: string): void {
    if (!this.nodes.has(from)) this.addNode(from)
    if (!this.nodes.has(to)) this.addNode(to)
    this.edges.get(from)!.add(to)
  }

  sort(): string[] {
    const visited = new Set<string>()
    const inStack = new Set<string>()
    const result: string[] = []

    const visit = (id: string): void => {
      if (inStack.has(id)) {
        throw new Error(`Circular dependency detected involving node: ${id}`)
      }
      if (visited.has(id)) return

      inStack.add(id)
      for (const dep of this.edges.get(id) ?? []) {
        visit(dep)
      }
      inStack.delete(id)
      visited.add(id)
      result.push(id)
    }

    for (const id of this.nodes.keys()) {
      visit(id)
    }

    return result
  }

  dependenciesOf(id: string): string[] {
    if (!this.nodes.has(id)) throw new Error(`Node not found: ${id}`)
    const result = new Set<string>()
    const queue = [...(this.edges.get(id) ?? [])]
    while (queue.length > 0) {
      const dep = queue.shift()!
      if (!result.has(dep)) {
        result.add(dep)
        for (const transitive of this.edges.get(dep) ?? []) {
          queue.push(transitive)
        }
      }
    }
    return [...result]
  }

  dependantsOf(id: string): string[] {
    if (!this.nodes.has(id)) throw new Error(`Node not found: ${id}`)
    const result = new Set<string>()
    const queue: string[] = []

    for (const [node, deps] of this.edges) {
      if (deps.has(id)) queue.push(node)
    }

    while (queue.length > 0) {
      const dep = queue.shift()!
      if (!result.has(dep)) {
        result.add(dep)
        for (const [node, deps] of this.edges) {
          if (deps.has(dep) && !result.has(node)) queue.push(node)
        }
      }
    }

    return [...result]
  }

  hasCycle(): boolean {
    try {
      this.sort()
      return false
    } catch {
      return true
    }
  }
}
