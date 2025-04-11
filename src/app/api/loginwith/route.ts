import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const {email, password} = await req.json();
    
    const data = await prisma.user.findUnique({
        where: {
            email: email
        },
        select: {
            email: true, 
            password: true,
            aPassword: true,
        }
    });

    if (!data) {
        return NextResponse.json({message: 'Пользователь не найден', status: 404})
    }

    if (data?.aPassword === false) {
        return NextResponse.json({message: 'У вас не установлен пароль, пожалуйста, войдите через электронную почту и установите пароль в личном кабинете.'})
    }

    if (data?.email === email && data?.password === password) {
        return NextResponse.json({message: 'Успешный вход', status: 200})
    } else {
        return NextResponse.json({message: 'Неверный email или пароль', status: 400})
    }
}