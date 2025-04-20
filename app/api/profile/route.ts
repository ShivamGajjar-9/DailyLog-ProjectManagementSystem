import { prisma } from "@/lib/prisma"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    return NextResponse.json(dbUser)
  } catch (error) {
    console.error("[PROFILE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, about, country, industryType } = body

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        about,
        country,
        industryType,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[PROFILE_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 