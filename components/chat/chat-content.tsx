"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

interface ChatContentProps {
  workspaceId: string;
  initialMessages: ChatMessage[];
}

export default function ChatContent({
  workspaceId,
  initialMessages,
}: ChatContentProps) {
  const [message, setMessage] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["workspace-messages", workspaceId, selectedChannel],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/workspace/${workspaceId}/chats${
          selectedChannel ? `?channelId=${selectedChannel}` : ""
        }`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      return res.json();
    },
    initialData: initialMessages,
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChannel) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/workspace/${workspaceId}/chats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message.trim(),
            channelId: selectedChannel,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.details || "Failed to send message");
      }

      setMessage("");
      // Invalidate and refetch messages after sending
      queryClient.invalidateQueries({
        queryKey: ["workspace-messages", workspaceId, selectedChannel],
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat sidebar */}
      <div className="w-64 border-r p-4">
        <h2 className="font-semibold mb-4">Channels</h2>
        {/* Channel list will go here */}
      </div>

      {/* Chat main area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Chat</h1>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message: ChatMessage) => (
            <div key={message.id} className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {message.user.name[0]}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{message.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{message.content}</p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}
        </div>

        {/* Chat input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-md border p-2"
            />
            <button
              type="submit"
              disabled={!message.trim() || !selectedChannel}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
