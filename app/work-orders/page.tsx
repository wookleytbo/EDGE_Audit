"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, User, Plus, CheckCircle, AlertCircle, FileText, Loader2, MessageSquare } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-helpers"
import type { WorkOrder } from "@/lib/work-orders"
import type { Form } from "@/lib/db"

export default function WorkOrdersPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [newOrder, setNewOrder] = useState({
    formId: "",
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    dueDate: "",
    location: "",
  })
  const [newNote, setNewNote] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [ordersRes, formsRes] = await Promise.all([
        fetch("/api/work-orders"),
        fetch("/api/forms"),
      ])

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setWorkOrders(ordersData.workOrders || [])
      }

      if (formsRes.ok) {
        const formsData = await formsRes.json()
        setForms(formsData.forms?.filter((f: Form) => !f.isTemplate) || [])
      }
    } catch (error) {
      console.error("Error loading work orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateOrder = async () => {
    if (!newOrder.formId || !newOrder.title || !newOrder.assignedTo || !newOrder.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const form = forms.find((f) => f.id === newOrder.formId)
      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newOrder,
          formName: form?.name || "Unknown Form",
          createdBy: user?.name || user?.email || "System",
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Work order created successfully",
        })
        setIsDialogOpen(false)
        setNewOrder({
          formId: "",
          title: "",
          description: "",
          assignedTo: "",
          priority: "medium",
          dueDate: "",
          location: "",
        })
        loadData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create work order",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (orderId: string, status: WorkOrder["status"]) => {
    try {
      const response = await fetch(`/api/work-orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Work order updated successfully",
        })
        loadData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update work order",
        variant: "destructive",
      })
    }
  }

  const handleAddNote = async (orderId: string) => {
    if (!newNote.trim()) return

    try {
      const response = await fetch(`/api/work-orders/${orderId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Note added successfully",
        })
        setNewNote("")
        setSelectedOrder(null)
        loadData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: WorkOrder["status"]) => {
    const badges = {
      draft: <Badge variant="outline">Draft</Badge>,
      assigned: <Badge className="bg-blue-600 text-white">Assigned</Badge>,
      "in-progress": <Badge className="bg-amber-600 text-white">In Progress</Badge>,
      completed: <Badge className="bg-green-600 text-white">Completed</Badge>,
      cancelled: <Badge variant="destructive">Cancelled</Badge>,
    }
    return badges[status]
  }

  const getPriorityBadge = (priority: WorkOrder["priority"]) => {
    const badges = {
      low: <Badge variant="outline">Low</Badge>,
      medium: <Badge variant="secondary">Medium</Badge>,
      high: <Badge className="bg-orange-600 text-white">High</Badge>,
      urgent: <Badge variant="destructive">Urgent</Badge>,
    }
    return badges[priority]
  }

  const draftOrders = workOrders.filter((o) => o.status === "draft")
  const assignedOrders = workOrders.filter((o) => o.status === "assigned")
  const inProgressOrders = workOrders.filter((o) => o.status === "in-progress")
  const completedOrders = workOrders.filter((o) => o.status === "completed")

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Work Orders</h1>
            <p className="text-muted-foreground">Manage work orders from creation to completion</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Work Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Work Order</DialogTitle>
                <DialogDescription>Create a work order and assign it to a team member</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Form</Label>
                  <Select value={newOrder.formId} onValueChange={(value) => setNewOrder({ ...newOrder, formId: value })}>
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
                  <Label>Title *</Label>
                  <Input
                    value={newOrder.title}
                    onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
                    placeholder="Work order title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newOrder.description}
                    onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                    placeholder="Work order description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Assigned To *</Label>
                    <Input
                      value={newOrder.assignedTo}
                      onChange={(e) => setNewOrder({ ...newOrder, assignedTo: e.target.value })}
                      placeholder="Name or email"
                    />
                  </div>
                  <div>
                    <Label>Due Date *</Label>
                    <Input
                      type="datetime-local"
                      value={newOrder.dueDate}
                      onChange={(e) => setNewOrder({ ...newOrder, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newOrder.priority}
                      onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                        setNewOrder({ ...newOrder, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={newOrder.location}
                      onChange={(e) => setNewOrder({ ...newOrder, location: e.target.value })}
                      placeholder="e.g., Site A - Building 3"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOrder}>Create Work Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Draft</p>
                  <p className="text-3xl font-bold text-foreground">{draftOrders.length}</p>
                </div>
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assigned</p>
                  <p className="text-3xl font-bold text-foreground">{assignedOrders.length}</p>
                </div>
                <AlertCircle className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-foreground">{inProgressOrders.length}</p>
                </div>
                <Clock className="h-10 w-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-3xl font-bold text-foreground">{completedOrders.length}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Orders List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderOrdersList(workOrders)}
          </TabsContent>
          <TabsContent value="draft" className="space-y-4">
            {renderOrdersList(draftOrders)}
          </TabsContent>
          <TabsContent value="assigned" className="space-y-4">
            {renderOrdersList(assignedOrders)}
          </TabsContent>
          <TabsContent value="in-progress" className="space-y-4">
            {renderOrdersList(inProgressOrders)}
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            {renderOrdersList(completedOrders)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedOrder.title}</DialogTitle>
              <DialogDescription>{selectedOrder.formName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedOrder.priority)}</div>
                </div>
              </div>
              {selectedOrder.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1 text-sm">{selectedOrder.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Assigned To</Label>
                  <p className="mt-1 text-sm font-medium">{selectedOrder.assignedTo}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Due Date</Label>
                  <p className="mt-1 text-sm">{format(new Date(selectedOrder.dueDate), "MMM d, yyyy h:mm a")}</p>
                </div>
              </div>
              {selectedOrder.location && (
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="mt-1 text-sm">{selectedOrder.location}</p>
                </div>
              )}
              {selectedOrder.notes && selectedOrder.notes.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.notes.map((note, idx) => (
                      <div key={idx} className="text-sm bg-muted p-2 rounded">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>Add Note</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newNote.trim()) {
                        handleAddNote(selectedOrder.id)
                      }
                    }}
                  />
                  <Button onClick={() => handleAddNote(selectedOrder.id)}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                {selectedOrder.status === "draft" && (
                  <Button onClick={() => handleUpdateStatus(selectedOrder.id, "assigned")}>
                    Assign
                  </Button>
                )}
                {selectedOrder.status === "assigned" && (
                  <Button onClick={() => handleUpdateStatus(selectedOrder.id, "in-progress")}>
                    Start Work
                  </Button>
                )}
                {selectedOrder.status === "in-progress" && (
                  <Button onClick={() => handleUpdateStatus(selectedOrder.id, "completed")}>
                    Complete
                  </Button>
                )}
                {selectedOrder.submissionId && (
                  <Button variant="outline" asChild>
                    <a href={`/submissions/${selectedOrder.submissionId}`}>View Submission</a>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )

  function renderOrdersList(orders: WorkOrder[]) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (orders.length === 0) {
      return (
        <Card>
          <CardContent className="pt-12 pb-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No work orders found</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOrder(order)}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{order.title}</h3>
                    {getStatusBadge(order.status)}
                    {getPriorityBadge(order.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{order.formName}</p>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{order.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(order.dueDate), "MMM d, yyyy")}</span>
                    </div>
                    {order.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{order.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
}

