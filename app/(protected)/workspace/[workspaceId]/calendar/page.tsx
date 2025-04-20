import { Suspense } from "react";
import CalendarContent from "@/components/calendar/calendar-content";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CalendarPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  // Verify authentication first
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    redirect("/api/auth/login");
  }

  // Ensure workspaceId is available
  if (!params?.workspaceId) {
    throw new Error("Workspace ID is required");
  }

  try {
    // Verify user is a member of the workspace
    const isUserMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: params.workspaceId,
        },
      },
    });

    if (!isUserMember) {
      throw new Error("You are not a member of this workspace");
    }

    // Fetch data in parallel
    const [tasks, members] = await Promise.all([
      prisma.task.findMany({
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
        orderBy: {
          dueDate: "asc",
        },
      }),
      prisma.workspaceMember.findMany({
        where: {
          workspaceId: params.workspaceId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
    ]);

    // Transform members data to match the expected format
    const transformedMembers = members.map((member) => ({
      id: member.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
      accessLevel: member.accessLevel,
    }));

    return (
      <div className="h-[calc(100vh-4rem)]">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        >
          <CalendarContent
            workspaceId={params.workspaceId}
            initialTasks={tasks}
            initialMembers={transformedMembers}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error in CalendarPage:", error);
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-red-500">
          Error loading calendar. Please try again later.
        </div>
      </div>
    );
  }
}
