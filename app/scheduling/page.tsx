"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, User, Plus, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import type { Form } from "@/lib/db"

interface Task {
  id: string
  formId: string
  formName: string
  assignedTo: string
  dueDate: string
  status: "pending" | "in-progress" | "completed"
  location?: string
  priority: "low" | "medium" | "high"
  createdAt: string
}

export default function SchedulingPage() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    formId: "",
    assignedTo: "",
    dueDate: "",
    location: "",
    priority: "medium" as "low" | "medium" | "high",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tasksRes, formsRes] = await Promise.all([
        fetch("/api/scheduling/tasks"),
        fetch("/api/forms"),
      ])

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks || [])
      }

      if (formsRes.ok) {
        const formsData = await formsRes.json()
        setForms(formsData.forms?.filter((f: Form) => !f.isTemplate) || [])
      }
    } catch (error) {
      console.error("Error loading scheduling data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.formId || !newTask.assignedTo || !newTask.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const form = forms.find((f) => f.id === newTask.formId)
      const response = await fetch("/api/scheduling/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          formName: form?.name || "Unknown Form",
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Task created successfully",
        })
        setIsDialogOpen(false)
        setNewTask({
          formId: "",
          assignedTo: "",
          dueDate: "",
          location: "",
          priority: "medium",
        })
        loadData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      const response = await fetch(`/api/scheduling/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Task updated successfully",
        })
        loadData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600 text-white">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-600 text-white">In Progress</Badge>
      case "pending":
        return <Badge className="bg-amber-600 text-white">Pending</Badge>
    }
  }

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="secondary">Medium</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
    }
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending")
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Task Scheduling</h1>
            <p className="text-muted-foreground">Assign and manage form completion tasks</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Assign a form to a team member with a due date</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Form</Label>
                  <Select value={newTask.formId} onValueChange={(value) => setNewTask({ ...newTask, formId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a form" />
                    </SelectTrigger>
                    <SelectContent>
                      {forms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <Input
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    placeholder="Enter name or email"
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="datetime-local"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Location (Optional)</Label>
                  <Input
                    value={newTask.location}
                    onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                    placeholder="e.g., Site A - Building 3"
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setNewTask({ ...newTask, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Tasks</p>
                  <p className="text-3xl font-bold text-foreground">{pendingTasks.length}</p>
                </div>
                <AlertCircle className="h-10 w-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-foreground">{inProgressTasks.length}</p>
                </div>
                <Clock className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-3xl font-bold text-foreground">{completedTasks.length}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tasks scheduled</p>
                  <p className="text-sm text-muted-foreground mt-2">Create your first task to get started</p>
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => {
                const form = forms.find((f) => f.id === task.formId)
                return (
                  <Card key={task.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{task.formName}</h3>
                            {getStatusBadge(task.status)}
                            {getPriorityBadge(task.priority)}
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{task.assignedTo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(task.dueDate), "MMM d, yyyy h:mm a")}</span>
                            </div>
                            {task.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{task.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateTaskStatus(task.id, "in-progress")}
                            >
                              Start
                            </Button>
                          )}
                          {task.status === "in-progress" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

