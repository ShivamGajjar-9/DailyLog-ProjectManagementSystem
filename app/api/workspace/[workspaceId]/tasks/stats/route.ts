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

    // Get counts for each task status
    const stats = await prisma.task.groupBy({
      by: ["status"],
      where: {
        project: {
          workspaceId: params.workspaceId,
        },
      },
      _count: true,
    });

    // Transform the data into the expected format
    const formattedStats = stats.map((stat) => ({
      status: stat.status,
      count: stat._count,
    }));

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error("[TASK_STATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 