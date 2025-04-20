"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { WorkspacesProps } from "@/utils/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";

export const WorkspaceSelector = ({
  workspaces,
}: {
  workspaces: WorkspacesProps[];
}) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [selectedWorkspace, setSelectedWorkspace] = useState<
    WorkspacesProps | undefined
  >(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (workspaceId && workspaces) {
      setSelectedWorkspace(
        workspaces.find((workspace) => workspace.workspaceId === workspaceId)
      );
    }
  }, [workspaceId, workspaces]);

  const onWorkspaceSelect = (id: string) => {
    setSelectedWorkspace(
      workspaces.find((workspace) => workspace.workspaceId === id)
    );
    router.push(`/workspace/${id}`);
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <WorkspaceAvatar
                  name={(selectedWorkspace?.workspace?.name as string) || "W"}
                />

                <div className="font-semibold text-muted-foreground truncate max-w-[120px]">
                  {isClient ? selectedWorkspace?.workspace.name || "Select Workspace" : "Loading..."}
                </div>
                <ChevronsUpDown className="ml-auto flex-shrink-0" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="w-[--radix-dropdown-menu-trigger-width]"
            >
              {workspaces?.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onSelect={() => onWorkspaceSelect(workspace?.workspaceId!)}
                >
                  <div className="flex flex-row items-center gap-2">
                    <WorkspaceAvatar
                      name={workspace?.workspace.name as string}
                    />

                    <p className="truncate max-w-[150px]">{workspace?.workspace.name}</p>
                  </div>
                  {workspace.workspaceId === workspaceId && (
                    <Check className="ml-auto flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
};
