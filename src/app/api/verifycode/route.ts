import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { Create_User } from "@/lib/create_db_user";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { options } from "../auth/[...nextauth]/options";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { fullname, password, email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email и код обязательны" },
        { status: 400 },
      );
    }

    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
      },
    });

    if (!verificationCode) {
      return NextResponse.json({ message: "Неверный код" }, { status: 401 });
    }

    if (dayjs().isAfter(verificationCode.expiresAt)) {
      return NextResponse.json(
        { message: "Срок действия кода истек" },
        { status: 401 },
      );
    }

    await prisma.verificationCode.delete({
      where: {
        email_code: { email, code },
      },
    });

    let user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      const User = {
        email: email,
        password: password,
        name: fullname,
        avatar: "",
        type_autorize: "email",
      };

      await Create_User(User);
    }

    const session = await getSession();
    if (session) {
      session.user.id = user?.id as string;
      session.user.name = fullname;
      session.user.email = email;
      session.user.image = "";
    }

    return NextResponse.json(
      { message: "Успешная авторизация" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Ошибка при подтверждении кода" },
      { status: 500 },
    );
  }
}
