import { getTaskById } from "@/app/data/task/get-task-by-id";
import { userRequired } from "@/app/data/user/is-user-authenticated";
import { TaskComment } from "@/components/task/task-comment";
import { TaskDetails } from "@/components/task/task-details";
import { notFound } from "next/navigation";
import React from "react";

interface PageProps {
  params: {
    taskId: string;
    workspaceId: string;
    projectId: string;
  };
}

export default async function TaskIdPage({ params }: PageProps) {
  await userRequired();

  const { taskId, workspaceId, projectId } = params;
  const { task, comments } = await getTaskById(taskId, workspaceId, projectId);

  if (!task) {
    notFound();
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:px-6 pb-6">
      <div className="flex-1">
        <TaskDetails task={task as any} />
      </div>

      <div className="w-full lg:w-[400px]">
        <TaskComment taskId={taskId} comments={comments as any} />
      </div>
    </div>
  );
}
