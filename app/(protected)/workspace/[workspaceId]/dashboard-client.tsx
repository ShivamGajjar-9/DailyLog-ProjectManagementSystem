"use client";

import { TaskStats } from "@/components/dashboard/task-stats";
import { TaskTrends } from "@/components/dashboard/task-trends";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProductivityCharts } from "@/components/dashboard/productivity-charts";

interface DashboardClientProps {
  workspaceId: string;
}

export default function DashboardClient({ workspaceId }: DashboardClientProps) {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="grid gap-6">
        {/* First row - Productivity Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <StatsCards workspaceId={workspaceId} />
          <TaskStats workspaceId={workspaceId} />
        </div>
        
        {/* Second row - Task Trends */}
        <ProductivityCharts workspaceId={workspaceId} />

        {/* Third row - Stats Cards */}
        <TaskTrends workspaceId={workspaceId} />
      </div>
    </div>
  );
} 