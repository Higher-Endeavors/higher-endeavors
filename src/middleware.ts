// import { auth } from "@/app/auth"
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const publicGuideContent = [
    "/guide/fitness-overview",
    "/guide/health-overview",
    "/guide/lifestyle-overview",
    "/guide/nutrition-overview",
  ];

  if (publicGuideContent.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  let sessionTokenName = "";
  if (process.env.LOCALHOST_DEV == "true") {
    sessionTokenName = "authjs.session-token"
  } else {
    sessionTokenName = "__Secure-authjs.session-token"
  }

  if (request.cookies.has(`${sessionTokenName}`)) {
    return NextResponse.next();
  } else {
    return NextResponse.redirect(
      new URL(
        `/access-redirect?redirect=${request.nextUrl.pathname}`,
        request.url
      )
    );
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/guide/:path*",
    "/sales/:path*",
    "/tools/:path*",
    "/user/:path*",
  ],
};
