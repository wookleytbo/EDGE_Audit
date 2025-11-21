import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"

export default async function TemplatePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Example template data
  const template = {
    id,
    name: "Safety Inspection Template",
    description: "Preview of the safety inspection form template",
    fields: [
      { label: "Inspector Name", type: "text", required: true },
      { label: "Email Address", type: "email", required: true },
      { label: "Inspection Date", type: "date", required: true },
      { label: "Site Location", type: "text", required: true },
      { label: "Safety Equipment Present?", type: "radio", required: true, options: ["Yes", "No", "Partially"] },
      { label: "Hazards Identified", type: "textarea", required: false },
      {
        label: "Safety Checklist",
        type: "checkbox",
        options: ["Fire Extinguishers", "Emergency Exits", "First Aid Kit"],
      },
      { label: "Overall Rating", type: "select", required: true, options: ["Excellent", "Good", "Fair", "Poor"] },
    ],
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/templates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Link>
        </Button>

        {/* Preview Header */}
        <Card className="mb-6 border-2 border-primary">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Preview Mode - Form is read-only</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Preview Fields */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-6">
            {template.fields.map((field, index) => (
              <div key={index}>
                <Label className="text-base font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>

                {field.type === "text" || field.type === "email" ? (
                  <Input type={field.type} disabled className="mt-2" />
                ) : field.type === "date" ? (
                  <Input type="date" disabled className="mt-2" />
                ) : field.type === "textarea" ? (
                  <Textarea disabled className="mt-2" rows={4} />
                ) : field.type === "radio" ? (
                  <div className="mt-3 space-y-2">
                    {field.options?.map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <input type="radio" disabled className="h-4 w-4" />
                        <span className="text-sm">{option}</span>
                      </div>
                    ))}
                  </div>
                ) : field.type === "checkbox" ? (
                  <div className="mt-3 space-y-2">
                    {field.options?.map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <input type="checkbox" disabled className="h-4 w-4" />
                        <span className="text-sm">{option}</span>
                      </div>
                    ))}
                  </div>
                ) : field.type === "select" ? (
                  <select disabled className="mt-2 w-full px-3 py-2 border border-input rounded-md bg-background">
                    <option>Select an option...</option>
                    {field.options?.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 bg-transparent" asChild>
            <Link href="/templates">Back to Templates</Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href={`/builder?template=${id}`}>Use This Template</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
