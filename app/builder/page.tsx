"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ConditionalRulesEditor } from "@/components/conditional-rules-editor"
import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  Circle,
  List,
  ImageIcon,
  FileSignature,
  Trash2,
  Eye,
  Save,
  GripVertical,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import type { ConditionalRule } from "@/lib/db"

type FieldType =
  | "text"
  | "email"
  | "phone"
  | "date"
  | "textarea"
  | "checkbox"
  | "radio"
  | "select"
  | "image"
  | "signature"

interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  order: number
}

const fieldTypes = [
  { type: "text" as FieldType, icon: Type, label: "Short Text" },
  { type: "textarea" as FieldType, icon: AlignLeft, label: "Long Text" },
  { type: "email" as FieldType, icon: Mail, label: "Email" },
  { type: "phone" as FieldType, icon: Phone, label: "Phone" },
  { type: "date" as FieldType, icon: Calendar, label: "Date" },
  { type: "checkbox" as FieldType, icon: CheckSquare, label: "Checkbox" },
  { type: "radio" as FieldType, icon: Circle, label: "Radio" },
  { type: "select" as FieldType, icon: List, label: "Dropdown" },
  { type: "image" as FieldType, icon: ImageIcon, label: "Image Upload" },
  { type: "signature" as FieldType, icon: FileSignature, label: "Signature" },
]

