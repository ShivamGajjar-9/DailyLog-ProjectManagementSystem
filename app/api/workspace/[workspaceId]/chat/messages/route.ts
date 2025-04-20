import { createDefaultChannel, getChannelMessages, sendMessage } from "@/app/actions/chat";
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

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return new NextResponse("Channel ID is required", { status: 400 });
    }

    // If channelId is "general", ensure it exists first
    if (channelId === "general") {
      const channel = await createDefaultChannel(params.workspaceId);
      const messages = await getChannelMessages(channel.id);
      return NextResponse.json({
        messages,
        channelId: channel.id
      });
    }

    const messages = await getChannelMessages(channelId);
    return NextResponse.json({
      messages,
      channelId
    });
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
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

    const { content, channelId, attachments } = await req.json();

    if (!channelId) {
      return new NextResponse("Channel ID is required", { status: 400 });
    }

    const message = await sendMessage(channelId, user.id, content, attachments);
    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 