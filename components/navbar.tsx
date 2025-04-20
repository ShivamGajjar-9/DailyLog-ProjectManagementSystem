"use client";

import { usePathname } from "next/navigation";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "@/components/user-menu";

interface NavbarProps {
  id?: string;
  name: string;
  email: string;
  image?: string;
}

const getPageTitle = (pathname: string) => {
  // Split the path into segments
  const segments = pathname.split("/").filter(Boolean);

  // If we're in a workspace route
  if (segments[0] === "workspace") {
    // Get the last non-ID segment
    const lastSegment = segments.slice(2).pop() || "";

    // Map of paths to their display titles
    const titles: { [key: string]: string } = {
      "": "Home",
      dashboard: "Dashboard",
      tasks: "My Tasks",
      members: "Team Members",
      settings: "Settings",
      calendar: "Calendar",
      chat: "Chat",
    };

    return titles[lastSegment] || titles[""] || "Home";
  }

  // For non-workspace routes
  const path = segments.pop() || "";
  return path.charAt(0).toUpperCase() + path.slice(1);
};

const getPageDescription = (pathname: string) => {
  // Split the path into segments
  const segments = pathname.split("/").filter(Boolean);

  // If we're in a workspace route
  if (segments[0] === "workspace") {
    // Get the last non-ID segment
    const lastSegment = segments.slice(2).pop() || "";

    // Map of paths to their descriptions
    const descriptions: { [key: string]: string } = {
      "": "Manage all your tasks in one place.",
      dashboard: "Overview of your workspace activity.",
      tasks: "View and manage your assigned tasks.",
      members: "Manage your team members.",
      settings: "Configure your workspace settings.",
      calendar: "View your schedule and deadlines.",
      chat: "Communicate with your team.",
    };

    return (
      descriptions[lastSegment] ||
      descriptions[""] ||
      "Manage your workspace efficiently."
    );
  }

  // For non-workspace routes
  return "Manage your workspace efficiently.";
};

export const Navbar = ({ id, name, email, image }: NavbarProps) => {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const pageDescription = getPageDescription(pathname);
  const { logout } = useKindeBrowserClient();

  return (
    <nav className="w-full border-b bg-background">
      <div className="flex h-16 items-center px-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground">{pageDescription}</p>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};
