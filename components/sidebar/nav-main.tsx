"use client";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { CheckSquare, LayoutDashboard, Settings, Users, MessageSquareMore, CalendarDays } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NavMain = () => {
  const workspaceId = useWorkspaceId();
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const items = [
    {
      label: "Dashboard",
      href: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
      isActive: pathname === `/workspace/${workspaceId}`,
    },
    {
      label: "My Tasks",
      href: `/workspace/${workspaceId}/my-tasks`,
      icon: CheckSquare,
      isActive: pathname === `/workspace/${workspaceId}/my-tasks`,
    },
    {
      label: "Members",
      href: `/workspace/${workspaceId}/members`,
      icon: Users,
      isActive: pathname === `/workspace/${workspaceId}/members`,
    },
    {
      label: "Chat",
      href: `/workspace/${workspaceId}/chat`,
      icon: MessageSquareMore,
      isActive: pathname.startsWith(`/workspace/${workspaceId}/chat`),
    },
    {
      label: "Calendar",
      href: `/workspace/${workspaceId}/calendar`,
      icon: CalendarDays,
      isActive: pathname === `/workspace/${workspaceId}/calendar`,
    },
    {
      label: "Settings",
      href: `/workspace/${workspaceId}/settings`,
      icon: Settings,
      isActive: pathname === `/workspace/${workspaceId}/settings`,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={item.isActive}
              tooltip={item.label}
              className="px-2 py-1.5 sidebar-menu-button"
            >
              <Link href={item.href} onClick={() => setOpenMobile(false)}>
                <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
