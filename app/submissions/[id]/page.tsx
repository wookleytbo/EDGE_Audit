"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText, MapPin, Calendar, User, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, use, useEffect } from "react"
import { format } from "date-fns"
import type { Submission } from "@/lib/db"
import { generatePDF, downloadPDF } from "@/lib/pdf-generator"

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [form, setForm] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSubmission()
  }, [id])

  const loadSubmission = async () => {
    try {
      const [submissionRes, formRes] = await Promise.all([
        fetch(`/api/submissions/${id}`),
        fetch(`/api/forms/${id}`).catch(() => null), // Try to get form, but don't fail if not found
      ])

      if (submissionRes.ok) {
        const data = await submissionRes.json()
        setSubmission(data.submission)
        
        // Load form if submission has formId
        if (data.submission?.formId && formRes) {
          const formData = await formRes.json()
          setForm(formData.form)
        }
      }
    } catch (error) {
      console.error("Error loading submission:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = () => {
    if (!submission || !form) return

    const html = generatePDF({
      title: submission.formName,
      data: submission.data,
      formFields: form.fields || [],
      submittedBy: submission.submittedBy,
      submittedAt: submission.submittedAt,
      location: submission.location,
    })

    downloadPDF(html, `${submission.formName}-${submission.id}`)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM d, yyyy h:mm a")
    } catch {
      return dateString
    }
  }

  const formatFieldValue = (value: any, type: string): string => {
    if (value === null || value === undefined) return "—"
    
    if (type === "checkbox" && Array.isArray(value)) {
      return value.join(", ")
    }
    
    if (type === "image" && Array.isArray(value)) {
      return `${value.length} image(s)`
    }
    
    if (type === "signature" && typeof value === "string" && value.startsWith("data:image")) {
      return "Signed"
    }
    
    return String(value)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-12 pb-8 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">Submission Not Found</h1>
              <p className="text-muted-foreground mb-8">The submission you're looking for doesn't exist.</p>
              <Button asChild>
                <Link href="/submissions">Back to Submissions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/submissions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Link>
        </Button>

        {/* Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">{submission.formName}</h1>
                </div>
                <Badge className="bg-green-600 text-white">Completed</Badge>
              </div>
              <Button onClick={handleExportPDF} disabled={!form}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Submitted By</p>
                  <p className="font-medium text-foreground">{submission.submittedBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium text-foreground">{formatDate(submission.submittedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{submission.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Form ID</p>
                  <p className="font-medium text-foreground">#{submission.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Data */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(submission.data).map(([key, value]) => {
                // Determine field type from value
                let fieldType = "text"
                if (Array.isArray(value)) {
                  if (value.length > 0 && typeof value[0] === "string" && value[0].startsWith("data:image")) {
                    fieldType = "image"
                  } else {
                    fieldType = "checkbox"
                  }
                } else if (typeof value === "string" && value.startsWith("data:image")) {
                  fieldType = "signature"
                }

                return (
                  <div key={key} className="border-b border-border pb-4 last:border-0">
                    <p className="text-sm font-medium text-muted-foreground mb-2">{key}</p>
                    {fieldType === "signature" ? (
                      <div className="bg-muted rounded-lg p-4">
                        <img src={value as string} alt="Signature" className="max-w-full h-auto" />
                      </div>
                    ) : fieldType === "image" ? (
                      <div className="grid grid-cols-2 gap-2">
                        {(value as string[]).map((url, index) => (
                          <img key={index} src={url} alt={`Image ${index + 1}`} className="w-full h-auto rounded" />
                        ))}
                      </div>
                    ) : typeof value === "string" && value.length > 100 ? (
                      <p className="text-foreground whitespace-pre-wrap">{value}</p>
                    ) : (
                      <p className="text-foreground font-medium">{formatFieldValue(value, fieldType)}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
