import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { workspaceId: string; taskId: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify workspace access
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: params.workspaceId,
        members: {
          some: {
            userId: user.id
          }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found or access denied" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { dueDate } = body;

    if (!dueDate) {
      return NextResponse.json(
        { error: "Due date is required" },
        { status: 400 }
      );
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: {
        id: params.taskId,
        project: {
          workspaceId: params.workspaceId
        }
      },
      data: {
        dueDate: new Date(dueDate)
      }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("[TASK_PATCH] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
} 