export default function BuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [formId, setFormId] = useState<string | null>(null)
  const [formName, setFormName] = useState("Untitled Form")
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [draggedField, setDraggedField] = useState<string | null>(null)

  // Load form or template on mount
  useEffect(() => {
    const templateId = searchParams.get("template")
    const formIdParam = searchParams.get("formId")
    
    if (templateId) {
      loadTemplate(templateId)
    } else if (formIdParam) {
      loadForm(formIdParam)
    }
  }, [searchParams])

  const loadTemplate = async (templateId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/forms/${templateId}`)
      if (response.ok) {
        const data = await response.json()
        const form = data.form
        setFormName(`${form.name} (Copy)`)
        setFormFields(form.fields.map((f: any) => ({ ...f, id: `field-${Date.now()}-${Math.random()}` })))
        toast({
          title: "Template loaded",
          description: "You can now customize this template",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadForm = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/forms/${id}`)
      if (response.ok) {
        const data = await response.json()
        const form = data.form
        setFormId(form.id)
        setFormName(form.name)
        setFormFields(form.fields)
        toast({
          title: "Form loaded",
          description: "You can now edit this form",
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

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: "",
      required: false,
      options: type === "radio" || type === "select" ? ["Option 1", "Option 2"] : undefined,
      order: formFields.length,
    }
    setFormFields([...formFields, newField])
    setSelectedField(newField.id)
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormFields(formFields.map((field) => (field.id === id ? { ...field, ...updates } : field)))
  }

  const deleteField = (id: string) => {
    const updatedFields = formFields.filter((field) => field.id !== id)
    // Reorder remaining fields
    const reorderedFields = updatedFields.map((field, index) => ({ ...field, order: index }))
    setFormFields(reorderedFields)
    if (selectedField === id) {
      setSelectedField(null)
    }
  }

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...formFields]
    const [moved] = newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, moved)
    // Update order
    const reorderedFields = newFields.map((field, index) => ({ ...field, order: index }))
    setFormFields(reorderedFields)
  }

  const handleSave = async () => {
    if (!formName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a form name",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const formData = {
        name: formName,
        fields: formFields,
        isTemplate: false,
      }

      const url = formId ? `/api/forms/${formId}` : "/api/forms"
      const method = formId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        if (!formId) {
          setFormId(data.form.id)
          router.push(`/builder?formId=${data.form.id}`)
        }
        toast({
          title: "Success",
          description: "Form saved successfully",
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    if (formFields.length === 0) {
      toast({
        title: "No fields",
        description: "Add at least one field to preview",
        variant: "destructive",
      })
      return
    }
    // Save form first, then preview
    handleSave().then(() => {
      if (formId) {
        router.push(`/form/${formId}`)
      }
    })
  }

  const selectedFieldData = formFields.find((f) => f.id === selectedField)

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      {/* Top Toolbar */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="max-w-xs font-semibold" />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview} disabled={isSaving || isLoading}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Form
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[240px_1fr_280px] gap-6">
          {/* Field Types Panel */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">Add Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {fieldTypes.map((fieldType) => {
                const Icon = fieldType.icon
                return (
                  <button
                    key={fieldType.type}
                    onClick={() => addField(fieldType.type)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{fieldType.label}</span>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {/* Form Canvas */}
          <Card className="min-h-[600px]">
            <CardContent className="pt-6">
              {formFields.length === 0 ? (
                <div className="text-center py-20">
                  <Type className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Start Building Your Form</h3>
                  <p className="text-muted-foreground">Select a field type from the left panel to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formFields
                    .sort((a, b) => a.order - b.order)
                    .map((field, index) => (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={() => setDraggedField(field.id)}
                        onDragOver={(e) => {
                          e.preventDefault()
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const targetIndex = formFields.findIndex((f) => f.id === field.id)
                          const draggedIndex = formFields.findIndex((f) => f.id === draggedField)
                          if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
                            moveField(draggedIndex, targetIndex)
                          }
                          setDraggedField(null)
                        }}
                        onClick={() => setSelectedField(field.id)}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer group ${
                          selectedField === field.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-move" />
                          <Label className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteField(field.id)
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {field.type === "textarea" ? (
                        <Textarea placeholder={field.placeholder} disabled />
                      ) : field.type === "checkbox" ? (
                        <div className="space-y-2">
                          {field.options?.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input type="checkbox" disabled />
                              <span className="text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      ) : field.type === "radio" ? (
                        <div className="space-y-2">
                          {field.options?.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input type="radio" disabled />
                              <span className="text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      ) : field.type === "select" ? (
                        <select disabled className="w-full px-3 py-2 border rounded-md">
                          <option>{field.placeholder || "Select..."}</option>
                          {field.options?.map((option, idx) => (
                            <option key={idx}>{option}</option>
                          ))}
                        </select>
                      ) : field.type === "image" ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Upload Image</p>
                        </div>
                      ) : field.type === "signature" ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                          <FileSignature className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Sign Here</p>
                        </div>
                      ) : (
                        <Input type={field.type} placeholder={field.placeholder} disabled />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Field Properties Panel */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">Field Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFieldData ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Field Label</Label>
                    <Input
                      value={selectedFieldData.label}
                      onChange={(e) => updateField(selectedField!, { label: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {!["image", "signature", "checkbox", "radio", "select"].includes(selectedFieldData.type) && (
                    <div>
                      <Label className="text-sm">Placeholder</Label>
                      <Input
                        value={selectedFieldData.placeholder}
                        onChange={(e) => updateField(selectedField!, { placeholder: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  )}

                  {(selectedFieldData.type === "checkbox" ||
                    selectedFieldData.type === "radio" ||
                    selectedFieldData.type === "select") && (
                    <div>
                      <Label className="text-sm">Options</Label>
                      <Textarea
                        value={selectedFieldData.options?.join("\n")}
                        onChange={(e) =>
                          updateField(selectedField!, {
                            options: e.target.value.split("\n").filter((o) => o.trim()),
                          })
                        }
                        placeholder="One option per line"
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={selectedFieldData.required}
                      onChange={(e) => updateField(selectedField!, { required: e.target.checked })}
                    />
                    <Label htmlFor="required" className="text-sm cursor-pointer">
                      Required field
                    </Label>
                  </div>

                  {selectedFieldData.type === "text" && (
                    <div>
                      <Label className="text-sm">Calculation Formula (Optional)</Label>
                      <Input
                        value={selectedFieldData.calculation || ""}
                        onChange={(e) =>
                          updateField(selectedField!, {
                            calculation: e.target.value || undefined,
                          })
                        }
                        placeholder="e.g., field['quantity'] * field['price']"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use field['fieldId'] to reference other fields
                      </p>
                    </div>
                  )}

                  <div>
                    <ConditionalRulesEditor
                      field={selectedFieldData}
                      allFields={formFields}
                      onUpdate={(rules: ConditionalRule[]) => updateField(selectedField!, { conditionalRules: rules })}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select a field to edit its properties</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
