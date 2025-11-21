import { NextRequest, NextResponse } from "next/server"
import { workOrderStore } from "@/lib/work-orders"

// POST /api/work-orders/[id]/notes
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { note } = body

    if (!note) {
      return NextResponse.json({ error: "Note is required" }, { status: 400 })
    }

    const updated = workOrderStore.addNote(id, note)

    if (!updated) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 })
    }

    return NextResponse.json({ workOrder: updated })
  } catch (error) {
    console.error("Error adding note:", error)
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 })
  }
}

