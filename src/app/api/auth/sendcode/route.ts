import { NextResponse } from "next/server";
import dayjs from "dayjs";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import { env } from "process";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({message: 'Email обязателен'}, {status: 400});
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = dayjs().add(10, 'minute').toDate();

        await prisma.verificationCode.create({
            data: {
                email,
                code, 
                expiresAt
            }
        })

        const transporter = nodemailer.createTransport({
            host: 'smtp.yandex.ru',
            port: 465,
            secure: true,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASSWORD
            }
        })

        

    } catch {

    }
}