"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import EventCalendarComponent from "@/components/calendar/event-calendar";

interface CalendarContentProps {
  workspaceId: string;
  initialTasks: any[];
  initialMembers: any[];
}

export default function CalendarContent({
  workspaceId,
  initialTasks,
  initialMembers,
}: CalendarContentProps) {
  const [date, setDate] = useState<Date>(new Date());

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ["calendar-tasks", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspace/${workspaceId}/tasks`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    initialData: initialTasks,
  });

  const { data: members } = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspace/${workspaceId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
    initialData: initialMembers,
  });

  return (
    <div className="h-full">
      <EventCalendarComponent
        workspaceId={workspaceId}
        initialMembers={members}
        tasks={tasks}
        isLoading={isTasksLoading}
        onTasksChange={() => {}}
        project={{
          id: "",
          workspaceId: workspaceId,
          name: "",
        }}
      />
    </div>
  );
}
