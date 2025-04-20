import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // Validate workspaceId
    if (!params.workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if workspace exists and user has access
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

    // Fetch tasks with proper error handling
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          workspaceId: params.workspaceId,
        },
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    // Transform the response to ensure consistent data structure
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      startDate: task.startDate ? task.startDate.toISOString() : null,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      position: task.position,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      assignedTo: task.assignedTo,
      project: task.project,
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error("[TASKS_GET] Error details:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
} 