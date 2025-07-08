"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskForm } from "@/components/task-form"
import { TaskCard } from "@/components/task-card"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Download, LogOut, User, RefreshCw } from "lucide-react"
import { taskAPI } from "@/lib/task-api"
import { apiCall } from "@/lib/api"

export interface Task {
  _id?: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "completed"
  dueDate: string
  completed?: boolean
  createdAt: string
  updatedAt?: string
  userId: string
  __v?: number
}

// Helper function to normalize task data from API
const normalizeTask = (apiTask: any): Task => {
  return {
    _id: apiTask._id,
    title: apiTask.title,
    description: apiTask.description,
    priority: apiTask.priority,
    status: apiTask.status,
    dueDate: apiTask.dueDate,
    completed: apiTask.completed,
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt,
    userId: apiTask.userId,
    __v: apiTask.__v,
  }
}

export function TaskDashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load tasks from API
  const loadTasks = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setIsRefreshing(true)
      const apiTasks = await taskAPI.getTasks()
      // Normalize the tasks from API response
      const normalizedTasks = apiTasks.map(normalizeTask)
      setTasks(normalizedTasks)
      setFilteredTasks(normalizedTasks)
    } catch (error) {
      console.error("Failed to load tasks:", error)
      toast({
        title: "Error loading tasks",
        description: "Failed to load your tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      if (showRefreshIndicator) setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

  // Filter tasks based on search and filters
  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || task.status === statusFilter
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, statusFilter, priorityFilter])

  const handleCreateTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "userId" | "_id" | "updatedAt" | "__v">,
  ) => {
    try {
      const apiTask = await taskAPI.createTask(taskData)
      const normalizedTask = normalizeTask(apiTask)
      setTasks((prev) => [...prev, normalizedTask])
      setShowTaskForm(false)

      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      })
    } catch (error) {
      console.error("Failed to create task:", error)
      toast({
        title: "Error creating task",
        description: "Failed to create your task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "userId" | "_id" | "updatedAt" | "__v">,
  ) => {
    if (!editingTask) return

    try {
      const taskId = editingTask._id;
      const apiTask = await taskAPI.updateTask(taskId, taskData)
      const normalizedTask = normalizeTask(apiTask)

      setTasks((prev) => prev.map((task) => (task._id === editingTask._id ? normalizedTask : task)))
      setEditingTask(null)
      setShowTaskForm(false)

      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update task:", error)
      toast({
        title: "Error updating task",
        description: "Failed to update your task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Find the task to get the _id
      const task = tasks.find((t) => t._id === taskId)
      const apiTaskId = task?._id || taskId

      await taskAPI.deleteTask(apiTaskId)
      setTasks((prev) => prev.filter((task) => task._id !== taskId))

      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete task:", error)
      toast({
        title: "Error deleting task",
        description: "Failed to delete your task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId)
    if (!task) return

    const newStatus = task.status === "completed" ? "pending" : "completed"

    try {
      // Use _id for API call if available, otherwise use id
      const apiTaskId = task._id || taskId
      const apiTask = await taskAPI.toggleTaskStatus(apiTaskId, newStatus)
      const normalizedTask = normalizeTask(apiTask)

      setTasks((prev) => prev.map((t) => (t._id === taskId ? normalizedTask : t)))

      toast({
        title: "Task updated",
        description: `Task marked as ${newStatus}.`,
      })
    } catch (error) {
      console.error("Failed to toggle task status:", error)
      toast({
        title: "Error updating task",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // const exportToCSV = () => {
  //   const csvContent = [
  //     ["Title", "Description", "Priority", "Status", "Due Date", "Created At", "Updated At"],
  //     ...filteredTasks.map((task) => [
  //       task.title,
  //       task.description,
  //       task.priority,
  //       task.status,
  //       new Date(task.dueDate).toLocaleDateString(),
  //       new Date(task.createdAt).toLocaleDateString(),
  //       task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : "",
  //     ]),
  //   ]
  //     .map((row) => row.map((field) => `"${field}"`).join(","))
  //     .join("\n")

  //   const blob = new Blob([csvContent], { type: "text/csv" })
  //   const url = window.URL.createObjectURL(blob)
  //   const a = document.createElement("a")
  //   a.href = url
  //   a.download = "tasks.csv"
  //   a.click()
  //   window.URL.revokeObjectURL(url)

  //   toast({
  //     title: "Export successful",
  //     description: "Your tasks have been exported to CSV.",
  //   })
  // }


  const exportToCSV = async () => {
    try {
      const blob = await taskAPI.downloadCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tasks.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Your tasks have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };


  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const pendingTasks = tasks.filter((task) => task.status === "pending").length
  const highPriorityTasks = tasks.filter((task) => task.priority === "high" && task.status === "pending").length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadTasks(true)}
                disabled={isRefreshing}
                className="flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.username}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{highPriorityTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => setShowTaskForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
              </div>
              {tasks.length === 0 && (
                <Button onClick={() => setShowTaskForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first task
                </Button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={(task) => {
                  setEditingTask(task)
                  setShowTaskForm(true)
                }}
                onDelete={handleDeleteTask}
                onToggleStatus={handleToggleStatus}
              />
            ))
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}
