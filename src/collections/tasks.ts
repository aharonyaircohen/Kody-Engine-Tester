export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string | null
  createdAt: Date
  updatedAt: Date
  order: number
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  assignee?: string | null
}

export type UpdateTaskInput = Partial<{
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string | null
  order: number
}>

export class TaskStore {
  private tasks: Map<string, Task> = new Map()

  getAll(): Task[] {
    return Array.from(this.tasks.values()).sort((a, b) => a.order - b.order)
  }

  getById(id: string): Task | null {
    return this.tasks.get(id) ?? null
  }

  create(input: CreateTaskInput): Task {
    const now = new Date()
    const maxOrder = this.getAll().reduce((max, t) => Math.max(max, t.order), -1)
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description ?? '',
      status: 'todo',
      priority: input.priority ?? 'medium',
      assignee: input.assignee ?? null,
      createdAt: now,
      updatedAt: now,
      order: maxOrder + 1,
    }
    this.tasks.set(task.id, task)
    return task
  }

  update(id: string, input: UpdateTaskInput): Task {
    const task = this.tasks.get(id)
    if (!task) {
      throw new Error(`Task with id "${id}" not found`)
    }
    const updated: Task = { ...task, ...input, updatedAt: new Date() }
    this.tasks.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.tasks.delete(id)
  }

  filterByStatus(status: TaskStatus): Task[] {
    return this.getAll().filter((t) => t.status === status)
  }

  filterByPriority(priority: TaskPriority): Task[] {
    return this.getAll().filter((t) => t.priority === priority)
  }

  filterByAssignee(assignee: string): Task[] {
    return this.getAll().filter((t) => t.assignee === assignee)
  }

  moveTask(id: string, newStatus: TaskStatus): Task {
    return this.update(id, { status: newStatus })
  }

  reorderInColumn(id: string, newOrder: number): Task {
    return this.update(id, { order: newOrder })
  }
}

export const taskStore = new TaskStore()
