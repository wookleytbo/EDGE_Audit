// Email Notification Service
// In production, integrate with SendGrid, Resend, or similar

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // In production, call your email service API
  // For now, log to console and return success
  
  console.log("Email would be sent:", {
    to: options.to,
    subject: options.subject,
    html: options.html,
  })

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100))

  return true
}

export function generateTaskAssignmentEmail(
  assignedTo: string,
  workOrderTitle: string,
  formName: string,
  dueDate: string,
  location?: string
): EmailOptions {
  return {
    to: assignedTo,
    subject: `New Work Order Assigned: ${workOrderTitle}`,
    html: `
      <h2>New Work Order Assigned</h2>
      <p>You have been assigned a new work order:</p>
      <ul>
        <li><strong>Title:</strong> ${workOrderTitle}</li>
        <li><strong>Form:</strong> ${formName}</li>
        <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleString()}</li>
        ${location ? `<li><strong>Location:</strong> ${location}</li>` : ""}
      </ul>
      <p>Please complete this work order by the due date.</p>
    `,
    text: `New Work Order: ${workOrderTitle}\nForm: ${formName}\nDue: ${new Date(dueDate).toLocaleString()}`,
  }
}

export function generateSubmissionNotificationEmail(
  recipient: string,
  formName: string,
  submittedBy: string,
  submittedAt: string
): EmailOptions {
  return {
    to: recipient,
    subject: `New Submission: ${formName}`,
    html: `
      <h2>New Form Submission</h2>
      <p>A new submission has been received:</p>
      <ul>
        <li><strong>Form:</strong> ${formName}</li>
        <li><strong>Submitted by:</strong> ${submittedBy}</li>
        <li><strong>Date:</strong> ${new Date(submittedAt).toLocaleString()}</li>
      </ul>
      <p>Please review the submission in your dashboard.</p>
    `,
    text: `New Submission: ${formName}\nSubmitted by: ${submittedBy}\nDate: ${new Date(submittedAt).toLocaleString()}`,
  }
}

