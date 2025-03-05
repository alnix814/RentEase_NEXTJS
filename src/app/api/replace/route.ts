import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
    }

    const { username, email } = await req.json();

    if (!username || !email) {
      return NextResponse.json(
        { message: "Неполные данные, Ошибка сервера" },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        email: session.user?.email as string,
      },
      data: {
        name: username,
        email: email,
      },
    });
    if (updatedUser && session.user) {
      session.user.name = username;
      session.user.email = email;
      return NextResponse.json({ message: "Данные успешно обновлены" });
    } else {
      return NextResponse.json(
        { message: "Ошибка обновления пользователя" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
