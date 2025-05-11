import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path is a public path
  const isPublicPath = path === "/login" || path === "/register"

  // Get the authentication status from cookies
  const isAuthenticated = request.cookies.get("isAuthenticated")?.value === "true"

  // If the user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicPath) {
    // Create the URL for the login page with a redirect message
    const url = new URL("/login", request.url)
    url.searchParams.set("message", "Inicia sesión para continuar")

    // Redirect to the login page
    return NextResponse.redirect(url)
  }

  // If the user is authenticated and trying to access a public path
  if (isAuthenticated && isPublicPath) {
    // Redirect to the bonds page
    return NextResponse.redirect(new URL("/bonds", request.url))
  }

  // Continue with the request
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/", "/login", "/register", "/bonds/:path*", "/profile", "/settings"],
}
