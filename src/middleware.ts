// import { auth } from "@/app/auth"
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { nanoid } from "nanoid";

export function middleware(request: NextRequest) {
  const publicGuideContent = [
    "/guide/fitness-overview",
    "/guide/health-overview",
    "/guide/lifestyle-overview",
    "/guide/nutrition-overview",
  ];
  const protectedContent = [
    "/admin/",
    "/guide/",
    "/sales/",
    "/tools/",
    "/user/",
  ];

  const requestId = request.headers.get("x-request-id") || nanoid();

  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);

  if (publicGuideContent.includes(request.nextUrl.pathname)) {
    return response;
  }
  if (publicGuideContent.includes(request.nextUrl.pathname)) {
    let sessionTokenName = "";
    if (process.env.RUNTIME_ENV == "dev") {
      sessionTokenName = "authjs.session-token";
    } else {
      sessionTokenName = "__Secure-authjs.session-token";
    }

    if (request.cookies.has(`${sessionTokenName}`)) {
      return NextResponse.next();
    } else {
      const redirect = NextResponse.redirect(
        new URL(
          `/access-redirect?redirect=${request.nextUrl.pathname}`,
          request.url
        )
      );
      redirect.headers.set("x-request-id", requestId);
      return redirect;
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
