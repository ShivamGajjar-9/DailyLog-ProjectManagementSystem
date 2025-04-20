"use client";

import { TaskStats } from "@/components/dashboard/task-stats";
import { TaskTrends } from "@/components/dashboard/task-trends";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProductivityCharts } from "@/components/dashboard/productivity-charts";
import { use } from "react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingState() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  );
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="container mx-auto py-6">
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <h2 className="text-lg font-semibold text-destructive">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-destructive">{error.message}</p>
      </div>
    </div>
  );
}

export default function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingState />}>
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
      </Suspense>
    </ErrorBoundary>
  );
}
