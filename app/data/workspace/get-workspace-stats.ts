import { db } from "@/lib/db";
import { TaskPriority, TaskStatus } from "@prisma/client";

export async function getWorkspaceStats(workspaceId: string) {
  const tasks = await db.task.findMany({
    where: {
      project: {
        workspaceId: workspaceId,
      },
    },
  });

  const stats = {
    totalTasks: tasks.length,
    todoCount: tasks.filter((task) => task.status === TaskStatus.TODO).length,
    inProgressCount: tasks.filter(
      (task) => task.status === TaskStatus.IN_PROGRESS
    ).length,
    completedCount: tasks.filter(
      (task) => task.status === TaskStatus.COMPLETED
    ).length,
    blockedCount: tasks.filter((task) => task.status === TaskStatus.BLOCKED)
      .length,
    lowPriorityCount: tasks.filter((task) => task.priority === TaskPriority.LOW)
      .length,
    mediumPriorityCount: tasks.filter(
      (task) => task.priority === TaskPriority.MEDIUM
    ).length,
    highPriorityCount: tasks.filter(
      (task) => task.priority === TaskPriority.HIGH
    ).length,
    criticalPriorityCount: tasks.filter(
      (task) => task.priority === TaskPriority.CRITICAL
    ).length,
  };

  return stats;
} 