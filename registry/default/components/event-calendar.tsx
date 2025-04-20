"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"

export type CalendarEvent = {
  id: string
  title: string
  description: string
  start: Date
  end: Date
  allDay?: boolean
  color?: string
  location?: string
}

export interface EventCalendarProps {
  events: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
}

export function EventCalendar({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
}: EventCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      const currentDate = new Date(date)
      
      return (
        currentDate >= eventStart &&
        currentDate <= eventEnd
      )
    })
  }

  const getEventColor = (color?: string) => {
    switch (color) {
      case "sky":
        return "bg-sky-500"
      case "amber":
        return "bg-amber-500"
      case "orange":
        return "bg-orange-500"
      case "emerald":
        return "bg-emerald-500"
      case "violet":
        return "bg-violet-500"
      case "rose":
        return "bg-rose-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleMonthChange = (month: Date) => {
    setSelectedDate(month)
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Calendar</h2>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium py-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: 42 }, (_, i) => {
          const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
          date.setDate(date.getDate() - date.getDay() + i)
          
          const dayEvents = getEventsForDate(date)
          const isToday = date.toDateString() === new Date().toDateString()
          const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
          const isSelected = date.toDateString() === selectedDate.toDateString()
          
          return (
            <div
              key={i}
              className={cn(
                "min-h-[100px] p-2 border rounded-lg",
                isCurrentMonth ? "bg-background" : "bg-muted/50",
                isToday && "ring-2 ring-primary",
                isSelected && "bg-primary/10"
              )}
              onClick={() => setSelectedDate(date)}
            >
              <div className="text-sm font-medium mb-1">{date.getDate()}</div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs p-1 rounded truncate text-white",
                      getEventColor(event.color)
                    )}
                    title={`${event.title}${event.location ? ` - ${event.location}` : ""}`}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 