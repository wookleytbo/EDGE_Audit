"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Download, Filter, Eye, MoreVertical, FileText, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import type { Submission } from "@/lib/db"

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-600 text-white">Completed</Badge>
    case "pending":
      return <Badge className="bg-amber-600 text-white">Pending</Badge>
    case "flagged":
      return <Badge className="bg-red-600 text-white">Flagged</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    flagged: 0,
  })

  useEffect(() => {
    loadSubmissions()
  }, [])

  useEffect(() => {
    filterSubmissions()
  }, [submissions, searchQuery, statusFilter])

  const loadSubmissions = async () => {
    try {
      const response = await fetch("/api/submissions")
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
        
        // Calculate stats
        const total = data.submissions.length
        const completed = data.submissions.filter((s: Submission) => s.status === "completed").length
        const pending = data.submissions.filter((s: Submission) => s.status === "pending").length
        const flagged = data.submissions.filter((s: Submission) => s.status === "flagged").length
        
        setStats({ total, completed, pending, flagged })
      }
    } catch (error) {
      console.error("Error loading submissions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterSubmissions = () => {
    let filtered = [...submissions]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.formName.toLowerCase().includes(query) ||
          s.submittedBy.toLowerCase().includes(query) ||
          s.location?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter)
    }

    setFilteredSubmissions(filtered)
  }

  const handleExport = () => {
    // Simple CSV export
    const headers = ["Form Name", "Submitted By", "Location", "Date & Time", "Status"]
    const rows = filteredSubmissions.map((s) => [
      s.formName,
      s.submittedBy,
      s.location || "",
      s.submittedAt,
      s.status,
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `submissions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM d, yyyy h:mm a")
    } catch {
      return dateString
    }
  }

  const statsData = [
    {
      label: "Total Submissions",
      value: stats.total.toString(),
      icon: FileText,
      color: "text-primary",
    },
    {
      label: "Completed",
      value: stats.completed.toString(),
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Pending Review",
      value: stats.pending.toString(),
      icon: Clock,
      color: "text-amber-600",
    },
    {
      label: "Flagged",
      value: stats.flagged.toString(),
      icon: AlertCircle,
      color: "text-red-600",
    },
  ]

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Form Submissions</h1>
          <p className="text-muted-foreground">View and manage all submitted forms</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <Icon className={`h-10 w-10 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>
              {filteredSubmissions.length} {filteredSubmissions.length === 1 ? "submission" : "submissions"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No submissions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Form Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Submitted By</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Date & Time</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{submission.formName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">{submission.submittedBy}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{submission.location || "—"}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(submission.submittedAt)}</td>
                        <td className="py-3 px-4">{getStatusBadge(submission.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/submissions/${submission.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
