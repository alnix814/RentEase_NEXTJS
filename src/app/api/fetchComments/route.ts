import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {

    const params = req.nextUrl.searchParams;
    const id = params.get('id') || undefined;

    const comments = await prisma.comments.findMany({
        where: {
            propertyId: id,
        },
        include: {
            user: true,
        }
    })

    return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {

    try {
        const { userId, propertyId, content, createdAt } = await req.json();

        const comment = await prisma.comments.create({
            data: {
                userId: userId,
                propertyId: propertyId,
                content: content,
                createdAt: createdAt,
            }
        });

        return NextResponse.json(comment);
    } catch (error) {
        return NextResponse.json({error: JSON.stringify(error)});
    }


}