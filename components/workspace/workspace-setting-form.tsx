"use client";

import { workspaceSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, Workspace } from "@prisma/client";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { CreateWorkspaceDataType } from "./create-workspace-form";
import { toast } from "sonner";
import {
  deleteWorkspace,
  resetWorkspaceInviteCode,
  updateWorkspace,
} from "@/app/actions/workspace";
import { Link, UserPlus } from "lucide-react";
import { useConfirmation } from "@/hooks/use-delete";
import { ConfirmationDialog } from "../confirmation-dialog";

interface DataProps extends Workspace {
  members: {
    userId: string;
    accessLevel: $Enums.AccessLevel;
  }[];
}

export const WorkspaceSettingsForm = ({ data }: { data: DataProps }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const { isOpen, confirm, handleConfirm, handleCancel, confirmationOptions } =
    useConfirmation();
  const [inviteEmail, setInviteEmail] = React.useState("");

  const form = useForm<CreateWorkspaceDataType>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: data.name,
      description: data.description || "",
    },
  });

  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/workspace-invite/${data.id}/join/${data.inviteCode}`;

  const handleOnSubmit = async (values: CreateWorkspaceDataType) => {
    try {
      setIsPending(true);
      await updateWorkspace(data.id, values);

      toast.success("Your workspace has been updated.");

      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
        toast.error(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleInvitation = () => {
    setIsLoading(true);
    // Send invite email
    // setIsLoading(false);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link has been copied to clipboard.");
  };

  const handleResetInvite = async () => {
    try {
      setIsPending(true);
      await resetWorkspaceInviteCode(data.id);

      router.refresh();
      toast.success("Invite code reset successfully.");
    } catch (error) {
      if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
        toast.error(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = () => {
    confirm({
      title: "Delete Workspace",
      message:
        "Are you sure you want to delete this workspace? This action cannot be undone.",

      onConfirm: async () => {
        try {
          setIsPending(true);

          await deleteWorkspace(data.id);
          toast.success("Workspace deleted successfully.");
        } catch (error) {
          console.log(error);
          if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
            toast.error(
              error instanceof Error
                ? error.message
                : "Something went wrong. Please try again."
            );
          }
        } finally {
          setIsPending(false);
        }
      },
    });
  };
  return (
    <div className="p-3 md:p-6 max-w-4xl w-full mx-auto space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Workspace Settings</CardTitle>
          <CardDescription>
            Manage your workspace setting from here
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter workspace name" {...field} />
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
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Workspace description"
                        className="resize-none"
                      ></Textarea>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex flex-row items-center gap-4 justify-end">
                <Button type="submit" disabled={isPending} className="">
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Invite Members</CardTitle>
          <CardDescription>
            Invite people to join your workspace
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Button
              type="button"
              onClick={() => handleInvitation()}
              disabled={isPending}
              className=""
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite
            </Button>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Enter email address"
              value={inviteLink}
              readOnly
            />

            <div className="flex  items-center justify-end mt-4 gap-2">
              <Button
                type="button"
                variant={"outline"}
                onClick={() => copyInviteLink()}
              >
                <Link className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                type="button"
                variant={"destructive"}
                onClick={() => handleResetInvite()}
                disabled={isPending}
                className=""
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Delete your entire workspace</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            className="t"
            onClick={handleDelete}
          >
            Delete Workspace
          </Button>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={isOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title={confirmationOptions?.title || ""}
        message={confirmationOptions?.message || ""}
      />
    </div>
  );
};
