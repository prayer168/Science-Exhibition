import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;

  // 保護後台頁面與寫入型 API
  const isAdminPage = pathname.startsWith("/admin");
  const isWriteApi =
    (pathname.startsWith("/api/journals") || pathname.startsWith("/api/photos")) &&
    req.method !== "GET";

  if ((isAdminPage || isWriteApi) && !isLoggedIn) {
    if (isWriteApi) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/journals/:path*", "/api/photos/:path*"],
};
