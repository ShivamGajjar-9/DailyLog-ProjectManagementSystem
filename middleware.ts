import { NextResponse } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export async function middleware(request: Request) {
  const { isAuthenticated } = getKindeServerSession()

  // Check if we're in development and have a test user
  if (process.env.NODE_ENV === "development") {
    const testUser = request.headers.get("x-test-user")
    if (testUser) {
      return NextResponse.next()
    }
  }

  // Check if the user is authenticated
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
} 