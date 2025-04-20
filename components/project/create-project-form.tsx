"use client";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { projectSchema } from "@/lib/schema";
import { WorkspaceMembersProps } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { createNewProject } from "@/app/actions/project";
import { useRouter } from "next/navigation";

interface Props {
  workspaceMembers: WorkspaceMembersProps[];
}

export type ProjectDataTye = z.infer<typeof projectSchema>;

export const CreateProjectForm = ({ workspaceMembers }: Props) => {
  const workspaceId = useWorkspaceId();
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<ProjectDataTye>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      workspaceId: workspaceId ?? "",
      description: "",
      memberAccess: [],
    },
  });

  const handleSubmit = async (data: ProjectDataTye) => {
    if (!workspaceId) {
      toast.error("Workspace ID is missing");
      return;
    }

    try {
      setPending(true);
      
      // Validate all memberAccess IDs exist in workspaceMembers
      const invalidMemberIds = data.memberAccess.filter(
        memberId => !workspaceMembers.some(m => m.userId === memberId)
      );
      
      if (invalidMemberIds.length > 0) {
        throw new Error(`Invalid member IDs: ${invalidMemberIds.join(', ')}`);
      }

      await createNewProject({
        ...data,
        workspaceId,
        memberAccess: data.memberAccess.filter(memberId => 
          workspaceMembers.some(m => m.userId === memberId)
        ),
      });
      
      form.reset({
        name: "",
        workspaceId,
        description: "",
        memberAccess: [],
      });
      toast.success("Project created successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="size-5">
          <Plus className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Card className="w-full max-w-14xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Project description"
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormField
                  control={form.control}
                  name="memberAccess"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Access</FormLabel>
                      <FormDescription className="text-xs text-muted-foreground mb-4">
                        Select which workspace members should have access to this
                        project
                      </FormDescription>

                      <div className="space-y-3">
                        {workspaceMembers?.map((member) => (
                          <div
                            key={member.userId}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={member.userId}
                              checked={field.value?.includes(member.userId)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, member.userId]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (id) => id !== member.userId
                                    )
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={member.userId}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                            >
                              {member.user.name} (
                              {member.accessLevel.toLowerCase()})
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-row items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </DialogContent>
    </Dialog>
  );
};