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
      },
    });

    const stats = {
      totalTasks: tasks.length,
      todoCount: tasks.filter(t => t.status === "TODO").length,
      inProgressCount: tasks.filter(t => t.status === "IN_PROGRESS").length,
      completedCount: tasks.filter(t => t.status === "COMPLETED").length,
      blockedCount: tasks.filter(t => t.status === "BLOCKED").length,
      inReviewCount: tasks.filter(t => t.status === "IN_REVIEW").length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[WORKSPACE_STATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 