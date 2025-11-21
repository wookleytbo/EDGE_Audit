import { NextRequest, NextResponse } from "next/server"

// POST /api/upload - Handle image uploads
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Convert file to base64 for storage
    // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // Generate a unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`

    return NextResponse.json({
      url: dataUrl,
      filename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

