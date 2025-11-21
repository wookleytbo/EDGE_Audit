import { NextRequest, NextResponse } from "next/server"
import { workOrderStore } from "@/lib/work-orders"

// GET /api/work-orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const workOrder = workOrderStore.get(id)

  if (!workOrder) {
    return NextResponse.json({ error: "Work order not found" }, { status: 404 })
  }

  return NextResponse.json({ workOrder })
}

// PUT /api/work-orders/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = workOrderStore.get(id)
    if (!existing) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 })
    }

    const updated = workOrderStore.update(id, body)

    if (!updated) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 })
    }

    // Send email notification when status changes to "assigned"
    if (existing.status !== "assigned" && updated.status === "assigned") {
      try {
        await sendEmail(
          generateTaskAssignmentEmail(
            updated.assignedTo,
            updated.title,
            updated.formName,
            updated.dueDate,
            updated.location
          )
        )
      } catch (error) {
        console.error("Failed to send email notification:", error)
      }
    }

    return NextResponse.json({ workOrder: updated })
  } catch (error) {
    console.error("Error updating work order:", error)
    return NextResponse.json({ error: "Failed to update work order" }, { status: 500 })
  }
}

// DELETE /api/work-orders/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = workOrderStore.delete(id)

  if (!deleted) {
    return NextResponse.json({ error: "Work order not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

