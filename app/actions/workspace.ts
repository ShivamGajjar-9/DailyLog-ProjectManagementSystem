"use server";

import { CreateWorkspaceDataType } from "@/components/workspace/create-workspace-form";
import { userRequired } from "../data/user/is-user-authenticated";
import { workspaceSchema } from "@/lib/schema";
import { db } from "@/lib/db";
import { generateInviteCode } from "@/utils/get-invite-code";
import { redirect, RedirectType } from "next/navigation";
import { $Enums, AccessLevel } from "@prisma/client";
import { truncateSync } from "fs";

export const createNewWorkspace = async (data: CreateWorkspaceDataType) => {
  try {
    const { user } = await userRequired();

    const validatedData = workspaceSchema.parse(data);

    const res = await db.workspace.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        ownerId: user.id,
        inviteCode: generateInviteCode(),
        members: {
          create: {
            userId: user.id,
            accessLevel: "OWNER",
          },
        },
      },
    });

    // redirect(`/workspace/${res.id}`)
    return { data: res };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: "An error occurred while creating the workspace",
    };
  }
};

export const updateWorkspace = async (
  workspaceId: string,
  data: CreateWorkspaceDataType
) => {
  const { user } = await userRequired();

  const validatedData = workspaceSchema.parse(data);

  const isUserAMember = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspaceId,
      },
    },
  });

  if (!isUserAMember) {
    throw new Error("You are not a member of this workspace.");
  }

  await db.workspace.update({
    where: { id: workspaceId },
    data: {
      name: validatedData.name,
      description: validatedData.description || "",
    },
  });

  return { success: true };
};

export const resetWorkspaceInviteCode = async (workspaceId: string) => {
  const { user } = await userRequired();

  const isUserAMember = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspaceId,
      },
    },
  });

  if (!isUserAMember) {
    throw new Error("You are not a member of this workspace.");
  }

  await db.workspace.update({
    where: { id: workspaceId },
    data: {
      inviteCode: generateInviteCode(),
    },
  });
};
export const deleteWorkspace = async (workspaceId: string) => {
  const { user } = await userRequired();

  const isUserAMember = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspaceId,
      },
    },
  });

  if (!isUserAMember) {
    throw new Error("You are not a member of this workspace.");
  }

  if (isUserAMember && isUserAMember.accessLevel !== AccessLevel.OWNER) {
    throw new Error("Only the owner can delete a workspace.");
  }

  await db.workspace.delete({
    where: { id: workspaceId },
  });

  redirect("/workspace");
};

export const removeUserFromWorkspace = async (
  workspaceId: string,
  workspaceMemberId: string
) => {
  const { user } = await userRequired();

  const isUserAMember = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspaceId,
      },
    },
  });

  if (!isUserAMember) {
    throw new Error("You are not a member of this workspace.");
  }

  if (isUserAMember && isUserAMember.accessLevel !== $Enums.AccessLevel.OWNER) {
    throw new Error(
      "You do not have permission to remove users from this workspace."
    );
  }

  const isLastOwner = await db.workspaceMember.findFirst({
    where: {
      workspaceId: workspaceId,
      accessLevel: $Enums.AccessLevel.OWNER,
    },
  });

  if (isLastOwner && isLastOwner.id === workspaceMemberId) {
    throw new Error("You cannot remove the last owner from the workspace.");
  }

  await db.workspaceMember.delete({ where: { id: workspaceMemberId } });

  return { success: true, message: "User removed from workspace." };
};

export const updateUserAccessLevel = async (
  workspaceId: string,
  workspaceMemberId: string,
  accessLevel: $Enums.AccessLevel
) => {
  const { user } = await userRequired();

  const isUserAMember = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspaceId,
      },
    },
  });

  if (!isUserAMember) {
    throw new Error("You are not a member of this workspace.");
  }

  if (isUserAMember && isUserAMember.accessLevel !== $Enums.AccessLevel.OWNER) {
    throw new Error("You do not have permission to update this workspace.");
  }

  await db.workspaceMember.update({
    where: { id: workspaceMemberId },
    data: { accessLevel },
  });

  return { success: true };
};

export const updateProjectAccess = async (
  workspaceId: string,
  workspaceMemberId: string,
  projectIds: string[]
) => {
  const { user } = await userRequired();

  const isUserAMember = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspaceId,
      },
    },
  });

  if (!isUserAMember) {
    throw new Error("You are not a member of this workspace.");
  }

  if (isUserAMember && isUserAMember.accessLevel !== $Enums.AccessLevel.OWNER) {
    throw new Error("You do not have permission to update this workspace.");
  }

  const oldProjectAccess = await db.projectAccess.findMany({
    where: {
      workspaceMemberId: workspaceMemberId,
    },
  });

  const projectAccessToDelete = oldProjectAccess.filter(
    (access) => !projectIds.includes(access.projectId) || !access.hasAccess
  );

  if (projectAccessToDelete.length > 0) {
    await db.projectAccess.deleteMany({
      where: {
        id: {
          in: projectAccessToDelete.map((access) => access.id),
        },
      },
    });
  }

  const projectAccessToAdd = projectIds.filter(
    (projectId) =>
      !oldProjectAccess.some(
        (access) => access.projectId === projectId && access.hasAccess === true
      )
  );

  if (projectAccessToAdd.length > 0) {
    await db.projectAccess.createMany({
      data: projectAccessToAdd.map((projectId) => ({
        workspaceMemberId: workspaceMemberId,
        projectId: projectId,
        hasAccess: true,
      })),
    });
  }

  return { success: true };
};
