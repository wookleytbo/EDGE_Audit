import { NextRequest, NextResponse } from "next/server"
import { db, type Form } from "@/lib/db"

// GET /api/forms - Get all forms (optionally filtered by userId)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const templatesOnly = searchParams.get("templates") === "true"

    let forms: Form[]

    if (templatesOnly) {
      forms = db.getTemplates()
    } else if (userId) {
      forms = db.getAllForms(userId)
    } else {
      forms = db.getAllForms()
    }

    return NextResponse.json({ forms })
  } catch (error) {
    console.error("Error fetching forms:", error)
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 })
  }
}

// POST /api/forms - Create a new form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, fields, userId, templateId, category, isTemplate } = body

    if (!name || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Name and fields are required" }, { status: 400 })
    }

    // Add order to fields if not present
    const orderedFields = fields.map((field: any, index: number) => ({
      ...field,
      order: field.order ?? index,
    }))

    const form = db.createForm({
      name,
      description,
      fields: orderedFields,
      userId,
      templateId,
      category,
      isTemplate: isTemplate ?? false,
    })

    return NextResponse.json({ form }, { status: 201 })
  } catch (error) {
    console.error("Error creating form:", error)
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 })
  }
}

