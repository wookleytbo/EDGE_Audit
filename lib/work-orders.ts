// Work Order Management System
// In production, use database

export interface WorkOrder {
  id: string
  formId: string
  formName: string
  title: string
  description?: string
  assignedTo: string
  createdBy: string
  status: "draft" | "assigned" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  dueDate: string
  location?: string
  submissionId?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  notes?: string[]
}

class WorkOrderStore {
  private workOrders = new Map<string, WorkOrder>()
  private nextId = 1

  create(order: Omit<WorkOrder, "id" | "createdAt" | "updatedAt">): WorkOrder {
    const now = new Date().toISOString()
    const newOrder: WorkOrder = {
      ...order,
      id: `wo-${this.nextId++}`,
      createdAt: now,
      updatedAt: now,
    }
    this.workOrders.set(newOrder.id, newOrder)
    return newOrder
  }

  get(id: string): WorkOrder | undefined {
    return this.workOrders.get(id)
  }

  getAll(filters?: { status?: string; assignedTo?: string }): WorkOrder[] {
    let orders = Array.from(this.workOrders.values())

    if (filters?.status) {
      orders = orders.filter((o) => o.status === filters.status)
    }

    if (filters?.assignedTo) {
      orders = orders.filter((o) => o.assignedTo === filters.assignedTo)
    }

    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  update(id: string, updates: Partial<WorkOrder>): WorkOrder | null {
    const order = this.workOrders.get(id)
    if (!order) return null

    const updated: WorkOrder = {
      ...order,
      ...updates,
      updatedAt: new Date().toISOString(),
      completedAt: updates.status === "completed" ? new Date().toISOString() : order.completedAt,
    }
    this.workOrders.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.workOrders.delete(id)
  }

  addNote(id: string, note: string): WorkOrder | null {
    const order = this.workOrders.get(id)
    if (!order) return null

    const notes = order.notes || []
    notes.push(`${new Date().toISOString()}: ${note}`)

    return this.update(id, { notes })
  }
}

export const workOrderStore = new WorkOrderStore()

