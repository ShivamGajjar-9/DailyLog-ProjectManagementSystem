"use server";

import { prisma } from "@/lib/prisma";

export async function createDefaultChannel(workspaceId: string) {
  try {
    const existingChannel = await prisma.chatChannel.findFirst({
      where: {
        workspaceId,
        name: "general",
      },
    });

    if (existingChannel) {
      return existingChannel;
    }

    const channel = await prisma.chatChannel.create({
      data: {
        name: "general",
        workspaceId,
      },
    });

    return channel;
  } catch (error) {
    console.error("[CREATE_DEFAULT_CHANNEL]", error);
    throw new Error("Failed to create default channel");
  }
}

export async function getChannelMessages(channelId: string) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        channelId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return messages;
  } catch (error) {
    console.error("[GET_CHANNEL_MESSAGES]", error);
    throw new Error("Failed to fetch messages");
  }
}

export async function sendMessage(channelId: string, userId: string, content: string, attachments?: any) {
  try {
    const message = await prisma.chatMessage.create({
      data: {
        content,
        channelId,
        userId,
        attachments,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return message;
  } catch (error) {
    console.error("[SEND_MESSAGE]", error);
    throw new Error("Failed to send message");
  }
} 