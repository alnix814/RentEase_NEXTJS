import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function POST(req: NextRequest) {
    const email = await req.json();

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email.email,
            }
        });

        return NextResponse.json({user});
    } catch (error) {
        return NextResponse.json({error: error});
    }

}