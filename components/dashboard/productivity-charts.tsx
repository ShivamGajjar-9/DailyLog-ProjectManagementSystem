"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { PieChart, Pie, Cell as PieCell } from "recharts";

interface ProductivityChartsProps {
  workspaceId: string;
}

export function ProductivityCharts({ workspaceId }: ProductivityChartsProps) {
  const { data: stats } = useQuery({
    queryKey: ["workspace-productivity", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspace/${workspaceId}/productivity`);
      if (!res.ok) throw new Error("Failed to fetch productivity stats");
      return res.json();
    },
  });

  const taskStatusData = [
    { name: "To Do", value: stats?.todoCount ?? 0, color: "#3b82f6" },
    { name: "In Progress", value: stats?.inProgressCount ?? 0, color: "#f59e0b" },
    { name: "Completed", value: stats?.completedCount ?? 0, color: "#10b981" },
    { name: "Blocked", value: stats?.blockedCount ?? 0, color: "#ef4444" },
  ];

  const priorityData = [
    { name: "Low", count: stats?.lowPriorityCount ?? 0 },
    { name: "Medium", count: stats?.mediumPriorityCount ?? 0 },
    { name: "High", count: stats?.highPriorityCount ?? 0 },
    { name: "Critical", count: stats?.criticalPriorityCount ?? 0 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <PieCell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count">
                  {priorityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? "#3b82f6"
                          : index === 1
                          ? "#f59e0b"
                          : index === 2
                          ? "#ef4444"
                          : "#dc2626"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 