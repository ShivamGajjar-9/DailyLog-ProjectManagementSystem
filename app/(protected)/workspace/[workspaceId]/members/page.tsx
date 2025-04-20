import { getWorkspaceMembers } from "@/app/data/workspace/get-workspace-members";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { Member } from "./columns";

export default async function MembersPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const response = await getWorkspaceMembers(params.workspaceId);

  if ("error" in response) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-red-500">
          Error loading members. Please try again later.
        </div>
      </div>
    );
  }

  // Transform the data to match the Member type
  const members: Member[] = response.workspaceMembers.map((member) => ({
    id: member.id,
    name: member.user.name,
    email: member.user.email,
    image: member.user.image,
    role: member.user.role || "Member", // Default to 'Member' if role is not set
    accessLevel: member.accessLevel,
  }));

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <p className="text-muted-foreground">
          Manage members and their access levels in this workspace
        </p>
      </div>

      <DataTable
        columns={columns}
        data={members}
        filterColumn="name"
        filterPlaceholder="Filter members..."
      />
    </div>
  );
}
