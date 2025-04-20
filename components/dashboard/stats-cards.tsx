"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, AlertCircle, Layers } from "lucide-react";

interface StatsCardsProps {
  workspaceId: string;
}

export function StatsCards({ workspaceId }: StatsCardsProps) {
  const { data: stats } = useQuery({
    queryKey: ["workspace-stats", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspace/${workspaceId}/stats`);
      if (!res.ok) throw new Error("Failed to fetch workspace stats");
      return res.json();
    },
  });

  const items = [
    {
      title: "Total Tasks",
      value: stats?.totalTasks ?? 0,
      icon: Layers,
      color: "text-blue-500",
    },
    {
      title: "In Progress",
      value: stats?.inProgressCount ?? 0,
      icon: Clock,
      color: "text-orange-500",
    },
    {
      title: "Completed",
      value: stats?.completedCount ?? 0,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Blocked",
      value: stats?.blockedCount ?? 0,
      icon: AlertCircle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 