// PDF Generation Utility
// In production, use a library like jsPDF or pdfkit

export interface PDFOptions {
  title: string
  data: Record<string, any>
  formFields: Array<{ id: string; label: string; type: string }>
  submittedBy?: string
  submittedAt?: string
  location?: string
}

export function generatePDF(options: PDFOptions): string {
  // Generate HTML that can be printed as PDF
  // In production, use jsPDF or similar library
  
  const { title, data, formFields, submittedBy, submittedAt, location } = options

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .field { margin: 15px 0; }
        .label { font-weight: bold; color: #666; }
        .value { margin-top: 5px; padding: 8px; background: #f5f5f5; border-radius: 4px; }
        .meta { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #888; }
        img { max-width: 100%; height: auto; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
  `

  formFields.forEach((field) => {
    const value = data[field.id]
    if (value !== undefined && value !== null && value !== "") {
      html += `
        <div class="field">
          <div class="label">${field.label}</div>
          <div class="value">
      `

      if (field.type === "image" && Array.isArray(value)) {
        value.forEach((url: string) => {
          html += `<img src="${url}" alt="Image" />`
        })
      } else if (field.type === "signature" && typeof value === "string" && value.startsWith("data:image")) {
        html += `<img src="${value}" alt="Signature" style="max-width: 300px;" />`
      } else if (Array.isArray(value)) {
        html += value.join(", ")
      } else {
        html += String(value).replace(/\n/g, "<br>")
      }

      html += `
          </div>
        </div>
      `
    }
  })

  if (submittedBy || submittedAt || location) {
    html += `
      <div class="meta">
      ${submittedBy ? `<div>Submitted by: ${submittedBy}</div>` : ""}
      ${submittedAt ? `<div>Date: ${new Date(submittedAt).toLocaleString()}</div>` : ""}
      ${location ? `<div>Location: ${location}</div>` : ""}
    </div>`
  }

  html += `
    </body>
    </html>
  `

  return html
}

export function downloadPDF(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.html`
  link.click()
  window.URL.revokeObjectURL(url)
}

