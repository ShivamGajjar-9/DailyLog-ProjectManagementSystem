"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TimelineCalendar } from "@/components/calendar/timeline-calendar";
import EventCalendarComponent from "@/components/calendar/event-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CalendarClientProps {
  workspaceId: string;
}

export default function CalendarClient({ workspaceId }: CalendarClientProps) {
  const [date, setDate] = useState<Date>(new Date());

  const { data: tasks } = useQuery({
    queryKey: ["calendar-tasks", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspace/${workspaceId}/tasks`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });

  const { data: members } = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspace/${workspaceId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
  });

  if (!tasks || !members) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Calendar</h1>
      
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="events">Event Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="h-[calc(100vh-12rem)]">
          <TimelineCalendar
            tasks={tasks}
            date={date}
            onDateChange={setDate}
            assignees={members}
          />
        </TabsContent>
        
        <TabsContent value="events" className="h-[calc(100vh-12rem)]">
          <div className="bg-card rounded-lg border p-4 h-full overflow-auto">
            <EventCalendarComponent />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 