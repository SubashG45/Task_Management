import { apiCall } from "./api"
import type { Task } from "@/components/task-dashboard"

export const taskAPI = {
  getTasks: async (): Promise<Task[]> => {
    return apiCall("/tasks")
  },

  createTask: async (task: Omit<Task, "id" | "createdAt" | "userId">): Promise<Task> => {
    return apiCall("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    })
  },

  updateTask: async (taskId: string, task: Partial<Task>): Promise<Task> => {
    return apiCall(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(task),
    })
  },

  deleteTask: async (taskId: string): Promise<void> => {
    console.log("Deleting task with ID:", taskId)
    return apiCall(`/tasks/${taskId}`, {
      method: "DELETE",
    })
  },

  toggleTaskStatus: async (taskId: string, status: "pending" | "completed"): Promise<Task> => {
    return apiCall(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  },

  downloadCsv: async (): Promise<void> => {
    return apiCall(`/tasks/export/csv`, {
      method: "GET",
    })
  },
}
