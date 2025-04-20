import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        project: {
          workspaceId: params.workspaceId,
        },
      },
      select: {
        status: true,
        priority: true,
      },
    });

    const stats = {
      // Task status counts
      todoCount: tasks.filter(t => t.status === "TODO").length,
      inProgressCount: tasks.filter(t => t.status === "IN_PROGRESS").length,
      completedCount: tasks.filter(t => t.status === "COMPLETED").length,
      blockedCount: tasks.filter(t => t.status === "BLOCKED").length,
      inReviewCount: tasks.filter(t => t.status === "IN_REVIEW").length,

      // Priority counts
      lowPriorityCount: tasks.filter(t => t.priority === "LOW").length,
      mediumPriorityCount: tasks.filter(t => t.priority === "MEDIUM").length,
      highPriorityCount: tasks.filter(t => t.priority === "HIGH").length,
      criticalPriorityCount: tasks.filter(t => t.priority === "CRITICAL").length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[WORKSPACE_PRODUCTIVITY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 