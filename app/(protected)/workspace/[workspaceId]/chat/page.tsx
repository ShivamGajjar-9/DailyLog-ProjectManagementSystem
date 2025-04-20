import ChatContent from "@/components/chat/chat-content";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  channel: {
    id: string;
    name: string;
  };
}

export default async function ChatPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    redirect("/api/auth/login");
  }

  try {
    // Get the current request headers
    const headersList = headers();
    const authorization = headersList.get("authorization");
    const cookie = headersList.get("cookie");

    // Use absolute URL for server-side fetching
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const messagesResponse = await fetch(
      `${baseUrl}/api/workspace/${params.workspaceId}/chats`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(authorization ? { authorization } : {}),
          ...(cookie ? { cookie } : {}),
        },
        cache: "no-store",
      }
    );

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      throw new Error(errorData.error || "Failed to fetch messages");
    }

    const messages: ChatMessage[] = await messagesResponse.json();

    return (
      <div className="h-[calc(100vh-4rem)]">
        <ChatContent
          workspaceId={params.workspaceId}
          initialMessages={messages}
        />
      </div>
    );
  } catch (error) {
    console.error("Error in ChatPage:", error);
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error loading chat</h1>
          <p className="text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Please try again later or contact support if the problem persists."}
          </p>
        </div>
      </div>
    );
  }
}
