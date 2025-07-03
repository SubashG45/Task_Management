"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { TaskDashboard } from "@/components/task-dashboard"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <TaskDashboard />
    </ProtectedRoute>
  )
}
