"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, MoreVertical, Edit, Trash2, Clock } from "lucide-react"
import type { Task } from "@/components/task-dashboard"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onToggleStatus: (taskId: string) => void
}

export function TaskCard({ task, onEdit, onDelete, onToggleStatus }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "completed"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-blue-100 text-blue-800 border-blue-200"
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status === "pending"

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDelete(task._id)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Card className={`transition-all hover:shadow-md ${task.status === "completed" ? "opacity-75" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              checked={task.status === "completed"}
              onCheckedChange={() => onToggleStatus(task.id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <CardTitle
                className={`text-lg leading-tight ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
              >
                {task.title}
              </CardTitle>
              {task.description && <CardDescription className="mt-1 text-sm">{task.description}</CardDescription>}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Badge variant="outline" className={getStatusColor(task.status)}>
              {task.status}
            </Badge>
          </div>
          <div className={`flex items-center text-sm ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(task.dueDate)}
          </div>
        </div>

        {/* Additional MongoDB fields */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Created: {formatDateTime(task.createdAt)}
          </div>
          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Updated: {formatDateTime(task.updatedAt)}
            </div>
          )}
        </div>

        {isOverdue && <div className="mt-2 text-xs text-red-600 font-medium">Overdue</div>}
      </CardContent>
    </Card>
  )
}
