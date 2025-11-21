// Database layer - Using in-memory storage for MVP
// In production, replace with PostgreSQL, MongoDB, or Supabase

export interface ConditionalRule {
  fieldId: string
  operator: "equals" | "not-equals" | "contains" | "greater-than" | "less-than"
  value: string | number | boolean
}

export interface FormField {
  id: string
  type: "text" | "email" | "phone" | "date" | "textarea" | "checkbox" | "radio" | "select" | "image" | "signature"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  order: number
  conditionalRules?: ConditionalRule[] // Show this field only if conditions are met
  calculation?: string // Formula for calculated fields (e.g., "field1 + field2")
}

export interface Form {
  id: string
  name: string
  description?: string
  fields: FormField[]
  userId?: string
  templateId?: string
  createdAt: string
  updatedAt: string
  isTemplate: boolean
  category?: string
}

export interface Submission {
  id: string
  formId: string
  formName: string
  submittedBy: string
  submittedAt: string
  status: "completed" | "pending" | "flagged"
  location?: string
  data: Record<string, any> // Field values
  images?: string[] // URLs to uploaded images
  signature?: string // Base64 signature data
}

export type UserRole = "admin" | "manager" | "field-worker" | "viewer"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

// In-memory storage (replace with real database in production)
class Database {
  private forms: Map<string, Form> = new Map()
  private submissions: Map<string, Submission> = new Map()
  private users: Map<string, User> = new Map()
  private nextFormId = 1
  private nextSubmissionId = 1
  private nextUserId = 1

  // Forms
  createForm(form: Omit<Form, "id" | "createdAt" | "updatedAt">): Form {
    const id = `form-${this.nextFormId++}`
    const now = new Date().toISOString()
    const newForm: Form = {
      ...form,
      id,
      createdAt: now,
      updatedAt: now,
    }
    this.forms.set(id, newForm)
    return newForm
  }

  getForm(id: string): Form | undefined {
    return this.forms.get(id)
  }

  getAllForms(userId?: string): Form[] {
    const forms = Array.from(this.forms.values())
    if (userId) {
      return forms.filter((f) => f.userId === userId)
    }
    return forms
  }

  getTemplates(): Form[] {
    return Array.from(this.forms.values()).filter((f) => f.isTemplate)
  }

  updateForm(id: string, updates: Partial<Form>): Form | null {
    const form = this.forms.get(id)
    if (!form) return null

    const updated: Form = {
      ...form,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.forms.set(id, updated)
    return updated
  }

  deleteForm(id: string): boolean {
    return this.forms.delete(id)
  }

  // Submissions
  createSubmission(submission: Omit<Submission, "id">): Submission {
    const id = `submission-${this.nextSubmissionId++}`
    const newSubmission: Submission = {
      ...submission,
      id,
    }
    this.submissions.set(id, newSubmission)
    return newSubmission
  }

  getSubmission(id: string): Submission | undefined {
    return this.submissions.get(id)
  }

  getAllSubmissions(formId?: string, userId?: string): Submission[] {
    let submissions = Array.from(this.submissions.values())
    
    if (formId) {
      submissions = submissions.filter((s) => s.formId === formId)
    }
    
    // In a real app, filter by userId through form ownership
    return submissions.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
  }

  searchSubmissions(query: string): Submission[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.submissions.values()).filter(
      (s) =>
        s.formName.toLowerCase().includes(lowerQuery) ||
        s.submittedBy.toLowerCase().includes(lowerQuery) ||
        s.location?.toLowerCase().includes(lowerQuery)
    )
  }

  filterSubmissions(status?: string, formId?: string): Submission[] {
    let submissions = Array.from(this.submissions.values())
    
    if (status) {
      submissions = submissions.filter((s) => s.status === status)
    }
    
    if (formId) {
      submissions = submissions.filter((s) => s.formId === formId)
    }
    
    return submissions.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
  }

