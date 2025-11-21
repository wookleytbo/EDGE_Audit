// Conditional Logic Engine for Forms
// Evaluates field visibility and calculations based on form data

import type { FormField, ConditionalRule } from "./db"

export function evaluateCondition(rule: ConditionalRule, formData: Record<string, any>): boolean {
  const fieldValue = formData[rule.fieldId]

  if (fieldValue === undefined || fieldValue === null) {
    return false
  }

  switch (rule.operator) {
    case "equals":
      return String(fieldValue) === String(rule.value)
    case "not-equals":
      return String(fieldValue) !== String(rule.value)
    case "contains":
      return String(fieldValue).toLowerCase().includes(String(rule.value).toLowerCase())
    case "greater-than":
      return Number(fieldValue) > Number(rule.value)
    case "less-than":
      return Number(fieldValue) < Number(rule.value)
    default:
      return false
  }
}

export function shouldShowField(field: FormField, formData: Record<string, any>): boolean {
  // If no conditional rules, always show
  if (!field.conditionalRules || field.conditionalRules.length === 0) {
    return true
  }

  // All conditions must be met (AND logic)
  return field.conditionalRules.every((rule) => evaluateCondition(rule, formData))
}

export function evaluateCalculation(formula: string, formData: Record<string, any>): number {
  try {
    // Replace field IDs with their values
    let expression = formula
    const fieldMatches = formula.match(/field\[['"]([^'"]+)['"]\]/g) || []

    for (const match of fieldMatches) {
      const fieldId = match.match(/['"]([^'"]+)['"]/)?.[1]
      if (fieldId) {
        const value = formData[fieldId] || 0
        expression = expression.replace(match, String(value))
      }
    }

    // Simple evaluation (in production, use a safer math evaluator)
    // Only allow basic arithmetic operations
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, "")
    return Function(`"use strict"; return (${sanitized})`)()
  } catch (error) {
    console.error("Calculation error:", error)
    return 0
  }
}

export function getVisibleFields(fields: FormField[], formData: Record<string, any>): FormField[] {
  return fields.filter((field) => shouldShowField(field, formData))
}

