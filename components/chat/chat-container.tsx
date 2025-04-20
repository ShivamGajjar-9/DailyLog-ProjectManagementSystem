"use client";

import { useRef, useState } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";

export function ChatContainer() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesRef = useRef<{ fetchMessages?: () => void }>({});

  const handleMessageSent = () => {
    // Call fetchMessages from the ChatMessages component
    messagesRef.current.fetchMessages?.();
  };

  return (
    <div className="flex h-full">
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden border-r`}
      >
        <ChatSidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold">Team Chat</h2>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatMessages ref={messagesRef} />
        </div>

        <div className="p-4 border-t">
          <ChatInput onMessageSent={handleMessageSent} />
        </div>
      </div>
    </div>
  );
}
