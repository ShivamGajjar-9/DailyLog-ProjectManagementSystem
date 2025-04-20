"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { subWeeks, format } from "date-fns";

interface TaskTrend {
  date: string;
  completed: number;
  created: number;
}

export function TaskTrends({ workspaceId }: { workspaceId: string }) {
  const { data: trends } = useQuery({
    queryKey: ["task-trends", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspace/${workspaceId}/tasks/trends`);
      if (!res.ok) throw new Error("Failed to fetch task trends");
      return res.json() as Promise<TaskTrend[]>;
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Task Completion Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trends}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date), "MMMM d, yyyy")}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                  name="Tasks Completed"
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorEfficiency)"
                  name="Tasks Created"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Daily Task Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trends}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date), "MMMM d, yyyy")}
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorCreated)"
                  name="Tasks Created"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorCompleted2)"
                  name="Tasks Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 