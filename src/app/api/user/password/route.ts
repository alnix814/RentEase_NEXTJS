import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: Request) {
    const {newPassword, email} = await req.json();

    try {
        await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                aPassword: true,
                password: newPassword,
            },
        });

        return NextResponse.json({status: 200});
    } catch (error) {
        return NextResponse.json({error: error});
    }
}


export async function PUT(req: NextRequest) {
    const {currentPassword, newPassword, email} = await req.json();

    try {
        const data = await prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                password: true,
            }
        });

        if (data?.password === currentPassword) {
            await prisma.user.update({
                where: {
                    email: email,
                },
                data: {
                    password: newPassword,
                },
            });
        } else {
            return NextResponse.json({message: 'Вы ввели неверный пароль', status: 400})
        }

        return NextResponse.json({message: 'Пароль успешно изменен', status: 200});
    } catch {
        return NextResponse.json({message: 'Ошибка сервера'});
    }
}