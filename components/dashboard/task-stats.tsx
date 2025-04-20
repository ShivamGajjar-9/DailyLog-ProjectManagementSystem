"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TaskStatus } from "@prisma/client";

interface TaskCount {
  status: TaskStatus;
  count: number;
}

export function TaskStats({ workspaceId }: { workspaceId: string }) {
  const { data: taskStats } = useQuery({
    queryKey: ["task-stats", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspace/${workspaceId}/tasks/stats`);
      if (!res.ok) throw new Error("Failed to fetch task stats");
      return res.json() as Promise<TaskCount[]>;
    },
  });

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "TODO":
        return "text-blue-500";
      case "IN_PROGRESS":
        return "text-orange-500";
      case "COMPLETED":
        return "text-green-500";
      case "BLOCKED":
        return "text-red-500";
      case "IN_REVIEW":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {taskStats?.map((stat) => (
            <div key={stat.status} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(stat.status).replace('text-', 'bg-')}`} />
                <span>{formatStatus(stat.status)}</span>
              </div>
              <span className={`font-semibold ${getStatusColor(stat.status)}`}>
                {stat.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 