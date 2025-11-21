"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import type { ConditionalRule, FormField } from "@/lib/db"

interface ConditionalRulesEditorProps {
  field: FormField
  allFields: FormField[]
  onUpdate: (rules: ConditionalRule[]) => void
}

export function ConditionalRulesEditor({ field, allFields, onUpdate }: ConditionalRulesEditorProps) {
  const rules = field.conditionalRules || []

  const addRule = () => {
    const otherFields = allFields.filter((f) => f.id !== field.id)
    if (otherFields.length === 0) return

    onUpdate([
      ...rules,
      {
        fieldId: otherFields[0].id,
        operator: "equals",
        value: "",
      },
    ])
  }

  const updateRule = (index: number, updates: Partial<ConditionalRule>) => {
    const updated = [...rules]
    updated[index] = { ...updated[index], ...updates }
    onUpdate(updated)
  }

  const removeRule = (index: number) => {
    onUpdate(rules.filter((_, i) => i !== index))
  }

  const otherFields = allFields.filter((f) => f.id !== field.id)

  return (
    <div className="space-y-2">
      <Label className="text-sm">Show this field when:</Label>
      {rules.length === 0 ? (
        <p className="text-xs text-muted-foreground">No conditions (always visible)</p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded">
              <Select value={rule.fieldId} onValueChange={(value) => updateRule(index, { fieldId: value })}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {otherFields.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={rule.operator} onValueChange={(value: any) => updateRule(index, { operator: value })}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">equals</SelectItem>
                  <SelectItem value="not-equals">not equals</SelectItem>
                  <SelectItem value="contains">contains</SelectItem>
                  <SelectItem value="greater-than">greater than</SelectItem>
                  <SelectItem value="less-than">less than</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={String(rule.value)}
                onChange={(e) => updateRule(index, { value: e.target.value })}
                placeholder="Value"
                className="flex-1"
              />
              <Button variant="ghost" size="sm" onClick={() => removeRule(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {otherFields.length > 0 && (
        <Button variant="outline" size="sm" onClick={addRule} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Condition
        </Button>
      )}
      {rules.length > 0 && (
        <p className="text-xs text-muted-foreground">All conditions must be met (AND logic)</p>
      )}
    </div>
  )
}

