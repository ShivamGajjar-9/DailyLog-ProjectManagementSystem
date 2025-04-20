"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Paperclip, Send, Image as ImageIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface ChatInputProps {
  onMessageSent?: () => void;
}

export function ChatInput({ onMessageSent }: ChatInputProps) {
  const params = useParams();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit clicked", { message, isSending });

    if (!message.trim()) {
      console.log("Message is empty");
      return;
    }

    if (isSending) {
      console.log("Already sending");
      return;
    }

    try {
      console.log("Starting to send message");
      setIsSending(true);

      const response = await fetch(
        `/api/workspace/${params.workspaceId}/chat/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: message,
            channelId: "general",
          }),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setMessage("");
      onMessageSent?.();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 flex flex-col gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-[60px] resize-none"
        />
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload image</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Button
        type="submit"
        variant="default"
        size="icon"
        disabled={!message.trim()}
        className="h-10 w-10 bg-primary hover:bg-primary/90 disabled:opacity-50"
        onClick={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
