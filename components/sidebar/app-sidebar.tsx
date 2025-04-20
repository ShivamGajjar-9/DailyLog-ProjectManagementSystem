import { User } from "@prisma/client";
import { AppSidebarDataProps } from "./app-sidebar-container";
import { ProjectProps, WorkspaceMembersProps } from "@/utils/types";
import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "../ui/sidebar";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { WorkspaceSelector } from "./workspace-selector";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-project-list";

export const AppSidebar = ({
  data,
  projects,
  workspaceMembers,
  user,
}: {
  data: AppSidebarDataProps;
  projects: ProjectProps[];
  workspaceMembers: WorkspaceMembersProps[];
  user: User;
}) => {
  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="bg-background">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={"/wrench.svg"} />
            </Avatar>
            <SidebarGroupLabel>
              <span className="text-xl font-bold">DailyLog</span>
            </SidebarGroupLabel>
          </div>

          <div className="flex justify-between mb-0 items-center">
            <SidebarGroupLabel className="mb-2 text-sm font-semibold text-muted-foreground uppercase">
              Workspace
            </SidebarGroupLabel>

            <Button
              asChild
              size={"icon"}
              className="size-5 group-data-[collapsible=icon]:hidden"
              variant="ghost"
            >
              <Link href="/create-workspace">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <WorkspaceSelector workspaces={data.workspaces} />
        </SidebarHeader>

        <SidebarContent className="sidebar-content">
          <NavMain />
          <NavProjects
            projects={projects}
            workspaceMembers={workspaceMembers}
          />
        </SidebarContent>
      </Sidebar>
    </>
  );
};
