import { NextRequest, NextResponse } from "next/server"
import { taskStore } from "@/lib/tasks-store"

// GET /api/scheduling/tasks
export async function GET(request: NextRequest) {
  const tasks = taskStore.getAll()
  return NextResponse.json({ tasks })
}

// POST /api/scheduling/tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, formName, assignedTo, dueDate, location, priority } = body

    if (!formId || !formName || !assignedTo || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const task = taskStore.create({
      formId,
      formName,
      assignedTo,
      dueDate,
      status: "pending",
      location,
      priority: priority || "medium",
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

