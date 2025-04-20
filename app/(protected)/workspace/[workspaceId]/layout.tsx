import { getUserWorkspaces } from "@/app/data/workspace/get-user-workspaces";
import { Navbar } from "@/components/navbar";
import { AppSidebarContainer } from "@/components/sidebar/app-sidebar-container";
import { SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import React from "react";

interface Props {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}
const WorkspaceIdLayout = async ({ children, params }: Props) => {
  const { data } = await getUserWorkspaces();
  const { workspaceId } = await params;

  if (data?.onboardingCompleted && !data?.workspaces) {
    redirect("/create-workspace");
  } else if (!data?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider>
      <div className="w-full flex bg-background h-screen">
        <AppSidebarContainer data={data as any} workspaceId={workspaceId} />

        <main className="w-full overflow-y-auto min-h-screen">
          <Navbar
            id={data?.id}
            name={data?.name as string}
            email={data?.email as string}
            image={data?.image as string}
          />

          <div className="p-4">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default WorkspaceIdLayout;
