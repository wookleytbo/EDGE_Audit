import { NextRequest, NextResponse } from "next/server"
import { db, type Submission } from "@/lib/db"
import { sendEmail, generateSubmissionNotificationEmail } from "@/lib/email-service"

// GET /api/submissions - Get all submissions (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const formId = searchParams.get("formId")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")

    let submissions: Submission[]

    if (search) {
      submissions = db.searchSubmissions(search)
    } else {
      submissions = db.filterSubmissions(status || undefined, formId || undefined)
    }

    // In a real app, filter by userId through form ownership
    // For now, return all submissions

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}

// POST /api/submissions - Create a new submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, formName, submittedBy, location, data, images, signature } = body

    if (!formId || !formName || !submittedBy || !data) {
      return NextResponse.json(
        { error: "formId, formName, submittedBy, and data are required" },
        { status: 400 }
      )
    }

      const submission = db.createSubmission({
        formId,
        formName,
        submittedBy,
        submittedAt: new Date().toISOString(),
        status: "completed",
        location,
        data,
        images,
        signature,
      })

      // Send email notification (in production, get recipient from form owner)
      try {
        await sendEmail(
          generateSubmissionNotificationEmail(
            "admin@example.com", // In production, get from form owner
            formName,
            submittedBy,
            submission.submittedAt
          )
        )
      } catch (error) {
        console.error("Failed to send email notification:", error)
        // Don't fail the submission if email fails
      }

      return NextResponse.json({ submission }, { status: 201 })
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
  }
}

