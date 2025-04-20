"use client";

import { Task } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { useState } from "react";

interface TimelineCalendarProps {
  tasks: Task[];
  date: Date;
  onDateChange: (date: Date) => void;
  assignees: any[];
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

export function TimelineCalendar({
  tasks,
  date,
  onDateChange,
  assignees,
}: TimelineCalendarProps) {
  const [view, setView] = useState<"month" | "week" | "day">("day");

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(date);
    if (direction === "prev") {
      switch (view) {
        case "month":
          newDate.setMonth(newDate.getMonth() - 1);
          break;
        case "week":
          newDate.setDate(newDate.getDate() - 7);
          break;
        case "day":
          newDate.setDate(newDate.getDate() - 1);
          break;
      }
    } else {
      switch (view) {
        case "month":
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case "week":
          newDate.setDate(newDate.getDate() + 7);
          break;
        case "day":
          newDate.setDate(newDate.getDate() + 1);
          break;
      }
    }
    onDateChange(newDate);
  };

  const getTasksForHourAndAssignee = (hour: number, assigneeId: string) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getHours() === hour &&
        (task.assignedTo?.id === assigneeId ||
          (!task.assignedTo && !assigneeId)) &&
        isSameDay(taskDate, date)
      );
    });
  };

  const getTaskColor = (status: TaskStatus) => {
    switch (status) {
      case "TODO":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20";
      case "IN_PROGRESS":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/20";
      case "COMPLETED":
        return "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20";
      case "BLOCKED":
        return "bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20";
      case "IN_REVIEW":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20";
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(date, "EEEE, d MMMM yyyy")}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "month" ? "default" : "outline"}
            onClick={() => setView("month")}
            size="sm"
          >
            Month
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
            size="sm"
          >
            Week
          </Button>
          <Button
            variant={view === "day" ? "default" : "outline"}
            onClick={() => setView("day")}
            size="sm"
          >
            Day
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <ScrollArea className="flex-1">
        <div className="flex min-h-[600px]">
          {/* Time Column */}
          <div className="flex flex-col border-r min-w-[100px] bg-muted/50">
            <div className="h-16 border-b flex items-center justify-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-20 border-b px-4 py-2 text-sm text-muted-foreground flex items-center justify-center"
              >
                {format(new Date().setHours(hour, 0), "h:mm a")}
              </div>
            ))}
          </div>

          {/* Assignee Columns */}
          <div className="flex flex-1">
            {assignees.map((assignee) => (
              <div key={assignee.id} className="flex-1 min-w-[200px]">
                {/* Assignee Header */}
                <div className="h-16 border-b border-r p-3 bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={assignee.image} />
                      <AvatarFallback>
                        {assignee.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium truncate">
                        {assignee.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {assignee.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Slots */}
                {HOURS.map((hour) => {
                  const hourTasks = getTasksForHourAndAssignee(
                    hour,
                    assignee.id
                  );
                  return (
                    <div
                      key={`${assignee.id}-${hour}`}
                      className="h-20 border-b border-r p-1.5 relative group hover:bg-muted/50 transition-colors"
                    >
                      {hourTasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "absolute inset-x-1.5 rounded-md p-2 text-sm border transition-colors cursor-pointer",
                            getTaskColor(task.status)
                          )}
                          style={{
                            top: "4px",
                            minHeight: "32px",
                          }}
                        >
                          <div className="font-medium truncate">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-xs truncate opacity-70">
                              {task.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