  // Users
  createUser(user: Omit<User, "id" | "createdAt">): User {
    const id = `user-${this.nextUserId++}`
    const newUser: User = {
      ...user,
      role: user.role || "field-worker",
      id,
      createdAt: new Date().toISOString(),
    }
    this.users.set(id, newUser)
    return newUser
  }

  getUser(id: string): User | undefined {
    return this.users.get(id)
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email)
  }
}

// Singleton instance
export const db = new Database()

// Initialize with some default templates
function initializeTemplates() {
  const templates: Omit<Form, "id" | "createdAt" | "updatedAt">[] = [
    {
      name: "Safety Inspection",
      description: "Comprehensive safety inspection form for workplace and site assessments",
      category: "Safety",
      isTemplate: true,
      fields: [
        { id: "inspector", type: "text", label: "Inspector Name", required: true, placeholder: "Enter your name", order: 0 },
        { id: "email", type: "email", label: "Email Address", required: true, placeholder: "your.email@company.com", order: 1 },
        { id: "date", type: "date", label: "Inspection Date", required: true, order: 2 },
        { id: "location", type: "text", label: "Site Location", required: true, placeholder: "e.g., Building A - Floor 3", order: 3 },
        { id: "safety-equipment", type: "radio", label: "Safety Equipment Present?", required: true, options: ["Yes", "No", "Partially"], order: 4 },
        { id: "hazards", type: "textarea", label: "Hazards Identified", required: false, placeholder: "Describe any hazards or concerns...", order: 5 },
        { id: "checklist", type: "checkbox", label: "Safety Checklist", required: false, options: ["Fire Extinguishers", "Emergency Exits", "First Aid Kit", "Safety Signage"], order: 6 },
        { id: "rating", type: "select", label: "Overall Safety Rating", required: true, options: ["Excellent", "Good", "Fair", "Poor"], order: 7 },
        { id: "photo", type: "image", label: "Upload Photo (Optional)", required: false, order: 8 },
        { id: "signature", type: "signature", label: "Inspector Signature", required: true, order: 9 },
      ],
    },
    {
      name: "Work Order",
      description: "Track maintenance and repair tasks with detailed work order forms",
      category: "Maintenance",
      isTemplate: true,
      fields: [
        { id: "technician", type: "text", label: "Technician Name", required: true, order: 0 },
        { id: "work-date", type: "date", label: "Work Date", required: true, order: 1 },
        { id: "work-type", type: "select", label: "Work Type", required: true, options: ["Repair", "Maintenance", "Installation", "Inspection"], order: 2 },
        { id: "description", type: "textarea", label: "Work Description", required: true, order: 3 },
        { id: "parts", type: "textarea", label: "Parts Used", required: false, order: 4 },
        { id: "hours", type: "text", label: "Hours Worked", required: true, placeholder: "e.g., 2.5", order: 5 },
        { id: "photo", type: "image", label: "Before/After Photos", required: false, order: 6 },
        { id: "signature", type: "signature", label: "Customer Signature", required: true, order: 7 },
      ],
    },
    {
      name: "Daily Report",
      description: "Document daily activities, progress, and site conditions",
      category: "Reports",
      isTemplate: true,
      fields: [
        { id: "reporter", type: "text", label: "Reporter Name", required: true, order: 0 },
        { id: "date", type: "date", label: "Report Date", required: true, order: 1 },
        { id: "location", type: "text", label: "Site Location", required: true, order: 2 },
        { id: "activities", type: "textarea", label: "Activities Completed", required: true, order: 3 },
        { id: "progress", type: "textarea", label: "Progress Notes", required: false, order: 4 },
        { id: "issues", type: "textarea", label: "Issues Encountered", required: false, order: 5 },
        { id: "next-steps", type: "textarea", label: "Next Steps", required: false, order: 6 },
        { id: "photo", type: "image", label: "Progress Photos", required: false, order: 7 },
      ],
    },
  ]

  templates.forEach((template) => {
    db.createForm(template)
  })
}

// Initialize templates on module load
if (typeof window === "undefined") {
  initializeTemplates()
}

