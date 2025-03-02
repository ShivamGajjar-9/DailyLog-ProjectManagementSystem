import { db } from "@/lib/db";
import { userRequired } from "../user/is-user-authenticated";

export const getWorkspaceMembers = async (workspaceId: string) => {
  try {
    const { user } = await userRequired();

    const isUserMember = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!isUserMember) {
      throw new Error("Unauthorized access");
    }

    const [workspaceMembers, workspaceProjects] = await Promise.all([
      db.workspaceMember.findMany({
        where: { workspaceId },
        include: {
          user: { select: { id: true, email: true, name: true, image: true } },
          projectAccess: {
            select: { id: true, hasAccess: true, projectId: true },
          },
        },
      }),
      db.project.findMany({
        where: { workspaceId },
        select: { id: true, name: true },
      }),
    ]);

    return { workspaceMembers, workspaceProjects };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: true,
      message: "Failed to get workspace members",
      status: 500,
    };
  }
};
