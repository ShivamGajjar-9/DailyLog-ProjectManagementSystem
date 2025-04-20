import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { subDays, startOfDay, endOfDay } from "date-fns";

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

    // Get data for the last 30 days
    const startDate = startOfDay(subDays(new Date(), 30));
    const endDate = endOfDay(new Date());

    // Get tasks created and completed by date
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          workspaceId: params.workspaceId,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Process the data into daily counts
    const dailyStats = new Map();
    
    // Initialize all dates
    for (let d = 0; d < 30; d++) {
      const date = startOfDay(subDays(new Date(), d)).toISOString();
      dailyStats.set(date, { date, created: 0, completed: 0 });
    }

    // Count tasks
    tasks.forEach((task) => {
      const dateKey = startOfDay(task.createdAt).toISOString();
      const stats = dailyStats.get(dateKey) || { date: dateKey, created: 0, completed: 0 };
      
      stats.created++;
      if (task.status === "COMPLETED") {
        stats.completed++;
      }
      
      dailyStats.set(dateKey, stats);
    });

    // Convert to array and sort by date
    const trends = Array.from(dailyStats.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json(trends);
  } catch (error) {
    console.error("[TASK_TRENDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 