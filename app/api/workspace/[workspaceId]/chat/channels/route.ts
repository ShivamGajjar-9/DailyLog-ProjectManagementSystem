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

    const channels = await prisma.chatChannel.findMany({
      where: {
        workspaceId: params.workspaceId,
      },
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error("[CHANNELS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description } = await req.json();

    const channel = await prisma.chatChannel.create({
      data: {
        name,
        description,
        workspaceId: params.workspaceId,
      },
    });

    return NextResponse.json(channel);
  } catch (error) {
    console.error("[CHANNEL_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 