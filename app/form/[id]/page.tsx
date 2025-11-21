"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SignaturePad } from "@/components/signature-pad"
import { useToast } from "@/hooks/use-toast"
import { FileText, CheckCircle, Upload, Loader2, X } from "lucide-react"
import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { FormField } from "@/lib/db"
import { getVisibleFields, evaluateCalculation } from "@/lib/conditional-logic"

export default function FormSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState<any>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [images, setImages] = useState<Record<string, string[]>>({})
  const [signatures, setSignatures] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    loadForm()
    captureLocation()
  }, [id])

  const captureLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLocation(`${lat}, ${lng}`)
          
          // Reverse geocode to get address (in production, use a geocoding service)
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.locality && data.countryName) {
                setLocation(`${data.locality}, ${data.countryName}`)
              }
            })
            .catch(() => {
              // Fallback to coordinates
            })
        },
        () => {
          // Location access denied or unavailable
          setLocation("Location not available")
        }
      )
    }
  }

  const loadForm = async () => {
    try {
      const response = await fetch(`/api/forms/${id}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data.form)
      } else {
        toast({
          title: "Error",
          description: "Failed to load form",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load form",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (fieldId: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setImages((prev) => ({
          ...prev,
          [fieldId]: [...(prev[fieldId] || []), data.url],
        }))
      } else {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    }
  }

  const removeImage = (fieldId: string, index: number) => {
    setImages((prev) => ({
      ...prev,
      [fieldId]: prev[fieldId]?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Collect all form data
      const submissionData: Record<string, any> = { ...formData }
      
      // Add images
      Object.keys(images).forEach((fieldId) => {
        submissionData[fieldId] = images[fieldId]
      })

      // Add signatures
      Object.keys(signatures).forEach((fieldId) => {
        submissionData[fieldId] = signatures[fieldId]
      })

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: id,
          formName: form.name,
          submittedBy: formData["submittedBy"] || formData["inspector"] || formData["reporter"] || "Anonymous",
          location: formData["location"] || formData["siteLocation"] || location || "",
          data: { ...submissionData, _gpsLocation: location },
          images: Object.values(images).flat(),
          signature: Object.values(signatures)[0] || null,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast({
          title: "Success",
          description: "Form submitted successfully",
        })
      } else {
        throw new Error("Failed to submit")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Form Not Found</h1>
            <p className="text-muted-foreground mb-8">The form you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-8">
            <div className="rounded-full bg-green-100 w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Form Submitted Successfully!</h1>
            <p className="text-muted-foreground mb-8">Your submission has been received and saved to the cloud.</p>
            <Button onClick={() => router.push("/submissions")} className="w-full">
              View All Submissions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Form Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{form.name}</CardTitle>
              </div>
            </div>
            {form.description && <p className="text-muted-foreground">{form.description}</p>}
          </CardHeader>
        </Card>

        {/* Form Fields */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardContent className="pt-6 space-y-6">
              {getVisibleFields(
                form.fields.sort((a: FormField, b: FormField) => a.order - b.order),
                formData
              ).map((field: FormField) => {
                // Calculate value if field has calculation formula
                let fieldValue = formData[field.id] || ""
                if (field.calculation && field.type === "text") {
                  const calculated = evaluateCalculation(field.calculation, formData)
                  if (calculated !== 0) {
                    fieldValue = String(calculated)
                  }
                }
                  <div key={field.id}>
                    <Label className="text-base font-medium">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>

                    {field.type === "text" || field.type === "email" || field.type === "phone" ? (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="mt-2"
                        value={fieldValue}
                        onChange={(e) => {
                          if (!field.calculation) {
                            setFormData({ ...formData, [field.id]: e.target.value })
                          }
                        }}
                        disabled={!!field.calculation}
                        readOnly={!!field.calculation}
                      />
                    ) : field.type === "date" ? (
                      <Input
                        type="date"
                        required={field.required}
                        className="mt-2"
                        value={formData[field.id] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      />
                    ) : field.type === "textarea" ? (
                      <Textarea
                        placeholder={field.placeholder}
                        required={field.required}
                        className="mt-2"
                        rows={4}
                        value={formData[field.id] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      />
                    ) : field.type === "radio" ? (
                      <div className="mt-3 space-y-2">
                        {field.options?.map((option) => (
                          <div key={option} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={field.id}
                              id={`${field.id}-${option}`}
                              required={field.required}
                              className="h-4 w-4"
                              value={option}
                              checked={formData[field.id] === option}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            />
                            <label htmlFor={`${field.id}-${option}`} className="text-sm cursor-pointer">
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : field.type === "checkbox" ? (
                      <div className="mt-3 space-y-2">
                        {field.options?.map((option) => {
                          const checked = (formData[field.id] as string[])?.includes(option) || false
                          return (
                            <div key={option} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`${field.id}-${option}`}
                                className="h-4 w-4"
                                checked={checked}
                                onChange={(e) => {
                                  const current = (formData[field.id] as string[]) || []
                                  const updated = e.target.checked
                                    ? [...current, option]
                                    : current.filter((o) => o !== option)
                                  setFormData({ ...formData, [field.id]: updated })
                                }}
                              />
                              <label htmlFor={`${field.id}-${option}`} className="text-sm cursor-pointer">
                                {option}
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    ) : field.type === "select" ? (
                      <select
                        required={field.required}
                        className="mt-2 w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={formData[field.id] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      >
                        <option value="">Select an option...</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "image" ? (
                      <div className="mt-2 space-y-2">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:bg-muted/50 transition-colors">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                          <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleImageUpload(field.id, file)
                              }
                            }}
                          />
                        </label>
                        {images[field.id] && images[field.id].length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {images[field.id].map((url, index) => (
                              <div key={index} className="relative">
                                <img src={url} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover rounded" />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0"
                                  onClick={() => removeImage(field.id, index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : field.type === "signature" ? (
                      <div className="mt-2">
                        <SignaturePad
                          onSave={(signature) => setSignatures({ ...signatures, [field.id]: signature })}
                          value={signatures[field.id]}
                        />
                      </div>
                    ) : null}
                  </div>
                })}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Form"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
