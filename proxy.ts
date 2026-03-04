import { auth } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    // Unauthenticated → redirect to login
    if (!session) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
    }

    // Authenticated but not an admin → redirect to error page
    if (!session.user.isAdmin) {
        const errorUrl = request.nextUrl.clone();
        errorUrl.pathname = "/error";
        return NextResponse.redirect(errorUrl);
    }

    // Authorised admin — proceed, but disable all caching to prevent
    // back-button attacks after logout.
    const response = NextResponse.next();
    response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
}

export default proxy;

export const config = {
    matcher: ["/admin/:path*"],
};
