"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { FileText, Users, CheckCircle, Clock, TrendingUp, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import type { Submission, Form } from "@/lib/db"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export default function AnalyticsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [submissionsRes, formsRes] = await Promise.all([
        fetch("/api/submissions"),
        fetch("/api/forms"),
      ])

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json()
        setSubmissions(submissionsData.submissions || [])
      }

      if (formsRes.ok) {
        const formsData = await formsRes.json()
        setForms(formsData.forms || [])
      }
    } catch (error) {
      console.error("Error loading analytics data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate statistics
  const totalSubmissions = submissions.length
  const completedSubmissions = submissions.filter((s) => s.status === "completed").length
  const pendingSubmissions = submissions.filter((s) => s.status === "pending").length
  const flaggedSubmissions = submissions.filter((s) => s.status === "flagged").length
  const totalForms = forms.filter((f) => !f.isTemplate).length

  // Submissions by form
  const submissionsByForm = forms
    .filter((f) => !f.isTemplate)
    .map((form) => ({
      name: form.name,
      submissions: submissions.filter((s) => s.formId === form.id).length,
    }))
    .sort((a, b) => b.submissions - a.submissions)
    .slice(0, 10)

  // Submissions over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const submissionsOverTime = last7Days.map((date) => {
    const count = submissions.filter((s) => s.submittedAt.startsWith(date)).length
    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      submissions: count,
    }
  })

  // Status distribution
  const statusData = [
    { name: "Completed", value: completedSubmissions, color: "#00C49F" },
    { name: "Pending", value: pendingSubmissions, color: "#FFBB28" },
    { name: "Flagged", value: flaggedSubmissions, color: "#FF8042" },
  ]

  // Top submitters
  const topSubmitters = Object.entries(
    submissions.reduce((acc, s) => {
      acc[s.submittedBy] = (acc[s.submittedBy] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const stats = [
    {
      label: "Total Submissions",
      value: totalSubmissions.toString(),
      icon: FileText,
      color: "text-primary",
      change: "+12%",
    },
    {
      label: "Active Forms",
      value: totalForms.toString(),
      icon: FileText,
      color: "text-blue-600",
      change: "+3",
    },
    {
      label: "Completion Rate",
      value: totalSubmissions > 0 ? `${Math.round((completedSubmissions / totalSubmissions) * 100)}%` : "0%",
      icon: CheckCircle,
      color: "text-green-600",
      change: "+5%",
    },
    {
      label: "Avg. Response Time",
      value: "2.4h",
      icon: Clock,
      color: "text-amber-600",
      change: "-15min",
    },
  ]

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your form performance and insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                    </div>
                    <Icon className={`h-10 w-10 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submissions Over Time</CardTitle>
                  <CardDescription>Last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={submissionsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="submissions" stroke="#0088FE" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Current submission status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Submissions by Form</CardTitle>
                <CardDescription>Top performing forms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={submissionsByForm}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="submissions" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Submitters</CardTitle>
                <CardDescription>Most active users</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topSubmitters} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

