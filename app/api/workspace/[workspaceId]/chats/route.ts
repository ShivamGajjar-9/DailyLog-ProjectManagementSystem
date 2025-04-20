import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized", details: "No user found in session" },
        { status: 401 }
      );
    }

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
      return NextResponse.json(
        { error: "Forbidden", details: "User is not a member of this workspace" },
        { status: 403 }
      );
    }

    // Fetch chats for the workspace
    const chats = await prisma.chatMessage.findMany({
      where: {
        channel: {
          workspaceId: params.workspaceId,
        },
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
        channel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("[CHATS_GET] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized", details: "No user found in session" },
        { status: 401 }
      );
    }

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
      return NextResponse.json(
        { error: "Forbidden", details: "User is not a member of this workspace" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { message, channelId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Bad Request", details: "Message is required" },
        { status: 400 }
      );
    }

    if (!channelId || typeof channelId !== 'string') {
      return NextResponse.json(
        { error: "Bad Request", details: "Channel ID is required" },
        { status: 400 }
      );
    }

    // Verify channel belongs to workspace
    const channel = await prisma.chatChannel.findFirst({
      where: {
        id: channelId,
        workspaceId: params.workspaceId,
      },
    });

    if (!channel) {
      return NextResponse.json(
        { error: "Not Found", details: "Channel not found" },
        { status: 404 }
      );
    }

    // Create new chat message
    const chat = await prisma.chatMessage.create({
      data: {
        content: message,
        channelId,
        userId: user.id,
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
        channel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error("[CHATS_POST] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 