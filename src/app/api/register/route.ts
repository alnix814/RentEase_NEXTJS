import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs"; // Добавляем bcrypt для хеширования пароля

export async function POST(req: NextRequest) {
  try {
    const { fullname, email, password } = await req.json();

    if (!fullname || !email || !password) {
      return NextResponse.json(
        { error: "Не указаны имя, email или пароль" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name: fullname,
        email,
        password: hashedPassword,
        type_autorize: "email",
      },
    });

    return NextResponse.json(
      { message: "Регистрация успешна" },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
