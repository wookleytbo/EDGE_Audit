import { NextRequest, NextResponse } from "next/server"
import { taskStore } from "@/lib/tasks-store"

// GET /api/scheduling/tasks/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const task = taskStore.get(id)

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  return NextResponse.json({ task })
}

// PUT /api/scheduling/tasks/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updatedTask = taskStore.update(id, body)

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

// DELETE /api/scheduling/tasks/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = taskStore.delete(id)

  if (!deleted) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

