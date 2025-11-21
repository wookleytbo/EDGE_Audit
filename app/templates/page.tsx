"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, FileText, Wrench, AlertTriangle, Clipboard, Building, Truck, Zap, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import type { Form } from "@/lib/db"

const iconMap: Record<string, any> = {
  Safety: AlertTriangle,
  Maintenance: Wrench,
  Reports: FileText,
  Construction: Building,
  Logistics: Truck,
  Electrical: Zap,
  HR: FileText,
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Form[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Form[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchQuery, categoryFilter])

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/forms?templates=true")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.forms || [])
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = [...templates]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.category?.toLowerCase().includes(query)
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter)
    }

    setFilteredTemplates(filtered)
  }

  const categories = Array.from(new Set(templates.map((t) => t.category).filter(Boolean)))

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Form Templates</h1>
          <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Choose from professionally designed templates or start from scratch
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <Button
            variant={categoryFilter === "all" ? "outline" : "ghost"}
            onClick={() => setCategoryFilter("all")}
          >
            All Templates
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? "outline" : "ghost"}
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No templates found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredTemplates.map((template) => {
              const Icon = iconMap[template.category || ""] || FileText
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{template.fields.length} fields</span>
                      {template.category && (
                        <>
                          <span>•</span>
                          <span>{template.category}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent" asChild>
                      <Link href={`/templates/${template.id}/preview`}>Preview</Link>
                    </Button>
                    <Button className="flex-1" asChild>
                      <Link href={`/builder?template=${template.id}`}>Use Template</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        {/* Create from Scratch CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6 text-center py-12">
            <h3 className="text-2xl font-bold mb-2">Need Something Custom?</h3>
            <p className="text-lg mb-6 opacity-90">Start with a blank form and build exactly what you need</p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/builder">Create Blank Form</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
