import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    console.log("[MEMBERS_GET] User:", user?.id); // Debug log
    
    if (!user || !user.id) {
      console.log("[MEMBERS_GET] No user found in session");
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized", details: "No user found in session" }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // First verify if the user is a member of the workspace
    const isUserMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: params.workspaceId,
        },
      },
    });

    console.log("[MEMBERS_GET] Is user member:", !!isUserMember); // Debug log

    if (!isUserMember) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Forbidden", 
          details: "User is not a member of this workspace" 
        }), 
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId: params.workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    console.log("[MEMBERS_GET] Found members:", members.length); // Debug log

    return NextResponse.json(members);
  } catch (error) {
    console.error("[MEMBERS_GET] Error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 