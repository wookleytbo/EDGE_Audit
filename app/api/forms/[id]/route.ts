import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/forms/[id] - Get a specific form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const form = db.getForm(id)

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json({ form })
  } catch (error) {
    console.error("Error fetching form:", error)
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 })
  }
}

// PUT /api/forms/[id] - Update a form
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Add order to fields if updating fields
    if (body.fields && Array.isArray(body.fields)) {
      body.fields = body.fields.map((field: any, index: number) => ({
        ...field,
        order: field.order ?? index,
      }))
    }

    const updatedForm = db.updateForm(id, body)

    if (!updatedForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json({ form: updatedForm })
  } catch (error) {
    console.error("Error updating form:", error)
    return NextResponse.json({ error: "Failed to update form" }, { status: 500 })
  }
}

// DELETE /api/forms/[id] - Delete a form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = db.deleteForm(id)

    if (!deleted) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting form:", error)
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 })
  }
}

