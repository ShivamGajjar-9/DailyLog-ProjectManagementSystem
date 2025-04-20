"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    image: string;
  };
  attachments?: {
    type: string;
    name: string;
    url: string;
  }[];
}

export interface ChatMessagesRef {
  fetchMessages: () => Promise<void>;
}

export const ChatMessages = forwardRef<ChatMessagesRef>((_, ref) => {
  const params = useParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/workspace/${params.workspaceId}/chat/messages?channelId=general`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data.messages);
      setChannelId(data.channelId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchMessages,
  }));

  useEffect(() => {
    fetchMessages();
    // Set up polling every 5 seconds
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [params.workspaceId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={message.user.image} />
                <AvatarFallback>{message.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{message.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 text-sm">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1 text-sm"
                      >
                        {attachment.type === "task" && (
                          <FileText className="h-4 w-4" />
                        )}
                        {attachment.type === "image" && (
                          <ImageIcon className="h-4 w-4" />
                        )}
                        <span>{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
});
