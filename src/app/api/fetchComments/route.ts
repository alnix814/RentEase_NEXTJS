import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
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
        const { userId, propertyId, content, createdAt, rate } = await req.json();

        const comment = await prisma.comments.create({
            data: {
                userId: userId,
                propertyId: propertyId,
                content: content,
                createdAt: createdAt,
            }

        });

        const rateProp = await prisma.property.findFirst({
            where: {
                id: propertyId,
            },
        });

        let finalrate;

        if (rateProp?.rate != 0) {
            finalrate = (rateProp?.rate + rate) / 1.2;
        } else {
            finalrate = rate;
        }

        const property = await prisma.property.update({
            where: {
                id: propertyId,
            },
            data: {
                rate:  finalrate,
            }
        });

        return NextResponse.json(comment);
    } catch {
        return NextResponse.json({error: 'Вы уже оставили комментарий'});
    }


}