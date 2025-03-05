import { NextResponse } from "next/server";
import dayjs from "dayjs";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import { env } from "process";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email обязателен" },
        { status: 400 },
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = dayjs().add(10, "minute").toDate();

    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.yandex.ru",
      port: 465,
      secure: true,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Ваш код подтверждения",
      text: `Ваш код подтверждения: ${code}, дествителен в течение 10 минут.`,
    });

    return NextResponse.json(
      { message: "Код отправлен на почту" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Ошибка при отправке кода" },
      { status: 500 },
    );
  }
}
