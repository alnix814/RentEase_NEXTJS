import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"
import { getServerSession } from "next-auth";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {

    const token = await getToken({ req, secret });

    if (!token) {
        return NextResponse.redirect(new URL('/not-access', req.url));
    }

    try {

        if (token.role != 'admin') {
            return NextResponse.redirect(new URL('/not-access', req.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.log(`catch: ${error}`);
        return NextResponse.redirect(new URL('/not-access', req.url));
    }

}

export const config = {
    matcher: ["/admin/:path*"], 
  };