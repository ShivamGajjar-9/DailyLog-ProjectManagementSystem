"use client";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Hash, Plus, Users } from "lucide-react";

const channels = [
  { id: 1, name: "general" },
  { id: 2, name: "project-updates" },
  { id: 3, name: "random" },
];

const directMessages = [
  { id: 1, name: "John Doe", online: true },
  { id: 2, name: "Jane Smith", online: false },
  { id: 3, name: "Mike Johnson", online: true },
];

export function ChatSidebar() {
  return (
    <div className="h-full flex flex-col bg-muted/10">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-8" />
        </div>
      </div>

      <div className="px-3">
        <div className="flex items-center justify-between py-2">
          <h3 className="text-sm font-semibold">Channels</h3>
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-[2px]">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant="ghost"
              className="w-full justify-start px-2 hover:bg-muted"
            >
              <Hash className="mr-2 h-4 w-4" />
              {channel.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-3 mt-4">
        <div className="flex items-center justify-between py-2">
          <h3 className="text-sm font-semibold">Direct Messages</h3>
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-[2px]">
          {directMessages.map((dm) => (
            <Button
              key={dm.id}
              variant="ghost"
              className="w-full justify-start px-2 hover:bg-muted"
            >
              <div className="flex items-center">
                <div className="relative">
                  <Users className="mr-2 h-4 w-4" />
                  {dm.online && (
                    <div className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full bg-green-500" />
                  )}
                </div>
                {dm.name}
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
} 