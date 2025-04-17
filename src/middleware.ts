import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
    const url = req.nextUrl;

    const token = await getToken({ req, secret });

    if (!token) {
        return "Unathorized";
    }

    if (url.pathname.startsWith('/admin') && token.role != 'admin') {
        return NextResponse.redirect(new URL('/not-access', req.url));
    }

    const response = NextResponse.next();
    response.headers.set('X-Custom-Header', 'Middleware Active');

    return response;
}

export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*"],
};