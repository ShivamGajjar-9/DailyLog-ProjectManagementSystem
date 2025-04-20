"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Loader2, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { Spinner } from "@/components/ui/spinner";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { DeleteTask } from "@/components/task/delete-task";

interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
  priority: string;
  description?: string;
  projectId: string;
  assignedTo: {
    name: string | null;
    image?: string;
  } | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  color: string;
  task: Task;
}

interface Props {
  workspaceId: string;
  initialMembers: any[];
  tasks: Task[];
  isLoading: boolean;
  onTasksChange: () => void;
  project: {
    id: string;
    workspaceId: string;
    name: string;
  };
}

const localizer = momentLocalizer(moment);

export default function EventCalendarComponent({
  workspaceId,
  initialMembers,
  tasks: initialTasks,
  isLoading: initialLoading,
  onTasksChange,
  project,
}: Props) {
  const params = useParams();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchTasks();
    }
  }, [workspaceId]);

  useEffect(() => {
    const fetchFirstProject = async () => {
      try {
        const response = await fetch(`/api/workspace/${workspaceId}/projects`);
        const data = await response.json();

        if (response.ok && data.length > 0) {
          setSelectedProject(data[0]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchFirstProject();
  }, [workspaceId]);

  // Add useEffect for periodic task refresh
  useEffect(() => {
    // Initial fetch
    if (workspaceId) {
      fetchTasks();
    }

    // Set up interval for periodic refresh (every 30 seconds)
    const intervalId = setInterval(() => {
      if (workspaceId) {
        fetchTasks();
      }
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [workspaceId]);

  const fetchTasks = useCallback(async () => {
    if (!workspaceId) {
      setError("Workspace ID is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/workspace/${workspaceId}/tasks`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format from server");
      }

      // Filter out tasks without due dates and convert to calendar events
      const calendarEvents = data
        .filter(
          (task) =>
            task.dueDate && new Date(task.dueDate).toString() !== "Invalid Date"
        )
        .map((task) => ({
          id: task.id,
          title: task.title,
          date: new Date(task.dueDate),
          time: new Date(task.dueDate).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          color: getTaskColor(task.priority || "default"),
          task: task,
        }));

      setEvents(calendarEvents);
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch tasks";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  const getTaskColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-rose-500 text-white border-rose-600 hover:bg-rose-600";
      case "medium":
        return "bg-amber-500 text-white border-amber-600 hover:bg-amber-600";
      case "low":
        return "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600";
      default:
        return "bg-blue-500 text-white border-blue-600 hover:bg-blue-600";
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
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
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateHeader = () => {
    switch (view) {
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "week":
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
        return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  const getDayEvents = (day: number) => {
    return events.filter(
      (event) =>
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const handleDrop = async (date: Date) => {
    if (!draggedEvent) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/workspace/${workspaceId}/tasks/${draggedEvent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dueDate: date.toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to update task date`);
      }

      await fetchTasks(); // Immediately fetch updated tasks
      toast.success("Task date updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update task date";
      toast.error(errorMessage);
    } finally {
      setDraggedEvent(null);
      setIsLoading(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const renderDraggableTask = (event: CalendarEvent) => (
    <div
      key={event.id}
      className={cn(
        "rounded-md px-3 py-2 text-sm border shadow-sm transition-all cursor-pointer",
        "hover:shadow-md active:shadow-lg",
        event.color
      )}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        setDraggedEvent(event);
      }}
      onDragEnd={() => setDraggedEvent(null)}
      onClick={() => handleTaskClick(event.task)}
    >
      <div className="font-medium leading-none mb-1">{event.title}</div>
      {event.time && (
        <div className="text-xs opacity-90 mt-1">{event.time}</div>
      )}
    </div>
  );

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Add day names
    daysOfWeek.forEach((day) => {
      days.push(
        <div
          key={`header-${day}`}
          className="text-sm font-semibold text-muted-foreground p-3 text-center border-b bg-muted/10"
        >
          {day}
        </div>
      );
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="p-3 border border-border/50 bg-muted/5 min-h-[120px]"
        >
          <span className="text-muted-foreground/50">
            {new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              0
            ).getDate() -
              firstDayOfMonth +
              i +
              1}
          </span>
        </div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayEvents = getDayEvents(day);
      const isToday = isSameDay(currentDay, new Date());

      days.push(
        <div
          key={day}
          className={cn(
            "p-3 border border-border/50 min-h-[120px] transition-colors",
            isToday ? "bg-accent/20" : "hover:bg-muted/5"
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(currentDay);
          }}
        >
          <div
            className={cn(
              "font-medium mb-1 text-sm rounded-full w-7 h-7 flex items-center justify-center",
              isToday ? "bg-primary text-primary-foreground" : ""
            )}
          >
            {day}
          </div>
          <div className="space-y-1.5">
            {dayEvents.map((event) => renderDraggableTask(event))}
          </div>
        </div>
      );
    }

    // Add empty cells for days after the last day of the month
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;
    for (let i = daysInMonth + firstDayOfMonth; i < totalCells; i++) {
      days.push(
        <div
          key={`empty-end-${i}`}
          className="p-3 border border-border/50 bg-muted/5 min-h-[120px]"
        >
          <span className="text-muted-foreground/50">
            {i - daysInMonth - firstDayOfMonth + 1}
          </span>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden bg-sky-50/50">
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden bg-sky-50/50">
        {/* Week header */}
        {days.map((day) => (
          <div
            key={`header-${day.toISOString()}`}
            className="text-sm font-semibold text-muted-foreground p-3 text-center border-b bg-muted/10"
          >
            {format(day, "EEE d")}
          </div>
        ))}

        {/* Week content */}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "bg-sky-50/50 p-3 min-h-[200px] border-r",
              isSameDay(day, new Date()) && "bg-accent/20"
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(day);
            }}
          >
            <div className="space-y-2">
              {events
                .filter((event) => isSameDay(new Date(event.date), day))
                .map((event) => renderDraggableTask(event))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div className="flex flex-col h-full bg-sky-50/50 rounded-lg border overflow-hidden">
        {/* Day header */}
        <div className="text-lg font-semibold p-4 border-b bg-muted/10 text-center">
          {format(currentDate, "EEEE, MMMM d")}
        </div>

        {/* Time slots */}
        <div className="flex-1 overflow-y-auto">
          {HOURS.map((hour) => {
            const slotDate = new Date(currentDate);
            slotDate.setHours(hour, 0, 0, 0);

            // Get tasks for this hour
            const hourTasks = events.filter((event) => {
              const eventHour = event.date.getHours();
              return eventHour === hour && isSameDay(event.date, currentDate);
            });

            return (
              <div
                key={hour}
                className="flex border-b min-h-[100px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(slotDate);
                }}
              >
                <div className="w-24 p-3 border-r bg-muted/5 text-sm text-muted-foreground flex items-center justify-center">
                  {format(slotDate, "h:mm a")}
                </div>
                <div className="flex-1 p-2 space-y-1">
                  {hourTasks.map((event) => renderDraggableTask(event))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Calendar Header */}
      <div className="flex items-center justify-between mb-4 bg-sky-50/50 p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <h2 className="text-lg font-semibold ml-4">{formatDateHeader()}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "month" ? "default" : "outline"}
            onClick={() => setView("month")}
            size="sm"
            className={view === "month" ? "bg-sky-600 hover:bg-sky-700" : ""}
          >
            Month
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
            size="sm"
            className={view === "week" ? "bg-sky-600 hover:bg-sky-700" : ""}
          >
            Week
          </Button>
          <Button
            variant={view === "day" ? "default" : "outline"}
            onClick={() => setView("day")}
            size="sm"
            className={view === "day" ? "bg-sky-600 hover:bg-sky-700" : ""}
          >
            Day
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-sky-600 hover:bg-sky-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-destructive">
            {error}
          </div>
        ) : (
          <div className="flex-1">
            {view === "month" && renderCalendarDays()}
            {view === "week" && renderWeekView()}
            {view === "day" && renderDayView()}
          </div>
        )}
      </div>

      {/* Task Details Dialog */}
      <Dialog open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedTask?.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsTaskDetailsOpen(false);
                    router.push(
                      `/workspace/${workspaceId}/projects/${selectedTask?.projectId}/${selectedTask?.id}`
                    );
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteTask
                  taskId={selectedTask?.id || ""}
                  projectId={selectedTask?.projectId || ""}
                  workspaceId={workspaceId}
                  onDelete={() => {
                    setIsTaskDetailsOpen(false);
                    fetchTasks();
                  }}
                />
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Status</h4>
              <div className="text-sm">{selectedTask?.status}</div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Priority</h4>
              <div className="text-sm capitalize">{selectedTask?.priority}</div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Due Date</h4>
              <div className="text-sm">
                {selectedTask?.dueDate
                  ? format(new Date(selectedTask.dueDate), "PPP p")
                  : "No due date"}
              </div>
            </div>
            {selectedTask?.assignedTo && (
              <div>
                <h4 className="text-sm font-medium mb-1">Assigned To</h4>
                <div className="text-sm">{selectedTask.assignedTo.name}</div>
              </div>
            )}
            {selectedTask?.description && (
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <div className="text-sm whitespace-pre-wrap">
                  {selectedTask.description}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedProject && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="overflow-y-scroll max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <CreateTaskDialog
              project={selectedProject}
              onClose={() => {
                setIsCreateDialogOpen(false);
                fetchTasks();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
