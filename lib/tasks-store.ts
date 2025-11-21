// Shared task store for scheduling
// In production, use database

export interface Task {
  id: string
  formId: string
  formName: string
  assignedTo: string
  dueDate: string
  status: "pending" | "in-progress" | "completed"
  location?: string
  priority: "low" | "medium" | "high"
  createdAt: string
}

class TaskStore {
  private tasks = new Map<string, Task>()
  private nextTaskId = 1

  create(task: Omit<Task, "id" | "createdAt">): Task {
    const newTask: Task = {
      ...task,
      id: `task-${this.nextTaskId++}`,
      createdAt: new Date().toISOString(),
    }
    this.tasks.set(newTask.id, newTask)
    return newTask
  }

  get(id: string): Task | undefined {
    return this.tasks.get(id)
  }

  getAll(): Task[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  update(id: string, updates: Partial<Task>): Task | null {
    const task = this.tasks.get(id)
    if (!task) return null

    const updated = { ...task, ...updates }
    this.tasks.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.tasks.delete(id)
  }
}

export const taskStore = new TaskStore()

