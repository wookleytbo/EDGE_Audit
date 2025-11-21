import { NextRequest, NextResponse } from "next/server"
import { workOrderStore } from "@/lib/work-orders"

// GET /api/work-orders
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status")
  const assignedTo = searchParams.get("assignedTo")

  const orders = workOrderStore.getAll({
    status: status || undefined,
    assignedTo: assignedTo || undefined,
  })

  return NextResponse.json({ workOrders: orders })
}

// POST /api/work-orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, formName, title, description, assignedTo, createdBy, priority, dueDate, location } = body

    if (!formId || !formName || !title || !assignedTo || !createdBy || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const workOrder = workOrderStore.create({
      formId,
      formName,
      title,
      description,
      assignedTo,
      createdBy,
      status: "draft",
      priority: priority || "medium",
      dueDate,
      location,
    })

    // Send email notification when status is "assigned"
    if (workOrder.status === "assigned") {
      try {
        await sendEmail(
          generateTaskAssignmentEmail(
            assignedTo,
            title,
            formName,
            dueDate,
            location
          )
        )
      } catch (error) {
        console.error("Failed to send email notification:", error)
      }
    }

    return NextResponse.json({ workOrder }, { status: 201 })
  } catch (error) {
    console.error("Error creating work order:", error)
    return NextResponse.json({ error: "Failed to create work order" }, { status: 500 })
  }
}

